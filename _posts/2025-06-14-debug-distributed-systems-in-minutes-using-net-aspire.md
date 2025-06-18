---
layout: post
title: "Debug Distributed Systems in Minutes Using .NET Aspire"
date: 2025-06-14
featured-image: 2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-vQim7C2orijbQnpeLZi3oZ.jpeg
issue-number: 89
---

*Read time: 10 minutes*

<div style="background: linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%); padding: 36px; margin: 24px 0; overflow: hidden; border-radius: 14px; box-shadow: 0 2px 12px rgba(80,120,200,0.08);">
  <p style="text-align: center; font-weight: bold; font-size: 1.2em; margin-bottom: 18px; letter-spacing: 0.5px;">The .NET Saturday is brought to you by:</p>
  <p style="text-align: center; max-width: 600px; margin: 0 auto 18px auto;"><strong>Good news for VS Code users:</strong> You can now enjoy all the benefits of JetBrains ReSharper!</p>
  <div style="display: flex; justify-content: center;">
    <a href="https://jb.gg/rs-vsc-net-saturday" target="_blank" style="background: linear-gradient(90deg, #4f8cff 0%, #235390 100%); color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1em; box-shadow: 0 2px 8px rgba(80,120,200,0.10); transition: background 0.2s; text-align: center;">Join the preview!</a>
  </div>
</div>

**Debugging distributed systems is a nightmare.**

You know the drill. Everything works fine in isolation, but put all the pieces together, and suddenly your microservices start misbehaving in ways that make no sense.

The logs are scattered. The database shows the data is there. But somehow, somewhere in that web of HTTP calls and cache layers, something is going wrong.

I've been there more times than I care to admit. Spending hours trying to piece together what's happening across multiple services.

That's where .NET Aspire's observability features become a game-changer.

Instead of hunting through log files, you get a clear, visual representation of exactly what's happening. You can trace requests across services and spot issues that would take hours to diagnose.

Today, I'll walk you through a real-world debugging scenario that shows you exactly how powerful this approach can be.

Let's dive in.

​

### **Something is broken**
Let's say we have recently enabled a new feature on our website that allows customers to submit reviews for the games they have purchased from our store.

However, just after launching a new game, the Product team reaches out to us, Engineering, with a concerning complaint:

*Reviews are broken. Customers can’t see their reviews after submitting. That’s broken, right?*

The UX folks investigate a bit and can confirm that the front-end is making the correct REST call to our backend API, and getting a successful response:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-3yUm86myK8iUv1FsfwYaSu.jpeg)

​

However, when the front-end sends a GET request to retrieve reviews, the new review won't show up:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-e7R1SaTtxxhff8pnikLh7M.jpeg)

​

So now it's up to us, the back-end team, to investigate the issue, with the main concern being losing the valuable customer reviews, which should be safely stored in the database.

We do a quick check on the Production database, and can confirm that all the latest reviews are there.

Great!

However, our back-end API won't show the latest ones, or at least not immediately after they are created.

What's going on?

​

### **Visualizing the back-end system**
Fortunately, we recently onboarded to .NET Aspire, so standing up the entire back-end system in our local box is pretty straightforward.

After opening the repo and running the Aspire application, we land on the dashboard, where we can get a quick view of all the pieces involved in our .NET backend:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-8Fu4NRj4L3ty9aUUPRL99D.jpeg)

​

As you can see there, the graph also helps us visualize that the Reviews API has a direct connection with 3 services:

*   <span>A PostgreSQL database</span>
*   <span>A Redis cache</span>
*   <span>A RabbitMQ message broker</span>

Great, now let's try to get a local repro.

​

### **Get a local repro**
We'll start by getting all the reviews for a specific game we just created in our local environment. 

Let's grab the Reviews API endpoint from the resources table:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-9SwxMQnhxrkbXN5yCUeXKv.jpeg)

​

And send a GET request:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-ooNbNBW817Q8XSL6p2Lkus.jpeg)

![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-gfLTmiCGYSoGuzNRPgww9o.jpeg)

​

No reviews, as expected. Now let's create our first review:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-hPXe9kwKFC1FTJSTMiv1qA.jpeg)

