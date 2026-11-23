import { getPosts, isoDate } from "../lib/posts.js";

const SITE = "https://sahildesign.xyz";

export async function GET() {
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  const latest = posts[0] ? isoDate(posts[0].data.date) : undefined;
  const rows = [
    { loc: `${SITE}/` },
    { loc: `${SITE}/extras/` },
    { loc: `${SITE}/sandbox/` },
    { loc: `${SITE}/blog/`, lastmod: latest },
    ...posts.map((p) => ({ loc: `${SITE}/blog/${p.id}/`, lastmod: isoDate(p.data.date) })),
  ];
  const body = rows
    .map((r) => `  <url><loc>${r.loc}</loc>${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ""}</url>`)
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
