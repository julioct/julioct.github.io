---
layout: post
title: "How to Add Custom Commands to the .NET Aspire Dashboard"
date: 2025-06-21
featured-image: 2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-ax9GcW4qbb89qtKmGco14h.jpeg
issue-number: 90
---

*Read time: 8 minutes*
​

One of the things I love most about .NET Aspire's dashboard is how it gives you a unified view of your entire distributed system without jumping between different tools and UIs.

But here's the thing: while the built-in commands are great for basic operations, there are times when you need something more specific to your workflow.

Today, I'll show you **how to add custom commands to any resource in your .NET Aspire dashboard.**

It's simpler than you might think, and once you see how it works, you'll probably start thinking of a dozen ways to streamline your own development process.

Let's dive in.

​

### **Starting fresh with RabbitMQ**
Let's say we recently found a small bug in our event-driven system that was preventing our notifications service from consuming messages from our RabbitMQ queue.

Using the great tracing capabilities of .NET Aspire that I mentioned [last week]({{ site.url }}/blog/debug-distributed-systems-in-minutes-using-net-aspire), we were able to come up with a quick fix, and now we are ready to run a few initial manual tests.

However, before testing the updated notifications service, let's enable RabbitMQ's Management Plugin in our AppHost Program.cs file so we can peek into the queue and see the queue status:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-enj565G2HHT9hn2JYLEtWM.jpeg)

​

With that, .NET Aspire's dashboard will give us a link to get to RabbitMQ's management portal easily:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-3Gh97Rvaqjs42VJJpQMJt3.jpeg)

​

And once in RabbitMQ's portal, I can tell that there are already a bunch of messages waiting in my queue:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-vgaQDngpoM1fUrc69QSQdK.jpeg)

​

I don't want to test my notifications service bug fix with 10 messages already there.

A simple scenario to test first is starting with an empty queue and then publishing just 1 message to see if my service can process it.

I could clear the queue from RabbitMQ's portal, but jumping to that portal from my dashboard just to clear the queue eventually becomes a bit time-consuming.

Let's find a better way.

​

### **Implementing a custom resource command**
A fairly recent feature of .NET Aspire's dashboard is the ability to customize the commands associated with any of your resources.

In our case, one thing we can do is implement a custom command to clear all the queues in our RabbitMQ instance, which will save us the trip to RabbitMQ's portal.

We could implement this right into our AppHost Program.cs file, but it's probably better to spin up a new extensions class with all the required logic.

Let's start by defining our new extensions class and method:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-4iPdtc2o2gL8ivrVPwtcmN.jpeg)

​

You can call **WithCommand** on any of your resources. You just need to know the type of the resource, which is **RabbitMQServerResource** here.

The **name** and **displayName** properties are pretty obvious, but notice how you can also customize the icon to show on the dashboard via the **CommandOptions** parameter.

Now let's implement the logic that will handle our new command.

​

### **Clearing RabbitMQ queues via the API**
RabbitMQ exposes several management APIs you can use to programatically do what you normally achieve via its management portal.

For our purposes, we want to use the queues API to do essentially 2 things:

1.  <span>Get the list of all available queues</span>
2.  <span>Clear all the found queues</span>

Let's implement that in our new **OnPurgeAllQueuesCommandAsync** method:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-fpSKDwh2wzXWBaVGkdTKwN.jpeg)

​

The code looks a bit long, but it's pretty straightforward. The main things to call out are:

1.  <span>We don't need to hard-code either the endpoint or credentials for the command to talk to RabbitMQ. We can read those directly from the RabbitMQ resource.</span>
2.  <span>Any failures can be reported back to the dashboard via the **CommandResults.Failure** method.</span>

We can now use this method in the executeCommand parameter of our **WithCommand** call:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-4d16r9bwFLGQTTNpvAxNef.jpeg)

​

Technically, that's all you need to make the command work, but there's one more thing that can further improve the experience.

​

### **Reporting the command state**
Your custom command may not work properly until your resource has been fully provisioned by .NET Aspire.

And since every resource is able to report its health status, you can take advantage of it by implementing a small method that decides if the command should be enabled or disabled based on resource health:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-jpUecQXkZP1i8GDd2DS5uv.jpeg)

​

Then just assign that method to the **UpdateState** property of **CommandOptions**:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-6WAFWnW8X1sHvDgS2uz5f1.jpeg)

​

Our new extension method is ready. Now let's hook it up to the rest of the app model.

​

### **Using the custom command**
To start using our new command, all we do is chain a call to the new extension method in the block where we add RabbitMQ to the app model:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-vCcn4DYcLXtEgN1Y1rz5v.jpeg)

​

Now let's run the Aspire app and refresh the dashboard:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-rdrKqzCmcLZVw6vibzCKcS.jpeg)

​

The new **Clear ALL queues** command sits right there, next to the built-in commands, but will remain grayed out until RabbitMQ completes its initialization.

A few seconds later, as the RabbitMQ resource reports healthy, the command lights up:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-ax9GcW4qbb89qtKmGco14h.jpeg)

​

Clicking on it will execute all our queue cleanup logic and, if there were no issues, will come back with a successful message:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-vaCWQtRpnK6iJvZktvMiVQ.jpeg)

​

And a quick check on our RabbitMQ portal will confirm that the queue is empty now:


![](/assets/images/2025-06-21/4ghDFAZYvbFtvU3CTR72ZN-mkTSvmBaLB358nwJP66AT9.jpeg)

​

Now any time we need to test fixes to our notifications service we have an easy way to start clean right from our familiar Aspire dashboard.

Mission accomplished!

​

### **Wrapping Up**
What started as a simple need to clear RabbitMQ queues turned into a powerful way to extend the .NET Aspire dashboard with exactly the functionality we need.

The beauty of custom commands is that they're not limited to RabbitMQ. You can add them to any resource in your application model.

**The key insight is that .NET Aspire gives you the building blocks to create the exact developer experience your team needs.**

No more context switching between different tools and UIs just to perform common development tasks.

Once you start thinking this way, you'll probably find dozens of opportunities to streamline your own development workflows.

<br/>

### **Last Bootcamp Sale Ends Tomorrow**
Tomorrow at midnight is the last chance to get the **.NET Cloud Developer Bootcamp**. After that, the 5 included courses will only be available individually.

If you've been thinking about diving deeper into building real-world .NET apps for Azure, using containers and .NET Aspire, now's the time.

The bootcamp covers everything from ASP.NET Core fundamentals to deploying production applications to Azure with .NET Aspire — exactly the kind of skills that make you valuable to any team building modern .NET systems.

**​[Join the .NET Cloud Developer Bootcamp here]({{ site.url }}/courses/dotnetbootcamp)​**

P.S. The first 100 people also get 2 exclusive bonuses (Building Microservices with .NET + Q&A session with me). Those bonus spots are filling up quickly.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.