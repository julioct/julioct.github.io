---
layout: post
title: "Avoiding The DIY Authentication Trap"
date: 2025-01-18
featured-image: 2025-01-18/4ghDFAZYvbFtvU3CTR72ZN-3bB2gTtJYav5cDUyLqv2Qf.jpeg
issue-number: 68
---

*Read time: 9 minutes*
​

With Course 3 of the bootcamp finally launched, I'm now switching gears to Course 4, which will be all about deploying .NET apps to the Azure cloud, one of the most exciting parts of the bootcamp. 

One key thing you need to master before doing any sort of cloud development is Docker, which I believe most developers are not using yet. That's why I spent most of this week working on tons of new Docker-specific content, learning a few new things myself along the way. 

But as I was wrapping up Course 3 I kept finding tutorials and even paid courses that teach you how to implement a login endpoint in a backend API to generate JWTs, which will then be used to access protected endpoints.

This is fun for learning how to craft JWTs, but I'm concerned many folks, especially beginners, might assume that is the right way to move forward with their authentication strategy.

So today I'll show what's wrong with standing up your own login endpoint and what's the right thing to do instead.

Let's dive in.

​

### **The DIY Authentication Trap**
OK, so you are working on your new web app, which is made of an ASP.NET Core back-end and let's say an Angular, React or Blazor front-end.

You have protected the back-end API endpoints so they will only allow requests with valid JWTs, so you need to come up with a way to both:

*   <span>Authenticate your users</span>
*   <span>Generate JWTs after authentication</span>

Here's the naive way to implement this:


![](/assets/images/2025-01-18/4ghDFAZYvbFtvU3CTR72ZN-2nhtCXqHKzZuNWws3rx3fD.jpeg)

​

So, essentially:

1.  <span>The user enters a username and password in a login form on our front-end and submits.</span>
2.  <span>The front-end sends a POST request to the back-end with those credentials. </span>
3.  <span>The back-end takes the credentials and validates them.</span>
4.  <span>If valid, the back-end generates a JWT and sends it back to the front-end</span>
5.  <span>The front-end uses the JWT to make requests to protected endpoints in the back-end.</span>

What's wrong with this?

Many things:

*   <span>**You're a credential sponge:** Any attacker who compromises your API gets plain-text passwords, even through HTTPS.</span>
*   <span>**Brute force paradise**: Without proper IAM-level rate limiting, attackers can hammer your endpoint with leaked password lists.</span>
*   <span>**Compliance nightmare**: Processing raw credentials means dealing with strict security compliance and audit requirements.</span>
*   <span>**Liability magnet**: When breached, explaining why you didn't use established identity providers won't go well.</span>
*   <span>**Token security is hard**: Your JWT code probably mishandles key rotation, revocation, and session management.</span>
*   <span>**Future-proofing fail:** Adding MFA, social login, or SSO later becomes a massive headache.</span>
*   <span>**Delayed defense**: When new vulnerabilities emerge, you're stuck waiting for your next deployment instead of getting instant provider updates.</span>

Let's go over a better way to do this.

​

### **The Middle Ground: ASP.NET Core Identity**
ASP.NET Core Identity, a built-int ASP.NET Core component, provides APIs that handle authentication, authorization, and identity management.

When you use that, you don't have to write your own authentication endpoints, including login; instead, the framework will provide the already implemented endpoints.

So the flow would look like this:


![](/assets/images/2025-01-18/4ghDFAZYvbFtvU3CTR72ZN-hXeYX2tETXPkmmUG6L4PNJ.jpeg)

​

In this case:

1.  <span>The user enters a username and password in a login form on our front end and submits.</span>
2.  <span>The front-end sends a POST request to the back-end with those credentials. </span>
3.  <span>The back-end receives the request directly in the ASP.NET Core Identity Login endpoint.</span>
4.  <span>ASP.NET Core Identity validates the credentials.</span>
5.  <span>If valid, ASP.NET Core Identity generates a **proprietary bearer token** and sends it back to the front-end</span>
6.  <span>The front-end uses the bearer token to make requests to protected endpoints in the back-end.</span>

Is this better than the first approach?

Yes, because you are no longer re-inventing the wheel with your own implementation to generate tokens. Whatever ASP.NET Core identity is doing there is safe and should follow best practices.

Should you use it?

You can, but I wouldn't. Here's why:

