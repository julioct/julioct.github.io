---
title: How To Scale From Zero To A Million Users
date: 2024-05-11
layout: post
featured-image: tns-33.jpg
featured-image-alt: Going From Zero To A Million Users
issue-number: 33
---

*Read time: 5 minutes*

Today I'll go over the road from a small web server + database application to having a system that can handle a million users.

As your application grows, you'll need to start thinking about how to scale it to handle more users, improve the response time, and make it more resilient to failures.

**Knowing what components to add to your system and when to add them to handle the growth is what differentiates a junior from a senior developer.**

The steps to take are not trivial, but they are well-known and have been implemented in many systems before.

Let's dive in.

<br/>

### **1. Web server and database**
This is where most web applications start. You have a web server that serves your application and a database that stores your data.

![](/assets/images/tns-33-webserver-plus-db.jpg)

The flow of client/server communication in this setup is like this:

1. Your users reach your system either through a mobile app or a web browser, which will send requests to your web server via the server domain name.

2. The domain name is resolved to the server's public IP address by a DNS server.

3. The web server receives the request, processes it, and talks to the database to fetch the data. 

4. The database returns the data to the web server, which will then send it back to the client.

But, as you start to get more users, you'll need to start scaling.

<br/>

### **2. Load balancer and database replication**
Your one web server and one database won't be able to handle the load as you grow, plus what happens if one of the web servers goes down?

![](/assets/images/tns-33-loadbalancer-plus-db-replica.jpg)

You will add additional web servers so that the load can be distributed among them. But you don't want to complicate things for your clients by having them decide which server to connect to.

This is where a **load balancer** comes in. It will distribute the incoming requests among the web servers.

Plus if one server goes down, the load balancer will automatically redirect the traffic to the other servers.

Additionally, your one database might not be able to handle the load either, and you don't want to have to deal with your single database server getting destroyed by an earthquake.

So you will switch to having a **master database** and multiple **slave databases**. Your web servers will send all the write requests to the master database, and all the read requests will be distributed among the slave databases.

Of course, you will have to enable **database replication** to keep the data in sync between the master and the slaves.

If any of the database servers goes down, the data should still be available to be retrieved from the other database servers.

This is working great, but as you keep growing, you'll need to figure out ways to improve the load/response time.

<br/>

### **3. Cache and CDN**
A **cache** is a temporary storage area that stores frequently accessed data. It helps in reducing the load on the database and improves the response time.

![](/assets/images/tns-33-cdn-and-cache.jpg)

So, with a cache in place, the flow of client/server communication will be like this:

1. The web server receives a request from the client.

2. The web server checks if the data is available in the cache. If it is, it will return the data to the client.

3. If the data is not available in the cache, the web server will fetch the data from the database, store it in the cache, and return it to the client.

A **Content Delivery Network (CDN)** is a network of servers distributed across different geographical locations. It caches the static content of your website and serves it to the users from the server closest to them.

The CDN is the ideal solution for serving static content like images, videos, CSS, and JavaScript files. It helps in reducing the load on the web server and improves the response time for the users.

The flow with a CDN in place will be like this:

1. The client sends a request to the web server.

2. The web server checks if the static content is available in the CDN. If it is, it will return the content to the client.

3. If the content is not available in the CDN, the web server will fetch it from the origin server, store it in the CDN, and return it to the client.

Things are looking great so far, but we have to do something about long-running operations.

<br/>

### **4. Workers and message queues**
Have you ever clicked on a submit order button only to land on an error page because the server was too busy processing other orders?

![](/assets/images/tns-33-queues-and-workers.jpg)

That happens when a system is not designed to handle long-running operations. You don't want your users to wait for a long time for their requests to be processed.

This is where **workers** and **message queues** come in. Instead of processing the requests synchronously, you can have your web server turn the requests into messages and send them to a message queue.

The workers will then pick up the messages from the queue and process them as efficiently as possible. This way, your web server can respond to the client quickly, and the workers can process the requests at their own pace.

If the queue is getting too long, you can add more workers to process the requests faster. Also, if a web server goes down, the messages will still be in the queue, waiting to be processed by the workers.

The only problem now is that we keep getting more and more users, but we can't spin up new servers fast enough, plus when the load is low, we're wasting tons of server resources.

Time for one last improvement.

<br/>

### **5. Containers**
**Containers** are a lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, system libraries, and settings.

![](/assets/images/tns-33-containers.jpg)

So instead of deploying your web application to a new server every time you need to scale, you can use tools like [Docker]({{ site.url }}/blog/Docker-Tutorial-For-Dotnet-Developers) to create a **container image** with your application bits and all its dependencies.

Then you can deploy that image as a container into any server that has Docker installed, or into a container orchestration platform like [Kubernetes]({{ site.url }}/blog/Deploying-ASP-NET-Core-Apps-To-Azure-Kubernetes-Service), which is built to manage containers at scale.

Since containers are very small and start very fast, you can scale up and down your application very quickly, depending on the load.

Plus you can deploy any container to any server that has available resources, which means you can make the most out of your infrastructure.

And, if you plug in a good **CI/CD pipeline** via [GitHub Actions]({{ site.url }}/blog/Building-A-CICD-Pipeline-With-GitHub-Actions) or [Azure DevOps]({{ site.url }}/blog/Building-A-CICD-Pipeline-With-Azure-DevOps), you can automate the whole process of building, testing, and deploying your containers, so all you do is push your code to the repository and see your new containers spinning up in production a few minutes later.

<br/>

### **The tech**
I go into more details in my **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**, but here are some popular options in the .NET and Azure ecosystem for the different components in this architecture:

- **Containers**: [Azure Kubernetes Service (AKS)]({{ site.url }}/blog/Deploying-ASP-NET-Core-Apps-To-Azure-Kubernetes-Service) or [Azure Container Apps](https://azure.microsoft.com/en-us/products/container-apps){:target="_blank"}.
- **Database**: [Azure SQL Database](https://azure.microsoft.com/en-us/products/azure-sql/database){:target="_blank"} or [Cosmos DB](https://azure.microsoft.com/en-us/products/cosmos-db){:target="_blank"}.
- **Message queues**: [RabbitMQ](https://www.rabbitmq.com){:target="_blank"} or [Azure Service Bus](https://azure.microsoft.com/en-us/products/service-bus){:target="_blank"}.
- **Load balancer**: [Azure Load Balancer](https://azure.microsoft.com/en-us/products/load-balancer){:target="_blank"} (enabled by AKS)
- **Cache**: [Azure Cache for Redis](https://azure.microsoft.com/en-us/products/cache){:target="_blank"}.
- **CDN**: [Azure Content Delivery Network](https://azure.microsoft.com/en-us/products/cdn){:target="_blank"}.

And that's it, on to the next million users!

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://juliocasal.com/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.