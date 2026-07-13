import type { PageRow } from "./acl.ts";
import { toPlainText } from "./acl.ts";

// llms.txt / llms-full.txt / per-page .md builders (llmstxt.org convention) —
// the machine-readable surface AI agents ingest (the standard-repository
// code-quality hook sends every org Claude session here for the style guides).
//
// Pure text over PageRow[]: NO astro:content import (node --test testable) and
// NO ACL of its own — callers pass rows ALREADY filtered by canRead (pages.ts
// getNavPages), same fail-closed gate as every HTML page. The legacy VitePress
// site gets these files from vitepress-plugin-llms at build time (all-public,
// fine there); here they must be per-visitor, hence dynamic.

export const SITE_TITLE = "The OSBR Handbook";
export const SITE_SUMMARY = "A transparent guide to OSBR's culture, values, and workflows.";

/** First ~maxLen chars of the body as plain text — the index entry summary. */
export function pageSummary(body: string, maxLen = 160): string {
  const text = toPlainText(body);
  return text.length <= maxLen ? text : `${text.slice(0, maxLen).trimEnd()}…`;
}

/** Sections in sidebar order: first encounter over sort-ordered rows (Sidebar.astro). */
function sectionsOf(rows: PageRow[]): string[] {
  return [...new Set(rows.map((r) => r.section))];
}

/**
 * /llms.txt — the index: site title, summary, then one link list per section.
 * Links point at the per-page `.md` endpoints (raw markdown beats HTML
 * scraping for agents). `rows` must be canRead-filtered and sort-ordered.
 */
export function buildLlmsIndex(rows: PageRow[], base: string): string {
  const out = [`# ${SITE_TITLE}`, "", `> ${SITE_SUMMARY}`, ""];
  for (const section of sectionsOf(rows)) {
    out.push(`## ${section}`, "");
    for (const r of rows.filter((p) => p.section === section)) {
      const summary = pageSummary(r.body);
      out.push(`- [${r.title}](${base}/${r.slug}.md)${summary ? `: ${summary}` : ""}`);
    }
    out.push("");
  }
  return `${out.join("\n").trimEnd()}\n`;
}

/** One page as standalone markdown: title H1 restored above the stored body. */
export function pageMarkdown(row: PageRow): string {
  return `# ${row.title}\n\n${row.body.trim()}\n`;
}

/** /llms-full.txt — every readable page's full markdown in one document. */
export function buildLlmsFull(rows: PageRow[]): string {
  const header = `# ${SITE_TITLE}\n\n> ${SITE_SUMMARY}\n`;
  return `${[header, ...rows.map((r) => pageMarkdown(r).trimEnd())].join("\n\n---\n\n")}\n`;
}
