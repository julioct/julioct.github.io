---
layout: post
title: "The Result Pattern: Stop Throwing Exceptions for Validation"
date: 2026-02-21
featured-image: 2026-02-21/featured.png
issue-number: 112
---

*Read time: 7 minutes*

Last week, I was reviewing a pull request from a developer on my team. The code worked. Tests passed. But every business rule violation was handled by throwing an exception.

Invalid email? `throw new ValidationException()`. Username taken? `throw new ConflictException()`. User not found? `throw new NotFoundException()`.

It's like pulling the fire alarm to tell someone dinner is ready. Sure, it gets the message across—but there's a better way.

Today, I'll show you how the **Result pattern** gives you cleaner, faster, and more intentional error handling in ASP.NET Core.

Let's start.



### **The Problem: Exceptions as Control Flow**
Here's a pattern I see all the time. A service that throws exceptions for every business rule violation:


![](/assets/images/2026-02-21/code-1.png)



And then the endpoint has to catch all of them:


![](/assets/images/2026-02-21/code-2.png)



Every new business rule means another custom exception class and another `catch` block. It gets messy fast.



### **Why This Is a Problem**
Three reasons:

1. **Performance:** Throwing exceptions is expensive. The runtime has to unwind the stack, capture a stack trace, and allocate memory. For something that happens on every invalid form submission, that's wasteful.

2. **Intent:** When you see a `throw`, you expect something has gone seriously wrong. Using exceptions for "email already taken" dilutes their meaning. Is this a bug or a business rule? You can't tell at a glance.

3. **Exceptions are for exceptional things:** A user entering an invalid email is not exceptional. It's Tuesday.



### **The Solution: A Simple Result Type**
Instead of throwing, we return a `Result<T>` that explicitly says: "this either worked, or here's what went wrong."


![](/assets/images/2026-02-21/code-3.png)



That's it. No NuGet packages. No frameworks. Just a class that makes success and failure explicit in your return type.



### **Defining Your Errors**
Instead of scattering error messages across your code, define them in one place:


![](/assets/images/2026-02-21/code-4.png)



Now every error has a code, a description, and a type. Clean, discoverable, and testable.



### **Refactoring the Service**
Now our service returns a `Result<User>` instead of throwing:


![](/assets/images/2026-02-21/code-5.png)



Notice how the method signature now tells you everything. It returns a `Result<User>`—meaning it might fail, and you have to handle that. No surprises.



### **Mapping Results to HTTP Responses**
The last piece is translating a `Result<T>` into the right HTTP status code. A small extension method does the trick:


![](/assets/images/2026-02-21/code-6.png)



And now your endpoint becomes beautifully simple:


![](/assets/images/2026-02-21/code-7.png)



No try/catch. No exception handlers. Just two clean lines that read exactly like what they do.



### **What About Existing Libraries?**
If you don't want to roll your own, there are solid options:

- **[FluentResults](https://github.com/altmann/FluentResults){:target="_blank"}** — lightweight, flexible, supports multiple errors and success messages
- **[ErrorOr](https://github.com/amantinband/error-or){:target="_blank"}** — uses discriminated unions, plays nicely with minimal APIs

Both are great. But I'd still recommend understanding the pattern from scratch first—like we did above—before reaching for a library. It's a simple pattern, and knowing how it works under the hood makes you a better consumer of any library.



### **The Takeaway**
Exceptions should be for exceptional things—unexpected failures, infrastructure errors, things that shouldn't happen during normal operation.

For everything else—validation, business rules, expected failures—the Result pattern gives you:

- **Faster code** (no stack unwinding)
- **Clearer intent** (the return type tells you it can fail)
- **Easier testing** (assert on result values, not catch blocks)
- **Centralized error-to-HTTP mapping** (one extension method, done)

And that's it for today.

See you next Saturday.

---

<br>

**Whenever you're ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **[Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this article, grab exclusive course discounts, and join a private .NET community.
