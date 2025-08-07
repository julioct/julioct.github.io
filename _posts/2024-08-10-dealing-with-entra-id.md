---
layout: post
title: "Dealing with Entra ID"
date: 2024-08-10
featured-image: image.jpg
issue-number: 46
---

*Read time: 13 minutes*
​

Wow, Entra ID has to be the most challenging identity provider to configure. I just finished integrating it into the [.NET Bootcamp](https://juliocasal.com/courses/dotnetbootcamp)'s Game Store application and I must admit it was not easy.

This is quite surprising since Microsoft builds Entra ID (previously known as Azure AD) and, as opposed to other providers like Keycloak, offers first-class support to interact with it from .NET applications.

Maybe I'm too used to simpler OIDC (OpenID Connect) implementations, like Keycloak or Auth0, but regardless I wanted to get this one properly integrated into the bootcamp since many folks have been asking for it and you likely don't want to deploy Keycloak to Azure when you have a robust service like Entra ID ready to go there.

Let's go over Entra ID and how I'm integrating it into the bootcamp application.

​

### **What we are trying to achieve**
We want to enable OIDC for our distributed system since it's the industry standard for authentication and authorization. And, in this case, our OpenID provider is Entra ID.

I won't explain how the OIDC protocol works here since I have already covered it on [my website](https://juliocasal.com/blog/Securing-Aspnet-Core-Applications-With-OIDC-And-Microsoft-Entra-ID) and dedicated an entire module of my [microservices program ](https://dotnetmicroservices.com)to OAuth 2.0 and OpenId Connect. 

But here's a high-level view of how things should work:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-se7qtPfkpi2efXK46ZBPrs.jpeg)

​

1.  <span>The end-user tries to access a page in the frontend that requires authorization</span>
2.  <span>The frontend talks to Entra ID to request authorization</span>
3.  <span>Entra ID prompts the user to sign in</span>
4.  <span>After a successful login, Entra ID returns an access token and an ID token to the frontend</span>
5.  <span>The frontend can use the ID token to identify the user (Hello Julio!)</span>
6.  <span>The frontend sends an HTTP request to the API gateway attaching the access token in the headers.</span>
7.  <span>The API gateway verifies that the request includes a valid token</span>
8.  <span>The API gateway forwards the request to the relevant Web API</span>
9.  <span>The Web API verifies and decodes the token to confirm it can authorize the request and potentially use the included claims.</span>
10.  <span>The Web API returns an HTTP response.</span>

​

Now let's see what we need from Azure to enable this.

​

### **Entra External ID configuration**
For this system, we don't want to use the standard Entra ID tenant you would use to manage identity internally across your organization. Instead, we want to use [Entra External ID](https://learn.microsoft.com/en-us/entra/external-id/external-identities-overview), which allows external identities to access your apps and resources.

You may have also heard about **Azure Active Directory B2C**, the predecessor to Entra External ID. That's what you would have used for this a while ago, but according to [these docs](https://learn.microsoft.com/en-us/entra/external-id/external-identities-overview?bc=%2Fazure%2Factive-directory-b2c%2Fbread%2Ftoc.json&toc=%2Fazure%2Factive-directory-b2c%2FTOC.json#azure-active-directory-b2c), it's a legacy solution now. So we'll stick to the latest and greatest.

You first create an Entra External ID tenant (docs [here](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-tenant-setup)), which is the entity that will hold all your applications, users, and groups, along with all the relevant permissions.

Then, you'll need to create at least 2 app registrations:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-p7cdDPGTamLAv5mVCYsjzz.jpeg)

​

Each app registration represents either a resource to protect (your backend APIs) or a client via which your users will try to access them (your frontend).

So you want to have one for your API Gateway and one for your frontend. I have one more for testing things via the Postman client.

The fact that we only have the API Gateway there and not every individual microservice may seem a bit surprising, but it's one of the benefits of having the Gateway. 

Your access tokens will be generated for the API Gateway, which will in turn verify the validity of the tokens before forwarding them to your microservices. 

Your microservices will still validate the tokens and decode the included claims, but won't have to waste resources on invalid tokens since those will get rejected by the Gateway right away.

In your API Gateway registration, you should define whichever scopes are required by your microservices:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-7ujSiEL9iwxCjtus7s7Q3x.jpeg)

​

Whereas the frontend should configure delegated permissions to request those scopes from the Gateway:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-hKD6FmgZLU8A7rww9rWYQ2.jpeg)

​

We call them "delegated" permissions because end users should provide consent before the client app can make use of the backend resources on behalf of them. You can, however, grant admin consent on behalf of all users in cases where you own the client, like in our case.

Another thing you are going to need, if you want to do role-based authorization, is what Entra ID calls **groups**. For instance, here we have 1 group, which I called Admin, meant to hold all application administrators:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-myEEPGCKH1gobh1i77ivG.jpeg)

​

However, that will not make those admins automatically acquire a **roles** claim, which is what we need to check roles in the microservices. For that, you have to go into each of your Entra ID applications and first define a role:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-x3hozvNRgi7dNaSSDdJZx.jpeg)

​

And then you assign that role to your previously created group, in the context of each application:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-c9PumNh23oz47VunEgCAEE.jpeg)

​

This took me ages to understand but has to be done that way because if you skip the groups part you would be forced to assign users to roles on each of your applications (like, 3 apps, 3 assignments), which makes no sense.

There are a few other small details to get this right, which I'll make sure to cover in detail in the bootcamp, but for now, let's briefly peek into one of those access tokens.

​

### **The Entra ID access token**
If everything is configured properly, here's how one of the access tokens requested via the frontend or via Postman should look like:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-j6DnCjEvi4PynNHtw6LLe7.jpeg)

​

