---
layout: post
title: "The Options Pattern: Stop Fighting Configuration in ASP.NET Core"
date: 2025-08-02
featured-image: 2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-aTFkT7ZWEUhdpebNn39RWu.jpeg
issue-number: 96
---

*Read time: 9 minutes*

Configuration hell is real.

You know the drill. You're integrating with some external API, and suddenly your endpoints are littered with config value lookups scattered everywhere.

**The result? Brittle, repetitive code that breaks when someone forgets to set a single environment variable.**

Your app starts up fine, then crashes when it hits that first API integration with null keys. Or worse—it fails silently in production.

There's a better way.

ASP.NET Core's Options Pattern validates your settings at startup, centralizes your configuration logic, and provides a friendlier developer experience.

Today, I'll show you how to stop fighting with configuration and start building apps that fail fast when misconfigured.

Let's dive in.

​

### **Use Case: Integrating the Stripe API**
Let's say we are integrating Stripe into our .NET backend, which we'll use to handle credit card payments from customers.

The first step in such integration is the creation of a **payment intent**, a digital "promise to pay" that sits between a customer clicking "buy" and the money actually moving from their account to ours.

In its simplest form, an ASP.NET Core API endpoint that can create a Stripe payment intent will look like this:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-sVZDWwVt68oRb1FNv1Z1Co.jpeg)

​

That uses the **StripeClient** (which abstracts our calls to Stripe's REST API) to create a payment intent of $10 (amount is in cents).

But to complete this integration, we need to provide 2 keys:

*   <span>**The API Key**, which grants our backend access to all operations in our Stripe account, like creating charges, refund money, access customer data, etc.</span>
*   <span>**The Publishable Key**, which is meant to be used by our frontend JavaScript to confirm the payment intent after the customer enters all payment details.</span>

We can grab both keys from Stripe's dashboard, but we don't want to hardcode them because they'll end up in version control, where anyone can steal them and compromise our entire payment system.

What's the alternative?

​

### **Using .NET configuration**
There are several ways to keep secrets out of your repo, with a popular approach being to use environment variables that your app will read at runtime.

But for local development, .NET applications can also use **user secrets**, which are easy to set via the CLI:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-f3y54wwGe15yPD3omVVNrw.jpeg)

​

That will store the keys out of your repo, somewhere in your machine's user profile dir. 

To read them, you can use the **IConfiguration** interface, which will resolve into an object automatically registered by ASP.NET Core and that contains all configuration values:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-8RgCU7pVnPZJ8eegZSX8YX.jpeg)

​

At runtime, your app will have no trouble reading the values:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-iCL6srBZT2pt11ADtVQcs6.jpeg)

​

That's better than hardcoding, but reading configuration like this on each of your endpoints creates a maintenance nightmare when you have dozens of endpoints all doing the same config lookups.

There's a better way.

​

### **The options pattern**
What you ideally want to do is read that configuration just once, in a central place, and give your endpoints a strongly typed way to access it.

That's what ASP.NET Core's **options pattern** enables, and it starts by creating a small class that represents the relevant configuration values:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-a8Tc9n6tYdu4LYs24jz31i.jpeg)

Then you can add an instance of StripeOptions to the DI service container and bind it to your Stripe configuration section with this:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-6zkzsJJtdm7ZwZS7jAf6Cc.jpeg)

​

And now all your endpoint needs to do is request an instance of **IOptions<StripeOptions>**, and read the keys from it:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-nUPfwRkeq1E1G2ZPZKdGZ9.jpeg)

​

You can use that same IOptions<StripeOptions> object across all your endpoints, significantly reducing code duplication and the performance overhead of repeatedly parsing configuration values on every request.

However, what happens if you are a brand-new dev on this repo and forget to set the user secrets before running the app?


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-2MxEobRv3bCgE3tQHioNqz.jpeg)

​

Looks like .NET happily constructed our StripeOptions with null values, which will totally crash all our Stripe-facing endpoints.