​


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-w5J96uo1tshJ8bVVLNFP5m.jpeg)

​

Great, review created. Now let's query all reviews again:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-ooNbNBW817Q8XSL6p2Lkus.jpeg)

![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-gfLTmiCGYSoGuzNRPgww9o.jpeg)

​

No reviews.

**The good news is that we have our local repro. A huge win!**

The bad news is that we still don't know what's going on.

Let's investigate further.

​

### **Tracing the issue**
Since we know our API is connected to a few external components, let's get a better view of how they collaborate when processing our requests.

For this, we can use the Dashboard's Trace view:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-vQim7C2orijbQnpeLZi3oZ.jpeg)

​

We see 3 requests there:

1.  <span>The initial GET for all reviews</span>
2.  <span>The POST to create the new review</span>
3.  <span>The final GET for all reviews</span>

What calls my attention right away is how Redis shows up right before we reach the PostgreSQL database on the GET requests. 

In fact, Redis is the only thing the API talks to in our final GET request.

However, I don't see Redis involved at all during the POST request trace. 

Opening up that first GET request, we can see this:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-ehv4SbDG6a1GpLNEHw3Qqe.jpeg)

​

So seems like it goes like this:

1.  <span>We try to get the reviews from Redis</span>
2.  <span>If we can't, we get the data from PostgreSQL</span>
3.  <span>We set whatever we found in Redis</span>

Now, for the POST request, we see this:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-cDj8zqQR4RGkxnmSzLc8TG.jpeg)

​

In this case:

1.  <span>We connect to RabbitMQ</span>
2.  <span>We save the review in the PostgreSQL DB</span>
3.  <span>We send a message to RabbitMQ</span>

That sounds fairly logical. However, it looks like we do nothing about Redis during this POST call.

If that's the case, when will the Redis cache get updated with our brand new game?

I think we are into something. Time to dive into the code.

​

### **Understanding the root cause**
Let's open up our C# code and inspect first the logic behind our GET endpoint:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-v96boUh36AaFWdEMmN23Gk.jpeg)

​

As expected, we check the Redis cache first, query the DB if we find nothing, and finally set whatever we got as our new cache entry, which will expire in 15 minutes.

Now for the POST endpoint:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-d4SaZWCCA5kJNM8oHvTNtt.jpeg)

​

Again, just as we saw in the dashboard trace, we store the review in the DB, publish a message, and return.

But here's the issue: 

**We are never invalidating that cache after creating new reviews, so the GET endpoint will keep retrieving old cache entries for at least 15 minutes.**

Let's fix this.

​

### **The fix**
Now that we understand what's going on, the fix is fairly straightforward:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-3WC2wUZsXvq16xkbBW8ZZw.jpeg)

​

Now, after saving the review to the DB and publishing that message, we will also invalidate the cache of reviews for the specified game.

This should result in the GET endpoint returning all reviews for a game right after it receives any new review.

Let's confirm the fix.

​

### **Verifying the fix**
Let's start our .NET Aspire app again and run our repro steps:

1.  <span>Get all reviews</span>
2.  <span>Create a new review</span>
3.  <span>Get all reviews again</span>



![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-pCoj1FcrEnM6M92uDvEVBX.jpeg)

​

Success! 

And we can even confirm things look good on the tracing side:


![](/assets/images/2025-06-14/4ghDFAZYvbFtvU3CTR72ZN-7eRWKtk2iNnDQoB2HxwUHq.jpeg)

​

Mission accomplished!

​

### **Wrapping Up**
**This is why I love .NET Aspire's observability features.**

What could have been hours of log diving turned into a 15-minute debugging session. The visual tracing made it immediately obvious where the issue was.

Cache invalidation bugs are notoriously tricky to spot in distributed systems. Without proper observability, you're flying blind.

The best part? This level of observability comes out of the box with .NET Aspire. No complex setup required.

**Just run your app and start debugging like a pro.**

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: Everything you need to build production-ready .NET applications for the Azure cloud at scale.

2. **​[Patreon Community](https://www.patreon.com/juliocasal){:target="_blank"}**: Get the full working code from this newsletter, exclusive course discounts, and access to a private community for .NET developers.

3. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.