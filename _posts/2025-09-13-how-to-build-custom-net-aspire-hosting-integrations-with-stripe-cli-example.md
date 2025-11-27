---
layout: post
title: "How to Build Custom .NET Aspire Hosting Integrations (with Stripe CLI Example)"
date: 2025-09-13
featured-image: 2025-09-13/4ghDFAZYvbFtvU3CTR72ZN-wN43TECej59mGja96ytQJb.jpeg
issue-number: 102
---

*Read time: 7 minutes*
​

Last week, I showed how to [speed up your Stripe dev loop]({{ site.url }}/blog/speed-up-your-stripe-dev-loop-with-net-aspire) by introducing the Stripe CLI as a container into your Aspire application model.

Big time saver since now you don't need to remember to spin up a new terminal just to listen for Stripe events and forward them to your local .NET webhook.

However, we ended up with a bunch of infrastructure details in AppHost.cs that can be error-prone and can grow into messy, hard-to-understand code.

How to keep enjoying the benefits of .NET Aspire orchestration while reducing the amount of boilerplate code and leaning towards a clean application model?

That's what Aspire hosting integrations are designed for, and today I'll show you how to create your own custom integration for the Stripe CLI from scratch.

Let's dive in.

​

### **Adding the Stripe CLI hosting extension project**
A hosting extension is composed mainly of a class that represents an Aspire resource and a series of extension methods that simplify creating that resource.

We could define all those directly in our **AppHost** project, but for better reusability, you usually add those to a new project:


![](/assets/images/2025-09-13/4ghDFAZYvbFtvU3CTR72ZN-t7eNx2C12MeNd9g8NTmwm.jpeg)

​

**StripeCLI.Hosting** is a standard Class Library project, but what lets it host your extension is the **Aspire.Hosting** NuGet package, which you must install:


```xml{10}
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Aspire.Hosting" Version="9.4.2" />
  </ItemGroup>

</Project>
```

​

Now, let's define our custom resource.

​

### **The StripeCli resource**
Custom resources in Aspire are defined as classes that implement one of the available resource types.

Since we want to stand up the Stripe CLI as a Docker container, we will implement a **ContainerResource:**


```csharp
public sealed class StripeCliResource(
    string name,
    ParameterResource apiKey)
    : ContainerResource(name)
{
    public ParameterResource ApiKey { get; } = apiKey;
    public ParameterResource? PublishableKey { get; internal set; }
    public ParameterResource? EndpointSecret { get; internal set; }
}
```

​

As you can see, we require two parameters to construct this particular resource:

*   <span>**name:** The name used to represent this resource in the application model, which will be visible in Aspire's dashboard</span>
*   <span>**apiKey:** The key needed to connect to our CLI instance to our Stripe account</span>

Since we define apiKey, PublishableKey, and EndpointSecret as **ParameterResource**, this will allow the Aspire application to prompt the developer for those parameters either for local dev or at deployment time.

Now, for the more interesting part, the builder extensions.

​

### **The resource builder extensions**
In Aspire, resources are created following the builder pattern, meaning that you construct them through a series of fluent method calls rather than passing everything into a single constructor.

For this, let's add our new **StripeCliResourceBuilderExtensions** class:


```csharp
public static class StripeCliResourceBuilderExtensions
{
    private const string Image = "stripe/stripe-cli";
    private const string Tag = "v1.30.0";
    private const string ApiKeyForCliEnvVarName = "STRIPE_API_KEY";

    public static IResourceBuilder<StripeCliResource> AddStripeCli(
        this IDistributedApplicationBuilder builder,
        string name,
        IResourceBuilder<ParameterResource> stripeApiKey)
    {
        var resource = new StripeCliResource(name, stripeApiKey.Resource);

        return builder.AddResource(resource)
            .WithImage(Image)
            .WithImageTag(Tag)
            .WithEnvironment(ApiKeyForCliEnvVarName, resource.ApiKey);
    }
}
```

​

**AddStripeCli** adds an instance of our new **StripeCliResource** to the application model, but more importantly, it sets the **image** and **tag** to be used by default.

This is an opinionated behavior that library authors can set so that library consumers don't have to worry about it by default, but can also override in **AppHost.cs** with another call to **WithImage** or **WithImageTag** if needed.

We do the same with **STRIPE_API_KEY**, the essential environment variable that the Stripe CLI understands, but we don't want library consumers to have to set it manually every time.

Next, we want to add a method to configure the webhook event listener, with the corresponding endpoint secret, plus another method to configure the publishable key:


```csharp
public static IResourceBuilder<StripeCliResource> WithWebhookEventListener(
    this IResourceBuilder<StripeCliResource> builder,
    ReferenceExpression forwardToEndpoint,
    IResourceBuilder<ParameterResource> endpointSecret)
{
    builder.WithArgs("listen", "--forward-to", forwardToEndpoint);
    builder.Resource.EndpointSecret = endpointSecret.Resource;

    return builder;
}

public static IResourceBuilder<StripeCliResource> WithPublishableKey(
    this IResourceBuilder<StripeCliResource> builder,
    IResourceBuilder<ParameterResource> publishableKey)
{
    builder.Resource.PublishableKey = publishableKey.Resource;

    return builder;
}
```

​

