---
layout: post
title: "The .NET Aspire Feature I've Been Waiting For"
date: 2024-11-23
featured-image: image.jpg
issue-number: 60
---

*Read time: 10 minutes*

<div style="background-color: #eef; padding: 36px; margin: 24px 0; overflow: hidden;">
  <p><strong>The .NET Saturday is brought to you by:</strong></p>
  <p>
    <a href="https://abp.io/?utm_source=newsletter&utm_medium=affiliate&utm_campaign=juliocasal_bf24" target="_blank">ABP.IO</a> Boost your .NET projects and start your business from day one with ABP’s framework tools&templates—exclusive Black Friday deals start on 25th!
  </p>
  <p>
  <a href="https://abp.io/?utm_source=newsletter&utm_medium=affiliate&utm_campaign=juliocasal_bf24" target="_blank">Explore discounts</a>
  </p>
</div>

Given that my new bootcamp launched on the same day of the .NET Conf 2024 kickoff (what a coincidence!), I did not get a chance to see all the cool .NET announcements live. Launching a product is quite a massive challenge!

But now that the dust has settled, I got a chance to see some of the recordings, specifically the .NET Aspire 9 announcements, which, as expected, were one of the coolest parts of the event.

Unfortunately, from what I saw on the chat replay, it struck me how most of the audience has no idea what .NET Aspire is, and those who had heard about it still can't quite make sense of its place in the .NET and cloud ecosystem.

And I don't blame them. Unless you have already done some sort of cloud development with containers and something more complex than a website and a database, it's hard to understand what problem this new tech is trying to solve.

Today, I'll review just one feature of .NET Aspire that I find quite useful. Perhaps this will help you see the point of this new tech.

Let's dive in.

​

### **What is .NET Aspire?**
Here's the diagram they showed during .NET Conf, which I think summarizes pretty well what it brings to the table:


![](/assets/images/2024-11-23/4ghDFAZYvbFtvU3CTR72ZN-i6Maf3iLiYdDQJjrsaXFvh.jpeg)

​

Now, I won't even try to explain that diagram here since it would take a while and anyway I'll go deep into all that stuff in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp). 

Instead, I'll mention here what it is in terms of what it can do and what it cannot do for you:

**.NET Aspire is:**

*   <span>Designed to help you mostly during local development</span>
*   <span>A set of APIs that make it easier to work with Docker containers</span>
*   <span>A dashboard that lets you visually troubleshoot your app resources in real time</span>
*   <span>A set of NuGet packages to simplify connecting your app to external services</span>
*   <span>A tool to easily describe the structure of your system in C#</span>

**.NET Aspire is not:**

*   <span>Something that you deploy. It can help you deploy your system, but you don't deploy .NET Aspire anywhere.</span>
*   <span>A new type of architecture. Nothing in your system design changes. Aspire adds to what you already have.</span>
*   <span>Only for .NET applications. You can use it to connect your .NET app to apps running in other stacks.</span>
*   <span>A replacement to your current deployment procedures or CI/CD pipelines. You can use it exclusively for local dev and not touch your deployment if that's what you want.</span>

Now, let's talk about containers.

​

### **The beauty of containers**
Let's say you are working on a Web app that requires a bit more than a database. For instance, in the bootcamp's e-commerce app you'll need these 3 (among several others):

*   <span>PostgreSQL</span>
*   <span>Keycloak</span>
*   <span>Kafka</span>

You could install those 3 in your box, but an easier way is to just run Docker containers for all of them. 

Why use containers? Well because:

*   <span>They will each run in their own isolated environment, reducing possible conflicts between them</span>
*   <span>They will run the same way in your box, in your teammates' boxes, and in the cloud</span>
*   <span>You don't need to install anything other than Docker Desktop</span>
*   <span>You can both start them and tear them down with 1 command</span>
*   <span>You can switch the version of each of those by just picking a different tag</span>
*   <span>Once you are done with them, just remove the container, leaving nothing behind in your box</span>

Because of all those reasons (and more), any dev that tries out Docker for the first time will never come back to installing stuff into their boxes. They are so useful.

As an example, here's one way to run PostgreSQL via Docker:


![](/assets/images/2024-11-23/4ghDFAZYvbFtvU3CTR72ZN-2rSsLXjQfS1jTXFokKrF8H.jpeg)

​

That's it. You run that, and you can connect to your DB from any app or IDE in your box right away.

But, as with everything else, things can get a bit complicated.

​

### **The problem with containers**
As your application starts depending on more and more containers, you'll need to keep track of the correct set of arguments required for each of them.

