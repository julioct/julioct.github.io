---
layout: post
title: "Events, events, events!"
date: 2024-07-27
featured-image: image.jpg
issue-number: 44
---

*Read time: 10 minutes*
​

This was both a challenging and a bit frustrating week as was trying to wrap my head around the right way to introduce **event-carried state transfer** via **Kafka** into the Game Store application I'm preparing for the upcoming [.NET Developer Bootcamp](https://juliocasal.com/courses/dotnetbootcamp).

I have already done this via RabbitMQ and Azure Service Bus in my [microservices program](https://dotnetmicroservices.com), but there are limitations that I was hoping Kafka could help address to take things to the next level in this new bootcamp.

So today I'll tell you about the scenario that I think is a perfect fit for Kafka, how it relates to even-driven microservices, and how I'm integrating all that into the bootcamp.

But first, let me tell you a bit about **.NET Aspire 8.1** and the new Keycloak support.

​

### **Keycloak support in .NET Aspire 8.1**
With .NET Aspire 8.1, which [just launched](https://devblogs.microsoft.com/dotnet/whats-new-in-aspire-8-1/), we got the **new Keycloak support** [I've been working on](https://github.com/dotnet/aspire/pull/4289) for the past couple of months. 

Here's why I thought we needed this support in .NET Aspire:

1.  <span>Keycloak is an OIDC-compliant identity provider that can easily run in your box via Docker. </span>
2.  <span>Identity, authentication, and authorization are hard. Anything we can do to simplify things for devs is a huge help.</span>
3.  <span>I don't want to have to manually start and configure my Keycloak container for local development. Lots of trial and error.</span>

I won't go deep into how to add Keycloak support to your .NET Aspire apps since there's a good article that covers it over [here](https://learn.microsoft.com/dotnet/aspire/authentication/keycloak-component). 

But, in essence, you install 2 NuGet packages (currently in preview), the first one on your AppHost project, and the second one in your ASP.NET Core API or frontend project:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-p6o7zhuRaB6FbVkHGamc4N.jpeg)

​

Then you can add the Keycloak Docker container to your **AppHost** **Program.cs** like this:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-arx8WZc4K4iVVhzMvq1Awh.jpeg)

​

After starting your .NET Aspire app, you'll get a new Keycloak endpoint in your dashboard:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-hbCnf5EqrM2MqxnRhobwg8.jpeg)

​

And, you can then browse to your endpoint (http://localhost:8080 in this case) to create and configure your Keycloak realm.

Then you can connect your API to Keycloak like this:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-a7JeDiApMky2hXQ83Fz8Y5.jpeg)

​

And you do something like this for your frontend:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-2F4PnzbQq988LYc9zuqErs.jpeg)

​

The exact options you configure in both cases will vary, but the key thing is that you don't have to waste time figuring out the Keycloak Docker image details nor how to set your Authority URL in your apps. .NET Aspire will take care of all that for you.

The curious thing is that as I start to integrate these packages into the Game Store application I'm already thinking of ways to improve the Keycloak support. So stay tuned for future updates!

​

### **Event-driven microservices via Kafka**
Here's the scenario that's been bothering me for a while:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-v2MyPqotHupHif7sQxAf5Q.jpeg)

​

Here, any time the user adds a game to the shopping cart, we send the list of items with ID, name, quantity, and prices, to the Basket microservice. 

And, when the user initiates the check-out, we create an order with the Basket items and send them, with ID, name, quantity, and prices, to the Ordering microservice. 

What's the problem there? Well, the prices! 

**Why would any of the microservices trust that the frontend will send the correct prices when the source of truth is in the Catalog microservice, where all games live?**

Never trust the frontend. Stick to the information safely stored in the backend.

So, to address this, what most folks would do is this:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-cqDiHFYLXqSePTuhSRaVq3.jpeg)

​

So now, both Basket and Ordering will make an HTTP call to the Catalog microservice to fetch the product details. 

**Bad idea!** Why?

Well because:

