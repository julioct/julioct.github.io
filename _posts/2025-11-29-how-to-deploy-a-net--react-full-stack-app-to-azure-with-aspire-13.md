---
layout: post
title: "How to Deploy a .NET + React Full Stack App to Azure with Aspire 13"
date: 2025-11-29
featured-image: 2025-11-29/4ghDFAZYvbFtvU3CTR72ZN-oZLr418NhddMPnKsWEmVhF.jpeg
issue-number: 110
---

*Read time: 13 minutes*
<p style="text-align: center; font-size: 1.2em;"><strong>The .NET Saturday is brought to you by:</strong></p>

<div style="background: linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%); padding: 36px; margin: 24px 0; overflow: hidden; border-radius: 14px; box-shadow: 0 2px 12px rgba(80,120,200,0.08);">
  <p style="text-align: center; max-width: 600px; margin: 0 auto 18px auto;">Build faster with <strong>ABP’s modular .NET platform</strong>. Get the framework’s modules, templates, and tools with the Black Friday discount until Dec 1.</p>

  <div style="display: flex; justify-content: center;">
    <a href="https://abp.io?utm_source=newsletter&utm_medium=affiliate&utm_campaign=juliocasal_bf25" target="_blank" style="background: linear-gradient(90deg, #4f8cff 0%, #235390 100%); color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1em; box-shadow: 0 2px 8px rgba(80,120,200,0.10); transition: background 0.2s; text-align: center;">Save 33% Today</a>
  </div>
</div>

Building a full-stack application is not the hard part anymore. Most devs can spin up a React frontend, a .NET API, and a PostgreSQL database without too much drama.

The painful part is deploying that stack reliably in the cloud, wiring up all the application components without drowning in connection strings, environment variables, and weird configuration errors.

That is exactly where Aspire shines. It gives you a single, understandable application model that can provision and connect your backend, frontend, database, and identity provider for both local dev and Azure.

Today, we will take a complete .NET + React + Postgres + Keycloak application, and deploy the whole thing to Azure using **Aspire 13**.

Let’s dive in.

​

### **The full-stack application**
Here's a quick picture of the full-stack application we will deploy to the cloud:


![](/assets/images/2025-11-29/4ghDFAZYvbFtvU3CTR72ZN-uWTDo1EaJprGg79VjxcUo8.jpeg)

In essence, we have a **React** application that is supported by a **.NET** backend, which in turn stores all the data in a **PostgreSQL** database.

We also use **Keycloak** as the identity provider, which allows users to log in to the app from the browser via OpenID Connect (OIDC) and is also used by the backend to validate JWTs sent by the frontend.

Now, let's prepare our application for deployment, starting with the database.

​

### **Adding the PostgreSQL database**
To make our lives easier, we'll define our full-stack application as an **Aspire** application. If you are new to Aspire, I have a beginner's guide [here]({{ site.url }}/blog/net-aspire-tutorial-build-production-ready-apps-from-day-1).

After adding the **AppHost** project and installing the **Azure PostgreSQL** hosting integration (Aspire.Hosting.Azure.PostgreSQL NuGet package), here's how we define our database:


```csharp
var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddAzurePostgresFlexibleServer("postgres")
                    .RunAsContainer(postgres =>
                    {
                        postgres.WithDataVolume();
                        postgres.WithPgAdmin(pgAdmin =>
                        {
                            pgAdmin.WithHostPort(5050);
                        });
                    });

var templateAppDb = postgres.AddDatabase("TemplateAppDB", "TemplateApp");

builder.Build().Run();
```

​

To unwrap that:

*   <span>We add a PostgreSQL resource that will deploy as an **Azure Postgres Flexible Server** resource</span>
*   <span>We enable running it as a container during local dev</span>
*   <span>We also add a PgAdmin container to make it easier to work with it locally</span>
*   <span>We add the TemplateApp database to be used by our .NET API</span>

Next, let's add our identity provider.

​

### **Adding Keycloak**
I covered how to deploy Keycloak to Azure over [here]({{ site.url }}/blog/deploying-keycloak-to-azure-with-net-aspire), so today I'll only do a quick recap.

Here's how you add Keycloak to your Aspire application model:


