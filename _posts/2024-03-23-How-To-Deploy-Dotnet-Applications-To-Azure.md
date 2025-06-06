---
title: How To Deploy .NET Applications To Azure
date: 2024-03-23
layout: post
featured-image: tns-26.jpg
featured-image-alt: How To Deploy ASP.NET Core Applications To Azure
issue-number: 26
---

*Read time: 4 minutes*

I love building .NET web apps, and the part I enjoy the most is when I get them deployed to the cloud, where anyone can access them from anywhere.

Knowing how to deploy your .NET applications to Azure is a key skill to have since most .NET shops use or are moving to Azure as their cloud provider.

The problem these days is not really to get the app deployed to the cloud, but the fact that there are so many ways to do it, each with its pros and cons, plus a corresponding learning curve.

But today I'll show you what I think is the best and easiest way to deploy your .NET apps to Azure, using **.NET Aspire** and the **Azure Developer CLI**.

Let me show you how to do it in 5 easy steps.

<br/>

### **Step 1: Add .NET Aspire to your app**
[.NET Aspire](https://learn.microsoft.com/dotnet/aspire/get-started/aspire-overview){:target="_blank"} is an opinionated, cloud-ready stack for building observable, production-ready, cloud-native applications.

Adding **.NET Aspire** to your application has dozens of benefits, but one of my favorites is that it makes it really easy to deploy your application to Azure via its integration with the **Azure Developer CLI**.

I wrote an entire article on how to turn a full-stack application into a .NET Aspire application over [here]({{ site.url }}/blog/Going-Cloud-Native-With-Dotnet-Aspire), so please check it out before moving on to the next step.

<br/>

### **Step 2: Install the Azure Developer CLI**
The [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/overview){:target="_blank"}, also known as **azd** is an open-source tool that accelerates the time it takes for you to get your application from your box to Azure.

To install the **Azure Developer CLI** on Windows, run the following command in your terminal:

```powershell
winget install microsoft.azd
```

For more options to install it on Windows and other operating systems, check [this page](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd).

<br/>

### **Step 3: Initialize your app to run on Azure**
Run the following command in your terminal to let **azd** prepare a few deployment artifacts:

```powershell
azd init
```

You will get asked a few questions to figure out what kind of application you have, how to deploy it to Azure and to tell if any of your apps should be exposed to the Internet:

![](/assets/images/azd-init.jpg)

After that, you will have a few new files in your repo:

**azure.yaml**

```yaml
name: aspiredemo01
services:  
  app:
    language: dotnet
    project: .\GameStore.AppHost\GameStore.AppHost.csproj
    host: containerapp
```

Describes the services of your app, such as your .NET Aspire AppHost project, and maps them to Azure resources ([Azure Container Apps](https://learn.microsoft.com/azure/container-apps/overview){:target="_blank"} in this case).

**.azure/config.json**

```json
{"version":1,"defaultEnvironment":"gamestore04"}
```

Tells azd what the current active environment is.

**.azure/gamestore04/.env**

```env
AZURE_ENV_NAME="gamestore04"
```

Contains environment-specific overrides. In particular, this seems to influence the name of the resource group to create in Azure.

**.azure/gamestore04/config.json**

```json
{
  "services": {
    "app": {
      "config": {
        "exposedServices": [
          "frontend"
        ]
      }
    }
  }
}
```

Tells azd which services should have a public endpoint in this environment, which is cool since there's no reason to expose the backend to the Internet.

<br/>

### **Step 4: Deploy your .NET application**
First things first, login to your Azure account:

```powershell
azd auth login
```

Then, kick off the deployment with a single command:

```powershell
azd up
```

That will start a new wizard that will ask you key details like your Azure subscription and location to use, as well as any credentials needed, and then it will provision all your Azure resources:

![](/assets/images/azd-up-01.png)

Finally, it will deploy your application as **Azure Container Apps** resources:

![](/assets/images/azd-up-02.png)

Now, I did face a couple of issues with the deployment, which may be due to the fact I was using preview bits:

1. **azd up failed to push the container images to ACR.** That's due to it not granting me the **AcrPush** role when provisioning the registry. I manually added that permission to my account in the Azure Portal and then ran **azd up** again. Success!

2. **No Allow Blob anonymous access for the Storage Account.** My app needs this and there is no way to configure it in my .NET Aspire App. So I had to manually enable this access in the Azure Portal.

Took me 3 minutes to fix both issues and then I was ready to try the published app in my browser.

<br/>

### **Step 5: Try the app in Azure**
As you can see in the last screenshot, you will get Azure URLs for both your frontend and backend. 

In my case, my frontend endpoint was https://frontend.mangobeach-a7b5abba.eastus.azurecontainerapps.io, so if I navigate there I get to my frontend UI:

![](/assets/images/azd-deployed.jpg)

(those 5 games were not there just after deployment, but I created them afterward for a nice screenshot 😄)

But where are all the Azure resources that got provisioned for that app? 

They are all in your Azure subscription, which you can explore in the Azure Portal:

![](/assets/images/azd-azure-portal.jpg)

I find it pretty magical how a single command was able to not only provision and interconnect 9 Azure resources, but also turn my frontend and backend into container images, deploy and run them in Azure Container Apps, and even expose the frontend to the Internet.

It would have taken me a few hours to do all that manually, and I would have probably made a few mistakes along the way. But not anymore with **.NET Aspire** and the **Azure Developer CLI**.

Mission Accomplished!

---

<br/>

**Whenever you’re ready, there are 2 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**:​ Everything you need to build production ready .NET applications for the Azure cloud at scale.

2. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.