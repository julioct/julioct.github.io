---
layout: post
title: "Make Claude Code Verify Its Own Work"
date: 2026-07-25
issue-number: 123
featured-image: 2026-07-25/featured.png
featured-image-alt: Claude Code running its phase gate checks, three passing and one failing, then editing the file that caused the failure
---

*Read time: 6 minutes*

These days I find myself delegating more and more work to Claude Code, my coding agent, while I focus on product direction.

As I do that, the changes I ask Claude to make are getting bigger and bigger, so I have moved into preparing very detailed specs for it to implement. My last one ran 775 lines, with every file to delete listed by path.

That way I can let it run for an hour or more without checking in, and be confident it produces a working result.

But a great spec with all the verification steps at the end is not enough. I paid for that mistake in the past.

This time I spotted it before Claude wrote any code: the plan would have changed 90 files before checking a single thing.

Today I'll show you the problem I caught in Claude's plan, and how I steered it so that it would check its own work along the way.

Let's start.

<br/>

## Handing a big spec to Claude Code

After a few iterations of working on the project from [last week's issue]({{ site.url }}/blog/Claude-Code-Needs-An-Adversary), I stepped back and realized the product direction had deviated from my original vision, making things more complicated than they needed to be.

So I went back to Codex, my other AI assistant, and asked for a new spec to remove the unnecessary complexity. I work with Codex on product vision, like a PM: we agree on direction, it writes the spec, and Claude Code implements it. With the 5.6 Sol model its specs are the kind even Claude Fable 5 couldn't match (I tried both).

With the spec in hand, I asked Claude to read it, make a plan, and ask me any clarifying questions:

![The opening prompt in Claude Code asking Claude to read the removal spec and make a plan, with clarifying questions.](/assets/images/2026-07-25/gate-01.png)

<br/>

> Read the @design/system-simplification-removal-spec.md doc and make a plan. Ask me any clarifying questions.

It read the spec, compared it with the current code, and came back with three questions. Two were about content decisions. The third is the one where you choose how much you let the agent do before checking its work:

![Claude asking how to run a 5-phase change touching 90 files, offering to stop after Phase B, run straight through, or stop after each phase.](/assets/images/2026-07-25/gate-02.png)

<br/>

The spec I gave Claude had five phases, roughly 90 files, both test suites, and even a database migration. I picked **Run A through E straight** since there should be no reason to babysit it as long as Claude checks its own work along the way.

But the plan had a hole in it: no verification steps until the very end.

<br/>

## Why verifying at the end is too late

Here's the end of the initial plan:

![The first plan's Verification section, eight steps covering build, fresh database, existing database, tests, frontend build, Playwright, and browser walks.](/assets/images/2026-07-25/gate-03.png)

<br/>

It looks great. It includes all the things Claude will need to check, and it even has a browser walk at the end to make sure the app is still usable.

The problem is where it sits: after everything is already built.

To be fair, Claude didn't decide that. Section 13 of the spec produced by Codex did:

```text
## 13. Implementation order

### Phase A — Contract and data foundation      (6 steps)
### Phase B — Backend runtime removal           (7 steps)
### Phase C — Frontend removal                  (7 steps)
### Phase D — Tests and source sweep            (5 steps)

### Phase E — Verification
1. Fresh database migration.
2. Existing development database migration.
3. Full backend build and integration suite.
...
```

The plan's verification section is just Phase E with more detail. **Claude reproduced the structure of the document it was handed**, and the shape of that document was: build, build, build, build, verify.

I've fallen into this trap before. Claude follows the plan without checking anything until the end, and when it finally checks, it finds a pile of mistakes from the early phases that it now has to go back and fix.

Sometimes it won't even notice the mistakes until I push it to explain unexpected behaviors on my manual pass through the app.

But the plan is still on screen, which is where you get to fix it.

<br/>

## How to add a gate to every phase

Claude Code's plan mode lets you reject a plan with feedback instead of accepting it. So I sent this back:

![Rejecting the plan with feedback asking for concrete verification steps per phase that must pass before the next, plus a review of previous decisions.](/assets/images/2026-07-25/gate-04.png)

<br/>

> Add concrete verification steps for each phase, which all must pass before starting next phase. Before moving to next phase you must also go over all decisions made on previous phases to see if any of them need a follow up in next phase.

Two separate asks in there. The rewritten plan now includes a new Phase discipline section that defines a gate and a carry-forward review at the end of every phase:

![The Phase discipline section defining a gate and a carry-forward review at the end of every phase.](/assets/images/2026-07-25/gate-05.png)

<br/>

* **Gate**: the listed commands run green and the listed assertions hold. A red gate gets fixed inside that phase, and the next phase never starts on a broken one.

* **Carry-forward review**: before starting the next phase, re-read every decision already made and write down which ones create work in the phase about to begin.

<br/>

## What a gate looks like

A gate is a command plus the result it has to produce. Here's the one for Phase A:

![The Phase A gate: five numbered checks with specific rg commands, a data audit, and an exact scenario count.](/assets/images/2026-07-25/gate-06.png)

<br/>

What I like about this gate is that every check is something the computer can answer, not something Claude has to eyeball. A search for the removed field names has to come back empty. And the number of records left after the deletion has to match the correct count.

Each phase also writes down what it hands the next one:

![The Phase A carry-forward note listing the namespace choice, the incident fields, and the empty mission bank as decisions handed to Phase B.](/assets/images/2026-07-25/gate-07.png)

<br/>

The first thing on that list is a prediction. Claude flagged that the namespace it picked might collide with an existing type, and wrote down the fallback it would use if it did. A phase later, running on its own, the build broke in exactly that spot:

> The predicted namespace/type collision hit. Falling back to `Api.Features.Learning` as planned.

It didn't get stuck or try to work around the problem on its own. It used the backup plan it had written a phase earlier and moved on. That's the kind of failure I was worried about when I let it run without me, and the note from the phase before is why it never got stuck.

<br/>

## What the gates caught

Here is the Phase A gate in action. One check failed on a leftover reference, so Claude edited that one file and the gate went green before Phase B started:

![Phase A gate: the run edits Curriculum.cs to drop a leftover Track/Campaign reference, then reports the gate green.](/assets/images/2026-07-25/gate-08.png)

<br/>

Expanding that one shell command shows the individual checks, including the failing one that triggered the edit:

![The expanded Phase A gate checks: stale keys, data audit, and csproj all pass, but the Curriculum folder reference check fails.](/assets/images/2026-07-25/gate-09.png)

<br/>

Then, roughly an hour later, with no input from me after the plan was approved:

![Claude reporting all five phases green: 209 of 209 integration tests, 20 of 20 Playwright, 0 warnings.](/assets/images/2026-07-25/gate-10.png)

<br/>

209 integration tests, 20 Playwright tests, 0 build warnings, every phase green, and the migration verified against a copy of the real database so no existing data was lost.

Then I opened the app and walked through it myself. Everything still worked, and only what was requested in the spec was removed.

<br/>

## Where the gates really belong

Reading the plan carefully caught it this time, but I'd rather not depend on catching it every time. The real fix is in the spec.

If I were starting this over, I'd ask Codex to drop that single Phase E verification from the spec and give every phase its own exit criteria instead:

```text
### Phase B — Backend runtime removal
1. Add the database migration and update `AppDbContext`.
   ... (7 steps)

**Exit criteria** (all must pass before Phase C starts):
- `dotnet build Api --no-incremental` reports 0 errors and 0 warnings.
- The integration suite is green.
- A copy of the real database migrates with every row preserved.
- The removed API endpoints return 404.
```

Same checks the spec already had, just moved from the end of the document to the phase that can first prove them.

<br/>

## Wrapping up

**An agent can run for an hour unattended as long as the work is broken down into individual phases that the agent can verify before the next phase starts.**

The best place for those gates is the spec, so that every plan built from it comes out with them already in place. And when the spec doesn't have them, you can still ask for them while the plan is on screen, which only takes a little bit of steering before you approve.

And that's it for today.

See you next Saturday.

<br/>

**Whenever you're ready, here's how I can help:**

**[The .NET Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.
