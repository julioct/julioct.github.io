---
title: Getting Started With Entity Framework Core
date: 2024-02-24
layout: post
featured-image: tns-22.jpg
featured-image-alt: Getting Started With Entity Framework Core
issue-number: 22
---

*Read time: 3 minutes*

Today you will learn how to quickly add database support to an ASP.NET Core API via [Entity Framework Core](https://learn.microsoft.com/ef/core){:target="_blank"}.

A database is a crucial part of most applications. It's where you store your data, and it's where you retrieve it from when you need it.

In the past, you would have to manually translate your C# data access code into SQL statements, which was a time-consuming and error-prone process.

But with Entity Framework Core, you can let the framework do the heavy lifting for you, so you can focus on building your application.

Let's dive in.

<br/>

### **What is Entity Framework Core?**
Entity Framework Core is A lightweight, extensible, open source and cross-platform object-relational mapper for .NET.

![](/assets/images/what-is-ef-core.jpg)

It sits between your .NET application and your database server, mapping your .NET objects to database tables, and translating your C# data access code into SQL statements that the database server can understand.

Using Entity Framework Core in your .NET applications brings in multiple benefits:

* There’s no need for you to learn a new language. Just use C# and LINQ.

* There’s tooling available to keep your C# models in sync with your database tables.

* EF keeps track of the changes made to your C# entities at run time, so it knows how to persist them.

* It also supports multiple database providers.

Let's see how to quickly add database support to an ASP.NET Core API via Entity Framework Core.

<br/>

### **Step 1: Add your entity**
The entity is the class that represents the data that you want to map to a database table.

Here's the **Game** entity, from a Game Store application:

```csharp
public class Game
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public decimal Price { get; set; }

    public DateOnly ReleaseDate { get; set; }
}
```

<br/>

### **Step 2: Add the DBContext**
A [DbContext](https://learn.microsoft.com/dotnet/api/microsoft.entityframeworkcore.dbcontext){:target="_blank"} instance represents a session with the database and can be used to query and save instances of your entities. 

DbContext is a combination of the **Unit Of Work** and **Repository** patterns.

To use a DbContext, first add the appropriate NuGet package for your database provider:

```bash
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
```

Then create the DbContext class:

```csharp
public class GameStoreContext(DbContextOptions<GameStoreContext> options)
    : DbContext(options)
{
    public DbSet<Game> Games => Set<Game>();
}
```

And finally, register it with the service container in **Program.cs**:

```csharp
var connString = "Data Source=GameStore.db";
builder.Services.AddSqlLite<GameStoreContext>(connString);
```

<br/>

### **Step 3: Generate your database**
To turn your entities into database tables, you need to create and apply what is known as a **migration**,  

To generate a migration, first get the **dotnet-ef** tool:

```bash
dotnet tool install --global dotnet-ef
```

And add one NuGet package:

```bash
dotnet add package Microsoft.EntityFrameworkCore.Design
```

Then use dotnet-ef to create the migration:

```bash
dotnet ef migrations add InitialCreate --output-dir Data\Migrations
```

Finally, apply the migration:

```bash
dotnet ef database update
```

Your database is ready! 

Let's now start taking advantage of it.

<br/>

### **Step 4: Creating database records**
You can inject your DbContext instance into your endpoints to create and save instances of your entities into your database tables:

```csharp{5 6}
app.MapPost("/games", async (CreateGameDto newGame, GameStoreContext dbContext) =>
{
    Game game = newGame.ToEntity();

    dbContext.Games.Add(game);
    await dbContext.SaveChangesAsync();

    return Results.CreatedAtRoute(
        GetGameEndpointName, 
        new { id = game.Id }, 
        game.ToGameDetailsDto());
});
```

**Games.Add()** asks Entity Framework Core to keep track of the new game instance.

**SaveChangesAsync()** runs any required SQL statements to persist the changes to the database.

<br/>

### **Step 5: Querying database records**
Here's how you can standup an endpoint to retrieve the game created in the previous step:

```csharp{3}
app.MapGet("games/{id}", async (int id, GameStoreContext dbContext) =>
{
    Game? game = await dbContext.Games.FindAsync(id);

    return game is null ? 
        Results.NotFound() : Results.Ok(game.ToGameDetailsDto());
})
.WithName(GetGameEndpointName);
```

**Games.FindAsync()** tries to find the requested game in the Games DbSet and, if it is not there, it will send the corresponding SQL query to the database so that the game can be retrieved.

And that's pretty much it. You now have a fully functional database-backed ASP.NET Core API.

I hope it was helpful.

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[​Building Microservices With .NET](https://dotnetmicroservices.com)**:​ The only .NET backend development training program that you need to become a Senior C# Backend Developer.

2. **[ASP.NET Core Full Stack Bundle]({{ site.url }}/courses/aspnetcore-fullstack-bundle)**: A carefully crafted package to kickstart your career as an ASP.NET Core Full Stack Developer, step by step.

2. **[Promote yourself to 15,000+ subscribers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.