---
layout: post
title: "Horizontal Scaling with Containers, .NET Aspire and Azure Container Apps"
date: 2025-07-05
featured-image: 2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-3oXMaAqeqxEgsCGtjyB967.jpeg
issue-number: 92
---

*Read time: 10 minutes*

Picture this: your .NET API is cruising along in production, handling a few hundred requests per second without breaking a sweat. 

Then Black Friday hits, or your app goes viral, and suddenly you're watching your single container instance buckle under the load. 

Response times spike to 20+ seconds. Users get timeout errors.

Sound familiar?

**This is exactly why horizontal scaling exists. Instead of throwing bigger hardware at the problem, you spin up multiple identical instances to share the load.** 

It's the difference between hiring one superhuman cashier versus opening 10 normal checkout lanes.

But here's the thing: most developers have never actually seen horizontal scaling work in practice.

Today, I'm going to fix that. We'll build a simple .NET API endpoint, deploy it to Azure Container Apps, and then absolutely hammer it with heavy load. 

The results will show you exactly why horizontal scaling is essential for any production application.

Let's dive in.

​

### **A simple endpoint to stress**
To see the benefits of horizontal scaling, we will need at least some endpoint in our .NET backend API that we can hit aggressively.

Let's use something like this:


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-7k8vtfZnpM4EVt5qsrWTq4.jpeg)

​

This endpoint performs intensive cryptographic work on every request:

*   <span>Generates 64 bytes of random data</span>
*   <span>Runs SHA256 hashing 200 times in succession</span>
*   <span>Returns the final hash as a hex string</span>

Each request burns significant CPU cycles, making it perfect for testing how different numbers of container instances behave under load.

Now, let me clarify something about this test.

​

### **Why no database calls or external dependencies?**
While real applications often involve database calls, including them in our scaling test would introduce too many variables. 

Database connection pools, query optimization, and external service limits can become bottlenecks that mask the benefits of horizontal container scaling. 

By using CPU-intensive work instead, we can cleanly demonstrate how additional container instances improve performance when the bottleneck is actually within our application code, not external dependencies.

Next, let's prepare our infrastructure.

​

### **Configuring scaling rules**
​[Last week]({{ site.url }}/blog/build-self-healing-apps-health-checks-and-probes-with-net-aspire), I showed how to easily customize your Azure Container Apps infrastructure via the built-in extensibility points available in .NET Aspire's Azure hosting APIs. 

Well, we can use the same approach to define the scaling rules for our .NET API, like this:


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-72fRhKfQHsv7uCtpX3k7AN.jpeg)

​

This will configure our container app so that it ensures there's always one and only one replica (a container instance) serving requests, no matter how much load the API receives.

This is not what you want to do in most cases, but let's use it as our baseline to see the initial performance of the API under heavy load.

We can now quickly deploy our API and the related infrastructure with a quick **azd up** call. If you are new to this, I covered it in more detail in my [.NET Aspire Tutorial]({{ site.url }}/blog/net-aspire-tutorial-build-production-ready-apps-from-day-1).

Now let's run our test.

​

### **Stress testing with 1 replica**
For this test, I'll use **hey**, a small but powerful open-source command-line tool designed to send some load to any web application. 

Now, after my app is fully provisioned in Container Apps, here's the **hey** command I ran:


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-vhJjDY8AeHWJ1SZSC9ZyJG.jpeg)

​

That command does the following:

*   <span>Sends 100,000 total requests to our new API endpoint</span>
*   <span>Uses 10,000 concurrent connections (users hitting the API simultaneously)</span>

In simple terms, this simulates 10,000 users all hammering our API at the exact same time, with each "user" making multiple requests until we've sent 100,000 total requests.

The test took about 100 secs and came back with this (simplified for brevity):


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-nCaoShUfTp4osQhHzDn5fe.jpeg)

​

What those numbers mean is that the system is completely overwhelmed:

*   <span>**33% failure rate**: Only 66,625 requests succeeded out of 100,000 sent</span>
*   <span>**21,636 got "503 Service Unavailable" errors** - the server rejecting requests it can't handle</span>
*   <span>**11,739 requests timed out completely** - never got a response at all</span>
*   <span>**Terrible response times**: Average of 7.8 seconds, with some taking up to 20 seconds</span>
*   <span>**Low throughput**: Only 988 requests per second when we're hammering it with 10,000 concurrent connections</span>

**The key insight:** With 10,000 concurrent users hitting our CPU-intensive endpoint, 1 replica simply can't keep up. It's rejecting or timing out on 1 in 3 requests.

Now, let's take advantage of containers and their natural horizontal scaling capabilities.

​

### **Updating the scaling rules**
The beauty of containers is that running 10 of them is not any harder than running 1, and since we are using .NET Aspire, all we need to change is one line in our AppHost **Program.cs**:


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-jUrtBuSuwhcPxTuBhH1Bf1.jpeg)

​

This will tell Container Apps that now it can use up to 10 replicas of our containerized .NET API to handle the incoming load.

How will it know when it is time to scale? For this, it uses an **HTTP scaling rule** which, by default, will spin up a new replica if any existing replica receives more than 10 concurrent requests.

