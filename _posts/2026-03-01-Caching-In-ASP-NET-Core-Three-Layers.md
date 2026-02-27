---
title: "Caching in ASP.NET Core: The Three Layers You Need to Know"
date: 2026-03-01
layout: post
featured-image: CachingThreeLayers.jpg
featured-image-alt: Caching in ASP.NET Core - The Three Layers You Need to Know
image: /assets/images/CachingThreeLayers.jpg
---

*Read time: 8 minutes*

Caching is one of the most effective ways to improve your ASP.NET Core application's performance. But with three different caching strategies available (in-memory, distributed, and output caching), knowing which one to use and when can be confusing.

In this tutorial, I'll show you how to implement all three layers of caching in ASP.NET Core. You'll learn when to use each approach and see practical examples of how to add Redis for distributed caching and integrate it with Aspire.

<br/>

## Layer 1: In-Memory Caching

In-memory caching stores data in the web server's memory using `IMemoryCache`. It's the simplest and fastest caching option.

**When to use it:**

* Single-server deployments
* Data that's expensive to compute but cheap to regenerate
* Session-like data that doesn't need to survive restarts

**Implementation:**

First, inject `IMemoryCache` into your service:

```csharp
public class ProductService(IMemoryCache cache, AppDbContext context)
{
    public async Task<Product?> GetProductAsync(int id)
    {
        var cacheKey = $"product-{id}";
        
        if (!cache.TryGetValue(cacheKey, out Product? product))
        {
            product = await context.Products
                .FirstOrDefaultAsync(p => p.Id == id);
                
            if (product is not null)
            {
                var options = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));
                    
                cache.Set(cacheKey, product, options);
            }
        }
        
        return product;
    }
}
```

**Key concepts:**

* **Sliding expiration**: Resets the timer each time the item is accessed
* **Absolute expiration**: Hard limit on how long the item stays cached
* **Combine both**: Ensures items expire even if frequently accessed

**Limitations:**

* Data is lost on application restart
* Not shared across multiple servers
* Uses server memory (can cause issues under memory pressure)

<br/>

## Layer 2: Distributed Caching with Redis

Distributed caching uses an external cache store (like Redis) that multiple application instances can share. This solves the limitations of in-memory caching.

**When to use it:**

* Multi-server deployments (web farms, load balancers)
* Data that must survive application restarts
* Session state in distributed applications
* Cache that needs to be shared across services

**Setting up Redis with Aspire:**

Add the Redis package:

```bash
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
```

For local development with Aspire, add Redis to your AppHost:

```csharp
// AppHost Program.cs
var builder = DistributedApplication.CreateBuilder(args);

var redis = builder.AddRedis("cache");

var api = builder.AddProject<Projects.MyApi>("api")
    .WithReference(redis);
```

In your API's `Program.cs`:

```csharp
builder.AddRedisClient("cache");

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration
        .GetConnectionString("cache");
    options.InstanceName = "MyApp:";
});
```

**Using IDistributedCache:**

```csharp
public class ProductService(IDistributedCache cache, AppDbContext context)
{
    public async Task<Product?> GetProductAsync(int id)
    {
        var cacheKey = $"product-{id}";
        var cachedBytes = await cache.GetAsync(cacheKey);
        
        if (cachedBytes is not null)
        {
            var json = Encoding.UTF8.GetString(cachedBytes);
            return JsonSerializer.Deserialize<Product>(json);
        }
        
        var product = await context.Products
            .FirstOrDefaultAsync(p => p.Id == id);
            
        if (product is not null)
        {
            var json = JsonSerializer.Serialize(product);
            var bytes = Encoding.UTF8.GetBytes(json);
            
            var cacheOptions = new DistributedCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));
                
            await cache.SetAsync(cacheKey, bytes, cacheOptions);
        }
        
        return product;
    }
}
```

**Key differences from IMemoryCache:**

* Works with `byte[]` instead of objects
* All methods have async versions
* Shared across all application instances
* Survives application restarts

<br/>

## Layer 3: Output Caching

Output caching (introduced in ASP.NET Core 7) caches entire HTTP responses. It's the most efficient form of caching because it bypasses most of your application pipeline.

**When to use it:**

* API endpoints that return the same response for many users
* Pages that don't require authentication
* Responses that change infrequently

**Setup:**

Add output caching services and middleware:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => 
        builder.Expire(TimeSpan.FromMinutes(1)));
        
    options.AddPolicy("Products", builder =>
        builder.Expire(TimeSpan.FromMinutes(5))
               .SetVaryByQuery("category", "page"));
});

