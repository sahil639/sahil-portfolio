import { getCollection } from "astro:content";

// group: "work" → Projects section, "more" → More from me. Sorted by `order`.
export async function getProjects(group) {
  const all = await getCollection("projects", ({ data }) => import.meta.env.DEV || !data.draft);
  return all
    .filter((p) => !group || p.data.group === group)
    .sort((a, b) => (a.data.group === b.data.group ? a.data.order - b.data.order : a.data.group === "work" ? -1 : 1));
}
