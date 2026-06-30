#!/usr/bin/env node
// CI guardrail against cross-request identity bleed (the #1 risk on Workers,
// where module scope persists across requests).
//
//   Rule 1: the `cloudflare:workers` `env` (bindings + secrets) may be imported
//           ONLY in middleware + the auth routes. Everything else must use the
//           per-request `Astro.locals.db` / `Astro.locals.visitor`.
//   Rule 2: no MODULE-SCOPE capture of a binding (e.g. `const db = env.DB` at
//           top level) — bindings must be read per request, never cached.
//
// Run: node scripts/guard-no-module-client.mjs   (pnpm guard)

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");

const ENV_IMPORT_ALLOWED = new Set([
  "middleware.ts",
  path.join("pages", "api", "auth", "login.ts"),
  path.join("pages", "api", "auth", "callback.ts"),
  path.join("pages", "api", "auth", "dev-login.ts"),
]);

const CF_IMPORT = 'from "cloudflare:workers"';
// top-level (no indentation) `const|let|var NAME = env.` => module-scoped capture
const MODULE_CAPTURE = /^(export\s+)?(const|let|var)\s+\w+\s*=\s*env\./m;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(ts|astro|mjs|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

const violations = [];
for (const file of await walk(srcDir)) {
  const rel = path.relative(srcDir, file);
  const text = await readFile(file, "utf8");
  if (text.includes(CF_IMPORT) && !ENV_IMPORT_ALLOWED.has(rel)) {
    violations.push(
      `${rel}: imports cloudflare:workers env — use Astro.locals.db / locals.visitor instead`,
    );
  }
  if (MODULE_CAPTURE.test(text)) {
    violations.push(
      `${rel}: module-scoped binding capture (const X = env.…) — read bindings per request`,
    );
  }
}

if (violations.length) {
  console.error("guard-no-module-client FAILED:");
  for (const v of violations) console.error("  - " + v);
  process.exit(1);
}
console.log("guard-no-module-client OK");
