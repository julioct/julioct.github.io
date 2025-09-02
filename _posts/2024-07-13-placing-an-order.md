---
layout: post
title: "Placing an order"
date: 2024-07-13
featured-image: image.jpg
issue-number: 42
---

*Read time: 7 minutes*
​

This week we almost reached 100**°**F here in sunny Redmond, just a few mins from Cloud City (Seattle). So it's been quite a challenge to keep coding on my small home office with zero windows or A/C (although the fan is now in place :)).

Fortunately, this past Sunday we got a chance to escape the sun for a few hours at the [Distant Worlds](https://ffdistantworlds.com) concert, Seattle edition, with great A/C. And it was marvelous.

Now, on to this week's update.


![](/assets/images/2024-07-13/-wp-content-uploads-2024-07-Final-Fantasy_7797.jpg.jpeg)

​

### **Stripe Elements + Blazor**
Soon after sending last week's newsletter, I started the migration from [Stripe Checkout](https://stripe.com/payments/checkout) to [Stripe Elements](https://stripe.com/payments/elements) which, as I was expecting, enabled a nicer experience by hosting the payment form directly in the frontend, and not on an external site.

Took me a while to make it work since I was not able to find almost any existing sample of an Stripe Elements + Blazor integration. In fact, I almost gave up, since Stripe Elements relies heavily on running JavaScript when your page loads, and making that work in a Blazor Static SSR component is quite a challenge.


![](/assets/images/2024-07-13/4ghDFAZYvbFtvU3CTR72ZN-qykjt6uVCxnopFPsiXHpR5.jpeg)

One of the principles I'm following across the entire frontend is to not enable any sort of Blazor interactive mode (Server or WASM) unless it is absolutely necessary. However, this was the one scenario where I did have to bring in interactivity, and using WASM made it all work very nicely.

But all of that stuff is not as interesting as what happens when you click that big blue **Place Order** button.

​

### **Processing an order in a distributed system**
The biggest achievement this week is the completion of the core scenario in the upcoming .NET Bootcamp**: order processing.** For a happy path scenario, things go more or less like this at a high level:


![](/assets/images/2024-07-13/4ghDFAZYvbFtvU3CTR72ZN-qgSCCJfCph45pgBiH4x6Bi.jpeg)

​

Each green hexagon there is a microservice designed to deal with one piece of the process, and there are no synchronous http calls between them. All inter-service communication is asynchronous via RabbitMQ to avoid coupling.

Also, the entire thing is coordinated by an orchestrated saga powered by MassTransit, RabbitMQ and Entity Framework Core.

I learned a couple of cool things while building this saga:

**1. You can attach the Order entity to the saga state machine**

This is very powerful because by having the Order object in the saga state like this:


![](/assets/images/2024-07-13/4ghDFAZYvbFtvU3CTR72ZN-xzWVDhbLCGy8xEfWnxU16f.jpeg)

​

...you can directly set Order properties at the different saga stages:


![](/assets/images/2024-07-13/4ghDFAZYvbFtvU3CTR72ZN-nBetwpE7FigpC3ics9Anm.jpeg)

​

And, MassTransit will handle storing the Order along with the saga state in a single EF Core transaction!

​

**2. The built-in EF Core transactional outbox rocks!**

You should be very aware of the [dual-write problem](https://www.confluent.io/blog/dual-write-problem/) as you design your saga or any time you publish messages and save state to your DB in any of your microservices.

Like here in this Inventory microservice scenario, where we are assigning digital game codes for the customer's order:


![](/assets/images/2024-07-13/4ghDFAZYvbFtvU3CTR72ZN-npbeWLttoS152Uws7YvkLR.jpeg)

​

We have to both save that change to the Inventory DB and publish a GameCodesAssigned message so the saga can continue.

But what if we publish the message but we fail to save changes to the DB? Maybe we flip the order and to SaveChangesAsync first? But what if SaveChangesAsync succeeds and we fail to publish the message?

That's where you need a [Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox), which takes care of making sure either both operations happen or none of them do.

And it happens to be that MassTransit has a built-in transactional outbox for EF Core, which is super easy to enable:


![](/assets/images/2024-07-13/4ghDFAZYvbFtvU3CTR72ZN-8MW2EbYgrzPFcwNgLnvuuC.jpeg)

​

No need to write your own transactional outbox, which is really nice.

And, with that, the most interesting scenario in the bootcamp is functionally complete, and the whole process takes just a second or two (at least in my box), so it's pretty fast.

Also, with the introduction of the Notifications microservice, this is how the system is looking like at this point:


![](/assets/images/2024-07-13/4ghDFAZYvbFtvU3CTR72ZN-x7btZkB1VvLf57JFcf3yJu.jpeg)

​

### **Adding Stripe to the Aspire orchestration**
This week I also got pretty tired of running the Stripe CLI in my box any time I wanted to test their webhooks. It is via a webhook that Stripe tells you if the payment succeeded or not, so you have to run something in your box to listen to those.

I eventually figured I could just run the Stripe CLI container in my Aspire orchestration to automate everything. It was a bit tricky, but doable:


![](/assets/images/2024-07-13/4ghDFAZYvbFtvU3CTR72ZN-wiZmxpBjjc59Cf9E2bPnr3.jpeg)

​

Understanding the need for that **ReferenceExpression** was super frustrating, but when you get how Aspire works (thanks to my side adventure on [this Aspire PR](https://github.com/dotnet/aspire/pull/4289)) it makes total sense.

​

### **What's next?**
A few things top of mind at this point:

1.  <span>Each microservice must be moved to its own repo, but how to make a multi-repo approach work with Aspire? </span>
2.  <span>The system is heavily coupled to Keycloak at this point. How to keep the door open so we can later integrate other identity providers like Entra ID?</span>
3.  <span>Multiple microservices currently rely on receiving full product information (including prices) in either the HTTP request or a queue message. How to let them have access to updated product info from the Catalog microservice without having them make HTTP requests to it? </span>
4.  <span>The frontend is currently directly talking to each microservice. We need to add an API gateway there and hopefully offload authentication to it. </span>

Looking forward to solving all those in the next few days.

Until next week!

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.