The highlighted are the claims that your microservices will receive and that they can use to:

*   <span>Confirm the token is meant for them (aud)</span>
*   <span>Confirm the token was issued by the correct authority (iss)</span>
*   <span>Confirm the correct access was granted (scp == scopes)</span>
*   <span>Confirm the user belongs to the expected role (roles)</span>
*   <span>Identify the user on behalf of whom the request was sent (email, name, oid, etc.)</span>

​

The small detail there is that the audience (aud) is the ID of the API Gateway, not any of the microservices. The microservices will trust that such is the correct audience.

Now let's see what things look like in the code.

​

### **The microservice auth code**
Starting with the backend, what you want to do is use the standard JWT Bearer middleware to validate incoming tokens. Something like this:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-x9XUQZWiQh2AvzKAZXLrpS.jpeg)

​

The **MapInboundClaims** and **TokenValidationParameters.RoleClaimType** pieces are necessary to ensure the incoming access token claims land properly and the **ClaimsNormalizer** is a small class I created to normalize a few claims, like **scp** and **oid** into the ones I've been using with Keycloak and that are more standard, like **scope** and **sub**.

With that in place, each microservice can do this in its own **appsettings.json** file, which avoids hardcoding and lets us keep things a bit flexible:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-bYPGZGH1gctJF3gdkQJFvY.jpeg)

​

Here's also how we define one of the auth policies that the microservice will check:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-emLSoThpAaF26kgwhjqAsZ.jpeg)

​

What's great is that the same policy will work both for Keycloak and Entra ID given how we standardized the incoming claims. And, here's how the policy can be used:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-r4NJTU3vUW85ohE47yxRw4.jpeg)

Now let's see what's required in the API Gateway.

​

### **The API Gateway auth code**
Since all the API Gateway is doing is validating the incoming access tokens, its JWT bearer configuration is exactly the same as any of the microservices. 

What's new on the Gateway side is a custom policy we need to implement to support both Keycloak and Entra ID:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-fG5tj7gfiwvEKSGqYqcvYe.jpeg)

​

Then you would use that policy in the relevant reverse proxy route configurations:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-g4eu5TLqncfTz4VJpMkCcE.jpeg)

​

Finally, let's see what to do on the frontend side of things.

​

### **The frontend auth code**
For the frontend I wanted to try out the [Microsoft Identity Web](https://github.com/AzureAD/microsoft-identity-web/) authentication libraries as opposed to using the standard OIDC middleware, since it *should* make things easier to configure.

To start with, you'll define your OIDC configuration in appsettings.json like this:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-so9RhrKPFF75FEPTvuzQf1.jpeg)

​

Then you'll add this code to Program.cs:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-6VDLyLqG9aaJ4VdtiVAkcJ.jpeg)

​

A few key things about this configuration:

*   <span>The frontend must know which identity provider you want to use, which we keep in that **IdentityProvider** setting. The backend doesn't have this problem.</span>
*   <span>**CallbackPath** and **SignedOutCallbackPath** must be configured in your Frontend app registration in EntraID for signin/signout to work properly.</span>
*   <span>The **OID** claim has the unique ID of the user in your tenant, while **SUB** claim is a unique ID for that user within a single application (so weird!). </span>
*   <span>**AddMicrosoftIdentityWebApp()** will override some configurations with its own hard-coded values, no matter how you configure it. Had to do a small trick to set the right value for **NameClaimType**.</span>

​

Now that should get your frontend ready to sign in your users and even to display user properties and tell which sections of the frontend to show or hide.

The other important thing is how to have the frontend attach proper access tokens on outgoing calls to the API Gateway. You can do that in a **DelegatingHandler**:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-4g94yUvm7fYRBC7DhajqKp.jpeg)

​

Th **ITokenAcquisition** object is the hero here, which is registered by that **EnableTokenAcquisitionToCallDownstreamApi()** call you did before. 

That's how we get an access token for the current user with the specified scopes and then we just attach it to the Auth header on the outgoing request. That **.default** scope, by the way, is a bit magical, since it allows you to request all scopes exposed by the resource (so strange).

I have to say that I'm not very pleased with the Microsoft.Identity.Web library, its APIs, and configurations. <u>I hate magical stuff and I prefer to understand exactly what each line of code is doing in my app</u>, which this library is heavily trying to hide from me. 

So I might revert to the simpler OIDC middleware in the end, we'll see. But now let's take a look at the end result.

​

### **The end result**
With everything configured properly, you will see this when launching the app:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-k9hDRXk4My3zFNBwABa14Q.jpeg)

​

Notice the **Login** button and the lack of menu items at the top. They are hidden because we don't know who the current user is. Clicking on Login will take you to this Entra ID page:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-8gL9aRZoMY6SeAzG6UXg6H.jpeg)

​

Notice that the sign-in happens on the identity provider page, not on your site, as it should be for a proper/secure OIDC flow. Then after signing in, you get back to the site:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-xocKDD2VgAhcEYz44V7r4T.jpeg)

​

Notice that, thanks to the ID token, the site can now tell who logged in and what kind of permissions this person has. We can show menu items only available to signed-in users and even a fancy avatar, just for fun.

And we can even get to the shopping cart, which requires an authenticated request to our shopping basket microservice:


![](/assets/images/2024-08-10/4ghDFAZYvbFtvU3CTR72ZN-dsosVAaEN4dhG5uehNRMtm.jpeg)

​

So it's all working properly (uff!!!). And, remember, you only need to change 1 setting in the frontend to get the entire thing working with Keycloak instead. No need to touch the backend. 

And that's it for today. I'll do a bit more polishing on the frontend to simplify the Entra ID stuff and then I'll head right into getting all this deployed to the cloud.

Until next time!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​]({{ site.url }}/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.