---
layout: post
title: "3 Ways to Shrink Your Aspire AppHost"
date: 2025-11-22
featured-image: 2025-11-22/4ghDFAZYvbFtvU3CTR72ZN-o1U5z7gYuSrT8Kv4Z1eTLw.jpeg
issue-number: 109
---

*Read time: 7 minutes*

<p style="text-align: center; font-size: 1.2em;"><strong>The .NET Saturday is brought to you by:</strong></p>

<div style="background: linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%); padding: 36px; margin: 24px 0; overflow: hidden; border-radius: 14px; box-shadow: 0 2px 12px rgba(80,120,200,0.08);">
  <p style="text-align: center; max-width: 600px; margin: 0 auto 18px auto;"><a href="https://www.jetbrains.com/rider/?utm_source=newsletter_dot_net_saturday&utm_medium=cpc&utm_campaign=junie" target="_blank"><strong>JetBrains Rider​</strong></a> is better with an AI coding agent that can save you hours, if not days. Simply provide a precise prompt, and get a fully functional feature in return!</p>

  <div style="display: flex; justify-content: center;">
    <a href="https://www.jetbrains.com/rider/?utm_source=newsletter_dot_net_saturday&utm_medium=cpc&utm_campaign=junie" target="_blank" style="background: linear-gradient(90deg, #4f8cff 0%, #235390 100%); color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1em; box-shadow: 0 2px 8px rgba(80,120,200,0.10); transition: background 0.2s; text-align: center;">Try it today</a>
  </div>
</div>

Every Aspire release brings new capabilities, but the pattern I've seen more and more is how the latest versions actually remove code from your projects.

And I don't mean bug fixes or performance tweaks. I'm talking about infrastructure boilerplate that's been cluttering your AppHost since you started using Aspire.

The Aspire team has been quietly simplifying the APIs across the last few releases.

Verbose configurations that used to take multiple lines? Now one-liners. Workarounds you needed for Azure deployments? Built into the framework.

Today, I'll walk you through three cleanups that will simplify your application model immediately as you upgrade to the latest Aspire bits.

Let's dive in.

​

### **Upgrading Aspire**
The easiest way to upgrade Aspire is by using the Aspire CLI. So we should start by upgrading the CLI itself (using PowerShell here):


```powershell
iex "& { $(irm https://aspire.dev/install.ps1) }"
```

​

This should be the last time you use that script to update your Aspire CLI. Starting with Aspire 13, the CLI includes the new **--self** flag for **aspire update**, which will let it easily self-update:


```powershell
aspire update --self
```

​

Next, use **aspire update** to update all Aspire dependencies across all your projects in one shot:


![](/assets/images/2025-11-22/4ghDFAZYvbFtvU3CTR72ZN-qRMsryznLwbGvSeMYqqEhu.jpeg)

​

You may also want to update your Aspire project templates:


```powershell
dotnet new install Aspire.ProjectTemplates
```

​

Next, let's start taking advantage of the new bits.

​

### **1. Use the simpler AppHost project template**
The updated Aspire SDK supports a simplified project template for your AppHost. This was my Aspire 9.4 project:


```xml
<Project Sdk="Microsoft.NET.Sdk">

  <Sdk Name="Aspire.AppHost.Sdk" Version="9.4.1" />

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net9.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <UserSecretsId>92823f80-554d-4fd2-9ad2-b361574d1318</UserSecretsId>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Aspire.Hosting.AppHost" Version="9.4.1" />
    <PackageReference Include="Aspire.Hosting.Azure.AppContainers" Version="9.4.1" />
    <PackageReference Include="Aspire.Hosting.Azure.ApplicationInsights" Version="9.4.1" />
    <PackageReference Include="Aspire.Hosting.Azure.ServiceBus" Version="9.4.1" />
    <PackageReference Include="Aspire.Hosting.Keycloak" Version="9.4.1-preview.1.25408.4" />
    <PackageReference Include="Aspire.Hosting.Azure.PostgreSQL" Version="9.4.1" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\TemplateApp.Api\TemplateApp.Api.csproj" />
    <ProjectReference Include="..\TemplateApp.Worker\TemplateApp.Worker.csproj" />
  </ItemGroup>

</Project>
```

​

And this is what it looks like after taking advantage of the updated template:


```xml{1 12 13 14 15 16}
<Project Sdk="Aspire.AppHost.Sdk/13.0.0">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net9.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <UserSecretsId>92823f80-554d-4fd2-9ad2-b361574d1318</UserSecretsId>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Aspire.Hosting.Azure.AppContainers" Version="13.0.0" />
    <PackageReference Include="Aspire.Hosting.Azure.ApplicationInsights" Version="13.0.0" />
    <PackageReference Include="Aspire.Hosting.Azure.ServiceBus" Version="13.0.0" />
    <PackageReference Include="Aspire.Hosting.Keycloak" Version="13.0.0-preview.1.25560.3" />
    <PackageReference Include="Aspire.Hosting.Azure.PostgreSQL" Version="13.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\TemplateApp.Api\TemplateApp.Api.csproj" />
    <ProjectReference Include="..\TemplateApp.Worker\TemplateApp.Worker.csproj" />
  </ItemGroup>

</Project>
```

​

Notice how your Aspire SDK is now specified directly in your **\<Project\>** tag, including the version, and the removal of **Aspire.Hosting.AppHost** package, now included with the SDK.

Next, let's start the application model clean-up.

​

### **2. Use the new Azure PostgreSQL resource properties**
A few months ago, I covered [how to deploy Keycloak to Azure with Aspire]({{ site.url }}/blog/deploying-keycloak-to-azure-with-net-aspire), which amazingly was doable with zero Bicep files, pure C#.

