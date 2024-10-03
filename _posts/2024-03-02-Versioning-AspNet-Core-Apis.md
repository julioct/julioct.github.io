---
title: Versioning ASP.NET Core APIs
date: 2024-03-02
layout: post
featured-image: tns-23.jpg
featured-image-alt: Versioning ASP.NET Core APIs
issue-number: 23
---

*Read time: 4 minutes*

Today I'll dive into a topic that is often overlooked by developers when building APIs: versioning.

**Versioning is a critical aspect of API design, as it allows you to make changes to your API without breaking existing clients.**

Sadly, many developers don't think about versioning until it's too late, and they are forced to make breaking changes to their APIs, which can lead to a lot of headaches and unhappy clients.

But the good thing is that you can start versioning your ASP.NET Core APIs very quickly with the help of a cool NuGet package.

Let's dive in.

<br/>

### **Why version your APIs?**
As more and more of your API endpoints start getting consumed by your clients, it will become increasingly difficult to make changes to the API without breaking existing clients. 

For instance, say today you have an API endpoint that returns the details of a video game. Today, the response this endpoint sends back might look like this:

```json
{
  "id": 2, 
  "name": "FIFA 23",
  "price": 69.99
}
```

Now, let's say that, as it often happens, business requirements change in a couple of ways:
1. Our game store is expanding globally and prices need to include currency information to avoid confusion
2. Customers want to know the genre each game belongs to, so they can make a more informed decision

So we change our API endpoint response to address these new requirements:

```json{3 4 5 6}
{
  "id": 2,
  "price": "USD 69.99",
  "details": {
    "title": "FIFA 23",
    "genre": "Sports"
  }
}

```

However, if we make this change in the existing API endpoint, we will break all the clients that are currently consuming this endpoint, because:
- They are not expecting the **price** to be a string with currency information
- The **name** field has been renamed to **title** and is now nested under a new **details** property

So, instead of introducing such dramatic changes to the existing API, we can create a new version of the API that includes these changes, and let the clients decide when they are ready to consume the new version of the API.

Let's see how to implement this in 5 quick steps:

<br/>

### **Step 1: Add a new version specific DTO**
Instead of modifying our existing Game DTO, we can create new version-specific DTOs that represent the updated endpoint response:

```csharp
public record GameSummaryDtoV2(int Id, string Price, GameDetailsDtoV2 Details);

public record GameDetailsDtoV2(string Title, string Genre);
```

We may also need to add new mapping logic to turn Game entities into the new DTO format:

```csharp
public static GameSummaryDtoV2 AsDtoV2(this Game game)
{
    return new GameSummaryDtoV2(
        game.Id,
        "USD " + game.Price,
        new GameDetailsDtoV2(
            game.Name,
            game.Genre
        )
    );
}   
```

<br/>

### **Step 2: Implement the new V2 endpoint**
We will leave the current endpoint as is, and create a new endpoint that returns the response using our new **GameSummaryDtoV2** format:

```csharp
app.MapGet("games/{id}", async (IGamesRepository repository, int id) =>
{
    Game? game = await repository.GetAsync(id);
    return game is not null ? Results.Ok(game.ToDtoV2()) : Results.NotFound();
});
```

But the problem is that even when we return the new response format, we can't have the exact same route as the existing endpoint, because that would cause a conflict.

For reference, here's what our **V1** endpoint looks like:

```csharp
app.MapGet("games/{id}", async (IGamesRepository repository, int id) =>
{
    Game? game = await repository.GetAsync(id);
    return game is not null ? Results.Ok(game.AsDtoV1()) : Results.NotFound();
});
```

How to deal with this? 

Time to introduce versioning.

<br/>

### **Step 3: Add the ASP.NET API Versioning NuGet package**
You can certainly implement versioning manually, but you can save some time by using the popular [Asp.Versioning.Http](https://www.nuget.org/packages/Asp.Versioning.Http){:target="_blank"} NuGet package instead:

```bash
dotnet add package Asp.Versioning.Http
```

This package provides a set of conventions and attributes that make it easy to version your APIs without having to write a lot of boilerplate code or learn new routing concepts.

Let's see how to use it.

<br/>

### **Step 4: Implement API versioning**
First thing to do is register the API versioning services in **Program.cs**:
    
```csharp
builder.Services.AddApiVersioning();
```

Next, we need to add a new route group builder that can be used to define all versioned endpoints:

```csharp
var gamesGroup = app.NewVersionedApi()
                    .MapGroup("/games")
                    .HasApiVersion(1.0)
                    .HasApiVersion(2.0);
```

And now we can use the group builder to specify to which API version each of our endpoints belongs:

```csharp{6 13}
gamesGroup.MapGet("/{id}", async (IGamesRepository repository, int id) =>
{
    Game? game = await repository.GetAsync(id);
    return game is not null ? Results.Ok(game.AsDtoV1()) : Results.NotFound();
})
.MapToApiVersion(1.0);

gamesGroup.MapGet("/{id}", async (IGamesRepository repository, int id) =>
{
    Game? game = await repository.GetAsync(id);
    return game is not null ? Results.Ok(game.ToDtoV2()) : Results.NotFound();
})
.MapToApiVersion(2.0);
```

Now if you run your service and try this request:

```http
GET http://localhost:5115/games/2?api-version=1.0
```

You will get the response in the **V1** format:

```json
{
    "id": 2,
    "name": "Final Fantasy XIV",
    "price": 59.99
}
```

And if you try this other request, which uses 2.0 as the API version:

```http
GET http://localhost:5115/games/2?api-version=2.0
```

You now get the response in the **V2** format:

```json
{
    "id": 2,
    "price": "USD 59.99",
    "details": {
        "title": "Final Fantasy XIV",
        "genre": "RolePlaying"
    }
}
```

Your API is now versioned!

There's just one more issue to tackle: how to handle the case when the client doesn't specify the API version in the request?

<br/>

### **Step 5: Configuring the default API version**
Our clients are not specifying any API version currently, so if we suddenly demand that they specify the **api-version** query parameter, they will still break.

To handle this, you can configure a default API version that will be used when the client doesn't specify one.

Here's how to do it by updating the API Versioning services registration:

```csharp{3 4}
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new(1.0);
    options.AssumeDefaultVersionWhenUnspecified = true;
})
```

With that, if the client comes with an unversioned request like this;

```http
GET http://localhost:5115/games/2
```

They will keep getting the response in the **V1** format:

```json
{
    "id": 2,
    "name": "Final Fantasy XIV",
    "price": 59.99
}
```

That should give client developers enough time to update their code to consume the new version of the API.

And that's it for this issue.

I hope it helps!

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp](https://go.dotnetacademy.io/bootcamp-waitlist)**:​ Everything you need to go from zero to building real-world .NET cloud applications, step by step.

2. **[​Building .NET REST APIs]({{ site.url }}/courses/dotnetrestapis)**: A carefully crafted package to kickstart your career as an ASP.NET Core Full Stack Developer, step by step. 

3. **[​Patreon Community](https://www.patreon.com/juliocasal)**: Join for exclusive discounts on all my in-depth courses and access my Discord server for community support and discussions. 

4. **[Promote yourself to 17,000+ subscribers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.