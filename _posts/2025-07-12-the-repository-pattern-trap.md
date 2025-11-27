---
layout: post
title: "The Repository Pattern Trap"
date: 2025-07-12
featured-image: 2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-kcRbN8j9udKS5uBYbXNo6q.jpeg
issue-number: 93
---

*Read time: 8 minutes*


**The Repository Pattern is everywhere in .NET codebases.**

Walk into any "enterprise" C# shop and you'll find layers of `IRepository<T>` interfaces, generic base classes, and dependency injection configurations that make simple database operations feel like rocket science.

The worst part? Most developers think this is "best practice." They've been told the Repository Pattern provides "clean architecture," "testability," and "database independence."

**But here's what they don't tell you: the Repository Pattern is solving problems that don't exist while creating new ones that absolutely do.**

Entity Framework Core already provides everything the Repository Pattern promises—and does it better. You're building abstractions on top of abstractions, writing 8x more code, and calling it "clean."

Today I'm going to show you why the Repository Pattern has become cargo cult programming in the .NET world, and what you should do instead.

If you've ever wondered whether all those repository interfaces are actually worth it, this one's for you.

​

### **What is the Repository Pattern?**
The Repository Pattern creates an abstraction layer between your .NET application and your data storage.


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-w6S61TLA6GPKLS9U99TTXS.jpeg)

​

Your application code depends only on an IRepository interface—it has no idea whether data comes from SQLite, Azure SQL, or any other source.

Each database gets its own concrete implementation that handles the specific details of talking to that particular storage system.

The promise is beautiful: write your business logic once, and it works with any database. Need to switch from SQLite to Azure SQL? Just change one line in your dependency injection configuration.

Your .NET app stays database-agnostic, your code follows SOLID principles, and testing becomes trivial since you can easily mock the interface.

Now let's see one common way to implement and use the repository pattern these days.

​

### **The abstractions**
To make things as reusable as possible, we'll start by introducing a base entity with a single ID property:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-cbD3E5zZVQB8UBHk5eqfjj.jpeg)

​

Now we can implement our generic **IRepository** interface, taking advantage of our base entity:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-eUaEHgg2RTUXhynKKncE7F.jpeg)

​

Finally, let's add a default Entity Framework Core repository implementation, which hopefully can handle the most common data access scenarios:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-4QcqNr57RyYXRaFXmDPvtr.jpeg)

​

Great. Now, let's add more concrete stuff.

​

### **The Games repository**
Time to add our first entity, Game, meant to represent one of the games in our catalog.


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-peae7PtcrX2zwQfLswwek6.jpeg)

​

For completeness, let's also add our Genre entity, which represents one of our supported game genres and is associated with every game:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-eBMsnpUsG7b9F3k73FdLSx.jpeg)

​

Now, ideally, we would just use **IRepository<Game>** across our .NET application, but unfortunately, that interface lacks a few other essential methods specific to game management.

Therefore, we'll need a new interface:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-iBc7D2BECmwGtfAGLBiaD3.jpeg)

​

And a new concrete implementation:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-3178U7uP2i67n2N1stTQa5.jpeg)

​

Notice how Repository<T> couldn't possibly be aware of either the Genre property or the Name property in Game, both unknown in BaseEntity, which is why we need the new interface and repository.

Now let's use our new repository components.

​

### **Using the repository**
We can now use our handy IGamesRepository interface across all our endpoints or controllers.

I usually keep these endpoints in separate feature folders, as I covered in [my Vertical Slice Architecture article]({{ site.url }}/blog/vertical-slice-architecture), but here I'll place them in one file for easier reading:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-9XLmbx7KZ47j6PrS9Frngc.jpeg)

​

And let's not forget to register the repository, along with the EF Core DBContext, on application startup:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-ddHyz56b2gLU5fPr1PjgjL.jpeg)

​

Different teams would implement their repositories in slightly different ways, but you get the idea.

Now, there's something most devs miss.

​

### **What most devs miss**
It turns out that EF Core's **DBContext is already a repository implementation**, clearly mentioned in the class documentation:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-gQNd7wsx2WFaJtFJyKQwUY.jpeg)

​

The DBContext is meant to abstract your code from the underlying DB engine, exactly what the repository pattern is meant to bring to the table.

By adding a repository layer on top of the DBContext, you are:

1.  <span>Building an abstraction on top of the abstraction</span>
2.  <span>Writing 8 times more code than needed for simple scenarios</span>
3.  <span>Ready to swap your DB engine, but that might never happen</span>

What if you just take advantage of the built-in repository capabilities of DBContext?

​

### **Using the DBContext directly**
Let's inject the DBContext directly into our endpoints and simplify the code accordingly:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-uaiHwQtzGRbrog5oNP2EPZ.jpeg)

​

Notice the new flexibility allowed across all endpoints and the fact that we no longer need to maintain a bunch of abstractions that were there just in case:


![](/assets/images/2025-07-12/4ghDFAZYvbFtvU3CTR72ZN-kcRbN8j9udKS5uBYbXNo6q.jpeg)

​

There's nothing as satisfying as deleting code that's no longer needed :)

Now let's address a couple of common questions.

​

### **What if I change my DB later?**
**You're not going to change databases.** In 15+ years of building .NET applications, I've seen this happen exactly zero times in production.

Once you're running with real data, real users, and real business processes, switching databases becomes a massive undertaking involving data migration, schema differences, and retraining teams.

The repository pattern doesn't solve any of that—it just makes you feel better about a problem that doesn't exist.

**And, if you do change databases**, you most likely want to take advantage of the strengths of your new database, so you are up for a full rewrite anyway.

Plus, today, even that is not that much of a big deal given the massive amount of assistance you'll get from your AI companion like Cursor or GitHub Copilot to get such a task done in a fraction of the time that it would take you to maintain all those repositories for years.

​

### **What about unit testing?**
A common argument for using the repository pattern is that it allows for isolating your database-specific logic so that you can easily unit test your ASP.NET Core endpoints or controllers.

However, you should realize that by unit testing your controllers, you are testing the wrong thing, as I mentioned in [this previous article]({{ site.url }}/blog/Dont-Unit-Test-Your-AspNetCore-API).

Save those unit tests for complex business logic and algorithms, which is where the real value lives. Your controllers are better served with a small set of integration tests.

​

### **Wrapping Up**
The repository pattern was never the answer to .NET's data access problems. It's a solution in search of a problem, creating complexity where none needs to exist.

**EF Core's DbContext already is your repository.** It provides abstraction and everything else the repository pattern promises—without the ceremony, without the boilerplate, and without the maintenance burden.

Stop building abstractions on top of abstractions. Use the platform. Write clear, direct code that does what it says and says what it does.

Your future self will thank you when you're shipping features instead of maintaining repository interfaces that add zero value.

And that’s all for today.

See you next Saturday.

**P.S.** If you want to see how to build complete production-ready APIs using EF Core and zero unnecessary abstractions, check out my [ASP.NET Core Essentials course]({{ site.url }}/courses/aspnet-core-essentials). Just solid, maintainable code that actually works.

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.