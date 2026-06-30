import type { Visitor } from "../auth/visitor";

export type Visibility = "public" | "internal" | "restricted";

export interface PageRow {
  id: number;
  slug: string;
  title: string;
  section: string;
  nav_label: string;
  sort: number;
  visibility: Visibility;
  status: string;
  body: string;
}

export interface PageInput {
  slug: string;
  title: string;
  section: string;
  nav_label: string;
  sort: number;
  visibility: Visibility;
  status: "draft" | "published";
  body: string;
}

/**
 * THE ENTIRE READER ACL — one SQL predicate, reused by single-page reads, nav,
 * and sitemap. The anonymous base case is the tightest; each privilege only
 * WIDENS it via a clause. A reader with no groups gets `restricted AND 0` —
 * literally cannot match a restricted page. Review this function hardest.
 */
export function readableWhere(v: Visitor | null): { sql: string; binds: unknown[] } {
  if (!v) return { sql: "p.status='published' AND p.visibility='public'", binds: [] };
  if (v.role === "editor") return { sql: "1=1", binds: [] }; // editors see drafts too
  const binds: unknown[] = [];
  let restricted = "0"; // no groups => never matches
  if (v.groupIds.length) {
    const ph = v.groupIds.map(() => "?").join(",");
    restricted = `EXISTS (SELECT 1 FROM page_groups pg WHERE pg.page_id=p.id AND pg.group_id IN (${ph}))`;
    binds.push(...v.groupIds);
  }
  return {
    sql: `p.status='published' AND (p.visibility='public' OR p.visibility='internal' OR (p.visibility='restricted' AND ${restricted}))`,
    binds,
  };
}

const PAGE_COLS = "p.id, p.slug, p.title, p.section, p.nav_label, p.sort, p.visibility, p.status, p.body";
const NAV_COLS = "p.id, p.slug, p.title, p.section, p.nav_label, p.sort, p.visibility, p.status";

// biome-ignore lint/suspicious/noExplicitAny: D1 row shape
function asPage(row: any): PageRow | null {
  return row ? (row as PageRow) : null;
}

/** One page by slug, permission-filtered. Returns null for missing AND forbidden. */
export async function getPageBySlug(db: D1Database, slug: string, v: Visitor | null): Promise<PageRow | null> {
  const w = readableWhere(v);
  const row = await db
    .prepare(`SELECT ${PAGE_COLS} FROM pages p WHERE p.slug=? AND (${w.sql}) LIMIT 1`)
    .bind(slug, ...w.binds)
    .first();
  return asPage(row);
}

/** Nav list. Reflects PUBLISHED reality even for editors (drafts via /admin). */
export async function getNavPages(db: D1Database, v: Visitor | null): Promise<PageRow[]> {
  const base =
    v && v.role === "editor"
      ? { sql: "p.status='published'", binds: [] as unknown[] }
      : readableWhere(v);
  const { results } = await db
    .prepare(`SELECT ${NAV_COLS} FROM pages p WHERE ${base.sql} ORDER BY p.section, p.sort`)
    .bind(...base.binds)
    .all();
  return (results ?? []) as unknown as PageRow[];
}

/** Editor-only: every page incl. drafts. Callers MUST gate on editor role first. */
export async function listAllPages(db: D1Database): Promise<PageRow[]> {
  const { results } = await db
    .prepare(`SELECT ${PAGE_COLS} FROM pages p ORDER BY p.section, p.sort`)
    .all();
  return (results ?? []) as unknown as PageRow[];
}

/** Editor-only: a page by id (for the edit form). Callers MUST gate on editor role. */
export async function getPageById(db: D1Database, id: number): Promise<PageRow | null> {
  const row = await db.prepare(`SELECT ${PAGE_COLS} FROM pages p WHERE p.id=? LIMIT 1`).bind(id).first();
  return asPage(row);
}

/** Editor-only upsert (by slug conflict). Returns the row id. */
export async function upsertPage(
  db: D1Database,
  input: PageInput,
  editorEmail: string,
  id?: number,
): Promise<number> {
  if (id) {
    await db
      .prepare(
        `UPDATE pages SET slug=?, title=?, section=?, nav_label=?, sort=?, visibility=?, status=?, body=?, updated_at=datetime('now'), updated_by=? WHERE id=?`,
      )
      .bind(input.slug, input.title, input.section, input.nav_label, input.sort, input.visibility, input.status, input.body, editorEmail, id)
      .run();
    return id;
  }
  const res = await db
    .prepare(
      `INSERT INTO pages (slug, title, section, nav_label, sort, visibility, status, body, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(input.slug, input.title, input.section, input.nav_label, input.sort, input.visibility, input.status, input.body, editorEmail)
    .run();
  return Number(res.meta.last_row_id);
}

/** Editor-only: replace the group grants for a restricted page. */
export async function setPageGroups(db: D1Database, pageId: number, groupKeys: string[]): Promise<void> {
  await db.prepare("DELETE FROM page_groups WHERE page_id=?").bind(pageId).run();
  for (const key of groupKeys) {
    await db
      .prepare("INSERT OR IGNORE INTO page_groups (page_id, group_id) SELECT ?, id FROM groups WHERE key=?")
      .bind(pageId, key)
      .run();
  }
}
