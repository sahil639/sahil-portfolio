import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Every .mdx file in /content/blog/ is a post. Files starting with "_" (like _template.mdx) are ignored.
const blog = defineCollection({
  loader: glob({ base: "./content/blog", pattern: "**/[^_]*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().default(""),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
