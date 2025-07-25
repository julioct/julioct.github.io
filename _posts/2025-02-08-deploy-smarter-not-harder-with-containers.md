---
layout: post
title: "Deploy Smarter, Not Harder with Containers"
date: 2025-02-08
featured-image: 2025-02-08/4ghDFAZYvbFtvU3CTR72ZN-v4pnZxCkqawYMnjEpyQgRk.jpeg
issue-number: 71
---

*Read time: 7 minutes*
​

A few days ago I was chatting with a good friend about the project he's working on at Microsoft, which turns out to be all about the backend side of a popular product used by millions every day.

What surprised me is that even when he works on the backend, which his team must be deploying somewhere, he had no idea what I was talking about when I asked him if they use Docker for that.

If a Microsoft employee who works on the backend is not on the Docker train yet, I can only wonder how many backend devs are still missing out on the powerful benefits of containers.

So today I'll give you a brief overview of how containers compare to virtual machines and why you should seriously consider making the leap.

Let's dive in.

​

### **The problem with virtual machines**
Even if you don't know about containers, I bet you have at least heard about virtual machines, and hopefully, you are using them either on your physical servers or in the cloud.

Virtual machines (VMs) are a really nice improvement over bare metal deployments (when you deploy directly to a physical server) allowing you to create computers that exist as software rather than hardware.


![](/assets/images/2025-02-08/4ghDFAZYvbFtvU3CTR72ZN-jFjDvvKb9L2yCFSdprJrS8.jpeg)

​

And, this is possible thanks to a special piece of software called the **hypervisor**, a resource manager that takes your physical hardware and creates virtual versions of these resources, allowing multiple VMs to safely share the same physical computer.

This means that each of your VMs can have:

*   <span>Its own operating system</span>
*   <span>Its own version of the .NET runtime</span>
*   <span>Its own version of your applications</span>

This capability introduced dozens of great benefits over using physical hardware directly, but eventually, it also introduced its own set of challenges:

*   <span>**Significant RAM/disk overhead.** Because each VM includes a complete OS.</span>
*   <span>**VM image creation pain.** It can take hours to create a VM, even worse if you missed something the first time.</span>
*   <span>**VM provisioning is too slow.** Can take several minutes.</span>
*   <span>**Boot time is too slow.** You are booting an entire OS every time, which again can take several minutes.</span>
*   <span>**Only so many VMs per server.** Because you only have so much RAM and CPU available in the physical server.</span>
*   <span>**Wasted resources.** Even for a small app, you'll end up wasting tons of resources just for the OS of each VM.</span>
*   <span>**Multiple OS instances to patch.** Now you need to patch the OS of every new VM, besides the one on the physical server. </span>
*   <span>**Hard to version-control VM images.** How to tell what exactly went into a specific VM version and how to roll back if needed?</span>

To deal with all of those issues, we need to look into a different kind of virtualization: **containers**.

​

### **Containers: next-level virtualization**
Containers represent the next evolution in virtualization technology, taking a completely different approach that focuses more on virtualizing what your app actually needs.

Every OS is divided into two key components: the **kernel** (the core part of the OS that directly controls the hardware) and the **user space** (where your applications and most system services live).

In the containers world what we do is leave that OS kernel alone (no hypervisor) and instead, we introduce what's called a **container runtime** in the user space. 


![](/assets/images/2025-02-08/4ghDFAZYvbFtvU3CTR72ZN-v4pnZxCkqawYMnjEpyQgRk.jpeg)

**​**

**Docker** is the most popular container runtime, and its job is similar to what a hypervisor does for VMs, but much more lightweight. 

Instead of creating entire virtual computers, it creates isolated spaces within the existing operating system, which we call **containers**, where the applications can run.

Each container will have:

*   <span>The OS user space components</span>
*   <span>The runtime environment needed by our application (.NET in this case)</span>
*   <span>Our actual application</span>


> *Instead of having a complete OS like in VMs, we only include the specific components our application needs to run. Everything else, particularly the kernel, is shared with the host OS.*


This new way of virtualizing things enables tons of benefits:

*   <span>**Minimal resource overhead.** Containers share the OS kernel and only require user-space components, dramatically reducing RAM and disk usage </span>
*   <span>**Near-instant image creation.** Containers are created in seconds, instead of hours.</span>
*   <span>**Fast provisioning.** Containers are regular processes that don't need to boot an entire OS.</span>
*   <span>**Environment consistency.** Containers include everything needed to run your app. Eliminates the "it works on my machine" problem.</span>
*   <span>**High-density deployments.** With no OS overhead, you can deploy far more containers than VMs on the same hardware.</span>
*   <span>**Efficient resource usage.** No more wasted duplicated resources thanks to the shared OS kernel.</span>
*   <span>**Built-in versioning.** Container images come with a built-in versioning mechanism, making it trivial to deploy a specific version or rollback to any version when needed</span>

OK, so, given all these benefits, we should just stop using VMs altogether, no? 

Not necessarily.

​

### **Getting the best of both worlds**
Instead of choosing between VMs and containers, you can combine them to get the best of both worlds.

For any given physical server, you can use a hypervisor to create your fully isolated VMs, each one potentially hosting a completely different OS.


![](/assets/images/2025-02-08/4ghDFAZYvbFtvU3CTR72ZN-rhvAvaqHh4Usa5GNFV3FXi.jpeg)

​

Then, inside each VM we can run a container runtime like Docker, which lets it host multiple containers that share that VM's kernel.

This hybrid approach is exactly what major cloud providers like Azure, AWS, and Google use to run thousands of customer workloads. 

It gives you the bulletproof isolation of VMs between different customers or environments, while still letting you get all the efficiency and speed benefits of containers within each VM.

> *It's not about choosing between VMs or containers - it's about using them together in a way that maximizes their respective strengths.*


​

### **The bottom line**
Containers are a life-changing technology, especially for backend developers. Not only do they simplify your developer life, but they also make things much easier for the folks who deploy apps to Prod.

Whenever you are ready to make the leap, or if you just want to try containers first-hand with a real-world .NET project, and see if that might work for you, I got all that covered in [the bootcamp]({{ site.url }}/courses/dotnetbootcamp).

Now, back to work on Course 4, Azure for .NET Developers, which with 14 planned modules, seems like will be my most packed course yet.

Until next week!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://go.dotnetacademy.io/stripe-waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
