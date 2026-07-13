# CLAUDE.md — julioct.github.io

Jekyll blog + newsletter site for Julio Casal (DotNet Academy). This file covers **repo mechanics** for producing posts. Voice, vocabulary, and writing style live in Julio's global instructions and in the auto-loaded memory (`feedback_vocabulary_match.md` and friends) — don't duplicate them here.

## Newsletter posts

Posts are the source for both the public blog and the Saturday email ("The .NET Saturday", sent via Kit). One issue ships each **Saturday**.

### File location and name
- `_posts/YYYY-MM-DD-Title-With-Hyphens.md`
- `YYYY-MM-DD` is the **ship (Saturday) date**. This is the source of truth for the date, even if front-matter `date:` was left as a draft-time placeholder.

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
- First line of the body is always the read-time estimate: `*Read time: N minutes*` (recent issues run ~5–9 min).

### Images
- Store in `assets/images/YYYY-MM-DD/` using the **ship-date** folder (matches the post filename, not necessarily front-matter `date:`).
- Rename incoming screenshots to the repo convention: `image-01.png`, `image-02.png`, … in the order they appear in the post.
- Reference as `![descriptive alt text](/assets/images/YYYY-MM-DD/image-NN.png)` — note the leading `/`.
- The featured image is usually one of these same files; pick the one that best represents the post's thesis.

### Body conventions
- Put a `<br/>` on its own line after every image, and use `<br/>` before each `## H2` for spacing (follow the pattern in recent posts).
- Short paragraphs: max ~3 rendered lines (~250–300 chars) on the site's ~700px content column. Split anything longer.
- Section headings are plain and descriptive ("What might bite you", "Wrapping up"), never engagement-bait or "X, not Y" reframes.
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
- Commit/push only when Julio asks. If asked, branch first if on `main`.
