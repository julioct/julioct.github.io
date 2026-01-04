---
layout: post
title: "Build a Reusable .NET Aspire API Template in Minutes"
date: 2025-08-09
featured-image: 2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-jSxV7hdk2NZpsvtLTusngu.jpeg
issue-number: 97
---

*Read time: 6 minutes*

A few months ago, I was trying to find a way to come up with some sort of template for future .NET API projects based on .NET Aspire.

The standard Aspire templates give you a great start, but I had already finished another Aspire application with tons of essential building blocks that I did not want to manually bring to the new project.

**There had to be a better way than cloning and tweaking everything by hand.**

Well, this is exactly what .NET project templates are designed for, and when taking full advantage of their features, they can really streamline the way you start new Aspire-based projects.

Today, I'll show you how I created my new .NET Aspire API Starter template, step-by-step.

Let's start.

​

### **The starting point**
The Aspire-enabled .NET API I had just finished already had most of the things I could reuse in future projects, including:

*   <span>Vertical slice architecture</span>
*   <span>Classic (and not-so-classic) CRUD endpoints</span>
*   <span>EF Core integration with PostgreSQL</span>
*   <span>Global error handling</span>
*   <span>Authorization policies</span>
*   <span>JWT authentication with support for Entra ID</span>
*   <span>Azure Storage integration</span>
*   <span>An Aspire AppHost project with:</span>

    *   <span>A complete application model</span>
    *   <span>Support for Azure services, ready to deploy</span>

*   <span>An Aspire Service Defaults project with:</span>

    *   <span>Custom health checks </span>
    *   <span>OpenTelemetry integration</span>

*   <span>An integration tests project, with several working tests</span>
*   <span>An Azure DevOps CI/CD pipeline</span>
*   <span>A lot of other reusable stuff. </span>

At a high level, it looked like this:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-fSunayr9EVMPY2oCuwLkrP.jpeg)

​

To turn this into a template, I started by generalizing things a bit.

​

### **Step 1: Generalize project items**
You don't have to do this, but it didn't feel right to have *GameStore* spread all over the soon-to-be template.

Plus, that term will be used as a placeholder to be replaced with the actual name given to the project by the user.

So I replaced all instances of GameStore with **TemplateApp,** a more generic term:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-iyUXcVFXWrySihUG9kFJL9.jpeg)

​

Notice this applies not only to folders and project files, but also to every namespace and class influenced by the name of the project:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-2Dy6zUB7xcUcv6mSaKSuc8.jpeg)

​

Even to the CI/CD pipeline yml contents:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-wWvv41zCkc4QrGyiaY3bqE.jpeg)

​

It's not the most fun part of this process, but with the help of the Copilot Agent, it didn't take long.

Next: time to add the template configuration.

​

### **Step 2: Add the template configuration**
To turn the templatized application into an actual template, all you need to do is add a **template.json** file in a new **.template.config** folder at the root of the repo.

Here's my template.json file:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-jSxV7hdk2NZpsvtLTusngu.jpeg)

​

Let's go over the not-so-obvious key elements:

*   <span>**classifications:** These will show in the *Tags* column when your template appears in the *dotnet new list* command results.</span>
*   <span>**shortName:** The name you will use with *dotnet new* to create a project using your template.</span>
*   <span>**sourceName:** The name to be replaced across all template dirs and files with the value specified by the user via the *--name* argument.</span>
*   <span>**preferNameDirectory:** Makes it so a directory is created for your project if *--name* was specified.</span>

There are tons more things you could configure in that file, but I found these to be a great start.

Now, let's install the template.

​

### **Step 3: Install the template**
To use the template, you first have to install it. But, before doing that, make sure you delete any extra folders you don't want to get included with it, like your *bin* or *obj* dirs.

Then, open a terminal at the root of your template, and use the **dotnet new install** command:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-cwrDEDZeQQNgvpGmTMKEi3.jpeg)

​

You should now be able to list your template with the familiar **dotnet new list** command:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-6CHjdArGC7EkoMbPtWMfb8.jpeg)

​

Great, now let's put it to the test.

​

### **Using the template**
Let's say I want to create a new Aspire-enabled API for my new inventory management application.

Easy to get started with the new template:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-fNB4VqbQ2RZbcFQkJxj9gZ.jpeg)

​

Let's open the new project in VS Code and confirm all projects and files look good:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-4WJEc79UVCQRqAcvTmNTn2.jpeg)

​

What about classes?


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-kA5wipQCzWKoHsppVoHrNX.jpeg)

​

But can I build and run this? Will it work?


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-at4u2sy1YLdY69gTqvNn7Y.jpeg)

​

Yep. Let's also open the Aspire Dashboard:


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-n3A7CrdKsWDDpNuPWKwaSx.jpeg)

​

Great!

Finally, what about the integration tests?


![](/assets/images/2025-08-09/4ghDFAZYvbFtvU3CTR72ZN-6Y1dfoVEJJkA7aWpDttPHZ.jpeg)

​

Mission Accomplished!

​

### **Wrapping Up**
**.NET project templates aren't just about saving time—they're about building consistency across your projects.**

Instead of manually recreating the same Aspire setup, authentication flows, and project structure every time, you get a battle-tested foundation that just works.

One template. Infinite projects. Zero repetitive setup.

And that's all for today.

See you next Saturday.

**P.S.** If you need it, the complete .NET Aspire API Starter template is now available [here](https://patreon.com/juliocasal){:target="_blank"}.

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this article, grab exclusive course discounts, and join a private .NET community.