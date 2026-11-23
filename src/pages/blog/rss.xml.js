import rss from "@astrojs/rss";
import { getPosts } from "../../lib/posts.js";

export async function GET(context) {
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  return rss({
    title: "Sahil Pednekar — Blog",
    description: "Notes on product design, interaction design and motion — plus coffee, travel and other things.",
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: `/blog/${p.id}/`,
      categories: p.data.tags,
    })),
  });
}
