---
title: "Don't Unit Test Your ASP.NET Core API"
date: 2023-08-26
layout: post
featured-image: test-api.png
featured-image-alt: test-aspnetcore-api
image: /assets/images/test-api.png
issue-number: 9
---

*Read time: 6 minutes*

Today I'll show how to write integration tests for an ASP.NET Core API, step by step.

Integration tests are the best way to test an API, because they allow us to test the API in the context of the whole ASP.NET Core pipeline, which is something that unit tests can't do.

In the past, writing integration tests was a bit challenging, because you had to figure out a way to standup and setup your ASP.NET Core app for test purposes, which was a lot of work.

But with the help of a handy NuGet package, you can now bootstrap your full ASP.NET Core app in memory, making the setup needed for integration tests very straightforward.

Let's dive in.

<br/>

### **The API to test**
Let's say we have this ASP.NET Core API controller, which is part of our Match Making system:

```csharp
[ApiController]
[Route("api/matches")]
public class MatchesController : ControllerBase
{
    private readonly GameMatcher matcher;

    public MatchesController(GameMatcher matcher)
    {
        this.matcher = matcher;
    }

    [HttpPost]
    [Authorize]
    public async Task<GameMatchResponse> JoinMatch(JoinMatchRequest request)
    {
        var match = await matcher.MatchPlayerAsync(request.PlayerId);
        return match.ToGameMatchResponse();
    }
}
```

And let's say we already have an extensive unit test suite for the **GameMatcher.MatchPlayerAsync()** method, as well as for the **ToGameMatchResponse()** extension method. So that's all covered.

Now we want to test the **JoinMatch** controller action, which is the entry point to the whole match making process.

<br/>

### **Write unit tests for the controller action?**
Not really. Unit tests are not the best option to test controller actions, because:

* **This is a thin controller, with very little logic**. GameMatcher is doing the heavy lifting here and is already unit tested.

* **ToGameMatchResponse can also be unit tested in isolation**. No need to test it again here.

* **JoinMatch requires authorization**, but a unit test that just calls JoinMatch would skip that completely.

> What we really want to test here is that the controller action can do its job in the context of the whole ASP.NET Core pipeline, which is something that unit tests can't do.

Therefore, it's best to use a different type of test here: an **Integration Test**.

Let's see how to write an integration test for this controller action, step by step.

<br/>

### **Step 1: Create the test project and add dependencies**
Let's add a new test project for our integration tests:

```powershell
dotnet new xunit -n MatchMaker.Api.IntegrationTests
```

Then, add the following NuGet packages to your new test project:

* **Microsoft.AspNetCore.Mvc.Testing**. Adds support for writing integration tests for ASP.NET Core apps.
* **FluentAssertions**. Adds support for writing assertions in a more readable way.

Also, add a project reference from your new test project to your API project:

```powershell
dotnet add reference ../MatchMaker.Api/MatchMaker.Api.csproj
```

<br/>

### **Step 2: Allow your test project to view your API internals**
In preparation for next step, we'll need to allow our test project to view the internal classes defined in our API project.

In particular, we need access from the test project to the **Program** class that is the entry point to our API.

It is via the Program class that our integration tests will be able to register all services and middleware as if we were running the API in real life.

To allow this, we need to add an **InternalsVisibleTo** element to our API project's **.csproj** file (not the test project file):

```xml{3 4 5}
<Project Sdk="Microsoft.NET.Sdk.Web">
  ...
  <ItemGroup>
      <InternalsVisibleTo Include="MatchMaker.Api.IntegrationTests" />
  </ItemGroup>

</Project>
```

<br/>

### **Step 3: Add the test database connection string**
We could use an in-memory database for our integration tests, but since our application uses SQL Server, why not use a real SQL Server instance for our tests?

That should give us the highest confidence that the entire stack is working properly.

Now, I'll assume you already have a SQL Server instance running somewhere in your box, so I won't get into how to stand up one.

But we still need to come up with the DB used for the tests and also how to make our test project aware of the corresponding connection string.

And, since storing things like that in your code is not a great idea (even for tests), you can just store the connection string as a user secret.

So, in your terminal, switch to your test project directory, and run this (replace YOUR-CONNECTION-STRING-HERE with your actual connection string):

```powershell
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:MatchMaker" "YOUR-CONNECTION-STRING-HERE"
```

For instance, since I'm using a SQL Server docker container, this is how my connection string looks like:

```
Server=localhost; Database=MatchMaker-Tests; User Id=sa; Password=MY-SA-PASSWORD-HERE;TrustServerCertificate=True
```
**Important: Here you want to use a completely different database name, meant only for your tests. Please don't use your real DB name!**

Notice how my database is named **MatchMaker-Tests** here, not MatchMaker.

<br/>

### **Step 4: Create a WebApplicationFactory**
A **WebApplicationFactory** is a class that can bootstrap an entire application in memory, which is what we need to do in our integration tests.

Add this class to your test project:

```csharp
internal class MatchMakerWebApplicationFactory : WebApplicationFactory<Program>
{
    override protected void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // Remove the existing DbContextOptions
            services.RemoveAll(typeof(DbContextOptions<MatchMakerDbContext>));

            // Register a new DBContext that will use our test connection string
            string? connString = GetConnectionString();
            services.AddSqlServer<MatchMakerDbContext>(connString);

            // Delete the database (if exists) to ensure we start clean
            MatchMakerDbContext dbContext = CreateDbContext(services);
            dbContext.Database.EnsureDeleted();
        });
    }

    private static string? GetConnectionString()
    {
        var configuration = new ConfigurationBuilder()
            .AddUserSecrets<MatchMakerWebApplicationFactory>()
            .Build();

        var connString = configuration.GetConnectionString("MatchMaker");
        return connString;
    }

    private static MatchMakerDbContext CreateDbContext(IServiceCollection services)
    {
        var serviceProvider = services.BuildServiceProvider();
        var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MatchMakerDbContext>();
        return dbContext;
    }
}
```

