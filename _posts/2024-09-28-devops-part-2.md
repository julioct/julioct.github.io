---
layout: post
title: "DevOps: Part 2"
date: 2024-09-28
featured-image: image.jpg
issue-number: 52
---

*Read time: 9 minutes*
​

It's done! A couple of days ago I finally completed the Game Store system, the distributed .NET Web application that will drive the upcoming [.NET Cloud Developer Bootcamp](https://juliocasal.com/courses/dotnetbootcamp) (Is that a good name? Let me know!). 

I'm amazed by how much the tech has advanced in the .NET and Azure world in the last few years. There's so much going on in this field that I have no idea how folks are solving today's chaotic puzzle to learn cloud development with .NET. 

I was lucky enough to enter the .NET and Azure era more than a decade ago, so I got a good sense of how to approach cloud development with .NET, and that's what the bootcamp is all about.

With the core project ready, I'll now switch gears to the next step: try to rebuild the entire thing in the most "teachable" way. This means building it in a way that is easy to understand even for most beginners, taking plenty of notes along the way, and figuring out which parts deserve a good slide deck to land solid concepts. 

I'm very excited to start this next phase, and at some point I'll tell you more about how I like to approach teaching (quite different from other instructors) but first let me tell you what I had to do to get the Game Store properly deployed via Azure DevOps. 

On to this week's update.


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-tTm7KnGhwf3BGcrVvUB8tM.jpeg)

​

### **Quick recap: The CI/CD Pipeline**
First, a quick recap of the CI/CD pipeline we are trying to build:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-h5fwesrNxiiTsorYHvq2s5.jpeg)

​

We want to use Azure Pipelines (part of Azure DevOps) to automatically do these steps after every push to our remote repo:

1.  <span>Build the app</span>
2.  <span>Run integration tests</span>
3.  <span>Build the Docker image</span>
4.  <span>Push the Docker image to Azure Container Registry</span>
5.  <span>Deploy the Docker image as a container to Azure Container Apps</span>

​

​[Last week]({{ site.url }}/blog/devops-part-1) I explained the challenges involved in getting each of the microservices repos ready for this automation. But with those resolved, now let's see how to create the actual pipelines.

​

### **The ServiceDefaults CI pipeline**
ServiceDefaults is the project where all the shared cross-cutting logic has been centralized for easy reusability. Everything from authorization to error handling, Azure configurations, health checks, telemetry, etc., is there. 


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-d44ax5pqQzqtsVwyMecAeN.jpeg)

​

Every microservice consumes this library in the form of a NuGet package, so we need a CI pipeline to produce and publish that package on every push to the remote branch. 

I already covered how to create a pipeline over [here](https://juliocasal.com/blog/Building-A-CICD-Pipeline-With-Azure-DevOps), so today I'll just show you the yaml I used to define this specific one:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-aqw4VuBKnQYrCM1o8cX3bf.jpeg)

​

About this pipeline:

*   <span>It runs automatically on every push to main branch</span>
*   <span>It uses the $(Major).$(Minor).$(Rev:r) convention to define how to generate the build numbers</span>
*   <span>It creates the NuGet package using the build number as the version</span>
*   <span>It publishes the package to Azure Artifacts</span>

​

When it runs, the build looks like this:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-kS15i7ZGiuBjs4cMYk4ZGw.jpeg)

​

And the end result is this published package:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-hXyeXTePSktJu73PogvTm1.jpeg)

​

Now, that's the easy one. Next, the microservice CI/CD pipeline.

​

### **The microservice CI/CD pipeline**
The yaml for this pipeline is bigger, so I'll go over it in smaller chunks. But first, we define the same initial parameters we did in the other pipeline:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-kThLwusa4idJ7DYAUcWBhk.jpeg)

​

The main steps in this pipeline are:

1.  <span>Build the code</span>
2.  <span>Run the tests</span>
3.  <span>Publish contracts (if any)</span>
4.  <span>Deploy</span>

I organized each of these main steps into what Azure Pipelines calls **jobs,** so that I can do a few cool things along the way.

Let's go over each of the 4 jobs next.

​

### **1. Build the code**
Here's the Build job:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-edBFr4zaLFUV7k4EyaxskD.jpeg)

​

The highlights for this one are:

