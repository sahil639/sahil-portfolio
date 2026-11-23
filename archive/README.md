# Archive

Things taken off the live site but kept so they can come back. Nothing in this folder is built or deployed.

## Friends page
- `friends/index.astro`: the page
- `friends/images/`: avatars (were `public/images/friends/`)
- `friends/cat.mp4`: the cat video (was `public/media/cat.mp4`)

To restore:
1. Move `friends/index.astro` → `src/pages/friends/index.astro`
2. Move `friends/images/` → `public/images/friends/` and `friends/cat.mp4` → `public/media/cat.mp4`
3. Put back the "HIRE MY FRIENDS" link and nav link (see `home-snippets.html`; nav is in `src/layouts/Base.astro`)
4. Remove the `/friends` lines from `public/_redirects` and add `/friends/` back to `src/pages/sitemap.xml.js`

## Footer video (rotating doll)
- `footer-video/footer.mp4` (was `public/media/footer.mp4`)
- The `<video>` tag is in `home-snippets.html`. Its styles (`.footer-video`) are still in `public/css/style.css`.

To restore: move the mp4 back to `public/media/` and paste the tag back into the footer in `src/pages/index.astro`.

## Old projects section
The Figma link and the "Getting Started" scramble cards are in `home-snippets.html`.
