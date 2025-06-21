---
layout: post
title: "To the cloud and beyond!"
date: 2024-08-31
featured-image: image.jpg
issue-number: 48
---

*Read time: 10 minutes*
​

Last week my son and I joined several other families on our first Cub Scout camping trip. It was a great father/son experience even when we were hit by a record rainfall very unusual for this time of the year.

The camp was not too far from home, but it required a lot of preparation and was remote enough that I was not able to send the weekly newsletter, which was sad since I had a lot to share.

In any case, we came back on Sunday, and by Wednesday I had successfully completed the deployment of the Game Store application to the Azure cloud, and today I'll share a few details of what I learned and remembered along the way.

On to this week's update.


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-a7p1Jq6gTL3CwcDoBRLQs4.jpeg)

​

### **An Azure-ready app**
For a quick refresher, here's how the Game Store application, which is core to the upcoming [.NET Developer Bootcamp](https://juliocasal.com/courses/dotnetbootcamp), looks like when running in a dev box:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-eGMCvW35rDQkDuG3x424M9.jpeg)

​

The beauty of it is that you don't need any cloud resources to run the entire app in your box. All infra services run as simple Docker containers.

But a key part of the bootcamp is to show how to properly deploy the app to Azure. For this, you turn all your microservices into Docker images that will run as containers in the cloud.

But what about the infrastructure services? You don't really want to deploy them as docker images; instead, you should use native Azure services, which are designed for the heavy demands of a Production environment.

After deploying the app to Azure it will look like this:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-hromyczxEf1Hy1JzxP2wVo.jpeg)

​

Here's a quick summary of the services that support the Game Store application in Azure:

*   <span>**Container Apps.** A simpler version of Azure Kubernetes Service that runs your microservices as containers without having to deal with a Kubernetes cluster.</span>
*   <span>**Container Registry.** A repository for your microservice container images.</span>
*   <span>**PostgreSQL Flexible Server.** A cloud version of PostgreSQL used by the Catalog and Ordering microservices.</span>
*   <span>**Cosmos DB for MongoDB.** A NoSQL database compatible with the MongoDB API. Used by the Basket microservice.</span>
*   <span>**Storage.** To hold the game images uploaded by users to the Catalog.</span>
*   <span>**Service Bus.** For command style messages sent by the Ordering microservice as part of the order processing saga.</span>
*   <span>**Event Hubs.** Used as a Kafka cluster for Catalog to publish any events that Basket and Ordering listen to create their cache of games.</span>
*   <span>**Entra ID.** To provide OpenID Connect access/identity tokens, as well as roles and other claims. </span>
*   <span>**Key Vault.** To store secrets, particularly connection strings.</span>
*   <span>**Managed Identities.** To provide an identity that can be used to grant the microservices different types of access to Azure services.</span>
*   <span>**Communication Services.** To send email notifications when orders are complete.</span>

There will likely be more Azure services in this mix once the observability pieces are added later, but for now, that's enough to make the app work end-to-end in the cloud.

Now let's see what sort of changes were needed to run the app in Azure.

​

### **Using .NET Aspire Azure components**
.NET Aspire has built-in support for multiple Azure services. This works pretty well in a few cases, like here where I ask Aspire to publish the PostgreSQL resource as an Azure PostgreSQL flexible server resource:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-moVDuV5Y3MbGFrxQLHUiDw.jpeg)

​

All the Catalog microservice has to do to connect to the PostgreSQL database in Azure is install the relevant NuGet package (Aspire.Npgsql.EntityFrameworkCore.PostgreSQL) and add this one line, which is the same line used to connect to PostgreSQL locally:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-mSunmfx9bNTM2o3hLry4x6.jpeg)

​

.NET Aspire will take care of provisioning the PostgreSQL Azure resource and then inject an environment variable into the Catalog microservice container in Azure with the corresponding connection string:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-qyCiJn1AYu2EmnSkx8kKAo.jpeg)

​


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-rjUPpyxieU4vu8ZFjE3m45.jpeg)

​

But how do you actually deploy your microservices and the infrastructure services to Azure?

​

### **Enter the Azure Developer CLI**
.NET Aspire is tightly integrated with the [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/overview), a tool meant to simplify the steps needed to go from your box to the Azure cloud.

Assuming you have declared all your Azure resources (and how they relate to your microservices) in your .NET Aspire AppHost project, all you do is run this command from the AppHost dir:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-7wmqmmw4rqpvgKbgP7Q3c7.jpeg)

​

Which will kick off the provisioning process:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-4aqhESY9ijPWwG2TRfpqeR.jpeg)

​

That takes care of the infrastructure part. Then, time to deploy those microservices, which you can do with 1 more command:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-f6hrjX5TJRD12bVHFfW3Ao.jpeg)