*   <span>We explicitly restore dependencies using our Azure Artifacts NuGet feed (where ServiceDefaults live). Otherwise, just building the code will fail claiming it can't find the package.</span>
*   <span>We build the app in **Release** mode. This will also build the integration test binaries.</span>
*   <span>We publish the test binaries into an artifact that can be used in later jobs</span>

​

### **2. Run Tests**
We have a series of integration tests that will verify the app in a close-to real-world setting. Meaning, they use real databases, message brokers, storage accounts, etc, except that they run in Docker containers. Plus, they run against an actual web server (even if it runs in memory).

Here's the test job:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-pucvKi96qcFXMDg65sX4Ct.jpeg)

​

About that job:

*   <span>It uses a parallel strategy with 2 agents, which allows us to run these slow tests across 2 machines at same time, significantly shortening the time to get results.</span>
*   <span>It grabs the test binaries from the artifact published by the previous job</span>
*   <span>It uses a small Bash script to select half the tests and build a test filter with their names</span>
*   <span>It runs the tests using that filter</span>

​

That parallel execution is really neat and a must for integration tests. Unit tests would not need that since they should complete in just a few seconds.

​

### **3. Publish contracts**
Most microservices expose REST APIs that expose contracts (DTOs) to interact with them. In this job we publish those contracts as NuGet packages in a similar way as we did with ServiceDefaults:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-gCScfPJv5ZjHsBt9ih54rh.jpeg)

​

The only special thing there is the **dependsOn** property. By setting that property to **ParallelTesting** we ensure this job will not run until all integration tests have passed, which is not a bad idea.

​

### **4. Deploy**
This is the one that took me the most time to get right, since it's the one that touches Azure resources and requires a series of environment variables with the correct values.

The job:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-qCiC64WyiiVkmyh52szxEV.jpeg)

**​**

About this job:

*   <span>It also depends on tests to pass before running. Notice that this also means that jobs 3 and 4 can run in parallel as soon as tests complete. Neat!</span>
*   <span>It uses a variable group to provide all required environment variables (More on this later)</span>
*   <span>It authenticates with the Azure Container Registry (ACR) in our subscription using the identity of a service principal we granted access via an ADO service connection.</span>
*   <span>Once authenticated, it builds and publishes to ACR a Docker image for the application using just **dotnet publish** and the native image creation capabilities introduced in .NET 7 (no dockerfile needed!)</span>
*   <span>It installs and configures the Azure Developer CLI (azd) so it can talk to our Azure subscription.</span>
*   <span>It provisions our application into Azure Container Apps (ACA) using azd and the just created docker image.</span>

​

Last week I showed you how azd will prompt for all required environment variables needed for the deployment. But here it would seem like all we provide is the APP_IMAGE_TAG, taken from the build number, and the pipeline will certainly not prompt for anything else interactively as it does in a dev box.

Where are all the other env vars coming from? 

Here:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-5naaKAwtFwEfussGYhXYbY.jpeg)

​

That is known as a variable group on Azure Pipelines and can include as many variables as you need. We link that gamestore02 variable group to the pipeline and all variables go as env vars to azd.

The really nice thing is that we can reuse this variable group across all pipelines, which avoids us having to repeat the same variables in multiple yaml files for all microservices.

​

### **The end result**
When the complete microservice deployment pipeline runs, it looks like this:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-reEiSYJM79Lp5z9uv4E1dQ.jpeg)

**​**

When it completes, your Docker image shows up on ACR with the correct version:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-eE7oH4HgGUw6FuTnNF5TuV.jpeg)

**​**

And your app is up and running in Azure Container Apps:


![](/assets/images/2024-09-28/4ghDFAZYvbFtvU3CTR72ZN-kXhwSPKd5Yq6fuTxyaeyZf.jpeg)

**​**

Next time you push even the smallest change to your remote repo, the entire automation runs, and a few mins later you are up and running in the cloud without any manual intervention.

Yes, you may want to add more safeguards to this like Test and Prod stages, approval gates, canary or blue/green deployments, and more. But what I showed you here should be a great first step.

**​**

### **Closing**
All right, now on to the next bootcamp production phase. Let's make this teachable, step-by-step, no hidden code, and doable even by most beginners.

Until next time!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://juliocasal.com/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.