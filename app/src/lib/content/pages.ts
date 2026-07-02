import { type CollectionEntry, getCollection, getEntry } from "astro:content";
import type { Visitor } from "../auth/visitor";
import { canRead, type PageRow, searchRows, type SearchHit } from "./acl";

// Astro-bound content reads. All content comes from the `pages` collection
// (git-backed markdown, bundled at build — everything in it is PUBLISHED;
// drafts/pending edits live on handbook/<slug> branches, never in the build).
// The ACL lives in ./acl.ts and is applied here per surface.

function toRow(entry: CollectionEntry<"pages">): PageRow {
  return { slug: entry.id, body: entry.body ?? "", ...entry.data };
}

async function allRows(): Promise<PageRow[]> {
  const entries = await getCollection("pages");
  return entries.map(toRow);
}

/** One page by slug, permission-filtered. Returns null for missing AND forbidden. */
export async function getPageBySlug(slug: string, v: Visitor | null): Promise<PageRow | null> {
  const entry = await getEntry("pages", slug);
  if (!entry) return null;
  const row = toRow(entry);
  return canRead(row, v) ? row : null;
}

/** Nav/sidebar list: the pages this visitor may read, in nav order. */
export async function getNavPages(v: Visitor | null): Promise<PageRow[]> {
  const rows = await allRows();
  return rows.filter((r) => canRead(r, v)).sort((a, b) => a.sort - b.sort);
}

/** Editor surface: every page. Callers MUST gate on editor role first. */
export async function listAllPages(): Promise<PageRow[]> {
  const rows = await allRows();
  return rows.sort((a, b) => a.section.localeCompare(b.section) || a.sort - b.sort);
}

/** Editor surface: a page by slug (for the edit form). Caller gates on editor role. */
export async function getEditablePageBySlug(slug: string): Promise<PageRow | null> {
  const entry = await getEntry("pages", slug);
  return entry ? toRow(entry) : null;
}

/** Full-handbook search, permission-filtered via the shared ACL. */
export async function searchPages(
  query: string,
  v: Visitor | null,
  limit = 20,
): Promise<SearchHit[]> {
  return searchRows(await allRows(), query, v, limit);
}

export { canRead } from "./acl";
export type { PageRow, SearchHit, Visibility, PageMeta } from "./acl";
