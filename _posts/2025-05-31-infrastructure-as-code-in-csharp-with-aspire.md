---
layout: post
title: "Infrastructure as Code in C# with .NET Aspire"
date: 2025-05-31
featured-image: 2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-qtaZPgz1FZxJr7qU7xe4B5.jpeg
issue-number: 87
---

*Read time: 8 minutes*


Back when I was at Microsoft, my team used Terraform to manage our infrastructure.

It worked—but keeping those Terraform files in sync with the evolving requirements of our dozens of microservices was a constant struggle.

Every small change required obscure tribal knowledge, and debugging failures felt more like deciphering ancient scrolls than doing modern development.

And don’t even get me started on onboarding new devs.

But things are changing fast.

With .NET Aspire, you can not only model your entire system in C#, but also generate all your infrastructure artifacts—Bicep files, Kubernetes manifests, Docker Compose files, and more—directly from your application model.

No context switching. No stale templates. No extra languages to learn.

Let me show you how it works.

​

### **What is Infrastructure as Code?**
There are many definitions for Infrastructure as Code (IaC) out there, but here's a short one that I like:

> Infrastructure as Code is a system for managing and provisioning infrastructure using code and automation


This means that instead of creating your cloud resources manually, or writing dozens of scripts to automate things a bit, you define every piece of infra as code files, just like you do for your apps.

So, if your application needs a database, a storage account, a container registry, etc, you write a set of templates that describe all of those resources and how they are related.


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-qtaZPgz1FZxJr7qU7xe4B5.jpeg)

​

Then, you hand over the templates to a tool or engine that knows exactly how to provision the resources in your cloud environment, in the correct order.

This approach has a bunch of benefits, like:

*   <span>Every single detail about your infrastructure can be stored and tracked with your code base.</span>
*   <span>You state what needs to get done in code, but leave the "how" to the IaC engine.</span>
*   <span>Once you get one environment up, getting other environments with the exact same configurations is trivial. </span>

IaC is amazing, but the problems we C# developers traditionally face with this are:

*   <span>You need to learn a completely new language like Terraform, Bicep, Ansible, and others.</span>
*   <span>The IaC templates can easily get out of sync with the latest infra requirements of your applications</span>

But, not anymore.

​

### **IaC with C# via .NET Aspire**
​[Last week](https://juliocasal.com/blog/build-a-system-not-an-app), I showed how to define the application model of your entire system in C# using .NET Aspire. Since then, I also added a worker service to take care of DB migrations and data seeding:


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-ebNBeaiz56zUYpN27YAZWt.jpeg)

​

Now, that's a beautiful visualization of the entire thing in my local box, but how to turn all of that into a real cloud environment?

Well, it turns out all that C# code you wrote to define your app model is also your IaC template, so you can use it to get all your deployment artifacts.

But before that, you may want to update your app model to reflect all resources that must be included in your deployment.

For instance, here I switched from the container-based PostgreSQL resource to the Azure version (Azure Database for PostgreSQL) using the **Aspire.Hosting.Azure.PostgreSQL** hosting integration:


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-vp4jdDrwNXXJpnE2cBmARy.jpeg)

​

Notice that you can still define what happens if you run your Aspire app locally (RunAsContainer), which would be skipped when preparing the deployment artifacts.

You can also keep some parts of your model for local development only, like in this case, where I don't need Keycloak in the cloud, since there I might use something else (like Entra ID):


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-kv9UnAMVxUpeurV9Qrk9b9.jpeg)

​

The **IsRunMode** check will ensure that block is excluded from deployment, but even then, my API project can wait and receive environment info from Keycloak when running locally.

Our infrastructure as C# code is now ready to go:


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-fZad7YC5FYjP2q6dRBdPSB.jpeg)

​

Now let's generate our deployment artifacts.

​

### **Model once, host anywhere**
A common question I have seen from folks new to .NET Aspire goes like this:

*"I want to use .NET Aspire, but I don't want to redo the way I provision my infrastructure and deploy apps to my cloud environment. Can I still use Aspire?"*

Yes, you can. .NET Aspire will not deploy things for you, or even prescribe how/where to provision your infra.

Instead, Aspire can generate the exact deployment artifacts you need to feed your current deployment infrastructure, whichever it is.

For instance, let's say you are hosting your system in **Azure Container Apps**. You can start by installing the **Aspire.Hosting.Azure.AppContainers** NuGet package and then add one line to your application model:


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-67jn7ep3p1Ez9RkEp1KPL4.jpeg)

​

Then, install the Aspire CLI (currently in preview):


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-fXiZsgeWwerTzB7ruPoQBv.jpeg)

​

And run this anywhere in your repo:


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-4aUe2At4H848B5Gk2QqnBy.jpeg)

​

That will generate a complete collection of Bicep files that match <u>exactly</u> your C# application model:


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-3pkxB58zxCUzEWNjQb3Ny3.jpeg)

​

Here's how the PostgreSQL resource looks in one of the generated Bicep files:


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-vEor9aty1zxJH1A8PbFCmC.jpeg)

​

You can feed the generated files to the Bicep engine in your current deployment pipeline, and it will take care of turning them into a live Azure environment.

But what if you don't do Container Apps, but **Kubernetes**?

In that case, install the **Aspire.Hosting.Kubernetes** NuGet package and replace the C# line you added before with this other one:


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-jjq23TJSb44dbEeSVfQUDQ.jpeg)

​

Now publish again with the Aspire CLI and you'll get this instead:


![](/assets/images/2025-05-31/4ghDFAZYvbFtvU3CTR72ZN-jiu25Z3yMaBK34BFwuxaw5.jpeg)

​

Which is exactly what you use to deploy things to Kubernetes, wherever you are hosting your cluster.

What if you need to target **Azure App Service**?

There's a hosting integration for that too.

What if what you need is a Docker compose file to stand up the entire thing with containers in your CI/CD pipeline for integration testing?

Yes, there's also a hosting integration for that.

And what if you need to customize the Storage Account configuration, or modify a few of the Container Apps settings?

That's also possible, and I'll cover all those in detail, plus how to even use your existing Bicep files with Aspire, in the upcoming **Containers & .NET Aspire course** that will join [the bootcamp]({{ site.url }}/courses/dotnetbootcamp) soon.

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.