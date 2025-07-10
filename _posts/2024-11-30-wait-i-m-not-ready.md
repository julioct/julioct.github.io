---
layout: post
title: "Wait, I'm Not Ready!"
date: 2024-11-30
featured-image: image.jpg
issue-number: 61
---

*Read time: 10 minutes*
​

Wow, last week was rough, really rough. My home lost power for almost 6 days thanks to the crazy bomb cyclone that went very close to the Seattle area a few days ago.

Even when it never hit land, it pulled crazy winds that tore down trees all over the place, which in turn sent tons of power lines down to the streets across a huge area, leaving thousands of people without power for several days.

It's very humbling to realize how many things we take for granted. After a day without power, things got very cold in the house, everybody's cell phones ran out of battery and there was no way to heat the food. 

Luckily, we were able to find a couple of places nearby on Airbnb, which had already recovered their power, so we managed to stay safe and warm in the middle of this chaos.

Power is now back at home and, after this unfortunate delay, I'm back to work and already done recording the second course in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp), ASP.NET Core Advanced!

Today let me tell you about a nice new feature enabled in the recently released .NET Aspire 9.

Let's dive in.


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-eYNvyLbgixLSwwGs8aU8AQ.jpeg)

​

### **The problem with dependencies**
I mentioned [last week]({{ site.url }}/blog/the-net-aspire-feature-i-ve-been-waiting-for) how starting a Kafka Docker container in my box can take 20+ seconds and how that can be somehow mitigated by using persistent containers.

However, what happens to your application when dependencies like Kafka are slow to start? Persistent containers will only help you after your second run, but the very first time your app will have no Kafka to talk to for a while.

The same is true for any other dependencies you might have, like PostgreSQL, RabbitMQ, or Keycloak. Your .NET app started quickly, but dependencies are down for a while. 

In my Aspire dashboard, this situation looks like this:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-si43MMGzyPXRhRUiwidfam.jpeg)

​

So, my Basket, Catalog, and Ordering .NET microservices are up and running, but they fail to connect to the Kafka instance, which remains unhealthy for a while.

And we can get proof of what's going on by taking a quick look at the logs of one of the microservices:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-hG5EkPNJdJUob2zKqkgsc8.jpeg)

​

Kudos to the Aspire Dashboard for instantly and very clearly pointing out the problem!

But what should your app do in this case?

​

### **I'm not ready**
To start with, your app should be configured to not just die when it can't reach a dependency. It should keep trying at least for some time, until that dependency becomes available.

Fortunately, that's something that the Kafka .NET client will do for you automatically, so you don't have to worry too much about it. You can tune up the timeout and retry count if you'd like, but the default values are a good start.

Now, the important thing you should configure your app to do is to tell others that it is not ready to do any work yet because one or more of its dependencies is also not ready.

And to do that, you enable what we know as **health checks**, which are nothing more than a couple of endpoints in your API that will check if your app and all dependencies are ready to go and then return a status.

​

### **Adding health checks**
Enabling health checks is very easy to do in ASP.NET Core by first registering the required health check services:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-5BaYbqCAw9R6Xgrn6AGkhD.jpeg)

​

There we also register a basic check that will immediately return a Healthy status and that is associated with a tag we named **live**.

Then you can map a couple of endpoints to report the status:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-eTfscM33pnTXXKAAXQKRFA.jpeg)

​

The **/health/alive** endpoint is typically used to just report if your app is alive at all. Meaning, it has not crashed, so at least we know it was able to boot.

Notice how that endpoint will match any health check with the **live** tag, which corresponds to the check we added earlier.

The **/health/ready** endpoint is used to tell others if the app is ready to receive traffic. 

Both those endpoints will return a **Healthy** or **Unhealthy** status, depending on what they find when invoked.

Now, there is nothing new there since we have been able to do this for a long time. However, .NET Aspire takes advantage of this mechanism to deal with our slow dependencies issue smoothly.

​

