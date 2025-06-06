---
layout: post
title: "Shrink Your .NET Containers, Boost Your Deployments"
date: 2025-02-15
featured-image: 2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-65cSSNmYt6rxffDJhjrGGz.jpeg
issue-number: 72
---

*Read time: 5 minutes*
​

One of the reasons why containers are so popular for deploying any kind of backend application is the ability to go from zero to fully deployed in just a few seconds, as opposed to several minutes.

You can do this because containers are designed to be ephemeral and, ideally, stateless (like cattle), as opposed to traditional servers, which require special attention and care (like pets).

However, to achieve this benefit you must make sure your containers are as small and lean as possible so they can be downloaded to the Production box quickly and destroyed just as fast.

Today I'll show you how to take advantage of the latest features in both the .NET SDK and the .NET base images to help you significantly reduce the size of both your .NET app and the corresponding container images.

Let's dive in.

​

### **The target .NET app**
To keep the focus on the project and container image creation process, as opposed to the code, I'll use a very simple .NET Web app:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-2UGZyRGUg9Bxk4ae7h6Gcm.jpeg)

​

That is a small ASP.NET Core API with a single GET endpoint that will return info about the current OS and architecture.

Here's the corresponding project file:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-7JKJtiTAKxu5BF5EJ6vbZ3.jpeg)

​

Now let's turn that into a container image.

​

### **Containerizing the app**
Turning this app into a container image is very straightforward using the .NET CLI:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-wCZcJbHJpQBVJbSL2uDY1U.jpeg)

​

The console output will show the default selected base image:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-ahYdwNdcvPWQMz597hHg43.jpeg)

​

The created image image is about **320MB** in size:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-jEv5FwLqx2QdQaYd4hHCBx.jpeg)

​

And, if we run it, and invoke the GET endpoint, we'll see the chosen base OS for our container image is the Linux Debian distribution:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-dcmCgNKt6XVFf15uD9YiLE.jpeg)

​

Great. Now, let's make it smaller.

​

### **Trimming the app**
Trimming is the process by which your .NET app can be optimized for size by removing any unused code.

To enable it, you can turn on the **PublishTrimmed** property in your project:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-pxaxYsgr4wPQ7WFj8Yxp3y.jpeg)

​

After running the same *dotnet publish* command (just changed the tag to *trimmed*), here's what our image list looks like:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-eHuJmzVaUqDxFKqE52Gp7X.jpeg)

​

So we are down to **115MB**.

This is not just because unused code was removed, but also because the CLI noticed we enabled trimming and it switched the base container image to one that excludes unneeded dependencies:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-tTFT2Dh8Sd66TkxBoek4pE.jpeg)

​

But we can do better.

​

### **Removing globalization dependencies**
Since we are building a backend API, do we really need all the globalization support included with .NET? Isn't it enough to stick to an invariant culture for all string comparisons, case conversions, and number formatting?

For a backend API, that should be the case most of the time, so let's strip out all the extra globalization stuff with the **InvariantGlobalization** property:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-65cSSNmYt6rxffDJhjrGGz.jpeg)

​

When building the image, we'll see how a new base image is chosen:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-uSCpv65gAwuXNWiHjMjqqQ.jpeg)

​

And the resulting image is now down to only **58.6MB!**


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-5VohmFT7ELwGHHDXaVWU71.jpeg)

​

But, does this heavily reduced image actually work?

​

### **Testing the minimal image**
Let's run or final, super small image, and see if it works:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-uG8TfzxkoVRVPJFKEERQmc.jpeg)

​

And call the API:


![](/assets/images/2025-02-15/4ghDFAZYvbFtvU3CTR72ZN-wYKqy1w3eT16J8d42LgZ7X.jpeg)

​

All good! 

Notice the change in the base OS, since now we are running Ubuntu Noble Chiseled, which is significantly smaller.

But be aware that a base image like that is ultra-minimal, so it won't have:

*   <span>Any shell</span>
*   <span>Package managers like apt</span>
*   <span>Binary utilities (ls, cat, grept, etc)</span>
*   <span>glibc</span>

But if you are looking for the smallest, which also translates into the smallest attack surface, that should do it.

​

### **New Free Docker Course**
If you are a .NET developer, and want to get started with Docker, but have never used it before, here's a new free course you can watch on my YouTube channel:

[![video preview](https://functions-js.convertkit.com/playbutton?play=%233197e0&accent=%23ffffff&thumbnailof=https%3A%2F%2Fyoutu.be%2FcWMztQwIQNs&width=480&height=270&fit=contain)​](https://youtu.be/cWMztQwIQNs)

​[Docker for .NET Developers - Full Course for Beginners](https://youtu.be/cWMztQwIQNs)​

Docker is absolutely fundamental for anything related to cloud development, so every .NET backend developer should be up to speed with this amazing tech.

Enjoy!

Julio

---


<br/>


**Whenever you’re ready, there are 2 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**:​ Everything you need to build production ready .NET applications for the Azure cloud at scale.

2. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
