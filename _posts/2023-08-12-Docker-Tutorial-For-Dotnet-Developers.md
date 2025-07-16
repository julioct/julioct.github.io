---
title: "Docker Tutorial For .NET Developers"
date: 2023-08-12
layout: post
featured-image: 2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-fwQkrKM6hbQReqnUN1wkFr.jpeg
issue-number: 7
---

*Read time: 5 minutes*

Today you’ll learn how to use Docker to deploy your .NET apps.

Docker is incredibly useful for .NET developers, but it can be a bit overwhelming at first.

However, once you start using Docker, you will never want to go back to the old way of deploying your apps. Guaranteed.

So, in this tutorial, I’ll show you how to use Docker to deploy your .NET apps in 4 simple steps.

Let’s get started.

​

### **Why use Docker for my .NET apps?**
Docker is a tool that allows you to package your application and all its dependencies into a single image that can be deployed anywhere.

It brings in tons of benefits for .NET developers, like:

*   <span>**Consistency across your environments**, so your apps can run the same way on any environment.</span>
*   <span>**Simplified dependency management**, eliminating the need to install the correct OS or .NET dependencies on your server(s).</span>
*   <span>**Isolation**, so your app won’t run into conflicts with other apps running on the same server.</span>
*   <span>**Scalability**, so you can easily scale your app by running multiple instances of it.</span>
*   <span>**Efficient use of system resources**, so you can run multiple apps in the same server without wasting resources.</span>
*   <span>**Easy deployment**, so you can deploy your app in seconds, instead of hours or days.</span>
*   <span>**Broad cloud provider support**, since pretty much all cloud providers support Docker today.</span>

So, if you’re not using Docker yet, you should definitely give it a try.

​

### **How to use Docker to deploy my .NET apps?**
To start using Docker, you basically need to turn your .NET app into what is known as a Docker image and later run that image as a container in your production environment.


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-fwQkrKM6hbQReqnUN1wkFr.jpeg)

​

Specifically, here are the overall steps you need to follow:

1.  <span>Build a Docker image for your .NET app in your box</span>
2.  <span>Push your Docker image to a Docker registry</span>
3.  <span>Pull your Docker image into your production box from the Docker registry</span>
4.  <span>Use your Docker image to run your .NET app as a container in your production box</span>

Let’s go over each of these steps in more detail.

​

### **Step 0: Create your .NET app**
Skip this step if you already have a .NET app you want to deploy with Docker.

If you don’t have one, you can create the simplest ASP.NET Core API like this:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-2n3BLkuoox11udbyKsZ2VL.jpeg)

​

Run it:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-tqNyPF2s6DKg7RD43VwWLa.jpeg)

​

And send a GET request to it:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-gpLQkhHZWovS1xw3xByQe2.jpeg)

​

It will return a list of random weather forecasts:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-gyQZbreKNGwqbfReo7RARt.jpeg)

​

Let’s see how to dockerize this simple API.

​

### **Step 1: Build a Docker image for your .NET app in your box**
To build your Docker image you can either use a **Dockerfile** or the new **Container Building Tools** that started shipping with the .NET 7 SDK.

Either way, we are going to need the Docker daemon running in our box. Otherwise, we don’t have a way to run Docker containers.

So, if you don’t have it, please install **Docker Desktop** and make sure it’s up and running before doing anything else.

Let’s use the .NET container tools to build our image by running the following command in our terminal:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-ebjCiTpvYF2Sr7FpFdhSwF.jpeg)

​

You’ll get something like this:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-8UqTwLwz45A9GesRW2ZGHX.jpeg)

​

Your docker image is ready! And you can confirm it’s there by running this command:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-fw7WSnTiwFMf7ejjXFAuMg.jpeg)

​

Which will show your new image in the list:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-fqEHiKcqQQBXf25FF3sn5n.jpeg)

​

A few things to notice regarding the **dotnet publish** command we just ran:

*   <span>The **--os linux** parameter tells the tools to use a Linux base image.</span>
*   <span>The **--arch x64** parameter specifies x64 as our target architecture.</span>
*   <span>The **/t:PublishContainer** parameter triggers the actual publishing of our app as a container image.</span>

