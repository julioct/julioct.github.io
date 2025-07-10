---
layout: post
title: "Enter The API Gateway"
date: 2024-08-03
featured-image: image.jpg
issue-number: 45
---

*Read time: 10 minutes*
​

This week my family and I were supposed to be enjoying our summer vacations in sunny Chelan, WA, where this time of the year you can enjoy the not-so-cold waters of beautiful Lake Chelan. It's the closest you can get to a beach vacation around here.

Sadly, as it usually happens on that side of the mountain when it gets too hot, a bunch of wild fires started on the north side of the lake (and all around east Washington State), bringing smoke and bad air quality. So we decided to reschedule the trip for later in the year.

On the flip side, that allowed me to keep working on the [.NET Developer Bootcamp](https://juliocasal.com/courses/dotnetbootcamp) project, this time diving into a series of prerequisites to get the Game Store system deployed to the cloud. 

On to this week's update.
​

### **Getting ready for the cloud**
Just for fun, and since I got the whole Game Store system running end to end locally, I decided to try to deploy it as-is to Azure via the [.NET Aspire](https://juliocasal.com/blog/Going-Cloud-Native-With-Dotnet-Aspire) integration with the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview) (azd). 

As expected, things didn't go quite smoothly. In fact, even azd crashed right away, which as I learned from trial and error, was due to version 1.9.5 of azd being broken:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-csTmYw2ZLuypGZDn3KUaSC.jpeg)

Going back to version **1.9.3** fixed those. 

After that, I was able to deploy things to Azure, but pretty much nothing was working. And that's because my Aspire app model was not ready for deployment.

So, to get this going in Azure, a bunch of infra dependencies need to be updated to their PaaS (platform as a service) counterparts:

*   <span>PostgreSQL -> Azure Database for PostgreSQL</span>
*   <span>MongoDB -> Azure CosmosDB</span>
*   <span>Azurite -> Azure Storage</span>
*   <span>RabbitMQ -> Azure Service Bus</span>
*   <span>Keycloak -> Entra ID</span>
*   <span>Kafka -> ???</span>

Kafka is interesting because there is no direct equivalent for it in the Azure cloud at least. The closest you can do is Azure Event Hubs, but from what I read you can't do [topic compaction](https://developer.confluent.io/courses/architecture/compaction/#topic-compaction-key-based-retention), which would complicate the [event-carried state transfer](https://www.grahambrooks.com/event-driven-architecture/patterns/stateful-event-pattern/) pattern across the system. 

Maybe the right thing to use there is the [Confluent Cloud](https://www.confluent.io/partner/microsoft-azure/), but we'll get back to this later.

But how to enable the use of a simple Docker container for local development, while using a fully featured Azure service when deploying? All within the same Aspire App Model?

Something like this:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-dQNE7RzFeecVGVwVLbWHWB.jpeg)

​

That should provision a local RabbitMQ container for local development, or an Azure Service Bus namespace at deployment time. And, whatever gets provisioned, is associated with the Catalog microservice as a "messagebroker" resource.

Now, that's the easy part, but how to make the Catalog microservice (and all your microservices) publish and consume messages to and from either RabbitMQ or Azure Service Bus without a bunch of if-else logic all over the place?

Well, using [MassTransit](https://juliocasal.com/blog/MassTransit)! The amazing messaging framework that can abstract all those details from you. I cover MassTransit extensively in my [microservices program](https://dotnetmicroservices.com/), and it will be a core pillar of the new bootcamp too.

For instance, here's how the Catalog microservice configures the message broker via MassTransit on startup:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-dBc5fEDdbBe9CZAgmubwco.jpeg)

​

Notice the **AddGameStoreMassTransit()** method there. That one will figure out what broker to use (RabbitMQ or Azure Service Bus) based on the .NET Aspire configuration and also provides a delegate to further configure MassTransit as needed.

I'll explain how that all works in detail in the bootcamp, but for now there's a more pressing thing that we are still missing in this system. 

​

# Yet Another Reverse Proxy

I knew I had to introduce an [API gateway](https://juliocasal.com/blog/Standing-Up-An-API-Gateway-For-Dotnet-Microservices) sooner rather than later. After all, you don't want to have your frontend deal with the complexities of talking to multiple microservices all the time.

However, as I was trying to enable [Entra ID](https://juliocasal.com/blog/Securing-Aspnet-Core-Applications-With-OIDC-And-Microsoft-Entra-ID) as the identity provider for the system in the cloud, I faced a complication that prevented the frontend from being able to request access tokens for all microservices at once.

After playing with Entra ID for a while, I now know that what I was trying to do is actually doable in a slightly different way, but instead of keep going that route I thought it was a good time to take a step back and do the right thing by introducing an API gateway. 

There are dozens of API gateways out there, and I have tried out both [nginx](https://nginx.org/) and [Emissary Ingress](https://www.getambassador.io/products/api-gateway) in the past, but for this project I really wanted to try out [YARP](https://microsoft.github.io/reverse-proxy) (Yet Another Reverse Proxy), given how well it integrates with ASP.NET Core applications. 

So, after trying it out for a few minutes, I was able to enable it for my project very easily, since it only requires a few lines of C# code and a few other lines of configuration, like this:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-o5ujcmBqWQweWvrxdD2pxu.jpeg)

That goes into the API gateway project **appsettings.json** file and defines how to handle GET requests for the Catalog microservice.

So, when the frontend sends this request to the gateway:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-jKLYprWhVjeanKcwH1nExe.jpeg)

​

The gateway will forward it as this request to the Catalog microservice (with all query parameters, payload and headers):


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-esQgdhf6Bo6YdCS9W6Bh7F.jpeg)

​

And this is the C# code you add to Program.cs to use that configuration:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-9a6Q2UrnSDfTee8dbTWuqN.jpeg)

​

In a similar way you can define routes for all your other microservices. But when it gets interesting is when you have to do some additional transformations to the incoming request that you can'd do via simple configuration.

For instance, to enable the Entra ID integration I had to perform a token exchange at the gateway so that the microservice would receive the correct access token. Something like this:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-8KpSc2ugD8uzBezPCDKx42.jpeg)

​

This is something we did all the time back at my last team at Microsoft (brings back memories!), and it makes total sense since in the real world your clients will present you an access token that grants them access to your gateway, nothing else. From there your gateway decides what kind of token to use to reach the target microservice.

This is how the system looks like after integrating the API gateway:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-m6nEbf2YhaJK8nregWhbo3.jpeg)

​

Notice how the frontend is now completelly unaware of what's going on behind the gateway, which is the whole point of this, because now you can move pieces as you please in the back without impacting the frontend and the frontend only needs to worry about talking to a single endpoint.

To close, let me tell you about one thing you may want to enable in your .NET Aspire projects.

​

### **Waiting for resources to start**
One thing that I've been noticing as I run the system with .NET Aspire is how even when all projects report they are "Running" they are in fact reporting a bunch of warnings or errors trying to talk to their dependencies.

This is kind of surprising since, supposedly, all .NET Aspire components have health checks enabled, so I was expecting the orchestrator would honor them and not consider anything ready to go until health checks report healthy.

Sadly, seems like that's not the case, and you have to do a bit more to achieve the expected behavior. But fortunately there's a nice project from the great [David Fowler](https://github.com/davidfowl) that can help here.

The project is called **WaitForDependenciesAspire**, all open source [here](https://github.com/davidfowl/WaitForDependenciesAspire), and what it lets you do is have resources wait for their dependencies to be ready as reported by their health checks.

In terms of the code, looks like this:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-bq1UbexKGowpCrjnU52PLh.jpeg)

​

That's the Catalog microservice waiting for its Postgres database to be ready before starting, and then the Frontend also waiting for the Catalog microservice to be ready.

Looks like this in the .NET Aspire dashboard:


![](/assets/images/2024-08-03/4ghDFAZYvbFtvU3CTR72ZN-nQCU9au9rsaBS9DbGs6cp7.jpeg)

​

I think it's a nice helper for local development, however I don't see how any of that will translate to actual heath checks that can be used in the cloud (or maybe I'm missing something?). 

Anyways, I'll get back to finish that Entra ID configuration and hopefully start that Azure deployment for real this time.

Until next time!

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

2. **[Browse all courses]({{ site.url }}/courses)**: Everything you need to build, deploy, and maintain production .NET applications.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.