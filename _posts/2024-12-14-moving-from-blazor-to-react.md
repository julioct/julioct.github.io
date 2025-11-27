---
layout: post
title: "Moving from Blazor to React!"
date: 2024-12-14
featured-image: image.jpg
issue-number: 63
---

*Read time: 6 minutes*
​

Well, my new RTX 4070 video card did absolutely nothing to improve the speed of producing my course videos. Quite a bummer, but I guess at least I can now play Final Fantasy XIV at insanely high graphics settings, if I ever get a chance to go back to gaming again :)

Doesn't matter too much since my editing software now has a way to produce these videos directly in the cloud, which is 10x faster, plus my video editor is now handling much of this work, so we are all good!

This week, as I was getting ready to kick off the recording of Course 3 of the bootcamp, I decided to spare one day to complete a fun challenge: convert the entire Blazor front-end used in the bootcamp to React!

Several students have been asking me for a React alternative to the Blazor front-end, since it seems like that is what most folks are using these days in combination with ASP.NET Core backends.

So, good news: took me most of one working day, but I just finished the React version of the frontend used in Course 2 and I plan to use it across the entire bootcamp!

Today let me go through the process I followed to tackle this fun challenge.

Let's dive in.

​

### **The stats**
I'm always trying to stay on top of what folks are using these days, to make sure my content aligns as closely as possible with that.

Here's what several of you have been telling me:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-228UaQWM26u4wwdhqAv5xJ.jpeg)

​

I'm a bit surprised at how high Blazor ranks there, given how new it is, but there's no doubt React is the top choice for most of you.

So it only makes sense to use React as the front-end that's powered by the .NET Backend that students build and deploy to Azure across [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp).

I might keep the Blazor version available to students, but the plan is to shift most of the focus of the last module on each bootcamp course to React.

Now, how to get started with React?

​

### **Starting a new React project**
To be honest, I'm not new to React, since I already used it to build the front-end included in [my microservices program](https://dotnetmicroservices.com).

However, after a quick research, I found out that **create-react-app**, a toolchain built by Meta to help devs quickly set up new React apps, is now obsolete and no longer recommended.

There are several options available these days, and I spent a few hours trying to understand the preferred option.

But in the end, it seems like the top choice today is **Vite**.

Vite is a modern build tool for web applications, designed to offer a faster and leaner development experience compared to older tools like Webpack.

After installing Node.js, which is a prerequisite to Vite, you can get started very quickly with the included command-based wizard:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-2Za92HVBsmhb8TGmZWrpBt.jpeg)

​

Your generated project will look like this:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-jJWAaK5Br6YcvhBWQmoAMg.jpeg)

​

Notice you could use either JavaScript or TypeScript for this, but I chose TypeScript since it gives you the additional type safety that JavaScript can't provide.

From there, all you do is run 1 command:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-rh9SXfaQcaboSf9rFMr5p2.jpeg)

​

Which installs all the node modules your project depends on. Similar to **dotnet restore**.

The project is ready to run.

​

### **Vite is fast**
The equivalent to **dotnet run** in this Node.js word is this other command:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-dxpWaHueHeGcJWrjG8Dfmf.jpeg)

​

And you'll your site is ready to go:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-a8yK5YTzkrni72kwAZQanf.jpeg)

​

Notice how much time it took to start the site: **297ms!**

I was expecting Vite to be fast since speed is one of the key advertised features of this web framework, but that is ridiculously fast.

**It crushes my Blazor app**, which takes at least 10 times more to start.

Your initial site will look like this:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-p7jDaR2JCZLo8m6ts494Ms.jpeg)

​

Now, let's turn this into a real app.

​

### **Copilot, let's get to work**
There was no way I would craft this React site manually. With as much fun as that would be, I simply have no time, plus front-end development is not my thing.

So I just opened up my Blazor front-end code base and started with a simple ask:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-kPZHqi6BuAikuJers3KLFX.jpeg)

​

And it keeps going and going:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-jy8En6aJnKidavAsXuUoMH.jpeg)

​

It won't actually give me instructions to convert the entire site, but it gives me an idea of how to structure things initially and what kind of code I'll be working with.

In the end, after creating the initial structure on the Vite project, I had to go one by one through each of the Blazor components to get the exact equivalent in React:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-wMTNxwtjrDcMBhQPTs8481.jpeg)

​

It was not perfect, but I would say 3 out of 4 generated files compiled and worked perfectly, and the few that required changes were super minor edits.

Very impressive!

​

### **The end result**
After working with Copilot and the new Vite project for about 7 hours, I ended up with this:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-7HLZ8w2JaydAWTTuc9D8ak.jpeg)

​

Then, spin up my .NET backend, the new Vite/React front-end, and here we go:


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-tJkVaS3kbZbcRzbP6kzA8r.jpeg)

​

And the amazing thing is that this new React-based front-end has the exact same look and behavior as the Blazor one. You really can't tell the difference, yet they are so different behind the scenes!

​

### **Closing**
I still need to convert the additional Blazor components needed for the front-end that will go along Course 3 of the bootcamp, which will be all about authorization, users, roles, JWT, OIDC, Keycloak, and a few other things.

Plus, there are a few React constructs that are very new to me and that I want to understand better. Like, what does this mean?


![](/assets/images/2024-12-14/4ghDFAZYvbFtvU3CTR72ZN-3dSgmhHER62wXuvzDsTq8B.jpeg)

So I'll go back to chat with Copilot a bit more to make sure I understand 100% of what's going on there.

Until next time!

Julio

---


<br/>


**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.
