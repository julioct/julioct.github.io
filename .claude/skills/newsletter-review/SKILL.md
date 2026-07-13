---
name: newsletter-review
description: Adversarial pre-publish review of a draft newsletter/blog post for julioct.github.io. Spins up a fresh-context subagent that has NOT seen the drafting conversation to hunt for grammar, copy, consistency, mechanics, and voice problems, then triages the findings (applies the clear wins, surfaces the judgment calls) and reports exactly what changed. Use this whenever Julio wants a post checked before it ships, including phrasings like "review this draft", "is this ready to publish", "adversarial review this post", "check the newsletter before we send", "give this a final pass", "poke at this before I commit", or any request to vet/proofread/finalize a `_posts/` draft, even if he doesn't say "skill".
---

# Newsletter pre-publish review

Runs an adversarial review of a finished (or near-finished) post in `_posts/` before it ships to the blog and to Kit. The whole point is a **fresh set of eyes with no memory of how the draft was written**: the reviewer can't rationalize choices it never made, so it questions things the drafter stopped questioning. This mirrors the practice the "Claude Code Needs an Adversary" post (issue 122) describes.

## When this fires

Julio has a draft in `_posts/` and wants it vetted before publishing: "review this", "is it ready", "final pass", "adversarial review", "proofread before I send", etc. He does not have to say "skill".

## Why a subagent, not just self-review

If the same context that wrote (or heavily edited) the draft also reviews it, it re-reads its own reasoning instead of attacking the work. Spawn a **separate `general-purpose` subagent with a fully self-contained prompt** so it starts cold. Do not paste the drafting/editing history into it. Give it the file path and the checklist below, nothing about how the post came to be.

## Procedure

1. **Identify the draft.** Confirm the target file in `_posts/`. If ambiguous, ask which post.

2. **Spawn the adversarial reviewer.** Use the `Agent` tool, `subagent_type: general-purpose`, `run_in_background: false` (you need the findings to act on them). Feed it a self-contained prompt built from the template below. Keep the ask **broad** — see "Framing" — so it isn't blinkered to one class of problem.

3. **Triage the findings** the way the post itself preaches:
   - **Apply the clear wins directly:** grammar, typos, broken consistency, mechanics (read-time, front matter, alt text, image numbering), obvious copy tightening.
   - **Surface the judgment calls to Julio** with a recommendation rather than silently changing them: anything touching his voice, structure, what to cut/keep, or a tradeoff. He is particular about his prose; when in doubt, propose, don't impose.
   - It's fine to *not* fix something and say so. Record the reasoning.

4. **Report exactly what changed.** List each applied fix (before → after where it helps) and each item you're leaving to his call. End with a ready-to-publish verdict.

## Framing (the sharp part)

The wording of the review ask decides what the reviewer can find. A "grammar and copy" ask will not surface a weak argument or a structural gap. So the template asks broadly (correctness, consistency, flow, mechanics, AND voice). For a high-stakes issue (a launch or sales-heavy post), consider a **second pass with a different framing** (e.g. "review purely for whether the argument persuades a skeptical senior .NET dev"). One clean pass is a sample, not a guarantee.

## Reviewer prompt template

Fill in `<FILE>` and hand this to the subagent verbatim. Do not add drafting context.

```
You are an adversarial copy editor. Review a finished newsletter/blog post for a .NET audience and find everything wrong or improvable. You have no prior context on how it was written; judge only what is on the page. Do not edit the file.

File (read it in full first): <FILE>

It is a Jekyll markdown post by Julio Casal. Images are referenced as ![alt](/assets/images/DATE/image-NN.png) and the .png files sit in that folder.

Report EVERY real issue, ranked most-important first. For each: the location (quote the text), what's wrong, and a specific fix. Check:

1. Grammar, spelling, punctuation, typos.
2. Awkward/unclear/redundant copy; sentences that don't read smoothly.
3. Internal consistency: numbers (e.g. test counts), file/method names, model names (e.g. Sonnet 5, Opus 4.8), dates. Flag any prose that contradicts a screenshot.
4. Image integrity: read the actual image files in the post's assets folder. Flag any gap in image-NN numbering that isn't clearly intentional, any alt text that doesn't match its image or the surrounding prose, and a featured-image whose featured-image-alt describes a different image.
5. Logical flow and transitions; anything that jumps, repeats, or leaves a gap.
6. Factual / technical soundness of the claims.
7. Read time: estimate actual prose word count / ~225 wpm + ~1 min for screenshots, and say whether the "Read time: N minutes" line is honest.
8. Title: does it lead with a searchable keyword AND carry a curiosity hook? It doubles as the email subject, so flag if it's clever-but-keyword-free or too long to survive mobile truncation.
9. Author's voice rules — flag violations: NO em dashes anywhere in his prose (only inside screenshots); short paragraphs (1-3 sentences); plain descriptive headings, not engagement-bait or "X, not Y" reframes; no negative-parallelism ("it's not X, it's Y"); no AI-cliché words (leverage, robust, seamless, delve, "it's worth noting", etc.).
10. Screenshot faithfulness: quoted blockquotes/terminal output should match the screenshot exactly (keep real typos in quotes), but a screenshot typo must NOT be re-typed in the author's own narration.
11. Anything else that would make it better: a weak sentence, an unclear explanation, a hook/close that could land harder.

Don't pad with nitpicks, but surface every genuine issue however small. End with an overall verdict on whether it's ready to publish.
```

## Notes

- Voice standards the reviewer references live in Julio's global instructions: `about-me/anti-ai-writing-style.md` and `about-me/julio-vocabulary.md`. The mechanics it checks (front matter, issue-number, images, read-time, title/slug) are in this repo's root `CLAUDE.md`.
- This skill reviews; it does not draft. It also does not commit or push (that stays a separate, explicit step).
