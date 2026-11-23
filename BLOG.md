# Writing a blog post

## Quick version

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
