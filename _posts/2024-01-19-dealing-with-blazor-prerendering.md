---
layout: post
featured-image: /assets/images/blazorprerendering.jpg
issue-number: 18
title: Dealing With Blazor Prerendering
date: 2024-01-20T14:00:00.000Z
---
*Read time: X minutes*

\[WHAT THIS POST IS ABOUT]

\[WHY IT IS IMPORTANT]

\[THE CHALLENGE]

\[HOW I'LL SOLVE IT FOR YOU TODAY]

\[CALL TO ACTION]

<br/>

## **What is prerendering in Blazor?**

[Prerendering](https://learn.microsoft.com/aspnet/core/blazor/components/prerender) is the process of initially rendering page content on the server without enabling event handlers for rendered controls. 

The server outputs the HTML UI of the page as soon as possible in response to the initial request, which makes the app feel more responsive to users.

Prerendering is enabled by default for all your interactive components, regardless of the render mode (Server, WebAssembly, or Auto).

## **What's the problem with prerendering?**

Before .NET 8, I was mostly used to standalone Blazor WASM, since I love the idea of running everything I can in the browser, for the best possible experience.

However, when I started working with .NET 8, and started creating Blazor WASM apps (via the new template) that talk to my REST APIs, something odd happened.

I noticed that the first time I loaded a page that fetched data from my API, it would end up calling my API twice. 

For instance, in the razor component that renders this simple page:

![](/assets/images/blazor-table.jpg)

This `OnInitializedAsync()` implementation would always be invoked twice:

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

### **Use OnAfterRenderAsync** instead of OnInitializedAsync?

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

1. Inject an instance of the **PersistentComponentState** service:

```csharp
@inject PersistentComponentState ApplicationState
```

2. Register a callback to persist the component state before the app is paused (when prerendering completes):

```csharp
@implements IDisposable

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

Notice that you should also implement **IDisposable** and dispose the subscription on the **Dispose** method.



- - -

<br/>

**Whenever you’re ready, there are 2 ways I can help you:**

1. **[In-depth Courses For .NET Developers](https://juliocasal.com/courses)**:​ Whether you want to upgrade your software development skills to find a better job, you need best practices for your next project, or you just want to keep up with the latest tech, my in-depth courses will help you get there, step by step. **[Join 800+ students here](https://juliocasal.com/courses)**.
   <br/>
2. **[Patreon Community](https://www.patreon.com/juliocasal)**. Get access to the source code I use in all my YouTube videos, plus get exclusive discounts for my in-depth courses. **[Join 30+ .NET developers here](https://www.patreon.com/juliocasal)**.