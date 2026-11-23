#!/usr/bin/env python3
"""Build the blog.

Write posts as Markdown files in blog/posts/, then run:

    python3 blog/build.py            # published posts only
    python3 blog/build.py --drafts   # also include posts marked "draft: true"

Each post starts with a small header:

    ---
    title: My first post
    date: 2026-11-23
    description: One line shown in the list and on Google.
    draft: false
    ---

The file name becomes the address: posts/hello-world.md -> /blog/hello-world/

This script writes public/blog/, updates the "Writing" list on the home page
and updates public/sitemap.xml. Python standard library only.
"""
import html
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "blog" / "posts"
PUBLIC = ROOT / "public"
OUT = PUBLIC / "blog"
SITE = "https://sahildesign.xyz"
HOME_LIMIT = 3


# ---------- Markdown (small subset) ----------

def inline(text):
    codes = []

    def keep_code(m):
        codes.append(m.group(1))
        return f"\x00{len(codes) - 1}\x00"

    text = re.sub(r"`([^`]+)`", keep_code, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)",
                  lambda m: f'<img src="{html.escape(m.group(2))}" alt="{m.group(1)}" loading="lazy">', text)

    def link(m):
        label, url = m.group(1), m.group(2)
        ext = url.startswith("http") and not url.startswith(SITE)
        attrs = ' target="_blank" rel="noopener"' if ext else ""
        return f'<a href="{html.escape(url)}"{attrs}>{label}</a>'

    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    text = re.sub(r"(?<![\w_])_(?!\s)(.+?)(?<!\s)_(?![\w_])", r"<em>\1</em>", text)
    return re.sub(r"\x00(\d+)\x00", lambda m: f"<code>{html.escape(codes[int(m.group(1))])}</code>", text)


def markdown(src):
    lines = src.replace("\r\n", "\n").split("\n")
    out, para, i = [], [], 0

    def flush():
        if para:
            out.append(f"<p>{inline(' '.join(para))}</p>")
            para.clear()

    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if s.startswith("```"):
            flush()
            i += 1
            code = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            out.append(f"<pre><code>{html.escape(chr(10).join(code))}</code></pre>")
        elif not s:
            flush()
        elif m := re.match(r"(#{1,4})\s+(.*)", s):
            flush()
            level = min(len(m.group(1)) + 1, 4)  # "#" in a post becomes h2; the title is h1
            out.append(f"<h{level}>{inline(m.group(2))}</h{level}>")
        elif re.fullmatch(r"(-{3,}|\*{3,})", s):
            flush()
            out.append("<hr>")
        elif s.startswith(">"):
            flush()
            quote = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip()[1:].strip())
                i += 1
            out.append(f"<blockquote><p>{inline(' '.join(quote))}</p></blockquote>")
            continue
        elif re.match(r"([-*]|\d+\.)\s+", s):
            flush()
            ordered = bool(re.match(r"\d+\.", s))
            tag = "ol" if ordered else "ul"
            items = []
            while i < len(lines) and re.match(r"\s*([-*]|\d+\.)\s+", lines[i]):
                items.append(re.sub(r"\s*([-*]|\d+\.)\s+", "", lines[i], count=1))
                i += 1
            out.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
            continue
        elif re.fullmatch(r"!\[[^\]]*\]\([^)\s]+\)", s):
            flush()
            m = re.match(r"!\[([^\]]*)\]", s)
            cap = f"<figcaption>{html.escape(m.group(1))}</figcaption>" if m.group(1) else ""
            out.append(f"<figure>{inline(s)}{cap}</figure>")
        else:
            para.append(s)
        i += 1
    flush()
    return "\n".join(out)


# ---------- Posts ----------

