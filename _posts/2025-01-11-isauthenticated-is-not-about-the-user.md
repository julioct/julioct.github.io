---
layout: post
title: "IsAuthenticated Is Not About The User"
date: 2025-01-11
featured-image: 2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-gSZTYB9dvrED8eZ3ds2or4.jpeg
issue-number: 67
---

*Read time: 8 minutes*
​

A few days ago I finished the audiobook version of [Nexus](https://amzn.to/3C1q5Lb), the latest book by Yuval Noah Harari, and wow, it's such an impressive take on the impact of AI in our society and what could come next.

One potential scenario mentioned in the book is the creation of AI-powered social credit systems, where governments or organizations score individuals based on their behaviors, decisions, and interactions. 

Governments today are already collecting an insane amount of data from all of us all the time via surveillance cameras, online activities, social media, and even financial transactions. 

What happens when you plug in a powerful AI model that can easily ingest all that data, analyze individuals' behaviors, and assign scores based on predefined "desirable" traits? 

AI models could then predict future behaviors based on historical data, pre-emptively penalizing or rewarding individuals, meaning that people could be punished not for what they’ve done, but for what AI predicts they *might* do.

Crazy, right? The *Nosedive* episode of the Black Mirror Netflix series portrays this exact scenario. And it aired back in 2016!

I really hope we can master AI before it masters us :)

And, in the meantime, let's focus on mastering the ASP.NET Core platform by learning how to use those JWTs in our apps.

Let's dive in.


![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-j4rJzN2meDoiVYcamzREku.jpeg)

​

### **Validating JWTs in ASP.NET Core**
​[Last week]({{ site.url }}/blog/understanding-json-web-tokens) we looked at JWTs, their structure, and the role they play in token-based authentication. For reference, here's the decoded token we were looking at:


![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-k5LHcxgqhRPPBAqomPqhci.jpeg)

But how to use those tokens in an ASP.NET Core API?

We could write some code to read and decode those tokens ourselves, but it's best to use the built-in authentication middleware that is designed to do exactly that.

You can start by installing the **Microsoft.AspNetCore.Authentication.JwtBearer** NuGet package and then add these few lines to Program.cs:


![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-bvsZebhzdv3V9FgoFGSRwx.jpeg)

​

The **AddAuthentication** call registers the core authentication services in the DI container, and **AddJwtBearer** configures the JWT Bearer authentication scheme so your application can accept and validate JWT tokens. 

Now, we usually add those lines and move on to the next thing without thinking too much about what's going on. 

But I think it's important to understand what **AddJwtBearer** is enabling for us behind the scenes:

*   <span>**Token Validation:** It ensures that the JWT has not been tampered with by verifying its signature.</span>
*   <span>**Issuer Check:** It validates that the token's issuer (iss claim) matches the expected value (http://localhost:8080/realms/gamestore).</span>
*   <span>**Audience Check:** It validates that the token's audience (aud claim) matches the expected value (gamestore-api).</span>
*   <span>**Expiration Check:** It verifies that the token has not expired based on the exp claim.</span>
*   <span>**Authentication middleware:** In minimal APIs, it automatically adds the Authentication middleware, saving you from having to also call **UseAuthentication**. </span>

And, if you are wondering about *RequireHttpsMetadata = false*, we need it because our issuer, Keycloak in this case, is running as a Docker container without TLS in our box, so we can't use HTTPS. This is safe for local dev, but a no-no in Prod.

With that out of the way, how do we receive and use the JWT info in our API endpoints?

​

### **Do we have a valid JWT?**
The first thing you may want to check in your back-end API is if the request has been properly authenticated, meaning that a JWT was included in the Authorization header and that the token is valid.

We can do that by injecting and using the **ClaimsPrincipal** class in our API endpoint:


![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-gSZTYB9dvrED8eZ3ds2or4.jpeg)

​

The ClaimsPrincipal user object represents the security context of the incoming request, while the **Identity** property there, which is a **ClaimsIdentity** object, is populated with all the claims extracted from the JWT.

What about that *IsAuthenticated == false* check? Would *true* mean that the user has been authenticated?

Not at all! 

> In a protected back-end API, IsAuthenticated doesn't confirm that the user exists, is active, or has appropriate permissions in your application. It simply reflects the validity of the JWT at the time of the request.


Remember that here we are in the back-end, not in a front-end application. All we have is an access token in the form of a JWT, which tells us what the client is authorized to do.

The token might include user-related claims, but it doesn’t guarantee the user's current state in your system. 

In other words, IsAuthenticated is purely about the validity of the access token, not the current state of the user or even whether a user is involved. 

OK, but how to read the info in the decoded JWT?

​

### **Reading JWT claims**
Assuming we got a valid JWT (IsAuthenticated == true), reading the claims is fairly straightforward.

For instance, here's a code snippet to grab either the **Email** claim or the **Sub** claim from the JWT:


![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-qwL8YfSRiCQo6rAHkinADE.jpeg)

​

All that will do is pull out the value from the corresponding claim from the **user.Identity.Claims** collection, which in this case will help us calculate the user ID based on either the email or the ID assigned to the user in the identity provider, as reported in the access token.

Now, many times when you try to read simple claims like that you quickly find out that both them return **null**. 

How can that be?

​

# Disabling the default claims mapping

What exactly is getting populated in that Claims collection of the Identity property? If using Keycloak as your identity provider, it may look like this:


![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-9zuCmgB15pkUZjYNcCKARz.jpeg)

![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-moPZp4eLUBU5pPke6pqNbp.jpeg)

Which means that the two claims we are trying to query in code actually have a different name: 

**sub** => http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier

**email** => http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress

That is why we can't read those claims (and a few others), but why is this happening?

Well, those strange **claim types exist primarily for historical and compatibility reasons, and they were meant to help integrate with Microsoft's broader ecosystem (as of who knows how many years ago). 

ASP.NET Core is automatically mapping our raw claims to these legacy claim types that most identity providers don't use today, especially in the context of the modern OAuth 2.0 and OIDC protocols.

How to fix this? Simple, just set **MapInboundClaims** to **false** in your AddJwtBearer call:


![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-jUZQ9pi6qPcVgNAd6GbrTr.jpeg)

​

Now when your endpoint receives a valid JWT, you will see a different set of claims:


![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-t5fUaVGkpTmQWXyDnSUEKC.jpeg)

![](/assets/images/2025-01-11/4ghDFAZYvbFtvU3CTR72ZN-sJMDBvsmDUZ9kNGrYeWndL.jpeg)

​

And your code will no longer have trouble reading those email and sub claims. Done!

Now there are more known issues with reading claims, like the **role** claim coming in the wrong place (which screws up role-based authorization) or the **scope** claim landing as a single string as opposed to an array of strings (which complicates claims-based authorization). 

If you are facing those issues, check out [the bootcamp,](https://juliocasal.com/courses/dotnetbootcamp) where I go over the right way to deal with them.

​
Until next time!

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://go.dotnetacademy.io/stripe-waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
