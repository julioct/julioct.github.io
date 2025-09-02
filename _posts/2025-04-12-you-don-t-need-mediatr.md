---
layout: post
title: "You Don’t Need MediatR"
date: 2025-04-12
featured-image: 2025-04-12/4ghDFAZYvbFtvU3CTR72ZN-riXnFmJLCyPTmNpmJXmQbG.jpeg
issue-number: 80
---

*Read time: 6 minutes*
​

Jimmy Bogard, the creator of MediatR, recently announced that the library is going commercial.

Instead of panicking, I think it’s the perfect time to ask yourself if you even need it anymore.

For years, MediatR has been treated like the default architecture for “serious” ASP.NET Core apps. An essential building block for CQRS, clean separation, and testability.

But when you look at how it actually plays out in real-world codebases, the benefits are mostly theoretical.

Meanwhile, the cost in boilerplate, indirection, and time is very real.

Fortunately, there’s a better and simpler way to build APIs using **Minimal APIs + Vertical Slice Architecture**. And it’s gaining traction for good reason.

If you're trying to write clear, maintainable code without overengineering, this is the approach worth learning.

More on that—and something new I've been working on—at the end.

Let's dive in.

​

### **What is MediatR, and why do people use it?**
MediatR is a popular open-source library that implements the **mediator pattern:**

You send a request (a Command or Query) to a mediator (ISender or IMediator), which dispatches it to a handler.

This is supposed to help you:

*   <span>Decouple APIs from business logic</span>
*   <span>Improve testability</span>
*   <span>Enable reusable cross-cutting logic via pipeline behaviors</span>

But here’s where it goes off the rails:

Many developers think MediatR = CQRS.

And here’s the brutal truth:

**Most teams are not doing real CQRS.**

They’re just splitting reads and writes into separate classes hitting the same database. That’s not CQRS. It’s unnecessary layering with no real benefit.

**You don’t need MediatR to do that.**

And in many cases, you don’t need CQRS at all.

Let’s see what this looks like in code.

​

### **The MediatR based Order endpoint**
Let’s say we want to implement a POST endpoint that saves an order to PostgreSQL using EF Core.

In the MediatR world, you would implement your endpoint along these lines:


![](/assets/images/2025-04-12/4ghDFAZYvbFtvU3CTR72ZN-a5LxKWkBvGdtY1bSoGTQjw.jpeg)

​

Then you would write the actual "logic" into a separate handler class, along with a couple of other supporting types:


![](/assets/images/2025-04-12/4ghDFAZYvbFtvU3CTR72ZN-44mVJd5KYeZdVAeCnQvBfd.jpeg)

​

Notice all the extra ceremony:

*   <span>A command object</span>
*   <span>A result object</span>
*   <span>A handler class</span>
*   <span>A mediator registration step</span>
*   <span>An endpoint that does nothing but relay to the handler</span>

All to save a row or two in a database.

Let's see how you can do the same with no MediatR involved.

​

### **Using Minimal APIs + Vertical Slice Architecture**
Now here’s how the exact same behavior looks as a Vertical Slice Architecture feature, here implemented as an endpoint class:


![](/assets/images/2025-04-12/4ghDFAZYvbFtvU3CTR72ZN-riXnFmJLCyPTmNpmJXmQbG.jpeg)

​

Then all you do is map the feature/endpoint in Program.cs like this:


![](/assets/images/2025-04-12/4ghDFAZYvbFtvU3CTR72ZN-uXJJ79RVzRuRuytXEniUtg.jpeg)

​

That’s it.

*   <span>No mediator</span>
*   <span>No handler</span>
*   <span>No extra files just to push data to a database</span>

You see everything in one place.

You ship faster and debug faster.

You write what matters and skip what doesn’t.

​

### **But what about pipeline behaviors?**
MediatR fans love to bring up IPipelineBehavior<TRequest, TResponse> for validation and logging.

But you don’t need a pipeline to validate a DTO:


![](/assets/images/2025-04-12/4ghDFAZYvbFtvU3CTR72ZN-9NcJDmgQdFzJrsibQnEm32.jpeg)

​

Clean. Explicit. Testable.

*   <span>No hidden behavior classes</span>
*   <span>No “magic” global filters</span>
*   <span>No stack traces you have to reverse-engineer</span>

​

### **But aren't MediatR handlers more testable?**
Only if you’re testing the wrong things.

Handlers like this one don’t contain logic.

They just move data around.

That belongs in an **integration test**, not a unit test.

Use WebApplicationFactory and verify the full behavior through the HTTP layer.

And if you *do* have real logic (discount calculations, fraud detection, etc) **extract that into its own class and test it there**.

You don’t need a handler abstraction to write good tests.

You need boundaries that actually matter.

​

### **Final thoughts**
MediatR was never supposed to be the default.

It’s just one tool. And in most .NET APIs today, it’s the wrong one.

Now that it’s going commercial, ask yourself:

**Do I actually need this?**

With Vertical Slice Architecture and minimal APIs, you get:

*   <span>Fewer files</span>
*   <span>Cleaner structure</span>
*   <span>A dev experience that actually flows</span>

Use the platform.

Write clear, focused endpoints as features.

And stop abstracting away the simple stuff.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
