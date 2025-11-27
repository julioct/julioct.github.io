---
layout: post
title: "The Missing One-Liner for Azure Service Bus Tracing with .NET Aspire"
date: 2025-10-18
featured-image: 2025-10-18/4ghDFAZYvbFtvU3CTR72ZN-8EvB5Ko8B6cW7YjNBriXBF.jpeg
issue-number: 106
---

*Read time: 10 minutes*

<p style="text-align: center; font-size: 1.2em;"><strong>The .NET Saturday is brought to you by:</strong></p>

<div style="background: linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%); padding: 36px; margin: 24px 0; overflow: hidden; border-radius: 14px; box-shadow: 0 2px 12px rgba(80,120,200,0.08);">
  <p style="text-align: center; max-width: 600px; margin: 0 auto 18px auto; font-size: 1.1em;"><strong>Sweep is the best autocomplete for .NET</strong></p>

  <p style="text-align: center; max-width: 600px; margin: 0 auto 18px auto;"><a href="https://www.vpdae.com/redirect/wg7f7d910rzdng6ogdx6thovuk8" target="_blank"><strong>Sweep</strong></a> is like Cursor Tab for JetBrains Rider. Sweep uses your recent edits and IDE context to suggest codebase-aware autocompletions. Sweep is trusted by engineers at companies like Ramp and Amplitude.</p>

  <div style="display: flex; justify-content: center;">
    <a href="https://www.vpdae.com/redirect/wg7f7d910rzdng6ogdx6thovuk8" target="_blank" style="background: linear-gradient(90deg, #4f8cff 0%, #235390 100%); color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1em; box-shadow: 0 2px 8px rgba(80,120,200,0.10); transition: background 0.2s; text-align: center;">Get JetBrains Plugin</a>
  </div>
</div>

​

Troubleshooting distributed systems is hard, and having to deal with issues that involve queues and messages is one of my least favorites.

It is hard enough to diagnose issues that occur on one machine or cloud instance, but having to trace that across multiple services that don't even talk to each other is next level.

What if you could get a single clear picture of the entire lifetime of a request since it arrives at your API endpoint, turns into a message published into a Service Bus queue, and all the way to the other service that consumes that message?

Yes, this is something that has been possible for a while for services like RabbitMQ, but with a small one-liner, you can also enable it for Azure Service Bus and your .NET Aspire dashboard.

Let's dive in.

​

### **An email notification issue**
Imagine that one of our customers, Bob, reports that he has submitted reviews for a few of our products on our website, but he never gets any notification that tells if the review was approved or not.

We have confirmed the issue is not in the frontend, but in our .NET backend, which includes our Reviews API, a PosgreSQL database, our Email Notification background service, Azure Services Bus, and a few other things.

Our repo includes .NET Aspire orchestration, so we can quickly run the complete backend application in our local dev box and see the full list of involved resources in the Aspire dashboard:


![](/assets/images/2025-10-18/4ghDFAZYvbFtvU3CTR72ZN-niQbG7LJiND2KjhnLUPR58.jpeg)

​

Now, to reproduce Bob's issue, let's post a review using his email (bob@example.com) via our Reviews API:


```bash
POST {{baseUrl}}/api/reviews
Content-Type: application/json

{
    "gameId": "01976545-042d-79a6-be86-d15898dba724",
    "userId": "user123",
    "userName": "bob@example.com",
    "rating": 5,
    "title": "Great game!",
    "content": "Really enjoyed this game."
}
```

​

And let's follow up with another POST to approve it:


```bash
POST {{baseUrl}}/api/reviews/1/approve
```

​

Both requests return a 200 OK (no errors), and, after checking with Bob, it looks like once again, he got no email notification.

Let's dig into our logs to get more info.

​

### **Exploring the logs and traces**
Our app emits lots of logs, so even when running in our local box, we are confronted with a long list of logs to investigate:


![](/assets/images/2025-10-18/4ghDFAZYvbFtvU3CTR72ZN-7bKkf4mskQdnmVSC8QcCqr.jpeg)

​

So let's filter this by Bob's email:


![](/assets/images/2025-10-18/4ghDFAZYvbFtvU3CTR72ZN-4fJd3qpVpmS7urpJwLZphY.jpeg)

​

A good start, but that's just an informational log sent by the API, which doesn't hint at any obvious error.

Let's click that Trace link to see what else it can reveal:


![](/assets/images/2025-10-18/4ghDFAZYvbFtvU3CTR72ZN-9fAoSqXZoSkT2JSC6nLXaF.jpeg)

​

This confirms that our API talked to the Reviews database to set the review as approved and then likely removed that review from the Redis cache, so future queries get the fresh status.

However, it says nothing about the message that our Reviews API must have sent to a Service Bus queue, so that our Notifications Service can send the email to Bob.