def read_post(path):
    text = path.read_text(encoding="utf-8")
    meta, body = {}, text
    m = re.match(r"---\s*\n(.*?)\n---\s*\n(.*)", text, re.S)
    if m:
        for row in m.group(1).splitlines():
            if ":" in row:
                k, v = row.split(":", 1)
                meta[k.strip().lower()] = v.strip().strip('"')
        body = m.group(2)
    slug = path.stem.lower()
    if not re.fullmatch(r"[a-z0-9-]+", slug):
        sys.exit(f"Bad file name '{path.name}': use only a-z, 0-9 and dashes.")
    for key in ("title", "date"):
        if key not in meta:
            sys.exit(f"{path.name} is missing '{key}:' in its header.")
    d = date.fromisoformat(meta["date"])
    words = len(re.findall(r"\w+", body))
    return {
        "slug": slug,
        "title": meta["title"],
        "date": d,
        "description": meta.get("description", ""),
        "draft": meta.get("draft", "false").lower() == "true",
        "html": markdown(body),
        "minutes": max(1, round(words / 220)),
    }


def nice_date(d):
    return d.strftime("%b %d, %Y").upper()


# ---------- Templates ----------

FONT_PRELOAD = '<link rel="preload" href="/fonts/geist-mono-latin.woff2" as="font" type="font/woff2" crossorigin>'


def head(title, description, url, kind="website", extra=""):
    t, d = html.escape(title), html.escape(description)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{t}</title>
  <meta name="description" content="{d}">
  <meta name="author" content="Sahil Pednekar">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#000000">
  <link rel="canonical" href="{url}">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="alternate" type="application/rss+xml" title="Sahil Pednekar — Blog" href="{SITE}/blog/rss.xml">
  {FONT_PRELOAD}
  <link rel="preload" href="/fonts/ark-es.woff" as="font" type="font/woff" crossorigin>
  <meta property="og:type" content="{kind}">
  <meta property="og:site_name" content="Sahil Pednekar">
  <meta property="og:title" content="{t}">
  <meta property="og:description" content="{d}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE}/images/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:creator" content="@sahil_pednekar3">
  <meta name="twitter:title" content="{t}">
  <meta name="twitter:description" content="{d}">
  <meta name="twitter:image" content="{SITE}/images/og.png">
{extra}  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <main class="page">
    <header class="topbar">
      <a class="home" href="/" aria-label="Home">
        <video src="/media/chick.mp4" autoplay muted loop playsinline aria-hidden="true"></video>
      </a>
      <nav>
        <a class="ulink" href="/blog/"{' aria-current="page"' if url.endswith('/blog/') else ''}>BLOG</a>
        <a class="ulink" href="/#projects">PROJECTS</a>
        <a class="ulink" href="/friends/">FRIENDS</a>
      </nav>
    </header>
"""


FOOT = """  </main>
</body>
</html>
"""


def post_row(p, tag="h2"):
    desc = f'\n          <p class="desc">{html.escape(p["description"])}</p>' if p["description"] else ""
    draft = ' <span class="draft">DRAFT</span>' if p["draft"] else ""
    return f"""        <a class="post-row" href="/blog/{p['slug']}/">
          <p class="meta"><time datetime="{p['date'].isoformat()}">{nice_date(p['date'])}</time> · {p['minutes']} MIN{draft}</p>
          <{tag} class="title">{html.escape(p['title'])}</{tag}>{desc}
        </a>"""


def index_page(posts):
    rows = "\n".join(post_row(p) for p in posts) or '        <p class="empty">First post coming soon.</p>'
    return head("Blog — Sahil Pednekar", "Notes on product design, interaction design and motion by Sahil Pednekar.",
                f"{SITE}/blog/") + f"""
    <section class="blog-hero">
      <h1>Blog</h1>
      <div class="intro">
        <p>Notes on <b>product design, interaction and motion</b> — things I'm learning, building and thinking about.</p>
      </div>
    </section>

    <section class="post-list">
{rows}
    </section>

    <p class="the-end">That's it. You scrolled to the bottom. Now what?</p>
