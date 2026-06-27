import { test } from "node:test";
import assert from "node:assert/strict";

// markdown.ts is TypeScript; Node strips types on import (Node 23.6+).
const { renderMarkdown } = await import("../src/lib/markdown.ts");

test("::: admonition becomes a titled callout", () => {
  const html = renderMarkdown(":::info Heads up\nBe careful here.\n:::");
  assert.match(html, /class="callout callout-info"/);
  assert.match(html, /class="callout-title"/);
  assert.match(html, /Heads up/);
  assert.match(html, /Be careful here\./);
});

test("unknown admonition type falls back to note", () => {
  const html = renderMarkdown(":::wat\nhi\n:::");
  assert.match(html, /callout-note/);
});

// The handbook's real content uses the SPACED form `::: type Label` — the most
// common shape (M1). These must render as callouts, not literal text.
test("spaced '::: type Label' admonition renders as a callout", () => {
  const html = renderMarkdown("::: warning Notice\nBody text.\n:::");
  assert.match(html, /class="callout callout-warning"/);
  assert.match(html, /Notice/);
  assert.match(html, /Body text\./);
  assert.doesNotMatch(html, /::: warning/);
});

test("bare '::: type' (spaced, no label) renders as a callout", () => {
  const html = renderMarkdown("::: tip\nJust a tip.\n:::");
  assert.match(html, /class="callout callout-tip"/);
  assert.match(html, /Just a tip\./);
  assert.doesNotMatch(html, /::: tip/);
});

test("[[TOC]] becomes a nav of h2/h3 with matching anchors", () => {
  const html = renderMarkdown("[[TOC]]\n\n## First Thing\n\n### A Sub\n\n## Second Thing");
  assert.match(html, /<nav class="toc">/);
  assert.match(html, /href="#first-thing"/);
  assert.match(html, /href="#a-sub"/);
  assert.match(html, /href="#second-thing"/);
  // anchors must match the ids rehype-slug assigns to the headings
  assert.match(html, /id="first-thing"/);
});

test("```mermaid fence becomes a .mermaid div (not a code block)", () => {
  const html = renderMarkdown("```mermaid\ngraph TD; A-->B;\n```");
  assert.match(html, /<div class="mermaid">/);
  assert.doesNotMatch(html, /language-mermaid/);
});

test("gfm tables and heading ids work", () => {
  const html = renderMarkdown("## Hello World\n\n| a | b |\n|---|---|\n| 1 | 2 |");
  assert.match(html, /id="hello-world"/);
  assert.match(html, /<table>/);
});

test("empty input does not throw", () => {
  assert.equal(typeof renderMarkdown(""), "string");
});