To deploy this scaling update, we can again do **azd up** or, to make it quicker, we can also use the **azd deploy** command, which containerizes and deploys your API, but won't redeploy any infra.

After deployment, our scale rule settings will look like this in the Azure Portal:


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-huR4XeUNWgm5TAu7M7hD2g.jpeg)

​

Now, let's run that test again.

​

### **Stress testing with 10 replicas (max)**
Given our scaling rules, we may want to warm up things first, so that most of those 10 replicas come alive before the real test.

For this, we can run this initial **hey** command:


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-wFMfmnBHaJySLZjZzqDTjT.jpeg)

​

This is similar to our previous command, but with 2 differences:

*   <span>It runs the test for exactly 45 seconds (duration-based instead of request-count based)</span>
*   <span>It uses only 1,500 concurrent connections</span>

After those 45 seconds, we can confirm that, given our scaling rules, we have gone up from 1 to 10 replicas:


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-3oXMaAqeqxEgsCGtjyB967.jpeg)

​

Now, let's run our real test, same command as before:


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-vhJjDY8AeHWJ1SZSC9ZyJG.jpeg)

​

Here are our new results:


![](/assets/images/2025-07-05/4ghDFAZYvbFtvU3CTR72ZN-81mxwG3BxBE2AFQt3NMX4w.jpeg)

​

Just that final line, where we can see **all** **100,000 requests returned a 200 OK response,** is an amazing achievement. 

But let's do a more detailed comparison.

​

### **A dramatic difference**
Here's how horizontal scaling via containers, Azure Container Apps and .NET Aspire, completely transformed our API's performance:
<div><table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
<tr style="background-color: #2563eb !important; color: white !important;">
<th style="text-align: left; padding: 10px; font-weight: bold; background-color: #2563eb !important; color: white !important;">Metric</th>
<th style="text-align: left; padding: 10px; font-weight: bold; background-color: #2563eb !important; color: white !important;">1 Replica</th>
<th style="text-align: left; padding: 10px; font-weight: bold; background-color: #2563eb !important; color: white !important;">10 Replicas</th>
<th style="text-align: left; padding: 10px; font-weight: bold; background-color: #2563eb !important; color: white !important;">Improvement</th>
</tr>
<tr style="background-color: #dbeafe;">
<td style="padding: 8px; font-weight: bold;">Test Duration</td>
<td style="padding: 8px;">101.15 seconds</td>
<td style="padding: 8px;">25.30 seconds</td>
<td style="padding: 8px; background-color: #16a34a; color: white; font-weight: bold;">4x faster completion</td>
</tr>
<tr style="background-color: white;">
<td style="padding: 8px; font-weight: bold;">Success Rate</td>
<td style="padding: 8px; color: #dc2626;">66.6%</td>
<td style="padding: 8px; color: #16a34a; font-weight: bold;">100%</td>
<td style="padding: 8px; background-color: #16a34a; color: white; font-weight: bold;">Zero failures</td>
</tr>
<tr style="background-color: #dbeafe;">
<td style="padding: 8px; font-weight: bold;">Throughput</td>
<td style="padding: 8px;">989 req/sec</td>
<td style="padding: 8px;">3,953 req/sec</td>
<td style="padding: 8px; background-color: #16a34a; color: white; font-weight: bold;">4x more requests handled</td>
</tr>
<tr style="background-color: white;">
<td style="padding: 8px; font-weight: bold;">Average Response</td>
<td style="padding: 8px;">7.86 seconds</td>
<td style="padding: 8px;">2.42 seconds</td>
<td style="padding: 8px; background-color: #16a34a; color: white; font-weight: bold;">69% faster responses</td>
</tr>
<tr style="background-color: #dbeafe;">
<td style="padding: 8px; font-weight: bold;">Median Response</td>
<td style="padding: 8px;">8.44 seconds</td>
<td style="padding: 8px;">1.68 seconds</td>
<td style="padding: 8px; background-color: #16a34a; color: white; font-weight: bold;">80% improvement</td>
</tr>
</table></div>

​

The amazing results speak for themselves :)

And for real users using our .NET API, this would mean that:

*   <span>**With 1 replica**, 1 in 3 users would have gotten errors or timeouts - a completely unacceptable user experience. </span>
*   <span>**With 10 replicas**, every single user got a fast, successful response.</span>

Mission Accomplished!

​

### **Wrapping Up**
The numbers don't lie. Horizontal scaling didn't just improve performance—it transformed a failing system into a reliable one.

This is the reality of modern web applications. When traffic spikes hit, having adequate replicas means the difference between users getting served versus getting frustrated with error pages.

**The difference between 66% success rate and 100% success rate isn't just a number—it's the difference between losing customers and keeping them.**

Production-ready applications don't happen by accident—they're built with the right tools and patterns from the start.

And that’s all for today.

See you next Saturday.

{% unless subscriber.tags contains "all-access-pass-subscriber" %}

**P.S.** Tomorrow is the last day of my summer sale—[22% off everything]({{ site.url }}/courses). Perfect timing if you want to dive deeper into containers, .NET Aspire, or Azure deployment.

{% endunless %}

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

2. **[Browse all courses]({{ site.url }}/courses)**: Everything you need to build, deploy, and maintain production .NET applications.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.