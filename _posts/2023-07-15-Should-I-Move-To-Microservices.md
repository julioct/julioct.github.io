---
title: "Should I Move To Microservices?"
date: 2023-07-15
layout: post
featured-image: monolithic-hell.jpg
featured-image-alt: Should I Move To Microservices?
image: /assets/images/monolithic-hell.jpg
issue-number: 3
---

*Read time: 4 minutes*

Today I'll try to answer this common question: should I move to microservices?

Microservices can be a great way to build systems that are resilient, scalable, and easy to maintain.

Unfortunately, they are not a silver bullet, they are not for everyone and you can get into a lot of trouble if your timing is not right.

<br/>

### **Microservices can either be a blessing or a curse. Make sure you make the move at the right time.**

<br/>

I have seen teams fail because of their reluctance to leave the monolith behind, but I have also seen teams fail because they moved to microservices too soon.

So, how do you know if you are ready to make the move?

I'll give you 4 few clear indicators that will tell you that the time is right to make the move, so that you can:

* Keep your developers happy
* Always deliver on time
* Stop wasting server resources
* Use new tech as needed

Let's dive in.

<br/>

#### **Indicator 1: It's hard to onboard new devs due to a complex code base**
When you are just getting started, your code base is naturally small, so it's trivial to find things, add features and fix bugs quickly.

In fact, starting with a monolith and sticking with it while the code base remains small, is the way to go. No need to complicate things.

But as the system grows, the codebase becomes more complex and harder to understand.

![Alt text]({{ site.url }}/assets/images/complex-codebase.png)

So, even if you and your two teammates know the code base inside out, new devs are going to have a hard time getting up to speed.

And if they can't start contributing features and fixes quickly, you are going to have a hard time scaling your team.

This is a clear sign that you should start thinking about moving to microservices.

<br/>

#### **Indicator 2: Your teams can't move fast anymore**
Let's say you have a team of 10 devs working on a multiplayer game backend, a monolith made of 5 modules, with 2 devs working on each one.

Team A, which is in charge of the Store module, is ready to release a new shiny feature. They are on schedule.

However, Teams B and C also have a bunch of unrelated updates ready for the Inventory and Match Making modules.

Team C is not super confident on their updates to the Match Making module, so they want to run a bunch of additional tests before releasing.

![Alt text]({{ site.url }}/assets/images/monolithic-hell-issues.jpg)

So, even if Team A and B are ready to go, and since the monolith forces the teams to deploy all or nothing, the release is blocked until everyone is ready.

And, not only that, if Team C finds a bug in production, they will have to roll back the entire release, even if the bug is in the Store module.

And, thanks to that, now everyone is behind schedule, and the release is delayed.

This is incredibly frustrating (trust me, I've been there) and is another clear sign that you should start thinking about moving to microservices.

<br/>

#### **Indicator 3: You keep wasting server resources**
Imagine that under normal circumstances your entire system can handle the load just fine with a couple of servers.

But, every now and then, like in Black Friday or when your Summer Sale starts, tons of new players start hammering your system.

Eventually the Match Making module can't handle the load, and crashes, and with it the entire system.

Since your system is a monolith, all you can do (other than making Match Making more efficient) is add more servers, so the load distributes better.

![Alt text]({{ site.url }}/assets/images/servers.jpg)

But, every time you deploy a new server, you are deploying the entire system, so the Match Making module needs to share resources with all modules on each new server.

Because of this, you need to add a lot more servers than you would need if you could just deploy the one module that is struggling.

When you start running into this situation, you should start thinking about moving to microservices.

<br/>

#### **Indicator 4: It's too hard to upgrade your tech stack**
Some of my old teammates would not agree, but I'm a big fan of upgrading to the latest and greatest tech stack as soon as I identify a clear benefit from doing so.

For instance, let's say all the modules in my monolithic system are currently running on .NET 6. However, .NET 7 and ASP.NET Core 7 where released at the end of last year.

Did you know .NET 7 brings in [1,000+ performance improvements](https://devblogs.microsoft.com/dotnet/performance_improvements_in_net_7) and ASP.NET Core 7 is [11x faster than Node.js](https://www.techempower.com/benchmarks/#section=data-r21&hw=ph&test=plaintext)?

![Alt text]({{ site.url }}/assets/images/aspnet7-perf-improv.jpg)

So, if I know our increasingly popular system can use the extra performance, I would like to upgrade as soon as possible. Wouldn't you?

I own the Inventory module, so I'd like to at least start by upgrading that piece. But sadly, since the system is a monolith, I'm forced to upgrade the entire system.

Since my boss didn't give me an entire month for this, I chat with folks in the other teams to see if they can help with the upgrade.

No way! Team B is running hot with their new feature and Team C is still trying to fix a critical bug they introduced in the last release.

So even if I'm ready to upgrade my module, I can't, because I need to wait for the other teams to be ready. That will never happen :(

If you are in this situation, you got a signal that should start thinking about moving to microservices.

<br/>

#### **In Summary**
Stick with a monolith in the early days, when the team and the code base are small. Jumping into microservices at this stage will only slow you down.

But keep your eyes open for clear indicators that you might be stepping into what Chris Richardson calls the <a href="https://microservices.io/microservices/general/2018/11/04/potholes-in-road-from-monolithic-hell" target="_blank">monolithic hell</a>.

It might be time to move to microservices.

And that's it for today.

I hope you enjoyed it.

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.