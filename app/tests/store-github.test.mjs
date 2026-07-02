import { test } from "node:test";
import assert from "node:assert/strict";

const { createGithubStore, toBase64Utf8 } = await import("../src/lib/content/store.github.ts");

test("toBase64Utf8 survives multibyte content (btoa alone would corrupt it)", () => {
  const s = "## héllo 日本語 → ✓";
  assert.equal(Buffer.from(toBase64Utf8(s), "base64").toString("utf8"), s);
});

const FILE = {
  slug: "test-page",
  frontmatter: {
    title: "T",
    section: "S",
    nav_label: "T",
    sort: 0,
    visibility: "internal",
    groups: [],
    status: "draft",
  },
  body: "body",
};
const OPTS = { editor: "octocat", message: "Save T" };
const CFG = { token: "user-token", repo: "osbrjp/handbook", branch: "main" };

/** Records calls; getSha responses fed per-URL: existing -> {sha}, else 404. */
function recorder(existing = {}) {
  const calls = [];
  const fn = async (url, init = {}) => {
    const method = init.method ?? "GET";
    calls.push({ method, url: String(url), body: init.body ? JSON.parse(init.body) : null });
    if (method === "GET") {
      for (const [slug, sha] of Object.entries(existing)) {
        if (String(url).includes(`/${slug}.md`)) {
          return new Response(JSON.stringify({ sha }), { status: 200 });
        }
      }
      return new Response(null, { status: 404 });
    }
    return new Response(JSON.stringify({}), { status: 200 });
  };
  return { calls, fn };
}

test("throws without a user token (dev-shim session) — save.ts turns this into a 503", () => {
  assert.throws(() => createGithubStore({ repo: "o/r" }), /sign in/i);
  assert.throws(() => createGithubStore({ token: "t" }), /sign in/i);
});

test("write: NEW file -> PUT without sha, with branch + message + b64 content", async () => {
  const { calls, fn } = recorder();
  await createGithubStore(CFG, fn).write(FILE, OPTS);
  const put = calls.find((c) => c.method === "PUT");
  assert.ok(put.url.endsWith("/contents/app/src/content/pages/test-page.md"));
  assert.equal(put.body.sha, undefined);
  assert.equal(put.body.branch, "main");
  assert.equal(put.body.message, "Save T");
  assert.ok(Buffer.from(put.body.content, "base64").toString("utf8").includes("title:"));
});

test("write: EXISTING file -> PUT includes its sha (concurrent edits 409, not clobber)", async () => {
  const { calls, fn } = recorder({ "test-page": "abc123" });
  await createGithubStore(CFG, fn).write(FILE, OPTS);
  assert.equal(calls.find((c) => c.method === "PUT").body.sha, "abc123");
});

test("write: 409/422 from GitHub surfaces as an edit-conflict error", async () => {
  const fn = async (_url, init = {}) =>
    (init.method ?? "GET") === "GET"
      ? new Response(null, { status: 404 })
      : new Response(null, { status: 409 });
  await assert.rejects(() => createGithubStore(CFG, fn).write(FILE, OPTS), /conflict/i);
});

test("rename: writes the NEW path before deleting the old (never loses content)", async () => {
  const { calls, fn } = recorder({ "old-page": "oldsha" });
  await createGithubStore(CFG, fn).rename("old-page", FILE, OPTS);
  const mutations = calls.filter((c) => c.method !== "GET");
  assert.deepEqual(
    mutations.map((c) => [c.method, c.url.split("/").pop()]),
    [
      ["PUT", "test-page.md"],
      ["DELETE", "old-page.md"],
    ],
  );
  assert.equal(mutations[1].body.sha, "oldsha");
});

test("remove: missing file is a no-op (idempotent, like the local agent)", async () => {
  const { calls, fn } = recorder();
  await createGithubStore(CFG, fn).remove("gone", OPTS);
  assert.equal(calls.filter((c) => c.method === "DELETE").length, 0);
});
