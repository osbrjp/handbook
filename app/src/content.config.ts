import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Git-backed content: one markdown file per page under src/content/pages.
// The filename stem IS the slug (so a slug rename = a file rename). Metadata
// (title, section, sort, visibility) lives in frontmatter.
//
// EVERYTHING IN THIS COLLECTION IS PUBLISHED — published means merged to the
// content branch. Drafts/pending edits live as git commits on handbook/<slug>
// branches (and their PRs), never as hidden pages in the build.
//
// FAIL CLOSED: a file with a missing/typo'd `visibility` defaults to the
// TIGHTEST tier (internal — signed-in staff only), so a malformed file can
// never accidentally render as public. The build rejects files that don't
// satisfy this schema. Unknown legacy keys (status/groups) are ignored.
const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    section: z.string(),
    nav_label: z.string().default(""),
    // Slug of the page this one nests under in the sidebar (e.g. the language
    // guides under style-guide). Absent/unknown parent = top level.
    parent: z.string().optional(),
    sort: z.number().default(0),
    visibility: z.enum(["public", "internal"]).default("internal"),
    updated_by: z.string().optional(),
    updated_at: z.string().optional(),
  }),
});

export const collections = { pages };
