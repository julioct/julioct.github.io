---
layout: post
title: "Fixing Claims the Right Way"
date: 2025-01-25
featured-image: 2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-6ad75KeYH3pvkQAfcfY2w6.jpeg
issue-number: 69
---

*Read time: 5 minutes*
​

It's flu season in the US and after my 5yo went down with a cold, sure enough, one of my other kids followed and then it got me. So it's been a tough week, but hope to be recovering by the time you read this.

On top of that, seems like it's time for a full Windows reinstall because this box has been giving me so much trouble lately. 

But before getting into that adventure, I thought it would be best to finish this newsletter, where I'll cover a topic many of you will have to deal with when working with JWTs: **claims transformation**.

This is something you end up having to do frequently given the different ways that each identity provider emits their claims, which in many cases do not match what your application expects.

So today I'll show you two ways to transform the claims you receive in your JWTs so they match what you need.

Let's dive in.

​

### **The problem**
Let's say your ASP.NET Core API backend requires a specific *scope* claim to authorize access to most of its endpoints.

To achieve that we have defined our authorization policy as a fallback policy like this:


![](/assets/images/2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-8JMCjsoDkFeiM6Mu9dYm9N.jpeg)

​

Making it a fallback policy means it applies to all endpoints by default, requiring a value of *gamestore_api.all* in the *scope* claim that should come in the access token.

The only problem is that the identity provider we are using, Keycloak in this case, is sending the scopes like this in the access token:


![](/assets/images/2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-gXaMRQcbonYVr3QNdXkvN2.jpeg)

​

So it is including both the *profile* and *email* scopes there, along our *gamestore_api.all* scope, but it puts all of them in a single string. 

ASP.NET Core should be smart enough to find our scope in that string, no? 

Sadly no, which we can tell from our logs when trying to send a request with that access token:


![](/assets/images/2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-mqA2xH34a6abGEYdPjrRJa.jpeg)

​

It fails because it expects our scope to have the value of *gamestore_api.all*, and nothing else. 

We can fix this either by configuring our identity provider to emit the claim the way we need it or by adding code to our app to transform the received claim into what we need.

Since many times we can't make that kind of modification to the identity provider, it's good to learn how to do this by writing some code in our app.

Let me show you a couple of ways to do this:

​

### **Using IClaimsTransformation**
**IClaimsTransformation** is an interface that can be used to add extra claims to your ClaimsPrincipal, which contains all the claims that came with the access token.

Here's one implementation that can help us solve our issue:


![](/assets/images/2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-d8PrkdxVEU1MfeSL16NTk1.jpeg)

​

As you can see, all we do is grab the current scope claim, split it into individual values for each scope, remove that claim, and then add one new scope claim for each of the individual scopes.

Then, you register your new class with the service container:


![](/assets/images/2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-4LE6oYWPYDBHHUbc7n5uu3.jpeg)

​

With that in place, the authorization policy check will succeed since the claims now show up like this:


![](/assets/images/2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-8XGDEoUtKLPK1YBMNMjHgG.jpeg)

​

That all works great when you have only one authentication scheme, Keycloak in this example, but when you have more than one it's not an ideal solution.

Say you have configured both Keycloak and Entra ID schemes. In that case, the claims transformation code will run for claims coming from both identity providers, even when they are going to be very different, which complicates things.

That's when I prefer to use the second approach.

​

### **Transforming claims via OnTokenValidated**
This second approach is very similar to the first one, with the main difference being that the class we will create will be tied to a specific authentication scheme. 

Here's the class:


![](/assets/images/2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-6ad75KeYH3pvkQAfcfY2w6.jpeg)

​

As you can see, it's almost the same thing as before, but we start from a TokenValidationContext object instead and figure out the rest from there.

Just like before, we will register this class with the service container:


![](/assets/images/2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-bpT796EUoAxqVYB1CbxxeP.jpeg)

​

But then comes the key part. We add a handler for the **OnTokenValidated** event when configuring our Keycloak JWT bearer scheme:


![](/assets/images/2025-01-25/4ghDFAZYvbFtvU3CTR72ZN-i4gbbi5NwpzVbXLkQbLUWD.jpeg)

​

With that, every time a token produced by Keycloak is validated, our transformer code will execute and fix the scope claim.

And if you later need to add another scheme, like Entra ID, you can add a new claims transformer that will work with the specific claims used by that identity provider.

Mission accomplished!

​

### **Wrapping up**
If you would like to know more about Keycloak integration with ASP.NET Core, I got all that covered in course 3 of [the bootcamp]({{ site.url }}/courses/dotnetbootcamp).

Now I'll get back to reinstalling this Windows box and hope I don't miss anything important along the way :)

Until next time!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​]({{ site.url }}/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
