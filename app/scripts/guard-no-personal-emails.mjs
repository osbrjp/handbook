#!/usr/bin/env node
// guard-no-personal-emails.mjs — THIS REPO IS PUBLIC. No personal email address
// may ever be committed: identity is GitHub usernames (auth) and access lives
// in GitHub's own settings, so nothing in the codebase needs a person's email.
// This guard fails CI if any company-domain address other than the allowlisted
// FUNCTION addresses appears in a tracked file. Runs as part of `pnpm guard`.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url)); // app/scripts
const repoRoot = path.resolve(here, "..", ".."); // repo root

// Function addresses (org-level, already public), NOT people:
//   handbook@ — git author of editor commits;  info@ — public company contact
const ALLOWED = new Set(["handbook@osbrjp.com", "info@osbrjp.com"]);
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@(?:osbrjp\.com|oz-design\.jp)/g;

const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: repoRoot, encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const violations = [];
for (const rel of tracked) {
  let text;
  try {
    text = readFileSync(path.join(repoRoot, rel), "utf8");
  } catch {
    continue; // unreadable/binary — not a place emails hide as text
  }
  if (text.includes("\0")) continue; // binary
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(EMAIL_RE)) {
      if (!ALLOWED.has(m[0].toLowerCase())) {
        violations.push(`${rel}:${i + 1}  ${m[0]}`);
      }
    }
  }
}

if (violations.length) {
  console.error("guard-no-personal-emails FAILED — personal email(s) in tracked files:");
  for (const v of violations) console.error(`  ${v}`);
  console.error(
    "\nThis repo is PUBLIC. Remove the address (identity is GitHub usernames; access is managed in GitHub settings).",
  );
  process.exit(1);
}
console.log(`guard-no-personal-emails OK (${tracked.length} files)`);
