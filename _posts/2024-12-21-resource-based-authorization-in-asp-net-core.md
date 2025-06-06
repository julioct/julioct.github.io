---
layout: post
title: "Resource-Based Authorization in ASP.NET core"
date: 2024-12-21
featured-image: image.jpg
issue-number: 64
---

*Read time: 8 minutes*

Wow, Blazor has quite a few fans! And I think I now understand why.

Last week I announced that I would be switching the front-end included in my bootcamp from Blazor to React, and a few of you replied expressing your disappointment with this news.

So, just to be sure about this move, I sent a quick poll last Monday specifically to current bootcamp students, and this is what they told me:


![](/assets/images/2024-12-21/4ghDFAZYvbFtvU3CTR72ZN-8vyU7bNMQSvtaF2iN5pso8.jpeg)

​

This confirms React is still a top Web UI Framework choice. 

However, it also tells me that a very significant proportion of students do want to stick to Blazor for their front-ends, which makes the decision not that simple.

So, at the end of this newsletter, I'll tell you what I'm going to do regarding the bootcamp front-end moving forward.

Now, let's dive into the topic of the day.

​

### **What is resource-based authorization?**
To understand this, think about your Amazon shopping cart. Who should be allowed to manage that cart?

Of course, nobody other than you should be allowed to do that. Well, perhaps someone with very high powers at Amazon, an administrator, might also need this type of permission, just in case.

But, in essence, we can't let random people mess around with your particular shopping cart. There is an authorization policy there that establishes who can access that specific resource.

**So, resource-based authorization is a way to control access to specific resources by evaluating the resource's properties or the user's relationship to it.** 

How to set up this kind of authorization policy in ASP.NET Core?

​

### **Implementing a resource-based handler**
Before implementing a resource-based handler, you should understand two key ASP.NET Core security concepts:

*   <span>**Authorization requirement.** A collection of data parameters that a policy can use to evaluate the current user principal.</span>
*   <span>**Authorization handler.** A class responsible for the evaluation of a requirement's properties. </span>

In our shopping cart example, the requirement is that the shopping basket can only be accessed by the basket owner or by an administrator.

The corresponding authorization handler should verify that such a requirement is met given a specific shopping basket instance and the current user in the system.

**A resource-based handler is an authorization handler that specifies both a requirement and a resource type.**

So, let's first define our resource type, our shopping basket, where the ID is the ID of the user that owns it:


![](/assets/images/2024-12-21/4ghDFAZYvbFtvU3CTR72ZN-7bzT7YBe4FDoYxjNy6uKDo.jpeg)

​

Then, let's define our requirement, which needs to implement **IAuthorizationRequirement**:


![](/assets/images/2024-12-21/4ghDFAZYvbFtvU3CTR72ZN-jZHB2bW8dsE8u1uPtus2ev.jpeg)

​

It's a pretty dumb class, but it's all we need for our purpose here.

With those two ready, we can now implement the resource-based handler:


![](/assets/images/2024-12-21/4ghDFAZYvbFtvU3CTR72ZN-o21CaLHht7UVuRn7Kq5p2m.jpeg)

​

The handler will first extract the ID of the current user, which is available in the **sub** claim. 

Then it will check if that user ID matches the ID of the owner of the received basket, or if the current user has an Admin role.

If either of those is true, it marks the requirement as being successfully evaluated.

Otherwise, requirement evaluation fails.

Now you are ready to enforce this requirement in your endpoints.

​

### **Using a resource-based handler**
First, you'll need to register your new handler with the service container:


![](/assets/images/2024-12-21/4ghDFAZYvbFtvU3CTR72ZN-rLL7tfBNKkpXnR9HdRBUJm.jpeg)

​

Then you can use it in your endpoint:


![](/assets/images/2024-12-21/4ghDFAZYvbFtvU3CTR72ZN-guWGnff4A1euD2DoW3GS4E.jpeg)

​

Here we inject an instance of **IAuthorizationService** and we use it along with the current user, the requested shopping basket, and our requirement, to check if the user is allowed to access that basket.

Notice that this makes it very easy to reuse that authorization check in any other endpoint, without the endpoint having to know anything about the logic behind the check.

This is just one way to perform authorization checks in ASP.NET Core, along with **role-based authorization**, **claims-based authorization**, and **policy-based authorization**, which I cover in detail in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp). 

All .NET web developers should understand how authorization works in ASP.NET Core. It unlocks so many scenarios and knowing this in-depth will save you from so much trouble later.

​

### **Why people are embracing Blazor**
Here's what one student told me after my previous announcement:

> *The company I work for is a completely Microsoft-focused company from ASP.NET front-ends to Azure services, etc. We have no React devs and no plans to ever introduce React...A lot can still be learned about Blazor, it's component system, integrations with auth providers such as Microsoft Entra ID/ASP.NET Core Identity/Keycloak, various 3<sup>rd</sup>* *party integrations (i.e. Stripe), etc by seeing working solutions written by others and that was my hope.* 


​

And here's another reply:

> *There are tons of places to learn React and other front ends. There are far fewer places to thoroughly learn Blazor. If the teachers focused on .net don't teach Blazor, who will? There are many places to start learning Blazor, but not many teachers working with a close to real-world app and development process.*


​

Which is fascinating! 

People are not necessarily jumping into Blazor because they have nothing better to learn, but because they belong to one of probably hundreds of Microsoft shops out there with a huge amount of years old ASP.NET code bases that are probably still using Razor pages, MVC, or even Web Forms. 

And all that needs to get upgraded to the latest and greatest. And what is the latest and greatest next step for Razor pages, MVC, and Web Forms? 

**Blazor!**

**​**

### **The Blazor front-end stays**
Now that I understand this, here's what I'll do:

**1. The Blazor front-end stays.** All courses in the bootcamp will include the pre-built Blazor front-end as planned. No changes here.

**2. A lesson explaining the Blazor front-end.** Starting with the 3rd bootcamp course, ASP.NET Security, I'll include at least one lesson where I'll explain relevant topics regarding how the front-end powers the end-to-end experience.

**3. A bonus React front-end.** Since I already finished the React front-end for course 3, and several students prefer React, I'll include it as an exclusive bonus for all current students and anyone who joins during the launch week of Course 3.

​

However, just to be clear:

**1. This bootcamp is not about the front-end.** I spent 10+ years working on cloud backends, so that's the main thing I can and will teach for the foreseeable future.

**2. I can't support 2 front-ends.** The amount of content in this bootcamp is already massive, so working on 2 front-ends moving forward is too much. I'll provide the React front-end as a one-time bonus of Course 3, with a good README file, but that will be it. The next courses will include only the Blazor front-end.

​

### **Wrapping up**
Course 3, ASP.NET Core Security, is now in full production! 

I must admit I'm a bit behind schedule thanks to my fun adventure with React and a few technical issues I faced with my recording software, but hopefully, things will go much more smoothly from here on.

I'm actually amazed about the amount of concepts that need to be covered in this third course to fully grasp industry-standard security and authorization practices with ASP.NET Core. 

Seems like it's going to be the longest course so far. And it will be the best ASP.NET Core Security course on the market. Or, at least, that's my hope.

Until next time!

Julio

---


<br/>


**Whenever you’re ready, there are 2 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**:​ Everything you need to build production ready .NET applications for the Azure cloud at scale.

2. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.
