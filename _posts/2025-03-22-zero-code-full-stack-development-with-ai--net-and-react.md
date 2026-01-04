---
layout: post
title: "Zero-Code Full-Stack Development with AI, .NET and React"
date: 2025-03-22
featured-image: 2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-fbQYJTWYcH76x7ewrxonm.jpeg
issue-number: 77
---

*Read time: 8 minutes*
​

Vibe coding is an AI programming technique in which you describe a problem in natural language to an AI assistant (a large language model), and it builds the software for you.

It's a revolutionary approach that not only allows anyone to build applications with minimal or no coding knowledge but also dramatically simplifies your job as a software developer.

This year we saw the appearance of a few tools specifically designed for this, with Cursor and Bolt being some of the most popular.

However, at the time of writing this article, vibe coding has also landed in VS Code Insiders, and I've been using it for the last few weeks with amazing results.

So today I'll show you how to use the new VS Code Agent mode to create a React + .NET full-stack application writing zero manual code.

Let's dive in.

​

### **Getting ready for Agent mode**
To get started today all you need is **VS Code Insiders**, the version of VS Code that includes the latest, bleeding-edge features that are still being tested by early adopters.

After installing it, open either a new or existing workspace, then open up the Copilot pane, switch to the COPILOT EDITS tab, and switch to Agent mode:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-tf88Byf8rCFCGfq2SitJdo.jpeg)

​

You can also pick your preferred LLM. Claude 3.7 Sonnet is one of the most popular, but I'll go with Claude 3.5 since I hit rate limits with 3.7 in the past:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-rZbRfAy3bA4jb1Nypizyuj.jpeg)

And, with that, we are good to get started. So let's work on our specifications.

​

### **The specifications**
My family and I keep finding expired food in the kitchen from time to time, so maybe we can build a small website that can keep track of this, and perhaps notify us when something is about to expire.

Here are my specifications:

*Let’s implement a website where I can track the expiration of the food in my house.*

*The user goes to the website and can see all previously entered food items*

*On the home page there is also an option to enter a new food item with its name and expiration date.*

*We should not allow duplicate items.*

*Once an item is 1 week near expiration, an email should be sent to the configured email addresses.*

*Your Tech Stack:*

*   <span>*Front-end: React, Typescript and Bootstrap* </span>
*   <span>*Back-end: ASP.NET Core minimal APIs*</span>
*   <span>*DB: PostgreSQL*</span>

*Also:*

*   <span>*Use Vite for anything related to the frontend*</span>
*   <span>*I’m planning to deploy this to Azure* </span>
*   <span>*All the code should go into my d:/repos/food-tracker folder, with top-level folders for the backend and frontend*</span>

​

Let's give all that to the Copilot Agent and hit send:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-4WiqUjvQPH6VwMM1Em9CfF.jpeg)

​

Let's see what it does.

​

### **The Agent gets to work**
Like a good developer, it starts by coming up with a plan and then starts implementation:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-qLZb8bi9KSqKtyPgNmyGLG.jpeg)

​

It may need your input when setting up the initial projects and dependencies and you will need to confirm any command that involves the use of your terminal:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-b7rtTnzom6ZcfgriJkodBj.jpeg)

​

But after that, it mostly goes on cruise control for several minutes until the whole thing is fully implemented:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-b7EYH7u6epruSJPdjVg2h2.jpeg)

​

And ends with instructions on how to start the app:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-jiMsBjMjTxxvogoYEMKrqx.jpeg)

​

However, we are missing the actual database server, so let's stop there and ask it for a PostgreSQL Docker container:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-qhweuU7vBFQDfUSXzznoMA.jpeg)

​

It did give me the docker run command to start that container, but then I thought I might as well just use Docker Compose:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-btz7n1f4nBoUAfBDaDGyKS.jpeg)

​

I thought I would be a docker-compose.yml with just PostgreSQL, but it actually added the backend and frontend there too, with their respective docker files:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-rDgmyy79t1Wsds4n8SGhff.jpeg)

​

So we are now not just ready to run this locally, but potentially ready to deploy the entire thing to any container-based cloud service.

But let's start with the local box.

​

### **Running the app**
So let's run the command it suggested but in detached mode:

**docker compose up --build -d**

