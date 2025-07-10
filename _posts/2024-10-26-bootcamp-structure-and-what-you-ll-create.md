---
layout: post
title: "Bootcamp structure and what you'll create"
date: 2024-10-26
featured-image: image.jpg
issue-number: 56
---

*Read time: 8 minutes*
​

After a few hours of the usual dev machine prep and last-minute slide deck updates, the recording phase of the upcoming [bootcamp](https://juliocasal.com/courses/dotnetbootcamp) is now going at full speed, with 4 modules of the first course all done, and 5 more modules to go.

Also, I'm usually too optimistic about release dates, so I took a small break today to create a proper release calendar for the first two courses (out of 9). The launch date is now all set and I'll share all the details with you in next week's newsletter.

But just so that you are well informed, I'll dedicate this and the next 2 newsletters to give you all the details on how the bootcamp is structured, what you'll build across the included 9 courses, pricing, and why this bootcamp is different than anything else out there.

Today I'll start by going over the bootcamp structure and the application you'll build on each stage.

Let's dive in.


![](/assets/images/2024-10-26/4ghDFAZYvbFtvU3CTR72ZN-f8QPwJ4QVUip3p4jmA3C9u.jpeg)

​

### **Bootcamp structure**
The point of this bootcamp is to turn any C# developer into a senior .NET cloud developer. To get there, you need to cover a lot of ground, as I described [here](https://juliocasal.com/blog/How-To-Become-A-Senior-Dotnet-Backend-Developer), so after several iterations, I landed on the following learning path:


![](/assets/images/2024-10-26/4ghDFAZYvbFtvU3CTR72ZN-eQmNEbW535gxNfQw1qg4XN.jpeg)

Each stage includes 3 full courses that go from the absolute fundamentals to the more advanced topics that senior devs have to deal with on real-world projects.

Each course builds on what you learned in the previous one and also incrementally improves a single e-commerce application that you will build from scratch, step-by-step.

Now let's go through what you will build and learn at each stage.

​

### **Stage 1: Master ASP.NET Core**
ASP.NET Core is .NET's Web platform and I believe the first step for any aspiring .NET Cloud developer is mastering this platform from the most fundamental building blocks to everything related to securing those web apps.


![](/assets/images/2024-10-26/4ghDFAZYvbFtvU3CTR72ZN-QiwDKWfBNCPf22e1C947D.jpeg)

​

So in this stage, you will create your first ASP.NET Core backend API, from scratch, and you will end up with a fully working back-end that can securely provide data and services for a modern front-end.

I won't go into the specific topics to be covered in each course here, but by the end of the 3 courses on this stage, you will know:

*   <span>How to implement a REST API with ASP.NET Core</span>
*   <span>How to organize your code using Vertical Slice Architecture</span>
*   <span>How to store data in a simple SQLite database via Entity Framework Core</span>
*   <span>How to use middleware and handle errors globally</span>
*   <span>How to do pagination and basic search</span>
*   <span>How to allow uploading files to your backend</span>
*   <span>How to enable authentication and authorization</span>
*   <span>How to manage users and roles locally via Keycloak</span>
*   <span>How to use OpenID Connect via Keycloak to secure your backend</span>

I'm even including a mini crash course on Docker here for those of you new to the topic.

And, as will all my courses, I'll include a pre-built front-end application that you can connect to your back-end to see the entire thing working end to end.

Even if you decide to not move forward with anything else in the bootcamp, at this point you are essentially a Junior .NET Backend developer, ready to take on any .NET backend development task.

​

### **Stage 2: The cloud & testing**
Stage 2 is my favorite since this is where your app becomes real by reaching a public cloud environment and integrating with multiple production-ready external services.


![](/assets/images/2024-10-26/4ghDFAZYvbFtvU3CTR72ZN-eVyAEHBqDvk4k5uMH9eYPf.jpeg)

​

Specifically, the three courses in this stage will give you hands-on experience with:

*   <span>Using PostgreSQL as a production-ready database</span>
*   <span>Managing users and securing your app via Entra ID (aka, Azure AD)</span>
*   <span>Turning your app into a Docker image and deploying it to Azure Container Apps</span>
*   <span>Using the new .NET Aspire stack for a simpler cloud development workflow</span>
*   <span>Uploading files to Azure storage</span>
*   <span>Using Key Vault and Managed Identities</span>
*   <span>Using Infrastructure as Code (IaC) via Bicep</span>
*   <span>Enabling payments via Stripe</span>
*   <span>Adding integration tests to verify the system</span>

It is incredibly exciting to see your app up and running in the cloud, and I believe that this is the point where you start transitioning from junior level to senior level since a cloud environment is a completely different beast than your local dev box, and there are many skills to master along the way.

So, at the end of this stage, you will be ready to build and contribute to most small to mid-size .NET monolithic apps out there. 

You can end your journey here, but some of you may need to go beyond this point given the challenges of building systems at scale.

That's where Stage 3 comes in.

​

### **Stage 3: Building systems at scale**
If your team starts growing significantly, and suddenly you have dozens of devs or teams contributing to the same monolithic system, and the entire release process starts slowing down, you need to go beyond .NET and cloud development.


![](/assets/images/2024-10-26/4ghDFAZYvbFtvU3CTR72ZN-obw3tdjmC21MYnczqkmZjf.jpeg)

​

In the third stage of this bootcamp, you will learn how to build systems at scale by learning how to introduce DevOps, microservices, and popular observability tools to your development process.

Specifically, in this stage, you will get answers to these questions:

*   <span>When, why and how to switch from a monolithic architecture to a microservices architecture</span>
*   <span>How to share data across microservices via message brokers</span>
*   <span>How to use background workers to process long-running tasks</span>
*   <span>How to use NoSQL databases</span>
*   <span>How to add and configure an API gateway</span>
*   <span>How to build a complete CI/CD pipeline for fully automated verifications and deployments</span>
*   <span>How to enable and use logging, monitoring, and distributed tracing in your Azure deployed application</span>

Now, let me be clear: you don't need to get this far to work as a .NET backend/cloud developer. Most .NET devs should be good to go after completing Stage 2.

Only a few of you work in teams that are big enough to demand the skills and techniques covered in Stage 3. And, it turns out this is the stage at which I worked for years at Microsoft, using the same techniques and similar tools, so I both feel very qualified and really excited to prepare the 3 courses in this last stage.

​

### **What this bootcamp is not about**
Because I know some of you will ask, and to set clear expectations, here are the things that will NOT be covered anywhere in the bootcamp:

*   <span>C# fundamentals</span>
*   <span>Clean/hexagonal/onion architecture</span>
*   <span>Modular monolith</span>
*   <span>CQRS</span>
*   <span>DDD</span>
*   <span>MediatR</span>
*   <span>AutoMapper</span>

Out of all of those, the only thing you actually need for the job is some good C# fundamentals and there is already great [free C# training out there](https://dotnet.microsoft.com/learn/csharp).

I would have loved to also include some good GraphQL and gRPC content in the bootcamp, but could not make it. Maybe another time.

​

### **Your thoughts?**
I would love to know of any feedback you might have on the topics I covered above. 

Is there anything that you are really looking forward to learning across the bootcamp? Is there something you wish was included there and seems missing?

Please let me know!

Next week: the release schedule and how to purchase.

Until then!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

2. **[Browse all courses]({{ site.url }}/courses)**: Everything you need to build, deploy, and maintain production .NET applications.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.