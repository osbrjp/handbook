#!/usr/bin/env node
// seed-content.mjs — convert the original VitePress handbook (doc/*.md) into
// Astro content-collection files at app/src/content/pages/<slug>.md with
// frontmatter. Git-backed content is the source of truth; this is a one-time
// (re-runnable) importer used to bootstrap / reset local content. Runs in
// plain Node (the shared .ts serializer loads via Node's type stripping).
//
// Body is stored as MARKDOWN VERBATIM (the render pipeline handles :::, [[TOC]]
// and mermaid). The leading `# H1` becomes the `title` and is stripped from the
// body (the reader page renders <h1>{title}</h1> itself). IA metadata
// (section/nav_label/visibility/sort) comes from the VitePress sidebar mirror
// below, never inferred.
//
// Usage:  node app/scripts/seed-content.mjs

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
// The ONE frontmatter serializer, shared with the editor's write path (Node
// ≥22.18 strips the types) — seeded files and editor saves can never drift.
import { serializePageFile } from "../src/lib/content/serialize.ts";

const here = path.dirname(fileURLToPath(import.meta.url)); // app/scripts
const appDir = path.resolve(here, ".."); // app
const repoRoot = path.resolve(appDir, ".."); // repo root
const docDir = path.join(repoRoot, "doc");
const outDir = path.join(appDir, "src", "content", "pages");

// Mirror of doc/.vitepress/config.mts sidebar (declaration order = nav order).
const PAGE_META = {
  "what-is-handbook": { section: "About", nav_label: "What is Handbook?", visibility: "public" },
  strategy: { section: "About", nav_label: "Strategy", visibility: "internal" },
  "code-of-conduct": {
    section: "People & Culture",
    nav_label: "Code of Conduct",
    visibility: "public",
  },
  "talent-acquisition": {
    section: "People & Culture",
    nav_label: "Talent Acquisition",
    visibility: "internal",
  },
  "on-boarding": { section: "Guideline", nav_label: "On-boarding Guide", visibility: "internal" },
  "development-guide": {
    section: "Guideline",
    nav_label: "Development Guide",
    visibility: "internal",
  },
  "predefining-non-functional-requirements": {
    section: "Guideline",
    nav_label: "Non-functional Requirements",
    visibility: "internal",
  },
  "technical-glossary": {
    section: "Guideline",
    nav_label: "Technical Glossary",
    visibility: "internal",
  },
  "sheq-policy": { section: "Policies", nav_label: "SHEQ Policy", visibility: "internal" },
  "security-policy": { section: "Policies", nav_label: "Security Policy", visibility: "internal" },
};

// --- pure helpers (also imported by the seed test) ---
export function extractTitle(md, slug) {
  const m = md.match(/^\s*#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : slugToTitle(slug);
}
export function stripLeadingH1(md) {
  return md.replace(/^\s*#\s+.+?\r?\n+/, "");
}
export function slugToTitle(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const slugs = Object.keys(PAGE_META);
  let n = 0;
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const meta = PAGE_META[slug];
    let raw;
    try {
      raw = await readFile(path.join(docDir, `${slug}.md`), "utf8");
    } catch {
      continue; // skip if the markdown file is missing
    }
    const fm = {
      title: extractTitle(raw, slug),
      section: meta.section,
      nav_label: meta.nav_label || slugToTitle(slug),
      sort: (i + 1) * 10, // sequential; groups sections in declaration order
      visibility: meta.visibility,
      groups: meta.groups || [],
      status: "published",
    };
    await writeFile(path.join(outDir, `${slug}.md`), serializePageFile(fm, stripLeadingH1(raw)));
    n++;
  }
  console.log(`Wrote ${n} content files -> app/src/content/pages/`);
}

// Only run when invoked directly (not when imported by a test).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
