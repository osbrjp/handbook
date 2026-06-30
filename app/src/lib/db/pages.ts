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

const PAGE_COLS =
  "p.id, p.slug, p.title, p.section, p.nav_label, p.sort, p.visibility, p.status, p.body";
const NAV_COLS = "p.id, p.slug, p.title, p.section, p.nav_label, p.sort, p.visibility, p.status";

// biome-ignore lint/suspicious/noExplicitAny: D1 row shape
function asPage(row: any): PageRow | null {
  return row ? (row as PageRow) : null;
}

/** One page by slug, permission-filtered. Returns null for missing AND forbidden. */
export async function getPageBySlug(
  db: D1Database,
  slug: string,
  v: Visitor | null,
): Promise<PageRow | null> {
  const w = readableWhere(v);
  const row = await db
    .prepare(`SELECT ${PAGE_COLS} FROM pages p WHERE p.slug=? AND (${w.sql}) LIMIT 1`)
    .bind(slug, ...w.binds)
    .first();
  return asPage(row);
}

/** Nav list. Reflects PUBLISHED reality even for editors (drafts via /edit-pages). */
export async function getNavPages(db: D1Database, v: Visitor | null): Promise<PageRow[]> {
  const base =
    v && v.role === "editor"
      ? { sql: "p.status='published'", binds: [] as unknown[] }
      : readableWhere(v);
  const { results } = await db
    .prepare(`SELECT ${NAV_COLS} FROM pages p WHERE ${base.sql} ORDER BY p.sort`)
    .bind(...base.binds)
    .all();
  return (results ?? []) as unknown as PageRow[];
}

export interface SidebarRow extends PageRow {
  accessible: number; // 1 if the visitor may read it, else 0
}

// Sidebar listing:
//  - anonymous  → ONLY public pages (non-public pages are hidden entirely)
//  - logged in  → ALL published pages, each flagged `accessible` so the UI can
//                 show inaccessible ones as "no access" rather than hide them
export async function getSidebarPages(db: D1Database, v: Visitor | null): Promise<SidebarRow[]> {
  if (!v) {
    const { results } = await db
      .prepare(
        `SELECT ${NAV_COLS}, 1 AS accessible FROM pages p WHERE p.status='published' AND p.visibility='public' ORDER BY p.sort`,
      )
      .all();
    return (results ?? []) as unknown as SidebarRow[];
  }

  const binds: unknown[] = [];
  let accessibleExpr: string;
  if (v.role === "editor") {
    accessibleExpr = "1";
  } else if (v.groupIds.length) {
    const ph = v.groupIds.map(() => "?").join(",");
    accessibleExpr = `CASE WHEN p.visibility IN ('public','internal') THEN 1 WHEN p.visibility='restricted' AND EXISTS (SELECT 1 FROM page_groups pg WHERE pg.page_id=p.id AND pg.group_id IN (${ph})) THEN 1 ELSE 0 END`;
    binds.push(...v.groupIds);
  } else {
    accessibleExpr = "CASE WHEN p.visibility IN ('public','internal') THEN 1 ELSE 0 END";
  }
  const { results } = await db
    .prepare(
      `SELECT ${NAV_COLS}, ${accessibleExpr} AS accessible FROM pages p WHERE p.status='published' ORDER BY p.sort`,
    )
    .bind(...binds)
    .all();
  return (results ?? []) as unknown as SidebarRow[];
}

export interface SearchHit {
  slug: string;
  title: string;
  section: string;
  snippet: string;
}

