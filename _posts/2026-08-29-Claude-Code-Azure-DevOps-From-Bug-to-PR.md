---
layout: post
title: "Claude Code + Azure DevOps: From Bug to PR"
date: 2026-08-29
issue-number: 124
featured-image: 2026-08-29/image-12.png
featured-image-alt: The Azure DevOps pull request page with the work item and linked bug visible alongside the description
---

*Read time: 8 minutes*

Most of the work I pick up these days starts as a user story or bug in Azure DevOps.

My routine used to be the same every time. Open the work item, copy the description, paste it into Claude Code, then paste in whatever else I figured it would need.

Then at the other end, once the code was done, I would create a feature branch, write the pull request description myself and link work items.

Both ends of that job are copy and paste and Claude Code can do both of them on its own, as long as you give it the right Azure DevOps context.

Today I'll show you how to connect Claude Code to Azure DevOps, and then walk through a bug from start to finish, with Claude Code pulling the work item, reading the code, writing the fix, creating the pull request, commenting on review feedback, and closing the bug.

Let's start.

<br/>

## Connecting Claude Code to Azure DevOps

Microsoft ships an MCP server for Azure DevOps. Here's how to install it:

```bash
claude mcp add --transport stdio azure-devops -s user -e ado_mcp_project=GameStore -- npx -y @azure-devops/mcp dotnetacademyio
```

`dotnetacademyio` is my organization name, so use yours. You need Node.js 20 or later, and the first call opens a browser to sign you in with your Microsoft account. No personal access token needed.

`-s user` installs it for every repo on your machine. Without it the MCP server would be installed for the current folder/repo only.

`-e ado_mcp_project=GameStore` is very useful since, without it, every single call into Azure DevOps stops and pops up a prompt asking which project you meant. Reading the work item, opening the pull request, fetching the review comments, all of them.

Now start Claude Code in the repo we'll be working on:

```bash
claude
```

Then run `/mcp` to confirm Azure DevOps connected:

![The /mcp server list in Claude Code, with azure-devops showing as connected and 40 tools.](/assets/images/2026-08-29/image-01.png)

<br/>

You can also select `azure-devops` and then browse all the tools it exposes, like work items, pull requests, repositories and many more.

![The azure-devops MCP server tool list in Claude Code, showing work item, repository and pull request tools.](/assets/images/2026-08-29/image-02.png)

<br/>

## The bug

Here's the ADO work item. Bug 8 in my GameStore project:

![Azure DevOps work item 8, a bug titled "Customers can bypass the 2-code purchase limit", with three acceptance criteria.](/assets/images/2026-08-29/image-03.png)

<br/>

GameStore sells game codes. You buy a code, then you redeem it on your Nintendo, PlayStation or Xbox store. The store rule is a maximum of 2 codes per game in a single purchase, which stops people buying 50 and reselling them.

Three sentences and three acceptance criteria. That's the whole ticket, and most of the ones I pick up look just like it. What it never says is where the rule should live, or whether the fix belongs in the shopping basket, at checkout, or both.

All of that is in the code, which is exactly why the agent should go and read it instead of me explaining it in a prompt.

<br/>

## Picking up the work

Before any code gets written, two things should be true: the board says the bug is active, and it's assigned to me.

Right now the board looks like this:

![The GameStore team board in Azure DevOps, with bug 8 in the New column, bug 7 in Active, and two closed items.](/assets/images/2026-08-29/image-04.png)

<br/>

Instead of moving things around myself, I now ask:

> Move bug #8 to active and assign it to me

![Claude Code calling the Azure DevOps MCP server to move work item 8 to Active and assign it, then reporting the result.](/assets/images/2026-08-29/image-05.png)

<br/>

The MCP server writes to Azure DevOps, so bug 8 moved to Active without me opening the board.

<br/>

## Planning straight from the bug work item

Then I switched to plan mode and typed five words:

> Let's work on bug #8

![The Claude Code input box with "Let's work on bug #8" typed into it, and plan mode on underneath.](/assets/images/2026-08-29/image-06.png)

<br/>

That's the entire prompt. No file paths, no acceptance criteria pasted in, no explanation of how the checkout flow works.

It pulled the work item over MCP, then went looking:

![Claude Code launching two background explorer agents, one on the purchase and order flow and one on validation and test patterns, with token counts of 40.6k and 35.4k.](/assets/images/2026-08-29/image-07.png)

<br/>

Two background explorers, one on the purchase flow and one on the validation and test conventions. Between them they read 40.6k and 35.4k tokens of my codebase.

That's 76,000 tokens of context, chosen and read by the agent, none of it pasted by me. Before this, that was my job, and I was doing the best I could, because I was guessing which files mattered from memory.

<br/>

## Claude goes beyond the obvious fix

Two minutes in, before it had written any plan, Claude stopped to tell me the fix I was expecting was wrong:

![Claude Code explaining that capping quantity at 2 per basket line does not close the hole, because the same game can be sent twice across two basket lines.](/assets/images/2026-08-29/image-08.png)

