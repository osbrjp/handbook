#!/usr/bin/env node
// Bootstrap the Directus `pages` collection and import the migrated handbook
// content. Pure `fetch` against the Directus REST API — no SDK dependency, so it
// runs with plain Node from anywhere.
//
// Run AFTER `docker compose up` (compose creates the admin from ADMIN_EMAIL/
// ADMIN_PASSWORD). Idempotent: skips the collection if it exists and only
// inserts pages whose slug isn't already present.
//
// Roles & policies are set up MANUALLY via the Directus UI — see
// directus/README.md. The v11 policy API is version-sensitive, so we document
// the click-path rather than ship untested, plausible-but-wrong automation.
//
// Usage:
//   node directus/bootstrap.mjs
//   DIRECTUS_URL=http://localhost:8055 ADMIN_EMAIL=admin@example.com \
//     ADMIN_PASSWORD=change-me-admin node directus/bootstrap.mjs

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.DIRECTUS_URL || "http://localhost:8055";
const EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "change-me-admin";

async function api(token, method, endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${endpoint} -> ${res.status}: ${text}`);
  return text ? JSON.parse(text).data : null;
}

async function login() {
  const data = await api(null, "POST", "/auth/login", { email: EMAIL, password: PASSWORD });
  return data.access_token;
}

async function collectionExists(token, name) {
  try {
    await api(token, "GET", `/collections/${name}`);
    return true;
  } catch {
    return false;
  }
}

const PAGES_COLLECTION = {
  collection: "pages",
  meta: { icon: "article", note: "Handbook pages", sort_field: "sort" },
  schema: { name: "pages" },
  fields: [
    { field: "id", type: "integer", schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true } },
    { field: "status", type: "string", schema: { default_value: "published" }, meta: { interface: "select-dropdown", options: { choices: [{ text: "Published", value: "published" }, { text: "Draft", value: "draft" }] }, width: "half" } },
    { field: "sort", type: "integer", meta: { interface: "input", hidden: true } },
    { field: "title", type: "string", meta: { interface: "input", width: "full" } },
    { field: "slug", type: "string", schema: { is_unique: true }, meta: { interface: "input", width: "half" } },
    { field: "section", type: "string", meta: { interface: "input", width: "half" } },
    { field: "nav_label", type: "string", meta: { interface: "input", width: "half" } },
    { field: "visibility", type: "string", schema: { default_value: "internal" }, meta: { interface: "select-dropdown", width: "half", options: { choices: [{ text: "Public", value: "public" }, { text: "Internal", value: "internal" }, { text: "Restricted", value: "restricted" }] } } },
    { field: "body", type: "text", meta: { interface: "input-rich-text-md", width: "full", note: "Markdown. Supports ::: callouts, [[TOC]] and ```mermaid``` blocks." } },
  ],
};

async function main() {
  const token = await login();
  console.log(`Logged in to ${BASE} as ${EMAIL}.`);

  if (await collectionExists(token, "pages")) {
    console.log("Collection 'pages' already exists — skipping creation.");
  } else {
    await api(token, "POST", "/collections", PAGES_COLLECTION);
    console.log("Created collection 'pages'.");
  }

  const seed = JSON.parse(await readFile(path.join(here, "seed", "pages.json"), "utf8"));
  // Drop the allowed_groups placeholder — the POC models the restricted level
  // via a hand-attached policy, not an M2M (see README).
  const items = seed.map(({ allowed_groups, ...rest }) => rest);

  const existing = (await api(token, "GET", "/items/pages?fields=slug&limit=-1")) || [];
  const have = new Set(existing.map((p) => p.slug));
  const toInsert = items.filter((p) => !have.has(p.slug));

  if (toInsert.length) {
    await api(token, "POST", "/items/pages", toInsert);
    console.log(`Imported ${toInsert.length} pages (${items.length - toInsert.length} already present).`);
  } else {
    console.log("All seed pages already present — nothing to import.");
  }

  console.log("\nNext steps (manual, see directus/README.md):");
  console.log("  1. Create Reader + Editor roles and the three read policies.");
  console.log("  2. Paste the Reader role UUID into directus/.env (READER_ROLE_ID) and restart.");
  console.log("  3. Create a Google OAuth client and fill AUTH_GOOGLE_* in directus/.env.");
}

main().catch((e) => {
  console.error("Bootstrap failed:\n ", e.message);
  process.exit(1);
});