We could have done those as part of AddStripeCli, but I thought not every consumer would want to use webhooks, or would need the publishable key, so these methods let them opt in as needed.

Now, how to hand over all these keys from our custom resource and into our API project so it can use them?

​

### **A custom WithReference extension**
**WithReference** is the extension method you typically use to reference resources like databases from your .NET projects, so that the database resource can set a connection string in the project.

But, in this case, what we need is all those Stripe keys to flow into our API project as environment variables, no connection string involved.

For that, what we can do is create our own version of **WithReference**, along with all the environment variables our API already knows how to read:


```csharp{6 7 8 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34}
public static class StripeCliResourceBuilderExtensions
{
    private const string Image = "stripe/stripe-cli";
    private const string Tag = "v1.30.0";
    private const string ApiKeyForCliEnvVarName = "STRIPE_API_KEY";
    private const string ApiKeyForReferenceEnvVarName = "Stripe__SecretKey";
    private const string PublishableKeyEnvVarName = "Stripe__PublishableKey";
    private const string EndpointSecretEnvVarName = "Stripe__EndpointSecret";

    // Other methods here...

    public static IResourceBuilder<TDestination> WithReference<TDestination>(
        this IResourceBuilder<TDestination> builder,
        IResourceBuilder<StripeCliResource> source)
        where TDestination : IResourceWithEnvironment
    {
        ArgumentNullException.ThrowIfNull(builder);
        ArgumentNullException.ThrowIfNull(source);

        return builder.WithEnvironment(context =>
        {
            context.EnvironmentVariables[ApiKeyForReferenceEnvVarName] = source.Resource.ApiKey;

            if (source.Resource.PublishableKey is not null)
            {
                context.EnvironmentVariables[PublishableKeyEnvVarName] = source.Resource.PublishableKey;
            }

            if (source.Resource.EndpointSecret is not null)
            {
                context.EnvironmentVariables[EndpointSecretEnvVarName] = source.Resource.EndpointSecret;
            }
        });
    }
}
```

​

In this **WithReference** overload, builder refers to the **builder** for our API project resource, and **source** represents the Stripe CLI resource that will be referenced by the API.

That **WithEnvironment** call will set all the available environment variables by just taking the values from our custom resource. Callers don't need to know about these lower-level details.

The custom hosting extension is ready. Now let's use it.

​

### **Using the Stripe CLI hosting extension**
The first thing is to reference our hosting extension project from our AppHost project:


```xml{19 20}
<Project Sdk="Microsoft.NET.Sdk">

  <Sdk Name="Aspire.AppHost.Sdk" Version="9.4.0" />

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net9.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <UserSecretsId>5073e39d-00ad-4517-abe1-f5dff20d0d1e</UserSecretsId>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Aspire.Hosting.AppHost" Version="9.4.2" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\GameStore.Api\GameStore.Api.csproj" />
    <ProjectReference Include="..\StripeCLI.Hosting\StripeCLI.Hosting.csproj"
                      IsAspireProjectResource="false" />
  </ItemGroup>

</Project>
```

​

Notice the **IsAspireProjectResource="false"** value there. We need it so that Aspire doesn't treat our hosting extension as a service project (as it does for GameStore.Api), or we won't be able to use it as intended.

Now we are ready to update AppHost from the code we were using before:


```csharp
// OLD CODE
var forwardExpr = ReferenceExpression.Create(
                    $"{api.GetEndpoint("http")}/payments/stripe-webhook");

var stripeCli = builder.AddContainer("stripeCli", "stripe/stripe-cli")
                       .WithEnvironment("STRIPE_API_KEY", stripeApiKey)
                       .WithArgs("listen", "--forward-to", forwardExpr);

api.WithEnvironment("Stripe__SecretKey", stripeApiKey)
    .WithEnvironment("Stripe__PublishableKey", stripePublishableKey)
    .WithEnvironment("Stripe__EndpointSecret", stripeEndpointSecret)
    .WaitFor(stripeCli);
```

​

...to this new version, powered by our new hosting extension:


```csharp
// NEW CODE
var forwardExpr = ReferenceExpression.Create(
                    $"{api.GetEndpoint("http")}/payments/stripe-webhook");

var stripeCli = builder.AddStripeCli("stripeCli", stripeApiKey)
                       .WithWebhookEventListener(forwardExpr, stripeEndpointSecret)
                       .WithPublishableKey(stripePublishableKey);

api.WithReference(stripeCli)
   .WaitFor(stripeCli);
```

​

Notice how all the unnecessary infra details like the Stripe CLI image, the command to listen for and forward events, and the env var names, all disappear, leading to a clean, easy-to-understand API surface.

Finally, let's start the application and do a quick check in the dashboard to confirm all resources and env vars are still there:


![](/assets/images/2025-09-13/4ghDFAZYvbFtvU3CTR72ZN-7x3jaA6yV66tCfLuCt4AHH.jpeg)

​

Mission accomplished!

​

### **Wrapping Up**
By turning your Stripe CLI setup into a clean Aspire hosting extension, you’ve taken another step toward removing friction from your developer workflow.

The less boilerplate you need to juggle with in your AppHost, the more time you can spend actually building features that matter.

This is the power of .NET Aspire: codifying your building blocks once, so your day-to-day development feels lightweight and predictable.

And that's it for today.

See you next Saturday.

---

<br>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.