Each Docker image will require a different set of environment variables, ports, volumes, and other possible configurations.

That's why they invented the Dockerfile, a simple text file where you declare all that you need, with the right set of configurations. 

For instance, here's one way to write the Dockerfile to start those 3 services I mentioned earlier:


![](/assets/images/2024-11-23/4ghDFAZYvbFtvU3CTR72ZN-aFgtHsdTZzkXeD9aCMF8LK.jpeg)

Using that Dockerfile is very useful because now all you have to do to start your containers is this:


![](/assets/images/2024-11-23/4ghDFAZYvbFtvU3CTR72ZN-6m91VuJVM6YNQeoe3VN3sV.jpeg)

​

However, how did I come up with that Dockerfile? 

Honestly, these days I would just ask ChatGPT to craft that file for me, but traditionally you have to go to the docs for each image, one by one, and learn how to craft the Dockerfile.

And, in many cases, it will require some good trial and error.

Maybe there's a better way?

​

### **Enter .NET Aspire**
For .NET developers, there is indeed a better way, and that's where .NET Aspire can help.

They came up with a way to declare which containers you need and how to start them using nothing more than Nuget packages and C# code.

Here's an equivalent to the Dockerfile I showed you above, in .NET Aspire land:


![](/assets/images/2024-11-23/4ghDFAZYvbFtvU3CTR72ZN-qPou8a2DYskwxznfqyWL99.jpeg)

​

Why is this better than the Dockerfile way? Well because:

*   <span>I don't have to learn Dockerfile language. It's just C#.</span>
*   <span>It is shorter and intuitive.</span>
*   <span>I don't have to remember how to configure each container. It uses opinionated defaults for env vars, volumes, ports, and more.</span>
*   <span>The containers are now part of my application model so that my app can declare what services it depends on.</span>
*   <span>.NET Aspire starts and stops the containers for me. I don't have to run any commands outside of my .NET app.</span>

Now that last part is a very handy feature, but it also comes with a drawback.

​

### **The problem with containers in Aspire**
It's amazing that Aspire can start and stop the containers for you along with your application.

The problem is that containers don't just start in milliseconds. They can take a few seconds to do so, some of them several seconds.

For instance, here's me waiting 20+ seconds for my Kafka container to start:


![](/assets/images/2024-11-23/4ghDFAZYvbFtvU3CTR72ZN-6taixVEc2Xgemy1LespiHa.jpeg)

​

The good thing is that, as you can see, Aspire's dashboard correctly reports Kafka as an unhealthy resource until it finishes its startup sequence.

But I can't wait 20+ seconds for Kafka (and all the other resources) to be ready every time I hit F5 to run my application. 

That's a crazy waste of time, and I might as well stick to the Dockerfile, which I run once and forget about it. 

In fact, this is the reason why I stopped using Aspire for a few months. The impact on my dev inner loop is unacceptable. 

But fortunately, this issue is solved in Aspire 9.

​

### **Using persistent containers**
In Aspire 9 you can finally express your desire to keep containers running even after stopping your application. That way you don't have to restart them every single time.

And it's very simple to do so. For instance, here's how I can solve my Kafka problem:


![](/assets/images/2024-11-23/4ghDFAZYvbFtvU3CTR72ZN-i1LkPXGJ1unugqqXuSPzMS.jpeg)

​

Now when I stop my Aspire application, the container remains there:


![](/assets/images/2024-11-23/4ghDFAZYvbFtvU3CTR72ZN-3kdyyuqVNHqByLst7EvGhc.jpeg)

​

And when I restart the app, the container is ready to go immediately, no 20+ seconds waiting:


![](/assets/images/2024-11-23/4ghDFAZYvbFtvU3CTR72ZN-s4qJP7JF4BRiFrMgc3hyQ.jpeg)

​

This is the feature I was waiting for, and it's a game changer, finally beating what I could do with a Dockerfile before.

Beautiful!

​

### **Wrapping up**
I hope this helps shine a light on how .NET Aspire is trying to help you if you are building the kind of systems it is designed for.

There's a lot more baked into this new tech, and I can't wait to go through all of that in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp).

Talking about that, it's time to go back to recording Course 2, which is going a bit slow due to holiday trips. But we'll get there.

Until next time!

---


<br/>


**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: Everything you need to build production-ready .NET applications for the Azure cloud at scale.

2. **[Ultimate C# Unit Testing Bundle]({{ site.url }}/courses/unittesting-bundle)**: A complete beginner to advanced C# unit testing package to write high-quality C# code and ship real-world applications faster and with high confidence.

3. **[Promote yourself to 20,000+ subscribers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.