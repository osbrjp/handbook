import { type CollectionEntry, getCollection, getEntry } from "astro:content";
import { isEditorRole, type Visitor } from "../auth/visitor";
import { canRead, type PageRow, searchRows, type SearchHit, type SidebarRow } from "./acl";

// Astro-bound content reads. All content comes from the `pages` collection
// (git-backed markdown, bundled at build); the ACL lives in ./acl.ts and is
// applied here per surface, mirroring the old db/pages.ts function set.

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

/** Nav list. Reflects PUBLISHED reality even for editors (drafts via the editor). */
export async function getNavPages(v: Visitor | null): Promise<PageRow[]> {
  const rows = await allRows();
  const visible = isEditorRole(v?.role)
    ? rows.filter((r) => r.status === "published")
    : rows.filter((r) => canRead(r, v));
  return visible.sort((a, b) => a.sort - b.sort);
}

// Sidebar listing:
//  - anonymous → ONLY public+published pages (others hidden entirely)
//  - logged in → ALL published pages, each flagged `accessible` so the UI can
//    show inaccessible ones as "no access" rather than hide them
export async function getSidebarPages(v: Visitor | null): Promise<SidebarRow[]> {
  const rows = await allRows();
  if (!v) {
    return rows
      .filter((r) => r.status === "published" && r.visibility === "public")
      .map((r) => ({ ...r, accessible: 1 }))
      .sort((a, b) => a.sort - b.sort);
  }
  return rows
    .filter((r) => r.status === "published")
    .map((r) => ({ ...r, accessible: canRead(r, v) ? 1 : 0 }))
    .sort((a, b) => a.sort - b.sort);
}

/** Editor-only: every page incl. drafts. Callers MUST gate on editor role first. */
export async function listAllPages(): Promise<PageRow[]> {
  const rows = await allRows();
  return rows.sort((a, b) => a.section.localeCompare(b.section) || a.sort - b.sort);
}

/** Editor-only: a page by slug (for the edit form), incl. drafts. Caller gates on editor role. */
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
export type { PageRow, SidebarRow, SearchHit, Visibility, PageMeta } from "./acl";
