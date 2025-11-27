---
layout: post
title: "The $200 Mistake: Why Your .NET API Needs Idempotency"
date: 2025-09-27
featured-image: 2025-09-27/4ghDFAZYvbFtvU3CTR72ZN-rGxQcnPDHSwQwZvsYNZf3b.jpeg
issue-number: 104
---

*Read time: 8 minutes*
​

Picture this: Your customer tries to buy something from your e-commerce site. They click "Pay Now" and... nothing happens.

The page seems stuck. Being a normal human, they click again. Then maybe once more. Meanwhile, your API is happily processing all three requests, charging their credit card each time.

Your customer now has three charges on their card, and one very good reason to never shop with you again. Your support team is about to have a very long day.

**This isn't some edge case that only happens to "other people's" systems.**

It's happening right now, somewhere, because some junior developer built an API without understanding idempotency.

The fix isn't complicated, but getting it wrong costs real money and damages real relationships.

Let me show you exactly how to avoid being that dev.

​

### **What is idempotency?**
Idempotency means an operation produces the same result no matter how many times you execute it with the same inputs.

To understand this better, let's actually start by looking at an example operation that is not idempotent:


![](/assets/images/2025-09-27/4ghDFAZYvbFtvU3CTR72ZN-mizyYZnnEASxLCQtM8Dq2B.jpeg)

Here, our browser-based client application requested charging the payment for a customer's order. Our orders API proceeds to charge the order total, $100, to the customer's credit card.

Unfortunately, something happened in our API just after charging the CC, which resulted in it returning an error response. The client interprets this as a transient error and tries again.

Our API receives the second call and, since it has no record of the previous attempt, it proceeds to charge those $100 again, for a total of $200.

**That is a nightmare scenario resulting from an API that does not support idempotency.**

Instead, the way we would like our API to behave is this other way:


![](/assets/images/2025-09-27/4ghDFAZYvbFtvU3CTR72ZN-rGxQcnPDHSwQwZvsYNZf3b.jpeg)

No matter how many times the client retries the operation, the API will only charge the customer's CC once, because it is keeping track of any previous attempts and the outcome of each of them.

