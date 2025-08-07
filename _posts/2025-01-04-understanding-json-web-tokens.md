---
layout: post
title: "Understanding JSON Web Tokens"
date: 2025-01-04
featured-image: 2025-01-04/4ghDFAZYvbFtvU3CTR72ZN-j8SfPVGJ6Ng73waYP8qEFS.jpeg
issue-number: 66
---

*Read time: 7 minutes*
​

Well, 2024 is gone, and wow it was such an amazing year in many aspects, but especially for software developers and AI enthusiasts.

As I look back, here are a few 2024 breakthroughs that I think set the stage for how we will be doing things moving forward:

*   <span>GPT-4o and Claude 3.5 Sonnet enabled more natural and versatile human-AI interactions, significantly changing the way we solve our everyday human problems.</span>
*   <span>AI coding assistants like GitHub Copilot and Cursor are now integrated deeply into our developer workflows, reducing mundane tasks and allowing more focus on creative problem-solving.</span>
*   <span>NVIDIA's market value went beyond $3 trillion, reflecting how tech giants like Microsoft, Google, and Amazon can no longer live without their powerful AI chips.</span>
*   <span>Microsoft's 365 Copilot, their Azure cloud, and all their developer tools are now heavily powered by a myriad of OpenAI services, reshaping human productivity and innovation at all levels.</span>
*   <span>.NET Aspire achieved not 1 but 2 major releases, reflecting the increasing demand for better tooling for cloud-native development with a strong focus on Azure.</span>

2025 is only going to get better, but boy, things are moving so fast!

Today I want to dive into JWTs (JSON Web Tokens), and the key role they play in today's web app security infrastructure.

Let's dive in.

​

### **What is a JSON Web Token (JWT)?**
Think of a JWT (pronounced "jot") like a digital VIP pass at a concert. Just as a VIP pass contains information about who you are and what areas you can access, a JWT contains claims about a user and their permissions. 

The key difference is that a JWT is cryptographically signed, making it tamper-proof.

To be more specific:

> JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties.


Now, before looking at real JWTs, I think it's good to understand the concept of a claim.

​

### **What is a claim?**
In our VIP pass, we have several pieces of information about the pass holder: 


![](/assets/images/2025-01-04/4ghDFAZYvbFtvU3CTR72ZN-j8SfPVGJ6Ng73waYP8qEFS.jpeg)

Each of these pieces of information is like a "claim" in JWT terms.

> A claim is a statement about an entity (typically, the user) and additional data.


Think about it this way: When Thomas shows his VIP pass to a security guard, that pass is making several claims on his behalf:

*   <span>**The name claim**: "I am Thomas A. Anderson"</span>
*   <span>**The access level claims**: "I have permission to enter the backstage area," "I can enter the green room," "I can attend the soundcheck"</span>
*   <span>**The time validity claim**: "My privileges are valid until December 31, 2025"</span>

In a JWT, claims work the same way. When your application presents a JWT to a server, it's like Thomas showing his VIP pass, which makes specific claims about Thomas and his granted access.

But what do these JWTs look like?

​

### **What's in a JWT?**
JWTs follow a 3 part structure:


![](/assets/images/2025-01-04/4ghDFAZYvbFtvU3CTR72ZN-vpXCA89xkW13PrJPqXKVLo.jpeg)

​

So there we got:

*   <span>**The Header**, which contains information about the type of token and how it was signed</span>
*   <span>**The Payload**, which contains all the transmitted claims </span>
*   <span>**The Signature**, ****which is calculated from the encoded header and payload, an added secret, and the hashing algorithm specified in the header. </span>

Now if you decode the payload of a JWT, as your Web app will do, you will get something like this:


![](/assets/images/2025-01-04/4ghDFAZYvbFtvU3CTR72ZN-k5LHcxgqhRPPBAqomPqhci.jpeg)

​

So it's just a list of claims related to Mr. Anderson and the access given to him in the system. 

To explain a few important ones:

*   <span>**sub:** The unique ID of Thomas in the system</span>
*   <span>**iss:** The URL of the authorization server that issued the token</span>
*   <span>**scope:** The type of access granted to the app, on behalf of Thomas, to use our backend API</span>
*   <span>**role:** The business role assigned to Thomas</span>
*   <span>**email:** Thomas's registered email</span>

But how are these JWTs used in real life and who creates them?

​

### **Token-based Authentication**
Let's say you have a backend API that gates access to everything related to the concert venues and that Thomas wants to securely check all that info from his phone.

Here is where we would use what is known as token-based authentication:

> **Token-based authentication** is a security mechanism in which a client authenticates itself to a server by presenting a unique token, which serves as a temporary credential to access protected resources.


It works like this:


![](/assets/images/2025-01-04/4ghDFAZYvbFtvU3CTR72ZN-9pPTQNSvd8HNyyn67Z6ty1.jpeg)

​

1.  <span>**Thomas Requests Authorization:** Thomas logs in through the mobile app to request access to concert details.</span>
2.  <span>**Authorization:** The authorization server checks Thomas’s credentials and approves his login.</span>
3.  <span>**JWT Issued:** The authorization server issues a JWT with all the claims that confirm the kind of access Thomas has been granted.</span>
4.  <span>**API Request:** The mobile app sends a request to the Concert Gate API attaching the issued JWT as a header.</span>
5.  <span>**API Validates JWT:** The API verifies the JWT for validity, expiration, and permissions.</span>
6.  <span>**API Responds:** The API returns the requested concert details to the mobile app.</span>

​

Now, how do you deal with these JWTs in your ASP.NET Core APIs? Let's tackle that in next week's newsletter. 

And, if you need to learn how to configure Keycloak, a popular open-source authorization server, to authenticate your users and generate JWTs, I go over all those details (and lots more) in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp).

​

### **New ASP.NET Core Security course: recording complete!**
Earlier this week I finished recording course 3 of the bootcamp: **ASP.NET Core Security** and, as expected, it ended up being the largest course in the bootcamp yet.

This course is a bit longer to make sure you are ready to answer questions like:

*   <span>How does ASP.NET Core validate and extract info from the JWTs attached to your requests?</span>
*   <span>How do OAuth 2.0 and OpenID Connect (OIDC) work?</span>
*   <span>How to read and transform claims?</span>
*   <span>What are and how to use different authentication schemes?</span>
*   <span>How to implement different types of authorization policies based on JWT claims?</span>
*   <span>How can a full-stack application integrate with Keycloak to offload user login and registration and enable OIDC?</span>

And tons of other stuff, including a mini-course on Docker for students new to that popular tech.

I'm now going through all the post-production work, which ended up being a bit more than anticipated, but if all goes well this course should be ready for all bootcamp students by January 14.

Now, back to work.

Until next time!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​]({{ site.url }}/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.
