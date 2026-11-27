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

// Sandbox: one .yaml file per item in /content/sandbox/ (or use the editor at /keystatic).
const sandbox = defineCollection({
  loader: glob({ base: "./content/sandbox", pattern: "**/[^_]*.{yaml,yml}" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(["interactive", "graphic"]).default("interactive"),
    description: z.string().default(""),
    thumbnail: z.string().optional(),
    href: z.string().optional(),
  }),
});

// Projects: one .mdx case study per project in /content/projects/. Images in public/projects/<project>/.
const projects = defineCollection({
  loader: glob({ base: "./content/projects", pattern: "**/[^_]*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    summary: z.string().default(""),
    role: z.string().default(""),
    year: z.string().default(""),
    timeline: z.string().optional(),
    team: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    thumbnail: z.string().optional(),
    icon: z.string().optional(), // small square app icon, used in the More from me list
    link: z.string().optional(),
    group: z.enum(["work", "more"]).default("work"), // "work" = Projects, "more" = More from me
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, sandbox, projects };
