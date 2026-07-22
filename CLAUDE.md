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
- **Optimize for AI assistants too, not just search engines.** Julio explicitly targets "whatever AI assistants use to find content to answer user prompts." Answer engines match on question intent, so the title should contain the phrasing a person actually types or prompts. Never build a title around a term you coined for the post: "Claude Code Needs Verification Gates" was rejected for issue 123 because nobody searches or prompts "verification gates"; it became "Make Claude Code Verify Its Own Work", which matches "how do I get Claude Code to check its own work."
- Keep it short enough to survive truncation as a mobile subject line (~40 characters is the safe zone; the whole title can be longer).
- His title voice is declarative/imperative ("The Terminal Is All You Need", "Claude Code Needs an Adversary"), not a how-to phrase. Imperative and query-shaped are compatible: "Make Claude Code Verify Its Own Work" keeps his voice while carrying the prompt phrasing.
- Avoid reusing the exact frame of the previous issue. Two consecutive "Claude Code Needs an X" subjects read as a resend in the inbox.
- The `## H2` headings are retrieval surface too. Answer engines lift heading-shaped chunks, so reader-value headings ("Why verifying at the end is too late") outperform situational ones ("The job, and the two assistants") for both skimmers and assistants.
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
- **Never reuse an image filename for different content.** If images get added, dropped, or reordered mid-draft, the browser and the Jekyll preview keep serving the *cached* bytes for a filename whose content changed underneath. On issue 123 this burned several rounds: Julio was editing against screenshots that no longer existed on disk, and twice reported images as "out of sync" when the files were correct. If a reorder is unavoidable, rename the whole set to a fresh prefix the browser has never seen (`gate-01.png`, …) rather than shuffling `image-NN`, and tell him to hard-refresh (Ctrl+F5). Best practice: settle the image list *before* numbering, and renumber at most once.
- The featured image is usually one of these same files; pick the one that best represents the post's thesis. **`featured-image-alt` must describe the image `featured-image` actually points at.** If you change one, change the other (easy to leave the alt describing the old pick).
- **Pick the featured image as a thumbnail, not as a full-size screenshot.** It renders as a card on the site's home page, and the cards preserve the source aspect ratio: a 4.5:1 terminal strip becomes an unreadable sliver, while ~2-3:1 renders tall and gets more presence. Favor few lines of large text, a clear visual anchor, and colour if any screenshot has it (a red/green diff pops in a row of grey terminal cards). Crop out noise first (shell fragments, personal reminder lines, "Jump to bottom" overlays, long file paths) — PIL is available for cropping. A featured-only image that isn't in the body should be named `featured.png`, not the next `image-NN`, so it doesn't imply a missing body image.

### Body conventions
- Put a `<br/>` on its own line after every image, and use `<br/>` before each `## H2` for spacing (follow the pattern in recent posts).
- Short paragraphs: max ~3 rendered lines (~250–300 chars) on the site's ~700px content column. Split anything longer.
- Section headings are plain and descriptive ("What might bite you", "Wrapping up"), never engagement-bait or "X, not Y" reframes. **Beyond that, every heading must name something the reader gains, not describe Julio's situation.** He rewrote the whole heading set on issue 123 for exactly this: "The job, and the two assistants" → "Handing a big spec to Claude Code"; "A plan with a single verification phase" → "Why verifying at the end is too late"; "What came out the other end" → "What the gates caught". Read the set top to bottom on its own; it should scan as a learning path.
- **Length is not the constraint, density is.** Julio has said outright not to worry about length ("my readers are fine with a bit longer newsletters"), and in the same session cut four sections for being too long. Both are true: he will carry a long post, he will not carry padding. Every cut he asks for is explanation *about* a point already made. Before adding a paragraph, check whether it advances the argument or just restates it.
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
