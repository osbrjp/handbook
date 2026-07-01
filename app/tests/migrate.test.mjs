import { test } from "node:test";
import assert from "node:assert/strict";

const { extractTitle, stripLeadingH1, slugToTitle } = await import("../scripts/seed-content.mjs");

test("extractTitle reads the first H1", () => {
  assert.equal(extractTitle("# Strategy Overview\n\nbody", "strategy"), "Strategy Overview");
});

test("extractTitle falls back to a title-cased slug", () => {
  assert.equal(extractTitle("no heading here", "code-of-conduct"), "Code Of Conduct");
});

test("stripLeadingH1 removes the title line and keeps the body", () => {
  const out = stripLeadingH1("# Title\n\n[[TOC]]\n\n## Section");
  assert.ok(out.trimStart().startsWith("[[TOC]]"));
  assert.ok(!out.includes("# Title"));
});

test("stripLeadingH1 leaves bodies without an H1 untouched", () => {
  const body = "no heading\n\ntext";
  assert.equal(stripLeadingH1(body), body);
});

test("slugToTitle title-cases hyphenated slugs", () => {
  assert.equal(slugToTitle("sheq-policy"), "Sheq Policy");
});