```csharp
var keycloakPassword = builder.AddParameter(
                                "KeycloakPassword",
                                secret: true,
                                value: "admin");
int? keycloakPort = builder.ExecutionContext.IsRunMode ? 8080 : null;
var keycloak = builder.AddKeycloak(
                        "keycloak",
                        adminPassword: keycloakPassword,
                        port: keycloakPort)
                      .WithLifetime(ContainerLifetime.Persistent);

if (builder.ExecutionContext.IsRunMode)
{
    keycloak.WithDataVolume()
            .WithRealmImport("./realms");
}

if (builder.ExecutionContext.IsPublishMode)
{
    var postgresUser = builder.AddParameter("PostgresUser", value: "postgres");
    var postgresPassword = builder.AddParameter("PostgresPassword", secret: true);
    postgres.WithPasswordAuthentication(postgresUser, postgresPassword);

    var keycloakDb = postgres.AddDatabase("keycloakDB", "keycloak");

    var keycloakDbUrl = ReferenceExpression.Create(
        $"jdbc:postgresql://{postgres.Resource.HostName}/{keycloakDb.Resource.DatabaseName}"
    );

    keycloak.WithEnvironment("KC_HTTP_ENABLED", "true")
            .WithEnvironment("KC_PROXY_HEADERS", "xforwarded")
            .WithEnvironment("KC_HOSTNAME_STRICT", "false")
            .WithEnvironment("KC_DB", "postgres")
            .WithEnvironment("KC_DB_URL", keycloakDbUrl)
            .WithEnvironment("KC_DB_USERNAME", postgresUser)
            .WithEnvironment("KC_DB_PASSWORD", postgresPassword)
            .WithEndpoint("http", e =>
            {
                e.IsExternal = true;
                e.UriScheme = "https";
            });
}
```

​

As you can see, to run it locally (IsRunMode), all we do is add a data volume (to persist changes) and import a realm from our realms folder (if available).

But to run it in the cloud, we have to do a few extra things to allow Keycloak to keep the realm data in our Azure PostgreSQL DB:

1.  <span>Prepare credentials that Keycloak can use to connect to the database</span>
2.  <span>Define a new DB for Keycloak</span>
3.  <span>Set the KC_HTTP_ENABLED, KC_PROXY_HEADERS, and KC_HOSTNAME_STRICT environment variables so Keycloak can run properly as an Azure Container App.</span>
4.  <span>Set all the environment variables needed for Keycloak to connect to the DB</span>
5.  <span>Make Keycloak's endpoint external, so we can access it from our browser to configure it.</span>

Again, I explained all that in detail in [my previous post]({{ site.url }}/blog/deploying-keycloak-to-azure-with-net-aspire).

Next, let's add our .NET backend.

​

### **Adding the .NET Backend**
This is the easiest part, since Aspire includes excellent support for all things .NET.

Here's the code:


```csharp
var keycloakAuthority = ReferenceExpression.Create(
    $"{keycloak.GetEndpoint("http").Property(EndpointProperty.Url)}/realms/templateapp"
);

var api = builder.AddProject<TemplateApp_Api>("api")
                .WithReference(templateAppDb)
                .WaitFor(templateAppDb)
                .WithEnvironment("Auth__Authority", keycloakAuthority)
                .WaitFor(keycloak)
                .WithExternalHttpEndpoints()
                .WithHttpHealthCheck("/health/ready");
```

​

The **WithReference** call shares the database connection info with our API (locally and in the cloud), and **WaitFor** is used to ensure the DB is ready before the API starts.

To get our API to talk to Keycloak (for JWT validation), we need to provide it with the **Authority**, which is the URL to the Keycloak server, including the realm configured for your application.

Using a **ReferenceExpression** lets Aspire resolve the final URL once Keycloak has been deployed to Azure and then hand it over to our API as an environment variable.

Also, the assumption here is that there will be a realm named **templateapp** there, which, for now, we'll have to create or import manually once the deployment is complete.

Next, the tricky part: the frontend.

​

### **Adding the React frontend**
I previously covered how to add a React app to Aspire ​[here]({{ site.url }}/blog/going-full-stack-with-dotnet-aspire), but support for frontend frameworks, particularly for JavaScript-based ones, received a nice refresh in **Aspire 13**.

Since we are using **Vite** to build and run our React app, we can add it to our application model by installing the new JavaScript hosting integration (Aspire.Hosting.JavaScript NuGet package) and adding this code:


```csharp
var frontend = builder.AddViteApp("frontend", "../TemplateApp.React")
                    .WithReference(api)
                    .WaitFor(api)
                    .WithEndpoint(endpointName: "http", endpoint =>
                    {
                        endpoint.Port = builder.ExecutionContext.IsRunMode ?
                                        5173 : null;
                    });
```

​

The port specification there is just my personal preference, since I like to have my React app loaded in my browser with a stable port that I can refresh any time.

However, the challenge comes with trying to deploy the Vite app to Azure. Aspire can turn it easily into a container and deploy it as an Azure Container App, but here's the challenge:

> How do you provide the URLs of our .NET backend and of our Keycloak server to a Single Page Application (SPA) that runs entirely in the browser?


