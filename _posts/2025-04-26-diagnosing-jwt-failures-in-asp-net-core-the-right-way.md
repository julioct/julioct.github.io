---
layout: post
title: "Diagnosing JWT Failures in ASP.NET Core the Right Way"
date: 2025-04-26
featured-image: 2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-fFN6Mw9LzCnnLcK8RuAGc4.jpeg
issue-number: 82
---

*Read time: 5 minutes*
​

A few days ago, while recording my latest YouTube video, I kept hitting 403 errors when calling my .NET API from Postman—even though I was passing what looked like a valid access token.

At first, I tweaked the usual config values, trying to brute-force my way through it. No luck.

So I stopped guessing and did what every developer should do in this situation: turn on the right logs and dig into what the API was *actually* doing.

What I found is a common trap many ASP.NET Core developers run into when configuring JWT authentication.

In today’s issue, I’ll show you exactly how I diagnosed the problem, and how to fix it for good.

Let’s dive in.

​

### **The problem**
I had configured JWT-bearer authentication in my ASP.NET Core API along these pretty standard lines:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-sPJUpvqeYbY7Jpp47pfUCd.jpeg)

​

And the values I had configured in appsettings.json for Authority and Audience, which I got from my Entra tenant, were all correct.

However, when I sent a request to my API from Postman after acquiring an access token from Entra, all I got was a **403 Forbidden error**.


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-jC9tTcNCxJMyu5YtjVkVBY.jpeg)

​

This means the JWT attached to the request was valid, but it was getting rejected by my authorization policy, which by the way was configured like this for the PUT endpoint I was working on:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-3gcZMx3etcq3JM1VoEbNSm.jpeg)

![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-gBeD3RweZRH3ouFJYrzypt.jpeg)

​

And after decoding the JWT, it seemed to have the correct scope and role:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-gehRptJurXxD9KdD2haw3F.jpeg)

​

What's going on?

​

### **Turning on the logs**
There's a crazy amount of useful logging happening behind every ASP.NET Core application, and in cases like this, logging is the best way to tell what's going on.

The challenge is knowing what to turn on. In this case, enabling logs for the authentication and authorization middlewares in appsettings.json, is likely our best bet:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-fFN6Mw9LzCnnLcK8RuAGc4.jpeg)

​

Now, after running the app and trying that failing request again, here's what we see in the logs:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-6h5F2m71WU5tYEP8FKT1Tt.jpeg)

​

Great! We don't know the exact problem yet, but the new logs at least tell us that the problem is related to the **scp** and **roles** claims.

The next step is to add a bit more logging around our claims.

​

### **Logging all claims**
Since our decoded token looks all fine, the problem must be with how our app is reading those claims. 

To figure this out, we can log the exact claims our app is receiving by handling the **OnTokenValidated** event, which triggers after the JWT is successfully validated:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-vfsBp2ncD9G9G8VpxT5C7N.jpeg)

​

I like to use **LogTrace** here to make sure none of that is logged unless I really want to view the claims by turning on **Trace** level in appsettings.json:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-ju3yXCxfkockQuGTMPi4JE.jpeg)

​

Now, let's run the app and send the request again to see what additional info we get in the logs:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-n3axcX4kcoLbkRxc6rBL6K.jpeg)

​

Nice, now we can see what's going on. The values for our role and scope are there, but they are in unexpected claims.

We are getting these:

**http://schemas.microsoft.com/identity/claims/scope** ==> gamestore_api.all

**http://schemas.microsoft.com/ws/2008/06/identity/claims/role** ==> Admin

But we were expecting these:

**scp** ==> gamestore_api.all

**roles** ==> Admin

Fortunately, this is a well-known ASP.NET Core issue with a very easy fix.

​

### **Keep the claims as-is**
For legacy reasons, ASP.NET Core likes to map incoming claims to claim types that made sense many years ago if you were integrating to proprietary systems in the Microsoft ecosystem.

But none of that makes sense these days, so what we do is ask ASP.NET Core to not do any mapping and just keep the claims as they come in the token.

Easy to do by setting **MapInboundClaims** as **false** in the options:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-kLNh82TdUCvvDa7QK2Axuy.jpeg)

​

Now we try that failing request again, and **Success**!


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-5sgySbYbnZuDamxGzrM2ix.jpeg)

​

Which is certainly because our claims are landing the right way into our app now:


![](/assets/images/2025-04-26/4ghDFAZYvbFtvU3CTR72ZN-bTdjVV2xf21amCyF73jZnj.jpeg)

​

Mission accomplished!

​

### **New YouTube video**
Dealing with Microsoft Entra (aka Azure AD) in .NET applications could not be more confusing, given so many moving pieces on top of the already complex OpenID Connect protocol.

So I thought I would create a video to show the basics on how to secure both an ASP.NET Core API and a Blazor web app with Entra:

<iframe width="560" height="315" src="https://www.youtube.com/embed/SZTsdOpEb8M?si=9CsJN3MvNy4Jcact&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
​

And if you need to go next level, I dive into many other essential topics in a real-world Entra integration with a full-stack .NET Web application in [the bootcamp]({{ site.url }}/courses/dotnetbootcamp).

Until next time!

Julio

---

<br/>

**Whenever you’re ready, there are 2 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: Everything you need to build production-ready .NET applications for the Azure cloud at scale.

2. **[Promote your business to 20,000+ developers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.