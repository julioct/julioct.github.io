# CLAUDE.md — julioct.github.io

Jekyll blog + newsletter site for Julio Casal (DotNet Academy). This file covers **repo mechanics** for producing posts. Voice, vocabulary, and writing style live in Julio's global instructions: `about-me/anti-ai-writing-style.md` (the rulebook) and `about-me/julio-vocabulary.md` (the running list of words and phrasings he does and doesn't use). Don't duplicate those here.

## Newsletter posts

Posts are the source for both the public blog and the Saturday email ("The .NET Saturday", sent via Kit). One issue ships each **Saturday**.

### File location and name
- `_posts/YYYY-MM-DD-Title-With-Hyphens.md`
- `YYYY-MM-DD` is the **ship (Saturday) date**. This is the source of truth for the date, even if front-matter `date:` was left as a draft-time placeholder.
- The filename after the date is the **URL slug**, so it matters for SEO. If the title changes late, rename the file so the slug still carries the keywords (e.g. title "Claude Code Needs an Adversary" → `...-Claude-Code-Needs-An-Adversary.md`). Safe to rename before the post is published; there's no live link yet.

### Title and slug
The title does double duty: blog `<h1>` / SEO title **and** the Kit email subject line. So:
- Lead with a real keyword the audience searches (product or tool names like "Claude Code", "Aspire", ".NET 10"), then add a curiosity hook. A clever-but-keyword-free title ("The Code You Just Fixed...") reads well but is weak for search and slow to signal the topic in an inbox.
- Keep it short enough to survive truncation as a mobile subject line (~40 characters is the safe zone; the whole title can be longer).
- His title voice is declarative/imperative ("The Terminal Is All You Need", "Claude Code Needs an Adversary"), not a how-to phrase.
- For the Kit send, also write **preview/preheader text** that complements the subject instead of repeating it: use it to land the concrete payoff or curiosity gap the subject only hints at.

### Front matter
```yaml
---
layout: post
title: "Title in Title Case"
date: 2026-07-18            # the Saturday ship date
issue-number: 122          # sequential; increments by 1 each week
featured-image: 2026-07-18/image-06.png     # path under assets/images/
featured-image-alt: One concrete sentence describing the image
---
```
- **`issue-number` is strictly sequential.** Confirm the next number against the most recent post in `_posts/` before publishing (e.g. 121 → 122). Do not guess.
- First line of the body is always the read-time estimate: `*Read time: N minutes*`. **Compute it, don't guess.** Count actual prose words (exclude front matter, image lines, `<br/>`, code fences), divide by ~225 wpm, and add roughly a minute for the screenshots. Recent issues run ~5-9 min. Don't inflate; an 8-minute label on a 1,200-word post reads as padding.

### Images
- Store in `assets/images/YYYY-MM-DD/` using the **ship-date** folder (matches the post filename, not necessarily front-matter `date:`).
- Rename incoming screenshots to the repo convention: `image-01.png`, `image-02.png`, … in the order they appear in the post.
- Reference as `![descriptive alt text](/assets/images/YYYY-MM-DD/image-NN.png)` — note the leading `/`.
- Reference images in order with no gaps in the `image-NN` numbering. If you drop one mid-edit, either renumber or make sure the removal is intentional (a skipped number in the body is a smell).
- The featured image is usually one of these same files; pick the one that best represents the post's thesis. **`featured-image-alt` must describe the image `featured-image` actually points at.** If you change one, change the other (easy to leave the alt describing the old pick).

### Body conventions
- Put a `<br/>` on its own line after every image, and use `<br/>` before each `## H2` for spacing (follow the pattern in recent posts).
- Short paragraphs: max ~3 rendered lines (~250–300 chars) on the site's ~700px content column. Split anything longer.
- Section headings are plain and descriptive ("What might bite you", "Wrapping up"), never engagement-bait or "X, not Y" reframes.
- **Screenshot faithfulness:** quote blockquotes and terminal output to match the screenshot exactly, typos included (a real typed prompt reads as authentic). But don't re-type a screenshot's typo in your own narration; paraphrase there instead. Also keep prose consistent with what's on screen (model names, counts, file names).
- Close every post with, on their own lines:
  ```
  And that's it for today.

  See you next Saturday.
  ```
- Standard CTA footer (adjust wording only if a post calls for it):
  ```
  **Whenever you're ready, here's how I can help:**

  **[The .NET Developer Bootcamp]({{ site.url }}/courses/dotnetbootcamp)**: A complete path from ASP.NET Core fundamentals to building, containerizing, and deploying production-ready, cloud-native apps on Azure.
  ```
- Internal links use `{{ site.url }}/...`. External links that should open in a new tab use `{:target="_blank"}`.

### Jekyll post vs Kit email
The Jekyll post is **public**. Keep subscriber/list framing ("you're on this list", "reply to this email") out of it — that belongs only in the Kit broadcast derived from the post later.

## Product facts (verify before writing marketing copy)
- The course is the **.NET Developer Bootcamp** (dropped "Backend" at the .NET 10 launch). Link: `{{ site.url }}/courses/dotnetbootcamp`.
- In marketing copy, call the product **"Aspire"**, not ".NET Aspire". Say **Aspire 13** (not "13.2").
- Bootcamp-page styling goes through `css/bootcamp.css` design tokens/classes, not inline hex.
- Deeper, changeable product details (course lineup, module names, launch status) live in the memory files — check those rather than hardcoding from here.

## Publishing
- Commit/push only when Julio asks.
- `main` has a branch-protection rule that nominally requires a PR, but Julio can bypass it and the established workflow is to commit and push **directly to `main`** when he asks (recent history is all direct-to-main). Don't spin up a PR branch unless he asks for one.
- Commit only the deliverable by default: the post `.md` plus its `assets/images/DATE/` files. Leave internal prep like `_handoff/` untracked unless told otherwise.
