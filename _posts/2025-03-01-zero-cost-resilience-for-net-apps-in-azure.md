---
layout: post
title: "Zero-Cost Resilience For .NET Apps In Azure"
date: 2025-03-01
featured-image: 2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-enfdDmwYQzVWVoARxyHggr.jpeg
issue-number: 74
---

*Read time: 7 minutes*
​

A few days ago, I was getting ready to test my latest ASP.NET Core app in the cloud when I remembered I still needed a good way to deal with unreliable Azure dependencies.

My app uses both Azure Storage and Azure Database for PostgreSQL, and even when those services save you from managing such dependencies in the cloud, you can't deny the inevitable: they will eventually fail.

Then what? Well, you have to make sure your app is ready to tolerate those transient failures and that it can tell you if it is not ready to do the job due to dependency issues so you can do something about it.

There are a few ways to prepare .NET apps for those scenarios, but today I want to show you the zero-cost way by writing less code than before.

Let's dive in.

​

### **Talking to Azure Storage**
I'll focus this article on Azure Storage, but the same technique applies to most Azure dependencies. Also, I'll use a local Azurite Docker container, since I can easily kill it and see how my app deals with that.

The traditional way to talk to Azure Storage, Blob Storage in this case, is to first install the **Azure.Storage.Blobs** NuGet package in your project:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-gfVnnLc9a7V31hbBNXNrS.jpeg)

​

Then you can use BlobServiceClient, which you can configure in a few ways, but here's one simple example:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-aJqgsfM7SMGfA7QaZxM5M4.jpeg)

​

The FileUploader class is not relevant to this article, but if you need to know, all it does is receive the injected BlobServiceClient dependency and use it to upload files to the storage account.

Also, here's how that connection string would look like in appsettings.json:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-Pfmq7UiMEkgEjuWZF5CUn.jpeg)

​

Which is the easiest way to connect to your local Azurite container.

Now, what happens when my app tries to talk to Azurite but I forget to start the container, simulating a situation where, in the cloud, Azure Storage is temporarily unavailable?

Here's what happens:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-8ymgqmj2RkQNoFCKJUyJW7.jpeg)

​

This is not too bad, since it looks like the Azure client will at least retry 6 times before giving up. Great for transient errors in the cloud.

But I see 2 problems here:

1.  <span>**No Azure Client Logging.** The error I got is what my code caught after all the Azure client retries completed. But I got no logging from the Azure client itself, plus it took 40+ seconds to even get that exception. </span>
2.  <span>**No Proactive Health Status.** I only knew about the problem because a request that needed storage was sent (potentially impacting a customer) but ideally, I would know about it way before it impacted anybody.</span>

How to deal with both issues by writing less code?

​

### **Using a .NET Aspire Client Integration**
You may have heard of .NET Aspire, the new set of tools, templates, and packages for building observable, production-ready apps.

But one thing that many devs have not realized yet is the fact that you don't need to add new projects or change your deployment process to start taking advantage of some of the benefits of the new tooling.

The cheapest way to get started is to switch from your normal Azure client NuGet packages to .NET Aspire Client Integrations, which are nothing more than new NuGet packages with enhanced functionality.

For my case, I updated my project file to replace the previous NuGet package with the .NET Aspire Azure Blob Storage client integration:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-xwHLCpGvrB6wL8iHoRufMg.jpeg)

​

Just doing that will not break anything in your code, since it's mostly a wrapper around the library we were using before.

But here's the new code you can write now to do essentially the same thing as before:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-9HHh6QzCi6fVHFrQzjic4n.jpeg)

​

The **AddAzureBlobClient** method will look for a connection string named "Blobs" and use it to inject the BlobServiceClient into the service container.

But how will this new library help us deal with transient Azure Storage failures?

​

### **Improved logging**
After running my app again and making it try to talk to storage while my Azurite container is still stopped, here's what I got almost immediately:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-3dVdGRetQTa3bEJAuGRAUS.jpeg)

​

I collapsed the rest of the stack trace for brevity, but the key thing is that now we can see the Azure.Core library reporting its failing attempts to write to Storage right away.

That will make it much easier to troubleshoot the problem in Prod, and also to react much quicker as we see the logs appear in whichever logging system we are using over there.

But there's one more great benefit we are getting for free and that might not be obvious.

​

### **Built-in Health Checks**
.NET Aspire client integrations report their health automatically to ASP.NET Core's built-in health check system so you can proactively tell if something is wrong with an Azure dependency.

To take advantage of this, you first need to configure the health checks middleware with these few lines:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-3Ynhh3qC1XLjww1CoegnWE.jpeg)

​

Now, run your app while keeping that Azurite container stopped as before.

Then send a GET request to your new **/health/ready** endpoint:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-5SRMZdk99pCFrWZqCoQpFt.jpeg)

​

Since the .NET Aspire client integration automatically added a health check for Azure blob storage, your app will immediately try to talk to storage, to see if it responds at all:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-cgjqveDrGXww5La9Gwv5xa.jpeg)

​

And, once those retries fail, the **/health/ready** endpoint will respond with an **Unhealthy** status.

Nice!

Now restart that Azurite container, send that health request again, and you'll immediately get this:

**Healthy**

And the beauty of that health endpoint is that you can configure it in your Azure Container Apps so your app won't receive production traffic unless the health endpoint reports healthy:


![](/assets/images/2025-03-01/4ghDFAZYvbFtvU3CTR72ZN-enfdDmwYQzVWVoARxyHggr.jpeg)

​

Which is something I cover in detail, along with dozens of related resilience and scalability best practices, in [the bootcamp]({{ site.url }}/courses/dotnetbootcamp).

​

### **The Bottom Line**
Switching to the new .NET Aspire integrations is a zero-cost way to significantly increase the resilience of your .NET cloud-based apps since:

1.  <span>You end up with less code than before</span>
2.  <span>You get improved and quicker logging of transient failures</span>
3.  <span>You get free health checks for proactive troubleshooting</span>

And, you don't even need to add new projects or change your deployment model.

Big win!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
