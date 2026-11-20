"""Apply SEO fixes to the mirrored site in public/. Safe to re-run (e.g. after mirror.py)."""
import json, os, re, sys, glob
from datetime import date

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
SITE = "https://sahildesign.xyz"
NAME = "Sahil Pednekar"
SHARE_IMG = SITE + "/assets/framerusercontent.com/assets/xlpzosCak4Xuxq7t35rVeSDuIlc.png"
RESUME = SITE + "/assets/framerusercontent.com/assets/gsjZC3sBltDujOYszjMr9CqbVGQ.pdf"
SAME_AS = [
    "https://x.com/sahil_pednekar3",
    "https://github.com/sahil639",
    "https://farcaster.xyz/quminsoda",
]

PAGES = {
    "index.html": {
        "path": "/",
        "title": "Sahil Pednekar — Product Designer & Interaction Designer",
        "desc": "Sahil Pednekar is a product designer focused on interaction design, building responsive, motion-driven apps at the intersection of design and engineering.",
    },
    "friends/index.html": {
        "path": "/friends/",
        "title": "Friends — Designers & Engineers Recommended by Sahil Pednekar",
        "desc": "A curated list of designers, engineers, artists and creative friends Sahil Pednekar has worked with and recommends for your next project.",
    },
}

def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")

def set_meta(html, attr, key, value):
    pat = re.compile(r'<meta %s="%s" content="[^"]*">' % (attr, re.escape(key)))
    tag = '<meta %s="%s" content="%s">' % (attr, key, esc(value))
    if pat.search(html):
        return pat.sub(lambda m: tag, html, count=1)
    return html.replace("</head>", "    " + tag + "\n</head>", 1)

def json_ld():
    person = {
        "@type": "Person", "@id": SITE + "/#person", "name": NAME,
        "url": SITE + "/", "image": SHARE_IMG,
        "jobTitle": "Product Designer",
        "description": PAGES["index.html"]["desc"],
        "knowsAbout": ["Product Design", "Interaction Design", "Motion Design", "UI/UX Design", "Design Engineering"],
        "sameAs": SAME_AS,
    }
    site = {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": NAME, "publisher": {"@id": SITE + "/#person"}}
    return json.dumps({"@context": "https://schema.org", "@graph": [person, site]}, ensure_ascii=False)

for rel, p in PAGES.items():
    f = os.path.join(ROOT, rel)
    h = open(f, encoding="utf-8", newline="").read()
    url = SITE + p["path"]
    h = re.sub(r"<title>[^<]*</title>", lambda m: "<title>%s</title>" % esc(p["title"]), h, count=1)
    h = set_meta(h, "name", "description", p["desc"])
    h = set_meta(h, "name", "robots", "index, follow, max-image-preview:large")
    h = set_meta(h, "name", "author", NAME)
    h = set_meta(h, "property", "og:title", p["title"])
    h = set_meta(h, "property", "og:description", p["desc"])
    h = set_meta(h, "property", "og:url", url)
    h = set_meta(h, "property", "og:image", SHARE_IMG)
    h = set_meta(h, "property", "og:site_name", NAME)
    h = set_meta(h, "name", "twitter:title", p["title"])
    h = set_meta(h, "name", "twitter:description", p["desc"])
    h = set_meta(h, "name", "twitter:image", SHARE_IMG)
    h = set_meta(h, "name", "twitter:creator", "@sahil_pednekar3")
    h = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % url, h)
    # structured data (home only)
    h = re.sub(r'\s*<script type="application/ld\+json" id="seo-ld">.*?</script>', "", h, flags=re.S)
    if rel == "index.html":
        h = h.replace("</head>", '    <script type="application/ld+json" id="seo-ld">%s</script>\n</head>' % json_ld(), 1)
    open(f, "w", encoding="utf-8", newline="").write(h)

# Framer's runtime re-sets title/description after load; patch its page metadata too.
for js in glob.glob(os.path.join(ROOT, "assets/framerusercontent.com/sites/*/shared-lib.*.mjs")):
    s = open(js, encoding="utf-8", newline="").read()
    s = re.sub(r"title:Z\(e,t\)\.title\|\|`Home`|title:`Sahil Pednekar — Product[^`]*`(?=,viewport)",
               "title:`%s`" % PAGES["index.html"]["title"], s)
    s = re.sub(r"title:Z\(e,t\)\.title\|\|`Friends`|title:`Friends — [^`]*`(?=,viewport)",
               "title:`%s`" % PAGES["friends/index.html"]["title"], s)
    s = s.replace("description:`Sahil Pednekar - Designer portfolio 2026`", "description:`%s`" % PAGES["index.html"]["desc"])
    s = s.replace("robots:`max-image-preview:large`", "robots:`index, follow, max-image-preview:large`")
    open(js, "w", encoding="utf-8", newline="").write(s)

today = date.today().isoformat()
open(os.path.join(ROOT, "robots.txt"), "w").write("User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % SITE)
open(os.path.join(ROOT, "sitemap.xml"), "w").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join("  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>\n" % (SITE, p["path"], today) for p in PAGES.values())
    + "</urlset>\n")
open(os.path.join(ROOT, "llms.txt"), "w").write("""# Sahil Pednekar

> Product designer focused on interaction design. Builds responsive, motion-driven apps that feel like a natural part of you, working at the intersection of design and engineering. Currently taking on new work.

## About
- Role: Product Designer / Interaction Designer
- Focus: interaction design, motion design, product design, design engineering
- Experience: One Click (2024–now), CapX (2024–2026), Questbook (2023), Dehidden (2022–2023), Zelta (2021–2022)

## Pages
- [Home](%(s)s/): portfolio, experience, projects and contact
- [Friends](%(s)s/friends/): designers, engineers and artists Sahil recommends for hire
- [Resume (PDF)](%(r)s)

## Elsewhere
- X / Twitter: https://x.com/sahil_pednekar3
- GitHub: https://github.com/sahil639
- Farcaster: https://farcaster.xyz/quminsoda
""" % {"s": SITE, "r": RESUME})
print("SEO applied")
