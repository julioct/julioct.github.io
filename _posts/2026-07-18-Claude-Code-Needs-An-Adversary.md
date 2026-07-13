---
layout: post
title: "Claude Code Needs an Adversary"
date: 2026-07-18
issue-number: 122
featured-image: 2026-07-18/image-07.png
featured-image-alt: A fresh Claude Code subagent's review findings, a medium-severity streak bug plus two lower-severity hardening notes
---

*Read time: 5 minutes*

These days I fix a lot of bugs with Claude Code, and I've learned to keep an eye on a common trap.

You fix a bug, run your tests, and they all pass. Naturally, you think you're done, ready to commit and push.

But you just reviewed your own work, and you were never going to be hard on it. You wrote the fix, so when you re-read it you're checking that it does what you meant, not hunting for what you missed.

A coding agent does the same thing. Ask it to review the fix it just wrote, and it re-reads its own reasoning instead of questioning it.

Today I'll show you how to catch what your own review misses, using Claude Code to both write a fix and act as its adversary.

Let's start.

<br/>

## The bug report

I've been working on a new project to make interview preparation more engaging and fun. It's gamified, so you earn XP and build a daily streak as you solve scenarios.

But as I was running a few manual tests I noticed you could farm XP: redo a scenario you already solved, and you'd get the XP again. Every time.

So I opened Claude Code and started working on it:

![The opening prompt in Claude Code reporting the XP replay bug and asking for a failing test first.](/assets/images/2026-07-18/image-01.png)

<br/>

> I think there's a bug in the interview trainer: if you redo a scenario you already solved, you get XP again. Can you check @project/Api/Features/Scenarios/SubmitAnswer.cs and fix it? Write a failing test first so we know we go a repro before fixing.

That last instruction, asking for a failing test first, is part of the "red before green" philosophy in test-driven development.

Let me explain.

<br/>

## Red before green

Red before green means you write a failing test first, before touching any product code. You see the bug in action, and only then do you make the code changes necessary to make the test pass.

I find this especially useful with coding agents like Claude, because **a test written first can't be quietly shaped to confirm the fix that comes later.**

Here, Claude started by writing a test that answers a scenario correctly, then answers it again, and finally asserts the second submission awards 0 XP and the total stays at 50.

![Claude Code writing the failing test that reproduces the XP replay bug.](/assets/images/2026-07-18/image-02.png)

<br/>

Then it ran that test on the current code, and it failed exactly as expected:

![The new test failing with Expected 0, Actual 50, confirming the repro.](/assets/images/2026-07-18/image-03.png)

<br/>

`Expected: 0, Actual: 50`. The bug is now proven to exist, before anyone (even Claude) tries to fix it. If the test had passed here, there'd be nothing to fix.

<br/>

## The fix

The bug was one line. `SubmitAnswer.cs` computed the XP award straight from `correct`, with no check for whether the scenario had already been solved.

So it looked up the existing progress first, computed `alreadySolved`, and only awarded XP when the answer was correct *and* the scenario wasn't already solved:

![The diff for SubmitAnswer.cs, looking up ScenarioProgress and gating the XP award on correct and not already solved.](/assets/images/2026-07-18/image-04.png)

<br/>

Then it ran the full suite: 16 tests, all green, including the new one.

![The full test suite passing 16 of 16, with Claude's summary of the bug and fix.](/assets/images/2026-07-18/image-05.png)

<br/>

Bug reported, reproduced, fixed and all tests green. This is the point where you usually merge and move on.

But wait, not so fast.

<br/>

## Bringing in an adversarial reviewer

AI models can be very confident in their assessments, so it never hurts to get a second pair of eyes that has not seen any of the previous conclusions.

So I started by switching from Sonnet 5 to Opus 4.8 for the review step. A smaller model can review code just fine. But *finding* problems in code that already looks correct is a harder, more open-ended job than fixing a bug you've already located, so I wanted the stronger reasoning for it.

Then I asked for a fresh subagent that had seen none of the work I'd just done:

![Switching to Opus 4.8, then asking for a fresh subagent to review the Scenarios folder for unearned-progress bugs.](/assets/images/2026-07-18/image-06.png)

<br/>

> Before I merge this, spin up a fresh subagent that hasn't seen any of this conversation and have it review @..\\..\Api\Features\Scenarios\ for anything else that looks like it could let someone get credit or progress they didn't earn.

The subagent gets a self-contained prompt and the folder. It doesn't get the story of the XP fix, my reasoning, or the fact that I already think the job is done.

It can't rationalize a decision it never made. It just reads the code.

You hand the change to a reviewer whose only job is to find what's wrong with it, with none of the context that would tempt it to agree with you.

<br/>

## What the fresh eyes caught

The subagent confirmed the XP fix was correct and complete. No replay-farming avenue left.

Then it found a second bug. One I never asked about, in the same file:

![The subagent's findings: a medium-severity streak bug plus two lower-severity hardening notes.](/assets/images/2026-07-18/image-07.png)

<br/>

The streak counter advanced on *any* submission. `StreakCalculator.Apply` ran before the code even checked whether the answer was correct. So you could submit one wrong answer a day, never solve a thing, and still watch your streak climb.

That's what self-review misses. Mid-fix I was focused on XP, so it never occurred to me to check the streak. The fresh reviewer wasn't locked onto XP, so it looked at everything.

It also flagged two smaller notes I'll come back to: a race condition on the first solve, and an unvalidated input that's harmless today.

<br/>

## The catch

There's a catch worth knowing about.

The subagent found the streak bug *because of how I worded the ask*. I told it to look for ways someone could "get credit or progress they didn't earn," which points straight at XP and streaks. Word the ask differently and you get different findings.

**Adversarial review removes your bias as the implementer, but the reviewer can still only look for what you point it at.**

So don't treat one clean pass as proof there's nothing left. It only means nothing turned up for the question you asked.

<br/>

## Deciding what to fix now

I concluded that the streak bug was important enough to fix immediately, while the other two findings could be deferred and documented for later.

![My triage decision: fix the streak bug now, note the other two for later.](/assets/images/2026-07-18/image-08.png)

<br/>

> Let's fix the streak one now. Same pattern as before, failing test first. The other two I don't think are worth touching right now, just note them somewhere so we don't lose track.

Same red-green cycle as before: a failing test that submits a wrong answer and asserts the streak stays at 0, which fails as expected before the fix.

![The failing streak test that submits a wrong answer and asserts the streak stays at 0.](/assets/images/2026-07-18/image-09.png)

<br/>

Then the fix to gate the streak update behind `correct`, and all 17 tests pass.

![The full suite passing 17 of 17 after the streak fix, then Claude creating KNOWN-ISSUES.md.](/assets/images/2026-07-18/image-10.png)

<br/>

We now get all 17 tests passing. Claude also wrote the other two findings into a `KNOWN-ISSUES.md` file, with a pointer from `CLAUDE.md`, so a future session sees them instead of losing them when this conversation ends.

<br/>

## Wrapping up

The code you just fixed is the code you're least equipped to review. You're too close to it, and you already believe it's right.

A reviewer with no memory of the fix (a person, or a fresh agent in a clean context) doesn't carry that belief. It reads the code as it stands and questions things you stopped questioning the moment you felt done. In this session, that's what turned one known bug into two fixed bugs and two documented ones.

Try it on your next fix. Get the tests green, then hand the change to something that never saw you write it.

And that's it for today.

See you next Saturday.

<br/>

**Whenever you're ready, here's how I can help:**

**[The .NET Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.