<br/>

The obvious fix is to cap `Quantity` at 2 on the basket item. But nothing stops you putting the same game twice in the basket, quantity 2 on each, to end up with 4 codes.

So Claude suggested summing the quantity per game across the whole basket, instead of checking each line on its own.

It's the kind of insight that comes from reading the code, not just the work item. The code shows how the basket is structured, and that the obvious fix would leave a hole.

<br/>

## Letting it build

This is the part I'll keep short, because I've written about it twice already: [how I work through a task in the terminal]({{ site.url }}/blog/The-Terminal-Is-All-You-Need), and [how to make Claude verify its own work as it goes]({{ site.url }}/blog/Make-Claude-Code-Verify-Its-Own-Work).

It asked me two questions before writing anything. Where to enforce the limit (I said both the basket and checkout), and how to define it in code (a constant, since a store rule doesn't vary by environment).

Six minutes after I approved the plan: 5 source files changed, 7 new tests, 30 of 30 passing.

Then it did something I hadn't asked for. It broke the fix on purpose, to see which tests went red:

![Claude Code's verification notes, reporting that putting a per-line-item cap back fails exactly the two tests covering the same game on two lines, and nothing else.](/assets/images/2026-08-29/image-09.png)

<br/>

Going back to the per-line cap broke exactly the two tests that cover the same game on two lines, and nothing else. That's how you find out your suite was testing the bypass, and not just happening to be green.

It reminded me I should be working on a proper feature branch as opposed to directly on `main`. So I asked it to do the right thing:

![Claude Code reporting the branch bugfix/8-two-code-purchase-limit pushed to origin, commit 5494a95 with 7 files changed, and a comment added to work item 8.](/assets/images/2026-08-29/image-10.png)

<br/>

Now, let's open the pull request.

<br/>

## The pull request
Opening the pull request and figuring out what to put in the description is another of those time consuming tasks that I used to do myself.

But with the ADO MCP server, I don't even have to open the browser. I can ask Claude to do it for me:

![The pull request in Azure DevOps with the description Claude wrote, explaining why a per-line-item cap would not have fixed the bug.](/assets/images/2026-08-29/image-11.png)

<br/>

The PR page includes everything a reviewer needs to know: the description, the linked work item, and the associated bug on the right side of the screen.

![The Azure DevOps pull request page showing the description, linked work item, and the associated bug on the right side of the screen.](/assets/images/2026-08-29/image-12.png)

<br/>

The PR description is the part that I find incredibly useful for reviewers. It explains the PR in great detail, including the reasoning behind the changes and the potential problems of alternative solutions.

<br/>

## Dealing with the review comments

This is the other part that used to take a lot of time for each PR. An agent opening a pull request is easy, but reviewers will ask questions like "why did you do it this way?" and now you have to provide answers.

I used Clio's account (my OpenClaw AI assistant) to leave a few comments on my PR:

![A review comment on the pull request in Azure DevOps asking whether ProblemDetails is configured, sitting on the new basket validation code.](/assets/images/2026-08-29/image-13.png)

<br/>

Then instead of me having to figure out what the comments were about, and then write a response for each one, I asked Claude to do it:

![Claude Code reading the pull request review comments and deciding how to address them.](/assets/images/2026-08-29/image-14.png)

<br/>

It read all comments over MCP, fixed the code, pushed one commit, and replied to every thread:

![The Azure DevOps PR thread list after the fix, showing the reviewer comments all marked addressed and resolved.](/assets/images/2026-08-29/image-15.png)

<br/>

The replies show up under my name, because Claude is using my credentials. Worth asking Claude to show you the planned replies before it posts them, to ensure you agree with the tone and content.

<br/>

## Closing the loop

After Clio approved the pull request, I merged it, also requesting ADO to close the associated bug:

![The Azure DevOps pull request completion screen showing the completed PR and the work item closing workflow.](/assets/images/2026-08-29/image-16.png)

<br/>

That part I still do myself, because it's the point where the change lands into the main branch. But the bug closes automatically when the PR is merged, and the board updates itself:

![The Azure DevOps board with bug 8 in the Resolved column, assigned, with a pull request link.](/assets/images/2026-08-29/image-17.png)

<br/>

New, to Active, to Resolved. I never opened the board to move it.

<br/>

## If you're on GitHub

The same loop works, and you don't need an MCP server for it. Claude Code uses the GitHub CLI to read issues, open pull requests, and inspect review comments. As long as `gh` is installed and signed in, ask it to work on issue 8 and it will run `gh issue view 8` on its own.

<br/>

## Wrapping up

**This is where your coding agent pays for itself: reading the ticket, and writing the pull request.**

That is the part where most devs are still doing a lot of copy-paste by hand, and where the devs themselves are the bottleneck on context.

The middle of the job is still yours: the planning, the debugging, and the decisions. But the agent is now handling the two places where context was getting lost.

And that's it for today.

See you next Saturday.

<br/>

**Whenever you're ready, here's how I can help:**

**[The .NET Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.