### **Getting dependencies to participate in health checks**
Kafka and many other dependencies can get integrated into your applications via what is known as **Integrations**, which are nothing more than NuGet packages that wrap existing libraries while adding a few enhancements.

For instance, you get the Kafka integration by installing the **Aspire.Confluent.Kafka** NuGet package and then you can add your Kafka producer like this:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-icPcLUNDsYC2jRV7BYJZt.jpeg)

​

And your Kafka consumer with this other line:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-i6Rk3namABdqhuoqXDK1xp.jpeg)

​

However, what both those methods are doing behind the scenes (among a few other things) is getting Kafka to participate in the health checks of your application.

For curious folks, here's a small snippet of what both those methods eventually call:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-webg4KpGsmUwybJuGyakAV.jpeg)

​

So a health check for the Kafka instance is added there in such a way that it will participate in reporting the health when anybody invokes our **/health/ready** endpoint.

By the way, health for Kafka (and all dependencies) is reported in **/health/ready** because, as you saw above, we don't filter by any tag when creating that mapping.

.NET Aspire further helps you with this by providing two handy methods, **AddDefaultHealthChecks** and **MapDefaultEndpoints,** that already implement the health check registration code I showed you above:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-vEsKKZhkbxQATZqYppVGyi.jpeg)

​

All you do is call these methods from your app, and you are done!

But who calls these health endpoints?

​

### **The orchestrator**
The whole point of having those health check endpoints is so that Kubernetes, the most popular container orchestrator, can check if the containers where your microservice is running, are alive and ready to receive traffic.

And when you see that in action it is really cool. It is a key mechanism that Kubernetes will use to make sure your app is always healthy in the cloud.

But, it happens to be that .NET Aspire can also take advantage of this in the dashboard. That is why you can see these in the dashboard:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-gcxfnQF54DAK6L4sUHKiMu.jpeg)

​

Since every integration registers a health check, the dashboard is able to quickly tell you which dependencies are not ready to go.

Which is nice, but if Aspire knows this, why did it let my microservices talk to Kafka and other dependencies when they are not ready?

Well, it was a small feature gap, but things changed with Aspire 9.

​

### **Waiting for dependencies**
In Aspire 9 they added the ability for your applications to wait for their dependencies to be ready based on their registered health checks.

This is very easy to enable with the new **WaitFor** API:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-nnvpmk5LVAgjJMymAdp3oG.jpeg)

​

And, as a result, the service won't start any work that involves the dependencies until their health checks report that they are ready:


![](/assets/images/2024-11-30/4ghDFAZYvbFtvU3CTR72ZN-c4FkwRf4R2UnXuBJngw8n1.jpeg)

​

Notice how the 3 microservices remained in a **Waiting** state until Kafka and RabbitMQ finally reported a healthy status.

Nice!

​

### **Don't be fooled**
The one thing I don't really like about how the .NET team announced this new **WaitFor** API is the fact that it can make devs believe that is all they need to do to ensure the health checks are actually used when the app is deployed to the cloud.

**This is important:** **The WaitFor API will do nothing for you in the cloud. It is only meant for local development and mostly to avoid a bunch of error indicators in the dashboard.**

When you containerize your microservices and deploy them to the cloud into a Kubernetes cluster or something similar, the WaitFor API will not get deployed with it, because the AppHost is never deployed anywhere.

This means you still need to configure your Kubernetes deployments so they use the health checks in readiness probes. 

If you don't do that, then Kubernetes won't know if your app is ready to receive traffic, regardless of the status of all the dependencies.

So please be careful with that.

​

### **Wrapping Up**
I can't wait to dive more into all these fun .NET Aspire features in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp). There's so much there that it almost deserves its own course.

But, one step at a time. Let's get Course 2 ready so we have an app that is eventually worthy to deploy to the cloud, as opposed to a simple Hello World or Todo app.

Also, I'm writing this early on Thanksgiving day, so for folks in the US: 

Happy Thanksgiving!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

2. **[Browse all courses]({{ site.url }}/courses)**: Everything you need to build, deploy, and maintain production .NET applications.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.