One of the key challenges was how to figure out the **hostname** of the deployed Azure PostgreSQL server, so that Keycloak can connect to it and use it as its database in the cloud.

The best we could do was this:


```csharp
var postgres = builder.AddAzurePostgresFlexibleServer("postgres")
                    .ConfigureInfrastructure(infra =>
                    {
                        var pg = infra.GetProvisionableResources()
                                      .OfType<PostgreSqlFlexibleServer>().Single();

                        infra.Add(new ProvisioningOutput("hostname", typeof(string))
                        {
                            Value = pg.FullyQualifiedDomainName
                        });
                    });

var keycloakDb = postgres.AddDatabase("keycloakDB", "keycloak");

var keycloakDbUrl = ReferenceExpression.Create(
    $"jdbc:postgresql://{postgres.GetOutput("hostname")}/{keycloakDb.Resource.DatabaseName}"
);

var keycloak = builder.AddKeycloak("keycloak")
                      .WithEnvironment("KC_DB", "postgres")
                      .WithEnvironment("KC_DB_URL", keycloakDbUrl);
```

​

Notice the tricky **ConfigureInfrastructure** call to add the **hostname** output that later would be used to build the JDBC PostgreSQL connection string that Keycloak would use.

But with the latest Aspire improvements, that hostname output is now a native property on the **AzurePostgresFlexibleServerResource**, allowing us to reduce all that to this:


```csharp{6}
var postgres = builder.AddAzurePostgresFlexibleServer("postgres");

var keycloakDb = postgres.AddDatabase("keycloakDB", "keycloak");

var keycloakDbUrl = ReferenceExpression.Create(
    $"jdbc:postgresql://{postgres.Resource.HostName}/{keycloakDb.Resource.DatabaseName}"
);

var keycloak = builder.AddKeycloak("keycloak")
                      .WithEnvironment("KC_DB", "postgres")
                      .WithEnvironment("KC_DB_URL", keycloakDbUrl);
```

​

Neat!

And in Aspire 13.1, we expect new APIs to be able to retrieve that full JDBC connection string directly from the AzurePostgresFlexibleServerResource, reducing that code much more.

Now, let's look at our health probes.

​

### **3. Use the native HTTP health probes support**
I covered the use of health checks and probes with Aspire over [here]({{ site.url }}/blog/build-self-healing-apps-health-checks-and-probes-with-net-aspire), and it works really well. But, honestly, it's a lot of code to define two simple health probes in Azure Container Apps:


```csharp
var api = builder.AddProject<TemplateApp_Api>("templateapp-api")
            .WithReference(templateAppDb)
            .WaitFor(templateAppDb)
            .WithExternalHttpEndpoints()
            .PublishAsAzureContainerApp((infra, containerApp) =>
            {
                var container = containerApp.Template.Containers.Single().Value;

                container?.Probes.Add(new ContainerAppProbe
                {
                    ProbeType = ContainerAppProbeType.Liveness,
                    HttpGet = new ContainerAppHttpRequestInfo
                    {
                        Path = "/health/alive",
                        Port = healthPort,
                        Scheme = ContainerAppHttpScheme.Http
                    },
                    PeriodSeconds = 10
                });

                container?.Probes.Add(new ContainerAppProbe
                {
                    ProbeType = ContainerAppProbeType.Readiness,
                    HttpGet = new ContainerAppHttpRequestInfo
                    {
                        Path = "/health/ready",
                        Port = healthPort,
                        Scheme = ContainerAppHttpScheme.Http
                    },
                    PeriodSeconds = 10
                });
            })
            .WithEnvironment("HTTP_PORTS", $"8080;{healthPort.ToString()}")
            .WithHttpHealthCheck("/health/ready");
```

​
With the latest Aspire updates, we can now turn all that into this:


```csharp{1 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20}
#pragma warning disable ASPIREPROBES001
var api = builder.AddProject<TemplateApp_Api>("templateapp-api")
            .WithReference(templateAppDb)
            .WaitFor(templateAppDb)
            .WithExternalHttpEndpoints()
            .WithHttpEndpoint(
                name: "health",
                targetPort: 8081,
                isProxied: false)
            .WithHttpProbe(
                ProbeType.Liveness,
                "/health/alive",
                periodSeconds: 10,
                endpointName: "health")
            .WithHttpProbe(
                ProbeType.Readiness,
                "/health/ready",
                periodSeconds: 10,
                endpointName: "health");
#pragma warning restore ASPIREPROBES001
```

​

Let's unpack that:

*   <span>The **WithHttpEndpoint** call defines a new health endpoint that will listen on port 8081. It must go after **WithExternalHttpEndpoints** because it's internal only, so only the health probes can reach it.</span>
*   <span>The **WithHttpProbe** calls are the new way to define the probes without involving any Azure Container Apps specific syntax. </span>
*   <span>The **ASPIREPROBES001** warning must be disabled since the new API is still experimental.</span>

​

And, on top of this, notice how we don't need the separate **WithHttpHealthCheck** call, since WithHttpProbe will implicitly add it.

Much cleaner!

​

### **Wrapping Up**
Aspire's value isn't just in what it adds, it's in what it takes away.

Simpler project templates, native Azure resource properties, and cleaner APIs all point in the same direction: less ceremony, more clarity.

**The best frameworks get out of your way.** That's exactly what the Aspire team keeps delivering.

Upgrade, delete some code, and enjoy the cleaner application model.

And that's it for today.

See you next Saturday.

---

<br>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this article, grab exclusive course discounts, and join a private .NET community.