Let's improve this.

​

### **Options validation**
The values set on our options class should always be properly validated to ensure none of our endpoints receive invalid values.

We could manually validate the values before binding them to StripeOptions, but a better way is to use data annotations:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-4BnATsABQ1R17kFgiJXBLu.jpeg)

​

By using the **Required** attribute, we are declaring that both properties must have a non-null, non-empty value.

However, to enforce this, we also have to slightly change how we bind our configuration to Stripe options:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-4ELLxF2jwvjqKUgzSRfXMZ.jpeg)

​

By using this approach, we ensure that no instance of StripeOptions can be injected into any endpoint unless both of our keys have non-empty values.

So if we now run our app (without any user secret set) and invoke our endpoint, we'll get this:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-WLyiEKZ2VQ8tGjEUdWUns.jpeg)

​

That at least fails before we try to use invalid values to construct our StripeClient in our endpoint. 

But why wait until a request arrives, just to realize we are missing the keys? 

Better to fail fast on startup with one small change:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-d1NDCYzQsGg8z9gjgQwS9m.jpeg)

<br/>
Now, with those values still missing, our application won't even start:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-a3dL79HJqwAbAhZc3UDWp5.jpeg)

​

**This will save tons of time, not just during local dev, but also when we try to deploy the app to Prod, since our app won't even boot there if the values are missing, which we can catch instantly.**

Now, can we make life a bit easier for our devs?

Yes, we can.

​

### **Bonus: A better first run experience with Aspire**
All of our problems started because new devs need to remember to set the correct API keys for local development.

What if we just prompt the devs to enter the missing values the first time they run the app locally and let our dev tooling figure out the right place to store them?

Fortunately, this is a key scenario already enabled by .NET Aspire (if you are new to Aspire, I have a getting started guide [here]({{ site.url }}/blog/net-aspire-tutorial-build-production-ready-apps-from-day-1)).

After adding an Aspire AppHost project to your solution, you can start by declaring your API keys as application parameters:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-be1mMJoB9nzqkdXpcMUaJp.jpeg)

​

And then you can hand them over to your API as environment variables:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-7TcDAFmKmt2EQopaJtGsVs.jpeg)

​

That tells your application model that it needs those two parameters to start and that the API project requires them as environment variables.

Notice the convention used for the environment var names: a variable named **Stripe__ApiKey** has the same effect as a user secret named **Stripe:ApiKey.** Both will nicely map to our StripeOptions class.

Now let's run our AppHost and browse to Aspire's dashboard:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-aTFkT7ZWEUhdpebNn39RWu.jpeg)

​

Not only will our app not crash, but also: 

*   <span>It understands that there are required parameters with missing values</span>
*   <span>It puts the API project on hold until the missing values are entered</span>
*   <span>It offers a friendly way to enter the values right there</span>

All you need to do is click on the **Enter values** button, and paste the keys:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-3za5ATiKxKtDY1QUMtxBG.jpeg)

​

And after saving them, your API project will happily start:


![](/assets/images/2025-08-02/4ghDFAZYvbFtvU3CTR72ZN-AfDUEmTXiF3EHLbpMcG27.jpeg)

​

A great onboarding experience for new devs!

​

### **Wrapping up**
The Options Pattern isn't just about cleaner code—it's about building apps that tell you exactly what's wrong instead of failing mysteriously in production.

Stop scattering configuration lookups across your endpoints. Stop debugging null reference exceptions at 2 AM because someone forgot to set an environment variable.

**Centralize your configuration. Validate at startup. Fail fast when something's missing.**

Your future self will thank you when you're shipping features instead of hunting down configuration bugs.

And that's all for today.

See you next Saturday.

**P.S.** My upcoming **Stripe for .NET Developers** course dives deep into complete payment flows—from payment intents to webhooks and a complete e-commerce checkout experience. [Join the waitlist]({{ site.url }}/waitlist) to be first in line.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​]({{ site.url }}/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.