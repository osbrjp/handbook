import { test } from "node:test";
import assert from "node:assert/strict";

// Search is now a pure function over an in-memory row list (searchRows), ACL-
// filtered via canRead. No DB harness needed — feed it rows directly.
const { searchRows } = await import("../src/lib/content/acl.ts");

const row = (o) => ({ nav_label: "", groups: [], ...o });
const ROWS = [
  row({
    slug: "code-of-conduct",
    title: "OSBR Code of Conduct",
    section: "People & Culture",
    body: "a respectful environment is a core security-adjacent value",
    visibility: "public",
    status: "published",
    sort: 10,
  }),
  row({
    slug: "security-policy",
    title: "Security Policy",
    section: "Policies",
    body: "Security Policy Standards for the whole company.",
    visibility: "internal",
    status: "published",
    sort: 20,
  }),
  row({
    slug: "secret-draft",
    title: "Draft Note",
    section: "Policies",
    body: "Unpublished draft about security.",
    visibility: "internal",
    status: "draft",
    sort: 30,
  }),
];

const reader = (keys = []) => ({ email: "r@osbrjp.com", role: "reader", groupKeys: keys });
const editor = { email: "e@osbrjp.com", role: "editor", groupKeys: [] };

test("empty / whitespace query returns []", () => {
  assert.deepEqual(searchRows(ROWS, "   ", reader()), []);
});

test("ACL: internal term hidden from anon, only the public page surfaces", () => {
  const anon = searchRows(ROWS, "security", null).map((r) => r.slug);
  assert.deepEqual(anon, ["code-of-conduct"]);
});

test("reader sees public + internal (published) but NOT drafts", () => {
  const hits = searchRows(ROWS, "security", reader()).map((r) => r.slug);
  assert.ok(hits.includes("code-of-conduct"));
  assert.ok(hits.includes("security-policy"));
  assert.ok(!hits.includes("secret-draft"));
});

test("editor sees drafts too", () => {
  const hits = searchRows(ROWS, "security", editor).map((r) => r.slug);
  assert.ok(hits.includes("secret-draft"));
  assert.ok(hits.length > searchRows(ROWS, "security", null).length);
});

test("public term is found by everyone", () => {
  for (const v of [null, reader(), editor]) {
    assert.ok(searchRows(ROWS, "respectful", v).some((r) => r.slug === "code-of-conduct"));
  }
});

test("title matches rank above body-only matches", () => {
  // "security": title of security-policy vs body-only of code-of-conduct.
  const hits = searchRows(ROWS, "security", editor);
  assert.equal(hits[0].slug, "security-policy");
  assert.notEqual(hits[0].slug, "code-of-conduct");
});

test("restricted page needs a matching group key", () => {
  const rows = [
    row({
      slug: "board",
      title: "Board Notes",
      section: "Policies",
      body: "leadership only",
      visibility: "restricted",
      status: "published",
      groups: ["leadership"],
      sort: 40,
    }),
  ];
  assert.equal(searchRows(rows, "board", reader()).length, 0);
  assert.equal(searchRows(rows, "board", reader(["leadership"])).length, 1);
});
