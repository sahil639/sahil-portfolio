# Sahil Pednekar — Portfolio

Personal portfolio for [sahildesign.xyz](https://sahildesign.xyz). Plain HTML, CSS and a little JavaScript — no framework, no build step.

```
public/
  index.html          home
  friends/index.html  friends list
  css/style.css       all styles
  js/main.js          scramble text, GitHub grid, copy-email button
  fonts/ images/ media/
```

## Run locally

```bash
python3 -m http.server 8765 -d public
```

Then open http://localhost:8765.

## Deploy

Hosted on Cloudflare Workers (static assets, see `wrangler.jsonc`). Every push to `main` deploys automatically.
