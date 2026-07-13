import assert from "node:assert/strict";
import { test } from "node:test";

const { buildLlmsIndex, buildLlmsFull, pageMarkdown, pageSummary, SITE_TITLE } = await import(
  "../src/lib/content/llms.ts"
);

// Builders take rows ALREADY canRead-filtered (getNavPages does the gating) —
// these tests cover the text shape; the ACL itself is covered in acl.test.mjs.
const ROWS = [
  {
    slug: "what-is-handbook",
    title: "What is the OSBR Handbook?",
    section: "About",
    nav_label: "What is Handbook?",
    sort: 10,
    visibility: "public",
    body: "The **handbook** explains everything.\n\nMore text.",
  },
  {
    slug: "style-guide",
    title: "Coding Style Guide",
    section: "Guideline",
    nav_label: "Style Guide",
    sort: 61,
    visibility: "public",
    body: "[[TOC]]\n\nShared rules for all languages.",
  },
  {
    slug: "strategy",
    title: "Strategy Overview",
    section: "About",
    nav_label: "Strategy",
    sort: 20,
    visibility: "internal",
    body: "Internal strategy notes.",
  },
];

test("index: title header, one section per group in row order, .md links", () => {
  const out = buildLlmsIndex(ROWS, "https://handbook.example");
  assert.ok(out.startsWith(`# ${SITE_TITLE}\n`));
  // sections in first-encounter order over the (sort-ordered) rows
  assert.ok(out.indexOf("## About") < out.indexOf("## Guideline"));
  assert.ok(out.includes("- [What is the OSBR Handbook?](https://handbook.example/what-is-handbook.md)"));
  assert.ok(out.includes("(https://handbook.example/style-guide.md)"));
});

test("index summaries are plain text (markdown/TOC noise stripped)", () => {
  const out = buildLlmsIndex(ROWS, "https://x");
  assert.ok(out.includes("The handbook explains everything."));
  assert.ok(!out.includes("**"));
  assert.ok(!out.includes("[[TOC]]"));
});

test("index contains exactly the rows given — the caller's ACL filter is the gate", () => {
  const publicOnly = ROWS.filter((r) => r.visibility === "public");
  const out = buildLlmsIndex(publicOnly, "https://x");
  assert.ok(!out.includes("Strategy Overview"));
  assert.ok(!out.includes("strategy.md"));
});

test("pageSummary truncates long bodies with an ellipsis", () => {
  const s = pageSummary(`${"word ".repeat(100)}end`, 40);
  assert.ok(s.length <= 41); // 40 + ellipsis
  assert.ok(s.endsWith("…"));
});

test("pageMarkdown restores the title H1 above the stored (H1-less) body", () => {
  assert.equal(
    pageMarkdown(ROWS[1]),
    "# Coding Style Guide\n\n[[TOC]]\n\nShared rules for all languages.\n",
  );
});

test("full: header + every page separated by ---", () => {
  const out = buildLlmsFull(ROWS);
  assert.ok(out.startsWith(`# ${SITE_TITLE}\n`));
  assert.equal(out.split("\n\n---\n\n").length, 1 + ROWS.length);
  assert.ok(out.includes("# Strategy Overview\n\nInternal strategy notes."));
});
