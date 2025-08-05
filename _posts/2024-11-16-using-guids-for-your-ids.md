---
layout: post
title: "Using GUIDs for your IDs"
date: 2024-11-16
featured-image: image.jpg
issue-number: 59
---

*Read time: 9 minutes*
<div style="background-color: #eef; padding: 36px; margin: 24px 0; overflow: hidden;">
  <p><strong>The .NET Saturday is brought to you by:</strong></p>
  <p>
Grow into a better developer with Rider! The most loved .NET and game dev IDE is now free for non-commercial development. 
  </p>
  <p>
  <a href="https://www.jetbrains.com/rider/?utm_campaign=rider_free&utm_content=site&utm_medium=cpc&utm_source=dotnet_suturday_newsletter" target="_blank">Download Rider</a>
  </p>
</div>
​

Wow, the bootcamp launch went really well. I was expecting some excitement about becoming a .NET cloud developer, but the response has exceeded all my expectations! 

Now, one more thing that made big news this week was the release of **.NET 9**, which introduces C# 13 and several updates across the .NET Runtime/Libraries/SDK, ASP.NET Core, EF Core, .NET Aspire, and a bunch of other things.

I'm not updating the bootcamp to .NET 9 since it's an STS release (only 18 months of Microsoft support), but there are a few new features that caught my attention and that are worth preparing for when .NET 10 comes out later next year.

One of those features is the new support for UUID Version 7 when creating GUIDs. Today I'll explain why that's relevant when using GUIDs as the ID in your database tables.

Let's dive in.

​

### **The problem with DB based ID generation**
Let's say you go for a simple integer for your IDs. Like, here:


![](/assets/images/2024-11-16/4ghDFAZYvbFtvU3CTR72ZN-fhbtE8CWD76Xj6Dp1TtmDz.jpeg)

​

Then you would add a record to your DB via EF Core like this:


![](/assets/images/2024-11-16/4ghDFAZYvbFtvU3CTR72ZN-6Q71jbYix3XDdf4D2MUJwc.jpeg)

​

What about the ID? Well, by convention, whichever database provider you are using with EF Core (SQLite, SQL Server, PostgreSQL, etc) will auto-generate the ID for your record and send it along with the rest of the game info to the DB.

And, with an int, the first record will get ID=1, next one ID=2, then ID=3, etc.

What's the problem with that?

Well, arguably that approach will work OK for a simple CRUD operation that doesn't have high scalability needs, and that can happily run in a single compute node.

However, it becomes problematic when we move into more interesting scenarios, like creating a purchase order. 

The thing about taking orders in an e-commerce system is that **you have to be fast. Really fast**.

I mean, have you ever tried to buy a product or a ticket at a moment when hundreds of other people are trying to do the same, just to be faced with crazy timeout errors or crashes?

That happens because when receiving your request, such systems will immediately try to save your order into their DB, also relying on the DB to generate the order ID. 

And, doing that is expensive when you have hundreds of other requests coming into your system and trying to save stuff into the DB. The DB becomes a big bottleneck.

Because of that, you don't want to involve your DB at all when taking an order. Instead, you want to do something like this:


![](/assets/images/2024-11-16/4ghDFAZYvbFtvU3CTR72ZN-27qXJeG4qNHuz6hRurMoQU.jpeg)

​

So, all you do is create a message (CreateOrder) and publish it to a message broker like RabbitMQ or Azure Service Bus so that the message gets enqueued to be processed as soon as your separate order processing worker is ready to do so.

Now, that sounds like a clever idea, but even if we don't involve the DB here, we still need to return some ID to the client, don't we? You can't just return nothing.

What if we can create IDs without involving the DB?

​

### **Generating IDs without a DB**
Here's where GUIDs become incredibly useful. **They are universally unique and can be generated independently by any of your compute nodes without requiring communication with a central authority, like your DB.**

That means that we can easily scale the system to multiple nodes, and have each one take our orders and generate IDs independently of each other without the risk of collisions when those orders eventually make it to the DB.

So, something like this:


![](/assets/images/2024-11-16/4ghDFAZYvbFtvU3CTR72ZN-vQHWXFsgmj6nhTyEL5tu7r.jpeg)

​

We take the order, publish the message (ID included), and respond to the client immediately with that same ID.

On top of that, **GUID-based IDs are not predictable**, which can help prevent bad actors from trying to guess the IDs of orders that don't belong to them.

So, problem solved, right?

Well, almost.

​

### **The problem with GUIDs as IDs**
Nothing is perfect, and using GUIDs for your IDs, and consequently for your primary keys, has consequences:

1.  <span>**Storage overhead.** GUIDs are 16 bytes (128 bits), compared to 4 bytes for an integer. It can become an issue if you are dealing with millions of rows.</span>
2.  <span>**Index fragmentation.** Since GUIDs are random, when inserted into a relational DB, the randomness causes the column index to reorganize frequently, leading to fragmentation and reduced performance.</span>

There's not much you can do about the first problem, but there's a way to deal with the second problem.

​

### **Using time-ordered GUIDs**
RFC 9562 introduced **UUID Version 7**, designed for time-ordered UUIDs. It uses a combination of a 48-bit Unix timestamp and random bits, making them sortable by the time of generation. 

This contrasts with the traditional UUID Version 4, which is what you get when doing Guid.NewGuid(), and which is fully random and has no order.

This means that any GUIDs you generate with UUID Version 7 are naturally created in chronological order, which when inserted into your DB will directly mitigate the index fragmentation.

Using this type of GUID has already been possible for a while via MassTransit's **NewId** class, which is something I cover in detail, along with the complete distributed order creation scenario, in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp).

However, this is something you will also be able to do natively when migrating to .NET 9 via the new **Guid.CreateVersion7()** method. Something like this:


![](/assets/images/2024-11-16/4ghDFAZYvbFtvU3CTR72ZN-zEoEqP5ZuPqnB8Z5pHqJg.jpeg)

​

I tried it with a similar version of the Game class I showed earlier and a SQLite database table, and got this:


![](/assets/images/2024-11-16/4ghDFAZYvbFtvU3CTR72ZN-tToJe5umwBxafWn2BiYsuW.jpeg)

​

Notice the natural order of the first few characters in the V7 version. Nice!

I also read that the EF Core provider for PostgreSQL is adopting V7 for its auto-generated GUID primary keys, but I think it will require you to move to .NET 9.

​

### **Wrapping Up**
It's not a bad idea to spin up a little side project to try out useful new features like this. That way when .NET 10 comes out you'll have one less thing to keep track of.

Great software engineers don't just jump into new platform versions because they are shiny and new, but because they understand if it's worth upgrading given the newly introduced features.

Now, back to work. Recording of the bootcamp's course 2, ASP.NET Core Advanced, has already started!

Cheers,

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://go.dotnetacademy.io/stripe-waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.