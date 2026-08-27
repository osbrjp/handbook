import { test } from "node:test";
import assert from "node:assert/strict";

// Search is a pure function over an in-memory row list (searchRows), ACL-
// filtered via canRead (public → anyone; internal → signed-in). Everything in
// the collection is published, so there is no draft dimension here.
const { searchRows } = await import("../src/lib/content/acl.ts");

const row = (o) => ({ nav_label: "", ...o });
const ROWS = [
  row({
    slug: "code-of-conduct",
    title: "OSBR Code of Conduct",
    section: "People & Culture",
    body: "a respectful environment is a core security-adjacent value",
    visibility: "public",
    sort: 10,
  }),
  row({
    slug: "security-policy",
    title: "Security Policy",
    section: "Policies",
    body: "Security Policy Standards for the whole company.",
    visibility: "internal",
    sort: 20,
  }),
];

const reader = { login: "rd", role: "reader" };
const editor = { login: "ed", role: "editor" };

test("empty / whitespace query returns []", () => {
  assert.deepEqual(searchRows(ROWS, "   ", reader), []);
});

test("ACL: internal term hidden from anon, only the public page surfaces", () => {
  const anon = searchRows(ROWS, "security", null).map((r) => r.slug);
  assert.deepEqual(anon, ["code-of-conduct"]);
});

test("signed-in visitors see public + internal — identically for every role", () => {
  const readerHits = searchRows(ROWS, "security", reader).map((r) => r.slug);
  const editorHits = searchRows(ROWS, "security", editor).map((r) => r.slug);
  assert.deepEqual(readerHits, editorHits);
  assert.ok(readerHits.includes("security-policy"));
});

test("public term is found by everyone", () => {
  for (const v of [null, reader, editor]) {
    assert.ok(searchRows(ROWS, "respectful", v).some((r) => r.slug === "code-of-conduct"));
  }
});

test("title matches rank above body-only matches", () => {
  const hits = searchRows(ROWS, "security", reader);
  assert.equal(hits[0].slug, "security-policy");
});

test("unknown visibility never surfaces (fail closed)", () => {
  const rows = [row({ slug: "odd", title: "Odd", section: "X", body: "findme", sort: 1 })];
  assert.equal(searchRows(rows, "findme", editor).length, 0);
});