var app = builder.Build();

app.UseOutputCache();
```

**Apply to endpoints:**

```csharp
app.MapGet("/api/products", async (AppDbContext db) =>
{
    return await db.Products.ToListAsync();
})
.CacheOutput();

app.MapGet("/api/products/search", 
    async (string? category, int page, AppDbContext db) =>
{
    var query = db.Products.AsQueryable();
    
    if (!string.IsNullOrEmpty(category))
        query = query.Where(p => p.Category == category);
        
    return await query
        .Skip((page - 1) * 20)
        .Take(20)
        .ToListAsync();
})
.CacheOutput("Products");
```

**Using Redis for output cache storage:**

By default, output caching stores responses in memory. For distributed scenarios, use Redis:

```csharp
builder.Services.AddStackExchangeRedisOutputCache(options =>
{
    options.Configuration = builder.Configuration
        .GetConnectionString("cache");
    options.InstanceName = "MyApp:OutputCache:";
});
```

**Cache invalidation with tags:**

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy("Products", builder =>
        builder.Tag("products"));
});

// Endpoint to cache
app.MapGet("/api/products", async (AppDbContext db) =>
{
    return await db.Products.ToListAsync();
})
.CacheOutput("Products");

// Endpoint to invalidate cache
app.MapPost("/api/products", 
    async (Product product, AppDbContext db, IOutputCacheStore cache) =>
{
    db.Products.Add(product);
    await db.SaveChangesAsync();
    
    // Invalidate all cached product responses
    await cache.EvictByTagAsync("products", default);
    
    return Results.Created($"/api/products/{product.Id}", product);
});
```

<br/>

## Choosing the Right Caching Layer

Here's a decision tree to help you choose:

**Use in-memory caching when:**

* Running on a single server
* Cache size is small (under 100MB)
* Losing cache on restart is acceptable
* You need to cache complex objects

**Use distributed caching when:**

* Running on multiple servers
* Cache must survive restarts
* Sharing cache across services
* Cache size could grow large

**Use output caching when:**

* Caching entire HTTP responses
* Same response for many users
* Can vary by query strings or headers
* Need maximum performance gains

**Combine multiple layers:**

You can use all three together! For example:

* Output caching for public product listings
* Distributed caching for user shopping carts
* In-memory caching for configuration data

<br/>

## Complete Aspire Example

Here's a complete setup with all three layers using Aspire:

**AppHost Program.cs:**

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var redis = builder.AddRedis("cache");

var api = builder.AddProject<Projects.CachingApi>("api")
    .WithReference(redis);

builder.Build().Run();
```

**API Program.cs:**

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add Redis connection
builder.AddRedisClient("cache");

// Add all three caching layers
builder.Services.AddMemoryCache();

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration
        .GetConnectionString("cache");
    options.InstanceName = "CachingApi:Distributed:";
});

builder.Services.AddStackExchangeRedisOutputCache(options =>
{
    options.Configuration = builder.Configuration
        .GetConnectionString("cache");
    options.InstanceName = "CachingApi:Output:";
});

builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => 
        builder.Expire(TimeSpan.FromMinutes(1)));
});

var app = builder.Build();

app.UseOutputCache();

app.Run();
```

<br/>

## Wrapping Up

Understanding the three layers of caching in ASP.NET Core gives you powerful tools to optimize your applications:

* **In-memory caching** for simple, single-server scenarios
* **Distributed caching** for shared cache across multiple servers
* **Output caching** for maximum performance on entire HTTP responses

Redis provides excellent backing storage for both distributed and output caching, and Aspire makes it trivial to add to your development environment.

Start with in-memory caching for quick wins, add Redis when you scale beyond a single instance, and layer on output caching for your most-hit endpoints. You will be surprised how much performance you can squeeze out with just a few lines of configuration.

And that's it for today.

<br/>

**Whenever you're ready, there are 3 ways I can help you:**

1. **[​Building Microservices With .NET](https://dotnetmicroservices.com)**:​ The only .NET backend development training program that you need to become a Senior C# Backend Developer.

2. **[Subscribe to my YouTube channel](https://www.youtube.com/@julioc)**: ​Join 12,000+ developers to learn how to build scalable cloud applications with .NET and pass critical software engineering interviews.

3. **[Promote yourself to 16,000+ subscribers](https://sponsorpilot.com/newsletter/the-dotnet-academy-newsletter)**: ​By sponsoring this newsletter.
