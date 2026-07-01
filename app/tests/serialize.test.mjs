import assert from "node:assert/strict";
import { test } from "node:test";

const { serializePageFile, isSafeSlug } = await import("../src/lib/content/serialize.ts");

test("serializePageFile emits frontmatter + body", () => {
  const out = serializePageFile(
    {
      title: "Hello",
      section: "About",
      nav_label: "Hi",
      sort: 10,
      visibility: "public",
      groups: [],
      status: "published",
    },
    "Body text.",
  );
  assert.match(out, /^---\n/);
  assert.ok(out.includes(`title: ${JSON.stringify("Hello")}`));
  assert.ok(out.includes("visibility: public"));
  assert.ok(out.includes("status: published"));
  assert.ok(out.includes("groups: []"));
  assert.ok(out.includes("\n---\n\nBody text.\n"));
});

test("scalars with colons/quotes are safely escaped", () => {
  const title = 'A: "quoted" title';
  const out = serializePageFile(
    {
      title,
      section: "S",
      nav_label: "",
      sort: 0,
      visibility: "internal",
      groups: ["leadership", "hr"],
      status: "draft",
    },
    "body",
  );
  assert.ok(out.includes(`title: ${JSON.stringify(title)}`)); // JSON-quoted => valid YAML
  assert.ok(out.includes('groups:\n  - "leadership"\n  - "hr"'));
});

test("isSafeSlug blocks traversal and bad chars", () => {
  for (const ok of ["a", "abc", "a-b-c", "page1", "on-boarding"]) {
    assert.equal(isSafeSlug(ok), true, `expected ok: ${ok}`);
  }
  for (const bad of ["", "-x", "../x", "a/b", "a.b", "Abc", "a_b", "a b", ".env", "x/../y"]) {
    assert.equal(isSafeSlug(bad), false, `expected blocked: ${bad}`);
  }
});
