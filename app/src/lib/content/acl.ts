import type { Visitor } from "../auth/visitor.ts";

// Pure content-ACL + search core. NO `astro:content` import here, so this module
// is unit-testable under plain `node --test` (the Astro-bound wrappers live in
// ./pages.ts).

export type Visibility = "public" | "internal";

export interface PageMeta {
  title: string;
  section: string;
  nav_label: string;
  sort: number;
  visibility: Visibility;
  updated_by?: string;
  updated_at?: string;
}
export interface PageRow extends PageMeta {
  slug: string;
  body: string;
}
export interface SearchHit {
  slug: string;
  title: string;
  section: string;
  snippet: string;
}

/**
 * THE ENTIRE READER ACL — one boolean predicate, reused by every surface
 * (single-page read, nav, sidebar, sitemap, search).
 *
 *   public   → anyone
 *   internal → any signed-in person (a repo collaborator — who could read the
 *              markdown source on GitHub anyway, so finer tiers here would be
 *              theater, not security)
 *
 * ROLES PLAY NO PART: reading is about being signed in, roles are about
 * editing/approving. Drafts never reach this predicate — everything in the
 * build is published (unmerged work lives on handbook/<slug> branches).
 * Fails CLOSED: unknown/missing visibility never matches.
 */
export function canRead(fm: Pick<PageMeta, "visibility">, v: Visitor | null): boolean {
  if (fm.visibility === "public") return true;
  if (fm.visibility === "internal") return v !== null;
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
  // Centre the window on the match, but never start AFTER it (a query longer
  // than maxLen would otherwise push `start` past `idx` and drop the match).
  const start = Math.max(0, Math.min(idx, idx - Math.floor((maxLen - q.length) / 2)));
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
      (r) =>
        canRead(r, v) && (r.title.toLowerCase().includes(ql) || r.body.toLowerCase().includes(ql)),
    )
    .sort((a, b) => rank(a) - rank(b) || a.sort - b.sort)
    .slice(0, limit)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      section: r.section,
      snippet: makeSnippet(r.body, q),
    }));
}