A few key things about this class:

* The class has to be **internal** in order to be able to access the internal **Program** class of our API project.

* **ConfigureWebHost** will be invoked by the WebApplicationFactory when it's time to bootstrap our API in memory.

* **ConfigureTestServices** method is where we register all the services that will be used exclusively during our tests. Gives you a chance to replace any service with a test version.

* We use **ConfigureTestServices** to replace the real DBContext that our API uses with a new one that will use our test database.

* **GetConnectionString** is a helper method that will read the connection string from our user secrets.

* We also delete the test database via **EnsureDeleted** to ensure each test starts with a clean slate.

Let's now go ahead and add the actual test.

<br/>

### **Step 5: Create the integration test**
This is the easy part. Now that we have our WebApplicationFactory in place, writing the integration test is as easy as writing any program that talks to an HTTP API.

Replace the default **UnitTest1** class with this test class in your test project:

```csharp
public class MatchesControllerTests
{
    [Fact]
    public async Task JoinMatchRequest_AddsPlayerToMatch()
    {
        // Arrange
        var application = new MatchMakerWebApplicationFactory();
        JoinMatchRequest request = new("P1");

        var client = application.CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/matches", request);

        // Assert
        response.EnsureSuccessStatusCode(); // Status Code 200-299

        var matchResponse = await response.Content.ReadFromJsonAsync<GameMatchResponse>();
        matchResponse?.Id.Should().BePositive();
        matchResponse?.Player1.Should().Be("P1");
        matchResponse?.State.Should().Be(nameof(GameMatchState.WaitingForOpponent));
    }
}
```

Our test is doing basically the following:

1. It creates a new instance of our WebApplicationFactory, which will bootstrap our API in memory and create our test database.

2. It creates a new JoinMatchRequest object, which is the payload that our API expects.

3. It creates a standard HTTP client out of the WebApplicationFactory.

4. It uses the HttpClient to post the JoinMatchRequest to the API, as any standard client would do.

5. It asserts that the response is a 200 OK, and that the response body contains the expected values.

Now, go ahead and run this test:

```powershell
dotnet test
```

Unfortunately, you will get something like this:

```powershell{6 7}
Starting test execution, please wait...
A total of 1 test files matched the specified pattern.
[xUnit.net 00:00:01.81]     MatchMaker.Api.IntegrationTests.MatchesControllerTests.JoinMatchRequest_AddsPlayerToMatch [FAIL]
  Failed MatchMaker.Api.IntegrationTests.MatchesControllerTests.JoinMatchRequest_AddsPlayerToMatch [902 ms]
  Error Message:
   System.Net.Http.HttpRequestException : Response status code does not indicate success:
   401 (Unauthorized).
  Stack Trace:
     at System.Net.Http.HttpResponseMessage.EnsureSuccessStatusCode()
   at MatchMaker.Api.IntegrationTests.MatchesControllerTests.JoinMatchRequest_AddsPlayerToMatch() in D:\projects\Testing_Blog_Post\MatchMaker.Api.IntegrationTests\MatchesControllerTests.cs:line 23
--- End of stack trace from previous location ---

Failed!  - Failed:     1, Passed:     0, Skipped:     0, Total:     1, Duration: < 1 ms - MatchMaker.Api.IntegrationTests.dll (net7.0)
```

Which is expected, because our API requires authorization, and we are not providing it as part of our test.

Let's fix that.

<br/>

### **Step 6: Add an authentication handler**
An **AuthenticationHandler** is a class that can be used to provide authentication to our API.

Let's add this class to our test project:

```csharp
public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock)
        : base(options, logger, encoder, clock)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var identity = new ClaimsIdentity(Array.Empty<Claim>(), "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "TestScheme");

        var result = AuthenticateResult.Success(ticket);

        return Task.FromResult(result);
    }
}
```

The key in this class is the **HandleAuthenticateAsync** method, which is where we create an **AuthenticationTicket** that will be used to authenticate our test request.

We now need to tell our WebApplicationFactory to take advantage of it, so let's make an **AddAuthentication** call to **ConfigureTestServices** in our **MatchMakerWebApplicationFactory**:

```csharp{11 12 13}
builder.ConfigureTestServices(services =>
{
    // Remove the existing DbContextOptions
    services.RemoveAll(typeof(DbContextOptions<MatchMakerDbContext>));

    // Register a new DBContext that will use our test connection string
    string? connString = GetConnectionString();
    services.AddSqlServer<MatchMakerDbContext>(connString);

    // Add the authentication handler
    services.AddAuthentication(defaultScheme: "TestScheme")
        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
            "TestScheme", options => { });

    // Delete the database (if exists) to ensure we start clean
    MatchMakerDbContext dbContext = CreateDbContext(services);
    dbContext.Database.EnsureDeleted();
});
```

Notice that here we use both the **TestAuthHandler** we just created and the **TestScheme** we used there to create the AuthenticationTicket.

Now run your test again:

```powershell
dotnet test
```

And you should get a green light:

```powershell{4}
Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: < 1 ms - MatchMaker.Api.IntegrationTests.dll (net7.0)
```

Mission accomplished!

Now you have a great way to verify that your API is working as expected, from the entry point all the way to the database, and back.

I hope this was useful.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.

2. **​[Building Microservices With .NET](https://dotnetmicroservices.com)**: Transform the way you build .NET systems at scale.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.