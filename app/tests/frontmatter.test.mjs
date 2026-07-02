import assert from "node:assert/strict";
import { test } from "node:test";

// Round-trip: what serialize.ts writes, frontmatter.ts must read back — this
// is how a draft resumes from its edit branch.
const { serializePageFile } = await import("../src/lib/content/serialize.ts");
const { parsePageFile } = await import("../src/lib/content/frontmatter.ts");

const FM = {
  title: 'A: "tricky" title',
  section: "People & Culture",
  nav_label: "Tricky",
  sort: 30,
  visibility: "public",
  updated_by: "octocat",
  updated_at: "2026-07-02T00:00:00.000Z",
};

test("parsePageFile round-trips serializePageFile exactly", () => {
  const body = "## héllo 日本語\n\nsecond paragraph with --- inside text\n";
  const out = parsePageFile(serializePageFile(FM, body));
  assert.ok(out);
  assert.deepEqual(out.frontmatter, FM);
  assert.equal(out.body.trim(), body.trim());
});

test("missing optional fields come back undefined; visibility fails closed to internal", () => {
  const out = parsePageFile(
    serializePageFile(
      { title: "T", section: "S", nav_label: "", sort: 0, visibility: "internal" },
      "b",
    ),
  );
  assert.ok(out);
  assert.equal(out.frontmatter.updated_by, undefined);
  assert.equal(out.frontmatter.visibility, "internal");
  // a tampered/unknown visibility parses as the TIGHTEST tier
  const tampered = parsePageFile('---\ntitle: "T"\nsection: "S"\nvisibility: everyone\n---\n\nb\n');
  assert.equal(tampered?.frontmatter.visibility, "internal");
});

test("fails closed (null) on malformed input", () => {
  assert.equal(parsePageFile("no frontmatter at all"), null);
  assert.equal(parsePageFile("---\ntitle: unquoted string\n---\n\nb"), null); // not our format
  assert.equal(parsePageFile('---\nsection: "S"\n---\n\nb'), null); // title missing
  assert.equal(parsePageFile('---\ntitle: "T"\nsection: "S"\ngroups:\n  - "x"\n---\nb'), null); // legacy multi-line
});
