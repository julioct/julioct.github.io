---
layout: post
title: "Build a System, Not an App"
date: 2025-05-24
featured-image: 2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-uEh7TcbyXV4Qz5xDepYr77.jpeg
issue-number: 86
---

*Read time: 6 minutes*
​

You’re probably thinking about your app in terms of projects—your .NET API, your React or Angular frontend, maybe a worker or two.

But let me challenge that mindset.

You’re not just building an app. You’re stitching together a full system—made of your code, a database or two, blob storage, authentication, monitoring, and deployment plumbing.

Whether you realize it or not, you're designing a system, not just writing code.

Today I’ll show you how .NET Aspire lets you represent that system in actual C# code—so you can stop drawing outdated architecture diagrams and start shipping with a live, running model of your system that’s always in sync.

Let’s dive in.

​

### **A complete application model**
When you talk about your application, you usually mean the code that makes it run. Your Web API, your React app, your Blazor app, your Worker service, etc.


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-ipXaC8qTPwkdmsGvj7c7gn.jpeg)

​

However, that's just part of the puzzle. Most apps will not try to do everything by themselves, and instead, they will delegate work to a bunch of external services, like the ones we discussed [last week]({{ site.url }}/blog/how-to-migrate-from-docker-compose-to-net-aspire).


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-oGqzFsrqvcrR8NkeLCVdYg.jpeg)

​

So, the reality is that what you are building is not an app but a system composed of several essential building blocks, which include your app and all external services.

This is what we call the **Application Model,** but so far, the best way to represent it has been a nice diagram, drawn either at the early stages of the project or much later when new requirements force us to see the big picture.


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-g1nMaLDSTvvXQ4YaeKf5oE.jpeg)

​

What if this application model could be expressed in C# code and kept always in sync with your latest system implementation? And what if you could have a live diagram in sync with that code?

With .NET Aspire, you can.

​

### **Your application model in C#**
I already showed you parts of this application model last week when we moved 3 services from Docker Compose to .NET Aspire's AppHost project:


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-2XWEVh2o3oWs1znkBrKaKQ.jpeg)

​

The missing piece is your actual application. To add it, start by referencing your application project from the AppHost project:


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-JuAjFNbYpsKukS8RZGqpe.jpeg)

​

Then you can add your project to the application model:


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-9PW7bC3tcnmmjzjrmmpfMW.jpeg)

​

Nice, but we are missing an important detail.

​

### **Connecting the dots**
What is the most common way to let your application know how to connect to a database or any sort of external service?

In the .NET world, you use a connection string.

So, you go to your appsettings.json file and add something like this:


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-umKsfh48mkNofnxvNxs6PD.jpeg)

​

Then you add the client libraries that know how to use those connection strings (ideally the .NET Aspire client integrations, which I covered [here]({{ site.url }}/blog/zero-cost-resilience-for-net-apps-in-azure)), and then you register the clients in your web app's Program.cs file:


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-9S3EFAwd6Pj8tw9Px9vTED.jpeg)

​

But wait, what if I don't know on top of my head how to write connection strings for PostgreSQL and Azure Storage?

Well, either you ask ChatGPT (who keeps using Google these days?) or you let your Aspire application model know about these relationships with a few more lines of C#:


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-fg2Z9dhfH1MujSifH74A7Y.jpeg)

​

That not only tells .NET Aspire that your API depends on the PostgreSQL database and the Storage blobs, but it also allows Aspire to formalize the relationship with practical side effects both at runtime and deployment time.

At runtime, those references will translate into the relevant connection strings that AppHost will inject into your web app in the form of environment variables.

You can confirm that in Aspire's dashboard:


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-aL2L5w29ErpC5w9Li6Pf6G.jpeg)

​

And, because of that, I no longer need any of these in appsettings.json file:


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-L2y6eFcBZWzrxacgbBuU9.jpeg)

​

It just works because the injected environment variables match exactly the pattern used in ASP.NET Core to define connection strings, which .NET Aspire client integrations will use.

And, there's more.

​

### **Visualizing your application model**
Since .NET Aspire now understands exactly all the pieces of not just our app, but our entire system, why not let it give us a nice visual representation?

Yes, it can do that too:


![](/assets/images/2025-05-24/4ghDFAZYvbFtvU3CTR72ZN-uEh7TcbyXV4Qz5xDepYr77.jpeg)

​

It's a live view of your entire system, exactly as you defined it in your C# code.

It even includes the Keycloak dependency, which I cover in detail, plus how to convert the entire thing into Bicep files to get everything deployed to Azure with one command, in the upcoming **Containers & .NET Aspire course** that will soon join [the bootcamp]({{ site.url }}/courses/dotnetbootcamp).

​

### **Wrapping Up**
.NET Aspire lets you stop thinking in terms of individual apps and start thinking in terms of systems.

By modeling your entire system in C#—apps, databases, storage, dependencies—you get a single source of truth that stays in sync with your actual implementation.

You get connection strings wired automatically. Visual diagrams updated live. And configuration that works both locally and in the cloud.

This isn’t just cleaner code. It’s a cleaner way to build real systems.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.