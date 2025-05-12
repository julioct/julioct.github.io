---
layout: post
title: "How to Seed Data with EF Core 9 and .NET Aspire"
date: 2025-05-10
featured-image: 2025-05-10/4ghDFAZYvbFtvU3CTR72ZN-e5t96hDea6Vi4RjXRaFk6z.jpeg
issue-number: 84
---

*Read time: 5 minutes*
​

A few days ago, I was updating a .NET Aspire worker app that needed to seed some data on startup—just basic game genres like "Fighting" and "Roleplaying."

EF Core 9 now makes this super clean with `UseSeeding` and `UseAsyncSeeding`, so I added both to my DbContext following the official docs.

But the moment my Aspire app started and kicked off the DB migrations logic, it crashed right away with a beautiful InvalidOperationException.

Turns out EF Core 9 and .NET Aspire have a little disagreement about how and when you can modify those `DbContextOptions`.

Let me walk you through what happened—and the quick fix that made it all work.

Let’s dive in.

​

### **What the EF Core 9 docs say**
The official guidance is to configure seeding *inside* `OnConfiguring` like this:


![](/assets/images/2025-05-10/4ghDFAZYvbFtvU3CTR72ZN-e5t96hDea6Vi4RjXRaFk6z.jpeg)

​

**UseSeeding** and **UseAsyncSeeding** are called as part of EnsureCreated, Migrate and MigrateAsync methods, as well as the dotnet ef database update command. 

You don't have to come up with your own DB Seeding method or remember the right place to call it. 

But, there's a catch.

​

### **What .NET Aspire doesn’t like**
Let's say you are using a PostgreSQL database, and therefore, you use the PostgreSQL EF Core integration to register your DBContext like this:


![](/assets/images/2025-05-10/4ghDFAZYvbFtvU3CTR72ZN-4buz3qGYwAKNz3zcoF6SWY.jpeg)

​

That one-liner is super convenient since it reads the "MyDB" connection string from configuration, registers the DBContext, adds health checks, retries, and telemetry.

But it also adds one more thing automatically: **DbContext pooling**.

Pooling your DbContext is a good thing, especially in high-performance scenarios.

But when I started my app, which applies any pending migrations and runs data seeding on startup with this line:


![](/assets/images/2025-05-10/4ghDFAZYvbFtvU3CTR72ZN-94VHe14rUDJCzmRoV1sTgt.jpeg)

​

I was greeted with this beautiful exception:

**System.InvalidOperationException: 'OnConfiguring' cannot be used to modify DbContextOptions when DbContext pooling is enabled.**

What now?

​

### **Configure seeding during registration**
Instead of modifying the options in `OnConfiguring`, just pass your seeding setup into the `configureDbContextOptions` delegate of Aspire’s method:


![](/assets/images/2025-05-10/4ghDFAZYvbFtvU3CTR72ZN-dZQXKuVYsTeoSbxWPXtnXX.jpeg)

​

Problem solved.

Your context is now properly seeded, Aspire keeps pooling enabled, and `MigrateAsync` has no troubles during app startup.

​

### **Why this actually works**
When you use `.AddNpgsqlDbContext()` with that second `options `parameter, you’re customizing how the **singleton DbContextOptions object** is built.

This is important because:

*   <span>Aspire calls this *once* at startup.</span>
*   <span>EF uses the result to create the internal context pool.</span>
*   <span>You’re adding the `UseSeeding` callbacks *before* the options get frozen.</span>

By contrast, `OnConfiguring` runs *after* the pool is built—too late to change anything.

In plain terms: when you use `AddNpgsqlDbContext`, you're configuring the options *before* EF Core locks them down for pooling.

`OnConfiguring` runs after that lock—so any changes there are ignored or throw exceptions.

​

### **Why does EF Core want both sync and async?**
EF Core 9 tooling still relies on the **sync** version (`UseSeeding`) when running design-time tools like `dotnet ef database update`.

That’s why you need to implement both, even if your app is 100% async.

The docs recommend this explicitly:

> “EF Core tooling currently relies on the synchronous version of the method and will not seed the database correctly if the UseSeeding method is not implemented.”


So if you’re wondering why you need both—now you know.

​

### **Wrapping up**
EF Core 9 finally gives us a clean, built-in way to seed data.

But if you're using .NET Aspire, don’t follow the docs blindly, and instead:

*   <span>Avoid `OnConfiguring` for seeding when pooling is enabled (which Aspire does by default).</span>
*   <span>Configure `UseSeeding` and `UseAsyncSeeding` inside the `AddNpgsqlDbContext` call.</span>
*   <span>Always include the sync version—EF tooling still depends on it.</span>

That’s all you need. 

And if you need a production-ready blueprint using .NET Aspire and ready to deploy to the Azure cloud, it's all included in the upcoming **Containers & Cloud Native course** of [the bootcamp]({{ site.url }}/courses/dotnetbootcamp).

Until next week,

Julio

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: Everything you need to build production-ready .NET applications for the Azure cloud at scale.

2. **​[Patreon Community](https://www.patreon.com/juliocasal){:target="_blank"}**: Join to unlock the complete, working code from this and all previous newsletters.

3. **[Promote your business to 20,000+ developers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.