​

Which will turn your microservices into Docker images, publish them to your Container Registry, and run them as containers in Azure Container Apps:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-iVQAp7Je28z7zsPQEX3YeH.jpeg)

​

You can also do **azd deploy "your-microservice"** to deploy an individual microservice, which can save a lot of time. There's also this command to do both infra provisioning and microservice deployment in one shot:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-bFCRVsL1C5qSD65DD8Ti63.jpeg)

​

Now, as I eventually found, the moment you need to introduce the smallest customization to those Azure resources, you'll notice the Aspire APIs are not as friendly as they should be. For instance, how to modify this to allow public access to my blobs?


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-jdYRgGwgK4VRQ3uD9RZVmo.jpeg)

​

There is an overload for **AddAzureStorage()** you can use for this, but it is not very intuitive and is currently experimental, so you don't know how much that will change later. 

Fortunately, there is a nice second layer of customization you can use here, but for that, we need to dig deeper into what's going on behind the scenes.

​

### **Under the hood: it's all Bicep!**
It's not quite evident at first glance, but what the Azure Developer CLI (azd) is doing to provision your Azure resources is turning the app model you declared in AppHost into a bunch of [Bicep](https://learn.microsoft.com/azure/azure-resource-manager/bicep/overview) resources.

Bicep is an increasingly popular language and tool to define and manage cloud resources on Azure. 

Instead of manually clicking around in the Azure portal to set up databases, storage accounts, etc., you write a Bicep file that describes what you want your infrastructure to look like. Then, Azure takes that file and creates or updates the resources according to your specifications. 

This is what we know as [Infrastructure As Code](https://learn.microsoft.com/devops/deliver/what-is-infrastructure-as-code), or IaC, an incredibly useful practice in the world of IT and DevOps.

But where are those Bicep files? Well, time to reveal the magic with this single command:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-edX9kyYeuS6mHyhvEEvgFC.jpeg)

​

That will translate your .NET Aspire app model into Bicep files. But, instead of placing them into some temp directory, it dumps them right into your repo:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-bCRwECgx8UdShPwwnZVDuu.jpeg)

​

You can now go ahead and explore each of those files to understand exactly how each resource will be provisioned. You could even modify any of those files to alter the properties of the resources. 

However, it's best to not touch those files since they will get overridden the next time you run **azd infra synth**. Please notice that this command effectively exits your app model from C# into Bicep, which is not very convenient.

What I like to do instead is grab a copy of the generated Bicep for the resource I'm interested in, delete all the stuff that **azd infra synth** generated, and then add my own Bicep file. 

For instance, this is what I came up with for my Storage account:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-2Rd7upWWLhHxs13ckJcf3H.jpeg)

​

Notice how easy it was to enable public access for blobs over there. Then, all you do is add that file as another resource to your app model, and pass that output blob endpoint as an environment variable to the microservice:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-gUQLoUxojdecRa8wAsnPiQ.jpeg)

​

There are more nuances to this, like how to grant permissions to your microservices managed identity so that they can properly interact with the Storage account or any other Azure resource. But it's not too hard and I'll go over all of that in detail in the Bootcamp.

​

### **The end result**
Here for a few screenshots of the app running fully in the Azure cloud:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-7EGGYDnxGgDM5YviAeQVYa.jpeg)

​


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-kVSWohpEgEuQHdxoHMu9xC.jpeg)

​


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-d5xTdgyusHwqm4tUcZ8zw4.jpeg)

​


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-mbNxKYydKvMeCGANq5kEod.jpeg)

​


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-mwN6TBbcct9MPNGhTBt26r.jpeg)

​

Ohh, and one more thing you get for free:


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-dPDkrynJyowA6c75XmrPMW.jpeg)

​


![](/assets/images/2024-08-31/4ghDFAZYvbFtvU3CTR72ZN-fN964xtW7jSvYvgESWsGaM.jpeg)

​

That's the .NET Aspire dashboard deployed alongside the other Azure resources, so you can easily check the logs, metrics and even distributed traces of your microservices as they interact with any of their dependencies. Very useful!

There's A LOT more that I had to do to make this work (Aspire service discovery on Azure just doesn't work!), and I'll go over all of that in the bootcamp, but now it's time to switch to another critical aspect I don't want to miss before jumping into the DevOps side of things: 

**Integration Testing**

Until next week!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

2. **[Browse all courses]({{ site.url }}/courses)**: Everything you need to build, deploy, and maintain production .NET applications.

3. **​[Patreon Community](https://www.patreon.com/juliocasal){:target="_blank"}**: Get the full working code from this newsletter, exclusive course discounts, and access to a private community for .NET developers.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.