Then, according to the docker-compose.yml file, we should be able to find our front-end at port 5173:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-mhzLVjwWZbL6QMGUAabYeq.jpeg)

​

So let's browse there:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-cQRTXcnhcWqZCJPvQwy4ZW.jpeg)

​

Great! But, does it work?


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-2PPtmeBu2MFqNjKssknao8.jpeg)

​

Sadly no. And, looking at the backend logs in Docker Desktop, seems to be related to our data model:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-2v64AmuziMqVxwnUpdGnft.jpeg)

​

### **Fixing the backend**
I went to look at my DBContext and noticed my agent had added the FoodItem entity straight into the DBContext class file:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-j4xeqizXDndkyuNowdfVYu.jpeg)

​

Which doesn't look great. Let's fix that first:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-3jqEiWmPSBjT1aSdV2poxY.jpeg)

​

Great, it did that, and then I asked it to figure out and fix the actual issue:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-hJDeRu8DomUmSiLpDQXjJL.jpeg)

​

And it did it:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-9TjwYCwHU3C3R1ydFEmDxn.jpeg)

​

Once it completed the changes, I restarted my docker compose session and tried the front-end again:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-fbQYJTWYcH76x7ewrxonm.jpeg)

​

Works! And even the validations seem to be working properly:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-yRT66fMVMV1Hht2e7ypdm.jpeg)

​

The background service that sends the expiration notifications is also hooked up, but I would need to figure out a few configuration details before having it work properly:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-pKBotizFC9ocH48RamFKan.jpeg)

​

I'll get back to that at some point.

Now I'd like to do something about the UI.

​

### **Fixing the front-end**
Typing the expiration date in the UI is ok, but perhaps we can also enable a date time picker to make it more user-friendly?


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-dhkAsD8M89Ukxb66sZnagz.jpeg)

​

And here's the end result:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-do8uAqbcde8wMWpDDy7AjV.jpeg)

​

Amazing!

​

### **What's next?**
Even if I still need to sort out the email configuration details, and how to do the Azure deployment, this app is 95% ready to go, which is pretty impressive for spending just about an hour or two on this.

It's not perfect, but it's clearly the start of a revolutionary new way to build apps with most of the code being AI-generated.

A few things I already used this for in the last few days, in both cases without me writing a single line of code:

*   <span>Created a tool to easily restructure the content I'm preparing for my upcoming course</span>
*   <span>Modified my React front-end to support Entra ID, in addition to the existing Keycloak support.</span>

A few things I'm planning to use this for this year:

*   <span>Upgrade my old UWP app to WinUI and/or .NET MAUI</span>
*   <span>Build an entire online course platform to stop paying another company every month to do the same</span>

The possibilities are endless!

​

### **Bootcamp update**
This last week I've been hard at work recording the first few modules of **Azure for .NET Developers,** my new course for .NET developers deploying to the Azure cloud, which will soon join [the bootcamp]({{ site.url }}/courses/dotnetbootcamp).

However, one thing I realized as I was working on this is how big the course had become, quickly approaching 20 modules total, which is double the length of the other bootcamp courses.

Such a long course would be overwhelming and would take me more time than expected to get it done. So I decided to split it into two courses:

*   <span>**Azure for .NET Developers:** From Azure Fundamentals to a full-stack app deployed to the cloud and connected to the most popular Azure services.</span>
*   <span>**Containers & Cloud Native:** From containerizing .NET apps to cloud-native development with .NET Aspire and Infrastructure as Code.</span>

The updated bootcamp roadmap:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-2V6gEUfqYWVnDJgkHPgxq9.jpeg)

​

In terms of the planned bootcamp content, nothing changes, it's just that those planned 20 modules that deal with the cloud and containers will now be delivered across two courses instead of one.

Here is the new diagram that describes what the upcoming **Azure for .NET Developers** course covers:


![](/assets/images/2025-03-22/4ghDFAZYvbFtvU3CTR72ZN-c3rLUEpwCaAAAQ22NqQhxA.jpeg)

​

The new course split also gave me enough room to introduce Azure Key Vault and the deployment of not just the .NET back-end API and the Blazor front-end, but also the full React front-end.

So lots of great stuff coming.

Stay tuned!

Julio

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this article, grab exclusive course discounts, and join a private .NET community.
