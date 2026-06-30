import { test } from "node:test";
import assert from "node:assert/strict";

const { searchPages } = await import("../src/lib/db/pages.ts");

// A minimal fake D1 that records the SQL + binds and returns rows we control,
// applying the visibility filter the way real SQLite would. This lets us assert
// the ACL property of searchPages without standing up a live D1 (mirrors how
// acl.test.mjs exercises readableWhere directly).
//
// Seeded-shaped rows: one public page (everyone), one internal page (logged-in
// only), one draft page (editor only).
const ROWS = [
  {
    slug: "code-of-conduct",
    title: "OSBR Code of Conduct",
    section: "People & Culture",
    body: "a respectful environment is a core security-adjacent value",
    visibility: "public",
    status: "published",
  },
  {
    slug: "security-policy",
    title: "Security Policy",
    section: "Policies",
    body: "Security Policy Standards for the whole company.",
    visibility: "internal",
    status: "published",
  },
  {
    slug: "secret-draft",
    title: "Draft Security Note",
    section: "Policies",
    body: "Unpublished draft about security.",
    visibility: "internal",
    status: "draft",
  },
];

function visibleTo(row, v) {
  if (!v) return row.status === "published" && row.visibility === "public";
  if (v.role === "editor") return true;
  if (row.status !== "published") return false;
  return row.visibility === "public" || row.visibility === "internal";
}

function fakeDb(visitor) {
  const captured = { sql: "", binds: [] };
  const stmt = {
    bind(...binds) {
      captured.binds = binds;
      return this;
    },
    async all() {
      // The LIKE term is the first bind; emulate the case-insensitive match +
      // the ACL filter that real SQL would apply.
      const like = String(captured.binds[0] ?? "")
        .replace(/\\/g, "")
        .replace(/%/g, "");
      const term = like.toLowerCase();
      const results = ROWS.filter(
        (r) =>
          (r.title.toLowerCase().includes(term) || r.body.toLowerCase().includes(term)) &&
          visibleTo(r, visitor),
      )
        // Mirror the SQL `ORDER BY rank` (title matches before body-only).
        .map((r) => ({ ...r, rank: r.title.toLowerCase().includes(term) ? 0 : 1 }))
        .sort((a, b) => a.rank - b.rank);
      return { results };
    },
  };
  return {
    captured,
    prepare(sql) {
      captured.sql = sql;
      return stmt;
    },
  };
}

test("empty / whitespace query returns [] (no DB hit)", async () => {
  const db = fakeDb(null);
  assert.deepEqual(await searchPages(db, "   ", null), []);
});

test("SQL gates the match through readableWhere (ACL clause present)", async () => {
  const db = fakeDb(null);
  await searchPages(db, "security", null);
  assert.match(db.captured.sql, /p\.title LIKE \? ESCAPE/);
  assert.match(db.captured.sql, /p\.body LIKE \? ESCAPE/);
  // anon ACL predicate is ANDed in
  assert.match(db.captured.sql, /status='published'/);
  assert.match(db.captured.sql, /visibility='public'/);
});

test("ACL: internal-only term hidden from anon, visible to reader & editor", async () => {
  const anon = await searchPages(fakeDb(null), "security", null);
  // "security" appears in the internal/draft pages and (here) the public body.
  // For anon, only the public page may surface.
  assert.deepEqual(
    anon.map((r) => r.slug),
    ["code-of-conduct"],
  );

  const reader = await searchPages(
    fakeDb({ email: "reader@osbrjp.com", role: "reader", groupIds: [] }),
    "Security Policy",
    {
      email: "reader@osbrjp.com",
      role: "reader",
      groupIds: [],
    },
  );
  assert.ok(reader.some((r) => r.slug === "security-policy"));
  // reader must NOT see the draft
  assert.ok(!reader.some((r) => r.slug === "secret-draft"));

  const editor = await searchPages(
    fakeDb({ email: "editor@osbrjp.com", role: "editor", groupIds: [] }),
    "security",
    {
      email: "editor@osbrjp.com",
      role: "editor",
      groupIds: [],
    },
  );
  // editor sees the draft too
  assert.ok(editor.some((r) => r.slug === "secret-draft"));
  assert.ok(editor.length > anon.length);
});

test("public term is found by everyone", async () => {
  for (const v of [
    null,
    { email: "reader@osbrjp.com", role: "reader", groupIds: [] },
    { email: "editor@osbrjp.com", role: "editor", groupIds: [] },
  ]) {
    const hits = await searchPages(fakeDb(v), "respectful", v);
    assert.ok(hits.some((r) => r.slug === "code-of-conduct"));
  }
});

test("title matches rank above body-only matches", async () => {
  // "Security" is in the title of security-policy/secret-draft and only the body
  // of code-of-conduct; for an editor, title hits should sort first.
  const v = { email: "editor@osbrjp.com", role: "editor", groupIds: [] };
  const hits = await searchPages(fakeDb(v), "security", v);
  // code-of-conduct (body-only) must not be first.
  assert.notEqual(hits[0].slug, "code-of-conduct");
});

test("reader's restricted binds flow through (no leak via missing binds)", async () => {
  const v = { email: "reader@osbrjp.com", role: "reader", groupIds: [3, 7] };
  const db = fakeDb(v);
  await searchPages(db, "security", v);
  // binds = [titleLike, titleLike, bodyLike, ...aclBinds(3,7), limit]
  assert.deepEqual(db.captured.binds.slice(3, 5), [3, 7]);
});
