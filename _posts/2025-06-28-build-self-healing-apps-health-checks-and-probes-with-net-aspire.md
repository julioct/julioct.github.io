---
layout: post
title: "Build Self-Healing Apps: Health Checks and Probes with .NET Aspire"
date: 2025-06-28
featured-image: 2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-yQ9PFHBcd3LdZuJM9uqAJ.jpeg
issue-number: 91
---

*Read time: 7 minutes*
​

Ever wondered how your container orchestrator knows if your .NET app is actually working, or just pretending to be alive?

Most developers assume everything's fine if the container starts. But there's a huge difference between "running" and "healthy." 

**Your app might be up, but completely unable to connect to the database or process requests.**

That's where health checks come in—endpoints that tell your infrastructure whether your app is genuinely ready to handle traffic.

But here's the catch: getting health checks right in production is tricky. You need them accessible to your orchestrator, but not to the public internet. 

Today, I'll show you how to add health checks to your .NET app that stay secure and integrate seamlessly using .NET Aspire.

Let's dive in.

​

### **Step 1: Enable health checks**
I covered this briefly in my [.NET Aspire tutorial]({{ site.url }}/blog/net-aspire-tutorial-build-production-ready-apps-from-day-1), but to recap, you want to make sure your ASP.NET Core project calls these two methods that come with Aspire's ServiceDefaults project:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-6zvCHVVaEpnYHjqvtWS6ye.jpeg)

​

It's essential to call **AddServiceDefaults** and **MapDefaultEndpoints** on any project that needs health checks, because:

*   <span>**AddServiceDefaults** registers essential health checks services and adds a default liveness check to ensure your app is at least responding to requests.</span>
*   <span>**MapDefaultEndponts** enables the actual endpoints that report both the liveness and readiness state of your app and all dependencies.</span>

Also, just so we have a way to confirm health checks are working in the cloud, I'll temporarily increase the verbosity of the health checks middleware in appsettings.json:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-nHxi2kwkMzfvkvYD8h19PT.jpeg)

​

Now let's go over an important customization needed in MapDefaultEndponts.

​

### **Step 2: Restrict health endpoints**
There are security implications of opening your health endpoints in a Production environment, which is why **MapDefaultEndpoints** is, by default, only enabled for your local dev environment:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-8h8XmQ7MyQZ7oQ7gQWeJKe.jpeg)

​

We want to remove that **IsDevelopment** check (or we get no health checks in Prod), but we also want to ensure the endpoints are only reachable by our container orchestrator.

For this, we can use the **RequireHost** method, specifying a new port that we will never open to the public internet:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-sjrdZpgnrpt9LFWHtjbcrk.jpeg)

​

Using ***:8081** means that the health check endpoints will be reachable only if the request targets port 8081. 

Requests that target any other port, including ASP.NET Core's default port 8080, will be rejected.

Now let's configure our infra so it takes advantage of our health check endpoints.

​

### **Step 3: Add the health probes**
Health probes are the common mechanism used by container orchestrators to see if our app is healthy by calling our health check endpoints in periodic intervals.

This was a bit trickier to enable in past versions of .NET Aspire, as I described [here]({{ site.url }}/blog/enable-those-health-checks), but today we have much better support to configure everything with C#.

For simplicity, let's say we have chosen to deploy our app to Azure Container Apps, which means we need to start by installing the **Aspire.Hosting.Azure.AppContainers** NuGet package in our AppHost:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-o7WmnGCazhvPRwKRubCWSc.jpeg)

​

This grants us access to the **PublishAsAzureContainerApp** method, where we can configure everything related to the Container Apps infra, including health probes, as part of the app model:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-9kTSiSSW6gCE81UWqSWUbg.jpeg)

​

There we are configuring two probes, one for **liveness** and one for **readiness**, each one pointing to the paths used earlier in **MapDefaultEndpoints**, and both of them pointing to our restricted **8081** port.

Notice we don't need any additional scripts or Bicep files to configure these probes. It's all part of our Aspire app model, all in one place and with pure C#.

We are almost ready to test this, but we need one more thing.

​

### **Step 4: Expose the extra port**
ASP.NET Core apps that run as containers will, by default, only listen on port 8080. Port 8081 won't just work unless we tell the runtime to open the extra port.

Fortunately, this is very easy to do by using the well-known **HTTP_PORTS** environment variable, which we can set in our app model with just one more call to **WithEnvironment**:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-jpoRAHyJHSQunnSAtrwtGy.jpeg)

​

That call will make it so our app answers to both ports 8080 and 8081, which was the missing piece.

Also, notice that our call to **WithExternalHttpEndpoints** will turn on the Ingress in our Azure Container app, with public access to all our endpoints, but that public access targets only port 8080, not 8081.

Now let's test this.

​

### **Step 5: Deploy and test**
Let's kick off our deployment the same way we did in [my Aspire tutorial]({{ site.url }}/blog/net-aspire-tutorial-build-production-ready-apps-from-day-1), with a single call to **azd up.**

And, a few minutes later, we can head to the Azure Portal to confirm our configured health probes are there:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-yQ9PFHBcd3LdZuJM9uqAJ.jpeg)

​

And our new environment variable has been set:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-kUsfTxBR69LSnqGaRndDGA.jpeg)

​

Are health checks running? Since we have increased health checks verbosity, let's check the container logs:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-9cK2ZYRLUjQ9CrG5tG1mSi.jpeg)

​

Great! Azure Container Apps have no issues confirming the health of our app by talking to the liveness and readiness health endpoints, which we expose on port 8081.

But can the rest of the world reach those endpoints? Let's confirm this with a quick call to the health endpoints from my box:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-tgy5LFZTHiNzYXFkcsX3UC.jpeg)

​

Response:


![](/assets/images/2025-06-28/4ghDFAZYvbFtvU3CTR72ZN-xqnNA3WpPdm6r4haakhfcV.jpeg)

​

As expected, we get a **404 Not Found** because all public calls are mapped to port 8080 in our container, and our health endpoints are only enabled on port 8081.

Mission accomplished!

​

### **Wrapping Up**
Health checks aren't optional in production applications. They're the difference between your orchestrator knowing your app is actually healthy versus just hoping for the best.

With .NET Aspire, you get secure, production-ready health checks without the usual headaches.

Your container orchestrator gets the health information it needs. Your app stays secure. And you can focus on building features instead of debugging deployment issues.

Production-ready from day one.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

2. **[Browse all courses]({{ site.url }}/courses)**: Everything you need to build, deploy, and maintain production .NET applications.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.