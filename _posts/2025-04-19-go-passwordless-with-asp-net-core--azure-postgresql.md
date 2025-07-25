---
layout: post
title: "Go Passwordless with ASP.NET Core + Azure PostgreSQL"
date: 2025-04-19
featured-image: 2025-04-19/4ghDFAZYvbFtvU3CTR72ZN-x9AjMiUq1p7jY4Yuyj7RtP.jpeg
issue-number: 81
---

*Read time: 7 minutes*
​

If you're building secure, cloud-native ASP.NET Core applications, there's a good chance your database connection string still includes a password.

You may be storing it in Azure Key Vault, or maybe in an environment variable. But either way, it's still a secret you have to manage, rotate, and protect.

But what if you didn't need a password at all?

In today’s issue, I’ll show you how to connect your ASP.NET Core API to **Azure Database for PostgreSQL** using **managed identities,** so your app can authenticate securely *without* storing or handling secrets.

It’s not just more secure, it’s also a lot less maintenance.

Let’s take a look.

​

### **What is Azure Database for PostgreSQL?**
Azure Database for PostgreSQL is a fully managed relational database service built on PostgreSQL.

It offers all the benefits you would expect of such a cloud offering: 

*   <span>Automatic backups</span>
*   <span>Automatic OS and database engine updates </span>
*   <span>Zone-redundant high availability</span>
*   <span>Predictable performance</span>
*   <span>Elastic scaling</span>

But it’s also integrated with **Microsoft Entra**, which means you can secure access to the database using **Azure managed identities** instead of a traditional connection string.

And that’s where things get interesting.

​

### **How you’d normally connect to PostgreSQL**
The best way to connect to PostgreSQL from a .NET application is by using the Npgsql database provider. 

If you use Entity Framework Core, you can integrate Npgsql with the **Npgsql.EntityFrameworkCore.PostgreSQL** NuGet package.

Then in Program.cs you would configure your connection and your DBContext like this:


![](/assets/images/2025-04-19/4ghDFAZYvbFtvU3CTR72ZN-kLuCsXSiVuQmEgMpqWsP8S.jpeg)

​

Now, what comes in that connection string? For an Azure PostgreSQL database, it will be something like this:


![](/assets/images/2025-04-19/4ghDFAZYvbFtvU3CTR72ZN-fns9p6xyTDsADnjfghngi9.jpeg)

​

You definitely wouldn’t hardcode that into `appsettings.json` (not safe!). A better option would be a Key Vault secret, as I covered [over here]({{ site.url }}/blog/azure-key-vault-tutorial-for-net-developers).

But even then, this approach is far from ideal because:

*   <span>You're still dealing with a **password.** Even if it's hidden, it still exists.</span>
*   <span>That password will **expire**, and you’ll need to rotate it periodically.</span>
*   <span>Your app becomes **dependent on secret management**, adding more moving parts.</span>

The bottom line is that passwords are fragile. But fortunately, we have better tools in the cloud for this.

​

### **Create a passwordless connection**
The best approach to connect your app to PostgreSQL in the Azure cloud is to use a passwordless connection via a managed identity.

In the case of Azure PostgreSQL the main idea is to enable something like this:


![](/assets/images/2025-04-19/4ghDFAZYvbFtvU3CTR72ZN-x9AjMiUq1p7jY4Yuyj7RtP.jpeg)

​

Breaking it down:

1.  <span>You assign a managed identity to your Web App (or Container App or whichever service you deploy into) </span>
2.  <span>Grant that identity access to your PostgreSQL database</span>
3.  <span>The Web App gets Microsoft Entra access tokens to talk to the database server</span>

If you are new to Azure managed identities, I covered the basics [over here]({{ site.url }}/blog/Go-Passwordless-With-Azure-Managed-Identities), including an example with Azure Storage. 

But with PostgreSQL it gets more challenging since you can't just grant the identity RBAC access to the DB. 

**You need to create a user inside the database who represents the managed identity, and grant it the right permissions.**

This is easier said than done, and can be challenging to enable manually. A better way is by using a Service Connector on your Web App:


![](/assets/images/2025-04-19/4ghDFAZYvbFtvU3CTR72ZN-pDnnZUd7TZPEvsWbFxd4Zr.jpeg)

​

That will make sure your managed identity gets the correct permissions to talk to your PostgreSQL DB with minimal chance of error.

I go through the service connector configuration, and everything needed for PostgreSQL passwordless authentication, step-by-step, in [the bootcamp]({{ site.url }}/courses/dotnetbootcamp).

Next, time to write some code.

​

### **Using Npgsql with managed identities**
The Npgsql library integration with managed identities is the most complicated I've seen so far, but at least version 9.0 made things a bit easier than before.

You still need a connection string to talk to the DB, since that's the only way to tell your app what to connect to. But this time, your connection string will look something like this:


![](/assets/images/2025-04-19/4ghDFAZYvbFtvU3CTR72ZN-fCmrs3AHBftxV84B5L7aN6.jpeg)

​

Notice the lack of a password there, and the use of a strangely named User Id. That's the user that the service connector created for you in your DB, and which represents the managed identity.

Given that there's no password, you could place that connection string in appsettings.json, but I prefer to keep it as an environment variable in my Web App to avoid revealing any cloud details in my repo.

In any case, your code will read the connection string just as before:


![](/assets/images/2025-04-19/4ghDFAZYvbFtvU3CTR72ZN-qeapzAtZ9JrrYLjxucyipj.jpeg)

​

Then, install the **Azure.Identity** NuGet package and construct your credential object with the correct managed identity client id, which I usually keep as another environment variable:


![](/assets/images/2025-04-19/4ghDFAZYvbFtvU3CTR72ZN-gbkrDSjMdH1G5QP9PB1wAR.jpeg)

​

Finally, we got the heavy part, which is the Npgsql configuration to use the managed identity to talk to the DB:


![](/assets/images/2025-04-19/4ghDFAZYvbFtvU3CTR72ZN-6kAGBuvNKRvWgB3wXCvRJv.jpeg)

​

That code does the following:

*   <span>Defines the Entra scope to get PostgreSQL-specific permissions</span>
*   <span>Configures an Npgsql data source to define how to acquire the password needed to talk to the DB</span>
*   <span>Sets up a password provider, which uses the credential object and the scope to retrieve an access token from Entra periodically</span>
*   <span>Every new token is cached for 24 hours</span>
*   <span>If it fails to get a token, it retries every 10 seconds</span>

With that in place, deploy your app to Azure, and it should be able to start talking to PostgreSQL, no longer requiring any passwords.

Mission accomplished!

​

### **In Summary**
Passwords don’t belong in the cloud.

If your app is running in Azure, use managed identities to connect to Azure Database for PostgreSQL securely, without hardcoding secrets or worrying about password rotation.

It's not the easiest thing to configure, but it will pay off many times as you forget about passwords and focus on building and shipping features instead of managing secrets. 

Cloud-native apps deserve cloud-native security.

Go passwordless.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://go.dotnetacademy.io/stripe-waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.