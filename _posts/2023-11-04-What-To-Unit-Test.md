---
title: "What Should I Unit Test?"
date: 2023-11-04
layout: post
featured-image: the-4-types-of-code.png
featured-image-alt: the-4-types-of-code
image: /assets/images/the-4-types-of-code.png
issue-number: 14
---

*Read time: 4 minutes*

I recently asked my newsletter subscribers what they struggle the most with when it comes to unit testing.

And one of the most common answers was: **What should I unit test?**

Knowing what to unit test is a common struggle, and many folks will tell you that you should unit test everything.

But trying to unit test everything in your code base is a recipe for disaster, because it's time consuming, hard to maintain and doesn’t add enough value to your project.

So, what should you unit test?

Let's find out.

<br/>

### **The four types of code**
The first thing you should realize is that in a typical application you will find several types of code, which vary in complexity, domain significance and number of collaborators.

<img src="{{ site.url }}/assets/images/the-4-types-of-code.png"/>

The diagram above, taken from the <a href="https://amzn.to/3MszFbX" target="_blank">Unit Testing: Principles, Practices and Patterns book, by Vladimir Khorikov</a>, shows the four types of code that you will usually find:

* **Domain model and algorithms**. Includes your domain model, which is all the code and classes that represent your business domain, and the algorithms, which is complex code that may or may not be related to the domain.

* **Trivial code**. This is code that has minimal complexity and few (if any) collaborators. Things like parameterless constructors and one-line properties.

* **Controllers**. Code that coordinates the work of other components, but it doesn’t have any interesting logic in regard to the business domain. ASP.NET Core controllers, minimal API endpoints and data repositories live here.

* **Overcomplicated code**. This is complex code that has lots of collaborators. Here’s where you’ll find fat controllers that don’t just coordinate work but that deal with complex logic and interact with tons of dependencies.

<br/>

### **Focus on the domain model and algorithms**
Since the **domain model and algorithms have the most complexity and domain significance**, plus few collaborators, unit testing code there will result in highly valuable and cheap unit tests.

**There’s no point in testing trivial code** since you would end up with tests that have close to zero value.

**Controllers are better served by integration tests**, since those are designed to test how the system works when combining your domain model and algorithms with out of process dependencies.

Finally, **you should never have over complicated code** in your app, so if you have it, you should refactor that code into algorithms, the domain model and your controllers.

But how does this look like in a real application? Let’s take a look at a few examples.

<br/>

### **Trivial code**
Here's the constructor for the **Quest** class:

```csharp
public Quest(string name, int reward)
{
    Name = name;
    Reward = reward;
}
```

There's nothing interesting going on there and unit testing that constructor won't add enough protection against regressions.

<br/>

### **Controller**
Here's an ASP.NET Core controller that provides an endpoint used to retrieve a game match by its ID:

```csharp
[ApiController]
[Route("matches")]
public class MatchesController : ControllerBase
{
    private readonly IGameMatcher matcher;

    public MatchesController(IGameMatcher matcher)
    {
        this.matcher = matcher;
    }

    [HttpGet("{matchId}")]
    public async Task<ActionResult<GameMatchResponse>> GetMatchByIdAsync(int matchId)
    {
        return await matcher.GetMatchByIdAsync(matchId);
    }
}
```

Should you unit test that **GetMatchByIdAsync** method? 

No, because it's just coordinating the work of other components (the GameMatcher) and it doesn't have any interesting logic in regard to the business domain.

The best way to test that controller is with an [integration test](Dont-Unit-Test-Your-AspNetCore-API).

<br/>

### **Domain model and algorithms**
The **GameMatch** class, part of the domain model, offers a **SetServerDetails** method to set the IP address and port of the server where the match will take place:

```csharp{11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31}
public class GameMatch
{
    // More code here, but omitted for brevity

    public GameMatchState State { get; private set; }

    public IPAddress? ServerIpAddress { get; private set; }

    public int? ServerPort { get; private set; }

    public void SetServerDetails(string ipAddress, int port)
    {
        if (!IPAddress.TryParse(ipAddress, out var parsedIpAddress))
        {
            throw new InvalidIpAddressException(ipAddress);
        }

        if (port < IPEndPoint.MinPort || port > IPEndPoint.MaxPort)
        {
            throw new InvalidPortException(port);
        }

        if (State != GameMatchState.MatchReady)
        {
            throw new MatchNotReadyException("Invalid state.");
        }

        ServerIpAddress = parsedIpAddress;
        ServerPort = port;
        State = GameMatchState.ServerReady;
    }
}
```

Should we write unit tests for **SetServerDetails**? 

YES! That method has interesting logic regarding the business domain and it has no collaborators.

The fact that IP address and port should have valid values and the fact that a match that is in the wrong state cannot move to the ServerReady state are both important business rules that should be tested.

Here for one possible unit test for that method:

```csharp
[Fact]
public void SetServerDetails_InvalidIpAddress_ThrowsInvalidIpAddressException()
{
    // Arrange
    var sut = new GameMatch("P1");
    string invalidIpAddress = "invalid ip address";
    int port = 1234;

    // Act
    Action act = () => sut.SetServerDetails(invalidIpAddress, port);

    // Assert        
    act.Should().Throw<InvalidIpAddressException>();
}
```

<br/>

### **Overcomplicated code**
Here's a piece of overcomplicated code in the **MatchesController** class:

```csharp
[HttpPost]
public async Task<GameMatchResponse> JoinMatchAsync(JoinMatchRequest request)
{
    string playerId = request.PlayerId;

    GameMatch? match = await repository.FindMatchForPlayerAsync(playerId);

    if (match is null)
    {
        match = await repository.FindOpenMatchAsync();

        if (match is null)
        {
            match = new GameMatch
            {
                Player1 = playerId,
                State = GameMatchState.WaitingForOpponent
            };

            await repository.CreateMatchAsync(match);
        }
        else
        {
            match.Player2 = playerId;
            match.State = GameMatchState.MatchReady;
            await repository.UpdateMatchAsync(match);
        }
    }
    else
    {
        logger.LogInformation("{PlayerId} already assigned to existing match.", playerId);
    }

    return match.ToGameMatchResponse();        
}
```

That is what is known as a fat controller. Its **JoinMatchAsync** method is coordinating the work of other components, but it also has complex logic and interacts with two dependencies (logger and repository).

Should we write unit tests for **JoinMatchAsync**?

NO. That method is overcomplicated, and it has important domain logic that should be refactored into other component(s) that can be easily unit tested, which is something I cover in detail in my **[Mastering C# Unit Testing](https://juliocasal.com/mastering-csharp-unittesting)** course.

And once that refactoring is done, you'll end up with a thin controller that will fit into the Controllers quadrant.

<br/>

### **Conclusion**

Your goal is not to have unit tests for every single piece of code in your app.

**Your goal is to end up with a test suite where each test adds significant value to your project and enables its sustainable growth.**

And that's it for today.

I hope that helped.

---

<br/>

**Whenever you’re ready, there are 3 ways I can help you:**

1. **[​Building Microservices With .NET](https://dotnetmicroservices.com/fs0510)**:​ The only .NET backend development training program that you need to become a Senior C# Backend Developer.

2. **[ASP.NET Core Full Stack Bundle]({{ site.url }}/courses/aspnetcore-fullstack-bundle)**: A carefully crafted package to kickstart your career as an ASP.NET Core Full Stack Developer, step by step.

2. **[Promote yourself to 15,000+ subscribers]({{ site.url }}/sponsor-the-newsletter)** by sponsoring this newsletter.