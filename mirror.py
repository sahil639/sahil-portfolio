import os, re, sys, urllib.request, urllib.parse, hashlib

OUT = sys.argv[1]
PAGES = {"index.html": "https://sahil.framer.website/", "friends/index.html": "https://sahil.framer.website/friends"}
HOSTS = ["framerusercontent.com", "fonts.gstatic.com", "fonts.googleapis.com"]
URL_RE = re.compile(r'https://(?:%s)/[^"\'\s)\\`<>,]*' % "|".join(re.escape(h) for h in HOSTS))
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36"}
TEXT_EXT = (".mjs", ".js", ".css", ".json", ".html", ".svg")

done = {}
failed = []

def local_path(url):
    p = urllib.parse.urlsplit(url)
    path = p.path.lstrip("/") or "index"
    return "assets/" + p.netloc + "/" + path

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def process(url):
    clean = url.split("#")[0]
    # strip trailing junk chars
    clean = clean.rstrip(".;")
    clean = clean.split("?")[0]
    if clean in done:
        return done[clean]
    lp = local_path(clean)
    done[clean] = lp
    if clean.endswith("/") or "${" in clean:
        return lp if not clean.endswith("/") else lp.rstrip("/").rsplit("/",0)[0] + ("/" if not lp.endswith("/") else "")
    try:
        data = fetch(clean)
    except Exception as e:
        failed.append((clean, str(e)))
        return lp
    full = os.path.join(OUT, lp)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if lp.endswith(TEXT_EXT) or b"import" in data[:2000] and lp.endswith(".mjs"):
        text = data.decode("utf-8", "replace")
        text = rewrite(text)
        if lp.endswith((".mjs", ".js")):
            base = clean.rsplit("/", 1)[0] + "/"
            for rel in set(re.findall(r'["\'`]\./([A-Za-z0-9_.\-]+\.(?:mjs|js|json|wasm))["\'`]', text)):
                process(base + rel)
        data = text.encode("utf-8")
    with open(full, "wb") as f:
        f.write(data)
    return lp

def rewrite(text):
    def rep(m):
        u = m.group(0)
        lp = process(u)
        q = u.split("?",1)[1] if "?" in u else None
        return "/" + lp + ("?" + q if q else "")
    return URL_RE.sub(rep, text)

for out, url in PAGES.items():
    html = fetch(url).decode("utf-8")
    html = rewrite(html)
    # drop analytics + editor bar
    html = re.sub(r'<script[^>]*events\.framer\.com[^>]*></script>', '', html)
    html = html.replace("https://framer.com/edit/init.mjs", "")
    # make internal links work locally
    html = html.replace('href="./friends"', 'href="/friends/"').replace('href="./"', 'href="/"')
    html = html.replace("https://sahil.framer.website/friends", "/friends/").replace("https://sahil.framer.website/", "/")
    full = os.path.join(OUT, out)
    os.makedirs(os.path.dirname(full) or OUT, exist_ok=True)
    open(full, "w").write(html)

print("downloaded", len(done))
for f in failed:
    print("FAILED", f)
