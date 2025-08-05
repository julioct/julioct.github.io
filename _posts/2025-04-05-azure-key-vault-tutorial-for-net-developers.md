---
layout: post
title: "Azure Key Vault Tutorial For .NET Developers"
date: 2025-04-05
featured-image: 2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-8GZTtDViRvuKmj7pFbtWrX.jpeg
issue-number: 79
---

*Read time: 6 minutes*
​

Today I'll show you how to properly secure and access your .NET application secrets via Azure Key Vault.

You probably know you shouldn't be storing API keys, connection strings, and passwords in your code, so hopefully you use something like the .NET Secret manager during local development.

But how to get ready to use those secrets in the cloud while keeping your code clean and following best practices?

Azure Key Vault is the solution for this and the best thing is that it integrates beautifully with ASP.NET Core, so you can retrieve those secrets as if you were reading your appsettings.json config values.

In this tutorial, I'll walk you through the entire process step-by-step. 

Let's get started.

​

### **What is Azure Key Vault?**
Azure Key Vault is a cloud-based service designed to store and securely manage application secrets. 

It's the right place to store your connection strings, API keys, and passwords, so they stay away from your code base, but you can also store encryption keys and certificates.

In addition, Key Vault can do:

*   <span>**Versioning.** Each time you update a secret, a new version is created, and your code can reference either the latest version or whichever previous version is needed.</span>
*   <span>**Access Control.** Define granular permissions through Azure RBAC (Role-Based Access Control) to determine which users or applications can access specific secrets.</span>
*   <span>**Monitoring and Logging.** Track who accessed secrets and when through detailed audit logs and Azure Monitor integration.</span>

Let's see how an ASP.NET Core app can read secrets from a Key Vault, step-by-step.

​

### **Step 1: Create your Key Vault**
If you don't have one already, you can quickly create a Key Vault from the Azure Portal by providing a name, a region, and your pricing tier:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-eAaKixZNhCECH6MftnTgta.jpeg)

​

Once created, the main detail you will need later in your app code is the vault URI, available in the Overview blade:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-8LJJ6uWLyJNaiBD1KfZ8og.jpeg)

​

Next, you should configure your permissions.

​

### **Step 2: Add permissions**
Key vaults are very secure by default. This means that even if you created the vault, you won't be authorized to start adding secrets:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-3FAfLro7JHFJmPy66NB53K.jpeg)

​

For this, go to the Access control blade, and assign yourself the **Key Vault Secrets Officer** role:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-p6nV6kjmbgvK3GT9U5F72h.jpeg)

Now you are ready to start adding secrets to your vault.

​

### **Step 3: Create the secret**
Let's say we need to store our OpenAI API key in our Key Vault, which our app will use for all its generative AI needs.

Let's add that secret on the **Objects --> Secrets** blade:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-rSgCYYwefdTLMsr5p6uwFu.jpeg)

​

Why did we use that specific pattern, with double dashes in the middle, for the secret name?

Well, because that is a pattern that ASP.NET Core will be ready to recognize via the **Key Vault Configuration Provider**, making reading the secret a trivial task for our app. 

So using the **OpenApi--ApiKey** secret name is essentially the same as adding this configuration to your appsettings.json file:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-gmn2LxdBanb9JDFjwFVmb9.jpeg)

​

But of course, we won't add anything to appsettings.json. Let's see what we'll do instead.

​

### **Step 4: Read the secret**
Start by installing these two NuGet packages:

*   <span>Azure.Extensions.AspNetCore.Configuration.Secrets</span>
*   <span>Azure.Identity</span>

Now add this to **Program.cs**:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-tVo4w93n4BEZDkdMp6wfKL.jpeg)

​

That will add your Key Vault as a new configuration source to your .NET application. From here on, any secrets in your vault can be read from the standard configuration system.

Which means we can do things like this:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-8GZTtDViRvuKmj7pFbtWrX.jpeg)

​

Which at runtime looks like this:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-dJWc5W2NjA2kVEDF9jYbHY.jpeg)

​

Mission accomplished!

​

### **Step 5: Cloud deployment**
There are several ways to deploy .NET Web apps to the cloud. I covered the simplest way [last week]({{ site.url }}/blog/the-easiest-way-to-deploy-your-asp-net-core-app-to-azure), so I won't repeat that here.

But to successfully use your Key Vault integration in the Azure cloud, you want to make sure you associate a managed identity with your deployed application, as I covered [here]({{ site.url }}/blog/Go-Passwordless-With-Azure-Managed-Identities).

Then grant that managed identity the **Key Vault Secrets User** role in your Key Vault:


![](/assets/images/2025-04-05/4ghDFAZYvbFtvU3CTR72ZN-qDQMqqkfFPUjSwWmay1MyY.jpeg)

​

And then your deployed app will have no trouble reading secrets into your app configuration, just like it did during local development.

I go over this entire process, for a real-world e-commerce application, in [the bootcamp]({{ site.url }}/courses/dotnetbootcamp).

Until next time!

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://go.dotnetacademy.io/stripe-waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
