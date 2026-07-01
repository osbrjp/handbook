import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Git-backed content: one markdown file per page under src/content/pages.
// The filename stem IS the slug (so a slug rename = a file rename). Metadata
// (title, section, sort, visibility, groups, status) lives in frontmatter.
//
// FAIL CLOSED: a file with a missing/typo'd `visibility` defaults to the
// TIGHTEST tier (restricted), and missing `status` defaults to `draft`, so a
// malformed file can never accidentally render as public/published. The build
// rejects files that don't satisfy this schema.
const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    section: z.string(),
    nav_label: z.string().default(""),
    sort: z.number().default(0),
    visibility: z.enum(["public", "internal", "restricted"]).default("restricted"),
    groups: z.array(z.string()).default([]),
    status: z.enum(["draft", "published"]).default("draft"),
    updated_by: z.string().optional(),
    updated_at: z.string().optional(),
  }),
});

export const collections = { pages };
