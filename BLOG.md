# Writing a blog post

## Easiest: the editor

1. Run `npm run dev`
2. Open http://127.0.0.1:8765/keystatic → **Blog posts** → **Add** (or open a post)
3. Write. Use the **+** button in the toolbar for images, galleries, callouts, link cards and embeds.
4. Keep the post open in another tab (http://127.0.0.1:8765/blog/your-post/). It refreshes every time you click **Save** (or press ⌘S).
5. Untick **Draft** when it's ready, save, then commit and push.

The editor only exists on your computer. It is not part of the live site.
Tip: the editor rewrites files in its own tidy style (quotes, lists). That's normal.
Images you upload while it's running show at full size in the preview. The fast, resized copies are made the next time `npm run dev` or the live build runs.

## Quick version (by hand)

1. Copy `content/blog/_template.mdx` → `content/blog/my-post.mdx`
   (the file name is the web address: `sahildesign.xyz/blog/my-post/`. Use lowercase and dashes.)
2. Put the post's images in `public/blog/my-post/`
3. Write. Check it at http://localhost:8765/blog/ (run `npm run dev`)
4. Set `draft: false`, then commit and push. It goes live by itself.

## The header (frontmatter)

Every post starts with this block:

```yaml
---
title: "My Top Coffee Shops in Hanoi"
date: 2026-11-23
summary: "One-line description for the blog page and link previews"
cover: /blog/hanoi-coffee-shops/cover.jpg
tags: [travel, coffee]
draft: false
---
```

| Field | What it does |
| --- | --- |
| `title` | Post title (required) |
| `date` | Publish date, `YYYY-MM-DD` (required). Newest posts show first. |
| `summary` | Shown under the title on the blog page and in link previews |
| `cover` | Optional. Thumbnail on the blog page, top of the post, and the share image |
| `tags` | Used for the filter buttons on the blog page |
| `draft` | `true` shows only on your computer. `false` publishes it |

## Images

Images live in `public/blog/<post-name>/` and are referenced as `/blog/<post-name>/file.jpg`.
JPG, PNG and WebP all work. Smaller, faster copies are made automatically. Use big originals (around 2000px wide is plenty).

**Simple image with caption** (the part in quotes is the caption):

```md
![Describe the photo](/blog/my-post/photo.jpg "Caption under the photo")
```

**Image with options.** `size` can be `full` (default), `wide` (wider than the text on desktop) or `inline` (floats right, text wraps):

```mdx
<Img src="/blog/my-post/photo.jpg" alt="Describe the photo" caption="Caption" size="wide" />
```

**Side-by-side gallery** (2 or 3 images):

```mdx
<Gallery caption="Caption for the whole row">
  <Img src="/blog/my-post/a.jpg" alt="..." />
  <Img src="/blog/my-post/b.jpg" alt="..." />
</Gallery>
```

## Text

```md
## Section heading        (gets a # link on hover)
### Smaller heading

**bold**, *italic*, `inline code`
[link text](https://example.com)    ← links to other sites open in a new tab

- bullet
1. numbered

> A quote

---                       ← divider
```

**Table:**

```md
| Shop | Area | Price |
| --- | --- | --- |
| Name | Hoan Kiem | 40k |
```

## Callout boxes

```mdx
<Callout type="note">Neutral extra info.</Callout>
<Callout type="tip">A helpful tip.</Callout>
<Callout type="warning" title="Heads up">Something to watch out for.</Callout>
```

## Code

Put the language after the three backticks. Every block gets a copy button.

````md
```js
const x = 1;
```
````

Add a file name label and highlight lines (here lines 2 and 4 to 5):

````md
```js title="spring.js" {2, 4-5}
...
```
````

## Link preview cards

Paste a link **alone on its own line** and it becomes a preview card with the site's title, description and image:

```md
https://github.com/sahil639
```

Or write your own title and description:

```mdx
<LinkCard url="https://example.com" title="My title" description="My description" />
```

## Embeds

```mdx
<YouTube id="https://www.youtube.com/watch?v=VIDEO_ID" />
<Tweet id="https://x.com/user/status/1234567890" />
<Figma url="https://www.figma.com/design/FILE_KEY/Name?node-id=1-2" caption="Optional caption" />
```

## Hidden comments

```mdx
{/* This note won't show on the site */}
```

Note: regular HTML comments (`<!-- -->`) **break** MDX files. Use the one above.

## Running it on your computer

```bash
npm install        # first time only
npm run dev        # opens the site at http://localhost:8765 (drafts visible)
npm run build      # makes the live version in dist/ (drafts hidden)
```

`content/blog/style-guide.mdx` is a hidden draft that shows every component. Open it at
http://localhost:8765/blog/style-guide/ to see how things look.

## Publishing

Commit and push to `main`. Cloudflare builds and deploys the site automatically, usually within a minute.
Posts with `draft: true` are left out of the live site, the RSS feed (`/blog/rss.xml`) and the sitemap.

## Homepage, Extras and Sandbox

- **Projects / More from me cards:** edit `src/data/home.js`; images in `public/images/projects/` and `public/images/more/`.
- **Extras page (/extras/):** drop images into `public/extras/`. They show in file-name order, and the file name becomes the caption (`03-summer-poster.jpg` → "summer poster"). Delete the `graphic-XX.jpg` placeholders.
- **Sandbox (/sandbox/):** add an item in the editor (**Sandbox** → **Add**) or add a `.yaml` file to `content/sandbox/`.
  - Interactive piece: put its files in `public/sandbox/<name>/` (an `index.html` plus anything it needs) and set the link to `/sandbox/<name>/index.html`. `springy-dots` is a working example.
  - Graphic: set the link to the image, and it opens full size.
- **Archived things** (Friends page, footer video, old project cards): see `archive/README.md`.