All .NET Aspire integrations, including the one for Azure Service Bus, should be instrumented via OpenTelemetry, so they can participate in traces like this one

What's going on?

​

### **Enabling Azure Service Bus OpenTelemetry support**
It turns out the Azure Service Bus integration (Aspire.Azure.Messaging.ServiceBus NuGet package) emits tons of OpenTelemetry compatible traces, but they are hidden behind an experimental switch.

All you have to do is flip the switch, which you can do anywhere in your app. A good place could be the **ConfigureOpenTelemetry** method in the **Extensions** class that comes with your **ServiceDefaults** project:


```csharp{33}
public static TBuilder ConfigureOpenTelemetry<TBuilder>(this TBuilder builder)
    where TBuilder : IHostApplicationBuilder
{
    builder.Logging.AddOpenTelemetry(logging =>
    {
        logging.IncludeFormattedMessage = true;
        logging.IncludeScopes = true;
    });

    builder.Services.AddOpenTelemetry()
        .WithMetrics(metrics =>
        {
            metrics.AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation();
        })
        .WithTracing(tracing =>
        {
            tracing.AddSource(builder.Environment.ApplicationName)
                .AddAspNetCoreInstrumentation(tracing =>
                    // Exclude health check requests from tracing
                    tracing.Filter = context =>
                        !context.Request
                                .Path
                                .StartsWithSegments(HealthEndpointPath)
                        && !context.Request
                                .Path
                                .StartsWithSegments(AlivenessEndpointPath)
                )
                .AddHttpClientInstrumentation();
        });

    AppContext.SetSwitch("Azure.Experimental.EnableActivitySource", true);

    builder.AddOpenTelemetryExporters();

    return builder;
}
```

​

I thought I would have to add additional tracing configurations there, but no, that's all it is.

Now, let's try our repro one more time.

​

### **End-to-end tracing with Azure Service Bus**
After restarting the application and approving Bob's review, this is the trace we arrive at in Aspire's dashboard:


![](/assets/images/2025-10-18/4ghDFAZYvbFtvU3CTR72ZN-8EvB5Ko8B6cW7YjNBriXBF.jpeg)

​

Notice that now we can see the interaction between the Reviews API and the Notifications Service via the Service Bus queue and, more importantly, there is a clear hint on where the problem might be:


![](/assets/images/2025-10-18/4ghDFAZYvbFtvU3CTR72ZN-wTFWNkbGJbfPkJQXdea37A.jpeg)

​

Those 3 circles (two blue, one red) on the service bus span (the row) represent log entries associated with the span, all correlated thanks to our OpenTelemetry configuration.

Clicking the red dot opens the corresponding log entry:


![](/assets/images/2025-10-18/4ghDFAZYvbFtvU3CTR72ZN-qoR47aNRt3jUFAfe8WXeGP.jpeg)

​

This clearly tells us that an exception was thrown, supposedly because Bob's email address is fake. We can even get the full stack trace to understand exactly where the issue is:


![](/assets/images/2025-10-18/4ghDFAZYvbFtvU3CTR72ZN-nsYGQ8kV1qCuLc8FWGs73X.jpeg)

​

That is more than enough to go back to our codebase and find the culprit:


```csharp{13 14 15 16 17}
var message = new MimeMessage();
message.From.Add(new MailboxAddress("GameStore", "no-reply@gamestore.com"));
message.To.Add(new MailboxAddress(userName, userEmail));
message.Subject = "Your review has been approved!";

var bodyBuilder = new BodyBuilder
{
  //Email body here...
};

message.Body = bodyBuilder.ToMessageBody();

if (userEmail.EndsWith("@example.com", StringComparison.OrdinalIgnoreCase))
{
    throw new InvalidOperationException(
        $"Cannot send email to fake email addresses.");
}

var smtpHost = _configuration.GetConnectionString("mailService") ?? "localhost";
var smtpPort = 1025;

using var client = new SmtpClient();

await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.None);
await client.SendAsync(message);
await client.DisconnectAsync(true);
```

​

And, at this point, we either remove that condition, which might have been there only for our initial tests, or we ask Bob to change his email.

In any case, mission accomplished!

​

### **Wrapping Up**
Distributed tracing isn’t about pretty charts. It’s about shortening the time between “something feels off” and “here’s exactly where it broke.”

With Aspire wiring up OpenTelemetry for you and Azure Service Bus carrying your messages, you get end-to-end visibility: a single trace that follows a request from the API, through the queue, into the worker, and back out again.

**When your system can explain itself, you can fix it fast.** That’s the real win here: fewer guessing sessions, more confident changes, and a team that spends its energy on features, not forensics.

And that’s it for today.

See you next Saturday.

**P.S.** For real-world Azure Service Bus patterns (retries, DLQs, tracing) in the cloud, check out my upcoming [Payments, Queues and Workers course]({{ site.url }}/waitlist).

---

<br>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.