# Sahil Portfolio

Local copy of https://sahil.framer.website/ (home and `/friends`) with all assets saved under `assets/`.

## Run locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765. Opening `index.html` directly from disk won't work, because browsers block the module scripts on `file://`.

## Refresh from Framer

```bash
python3 mirror.py .
```