1.  <span>If Catalog has any sort of trouble or goes down, Basket and Ordering can't do their job.</span>
2.  <span>The more services you stand up, and that need Catalog data, the more load you put on that Catalog microservice, which can only handle so much.</span>

Essentially, the SLA of Basket and Ordering is bound to that of Catalog. 

**This is the #1 mistake people make when transitioning to microservices.**

Then, what should you do?

Decouple! And here's the key idea and where message brokers come into place:

Instead of having each microservice request data from Catalog when needed, **you let Catalog publish product events any time interesting things happen to those products.**

Something along these lines:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-3xURso9jkfxZ8YpuB5LUZT.jpeg)

​

So here, when a new game is created in the Catalog, a **GameCreated** event is published with all the product data to a message broker (Kafka here) so that Basket and Ordering can **eventually consume** it and store the new product info in their own databases.

Catalog can go down anytime, but as long as all events make their way to the message broker, Basket and Ordering will always have their updated copy of all products so they can move on just fine.

**​**

**What's the deal with that Outbox table?**

Goes back to the [dual-write problem](https://www.confluent.io/blog/dual-write-problem/), since you must make sure an event is published for every update you make to the Catalog Games table. The Outbox table and the corresponding Worker service enable the [Transactional Outbox pattern](https://microservices.io/patterns/data/transactional-outbox), which will ensure no events are left unpublished.

**​**

**Why Kafka and not RabbitMQ or something else?**

Because you want those events to persist potentially forever in the message broker, not just disappear from the queue once consumed.

Think about it. A year from now, we decide we need to stand up a new customer rewards microservice, which will also need a few details from the product catalog. 

How is customer rewards going to get an updated list of all products if it can't make HTTP calls to Catalog and all events are already gone from the message broker?

With Kafka you don't have a queue, but instead a long log of all events that happened to all products, and you can keep it there for as long as needed. A new microservice comes in, reads the entire log, and has a full copy of all product details.

Here's a code snippet on how events are produced to Kafka in the Catalog microservice **Outbox processor**:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-jdPV3biemPSUz6hgvFjteU.jpeg)

​

And here's the Basket microservice consuming the GameCreated event from Kafka via [MassTransit Riders](https://masstransit.io/documentation/concepts/riders):


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-7iBSXK6pNtopy5djV2JNjy.jpeg)

​

It did take me a while to understand how Kafka works as compared to RabbitMQ and Azure Service Bus, and how to configure it properly. But I think I got it and it works really nicely. 

Can't wait to go over all the details in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp)!

​

### **The Inventory microservice is gone**
As I was working on the updated event-driven story across the Game Store system I noticed how small the responsibility of the Inventory microservice was (keep track of game codes) and how it would need to also have its own cache of Games.

This is where you need to decide if you really need that other microservice. It will probably be needed in a much more complex system, but here I believe the scope is too small to deserve its own microservice. So I decided to tear it down and merge its endpoints into the Catalog microservice.

After this simplification and the addition of Kafka, the system looks like this now:


![](/assets/images/2024-07-27/4ghDFAZYvbFtvU3CTR72ZN-oPBPf5v2kNZiR3RJxnGNnj.jpeg)

​

Which I think is complex enough for you to get a good sense of the challenges of building a distributed system with .NET, which is one of the main goals of the bootcamp.

​

### **Book recommendation**
If you get a chance, check out this book:

[![](https://m.media-amazon.com/images/I/61FP9XBpEyL._SL1180_.jpg)](https://amzn.to/3y2RDxX)

​[Practical Event-Driven Microservices Architecture](https://amzn.to/3Woh9pp) by Hugo Filipe Oliveira Rocha.

I've been reading it for the past month to go deep into event-driven microservices, and I must admit it's a good one.

You won't find any code there, but it's compensated with tons of graphics that clearly help you get the full picture in this fascinating area. 

​

### **Closing**
As a side note, I also had to switch all entities across all microservices to use GUIDs for their IDs as opposed to integers. Not a fun change, but made many things easier across the board. I'll explain why in the bootcamp.

Can't wait to start diving into deploying this entire system to Azure very soon!

Until next time. 

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​]({{ site.url }}/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.