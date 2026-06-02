---
layout: post
title: "The .NET 10 Bootcamp: Price, How to Buy, and a Bonus Course"
date: 2026-06-06
issue-number: 118
featured-image: 2026-06-06/featured.png
featured-image-alt: The new .NET 10 Developer Bootcamp edition, price and launch details
---

*Read time: 2 minutes*

The new .NET 10 edition of the [.NET Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp) goes live this Tuesday, June 9, at 6 AM PDT.

Last Saturday I [walked through everything inside it]({{ site.url }}/blog/Inside-The-New-Dotnet-10-Bootcamp): all included courses, what changed in each, and what ships with every one.

Today, the price and how to buy.

But first, one thing I didn't mention last week.

<br/>

## There's a new bonus course in the bootcamp

I built a new course for this edition: **Microservices for .NET Developers**.

It takes the same Game Store app you build through the bootcamp, a monolith, and breaks it into independent microservices. Catalog, Basket, Ordering, Payments, and Notifications, each with its own database, behind a YARP API gateway.

![Game Store Microservices architecture: Blazor and React frontends behind a YARP API gateway, with Catalog, Basket, Ordering, and Payments APIs plus a Notifications worker, each with its own PostgreSQL database, communicating over Kafka and an Azure Service Bus emulator, secured with Keycloak and JWT, with Stripe for payments.](/assets/images/2026-06-06/microservices-architecture.png)

If you've followed the newsletter for a while, this is the Game Store microservices app I've written about before, from [building the distributed system]({{ site.url }}/blog/building-a-distributed-system) to [organizing the code]({{ site.url }}/blog/organizing-microservices-code) and [decoupling it with events]({{ site.url }}/blog/events-events-events). It never fit into the original bootcamp, but this edition finally includes it.

It covers the things a real distributed system needs, and few courses explain in detail:

* Organizing microservices codebases across multiple repos
* Synchronous service-to-service calls with typed clients, service discovery, and resilience
* Decoupling services with events, using Event-Carried State Transfer over Kafka
* A custom ordering saga over Azure Service Bus, including the refund path when a step fails
* An API gateway with YARP
* Aspire integration tuned for microservices development
* Blazor and React integration
* Deploying the whole thing to Azure

It's not a step-by-step build. I take the finished, working .NET 10 system and walk you through how it fits together and why each piece is there.

The source code is ready now, so the moment you enroll you can download it, run the full system locally, and read the comprehensive getting started guide.

![The Game Store Microservices solution open in VS Code: the Explorer shows each service as its own repo (basket, catalog, gateway, notifications, ordering, payments, platform), and the Catalog AppHost.cs defines the service in C# with AddProject, WithReference, and WaitFor calls wiring in PostgreSQL, blob storage, Service Bus, Kafka, and Keycloak.](/assets/images/2026-06-06/microservices-vscode.png)

The video lessons come a bit later. I start recording this week, and every lesson will be live by July 3.

This course is included free with the new edition. Everyone who gets the .NET 10 bootcamp gets it.

<br/>

## The price, and how to buy

The full .NET 10 bootcamp is $497. For launch week, it's **$348**, 30% off.

You pay once and keep lifetime access. The purchase link goes live Tuesday, June 9, at 6 AM PDT.

The $348 price stays until Sunday, June 14, at 11:59 PM PDT. After that it goes back to $497.

<br/>

## Wrapping up

What started as a routine .NET 8 to .NET 10 bump turned into the biggest bootcamp update to date: the whole thing rebuilt on .NET 10 and Aspire 13, around 85 lessons re-recorded, and a brand new microservices course on top.

This is the version of the bootcamp I always wanted to create, and I'm very excited to share it with you.

If you've been waiting to jump in, Tuesday is the day.

See you then!