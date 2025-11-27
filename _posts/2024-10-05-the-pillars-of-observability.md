---
layout: post
title: "The Pillars of Observability"
date: 2024-10-05
featured-image: image.jpg
issue-number: 53
---

*Read time: 7 minutes*
​

After completing the Game Store application, the last week was all about scripting the first few modules of the upcoming [.NET Backend Developer Bootcamp](https://juliocasal.com/courses/dotnetbootcamp), which essentially means creating a detailed Word document for each lesson, describing exactly how that lesson should go.

I don't know how many content creators do this, since it's a long (and sometimes tedious) process, but I find it essential to make sure each concept and technique is introduced at exactly the right time and to significantly reduce the chance of errors during recording.

As usual, the first few modules are the hardest to prepare, since those are the ones where I'm forced to put myself in the shoes of an absolute beginner so that I can get across the most fundamental concepts in the most didactic way possible.

Before going back to scripting, let me tell you how the Game Store application deals with something every cloud-ready application must enable: Observability.

​

### **The pillars of observability**
The 3 pillars of observability are what you use to monitor and understand what's happening in your system, from knowing if the app is alive to understanding its overall performance.

The 3 pillars are:

*   <span>**Logs.** Logs capture events and messages about what’s happening in your code, from error messages to successful actions. They help you trace issues and understand specific actions at a particular moment.</span>
*   <span>**Metrics.** The numbers that give you an overview of your system's health. Things like CPU usage, memory consumption, or the number of requests per second. They help you spot problems early before they become critical.</span>
*   <span>**Traces.** These are like a roadmap that follows a single request or transaction as it travels through different parts of your system. They help you see where slowdowns or failures happen in complex, distributed systems.</span>

​

So, what you want to do is collect logs, metrics and traces for all the services involved in your system, from the frontend, to the API gateway, and across all your microservices. It's the only way to understand what's going on when things don't go as expected, especially in cloud-based distributed apps.


![](/assets/images/2024-10-05/4ghDFAZYvbFtvU3CTR72ZN-a9tBA9NR6Y7xe4gtkNM8a9.jpeg)

​

With all that data at hand, you want to publish it to a place where you can visualize and analyze them. There are several options for this, including the popular [Prometheus](https://prometheus.io), but in our case, we'll go for the native Azure service that's designed for this: [Application Insights](https://juliocasal.com/blog/How-To-Monitor-ASP.NET-Core-App-In-Azure).

But first, how do we collect all that data in our services?

​

### **Using OpenTelemetry**
​[OpenTelemetry](https://opentelemetry.io) is like a toolkit for your .NET services that helps you easily collect and send observability data (logs, metrics, and traces) to the platform or tool of your choice.

And, if you are using [.NET Aspire](https://juliocasal.com/blog/Going-Cloud-Native-With-Dotnet-Aspire), you are already using OpenTelemetry. Just open up your **Extensions.cs** file in your **ServiceDefaults** project and you'll find this:


![](/assets/images/2024-10-05/4ghDFAZYvbFtvU3CTR72ZN-omZ3WMm7r7GTgFCoWMREja.jpeg)

​

AddServiceDefaults is the method all your Aspire-enabled apps should be calling, and that one, in turn, calls the **ConfigureOpenTelemetry** method, which will eventually call this:


![](/assets/images/2024-10-05/4ghDFAZYvbFtvU3CTR72ZN-agWej6KTvWfJt2JrKq6Xdw.jpeg)

​

There are several ways you can further customize what data your services should collect, but the **AddOpenTelemetry().UseAzureMonitor()** call is all you need to get started.

In the Game Store application, all the microservices reference ServiceDefaults as a NuGet package and make this call from **Program.cs**:


![](/assets/images/2024-10-05/4ghDFAZYvbFtvU3CTR72ZN-r949iAs9YRoKa37RK4hFpV.jpeg)

​

The next piece to figure out is how to get that Application Insights resource deployed and ready for our apps to connect to it.

​

### **Configuring Application Insights**
Application Insights is nothing more than one more Azure resource, and since I already got another 7 Azure services configured via Bicep, all I did was prepare this new Bicep file based on [the docs](https://learn.microsoft.com/azure/templates/microsoft.insights/components?pivots=deployment-language-bicep):


![](/assets/images/2024-10-05/4ghDFAZYvbFtvU3CTR72ZN-ar5MAEzb89Gh9zas9fiMyX.jpeg)

​

Notice that, just like we did with all other Azure resources, the App Insights connection string is conveniently placed in a KeyVault secret with a format easy to understand by any .NET app.

And, to plug that into your Aspire application model, all you do is this:


![](/assets/images/2024-10-05/4ghDFAZYvbFtvU3CTR72ZN-4jbZqySUkdbA5vpyxaveF8.jpeg)

​

I will further improve this so that you can just use a managed identity here as opposed to a connection string, and I also heard .NET Aspire 9 has massive improvements in its Azure C# API support (so we don't have to switch to Bicep), but for now, this works great.

With that in place, and after redeploying the microservices with my latest ServiceDefaults NuGet package, it's time to see all that telemetry in action.

​

### **Analyzing the telemetry**
After playing with the app for a few minutes in the cloud, we can already see the metrics pop up in the Azure Portal:


![](/assets/images/2024-10-05/4ghDFAZYvbFtvU3CTR72ZN-ayN4owA12Ze4QpywVTApGq.jpeg)

​

We can see traces that give us an end-to-end view of important processes like a purchase order:


![](/assets/images/2024-10-05/4ghDFAZYvbFtvU3CTR72ZN-sCCb6P8YcBCPat3hXsJwJd.jpeg)

​

And we can dive into a filterable sea of logs that keep track of every single exception and warning emitted by our services:


![](/assets/images/2024-10-05/4ghDFAZYvbFtvU3CTR72ZN-nuUBsjdYUBozJ6a5qtwx1s.jpeg)

​

Notice that I'm querying here all the logs for a specific operation_Id. That ID lets you correlate everything that happened across the 7 microservices + API Gateway + Frontend, to complete the processing of an order. Super useful!

​

### **Wrapping up**
A few of you have been asking me for the release date of this bootcamp. Although I don't have a concrete date yet, the plan is to have the first part ready by sometime around Thanksgiving.

I'm sorry it's taking so long but I really didn't want to start recording anything until I knew exactly how the finished application would work, in the cloud, with CI/CD pipelines and full observability.

The scripts I'm working on for the first part of the bootcamp should be done by this time next week. After that, I'll spend a few days working on the slide decks and then we'll start recording. So we are getting there!

Now, back to work!

Julio

---


<br/>


**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.