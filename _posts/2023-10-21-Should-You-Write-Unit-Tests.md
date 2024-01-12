---
title: "Should You Write Unit Tests?"
date: 2023-10-21
layout: post
featured-image: cost-of-not-having-tests.png
featured-image-alt: cost-of-not-having-tests
image: /assets/images/cost-of-not-having-tests.png
issue-number: 12
---

*Read time: 5 minutes*

Today I'll try to answer this common question: **Should you write unit tests?**

Unit tests are the cheapest and most reliable type of automated tests, and they can be a game changer for your software quality and developer productivity.

Yet, they also count towards the relative cost of writing software over time, with devs spending as much or more time writing tests than writing code.

So, are unit tests worth it? And, if so, how many should you write?

Let's dive in.

<br/>

### **What is a unit test?**
A unit test is an automated test that:
* Verifies a small piece of code, known as the unit
* Does it very quickly
* Does it in isolation.

So, for instance, if your web application has, among several classes, a **GameMatcher** class with methods like MatchPlayer(), GetMatch() and AssignServer(), those methods are known as the **units**, since they provide the minimum functionality exposed by your application.

<img src="{{ site.url }}/assets/images/what-is-a-unit.png"/>

And a unit test is meant to **verify that each of those units always work as expected** by testing them in isolation from the rest of the application.

Here's an example C# unit test written with the **xUnit** test framework:

```csharp
[Fact]
public void CanOpen_ChestIsLockedAndHasKey_ReturnsTrue()
{
    // Arrange
    var sut = new TreasureChest(isLocked: true);

    // Act
    var result = sut.CanOpen(hasKey: true);

    // Assert
    Assert.True(result);
}
```

This unit test verifies that the **CanOpen** method (the unit) of the **TreasureChest** class returns **true** when the chest is locked and the player has the key.

But the common question is: **Should you write unit tests?**

<br/>

### **The relative cost of writing software over time**
People that don't write unit tests usually say that they don't have time to write them, or that they're too expensive to write.

However, they usually don't realize that the cost of not having unit tests is much higher than the cost of writing them or not having tests at all.

<img src="{{ site.url }}/assets/images/cost-of-not-having-tests.png"/>

As you can see here, you can start cheap by only having end to end tests, integration tests, or no tests at all, but in the long run, the cost of any of those options is way higher than the cost of writing unit tests.

Let's see why.

<br/>

### **No automated tests**
The main problem of not having tests is that, sooner than later, bugs will show up in your production environment, which triggers a bunch of problems:

* Not just your company but your customers might be **losing revenue** either by not being able to use the software properly or because of potential data loss.

* Bugs in production will **cost a huge amount of engineer hours** spent on debugging and fixing issues that might be hard to reproduce outside of the production environment.

* **Your company’s reputation will get damaged**, and it will not be easy to regain the trust of your customers.

<br/>

### **End to end tests only**
Surprisingly, many people still believe that having an end-to-end test suite is all they need to ensure their software quality. But this could not be farther from the truth:

* End to end tests will only get more expensive over time given the need for one or more test environments that should use a similar set of **expensive resources** as production.

* Since these tests take a long time to complete, the **feedback cycle for devs is very long**, which means that bugs will be found and will need fixing when devs have already moved on to other tasks.

* End to end tests can **easily get flaky** since they deal with a continuously changing UI and external services that can fail at any time, which translates into randomized devs that can’t keep doing feature work.

<br/>

### **Integration tests only**
Many teams have instead decided to rely exclusively on integration tests. However, this also brings a set of increasing costs:

* Integration tests run much faster than E2E tests, but they are still **very slow as compared to unit tests**, so devs won’t run them frequently and they will be relegated to run only on the CI/CD pipeline. A slow feedback cycle means longer times to discover and fix bugs.

* Even when diagnosing integration test failures is easier than with E2E tests, **it’s still challenging to spot the exact component that is causing trouble**, which translates into more time to get a fix.

* Integration tests are easier to maintain since they will be usually written in the language used to code the product, but they still **require quite a bit of setup** to prepare all dependencies for the scenario under test.

<br/>

### **Unit tests only**
Now let’s see why unit tests are way more cost effective over time:

* Unit tests are the cheapest to run in terms of resources since they **don’t require any environment setup**. All they should be using is a bit of memory and CPU from the local box, which is cheap and fast.

* They provide the **quickest feedback cycle** since devs can run them very quickly right from their dev box and they can run them as many times as needed to verify fixes.

* They are the **most reliable** because they are completely isolated from any external dependencies. Like any normal program, they follow a strict algorithm that will work the same way every single time.

* When a unit test fails it will **show the exact line of code where the issue occurred**. Devs can easily reproduce this in their boxes, spot the issue and fix it quickly.

* Finally, they are **easy to maintain**, short and focused on a single unit, assuming they are written the right way.

<br/>

### **Do you need to pick one type of test?**
No, it’s not about having only one type of tests, but making sure you invest the right amount of resources on a combination of tests that provides the best return on your investment.

Now, assuming you are sold on the idea of having automated tests, how many unit, integration and end to end tests should you write? 

Time to bring in the most famous of all pyramids.


<br/>

### **How many tests to have?**
The **Test Pyramid** is a concept introduced by Mike Cohn in his book **Succeeding with Agile**. It’s a simple way to visualize the different types of tests you should have in your test suite and the relative number of each.

<img src="{{ site.url }}/assets/images/test-pyramid.png"/>

At the bottom of the pyramid you will find tests that run faster and that are more isolated, while at the top we have tests that are slower and require more integration.

That gives us a great reference on how to distribute our testing efforts:

* **Write lots of unit tests** since they run in isolation and really fast (usually in milliseconds). You should have tons of them, hundreds and hundreds, which will help you verify every scenario and corner case of the application and still give you quick feedback on any issues.

* **Write a moderate amount of integration tests** because they have to integrate with out of process dependencies, which means they run slower and are harder to diagnose when they fail.

* **Write very few end to end tests** because they can be really slow, they can break easily given the overwhelming amount of components they have to exercise, especially the UI, and they can be very hard to diagnose when they start reporting errors.

<br/>

### **So, should you write unit tests?**

**Yes please!** Write as many unit tests as you can and complement them with a moderate amount of integration tests and a few end to end tests. 

That will give you the best return on your investment in terms of software quality and developer productivity.

And that's it for today.

I hope it was useful.

<br/>

---

<br/>

**Whenever you’re ready, there are 2 ways I can help you:**

1. **[In-depth Courses For .NET Developers](https://juliocasal.com/courses)**:​ Whether you want to upgrade your software development skills to find a better job, you need best practices for your next project, or you just want to keep up with the latest tech, my in-depth courses will help you get there, step by step. **[Join 700+ students here](https://juliocasal.com/courses)**.
<br/>

2. **[Patreon Community](https://www.patreon.com/juliocasal)**. Get access to the source code I use in all my newsletter issues and YouTube videos, plus get exclusive discounts for my courses. **[Join 25+ .NET developers here](https://www.patreon.com/juliocasal)**.
