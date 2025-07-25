---
layout: post
featured-image: blazorprerendering.jpg
issue-number: 18
title: Dealing With Blazor Prerendering
date: 2024-01-20
---
*Read time: 4 minutes*

Today I want to talk about Blazor prerendering and how to deal with it when you have a Blazor WASM app that talks to your backend API.

Prerendering is a great feature that can make your Blazor app feel more responsive to users, and can even improve your SEO.

However, it can also cause some unexpected behavior if you're not aware of it or if you come from building standalone Blazor WASM apps like me.

With a good understanding of how prerendering can work for you, your Blazor apps:

* Will load faster than when using standalone Blazor WASM
* Will efficiently call your backend API only when needed
* Will be just as responsive and interactive as standalone Blazor WASM apps

Let's get started.

<br/>

## **What is prerendering in Blazor?**

[Prerendering](https://learn.microsoft.com/aspnet/core/blazor/components/prerender) is the process of initially rendering page content on the server without enabling event handlers for rendered controls. 

The server outputs the HTML UI of the page as soon as possible in response to the initial request, which makes the app feel more responsive to users.

Prerendering is enabled by default for all your interactive components, regardless of the render mode (Server, WebAssembly, or Auto).

<br>

## **What's the problem with prerendering?**

Before .NET 8, I was mostly used to standalone Blazor WASM, since I love the idea of running everything I can in the browser, for the best possible experience.

However, when I started working with .NET 8 and started creating Blazor WASM apps (via the new template) that talk to my REST APIs, something odd happened.

I noticed that the first time I loaded a page that fetched data from my API, it would end up calling my API twice. 

For instance, in the razor component that renders this simple page:

![](/assets/images/blazor-table.jpg)

This **OnInitializedAsync()** implementation would always be invoked twice:

```csharp
@code {
    private Game[]? games;
  
    protected override async Task OnInitializedAsync()
    {
        games = await Client.GetGamesAsync();
    }
}
```

That never happened in the same version of the app when running in .NET 7 Blazor WASM.

This was driving me crazy for a few hours, but after learning about [prerendering](https://learn.microsoft.com/aspnet/core/blazor/components/prerender) and how it affects the lifecycle of a Blazor app, things started making sense.  

<br>

### **Why is OnInitializedAsync invoked twice?**

To start with, the new Blazor template in .NET 8 will always create an ASP.NET Core backend to serve your Blazor app if you choose WebAssembly interactivity.

![](/assets/images/blazor-folder-structure.jpg)

Kind of similar to the [Blazor WASM Hosted](https://learn.microsoft.com/en-us/aspnet/core/blazor/host-and-deploy/webassembly?view=aspnetcore-7.0#hosted-deployment-with-aspnet-core) approach available before, which I had not tried.

And when your Blazor WASM app is hosted like this, the following happens:

1. **OnInitializedAsync** is invoked once on the backend to try to prepare as much HTML as possible to send to the browser immediately. This happens before the actual Blazor WASM app lands in the browser.
2. **OnInitializedAsync** is invoked once again once the Blazor WASM app finally arrives and loads in the browser.

The result of this is that indeed you won't see the typical "loading" indicator as the app loads. 

You will see HTML right away, and in the case of my app, you will see the games table with data right away, which is pretty cool.

However, having my Blazor app call my backend API twice is unacceptable in terms of the increased and unnecessary load it will put on the server side.

How to deal with this?

<br>

## **Use OnAfterRenderAsync instead of OnInitializedAsync?**

OnAfterRenderAsync is invoked after a component has rendered interactively and the UI has finished updating.

It looks like this:

```csharp
protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (firstRender)
    {
        games = await Client.GetGamesAsync();
        StateHasChanged();
    }
}  
```

This is the first thing that I tried and it will surely prevent calling my API twice. 

However, this code runs when the component is already rendered, so we already lost the opportunity to take advantage of prerendering.

And it will make my page look like this for a second or two:

![](/assets/images/blazor-onafterrender.jpg)

As [the official docs say](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-8.0#after-component-render-onafterrenderasync), you would use this stage to perform additional initialization steps with the rendered content, such as JS interop calls that interact with the rendered DOM elements.

There has to be a better way.

### **Persisting the prerendered state**

It turns out that there's a cool Blazor service called [PersistentComponentState](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.components.persistentcomponentstate), which can persist the initial value of your objects during the prerendering stage so that you can later restore that value during the normal rendering stage.

And it's actually very easy to use:

**1. Inject an instance of the PersistentComponentState service:**

```csharp
@inject PersistentComponentState ApplicationState
```

**2. Register a callback to persist the component state before the app is paused** (when prerendering completes):

```csharp
@implements IDisposable
@inject PersistentComponentState ApplicationState

@code {
    private const string gamesDataKey = "GamesData";
    private Game[]? games;
    private PersistingComponentStateSubscription persistingSubscription;

    protected override async Task OnInitializedAsync()
    {
        persistingSubscription = ApplicationState.RegisterOnPersisting(PersistData);
    }

    private Task PersistData()
    {
        ApplicationState.PersistAsJson(gamesDataKey, games);

        return Task.CompletedTask;
    }

    void IDisposable.Dispose()
    {
        persistingSubscription.Dispose();
    }
}
```

At the end of the prerendering stage the **PersistData** method will take care of persisting the games array, with all the loaded data, using the key specified by **gamesDataKey**.

Notice that you should also implement **IDisposable** and dispose of the subscription on the **Dispose** method.

**3. Update OnInitializedAsync to load the persisted data, if available.** Otherwise, get data from the backend:

```csharp{5 6 7 8 9 10 11 12}
protected override async Task OnInitializedAsync()
{
    persistingSubscription = ApplicationState.RegisterOnPersisting(PersistData);

    if (!ApplicationState.TryTakeFromJson<Game[]>(gamesDataKey, out var restored))
    {
        games = await Client.GetGamesAsync();
    }
    else
    {
        games = restored;
    }
}
```

And that's it! 

With this approach:

* Your page will load fast, taking full advantage of prerendering
* A single call is made to your API to load the initial data
* You have an interactive Blazor WASM client that takes full advantage of the prerendered data

And that's it for today.


I hope it was helpful.

---

<br/>

**Whenever you’re ready, there are 4 ways I can help you:**

1. **[​Stripe for .NET Developers (Waitlist)​](https://go.dotnetacademy.io/stripe-waitlist)**: Add real payments to your .NET apps with Stripe—fast, secure, production-ready.

2. **[Containers & .NET Aspire]({{ site.url }}/courses/containers-and-dotnet-aspire)**: Build production-ready apps from day 1 and leave 'but it works on my machine' behind.

3. **​[​Get the full source code](https://www.patreon.com/juliocasal){:target="_blank"}**: Download the working project from this newsletter, grab exclusive course discounts, and join a private .NET community.

4. **[Promote your business to 25,000+ developers]({{ site.url }}/sponsorship)** by sponsoring this newsletter.