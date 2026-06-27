#!/usr/bin/env node
// CI guardrail for the #1 leak risk (red-team R1): a module-scoped Directus
// client shares one auth state across concurrent SSR requests and bleeds one
// visitor's identity into another's.
//
//   Rule 1: `createDirectus(` may ONLY appear in src/lib/directus.ts.
//   Rule 2: the SDK's stateful auto-refresh client (the composable whose name
//           is "authentication", called as a function) is banned everywhere in
//           src — we forward the visitor's session cookie per request instead.
//
// Run: node scripts/guard-no-module-client.mjs   (pnpm guard)

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const ALLOWED_CREATE = path.join("lib", "directus.ts");
const BANNED_AUTH = "authentication" + "(";
const CREATE_CALL = "createDirectus" + "(";

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
  if (text.includes(BANNED_AUTH)) {
    violations.push(`${rel}: stateful SDK auth client is banned (shared across requests)`);
  }
  if (text.includes(CREATE_CALL) && rel !== ALLOWED_CREATE) {
    violations.push(`${rel}: build Directus clients only in src/${ALLOWED_CREATE}`);
  }
}

if (violations.length) {
  console.error("guard-no-module-client FAILED:");
  for (const v of violations) console.error("  - " + v);
  process.exit(1);
}
console.log("guard-no-module-client OK");