// Strip markdown/HTML to plain text for a safe, readable snippet. This is NOT a
// security boundary (the API HTML-escapes / the UI uses textContent) — it just
// removes noise (fences, directives, markup) so the excerpt reads cleanly.
function toPlainText(md: string): string {
  return (md || "")
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/<[^>]+>/g, " ") // html tags
    .replace(/^:{3}.*$/gm, " ") // ::: admonition fences
    .replace(/\[\[TOC\]\]/g, " ") // toc marker
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // images/links -> their text
    .replace(/[#>*_~|-]+/g, " ") // residual markdown punctuation
    .replace(/\s+/g, " ")
    .trim();
}

// Build a ~maxLen plain-text excerpt centred on the first occurrence of `q`
// (case-insensitive). Falls back to the start of the text when there's no match
// in the body (e.g. the hit was on the title).
function makeSnippet(body: string, q: string, maxLen = 160): string {
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
 * Full-handbook search, permission-filtered. POC scale (~10 pages) so a plain
 * case-insensitive LIKE on title/body is plenty; no FTS index needed.
 *
 * ACL: the match is ANDed with `readableWhere(visitor)` — the SAME predicate used
 * by single-page reads and nav — so results NEVER include a page the visitor may
 * not read (anon → published+public; reader → +internal +their groups; editor →
 * everything incl. drafts). Title matches rank above body-only matches.
 *
 * Empty/whitespace query → []. Snippets are stripped to plain text server-side;
 * callers still escape before HTML.
 */
export async function searchPages(
  db: D1Database,
  query: string,
  v: Visitor | null,
  limit = 20,
): Promise<SearchHit[]> {
  const q = (query || "").trim();
  if (!q) return [];

  const acl = readableWhere(v);
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`; // escape LIKE wildcards
  // Bind order mirrors the placeholders left-to-right: the title-rank CASE, the
  // title LIKE, the body LIKE, then the ACL binds inside the AND (…) clause.
  const sql = `SELECT p.slug, p.title, p.section, p.body,
      CASE WHEN p.title LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END AS rank
    FROM pages p
    WHERE (p.title LIKE ? ESCAPE '\\' OR p.body LIKE ? ESCAPE '\\')
      AND (${acl.sql})
    ORDER BY rank, p.sort
    LIMIT ?`;
  const { results } = await db
    .prepare(sql)
    .bind(like, like, like, ...acl.binds, limit)
    .all();
  // biome-ignore lint/suspicious/noExplicitAny: D1 row shape
  return ((results ?? []) as any[]).map((r) => ({
    slug: r.slug,
    title: r.title,
    section: r.section,
    snippet: makeSnippet(r.body, q),
  }));
}

// Lightweight metadata (NO body) — lets a gated route choose 404 vs sign-in prompt.
export async function getPageVisibility(
  db: D1Database,
  slug: string,
): Promise<{ title: string; visibility: Visibility } | null> {
  const row = await db
    .prepare(
      "SELECT title, visibility FROM pages p WHERE p.slug=? AND p.status='published' LIMIT 1",
    )
    .bind(slug)
    .first();
  return row ? (row as { title: string; visibility: Visibility }) : null;
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
  const row = await db
    .prepare(`SELECT ${PAGE_COLS} FROM pages p WHERE p.id=? LIMIT 1`)
    .bind(id)
    .first();
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
      .bind(
        input.slug,
        input.title,
        input.section,
        input.nav_label,
        input.sort,
        input.visibility,
        input.status,
        input.body,
        editorEmail,
        id,
      )
      .run();
    return id;
  }
  const res = await db
    .prepare(
      `INSERT INTO pages (slug, title, section, nav_label, sort, visibility, status, body, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.slug,
      input.title,
      input.section,
      input.nav_label,
      input.sort,
      input.visibility,
      input.status,
      input.body,
      editorEmail,
    )
    .run();
  return Number(res.meta.last_row_id);
}

/** Editor-only: delete a page and its group grants. Callers MUST gate on editor role. */
export async function deletePage(db: D1Database, id: number): Promise<void> {
  // Delete grants explicitly: SQLite only cascades when foreign_keys pragma is
  // on, which we don't rely on. Atomic via batch (implicit transaction).
  await db.batch([
    db.prepare("DELETE FROM page_groups WHERE page_id=?").bind(id),
    db.prepare("DELETE FROM pages WHERE id=?").bind(id),
  ]);
}

/** Editor-only: replace the group grants for a restricted page. */
export async function setPageGroups(
  db: D1Database,
  pageId: number,
  groupKeys: string[],
): Promise<void> {
  // Atomic (implicit transaction) — a partial failure must not silently drop a
  // page's grants and make it invisible to its intended readers.
  const stmts: D1PreparedStatement[] = [
    db.prepare("DELETE FROM page_groups WHERE page_id=?").bind(pageId),
  ];
  for (const key of groupKeys) {
    stmts.push(
      db
        .prepare(
          "INSERT OR IGNORE INTO page_groups (page_id, group_id) SELECT ?, id FROM groups WHERE key=?",
        )
        .bind(pageId, key),
    );
  }
  await db.batch(stmts);
}
