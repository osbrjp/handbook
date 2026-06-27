// Live verification of the reader-ACL enforcement engine against a running,
// freshly-bootstrapped Directus. It (a) creates the Reader/Editor/Restricted
// policies + roles + test users via the API — which also AUTOMATES the otherwise
// manual policy setup — and (b) runs the acceptance matrix as each actor using
// THEIR OWN token. No Google needed: Google is only the identity source; this
// proves the server-side enforcement. Exits non-zero if any check fails.
//
// Run ONCE against a fresh stack (after `docker compose up` + `bootstrap.mjs`):
//   node --env-file=directus/.env directus/verify-acl.mjs
// To re-run, reset first: cd directus && docker compose down -v && up -d,
// then re-run bootstrap.mjs and this script.
const BASE = "http://localhost:8055";
const PW = "Passw0rd!verify";

const admin = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);

async function login(email, password) {
  const r = await fetch(`${BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error(`login ${email}: ${r.status} ${await r.text()}`);
  return (await r.json()).data.access_token;
}
async function call(token, method, path, body) {
  const r = await fetch(`${BASE}${path}`, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  return { ok: r.ok, status: r.status, data: txt ? JSON.parse(txt).data : null };
}
async function must(token, method, path, body) {
  const r = await call(token, method, path, body);
  if (!r.ok) throw new Error(`${method} ${path}: ${r.status}`);
  return r.data;
}

// --- find the built-in public policy ---
const access = await must(admin, "GET", "/access?fields=id,role,user,policy.id,policy.name");
const publicPolicyId = access.find((a) => a.role === null && a.user === null)?.policy?.id;
if (!publicPolicyId) throw new Error("public policy not found");

// --- policies ---
const readerPol = await must(admin, "POST", "/policies", { name: "Reader", app_access: true });
const editorPol = await must(admin, "POST", "/policies", { name: "Editor", app_access: true });
const restrictedPol = await must(admin, "POST", "/policies", { name: "Restricted", app_access: true });

// --- permissions ---
const perm = (policy, action, rule) => ({ policy, collection: "pages", action, fields: ["*"], permissions: rule });
await must(admin, "POST", "/permissions", perm(publicPolicyId, "read", { visibility: { _eq: "public" } }));
await must(admin, "POST", "/permissions", perm(readerPol.id, "read", { visibility: { _in: ["public", "internal"] } }));
await must(admin, "POST", "/permissions", perm(restrictedPol.id, "read", { visibility: { _eq: "restricted" } }));
await must(admin, "POST", "/permissions", perm(editorPol.id, "read", {}));
await must(admin, "POST", "/permissions", perm(editorPol.id, "update", {}));

// --- roles + attach policies ---
const readerRole = await must(admin, "POST", "/roles", { name: "Reader" });
const editorRole = await must(admin, "POST", "/roles", { name: "Editor" });
await must(admin, "POST", "/access", { role: readerRole.id, policy: readerPol.id });
await must(admin, "POST", "/access", { role: editorRole.id, policy: editorPol.id });

// --- users ---
const mkUser = (email, role) => must(admin, "POST", "/users", { email, password: PW, role, status: "active" });
const uReader = await mkUser("reader@example.com", readerRole.id);
const uRestricted = await mkUser("restricted@example.com", readerRole.id);
const uEditor = await mkUser("editor@example.com", editorRole.id);
// give the restricted user the Restricted policy directly (union with Reader role)
await must(admin, "POST", "/access", { user: uRestricted.id, policy: restrictedPol.id });

// --- tokens ---
const tReader = await login("reader@example.com", PW);
const tRestricted = await login("restricted@example.com", PW);
const tEditor = await login("editor@example.com", PW);

// --- matrix: what slugs each actor can read, grouped by visibility ---
async function visibleByVis(token) {
  const path = "/items/pages?fields=slug,visibility&limit=-1";
  const r = token ? await call(token, "GET", path) : await (await fetch(`${BASE}${path}`)).json().then((j) => ({ ok: true, data: j.data }));
  const rows = r.data || [];
  const by = { public: 0, internal: 0, restricted: 0 };
  for (const p of rows) by[p.visibility] = (by[p.visibility] || 0) + 1;
  return by;
}

const actors = { anonymous: null, reader: tReader, "restricted-user": tRestricted, editor: tEditor };
console.log("\n=== READER-ACL MATRIX (count of pages visible, by visibility) ===");
const result = {};
for (const [name, tok] of Object.entries(actors)) result[name] = await visibleByVis(tok);
console.table(result);

// --- expectations ---
const expect = {
  anonymous: { public: 2, internal: 0, restricted: 0 },
  reader: { public: 2, internal: 7, restricted: 0 },
  "restricted-user": { public: 2, internal: 7, restricted: 1 },
  editor: { public: 2, internal: 7, restricted: 1 },
};
let pass = true;
for (const a of Object.keys(expect)) {
  for (const v of ["public", "internal", "restricted"]) {
    const got = result[a][v] || 0, exp = expect[a][v];
    if (got !== exp) { pass = false; console.log(`FAIL ${a}.${v}: got ${got}, expected ${exp}`); }
  }
}

// --- editor RBAC: editor can update, reader cannot ---
const aPage = (await must(admin, "GET", "/items/pages?fields=id&limit=1"))[0].id;
const editorUpd = await call(tEditor, "PATCH", `/items/pages/${aPage}`, { nav_label: "Edited By Editor" });
const readerUpd = await call(tReader, "PATCH", `/items/pages/${aPage}`, { nav_label: "Should Fail" });
console.log(`\nEditor update: ${editorUpd.status} (expect 200)`);
console.log(`Reader update: ${readerUpd.status} (expect 403)`);
if (editorUpd.status !== 200) { pass = false; console.log("FAIL: editor could not update"); }
if (readerUpd.ok) { pass = false; console.log("FAIL: reader was able to update (RBAC breach!)"); }

// --- existence: restricted slug fetched by reader returns nothing ---
const restrictedSlug = "security-policy";
const asReader = await call(tReader, "GET", `/items/pages?filter[slug][_eq]=${restrictedSlug}`);
console.log(`\nReader fetch restricted slug '${restrictedSlug}': ${(asReader.data || []).length} rows (expect 0)`);
if ((asReader.data || []).length !== 0) { pass = false; console.log("FAIL: reader saw a restricted page (LEAK!)"); }

console.log(`\n${pass ? "ALL ACL CHECKS PASSED ✅" : "SOME CHECKS FAILED ❌"}`);
process.exit(pass ? 0 : 1);
