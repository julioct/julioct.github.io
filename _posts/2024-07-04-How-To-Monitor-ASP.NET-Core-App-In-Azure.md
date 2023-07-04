---
title: "TNS #001: How To Monitor Your ASP.NET Core Application In Azure"
date: 2023-07-04
layout: post
featured-image: HowToMetrics.jpg
featured-image-alt: How To Monitor Your ASP.NET Core Application In Azure
---

Read time: 3 minutes

Today I'm going to show you how to quickly start monitoring your ASP.NET Core application in Azure.

Having good monitoring in place is a huge life saver since it can quickly give you a good insight into the health of your application and works as the pillar upon which you can later setup alerts to make sure you know about application problems before your customers ever notice.

Many folks leave monitoring for the very end, which is not surprising since it's not critical to get the app up and running and the traditional series of concepts to learn, libraries to install and services to configure, can be overwhelming.

### You need to start monitoring to your .NET application today.

I'll show you how to start collecting metrics using OpenTelemetry, a super popular observability framework to collect, process and export telemetry data and the Azure Monitor OpenTelemetry Distro, a new library to make it really easy to publish collected metrics to Azure Monitor Application Insights.

With these two sets of frameworks in place you'll be able to:

Add basic monitoring to your ASP.NET Core app in no time
Quickly see your app's basic health indicators in your Azure Portal
Start tracking your custom metrics with a few lines of code
Here's how to get started, step by step:

Prerequisites
An Azure subscription. You can sign up for a free trial here.
Your existing ASP.NET Core application. I'm not sure how much you'll be able to do with other types of .NET apps.
​

1. Create an Application Insights resource
In your Azure Portal, look for the Application Insights service and create a new one:


Once creation is completed (20-30 seconds in my case), go to your new App Insights resource and copy the connection string that you'll find in the Overview blade. You'll need that later.


2. Install the client library
Open a Terminal, switch to your ASP.NET Core app dir and install the Azure Monitor OpenTelemetry Distro client library:

```powershell
dotnet add package --prerelease Azure.Monitor.OpenTelemetry.AspNetCore
```

3. Register the Azure Monitor OpenTelemetry services
Add the following line to your Program.cs file:

```csharp
builder.Services.AddOpenTelemetry().UseAzureMonitor();
```

That will both register the OpenTelemetry services and configure Azure Monitor exporters for logging, distributed tracing and metrics. The simplest Program.cs file would look like this now:


4. Provide the App Insights connection string to your app
For your app to start talking to Azure App Insights, it needs the connection string you copied earlier. There are a few ways to configure the connection string in your app, but for local development purposes my preferred approach is to use the .NET Secret Manager.

To do that, first go back to your Terminal and initialize user secrets for your app:


Then, set your secret, where the key must be AzureMonitor:ConnectionString and the value the actual connection string:


5. Confirm your app is sending data to Azure App Insights
Surprisingly, there's nothing else to do to start getting data in App Insights. So, start your app and start hitting a few of your endpoints to start collecting monitoring data.

Give it a few minutes (data will not show up in real time in Azure) and eventually you should see a few essential metrics popping up in your App Insights Overview blade:


I even tried out a few requests that resulted in a 404 to confirm they would show up as failed requests in the first chart.

6. Track custom metrics
Let's say that now you want to start tracking your own metrics. For instance, in my little Match Making app I'd like to start counting each time a new match is created and report that as a new metric.

That's actually quite easy with the built in APIs provided in .NET. So here's what you do:

1. Define a counter:


2. Create an instance of the meter for your API and use it to create your counter:


3. Count! For instance, here's where my app creates a new match, so just after the match is created in my repository, I use the counter to count one more match created:


4. Define your new meter in your Program.cs via the ConfigureOpenTelemetryMeterProvider method:


5. Run your app and execute the endpoint(s) that use the above logic. Then go to your Metrics blade in the Azure portal and add your new metric. In my case, the created matches look like this:


Done!

Well, that's it for today.

I hope you enjoyed it.

Whenever you’re ready, there are 3 ways I can help you:

​Building Microservices With .NET:​ A complete online program designed to transform the way you build .NET systems at scale so that they are resilient, secure, easy to maintain, and ready to handle constantly changing business requirements and production demands.
​Building .NET REST APIs​: A carefully crafted online course to learn how to build production ready .NET based REST APIs, step by step.
​Full source code. Get the source code behind all my newsletter issues and YouTube videos by supporting me on Patreon.
