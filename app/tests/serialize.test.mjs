import assert from "node:assert/strict";
import { test } from "node:test";

const { serializePageFile, isSafeSlug, stripLeadingH1 } = await import(
  "../src/lib/content/serialize.ts"
);

test("serializePageFile emits frontmatter + body (no status/groups — published means merged)", () => {
  const out = serializePageFile(
    {
      title: "Hello",
      section: "About",
      nav_label: "Hi",
      sort: 10,
      visibility: "public",
      updated_by: "octocat",
    },
    "Body text.",
  );
  assert.match(out, /^---\n/);
  assert.ok(out.includes(`title: ${JSON.stringify("Hello")}`));
  assert.ok(out.includes("visibility: public"));
  assert.ok(out.includes(`updated_by: ${JSON.stringify("octocat")}`));
  assert.ok(!out.includes("status:"));
  assert.ok(!out.includes("groups:"));
  // On-disk shape: `# H1` from the title between frontmatter and body (VitePress
  // renders it; the app strips it back out on load).
  assert.ok(out.includes("\n---\n\n# Hello\n\nBody text.\n"));
});

test("stripLeadingH1 undoes serializePageFile's H1 (load/save round-trip)", () => {
  const body = "[[TOC]]\n\n## Section\n\ntext";
  const fm = { title: "T", section: "S", nav_label: "", sort: 0, visibility: "internal" };
  const onDisk = serializePageFile(fm, body);
  const afterFm = onDisk.slice(onDisk.indexOf("\n---\n") + "\n---\n".length);
  assert.equal(stripLeadingH1(afterFm).trim(), body);
});

test("stripLeadingH1 leaves bodies without an H1 untouched (e.g. security-policy)", () => {
  const body = "no heading\n\ntext";
  assert.equal(stripLeadingH1(body), body);
});

test("stripLeadingH1 removes only the first H1, not one the author wrote in the body", () => {
  const out = stripLeadingH1("# Title\n\n# Author H1\n\ntext");
  assert.equal(out, "# Author H1\n\ntext");
});

test("scalars with colons/quotes are safely escaped", () => {
  const title = 'A: "quoted" title';
  const out = serializePageFile(
    { title, section: "S", nav_label: "", sort: 0, visibility: "internal" },
    "body",
  );
  assert.ok(out.includes(`title: ${JSON.stringify(title)}`)); // JSON-quoted => valid YAML
});

test("isSafeSlug blocks traversal, bad chars, and non-strings (runtime guard)", () => {
  for (const ok of ["a", "abc", "a-b-c", "page1", "on-boarding"]) {
    assert.equal(isSafeSlug(ok), true, `expected ok: ${ok}`);
  }
  for (const bad of ["", "-x", "../x", "a/b", "a.b", "Abc", "a_b", "a b", ".env", "x/../y"]) {
    assert.equal(isSafeSlug(bad), false, `expected blocked: ${bad}`);
  }
  for (const notStr of [null, undefined, 42, {}, ["a"]]) {
    assert.equal(isSafeSlug(notStr), false, `expected blocked non-string: ${String(notStr)}`);
  }
});