That is an idempotent API because the end result (the amount charged to the customer's CC in this case) is always the same.

Now, let's see a couple of real examples in code.

​

### **A bad example**
Here's an endpoint that does not support idempotency:


```csharp
app.MapPost("/orders/{orderId}/charge/bad", async (
    Guid orderId,
    BadChargeRequest request,
    AppDbContext db,
    IPaymentProcessor paymentProcessor,
    ILogger<Program> logger) =>
{
    var order = await db.Orders.FindAsync(orderId);
    if (order == null)
    {
        return Results.NotFound("Order not found");
    }

    // Multiple requests could reach here concurrently
    if (order.Status != OrderStatus.Pending)
    {
        return Results.BadRequest($"Order is not pending.");
    }

    // NO IDEMPOTENCY CHECK
    // Every retry will create a new payment attempt

    var paymentResult = await paymentProcessor.ChargeAsync(new ChargeRequest
    {
        Amount = order.TotalAmount,
        PaymentMethodId = request.PaymentMethodId,
        Description = $"Order #{order.OrderNumber}",
        // NO IdempotencyKey - external system will also process duplicates!
    });

    if (!paymentResult.Success)
    {
        logger.LogError("Payment failed: {Error}", paymentResult.ErrorMessage);
        return Results.BadRequest(new { error = paymentResult.ErrorMessage });
    }

    order.Status = OrderStatus.Paid;
    order.LastUpdated = DateTime.UtcNow;
    await db.SaveChangesAsync();

    logger.LogError("PAYMENT PROCESSED - Customer charged ${Amount}",
        order.TotalAmount);

    return Results.Ok(new
    {
        OrderId = orderId,
        PaymentId = paymentResult.PaymentId,
        Status = "Charged",
        Amount = order.TotalAmount
    });
});
```

​

It may not look too bad at first glance, but here are 2 top problems with this implementation:

1.  <span>**Concurrency.** Clients can retry much faster than our endpoint can finish processing a request. Multiple requests can easily reach and get past our `order.Status != OrderStatus.Pending`</span><span> check.</span>
2.  <span>**No idempotency propagation.** When we call the payment processor, we are not passing any operation identifier, which prevents the external system from enforcing idempotency, even if it's ready to do so.</span>

But fortunately, there are well-known ways to address these issues with a good idempotency strategy.

Let's see how.

​

### **A good example**
Let's see how to introduce idempotency into our Orders charge endpoint. Since the code can get quite large, let's go through it step by step.

#### **1. Use an idempotency key**
First things first. Before doing anything else, we will check our new PaymentsAttempts table to see if we have already tried this operation:


```csharp{14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44}
app.MapPost("/orders/{orderId}/charge/good", async (
    Guid orderId,
    GoodChargeRequest request,
    AppDbContext db,
    IPaymentProcessor paymentProcessor,
    ILogger<Program> logger) =>
{
    var order = await db.Orders.FindAsync(orderId);
    if (order == null)
    {
        return Results.NotFound("Order not found");
    }

    // Step 1: Check for existing payment attempt (idempotency check)
    var existingPayment = await db.PaymentAttempts
                                    .FirstOrDefaultAsync(p =>
                                    p.OrderId == orderId &&
                                    p.OperationId == request.OperationId);

    if (existingPayment != null)
    {
        if (existingPayment.Status == PaymentStatus.Succeeded)
        {
            return Results.Ok(new
            {
                OrderId = orderId,
                PaymentId = existingPayment.PaymentId!,
                Status = "Charged",
                Amount = existingPayment.Amount,
                AlreadyProcessed = true
            });
        }
        else if (existingPayment.Status == PaymentStatus.Failed)
        {
            return Results.BadRequest(new
            {
                error = $"Payment attempt failed: {existingPayment.FailureReason}."
            });
        }
        else
        {
            return Results.Accepted("Payment is being processed");
        }
    }

    // More stuff...
});
```

​

The key to this is the introduction of an **OperationId** value into our incoming request, which serves as our **idempotency key**. This is provided by the client and should have the same value no matter how many times it retries the operation.

Keeping track of payment attempts not only helps us know that the payment was already tried, but also what the status was, so we know exactly how to respond to the client, without any further processing.

<br/>

#### **2. Enforce unique constraints on DB**
If we can't find an existing payment, we should be good to go ahead with checking the order status and storing our initial payment attempt:


```csharp{7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55}
// Step 2: Validate order state
if (order.Status != OrderStatus.Pending)
{
    return Results.BadRequest($"Order is not pending.");
}

// Step 3: Create payment attempt record for idempotency tracking
var paymentAttempt = new PaymentAttempt
{
    Id = Guid.NewGuid(),
    OrderId = orderId,
    OperationId = request.OperationId,
    Amount = order.TotalAmount,
    PaymentMethodId = request.PaymentMethodId,
    Status = PaymentStatus.Processing,
    CreatedAt = DateTime.UtcNow
};

try
{
    // Save the attempt record first
    // (enforced by unique constraint on OrderId + OperationId)
    db.PaymentAttempts.Add(paymentAttempt);
    await db.SaveChangesAsync();

    // More stuff
}
catch (DbUpdateException ex) when (
    ex.InnerException is PostgresException pgEx &&
    pgEx.SqlState == PostgresErrorCodes.UniqueViolation)
{
    logger.LogWarning("Race condition detected");

    // Remove the payment attempt from tracking
    db.Entry(paymentAttempt).State = EntityState.Detached;

    // Check the result of the winning request
    var winningAttempt = await db.PaymentAttempts
        .FirstOrDefaultAsync(p => p.OrderId == orderId
                            && p.OperationId == request.OperationId);

    if (winningAttempt?.Status == PaymentStatus.Succeeded)
    {
        return Results.Ok(new
        {
            OrderId = orderId,
            PaymentId = winningAttempt.PaymentId!,
            Status = "Charged",
            Amount = winningAttempt.Amount,
            AlreadyProcessed = true
        });
    }

    return Results.Accepted("Payment is being processed already");
}
```

​

The key to this step is that when we store the payment attempt, we do it with a **unique constraint on OrderId + OperationId**, defined in our DBContext:


```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<PaymentAttempt>(entity =>
    {
        // CRITICAL: Unique constraint for payment idempotency
        // Prevents duplicate payment attempts for same order + operation
        entity.HasIndex(e => new { e.OrderId, e.OperationId })
                .IsUnique()
                .HasDatabaseName("IX_PaymentAttempts_OrderId_OperationId");
    });

    base.OnModelCreating(modelBuilder);
}
```

​

This is essential because there's still the chance that multiple requests try to save a payment attempt for the same order and operation ID, which would create duplicates.

If that happens, our unique constraint will fire a `DbUpdateException`, and our catch clause will deal with it by finding and returning the result of the winning request.

That way, our request remains idempotent (returns the same thing every time).

<br/>

#### **3. Idempotent external call**
If we are able to save that initial payment attempt record to the DB, we can finally proceed to charge the customer:


```csharp{7 12 13 14 15 16 22 23 24 25 40}
// Step 4: Process payment with external idempotency protection
var paymentResult = await paymentProcessor.ChargeAsync(new ChargeRequest
{
    Amount = order.TotalAmount,
    PaymentMethodId = request.PaymentMethodId,
    Description = $"Order #{order.OrderNumber}",
    IdempotencyKey = $"charge-{orderId}-{request.OperationId}"
});

if (!paymentResult.Success)
{
    // Update payment attempt as failed
    paymentAttempt.Status = PaymentStatus.Failed;
    paymentAttempt.FailureReason = paymentResult.ErrorMessage;
    paymentAttempt.CompletedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    logger.LogError("Payment failed: {Error}", paymentResult.ErrorMessage);
    return Results.BadRequest(new { error = paymentResult.ErrorMessage });
}

// Step 5: Update payment attempt and order as successful
paymentAttempt.PaymentId = paymentResult.PaymentId;
paymentAttempt.Status = PaymentStatus.Succeeded;
paymentAttempt.CompletedAt = DateTime.UtcNow;

order.Status = OrderStatus.Paid;
order.LastUpdated = DateTime.UtcNow;
await db.SaveChangesAsync();

logger.LogInformation("Payment processed safely for OperationId: {OperationId}",
                        request.OperationId);

return Results.Ok(new
{
    OrderId = orderId,
    PaymentId = paymentResult.PaymentId,
    Status = "Charged",
    Amount = order.TotalAmount,
    OperationId = request.OperationId
});
```

​

Most payment processors will accept some form of idempotency key, too, and we'd better use it, as in this example. That gives them a chance to detect duplicate payment attempts, if, for some reason, we end up calling them twice anyway.

After that, we can store the result of the payment attempt (success/failure), update the order status, and send a response back to the client.

Details will vary by scenario, but the takeaway is constant: build idempotency in from the start, not as an afterthought.

​

### **When to use idempotency?**
Make your endpoints idempotent whenever a retry could create duplicate money/state or damage trust.

**Always:**

*   <span>Payments & refunds (charge/capture/refund).</span>
*   <span>Order/checkout creation.</span>
*   <span>Webhooks & queue consumers (providers resend; queues deliver at-least-once).</span>

**Usually:**

*   <span>POSTs that create durable state (accounts, subscriptions).</span>
*   <span>Long-running actions users might refresh (exports, provisioning).</span>

**Often idempotent without extra work:**

*   <span>GET/HEAD, and well-implemented PUT/DELETE by ID (no side effects).</span>

Rule of thumb: if it changes **money, inventory, or user-visible state** and can be **retried**, make it idempotent.

​

### **Wrapping Up**
Idempotency isn’t a fancy pattern. It’s how you make payments boring in the best way.

Give every attempt a durable OperationId, let the database be the bouncer with a unique constraint, and pass the same idempotency key to your payment processor.

If a retry sneaks in, return the original result and move on. Add a few trace attributes so you can prove it under load.

**Same input → same outcome. Every time.**

And that's it for today.

See you next Saturday.
<div style="background: linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%); padding: 36px; margin: 24px 0; overflow: hidden; border-radius: 14px; box-shadow: 0 2px 12px rgba(80,120,200,0.08);">
  <p style="text-align: center; font-weight: bold; font-size: 1.2em; margin-bottom: 18px; letter-spacing: 0.5px;">The best .NET newsletters I read:</p>

  <p><a href="https://antondevtips.com?utm_source=juliocasal.com&utm_medium=blog&utm_campaign=idempotency-apis&utm_content=reco-box&utm_term=anton-devtips" target="_blank"><strong>Anton DevTips</strong></a> — by <strong>Anton Martyniuk</strong>: Architectural patterns, best practices, and real-world .NET code examples.</p>

  <p><a href="https://milanjovanovic.tech?utm_source=juliocasal.com&utm_medium=blog&utm_campaign=idempotency-apis&utm_content=reco-box&utm_term=the-dotnet-weekly" target="_blank"><strong>The .NET Weekly</strong></a> — by <strong>Milan Jovanovic</strong>: Clear, hands-on tips on .NET, C#, software architecture, and performance.</p>

  <p><em>If you only subscribe to two more .NET newsletters, make it these two.</em></p>
</div>

---

<br>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[.NET Backend Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.