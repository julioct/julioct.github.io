---
layout: post
title: "Docker Crash Course"
date: 2024-12-28
featured-image: 2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-iv1SGXaBuQS7NXqydsSDfH.jpeg
issue-number: 65
---

*Read time: 6 minutes*

With the holidays in full swing, I hope you’ve taken a moment to slow down and enjoy the season. It’s the perfect time to step back, recharge, and prepare for the exciting opportunities the new year will bring.

On my side, I'm having a great time at home with the family and kids, playing tons of video games. We almost got to the last boss in Megaman 11 and made great progress in Final Fantasy VII Rebirth (this game is so big and beautiful!).

Today I'll give you a quick intro to Docker, a wonderful piece of tech I've been using for many years now, and that really revolutionized the way we deploy things to the cloud.

Let's dive in.

​

### **What is Docker?**
Let's start with a formal definition:

> Docker is a platform that provides the ability to package and run an application in a loosely isolated environment called a container.


Containers are lightweight, portable environments that bundle an application with everything it needs to run—code, libraries, and dependencies.

For a concrete example, let's say I want to run the popular NGINX web server in my box.

In the past, if you wanted to run NGINX on your machine, you would have to manually install it, configure it, and ensure all its dependencies were properly set up. 

This could involve downloading specific versions of NGINX, managing conflicts with existing software on your system, and dealing with potential issues caused by differences between environments (your machine vs. a production server).

Today, here's what you can do with Docker:


![](/assets/images/2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-iv1SGXaBuQS7NXqydsSDfH.jpeg)

​

1.  <span>You start by **pulling the NGINX image** from Docker Hub, which is a public repository of containerized applications. </span>
2.  <span>Once pulled, you **run the image** using your local version of Docker, which creates a container. Think of this as starting a lightweight, isolated version of the application.</span>
3.  <span>Then you can access the NGINX server from your web browser on a specified port (say, `localhost:8080`).</span>

The key thing is that **Docker simplifies your development cycle by ensuring your application works the same way, whether it’s on your local machine, a staging server, or in production.**

Now let's walk through the commands you would use to quickly run NGINX in your box.

​

### **Getting Docker Desktop**
To run any Docker container in your box, you need the Docker Engine, which is included with Docker Desktop. You can download it for free [here](https://docs.docker.com/desktop).

After you install it, you have everything you'll ever need to run any docker image. 

You will also get a nice app where you can manage your Docker images, containers, volumes, and several other things:


![](/assets/images/2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-6r47ipFPUwdmRZYkPRbNkz.jpeg)

​

Now let's see how to get the NGINX Docker image to your box.

​

### **Pulling a Docker image**
Where to download the NGINX Docker image from? Head to [https://hub.docker.com](https://hub.docker.com/) and you will quickly find it:


![](/assets/images/2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-s6dt6EXC1K29bmxhzCzDsm.jpeg)

​

That page will give you all the details about this image, including how to pull it down to your box.

So, open a terminal in your box and run this command:


![](/assets/images/2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-3WdchQjXXoLZX7MyzrfKQY.jpeg)

​

It should take a few seconds, and then your image will be ready:


![](/assets/images/2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-fAHngZEBAt16ZjLA7dSWxE.jpeg)

​

You will find it in your Docker Desktop Images section:


![](/assets/images/2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-2nkELq8fia4SXSyqgHBRG3.jpeg)

​

Now let's see how to run NGINX in your box via that Docker image.

​

### **Running a Docker container**
When you run a Docker image we say it turns into a Docker container, and you can do it in your terminal with this command:


![](/assets/images/2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-bUxgp7bUbSuZpZheG1YfWD.jpeg)

​

So, you start with **docker run** and you end with the name of your image, **nginx** in this case.

The **-p 8080:80** piece is what we know as port mapping, and you use it to make the services running inside the Docker container accessible from your local machine. 

Otherwise, NGINX will be running there, but you would have no way to access it. 

8080 is the port you can use in your box to reach NGINX, and 80 is the port inside the container where NGINX is listening (the "container port").

You can confirm the running container in the Containers tab in Docker Desktop:


![](/assets/images/2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-5NDJrDXHkeKAmUHVGZJBd3.jpeg)

​

Now we are ready to browse to our web server.

​

### **Browsing to the NGINX server**
Nothing special here. From the point of view of your local box, there is now an NGINX web server running at [http://localhost:8080](http://localhost:8080/).

So all you do is point your browser to that address and you'll get the NGINX home page:


![](/assets/images/2024-12-28/4ghDFAZYvbFtvU3CTR72ZN-3axUG6KJ4TTbLnV4HtZ27J.jpeg)

​

Notice how your browser doesn't really care how exactly NGINX was made available at `localhost:8080`; it just sees a web server responding to its requests. 

**This is the beauty of Docker: it abstracts away the complexities of installation, configuration, and environment-specific quirks.**

Nice!

​

### **Wrapping up**
I just scratched the surface there, but if you need to know more about Docker containers, like:

*   <span>What if you want a specific version of NGINX (or any image)?</span>
*   <span>How to modify the HTML served by NGINX (or anything else inside the container)?</span>
*   <span>How to preserve your updates across container restarts?</span>
*   <span>How to pass environment variables to your containers?</span>

I got all that (and more!) covered in a **new Docker mini-course** I include with Course 3 of [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp) (on sale for a few more days).

Speaking of which, I have 7 modules of that course already recorded, with 3 more to be completed next week, so I better get back to work.

Happy Holidays!

Julio

---


<br/>


**Whenever you’re ready, there are 2 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**:​ Everything you need to build production ready .NET applications for the Azure cloud at scale.

2. **[Promote yourself to 20,000+ subscribers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.
