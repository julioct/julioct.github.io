---
layout: post
title: "Organizing microservices code"
date: 2024-07-20
featured-image: image.jpg
issue-number: 43
---

*Read time: 8 minutes*
​

A couple of days ago my [Keycloak PR](https://github.com/dotnet/aspire/pull/4289) finally got merged into the [.NET Aspire repo](https://github.com/dotnet/aspire) (YAY!), which is a big relief since it took so much more work than expected. 

Still, it is also very exciting since it will hopefully make adding Keycloak-based authentication to ASP.NET Core apps much simpler than before.

Besides that, this week I've been going deep into structuring the code for the microservices that will be part of the upcoming [.NET Bootcamp](https://juliocasal.com/courses/dotnetbootcamp). So let me tell you what I learned from that.

​

### **Multi-repo: this is the way**
When you do microservices, you want to make sure you stick to a multi-repo approach, meaning that you should store each microservice code in a separate git repository.

I go into the many reasons of why this is important and how that compares to a mono-repo approach in my [microservices program](https://dotnetmicroservices.com). But, in a nutshell, multi-repo gives you:

1.  <span>**Clear ownership:** Nothing better than having full control over your microservice repo, which will result in you taking good care of it. In a mono repo there's only so much you can do.</span>
2.  <span>**Isolation and Decoupling**: It sets a natural wall between microservices, which enforces the separation of concerns and minimizes the risk of unintended interactions between services.</span>
3.  <span>**Developer onboarding:** Devs can easily make sense of a small microservice codebase when they join. Very different than having to understand a massive mono repo (very frustrating)</span>
4.  <span>**Speed.** Things go really fast when you only have to clone, build, and test a small repo and there are only 1 or 2 other people contributing to it.</span>
5.  <span>**Simplified CI/CD Pipelines:** Way easier to create a CI/CD pipeline to build/test/deploy 1 service from 1 repo. Plus that pipeline goes fast and, if anything fails, you immediately know what microservice is impacted and which team is behind it.</span>

Because of those reasons (and a few more) I spent an entire day splitting my so far mono repo into several repositories, which looks like this so far in my GitHub organization (will move to Azure DevOps later):


![](/assets/images/2024-07-20/4ghDFAZYvbFtvU3CTR72ZN-obqQ7Qc4uriyE2EbQv8MUC.jpeg)

The **identity** repo is a failed experiment, so it will likely go away, but the rest each represents either 1 microservice, the frontend, or the .NE Aspire related code.

Of course, the challenge there is how to make things work with code being scattered across so many repos. 

Well, based on my experience working on teams of dozens of engineers at Microsoft, where each microservice is assigned to a team of 1 to 3 developers, this is how things should work:

1.  <span>**A developer should only need to clone his/her microservice repo to get the job done.** This should be what most devs need 99% of the time.</span>
2.  <span>**A developer should also be able to run the entire system in the dev box if ever needed.** For this, you clone all repos and use .NET Aspire to orchestrate everything in the dev box. However, most folks should almost never need to do this.</span>

Let me tell you how I'm enabling both scenarios so far.

​

### **Working in 1 microservice**
To enable this you do 2 things:

**1. Start infrastructure services via docker compose**

I'm keeping a repo I'm so far calling "aspire" where I'm keeping everything that <u>is not</u> a microservice, nor the frontend. Looks like this at this point:


![](/assets/images/2024-07-20/4ghDFAZYvbFtvU3CTR72ZN-7kSiJdWK1UsVuTNr9efsRC.jpeg)

From here you can use that **docker-compose.yaml** to start a bunch of infra services like PostgreSQL, MongoDB, Keycloak, RabbitMQ, etc.

Yes, .NET Aspire can do that for you, but when you want to work on only 1 microservice, I found it becomes super overkill to start and stop the 8 infra services I need after every code change. With docker compose, you start them once and forget about it.

Then you go to step 2.

**2. Clone and run your microservice**

Say I want to fix something in the Catalog microservice. All I do is clone this small repo:


![](/assets/images/2024-07-20/4ghDFAZYvbFtvU3CTR72ZN-tnKwH2NUmyunvE3v5qn4bA.jpeg)

Then make my change, run that microservice, test the fix (either by an automated test or manually from Postman), commit and deploy.

Notice that my dev inner loop here is not only very fast but, because this microservice deals with only 1 thing (catalog/product management) I don't have to worry too much about the code structure or falling into over engineering with things like:

*   <span>Clean/Hexagonal architecture</span>
*   <span>Vertical slice architecture</span>
*   <span>DDD</span>

Here, as you can see, my repo has just 2 projects, and the minimal amount of folders and classes to get the 4 or 5 Catalog scenarios going. It's small, simple and fast, as it should be.

But what if you ever want to see the full system working end to end?

​

### **Running the entire system locally**
For this, .NET Aspire is your best friend. So what you do is:

**1. Clone all repositories to a common root**

Which looks like this in my local box:


![](/assets/images/2024-07-20/4ghDFAZYvbFtvU3CTR72ZN-meLBe38FKiemHXGQeM2BQf.jpeg)

**​**

**2. Open the Aspire solution in VS Code**

I'm not a big fan of solutions, but given how .NET Aspire works and the fact that we need to pull in projects from multiple repos, what you do is create 1 solution (in the "aspire" repo) that references all other microservices and the frontend. Looks like this:


![](/assets/images/2024-07-20/4ghDFAZYvbFtvU3CTR72ZN-uEPyPremeCaYkrxfLLQynQ.jpeg)

​

The **Frontend** and **Microservices** folders there are just solution folders that make all projects from other repos part of one solution to make things easy for you and for .NET Aspire.

Then your **Program.cs** in your **AppHost** project can easily construct your application model as if everything lived in the same repo:


![](/assets/images/2024-07-20/4ghDFAZYvbFtvU3CTR72ZN-2g8KpscoZMw1QrZRdkrzN2.jpeg)

​

And of course there you can just declare all your infrastructure services (PostgreSQL, Keycloak, Azurite, Kafka, etc) and reference them from whichever project needs them.

Hit F5 and your entire system will not just be running in your box, but also you can place breakpoints anywhere in any of your microservices (even in the frontend) and see how things work end-to-end.

​

### **Closing**
I do have other ideas on how to organize microservices code in the .NET Aspire world, like what if you add one Aspire AppHost project next to each microservice? 

That would almost work (no docker compose needed), but gets complicated when you try to run 2 microservices, each from their own repo, where they both need the same infrastructure resource (think PostgreSQL or RabbitMQ).

Anyways, a new .NET Aspire release is shipping soon (with the new Keycloak support!) and it may bring a few interesting updates to further improve our microservices development flow.

Until next time!

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://go.dotnetacademy.io/stripe-waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.