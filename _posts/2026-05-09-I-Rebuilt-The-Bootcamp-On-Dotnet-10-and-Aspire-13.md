---
layout: post
title: "I Rebuilt the Bootcamp on .NET 10 and Aspire 13"
date: 2026-05-09
issue-number: 114
featured-image: 2026-05-09/featured.png
featured-image-alt: I Rebuilt the Bootcamp on .NET 10
---

*Read time: 5 minutes*

A few months back, I sat down to do what I thought was a routine job. Bump the [The .NET Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp) from .NET 8 to .NET 10. New target framework, new package versions, re-record a few lessons, ship it.

That plan lasted about a day.

The first thing I noticed was that 2 of the most common NuGet packages in the bootcamp (the ones I install in almost every project) had been absorbed into the framework itself. Then I opened the AppHost project and the .csproj file looked completely different. Then the Blazor frontend had a new authentication flow that cut out a bunch of custom code. Then Stripe had renamed their main React component.

And that was just one course.

By the time I worked through all 7 main courses (plus the 3 bonus mini-courses), the new edition was a full rebuild.

![I Rebuilt the Bootcamp on .NET 10 and Aspire 13](/assets/images/2026-05-09/featured.png)

<br/>

## What's actually inside this upgrade

Here's a high-level overview, so you can see why this turned into months of work.

* **.NET 8 to .NET 10.** Every `.csproj` in every course bumped. Hundreds of project files, all on the same .NET 10 stack across the 7 main courses and the 3 bonus mini-courses.
* **Validation is now built into ASP.NET Core.** The third-party NuGet package the bootcamp used to install on every API is gone from every project. Smaller setup, fewer dependencies.
* **OpenAPI is now built into ASP.NET Core too.** Same story. Swashbuckle is gone from every project, replaced by the framework's own first-party OpenAPI support (a .NET 9 update).
* **Blazor changed more than I expected.** Static asset fingerprinting and cache-busting are now included. The server-to-WASM auth state flow (3 custom files, ~110 lines of glue code in the old bootcamp) collapses to 2 built-in API calls. Form validation went source-generated and AOT-friendly. And I caught a token refresh bug that was silently dropping custom claims.
* **The React side moved too.** React 18 to 19, Vite 5 to 8, TypeScript 5 to 6, react-router-dom 6 to 7, plus the OIDC client packages. One of those silently breaks `npm install` on its latest version, which I had to track down the hard way.
* **Aspire 9.5 to Aspire 13.2.** Major version jump. The AppHost project file was redesigned, tons of updated and new APIs, the Aspire CLI is now part of the standard workflow, the pattern for wiring a React frontend into the AppHost changed, and lots more.
* **Stripe, both sides.** Multiple major versions of the Stripe React SDK, plus Stripe.NET jumping to 51. The main React component for embedded checkout was replaced, and the server-side checkout call changed shape.
* **Getting the integration tests onto .NET 10 took real work.** C# 14 broke a `Program` type lookup, EF Core 10 + Npgsql changed when an interceptor fires, the runtime now expects a `TimeProvider` registration, and a timing race in the outbox test surfaced under the new defaults.
* **CI/CD pipelines updated end to end.** Pipeline YAMLs, SDK install steps, publish paths. Every CI lesson runs on the new versions.

If you've moved or are about to move your projects to .NET 10, this new edition includes all the changes you need to make. Every lesson snapshot matches a fresh project on the current .NET and Aspire SDK, so you can see exactly what to change and where.

<br/>

## Docker and Aspire are now their own courses

The old Course 5 was called "Containers & .NET Aspire." It tried to cover 2 topics in one course, and it didn't feel like I covered Docker fundamentals properly. Plus, the way Aspire was introduced halfway through the course followed a sequence you would not use in real projects.

So I split the old course in two:

* **Course 5: Docker for .NET Developers.** Recorded natively on .NET 10 from the ground up. It starts with Docker fundamentals (what an image actually is, how containers work, how registries fit in, how networking and volumes behave, etc), then moves into containerizing real .NET applications (multi-stage builds, the right base images, configuration, secrets). 22 lessons re-recorded. A standalone Docker course tailored to .NET developers.

* **Course 6: Aspire for .NET Developers.** All-new dedicated Aspire course. Full Aspire 13.2 coverage from scratch: the new SDK format, new APIs, updated hosting integrations, the new way to bring in React apps. 4 entire course modules redone from scratch in a brand new, more logical sequence, plus Keycloak as the default identity provider with a complete realm export so it "just works" from the first lesson (Entra ID still supported).

The Payments, Queues & Workers course shifts to Course 7, followed by the 3 bonus mini-courses on Integration Testing, Azure DevOps CI/CD and Troubleshooting .NET Apps in Azure, all also updated to .NET 10 and Aspire 13.2.

If you've been on the fence about using Docker or Aspire in your .NET projects, the new structure lets you jump straight into Course 5 or Course 6 without going through the earlier courses first.

<br/>

## What stayed the same

Everything you already know about minimal APIs, EF Core, JWT, Keycloak, Entra ID, Azure Storage, Service Bus, Aspire orchestration patterns, Blazor components, and OIDC auth flows is still right. The architecture is unchanged. The mental model is unchanged.

What changed is the surface. Cleaner project files. Fewer NuGet packages. Typed APIs where there used to be strings. Modern frontend tooling. None of it requires you to relearn how the bootcamp's app actually works.

<br/>

## Where we are and what's next
Last week I finished recording the last of the ~85 new lessons across the 7 main courses and 3 bonus mini-courses, and now I'm on the editing and polishing phase. More details on the release timeline of this new bootcamp edition coming soon.

In my next couple of newsletters I'll go over why .NET 10 is a big deal, the new features that will affect real-world apps, and what's worth knowing about Aspire 13.2 if you're still on Aspire 9.

And that's it for today.

See you next Saturday.