""" + FOOT


def post_page(p, newer, older):
    url = f"{SITE}/blog/{p['slug']}/"
    schema = ('  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting",'
              f'"headline":{_json(p["title"])},"description":{_json(p["description"])},'
              f'"datePublished":"{p["date"].isoformat()}","url":"{url}",'
              f'"image":"{SITE}/images/og.png",'
              '"author":{"@type":"Person","name":"Sahil Pednekar","url":"' + SITE + '/"}}</script>\n')
    nav = []
    if older:
        nav.append(f'<a class="prev" href="/blog/{older["slug"]}/"><span>← OLDER</span>{html.escape(older["title"])}</a>')
    if newer:
        nav.append(f'<a class="next" href="/blog/{newer["slug"]}/"><span>NEWER →</span>{html.escape(newer["title"])}</a>')
    nav_html = f'\n    <nav class="post-nav">{"".join(nav)}</nav>\n' if nav else ""
    return head(f"{p['title']} — Sahil Pednekar", p["description"] or p["title"], url, "article", schema) + f"""
    <article class="post">
      <a class="ulink back" href="/blog/">← ALL POSTS</a>
      <p class="meta"><time datetime="{p['date'].isoformat()}">{nice_date(p['date'])}</time> · {p['minutes']} MIN READ</p>
      <h1>{html.escape(p['title'])}</h1>
      <div class="prose">
{p['html']}
      </div>
    </article>
{nav_html}
    <p class="the-end">Thanks for reading. <a href="https://x.com/sahil_pednekar3" target="_blank" rel="noopener">Say hi on X →</a></p>
""" + FOOT


def _json(s):
    import json
    return json.dumps(s, ensure_ascii=False).replace("</", "<\\/")


def rss(posts):
    items = "".join(f"""
    <item>
      <title>{html.escape(p['title'])}</title>
      <link>{SITE}/blog/{p['slug']}/</link>
      <guid>{SITE}/blog/{p['slug']}/</guid>
      <pubDate>{p['date'].strftime('%a, %d %b %Y')} 00:00:00 +0000</pubDate>
      <description>{html.escape(p['description'])}</description>
    </item>""" for p in posts)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Sahil Pednekar — Blog</title>
    <link>{SITE}/blog/</link>
    <description>Notes on product design, interaction design and motion.</description>{items}
  </channel>
</rss>
"""


# ---------- Home page + sitemap ----------

def update_home(posts):
    path = PUBLIC / "index.html"
    text = path.read_text(encoding="utf-8")
    if posts:
        rows = "\n".join(post_row(p, "h3") for p in posts[:HOME_LIMIT])
        block = f"""<!-- blog:start -->
    <section class="writing">
      <h2 class="label section-title">WRITING</h2>
      <div class="post-list">
{rows}
      </div>
      <a class="ulink all" href="/blog/">ALL POSTS</a>
    </section>
    <!-- blog:end -->"""
    else:
        block = "<!-- blog:start -->\n    <!-- blog:end -->"
    new = re.sub(r"<!-- blog:start -->.*?<!-- blog:end -->", block, text, flags=re.S)
    path.write_text(new, encoding="utf-8")


def update_sitemap(posts):
    today = date.today().isoformat()
    rows = [f"{SITE}/", f"{SITE}/friends/", f"{SITE}/blog/"]
    body = "".join(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in rows)
    body += "".join(f"  <url><loc>{SITE}/blog/{p['slug']}/</loc><lastmod>{p['date'].isoformat()}</lastmod></url>\n"
                    for p in posts)
    (PUBLIC / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n", encoding="utf-8")


def main():
    drafts = "--drafts" in sys.argv
    posts = [read_post(p) for p in sorted(POSTS.glob("*.md"))]
    posts = [p for p in posts if drafts or not p["draft"]]
    posts.sort(key=lambda p: p["date"], reverse=True)

    if OUT.exists():
        for f in sorted(OUT.rglob("*"), reverse=True):
            f.unlink() if f.is_file() else f.rmdir()
    OUT.mkdir(parents=True, exist_ok=True)

    (OUT / "index.html").write_text(index_page(posts), encoding="utf-8")
    (OUT / "rss.xml").write_text(rss(posts), encoding="utf-8")
    for i, p in enumerate(posts):
        d = OUT / p["slug"]
        d.mkdir()
        newer = posts[i - 1] if i > 0 else None
        older = posts[i + 1] if i + 1 < len(posts) else None
        (d / "index.html").write_text(post_page(p, newer, older), encoding="utf-8")

    published = [p for p in posts if not p["draft"]]
    update_home(posts)
    update_sitemap(published)
    print(f"Built {len(posts)} post(s){' incl. drafts' if drafts else ''}.")


if __name__ == "__main__":
    main()
