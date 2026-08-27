import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// The H1 boundary (strip on load / re-add on save, serialize.ts) is only
// correct if EVERY content file leads with an ATX `# H1` equal to its
// frontmatter title — otherwise pages render double titles and an editor save
// rewrites the heading. doc/security-policy.md violated this once (setext H1,
// mismatched title); this guards the whole corpus so it can't recur.
const DOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "doc");
const files = readdirSync(DOC).filter((f) => f.endsWith(".md") && f !== "index.md");

test("every doc/*.md body leads with `# {title}` (H1 round-trip invariant)", () => {
  assert.ok(files.length > 0, "no content files found — wrong DOC path?");
  for (const f of files) {
    const raw = readFileSync(join(DOC, f), "utf8");
    const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(fm, `${f}: missing frontmatter`);
    const title = fm[1].match(/^title:\s*"(.*)"\s*$/m)?.[1];
    assert.ok(title, `${f}: missing quoted title`);
    const body = raw.slice(fm[0].length).replace(/^\s+/, "");
    assert.ok(
      body.startsWith(`# ${title}\n`),
      `${f}: body must start with \`# ${title}\` (found: ${JSON.stringify(body.split("\n")[0])})`,
    );
    const second = body.split("\n")[2] ?? "";
    assert.ok(!/^=+\s*$/.test(second), `${f}: setext H1 detected — use ATX (#)`);
  }
});
