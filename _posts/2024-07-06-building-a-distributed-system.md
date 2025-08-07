---
layout: post
title: "Building a distributed system"
date: 2024-07-06
featured-image: image.jpg
issue-number: 41
---

*Read time: 8 minutes*
​

I hope you have been enjoying the newsletter issues so far, but starting today I'm switching to a different format. 

No more tutorial-like issues since they take more time to make than I can afford these days. Also, this and future newsletter issues will no longer get published on my site but will only arrive by email. 

From here on I'll use the weekly newsletter to tell you about anything interesting I've been working on so hopefully you can learn from my learnings.

So, what have I been working on?

​

### **A new .NET bootcamp**
For my upcoming .NET Bootcamp, I was originally thinking of creating an updated version of the PlayEconomy system I built for the [.NET Microservices program](https://dotnetmicroservices.com/).

However, many of you told me you'd prefer to see how to go from the small CRUD-based system I cover in my [.NET REST API Essentials](https://juliocasal.com/courses/dotnet-restapi-essentials) and [Blazor Essentials](https://juliocasal.com/courses/blazor-essentials) courses and take them into a full-blown e-commerce system.

So I took on the challenge and I've been building this new system for the last two months or so.


![](/assets/images/2024-07-06/4ghDFAZYvbFtvU3CTR72ZN-vkhTP2ek69C47YSKYA7AFx.jpeg)

​

As I build this I've been diving into a crazy amount of new tech, patterns, and challenges that I had not faced even in the PlayEconomy system, which has been lots of fun and frustrating at times, but very rewarding in the end.

This is why I always tell folks that the best way to learn tech is to build something, end to end. Learn, fail, learn more, fail more, and you'll end up with tons of new skills that you can't get from just reading books/tutorials or watching videos.

​

### **The new e-commerce system so far**
The new Game Store system I'm building has a few similarities to the popular [eShop Reference application](https://github.com/dotnet/eShop), which I have been exploring in-depth. 

![](https://github.com/dotnet/eShop/raw/main/img/eshop_architecture.png)
​

It's a nice reference system, and it covers many topics and patterns. But the problem is that:

*   <span>It leaves many doors opened (Where to create products? How to actually take payments? Where is the inventory? Etc, etc.)</span>
*   <span>It uses some tech/patterns just for the sake of showing off them (you don't need gRPC there)</span>
*   <span>Seems like the main focus was on migrating the older [eShopOnContainers](https://github.com/dotnet-architecture/eShopOnContainers) system to .NET Aspire, not on rethinking the system architecture itself</span>

So I've been taking several learnings from there, but I'm building a brand new system that extends my small Game Store application into an e-commerce system that uses enough tech to solve real problems.

This is how the Game Store system architecture is looking so far:


![](/assets/images/2024-07-06/4ghDFAZYvbFtvU3CTR72ZN-5oqyeyKpq9zCPX5kkm2XSg.jpeg)

​

I won't go into the details of what's going on there today (it's a lot), but I'll start diving into each piece and how they relate to each other in future newsletter issues.

As usual, my focus will be on the .NET backend, but I strongly believe you can't build a backend without a meaningful frontend. After all, the main purpose of a backend is to serve the needs of some sort of frontend, right?

So I've been upgrading the Blazor frontend presented in [Blazor Essentials](https://juliocasal.com/courses/blazor-essentials) to enable the multiple e-commerce scenarios that the backend is meant to support.

I'm not good at frontend stuff, so I looked for inspiration at a few actual game stores like these:


![](/assets/images/2024-07-06/4ghDFAZYvbFtvU3CTR72ZN-w35QrKisT56KfqRD62jKWR.jpeg)

​


![](/assets/images/2024-07-06/4ghDFAZYvbFtvU3CTR72ZN-G8qBzD4V265zyNtDwHfD3.jpeg)

​


![](/assets/images/2024-07-06/4ghDFAZYvbFtvU3CTR72ZN-dHbxjgu3iV3sJuQMEg3U9v.jpeg)

​

And, so far, with lots of help from ChatGPT and Copilot, I have come up with this:


![](/assets/images/2024-07-06/4ghDFAZYvbFtvU3CTR72ZN-udvPNkbWRwjbJ4aSAchRXA.jpeg)

​

It's 95% Blazor Static SSR, with a few sprinkles of WASM in essential places. I'll dive more into this one too in future issues.

Here's also a sneak peek of the current source code structure:


![](/assets/images/2024-07-06/4ghDFAZYvbFtvU3CTR72ZN-g3sFWGjdVWUPeAQE124inF.jpeg)

​

That structure will most certainly change dramatically once I get all user scenarios complete and start moving to a proper microservices code structure, where each microservice lives in its own repo.

​

### **Current progress and where I am today**
I have the following scenarios working currently:

*   <span>Game catalog management, with search and pagination</span>
*   <span>Product image upload and display</span>
*   <span>Storefront games display (also with search and pagination)</span>
*   <span>Authentication and authorization via Keycloak (OIDC)</span>
*   <span>Shopping cart </span>
*   <span>Checkout with Stripe integration for payments</span>
*   <span>Order creation and management</span>
*   <span>Order workflow orchestration via a saga</span>
*   <span>Game codes inventory management</span>
*   <span>Automatic refund due to out-of-stock (compensating transaction)</span>

​

Works pretty well, but I'm looking into switching from [Stripe Checkout](https://stripe.com/payments/checkout) to [Stripe Elements](https://stripe.com/payments/elements), which I think is a much nicer integration, especially given all the microservice interactions we have to account for in the backend.

And, beyond that, I still need to figure out:

*   <span>The right time to clear the shopping basket</span>
*   <span>How to notify the customer of their order completion</span>
*   <span>Adding external auth providers (maybe)</span>
*   <span>How to liberate data across microservices</span>
*   <span>API gateway integration</span>
*   <span>Caching and CDN</span>
*   <span>Azure deployment</span>
*   <span>Integration testing</span>
*   <span>CI/CD via Azure DevOps</span>
*   <span>Observability</span>

​

So, lots of exciting learnings to come.

But there's one more thing I've been working on.

​

### **.NET Aspire Keycloak component**
The entire system is connected and orchestrated via [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview). And, as I tried to integrate Keycloak, which is used for OIDC, I noticed there's no Keycloak support in Aspire yet.

So I built my own Keycloak component by learning from a few examples I found on the web. Later, I decided to contribute what I got to the actual .NET Aspire project (because why not) and I've been working on [this PR](https://github.com/dotnet/aspire/pull/4289) for the last month or so.


![](/assets/images/2024-07-06/4ghDFAZYvbFtvU3CTR72ZN-vtN4vJv2u7bH9XumrC2XQ7.jpeg)

​

I must confess I completely underestimated how much work it would take to drive this to the finish line, given the tons of feedback I got from several members of the ASP.NET team.

In fact, I'm still working on a few more comments. It's a bit frustrating since the component works just fine already, but, as usual, PR comments are an amazing way to learn and grow, especially when they come from the awesome ASP.NET team.

​

### **Closing**
So that will do it for today's update. Let me know if you have any feedback on what I'm trying to build there and things I might be missing.

Until next week! 

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​]({{ site.url }}/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.