#!/usr/bin/env node
// migrate-doc.mjs — convert the existing VitePress handbook (doc/*.md) into a
// Directus seed file (directus/seed/pages.json). PURE NODE, no Directus needed.
//
// Design notes (from the POC decision doc):
// - Body is stored as MARKDOWN VERBATIM. We do NOT convert ::: admonitions,
//   [[TOC]] or mermaid here — the Astro render pipeline handles those at render
//   time. Keeping markdown is the correct storage format for this content.
// - The leading `# H1` becomes the page title and is STRIPPED from the body so
//   the rendered page does not show the title twice.
// - IA metadata (section / sort / nav_label) is SEEDED from the VitePress
//   sidebar in doc/.vitepress/config.mts, never inferred from the filesystem.
// - index.md (the home hero) is NOT a `pages` row — the home page is a bespoke
//   Astro component. It is reported but skipped.
//
// Usage:  node directus/migrate-doc.mjs

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const docDir = path.join(repoRoot, "doc");
const outDir = path.join(here, "seed");
const outFile = path.join(outDir, "pages.json");

// Mirror of doc/.vitepress/config.mts sidebar. order = display order.
// visibility: public | internal | restricted. allowed_groups only for restricted.
const PAGE_META = {
  "what-is-handbook": { section: "About", nav_label: "What is Handbook?", visibility: "public" },
  "strategy": { section: "About", nav_label: "Strategy", visibility: "internal" },
  "code-of-conduct": { section: "People & Culture", nav_label: "Code of Conduct", visibility: "public" },
  "talent-acquisition": { section: "People & Culture", nav_label: "Talent Acquisition", visibility: "internal" },
  "on-boarding": { section: "Guideline", nav_label: "On-boarding Guide", visibility: "internal" },
  "development-guide": { section: "Guideline", nav_label: "Development Guide", visibility: "internal" },
  "predefining-non-functional-requirements": { section: "Guideline", nav_label: "Non-functional Requirements", visibility: "internal" },
  "technical-glossary": { section: "Guideline", nav_label: "Technical Glossary", visibility: "internal" },
  "sheq-policy": { section: "Policies", nav_label: "SHEQ Policy", visibility: "internal" },
  // Orphan in VitePress (not in the sidebar). For the POC we use it to
  // demonstrate the third visibility level: group-restricted.
  "security-policy": { section: "Policies", nav_label: "Security Policy", visibility: "restricted", allowed_groups: ["leadership"] },
};

const SECTION_ORDER = ["About", "People & Culture", "Guideline", "Policies"];

function extractTitle(md, slug) {
  const m = md.match(/^\s*#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : slugToTitle(slug);
}

function stripLeadingH1(md) {
  // Remove the first `# Heading` line (and the blank lines right after it).
  return md.replace(/^\s*#\s+.+?\r?\n+/, "");
}

function slugToTitle(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

async function main() {
  const entries = (await readdir(docDir)).filter((f) => f.endsWith(".md"));
  const pages = [];
  const skipped = [];
  const unmapped = [];

  for (const file of entries.sort()) {
    const slug = file.replace(/\.md$/, "");
    if (slug === "index") {
      skipped.push(`${file} (home hero -> bespoke Astro component, not a page row)`);
      continue;
    }
    const meta = PAGE_META[slug];
    if (!meta) {
      unmapped.push(file);
      continue;
    }
    const raw = await readFile(path.join(docDir, file), "utf8");
    const title = extractTitle(raw, slug);
    const body = stripLeadingH1(raw).trim();

    pages.push({
      title,
      slug,
      section: meta.section,
      nav_label: meta.nav_label || title,
      sort: 0, // filled below, per section
      visibility: meta.visibility,
      allowed_groups: meta.allowed_groups || [],
      status: "published",
      body,
    });
  }

  // Stable sort: section order, then original alphabetical within section.
  pages.sort((a, b) => {
    const s = SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section);
    return s !== 0 ? s : a.slug.localeCompare(b.slug);
  });
  pages.forEach((p, i) => (p.sort = (i + 1) * 10));

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, JSON.stringify(pages, null, 2) + "\n", "utf8");

  // Report
  const byVis = pages.reduce((acc, p) => ((acc[p.visibility] = (acc[p.visibility] || 0) + 1), acc), {});
  console.log(`Wrote ${pages.length} pages -> ${path.relative(repoRoot, outFile)}`);
  console.log(`  visibility:`, byVis);
  if (skipped.length) console.log(`  skipped:`, skipped.join("; "));
  if (unmapped.length) console.warn(`  WARNING unmapped (no PAGE_META, not migrated):`, unmapped.join(", "));
}

// Run main() only when invoked directly (not when imported by tests).
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { extractTitle, stripLeadingH1, slugToTitle };
