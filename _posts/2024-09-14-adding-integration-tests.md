---
layout: post
title: "Adding Integration Tests"
date: 2024-09-14
featured-image: image.jpg
issue-number: 50
---

*Read time: 9 minutes*
​

This week has been all about integration testing and Azure DevOps for me. The good thing is that all integration tests for all microservices in the Game Store application are 100% passing both in my box and in Azure Pipelines.

The bad thing is that I currently have no idea how to get a .NET Aspire based microservices system properly deployed via Azure Pipelines. Aspire wants to deploy the entire thing from one solution, which is not how we do things with microservices.

So I'm a bit stuck there at the moment, and before I go back to that rabbit hole, let me tell you what kind of integration tests I'm enabling for the microservices in this system.

Let's dive in.


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-op3s2uzqgeRrEfPCwQjqMh.jpeg)

​

### **What do we need to test?**
If you are new to this newsletter, here's a quick summary of what I've been covering in the last few issues: 

I'm extending the Game Store application introduced in my [ASP.NET Core Full Stack bundle](https://juliocasal.com/courses/aspnetcore-fullstack-bundle) courses and turning it into a real-world e-commerce distributed application that will serve as the core project to be developed across my upcoming [.NET Developer Bootcamp](https://juliocasal.com/courses/dotnetbootcamp).

Now, I don't plan to cover anything about unit testing in this bootcamp because I already have [2 entire courses](https://juliocasal.com/courses/unittesting-bundle) dedicated to that, but I do want to dive into the world of integration testing since that is essential in this kind of system.

But, what do we need integration tests for in this system? Well, you want to think about all the interactions between the different components of your application, especially those that talk to external services.


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-42dqRX3KMRgDgtp1nokEJY.jpeg)

​

There are many interactions of that type in the Game Store application, which will prompt questions like these:

*   <span>Can the Web APIs successfully receive HTTP requests and process them all the way to the PostgreSQL DB and back?</span>
*   <span>Are the REST APIs dealing with unauthorized HTTP requests properly?</span>
*   <span>Can the microservices publish and consume messages to/from RabbitMQ and Kafka?</span>
*   <span>Can the microservices upload files to Storage?</span>
*   <span>Can the Payments microservice talk to the Stripe API?</span>
*   <span>Can the Notifications microservice send emails?</span>

There are several other questions to tackle, but let me dive into how a few of those can be answered via integration tests.

​

### **Configuring a DB for integration tests**
You want to verify that your Web API endpoints can process real HTTP requests. And not just receive them but send them to your database and return real HTTP responses to the clients.

For this, you'll need some sort of web host that can be the target of the requests you'll send across your tests. This is where you want to introduce a [WebApplicationFactory](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.mvc.testing.webapplicationfactory-1), which is a component capable of bootstrapping an in-memory web host to be used during integration tests.

There are many ways to use and customize a WebApplicationFactory, but here's a simplified version of what I'm using for the Catalog microservice integration tests:


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-6GHKtVKmF7T6AvtoN5HfPL.jpeg)

​

A few bullet points regarding what's happening there:

*   <span>The WebApplicationFactory is of type **Program**, meaning it references the Program class from my application and the factory will use it to initialize the app during tests.</span>
*   <span>**CatalogWebApplicaitonFactory** receives an **IDatabaseContainer**, which will provide all the details to connect to a real database that will run as a container. More on this later.</span>
*   <span>The **ConfigureWebHost** method is where you can configure the builder before your app is built.</span>
*   <span>**ConfigureServices** is a delegate where you can configure additional services that you might need during tests. </span>

The key thing we are achieving in **ConfigureServices** is removing the DBContext configured by Program.cs and replacing it with an equivalent DbContextFactory that is instead configured to talk to the container based DB used for testing purposes.

Not only our application will use that testing DbContextFactory without even knowing it, but also we can use it to create a DBContext we can provide to our tests any time they need it, as you can see we do in that **CreateCatalogDbContext** method.

Now, where is that IDatabaseContainer object coming from?

​

### **Using Testcontainers**
​[Testcontainers](https://testcontainers.com) is a really cool and popular open-source library to run any sort of infrastructure service as a throwaway container in your integration tests.

For instance, my Web APIs need to talk to a PostgreSQL database across the tests, so we can introduce such a DB as a test container by installing 1 NuGet package:


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-ggKApaQwKeLQhLbKQqvvu1.jpeg)

​

And then adding and starting the container in the test class, using only C#:


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-jEiFqPfACNZ8ybVza54DyE.jpeg)

​

Now we can go ahead and add our first test, which verifies we can query a game by ID via the games endpoint:


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-4D6GmkfgGAebPp1mUi7Aaz.jpeg)

​

Notice how we provide the PostgreSQL container object to the WebApplicationFactory's constructor. By the time the test runs, there is an active Docker container running in your box, ready to act as your DB.

Then the test goes like this:

1.  <span>The WebApplicationFactory uses the test container to create a DBContext for us, and we use it to save a fake game in the DB. </span>
2.  <span>We create an HttpClient automatically configured to talk to our in-memory Web Host.</span>
3.  <span>We send the request to the Web API, via the HttpClient. If you put a breakpoint in your application's endpoint code you'll see it hits since we are not mocking anything here.</span>
4.  <span>Lastly, we assert the response confirming it matches our expectations.</span>

And, after the test run ends, the test container vanishes as if it never existed. Beautiful!

But what if our Web API requires authentication?

​

### **Using an authentication handler**
Many of your endpoints will likely require authorization. For instance, here's a simplified version of the POST endpoint used to create games in the system:


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-vyf1yHsvfvdE5PXPr6ksBz.jpeg)

​

Not only does this endpoint require an authenticated user (RequireAuthorization) but also the **WriteAccess** policy needs to be validated and a valid Sub claim must be provided, so we know who is behind the request.

How to deal with this? Well, fortunately, there's this concept of **schemes** in ASP.NET Core. A scheme defines one way to perform authentication in your app and your app can support as many schemes as needed.

Normally the Game Store application supports schemes for both Keycloak and Entra ID, but for our test purposes we can introduce a **TestScheme,** which will be implemented via this handy **AuthenticationHandler**:


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-nwHuuaH98DpYd6adHij9ug.jpeg)

​

The point of this handler, which lives in your integration tests project, is to produce an authentication result driven by whatever your test needs. 

As you can see, it can return success or failure, depending on the passed options, as well as include a series of other claims, also provided as options.

With that in place, we can extend our **ConfigureServices** delegate in the **ConfigureWebHost** override of our factory, so that we add our **TestScheme** and set it as the default scheme:


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-3fSfNnpEzd5MJGkTUT2sXp.jpeg)

​

And of course, I added a few other parameters to the WebApplicationFactory constructor:


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-mqUx7uyX5aSDeskm9y2cUr.jpeg)

​

So, when you run your tests, all authentication will be now handled by our **TestAuthHandler** class, not by Keycloak, or Entra ID. And the application itself doesn't even need to know!

Then we can write our test like this:


![](/assets/images/2024-09-14/4ghDFAZYvbFtvU3CTR72ZN-gUzEgYW5xb9Wr7V8kghkrL.jpeg)

​

And that's all it takes to call our endpoint with a sub claim, the scope expected by our WriteAccess policy and an Admin role. 

​

### **Closing**
Boy, these newsletters get long very quickly and there's so much more to cover, especially on the messaging part. But I rather cover all of those (and lots more) in detail during the bootcamp.

Now, I'll go back to the drawing board to figure out how to deploy all of this (the right way) via Azure Pipelines. 

Until next time!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://juliocasal.com/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.