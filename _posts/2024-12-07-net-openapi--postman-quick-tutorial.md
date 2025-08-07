---
layout: post
title: ".NET, OpenAPI & Postman: Quick Tutorial"
date: 2024-12-07
featured-image: image.jpg
issue-number: 62
---

*Read time: 8 minutes*
​

This week I finally decided to upgrade my video recording gear and hopefully put my Logitec C920 to rest. I'm still waiting for that new Sony camera to arrive, but boy those things are expensive! 

A bit hard to justify since I rarely show up on camera (because getting ready for the camera is too much trouble and all of my videos are heavily scripted anyway), but I believe students deserve the best possible quality I can afford when I do show my face.

I also just placed an order for a new GPU to replace my old GTX 1080, so I can produce course videos much faster. NVIDIA cards don't seem to be the favorite these days (times have changed!) but went for an RTX 4070 anyway. Hope it was not a bad choice!

For folks who already joined the bootcamp, and those who are thinking of joining, I got a quick update on the upcoming Course 2 at the end of this newsletter, so please stay with me until the end.

Now let's get into today's topic: .NET, OpenAPI & Postman!

​

### **What is OpenAPI?**
In simple terms, OpenAPI is like a blueprint for your HTTP APIs—a standard way to describe your API's structure, endpoints, and behavior.


![](https://www.openapis.org/wp-content/uploads/sites/3/2023/05/What-is-OpenAPI-Simple-API-Lifecycle-Vertical.png)

​

An OpenAPI specification is usually a long JSON document that describes everything about your API.

But, why should you care? 

Well, a few reasons:

1.  <span>**No more manual API documentation.** With OpenAPI, you can generate documentation directly from your code via popular NuGet packages.</span>
2.  <span>**Smooth collaboration with front-end teams.** Instead of your front-end teammates constantly asking questions about what your API can do, they can use public tools to see real-time, interactive docs. </span>
3.  <span>**Rapid development with client code generation.** There are several tools that can generate .NET clients from OpenAPI specs, like AutoRest, Refit, and RestEase. No need to create typed clients by hand.</span>

Now, how do you generate this OpenAPI specification for your ASP.NET Core APIs?

​

### **Generating OpenAPI specifications**
Since most of us will either stay or move to .NET 8 for the foreseeable future, first I'll show you how to do this in your .NET 8 web apps (also works for .NET 6 and 7), and later I'll touch on .NET 9.

Start by installing one NuGet package:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-oUGeBBSvw6Eone5TJuRxq7.jpeg)

​

Then, in your Program.cs file, register 2 services:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-2r5aPqAQH9S6dzqYzM866u.jpeg)

​

The first one adds support to generate Open API documentation via the popular Swagger tool and the second one ****enables API endpoint discovery in ASP.NET Core minimal APIs.

Finally, register the middleware that will generate the JSON document:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-5Rjd5bYT5kp4aHgpNegKEs.jpeg)

​

Notice that middleware is only added for local development. Unless you are Stripe, GitHub, or a similar big API provider, you don't want to expose your API specification in your Production environment. 

Now you can run your app and navigate to this address in your browser:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-9eWshKUaVjDnvPsJjTKHQt.jpeg)

​

And you will get a big JSON document that will start like this:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-odHq8NivVgFPc9oGgCPVpb.jpeg)

​

It's quite long, so I collapsed most of it. But, you get the idea. 

Now, from here, many tutorials will focus on how to use that spec to generate a pretty web page to use as documentation for your API. 

However, as pretty as that can look, I can't remember the last time I used an OpenAPI spec just to render a documentation page.

Instead, let me tell you the primary way I use it.

​

### **Generating Postman collections from OpenAPI specs**
If you work with backend HTTP APIs, you likely work with Postman, the most popular API development and testing tool.

You would use Postman to craft requests that you can send to your APIs to ensure they work correctly without the need to involve your actual front-end application. 

That's what you do if you are starting with a brand new project, but if you are dealing with an existing code base and somehow nobody cared about creating and sharing a Postman collection with you, you can unblock yourself quickly by taking advantage of your OpenAPI specification.

Just grab the URL to your JSON document and paste it into Postman's **Import** dialog:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-rzrenFumJ77AE5mMWCoxdB.jpeg)

​

Once the import completes (takes 1 second) you'll get a brand new Postman collection ready to go:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-7RFomvDgW1iCK4si8ZQcpN.jpeg)

​

All the endpoints supported by your API are right there, ready for you to fill in the blanks for the specific parameters for each request. No need to craft requests from scratch.

Notice that there's even a **baseUrl** variable defined for your collection, which you can populate in a single place and reuse across all requests. 

I go over this in more detail in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp), including how to upload files to your API from Postman, how to generate access tokens to send along your request, and how to define environment-level variables so you can switch from local dev to Prod without modifying all your requests.

But now let's see how things changed with .NET 9.

​

### **Generating OpenAPI specs in .NET 9**
In .NET 9 they decided to stop relying on community-based NuGet packages for OpenAPI generation, mostly because the folks behind the Swashbuckle package were not actively maintaining it (or that's what I heard at least).

So, after upgrading to .NET 9, you can now start by installing a new NuGet package:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-oZ8Qs9BDW58zrieWda1x7G.jpeg)

​

Then register one service:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-wfVosLiHuDS49ptuyRU7Si.jpeg)

​

And finally, add the corresponding middleware:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-gvFE9L2gF5StnFZ9jDA1F8.jpeg)

​

With your app running, you'll now find your OpenAPI spec at this address:


![](/assets/images/2024-12-07/4ghDFAZYvbFtvU3CTR72ZN-pRs2Jv4ridm5cQMW3bHHhh.jpeg)

​

And, from there, you can go and import it into Postman the same way as before.

A small but very welcomed improvement!

​

### **Bootcamp Update**
As promised, I got a few updates on Course 2 of my .NET Cloud Developer Bootcamp: **ASP.NET Core Advanced**.

First, thanks to the huge support from all the folks who already joined the bootcamp, for Course 2 I was able to bring back my awesome video editor to help me with the finishing touches.

This saved me 3 to 4 days of work, which I invested in several other things needed to get the course ready (uploading videos, source code snapshots, handouts, quizzes, etc).

So we are on track for the **course release on December 10!** 

Second, I finally figured out a quick and cost-effective way to generate English captions for all the course videos. So, Course 2 will be released with **full English subtitles**!

Those subtitles won't be perfect, but from what I've seen so far, they are at least 95% accurate, which I think is pretty good, considering it's all AI-generated.

Plus, now that I know how to do this, I'll go back to include English subtitles in Course 1, ASP.NET Core Essentials, and will also include them in all future courses.

And, third, seems like I might be able to also generate subtitles in other languages. Not promising anything on this at this point, but please check out the survey above so I get your feedback, or reply to this email if subtitles in a different language would make a huge difference for you.

Now I'll go back to get those final touches for the launch of Course 2.

Until next time!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​]({{ site.url }}/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
