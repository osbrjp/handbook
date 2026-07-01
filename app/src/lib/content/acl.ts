import type { Visitor } from "../auth/visitor";

// Pure content-ACL + search core. NO `astro:content` import here, so this module
// is unit-testable under plain `node --test` (the Astro-bound wrappers live in
// ./pages.ts). This is the git-backed replacement for the old readableWhere SQL.

export type Visibility = "public" | "internal" | "restricted";
export type Status = "draft" | "published";

export interface PageMeta {
  title: string;
  section: string;
  nav_label: string;
  sort: number;
  visibility: Visibility;
  groups: string[];
  status: Status;
  updated_by?: string;
  updated_at?: string;
}
export interface PageRow extends PageMeta {
  slug: string;
  body: string;
}
export interface SidebarRow extends PageRow {
  accessible: number; // 1 if the visitor may read it, else 0
}
export interface SearchHit {
  slug: string;
  title: string;
  section: string;
  snippet: string;
}

/**
 * THE ENTIRE READER ACL — one boolean predicate, reused by every surface
 * (single-page read, nav, sidebar, sitemap, search). It is the exact truth
 * table of the old `readableWhere` SQL: anon → published+public; reader →
 * +internal +their groups; editor → everything incl. drafts. Fails CLOSED —
 * an unknown visibility or a reader with no matching group never matches.
 * Review this function hardest.
 */
export function canRead(
  fm: Pick<PageMeta, "status" | "visibility" | "groups">,
  v: Visitor | null,
): boolean {
  if (!v) return fm.status === "published" && fm.visibility === "public";
  if (v.role === "editor") return true; // editors see drafts and every visibility
  if (fm.status !== "published") return false;
  if (fm.visibility === "public" || fm.visibility === "internal") return true;
  if (fm.visibility === "restricted") return (fm.groups ?? []).some((k) => v.groupKeys.includes(k));
  return false; // unknown/missing visibility => denied
}

// Strip markdown/HTML to plain text for a readable snippet. NOT a security
// boundary (the API HTML-escapes / the UI uses textContent); just removes noise.
export function toPlainText(md: string): string {
  return (md || "")
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/<[^>]+>/g, " ") // html tags
    .replace(/^:{3}.*$/gm, " ") // ::: admonition fences
    .replace(/\[\[TOC\]\]/g, " ") // toc marker
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links/images -> their text
    .replace(/[#>*_~|-]+/g, " ") // residual markdown punctuation
    .replace(/\s+/g, " ")
    .trim();
}

export function makeSnippet(body: string, q: string, maxLen = 160): string {
  const text = toPlainText(body);
  if (!text) return "";
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) {
    return text.length <= maxLen ? text : `${text.slice(0, maxLen).trimEnd()}…`;
  }
  const start = Math.max(0, idx - Math.floor((maxLen - q.length) / 2));
  let snip = text.slice(start, start + maxLen).trim();
  if (start > 0) snip = `…${snip}`;
  if (start + maxLen < text.length) snip = `${snip}…`;
  return snip;
}

/**
 * Pure search over an in-memory row list — permission-filtered via canRead.
 * Case-insensitive substring on title/body; title matches rank above body-only.
 * Empty query → []. Testable without Astro; ./pages.ts feeds it the collection.
 */
export function searchRows(
  rows: PageRow[],
  query: string,
  v: Visitor | null,
  limit = 20,
): SearchHit[] {
  const q = (query || "").trim();
  if (!q) return [];
  const ql = q.toLowerCase();
  const rank = (r: PageRow) => (r.title.toLowerCase().includes(ql) ? 0 : 1);
  return rows
    .filter(
      (r) => canRead(r, v) && (r.title.toLowerCase().includes(ql) || r.body.toLowerCase().includes(ql)),
    )
    .sort((a, b) => rank(a) - rank(b) || a.sort - b.sort)
    .slice(0, limit)
    .map((r) => ({ slug: r.slug, title: r.title, section: r.section, snippet: makeSnippet(r.body, q) }));
}
