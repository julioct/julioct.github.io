---
title: "The Problem With Dependencies And Unit Testing"
date: 2023-10-28
layout: post
featured-image: dependency-injection.png
featured-image-alt: dependency-injection
image: /assets/images/dependency-injection.png
issue-number: 13
---

*Read time: 5 minutes*

Today I'll go over the problem with trying to unit test classes that have dependencies.

A well-designed class should not try to do everything by itself. Instead, it should delegate some of its work to other classes.

But that can make unit testing a bit tricky, because the way those other classes behave can make your unit tests slow and unreliable.

Luckily, there's a simple solution to this problem, and that's what I'll show you today.

So, let's dive in.

<br/>

### **What's a dependency?**
A dependency is an object that your class uses to do its job. 

For example, say you have a **GameWorld** class that uses a **FileBasedStatisticsService** class to both retrieve and record player statistics:

<img src="{{ site.url }}/assets/images/what-is-a-dependency.png"/>

 Since GameWorld uses methods like **GetPlayerStatics** from FileBasedStatisticsService, then GameWorld has a **dependency** on FileBasedStatisticsService.

<br/>

### **What's the problem with dependencies and unit testing?**
The problem is in how coupled a class is with its dependencies. For instance, here's how GameWorld uses FileBasedStatisticsService today:

```csharp{7}
public class GameWorld
{
    private readonly FileBasedPlayerStatisticsService statisticsService;

    public GameWorld()
    {
        statisticsService = new("statistics.json");
    }

    public PlayerReportDto GetPlayerReport(Player player)
    {
        var stats = statisticsService.GetPlayerStatistics(player.Name);
        double averageScore = stats.GamesPlayed == 0 ? 
            0 : (double)stats.TotalScore / stats.GamesPlayed;

        return new PlayerReportDto(
            player.Name,
            player.Level,
            player.JoinDate,
            stats.GamesPlayed,
            stats.TotalScore,
            averageScore
        );
    }
}

```

In particular, notice how GameWorld creates a new instance of FileBasedStatisticsService in its constructor, by also passing in the file to be used to store statistics (an out of process dependency).

GameWorld is **tightly coupled** to FileBasedStatisticsService because it directly **creates** a private instance of it.

And that's a problem because, when you try to unit test the **GetPlayerReport** method, a call will be made to **GetPlayerStatistics** on the **FileBasedStatisticsService** class, which will try to read the statistics file.

And that's not only slow, but it also complicates things for your test since it will need to create a file with the right data, in the right place, and then delete it after the test is done.

When you're writing unit tests, you want to **isolate** the unit you're testing (GetPlayerReport) from its dependencies, so that you can test it quickly and reliably.

<br/>

### **How to decouple the dependencies?**
GameWorld should not need to create an instance of FileBasedStatisticsService directly.

In fact, GameWorld doesn't even need to know about FileBasedStatisticsService at all. 

All it needs is some object that implements the **interface** with the methods that GameWorld needs to use.

So, you start by creating such interface and have FileBasedStatisticsService implement it:

```csharp
public interface IPlayerStatisticsService
{
    PlayerStatistics GetPlayerStatistics(string playerName);
}

public class FileBasedPlayerStatisticsService : IPlayerStatisticsService
{
    /// Class implementation omitted for brevity
}

```

And then have GameWorld use the interface instead of the concrete class:

```csharp{3 5}
public class GameWorld
{
    private readonly IPlayerStatisticsService statisticsService;

    public GameWorld(IPlayerStatisticsService playerStatisticsService)
    {
        this.statisticsService = playerStatisticsService;
    }

    public PlayerReportDto GetPlayerReport(Player player)
    {
        var stats = statisticsService.GetPlayerStatistics(player.Name);
        double averageScore = stats.GamesPlayed == 0 ? 
            0 : (double)stats.TotalScore / stats.GamesPlayed;

        return new PlayerReportDto(
            player.Name,
            player.Level,
            player.JoinDate,
            stats.GamesPlayed,
            stats.TotalScore,
            averageScore
        );
    }
}
```

Which means that now the relationship between the two objects is like this:

<img src="{{ site.url }}/assets/images/dependency-injection.png"/>

<br/>

### **How does that help me unit test my class?**
Well, now your unit tests can create instances of GameWorld by providing any object that implements IPlayerStatisticsService.

For instance, you can create this fake class:

```csharp
public class FakePlayerStatisticsService : IPlayerStatisticsService
{
    private readonly Dictionary<string, PlayerStatistics> statistics = new();

    public PlayerStatistics GetPlayerStatistics(string playerName)
    {
        return statistics[playerName];
    }

    public void UpdatePlayerStatistics(PlayerStatistics stats)
    {
        statistics[stats.PlayerName] = stats;
    }
}
```

Which implements the interface, but instead of reading and writing to a file, it stores the data in memory.

And with that fake available (also known as a test double), you can finally write your unit test:

```csharp
[Fact]
public void GetPlayerReport_PlayerExists_ReturnsExpectedReport()
{
    // Arrange
    var player = new Player("Alice", 10, new DateTime(2020, 1, 1));
    
    var statisticsService = new FakePlayerStatisticsService();
    var stats = new PlayerStatistics
    {
        PlayerName = "Alice",
        GamesPlayed = 10,
        TotalScore = 1000
    };

    statisticsService.UpdatePlayerStatistics(stats);
    var expected = new PlayerReportDto(
        player.Name, 
        player.Level, 
        player.JoinDate, 
        stats.GamesPlayed, 
        stats.TotalScore, 
        stats.TotalScore / stats.GamesPlayed);

    var sut = new GameWorld(statisticsService);
    
    // Act
    var actual = sut.GetPlayerReport(player);

    // Assert
    expected.Should().BeEquivalentTo(actual);
}

```

Notice how the fake statistics service is created and populated with the data that the test needs, and then it's used to construct GameWorld, the **SUT** (System Under Test).

And then, when the test calls **GetPlayerReport** on the **SUT**, the fake statistics service is used instead of the real one.

Thanks to this, your unit test can now focus on verifying the behavior of GetPlayerReport in a **fast** and **reliable** way, without having to worry about the inner workings of its dependencies.

<br/>

### **Do I need to create fake classes all the time?**
No, that's only one type of test double. There are other types, like **stubs** and **mocks**, which can make things much easier. 

I go over those in detail in my [C# Unit Testing Essentials Course]({{ site.url }}/courses/csharp-unittesting-essentials).

And that's it for today.

I hope you enjoyed it.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://go.dotnetacademy.io/stripe-waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[.NET Cloud Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete blueprint for C# developers who need to build production-ready .NET applications for the Azure cloud.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.