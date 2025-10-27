---
layout: post
title: "From 1.5s to 126ms: How Azure Front Door CDN Speeds Up Image Loading"
date: 2025-03-15
featured-image: 2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-k8jQHiH9NvbE1K2USzuHjH.jpeg
issue-number: 76
---

*Read time: 5 minutes*
​

Have you ever landed on a website filled with images and spent the last several seconds patiently waiting for those images to finish loading in your browser?

This actually happened to me recently as I was testing my small Game Store front-end, which when deployed to Azure, loads images from my Azure Storage account.

The storage account is still in the US, but in the East US region, while I'm on the West Coast. Yet, images were not loading instantly in my browser, at least not the first time I loaded the page.

This is one of those things you don't think much about when rushing to get that first version of your small website out the door. Yet, it will hit you hard as you try to scale to hundreds or thousands of customers.

The good thing is that this has a well-known solution called a Content Delivery Network (CDN), and today, I'll show you how to configure one in the Azure cloud.

Let's dive in.

​

### **Loading images from far away**
Let's say our website is based in Japan since most customers will access our website from that region. Therefore, we created our Azure storage account next to our website, in the Japan West region.

However, we have an increasing set of customers coming from the US, and when they load the website, images take a while to load.


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-fepvhieVzXvkKUatrEyjvy.jpeg)

​

For this concrete example, I uploaded a fairly big, 4MB jpg to a storage account I created in Japan West, and this is what I observed when loading it in the browser:


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-rDya2jJEniwavk2PMPL2s3.jpeg)

​

So **1.46 seconds** total, and just for one image. Not too bad for a 6,000-mile round trip, but we can do better.

​

### **Enter Azure Front Door**
Azure Front Door is Microsoft's global CDN, which currently has over 118 edge locations across 100 metro cities, and it integrates very easily with Azure Storage.

The idea behind using a CDN is that our USA customer will no longer request images directly from Japan's Storage Account, but from Azure Front Door, which is much, much closer to him.


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-k8jQHiH9NvbE1K2USzuHjH.jpeg)

​

The very first round trip might still take about the same time (but only for the very first customer) since Front Door needs to retrieve that image from the origin.

However, before handing over the image to the customer, it will first cache that image in the edge location closest to him, so next time things should go really fast, with no need to talk to the origin.

You can quickly enable Front Door for your Storage Account from the Azure Portal:


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-wXRENWn9cpBSk8KAjWULKn.jpeg)

​

Notice how I explicitly enabled caching there, to ensure we get that benefit. You could also enable compression, but it would not help much with jpg images, which are already compressed.

After a few minutes, your new CDN endpoint should be ready:


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-sLMGDHPcCeRHRHBP3NtgBh.jpeg)

​

Time to test it out.

​

### **Loading images from the CDN**
You can now use that Azure Front Door endpoint to reach any of your Storage Account blobs. All you do is change the hostname of the image URL.

In my case, that means changing my image URL from this:

​[https://gamestoretest.blob.core.windows.net/game-images/StreetFighterII.jpg](https://gamestoretest.blob.core.windows.net/game-images/StreetFighterII.jpg)​

To this:

​[https://gamestore-bzbag8hjeqd2dra5.z01.azurefd.net/game-images/StreetFighterII.jpg](https://gamestore-bzbag8hjeqd2dra5.z01.azurefd.net/game-images/StreetFighterII.jpg)​

The first time I loaded the image in the browser it did take a bit more time to load than before (full round trip) but the second time things looked quite different:


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-qjQTxKcdRCSD6ttq7LynC3.jpeg)

​

So we went from 1.46 seconds to **126.29** **milliseconds**. And this is after clearing the browser cache.

Quite an improvement!

Then, a couple of things you may want to do next are:

*   <span>Update your backend API so it serves Front Door urls as opposed to the original ones</span>
*   <span>Setup your provisioning infrastructure so that the Front Door endpoint gets auto-provisioned when you provision your Storage Account</span>

I cover both things, including how to provision Front Door via Bicep and .NET Aspire, in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp).

​

### **Bootcamp update: Diagrams!**
It's not like I don't like creating diagrams, but after spending this last week creating 25+ diagrams for the upcoming Azure bootcamp course, I might be reaching my limit :)

However, I think good diagrams are extremely important to understand exactly how your app will interact with a myriad of Azure services after deployment, and I could not find many of those in the Microsoft docs.

A small sample of what's coming:


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-vuo24Wp74h5UJLMMZJFc4q.jpeg)

​


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-fS9wheF5KjCAxVe9qviL5y.jpeg)

​


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-tqZM64aB4Bbjj4GUtpuoQ5.jpeg)

​


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-o19zwt4Dfxzymw7gGLpKAT.jpeg)

​


![](/assets/images/2025-03-15/4ghDFAZYvbFtvU3CTR72ZN-8rgw39GDCubicDyKYXjHV.jpeg)

​

I'm finishing the last diagram now, which means next week will be the time to start recording the course.

As a reminder, all current bootcamp students will get access to this new Azure for .NET Developers course, with downloadable diagrams and full source code, at no additional cost, on day 1.

Until next week!

Julio

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Get your product in front of 25,000+ tech professionals​]({{ site.url }}/sponsorship)**: Reach decision-making engineering leaders. Slots fill fast. Reserve today.