*   <span>**Still handling raw credentials**: Your API is still receiving and processing plain-text passwords, even if ASP.NET Core Identity handles them properly afterward.</span>
*   <span>**Your database, your risk**: You're still responsible for taking good care of your own Users database, including password hashes and sensitive user data.</span>
*   <span>**No token customization:** You can't customize what comes in the generated tokens. They come as-is with minimal claims that tell nothing about what the user is allowed to do.</span>
*   <span>**No external authentication support:** There's no social login, SSO, or any other modern authentication support. You are essentially locking yourself into always requiring a username and password.</span>
*   <span>**Harder to scale:** When your application grows, migrating from ASP.NET Core Identity to a proper identity provider becomes more complex.</span>

In fact, here's what[ the official docs](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization?view=aspnetcore-9.0#use-token-based-authentication) say:

> *The tokens aren't standard JSON Web Tokens (JWTs). The use of custom tokens is intentional, as the built-in Identity API is meant primarily for simple scenarios.* 


So I would only use this to come up with a quick demo for my boss, thinking I'll need to use something else for the real deal.

What to do instead?

​

### **The Right Way: OpenID Connect**
There's no need to reinvent the wheel. OpenID Connect is the industry standard for authentication and authorization and should be used across all your protected apps.

The whole authentication flow is a bit complex, but at a very high level it looks like this:


![](/assets/images/2025-01-18/4ghDFAZYvbFtvU3CTR72ZN-3bB2gTtJYav5cDUyLqv2Qf.jpeg)

​

Notice that in this case, we have a 3rd actor: the **Authorization Server**. 

This is a separate service completely isolated from your back-end and whose only purpose is to securely authenticate and authorize your users, as well as generate standard JWTs.

So this time:

1.  <span>The user clicks a Login button in your front-end.</span>
2.  <span>The user is immediately redirected to the login page **in the authorization server**. </span>
3.  <span>The user enters username and password and submits. Notice that any other form of authentication could also be enabled in the authorization server.</span>
4.  <span>The authorization server validates the credentials.</span>
5.  <span>If valid, the authorization server generates a JWT and sends it back to the front-end.</span>
6.  <span>The front-end uses the JWT to make requests to protected endpoints in the back-end.</span>

Why is this the best option? 

Many reasons:

*   <span>**Credentials never touch your app:** Users enter sensitive data directly into the authorization server, completely isolating your application from credential handling.</span>
*   <span>**Standards-based security:** OpenID Connect and OAuth 2.0 are battle-tested standards used by tech giants worldwide, with continuous security improvements.</span>
*   <span>**Rich features out-of-box:** Social logins, MFA, password policies, brute force protection, and other security features come built-in.</span>
*   <span>**No credential storage:** User credentials are stored and managed securely by the authorization server, reducing your security and compliance burden.</span>
*   <span>**Flexible token claims:** JWTs come with standard claims plus easy customization options, without writing custom code.</span>
*   <span>**Single Sign-On ready:** You can easily add new applications to your ecosystem with centralized authentication.</span>
*   <span>**Universal compatibility:** Standard tokens work with any platform or framework, making it easy to add new services or migrate existing ones.</span>

Which authorization server to use? 

It doesn't matter, as long as it is OpenID Connect (OIDC) certified. I go over how to configure **Keycloak** and **Entra ID** for OIDC in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp), but you can choose from a myriad of other options like Duende Identity Server, Auth0, Google, Github, and many, many others.

​

### **But I want my own login form!**
I know, but **it's not safe**. You cannot be responsible for receiving credentials from your users, under any circumstance.

Besides, all authorization servers will offer you multiple ways to customize their login forms to match your app style. 

For instance, look at what happens when you try to log in to your ChatGPT account:


![](/assets/images/2025-01-18/4ghDFAZYvbFtvU3CTR72ZN-k9tzVnZKTCMPiMpF7FvBfa.jpeg)

​

You get redirected to Auth0! And you can either login with your ChatGPT account or with any of the social logins ChatGPT has enabled in Auth0 for their app.

OpenID Connect is the way!

​

### **Wrapping Up**
Please be safe and avoid a lot of future headaches by not reinventing the wheel. There is no reason to implement your own login endpoint and generate your own JWTs these days, regardless of what many tutorials or courses tell you.

This is why I decided to dedicate [an entire course](https://juliocasal.com/courses/dotnetbootcamp#course03-curriculum) to go over all of these critical security matters, and many other things you can't miss before going to the cloud.

Talking about the bootcamp, I better get back to working on those new Docker slides.

Stay safe!

Julio

---


<br/>


**Whenever you’re ready, there are 2 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**:​ Everything you need to build production ready .NET applications for the Azure cloud at scale.

2. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