In addition, since ours is an ASP.NET Core app and the **TargetFramework** is net8.0, the tools inferred that we wanted to use the **mcr.microsoft.com/dotnet/aspnet:8.0** base image, which is the official .NET 8 base image for ASP.NET Core apps.

You can do a bunch of other customizations to your Docker images via the .NET Containers tooling, as detailed in the official docs.

​

### **Step 2: Push your Docker image to a Docker registry**
Now we need to push our Docker image to a container registry, which is a repository for Docker images. This can be a public registry like Docker Hub or a private registry like Azure Container Registry (ACR). 

Let's create a new ACR in our Azure subscription via the **Azure Command Line Interface (CLI)**:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-oGu5jM7pBPUcHVTLNSy6Sp.jpeg)

​

Now, let's retag our local Docker image to match the registry name and also to set a meaningful version:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-eoUGmY9g6AzrBtwXQGtajd.jpeg)

​

And, since Azure Container Registries are private, you have to authenticate first before you can push your Docker image there:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-c2DqufpSiB9Shc4uwZAnvg.jpeg)

​

And now you can push your Docker image to your registry like this:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-tvkCpv246PT7LXq9T63M1a.jpeg)

​

After a few seconds (or minutes, depending on your network speed) your image is ready in your registry:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-twYL7dLiAd5vc83ddWKU79.jpeg)

**​**

**Quick Tip:** Next time you make changes to your app you can build, assign a new tag and publish your Docker image to ACR in one shot using this command:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-M5iEAtJmgi6qgTqfV8tdc.jpeg)

​

Notice the **ContainerImageTag** parameter, which sets a new tag for your container image and the **ContainerRegistry** parameter, which specifies the target registry.

​

### **Step 3: Pull your Docker image into your production box from the Docker registry**
Any machine in your production environment (physical or virtual) that has Docker installed and can reach the Internet can now pull down your Docker image from your ACR.

So, in your production box, first run this command to login to your ACR:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-c2DqufpSiB9Shc4uwZAnvg.jpeg)

​

And then pull your Docker image from your ACR with this:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-2JXjo7qLxYdgpvroT1wzzP.jpeg)

​

You’ll get something like this:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-wHBPCpNnuGFP4AFo411bFe.jpeg)

​

And, just like that, your production box is ready to run your .NET app via your Docker image.

> No need to install the correct OS or .NET dependencies. No need to install your app. No need to configure anything. IT WILL JUST WORK!


​

### **Step 4: Use your Docker image to run your .NET app as a container in your production box**
It’s time to start your .NET app in your production box.

For this, all we have to do is run this command to run the app as a Docker container:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-bAEaeDCP9k9HBrAPBhpqmK.jpeg)

​

Regarding the parameters used with this command:

*   <span>The **-it** parameter tells Docker to run the container in interactive mode, so we can see the logs in the console.</span>
*   <span>The **–rm** parameter tells Docker to remove the container when it stops running.</span>
*   <span>The **-p 8080:8080** parameter tells Docker to map port 8080 in the container to port 8080 in the host machine.</span>

And, with the container running, you can now make a GET request to your API in the production box, this time using port 8080:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-aRVjJKHhmtHZobhRu6TK2z.jpeg)

​

Which will return a familiar output:


![](/assets/images/2023-08-12/4ghDFAZYvbFtvU3CTR72ZN-dYGrGGbCAom7nZZdqogEcK.jpeg)

​

Mission accomplished!

<br/>

### **How to run my docker container in the cloud?**
To run your containers in the cloud you can prepare a VM with Docker via your cloud provider or, if you don't want to have to prepare any production VM, and just run the containers, you can use services like Azure Kubernetes Service (AKS) or Azure Container Apps (ACA), which I cover in my **[Containers & .NET Aspire course]({{ site.url }}/courses/containers-and-dotnet-aspire)**.

And that's it for today. I hope you enjoyed it.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

2. **[Browse all courses]({{ site.url }}/courses)**: Everything you need to build, deploy, and maintain production .NET applications.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.