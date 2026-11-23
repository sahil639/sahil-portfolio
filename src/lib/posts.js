import { getCollection } from "astro:content";

// Drafts show while running locally (npm run dev) and are hidden in the live build.
export async function getPosts() {
  const posts = await getCollection("blog", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date - a.data.date);
}

export const niceDate = (d) =>
  d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }).toUpperCase();

export const isoDate = (d) => d.toISOString().slice(0, 10);

export function wordsToMinutes(body = "") {
  const words = body.replace(/<[^>]+>|import .*|export .*/g, " ").match(/\S+/g) || [];
  return Math.max(1, Math.round(words.length / 220));
}
