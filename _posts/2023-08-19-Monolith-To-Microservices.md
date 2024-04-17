---
title: "How To Move From A Monolith To Microservices"
date: 2023-08-19
layout: post
featured-image: monolith-to-microservices-featured.png
featured-image-alt: monolith-to-microservices
image: /assets/images/monolith-to-microservices-featured.png
issue-number: 8
---

*Read time: 5 minutes*

Today I'll go over one way to move from a monolith to microservices.

Many folks are eager to start reaping the benefits of microservices, usually after being stuck with a painful monolith for a while.

The problem is that it can be hard to tell where to start and how to get there.

Fortunately, there are multiple ways to move from a monolith to microservices, and today I'll show you one that many teams have used successfully in the past.

Let's dive in.

<br/>

### **The Current Monolith**
Let's say we have a monolithic **Match Making** system that looks like this:

<img src="{{ site.url }}/assets/images/monolith-before-migrate.jpg"/>

This system allows players to create and join game matches.

In simple terms, here's how the system works today:

1. Players request to join a match via the **/play** endpoint in the **Match Maker** module REST API.

2. Match Maker creates or updates match requests in the **Matches** table of the database. A match that has at least 2 players is updated to the **WaitingForGame** state.

3. The **Game Manager** module polls the Matches table every 5 seconds to find new matches.

4. Once a match WaitingForGame is found, Game Manager starts provisioning a new game instance in the **Game Server**.

5. Once the game is ready, Game Manager stores the game details in the **Games** table and populates some of those details, like the server IP, in the Matches table.

Let's see now one way to turn this monolith into microservices, step by step.

<br/>

### **Step 1: Add a reverse proxy**

<img src="{{ site.url }}/assets/images/monolith-migrate-step1.jpg"/>

The idea of the reverse proxy is to act as a gateway to the monolith.

The proxy will initially just forward all requests to the monolith but what's important is
that it will allow us to isolate the client.

That way the client will not be aware of the changes we'll be making behind the proxy.

<br/>

### **Step 2: Migrate the functionality**

<img src="{{ site.url }}/assets/images/monolith-migrate-step2.jpg"/>

With the proxy in place, you can now start migrating the functionality from the monolith to microservices.

You can start by migrating the Match Maker module into a brand new microservice.

You should confirm that all Match Maker scenarios are working as expected in the new microservice.

Notice that you are not removing anything from the monolith yet, nor modifying the reverse proxy configuration.

You should also deploy the microservice to production, with no traffic yet, to confirm you are ready to fully rely on the microservice moving on.

<br/>

### **Step 3: Redirect calls**

<img src="{{ site.url }}/assets/images/monolith-migrate-step3.jpg"/>

Now you can reconfigure the proxy to redirect calls to the /play endpoint to the new microservice.

You can leave the original Match Maker module in the monolith for now.

That should allow you to quickly rollback to the monolith if something goes wrong by just changing the proxy configuration.

<br/>

### **Step 4: Cleanup the monolith**

<img src="{{ site.url }}/assets/images/monolith-migrate-step4.jpg"/>

After a few weeks or months of successfully running our first microservice in production, we can finally tear down the Match Maker module from the monolith.

In fact, we can also turn Game Manager into its own microservice, at which point the monolith can be completely removed.

At this point you can finally start reaping some of the benefits of microservices, but there is something very important we still need to tackle: the Database.

<br/>

### **Step 5: Publish events**

<img src="{{ site.url }}/assets/images/monolith-migrate-step5.jpg"/>

Microservices should never share a database because that would create a tight coupling between them.

So, we want to figure out a way for each microservice to work with their own database.

And, to get there the first thing to do is to not let Game Manager poll the Matches table anymore.

Should Match Maker expose a REST API for Game Manager to call? 

**Please don't!** That would be tight coupling as well and trigger a bunch of new issues.

Instead, we can update Match Maker to publish a **WaitingForGame** event into a **message queue** every time a match reaches the WaitingForGame state.

We can also update Game Manager to publish a **GameCreated** event any time a new game has completed provisioning.

<br/>

### **Step 6: Consume events**

<img src="{{ site.url }}/assets/images/monolith-migrate-step6.jpg"/>

With both microservices publishing events, we can now update them to also start consuming them.

So, any time a WaitingForGame event shows up in the queue, Game Manager will consume it and start working on game provisioning.

And, whenever Game Manager publishes the GameCreated event, Match Maker will consume it and update the match details in the Matches table.

This way Match Maker can now work exclusively with its Matches table and Game Manager with its Games table.

Just one more step to go.

<br/>

### **Step 7: Split the database**

<img src="{{ site.url }}/assets/images/monolith-migrate-step7.jpg"/>

There is no longer any reason to keep both the Matches and Games tables in the same database. 

So, we can now split the database into two, one for each microservice.

Yes, easier said than done, and likely will involve a migration process in itself, but it's totally worth it.

With each microservice owning their own DB, each microservice team is free to evolve their DB schema as needed without having to coordinate with other teams.

Mission accomplished!

<br/>

### **Is it worth it?**

First confirm that [it is time for you to move to microservices](Should-I-Move-To-Microservices). 

After that, yes, totally worth it. With a microservices architecture, you will be able to:

* Onboard new devs quickly
* Always deliver on time
* Keep your customers delighted
* Stop wasting server resources
* Keep your developers happy
* Use new tech as needed

And that’s it for today.

I hope you enjoyed it.

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[​Building Microservices With .NET]({{ site.url }}/courses/dotnetmicroservices)**:​ The only .NET backend development training program that you need to become a Senior C# Backend Developer.

2. **[.NET Academy All-Access Pass]({{ site.url }}/courses/all-access)**: Get instant access to a growing catalog of premium courses on .NET, Azure, DevOps, Testing and more, all for a low recurring fee and the freedom to cancel anytime. 

2. **[Promote yourself to 14,000+ subscribers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.