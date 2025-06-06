---
title: How To Get Started With .NET
date: 2024-06-01
layout: post
featured-image: tns-36.jpg
featured-image-alt: How To Get Started With .NET
issue-number: 36
---

*Read time: 6 minutes*

Today I want to take step back and give you a quick overview of how to get started with the .NET platform.

If you are a software developer, you probably have heard that .NET skills are in demand since many companies are using it to build modern applications and services.

However, the fact that .NET is a large and complex platform can make it hard to know where to start, especially if you are new to the platform.

So in this quick guide, I will show you how to get started with .NET, what are the most popular types of applications you can build with it, and how to learn the skills you need to build those applications.

Let's start.

<br/>

### **What is .NET?**
[.NET](https://dotnet.microsoft.com){:target="_blank"} is a free, open-source, cross-platform framework for building modern apps and powerful cloud services.

![](/assets/images/tns-36-what-is-dotnet.jpg)

You can compare it to other popular frameworks like Java Spring, Ruby on Rails, Node.js, but .NET has some unique features that make it stand out from the rest, like:

* **App types**: You can build a wide range of app types with .NET, including web apps, mobile apps, desktop apps, cloud services, and lots more.
* **Productive**: .NET has a rich set of libraries and tools that help you build apps faster and more efficiently.
* **Cross-platform support**: You can build and run .NET apps on Windows, macOS, and Linux.
* **Performance**: .NET has faster response times and uses less compute power, making it ideal for high-performance applications.
* **Ecosystem**: .NET is free, open source and has a large and active community of developers ready to help and contribute.

Now, how to get started with .NET?

<br/>

### **Start With C#**
It doesn't matter what type of application you are trying to build with .NET, you will need to use an actual programming language to code your apps, and the best language for that is **C#**.

[C#](https://learn.microsoft.com/dotnet/csharp/tour-of-csharp){:target="_blank"} is a powerful, modern, and versatile language that can be used to build a wide variety of applications that can run pretty much anywhere.

And the best part is that there are tons of resources available to learn C# for free. Here are some of the best resources to get you started, right from the source:

* [C# for Beginners](https://youtube.com/playlist?list=PLdo4fOcmZ0oULFjxrOagaERVAMbmG20Xe&si=8fJK0pbbaytm6d_7){:target="_blank"}. A YouTube playlist where Scott Hanselman and David Fowler (two of the most popular names in the .NET space) teach you the basics of C# from the ground up.

* [Foundational C# with Microsoft](https://www.freecodecamp.org/learn/foundational-c-sharp-with-microsoft/){:target="_blank"}. A comprehensive introduction to C# programming, covering its core concepts, syntax, and practical application in software development.

* [Hello World - Introductory interactive tutorial](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/tutorials/hello-world){:target="_blank"}. Teaches you C# interactively, using your browser to write C# and see the results of compiling and running your code.

There's a lot more to learn about C#, but these resources should be enough to get you started.

<br/>

### **What are you trying to build?**
The range of applications you can build with .NET is vast. So, to get the best out of .NET, you should have a good idea of the type of application you want to build.

So, let me list here some of the most popular types of applications folks are building, or that companies are demanding these days:

* **Web Applications**: Anything from interactive web frontends to backend APIs and background services used either for enterprise or consumer-facing scenarios.
* **Desktop Applications**: Applications that handle mostly enterprise-level tasks and that companies will primarily deploy on Windows machines.
* **Mobile Applications**: Applications that can run natively on iOS and Android devices and that simplify the user experience when all you have available is a smartphone.
* **Games**: Built usually with a combination of C# and the Unity game engine, and made for a wide range of platforms, from consoles to Windows machines and mobile devices.
* **Distributed Systems**: Applications that are built to handle a large number of users and complex scenarios and that are deployed in the cloud, many times using microservices and serverless architectures.
* **Internet of Things (IoT)**: Applications that are built to power smart devices with limited resources and that need to be able to communicate with other devices and services.

You could also say that there are **cloud** applications and **AI** applications, but those are more like technologies that you can use to deploy and enhance the other types of applications.

Let's now see how to use .NET to build these types of applications.

<br/>

### **Web Applications**
To build any type of web application with .NET, you will need to use [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet){:target="_blank"}.

**ASP.NET Core** is a free, cross-platform and open-source framework for building web apps and services with .NET and C#.

And the thing is that *Web Application* is a broad term that can mean many things, like:

* **Web Frontend**: The part of the application that the user interacts with, usually built with HTML, CSS, and JavaScript. But ASP.NET Core gives you the option to use C# as opposed to JavaScript via **Blazor**.
* **Backend API**: A service that runs on the server and that either a web frontend or a mobile app can consume to get data or perform actions.
* **Background Service**: A service that runs in the background and that can perform long-running or compute-intensive tasks like sending emails, processing data, or scheduled jobs.
* **Real-time Application**: An application that needs to update the user interface in real-time, like chat applications or stock market dashboards.
* **Remote Procedure Call (gRPC) Service**: Same idea as a backend API, but using the gRPC protocol for high-performance communication.

#### To Get Started
To learn how to build web frontends or backend APIs:
* [Watch my Blazor Full Course For Beginners](https://youtu.be/RBVIclt4sOo){:target="_blank"}
* [Watch my ASP.NET Core Full Course For Beginners](https://youtu.be/AhAxLiGC7Pc){:target="_blank"}
* [Get my ASP.NET Core Full Stack Bundle]({{ site.url }}/courses/aspnetcore-fullstack-bundle)

To learn how to build other types of web applications:
* [Get my .NET Backend Developer Roadmap]({{ site.url }}/roadmap) 
* [Read the official ASP.NET Core documentation](https://learn.microsoft.com/aspnet/core){:target="_blank"}. 

<br/>

### **Desktop Applications**
There are a few options to build applications meant to be installed on Windows machines:

* **WinUI**: The new way to build desktop applications that look great and take advantage of the latest Windows releases.
* **WPF (Windows Presentation Foundation)**: A well-established framework for Windows desktop applications with access to .NET or the .NET Framework that uses XAML markup to separate UI from code.
* **Windows Forms**: A traditional way to build desktop applications with .NET, using a drag-and-drop interface to design the user interface.

For any new desktop application, the recommendation is to go with **WinUI**, as it is the most modern and future-proof option. 

#### To Get Started
* [Read this official guide](https://learn.microsoft.com/windows/apps/get-started/start-here){:target="_blank"}
* [Watch this YouTube series](https://youtube.com/playlist?list=PLqT49gV-eqe69qrwcaX9UdDjRBAIHXnNf&si=pvi7jTvU4Rq61Krc){:target="_blank}

<br/>

### **Mobile Applications**
For this what you want to use is [.NET MAUI (Multi-platform App UI)](https://dotnet.microsoft.com/apps/maui){:target="_blank"}, a cross-platform framework for creating native mobile and desktop apps with C# and XAML.

The idea with **.NET MAUI** is that you can build a single codebase that runs on iOS, Android, Windows, and macOS, and that adapts to the different screen sizes and capabilities of each platform.

You can compare .NET MAUI to other cross-platform frameworks like React Native, Flutter and the UNO Platform, but .NET MAUI has the advantage of being built on top of .NET, which means you can use all the libraries and tools available in the .NET ecosystem.

#### To Get Started
* [Take this learning path](https://aka.ms/dotnetmaui-beginner/mslearn){:target="_blank"}
* [Watch this nice YouTube series](https://aka.ms/dotnet/beginnervideos/youtube/maui){:target="_blank"}

<br/>

### **Games**
It turns out that the most popular apps folks are building with C# are not web, desktop nor mobile apps, but **video games**.

That's because C# is the language of choice for the [Unity game engine](https://unity.com){:target="_blank"}, which is one of the most popular game engines in the world.

Unity is used to build games for a wide range of platforms, from consoles to Windows machines and mobile devices, and it has a large and active community of developers that contribute to the ecosystem with libraries, tools, and tutorials.

#### To Get Started
* [Read this tutorial](https://dotnet.microsoft.com/en-us/learn/games/unity-tutorial/intro){:target="_blank"} 
* [Watch this YouTube video](https://youtu.be/XtQMytORBmM?si=NgwHzOEvzceaVKLR){:target="_blank"}

<br/>

### **Distributed Systems**
This is the type of system behind many popular apps like Netflix, Uber, Airbnb, and Spotify, which are built to handle a large number of users and complex scenarios and that use many services deployed in the cloud.

To build this kind of system, you want to use the just released [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview){:target="_blank"}, an opinionated, cloud ready stack for building observable, production ready, distributed applications.

A common pattern for building distributed systems is the **microservices architecture**, which is a way to build business-aligned, loosely coupled services, owned by small, focused teams, that are built and deployed independently.

#### To Get Started
To get started with .NET Aspire:
* [Check out my article]({{ site.url }}/blog/Going-Cloud-Native-With-Dotnet-Aspire) 
* [Watch my YouTube video](https://youtu.be/pk6FJfHhfq8){:target="_blank"}.
* [Join my .NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)

<br/>

### **Internet of Things (IoT) Apps**
You fall into this category if you are trying to build an app that can run on devices like a Raspberry Pi or a HummingBoard, to take advantage of sensors, leds, and other components built into or attached to those devices.

For this, you want to use the [.NET IoT libraries](https://learn.microsoft.com/en-us/dotnet/iot/intro){:target="_blank"}, which you can use anywhere .NET is supported, including most versions of Linux that support ARM/ARM64 and Windows 10 IoT Core. 

#### To Get Started
* [Read this tutorial](https://learn.microsoft.com/en-us/training/modules/create-iot-device-dotnet){:target="_blank"} 
* [Watch this YouTube series](https://www.youtube.com/playlist?list=PLdo4fOcmZ0oWG4G6NxHV2yGEb42vQaFNc){:target="_blank"}

<br>

### **Key Takeaways**
To get started with .NET, all you need to do is:

1. Learn C#
2. Choose the type of application you want to build
3. Grab the best guide, video or course
4. Start coding!

And don't forget to enjoy the learning journey!

---

<br/>

**Whenever you’re ready, there are 2 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**:​ Everything you need to build production ready .NET applications for the Azure cloud at scale.

2. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.