---
layout: post
title: "HTTP Logging Tutorial"
date: 2024-10-19
featured-image: image.jpg
issue-number: 55
---

*Read time: 5 minutes*
​

Scripts and slide decks are done, so we are ready to start recording! 

And, as I worked through the dozens of lessons included in the upcoming [bootcamp](https://juliocasal.com/courses/dotnetbootcamp), I realized that, as usual, I was packing too much in a single course. 

I believe shorter courses are better since people are busy, and breaking the content into smaller, more focused courses makes it easier to fit learning into your schedule and achieve incremental results without feeling overwhelmed.

So, after structuring things in a better way, I broke down the bootcamp into 9 courses, grouped into 3 stages that currently look like this:


![](/assets/images/2024-10-19/4ghDFAZYvbFtvU3CTR72ZN-np7eqa7hV5SP5XWyQv4W2.jpeg)

The scripts and slides I just finished cover the 3 courses on stage 1, each course with anywhere between 8 and 9 modules, with each module broken down into several bite-sized lessons.

Can't wait to share more since there's so much to unpack in each of those courses! 

But now let's get into the topic of the day: HTTP Logging.

​

### **Enabling HTTP Logging**
HTTP Logging is a nice piece of middleware available in the ASP.NET Core platform that allows you to log every request and response that goes through your application.

This can become very handy to understand how your application is behaving in production and to do proper troubleshooting. 

In the past, you would have had to log every request yourself, maybe by writing your own middleware, but today you can turn it on by just adding these 2 lines to Program.cs:


![](/assets/images/2024-10-19/4ghDFAZYvbFtvU3CTR72ZN-tkPGa9NGiQBY9BJYj2938K.jpeg)

​

Just remember to also bump the log level of the HTTP Logging middleware to at least Information in **appsettings.Development.json** to ensure the logs actually show up:


![](/assets/images/2024-10-19/4ghDFAZYvbFtvU3CTR72ZN-iHe11s4AHgqhASxquQcBp7.jpeg)

​

Now, any time your app handles a request, you will get something like this in your logs:


![](/assets/images/2024-10-19/4ghDFAZYvbFtvU3CTR72ZN-jthSw3RcSattckcgZRR5oV.jpeg)

​

The first log is the request, and the second one is the response, which I think is a great start for just adding 2 lines of code and 1 line of configuration.

But we can do better.

​

### **Customizing log fields**
As with most things in ASP.NET Core, you can configure several options on the HTTP Logging middleware. 

For instance, you may want to log specific parts of the request or response, and maybe even include the request duration. For this, all you have to do is set the correct flags on the options delegate:


![](/assets/images/2024-10-19/4ghDFAZYvbFtvU3CTR72ZN-4WKcueVWp87nLFAALZ67TT.jpeg)

​

And you would get this:


![](/assets/images/2024-10-19/4ghDFAZYvbFtvU3CTR72ZN-4Ca7gG8MKyX55ZMmKTnYcs.jpeg)

​

There's also an **HttpLoggingFields.All**, which will even print out the request and response body (shortened the response body here since it is very long):


![](/assets/images/2024-10-19/4ghDFAZYvbFtvU3CTR72ZN-u5wpm1FQSUYCRxASKQVMJ9.jpeg)

​

Yes, logging a POST request is likely going to be much more useful, but you get the idea.

​

### **Combining logs**
I find it handy to have a single log line that contains both the request and response info, as opposed to multiple log lines that might be hard to correlate.

Turns out that's easy to do too:


![](/assets/images/2024-10-19/4ghDFAZYvbFtvU3CTR72ZN-2dtR6JGMiHyLppqv4WpUHY.jpeg)

​

Which will show like this in logs:


![](/assets/images/2024-10-19/4ghDFAZYvbFtvU3CTR72ZN-dhdubv1KxUMFFroaCQGJwx.jpeg)

​

So useful! 

And, notice this uses **structured logging**, so each of those fields should show up as their own column on your logging store like Seq or Azure Application Insights, which would help a lot with troubleshooting.

​

### **Wrapping up**
If you are interested, I'll go over logging and how to use those logs for troubleshooting issues in Azure in [the bootcamp](https://juliocasal.com/courses/dotnetbootcamp).

By this time next week, I should be done recording most of the first course, with the bootcamp available for purchase as soon as courses 1 and 2 are ready. 

The third course will likely land just a few weeks after that, hopefully around Thanksgiving week.

Now, back to work!

Julio

---


<br/>


**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​]({{ site.url }}/waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.