You don't know those URLs until Aspire completes provisioning the .NET API and Keycloak as Container Apps, and you can't set environment variables on something that just runs in the browser.

But as with everything else, there's a way.

​

### **Adding a YARP web server**
There are a few ways to solve the Vite app cloud hosting problem, including the popular Backend For Frontend (BFF) pattern, but a simpler way is to add a **YARP** web server to the mix.


![](/assets/images/2025-11-29/4ghDFAZYvbFtvU3CTR72ZN-oZLr418NhddMPnKsWEmVhF.jpeg)

Here's what we get by introducing YARP:

*   <span>We can deploy our Vite/React app as static files inside the YARP server</span>
*   <span>Any time the React app sends an outbound request to a location like "**/api**", YARP can catch it and redirect to the actual location of the .NET backend</span>

To enable this, start by installing the **YARP hosting integration** (Aspire.Hosting.Yarp NuGet package) and then add this code:


```csharp
if (builder.ExecutionContext.IsPublishMode)
{
    builder.AddYarp("frontend-server")
           .WithConfiguration(c =>
           {
               // Always proxy /api requests to backend
               c.AddRoute("api/{**catch-all}", api)
                .WithTransformPathRemovePrefix("/api");
           })
           .WithExternalHttpEndpoints()
           .PublishWithStaticFiles(frontend);
}
```

​

As you can see, we only want to do this in **Publish mode.** During local development, YARP is not needed since Vite can take care of everything.

Notice how we enable an external endpoint on YARP, so we can reach the frontend from our browser and call **PublishWithStaticFiles** so that all the React frontend files get copied into the YARP container.

One more thing you would need to do, this time in your .NET API directly, is to expose an endpoint that can return the full Keycloak Authority URL:


```csharp
public static class GetConfigurationEndpoint
{
    public static void MapGetConfiguration(this IEndpointRouteBuilder app)
    {
        // GET /config
        app.MapGet("/", (IOptions<AuthOptions> authOptions) =>
        {
            return Results.Json(new ConfigurationDto(authOptions.Value.Authority));
        })
        .Produces<ConfigurationDto>();
    }
}
```

​

The frontend will call this endpoint the same way it makes any other backend call, and it will return the full location of Keycloak so it can start the OIDC authentication process.

Now, let's try it out.

​

### **Deploying the full-stack application**
Before kicking off the deployment, you can confirm everything runs locally with an **aspire run** call, which will take you to a local dashboard like this:


![](/assets/images/2025-11-29/4ghDFAZYvbFtvU3CTR72ZN-hBUvdnBWv7eT6dsZgFCFA8.jpeg)

​

Notice how both the **Keycloak database** and the **YARP server** are not present in the dashboard, since we only included them in **Publish mode**.

To deploy the application, we can use either the Azure Developer CLI (**azd up**) or the newer **aspire deploy** command of the Aspire CLI.

Either way, after a few minutes, you'll end up with something like this in your Azure subscription:


![](/assets/images/2025-11-29/4ghDFAZYvbFtvU3CTR72ZN-w1dEK7C3kwjLQGxsY5kK3e.jpeg)

​

You can see our .NET API, YARP frontend, and Keycloak server there, along with our PostgreSQL database (and a bunch of other supporting infra we didn't have to even think about).

From there, you should head to your **Keycloak** server to configure your **templateapp** realm:


![](/assets/images/2025-11-29/4ghDFAZYvbFtvU3CTR72ZN-pa5qfEkKhTbLdWZjBeKWy8.jpeg)

​

And then you can browse to your **frontend-server,** which corresponds to our YARP-hosted React application:


<img src="/assets/images/2025-11-29/4ghDFAZYvbFtvU3CTR72ZN-rL7aiAJnr9VutqRHConFF9.jpeg" style="border: 1px solid;" />

​

Click on Login to authenticate via Keycloak:


![](/assets/images/2025-11-29/4ghDFAZYvbFtvU3CTR72ZN-7tqQ1hda9EUDteeKHhgg9K.jpeg)

​

And then start making changes as an authenticated user:


<img src="/assets/images/2025-11-29/4ghDFAZYvbFtvU3CTR72ZN-7wSEeax31cBKvy3M76vQo9.jpeg" style="border: 1px solid;" />

​

Mission accomplished!

​

### **Wrapping Up**
Everybody can build full-stack applications these days. Most devs stall when it is time to wire everything up in Azure without breaking things.

Aspire changes that. It lets you describe your full stack once, keep the connections and config in a single place, and reuse the same model for local dev and cloud deployments.

Instead of fighting connection strings and ad hoc scripts, you focus on the parts that actually move your product forward.

And that's it for today.

See you next Saturday.

---

<br>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this article, grab exclusive course discounts, and join a private .NET community.