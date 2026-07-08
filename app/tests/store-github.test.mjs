import { test } from "node:test";
import assert from "node:assert/strict";

const { createGithubStore, toBase64Utf8 } = await import("../src/lib/content/store.github.ts");

test("toBase64Utf8 survives multibyte content (btoa alone would corrupt it)", () => {
  const s = "## héllo 日本語 → ✓";
  assert.equal(Buffer.from(toBase64Utf8(s), "base64").toString("utf8"), s);
});

const FILE = {
  slug: "test-page",
  frontmatter: { title: "T", section: "S", nav_label: "T", sort: 0, visibility: "internal" },
  body: "body",
};
const OPTS = { editor: "octocat", message: "Save T", submit: true }; // "Submit for approval"
const DRAFT = { editor: "octocat", message: "Draft T", submit: false }; // "Save draft"
const DIRECT = { token: "user-token", repo: "osbrjp/handbook", branch: "main", mode: "direct" };
const PR = { token: "user-token", repo: "osbrjp/handbook", branch: "main", mode: "pr" };

/**
 * Scriptable GitHub API mock. State:
 *  files: {slug: sha} on any branch (contents GET)
 *  branches: Set of existing branch names (git/ref GET)
 *  openPrs: array of {number, html_url} returned for pull list
 *  compareStatus: what base...editBranch compare reports ("behind" = no unique
 *    commits [merged leftover]; "ahead" = orphaned commits from a failed PR)
 */
function mockApi({ files = {}, branches = ["main"], openPrs = [], compareStatus = "behind" } = {}) {
  const calls = [];
  const fn = async (url, init = {}) => {
    const method = init.method ?? "GET";
    const u = String(url);
    calls.push({ method, url: u, body: init.body ? JSON.parse(init.body) : null });

    if (method === "GET" && u.includes("/pulls?")) {
      return new Response(JSON.stringify(openPrs), { status: 200 });
    }
    if (method === "GET" && u.includes("/compare/")) {
      return new Response(JSON.stringify({ status: compareStatus }), { status: 200 });
    }
    if (method === "GET" && u.includes("/git/ref/")) {
      const name = decodeURIComponent(u.split("/git/ref/")[1]).replace(/^heads\//, "");
      return branches.includes(name)
        ? new Response(JSON.stringify({ object: { sha: `sha-of-${name}` } }), { status: 200 })
        : new Response(null, { status: 404 });
    }
    if (method === "POST" && u.endsWith("/git/refs")) {
      return new Response(JSON.stringify({}), { status: 201 });
    }
    if (method === "PATCH" && u.includes("/git/refs/")) {
      return new Response(JSON.stringify({}), { status: 200 });
    }
    if (method === "POST" && u.endsWith("/pulls")) {
      return new Response(
        JSON.stringify({ number: 42, html_url: "https://github.com/x/pull/42" }),
        {
          status: 201,
        },
      );
    }
    if (method === "GET" && u.includes("/contents/")) {
      for (const [slug, sha] of Object.entries(files)) {
        if (u.includes(`/${slug}.md`)) {
          return new Response(JSON.stringify({ sha }), { status: 200 });
        }
      }
      return new Response(null, { status: 404 });
    }
    return new Response(JSON.stringify({}), { status: 200 }); // PUT/DELETE contents
  };
  return { calls, fn };
}

test("throws without a user token (dev-shim session) — save.ts turns this into a 503", () => {
  assert.throws(() => createGithubStore({ repo: "o/r" }), /sign in/i);
  assert.throws(() => createGithubStore({ token: "t" }), /sign in/i);
});

// ---------- direct mode ----------

test("direct: NEW file -> PUT without sha, on the base branch", async () => {
  const { calls, fn } = mockApi();
  const result = await createGithubStore(DIRECT, fn).write(FILE, OPTS);
  assert.equal(result, undefined); // no review created
  const put = calls.find((c) => c.method === "PUT");
  assert.ok(put.url.endsWith("/contents/app/src/content/pages/test-page.md"));
  assert.equal(put.body.sha, undefined);
  assert.equal(put.body.branch, "main");
  assert.ok(Buffer.from(put.body.content, "base64").toString("utf8").includes("title:"));
});

test("direct: EXISTING file -> PUT includes its sha (concurrent edits 409, not clobber)", async () => {
  const { calls, fn } = mockApi({ files: { "test-page": "abc123" } });
  await createGithubStore(DIRECT, fn).write(FILE, OPTS);
  assert.equal(calls.find((c) => c.method === "PUT").body.sha, "abc123");
});

test("direct: 409/422 from GitHub surfaces as an edit-conflict error", async () => {
  const fn = async (_url, init = {}) =>
    (init.method ?? "GET") === "GET"
      ? new Response(null, { status: 404 })
      : new Response(null, { status: 409 });
  await assert.rejects(() => createGithubStore(DIRECT, fn).write(FILE, OPTS), /conflict/i);
});

test("direct: rename writes the NEW path before deleting the old (never loses content)", async () => {
  const { calls, fn } = mockApi({ files: { "old-page": "oldsha" } });
  await createGithubStore(DIRECT, fn).rename("old-page", FILE, OPTS);
  const mutations = calls.filter((c) => !["GET"].includes(c.method));
  assert.deepEqual(
    mutations.map((c) => [c.method, c.url.split("/").pop()]),
    [
      ["PUT", "test-page.md"],
      ["DELETE", "old-page.md"],
    ],
  );
  assert.equal(mutations[1].body.sha, "oldsha");
});

test("direct: removing a missing file is a no-op (idempotent, like the local agent)", async () => {
  const { calls, fn } = mockApi();
  await createGithubStore(DIRECT, fn).remove("gone", OPTS);
  assert.equal(calls.filter((c) => c.method === "DELETE").length, 0);
});

// ---------- base-branch auto-resolution ----------

test("resolveBase: configured branch wins while it exists; auto-falls back to main once deleted", async () => {
  const { resolveBase } = await import("../src/lib/content/store.github.ts");
  const cfg = (branch) => ({ token: "t", repo: "o/r", branch });
  const exists = async () => new Response(JSON.stringify({}), { status: 200 });
  const gone = async () => new Response(null, { status: 404 });

  assert.equal(await resolveBase(cfg("i68-handbook-poc"), exists), "i68-handbook-poc");
  assert.equal(await resolveBase(cfg("i68-handbook-poc"), gone), "main"); // merged+deleted
  assert.equal(await resolveBase(cfg(undefined), exists), "main"); // unset → main, no API call
  assert.equal(await resolveBase(cfg("main"), gone), "main"); // main is main
});

// ---------- pr mode: DRAFTS (submit: false) ----------

test("draft: commits to handbook/<slug> but does NOT open a review", async () => {
  const { calls, fn } = mockApi();
  const result = await createGithubStore(PR, fn).write(FILE, DRAFT);
  assert.deepEqual(result, { draftSaved: true });
  assert.ok(calls.find((c) => c.method === "PUT")); // the commit happened
  assert.equal(
    calls.filter((c) => c.method === "POST" && c.url.endsWith("/pulls")).length,
    0, // no PR
  );
});

test("draft while a review is ALREADY open: the commit joins the pending review", async () => {
  const { calls, fn } = mockApi({
    branches: ["main", "handbook/test-page"],
    openPrs: [{ number: 7, html_url: "https://github.com/x/pull/7" }],
  });
  const result = await createGithubStore(PR, fn).write(FILE, DRAFT);
  assert.deepEqual(result, { reviewNumber: 7, reviewUrl: "https://github.com/x/pull/7" });
  assert.equal(calls.filter((c) => c.method === "POST").length, 0); // reuse, never create
});

test("draft commits are preserved by the next save (branch ahead → no reset)", async () => {
  const { calls, fn } = mockApi({
    branches: ["main", "handbook/test-page"],
    openPrs: [],
    compareStatus: "ahead", // prior draft commits
  });
  const result = await createGithubStore(PR, fn).write(FILE, OPTS); // now submitting
  assert.equal(calls.filter((c) => c.method === "PATCH").length, 0); // drafts not reset
  assert.equal(result.reviewNumber, 42); // review carries the drafts + this commit
});

// ---------- pr mode: SUBMIT for approval (submit: true) ----------

test("pr: first save creates branch handbook/<slug> from base head, commits there, opens a PR", async () => {
  const { calls, fn } = mockApi();
  const result = await createGithubStore(PR, fn).write(FILE, OPTS);
  assert.deepEqual(result, { reviewNumber: 42, reviewUrl: "https://github.com/x/pull/42" });

  const createRef = calls.find((c) => c.method === "POST" && c.url.endsWith("/git/refs"));
  assert.equal(createRef.body.ref, "refs/heads/handbook/test-page");
  assert.equal(createRef.body.sha, "sha-of-main");

  const put = calls.find((c) => c.method === "PUT");
  assert.equal(put.body.branch, "handbook/test-page");

  const pr = calls.find((c) => c.method === "POST" && c.url.endsWith("/pulls"));
  assert.equal(pr.body.head, "handbook/test-page");
  assert.equal(pr.body.base, "main");
  assert.ok(pr.body.body.includes("@octocat"));
});

test("pr: save with an OPEN review reuses branch + PR (no create, no reset)", async () => {
  const { calls, fn } = mockApi({
    branches: ["main", "handbook/test-page"],
    openPrs: [{ number: 7, html_url: "https://github.com/x/pull/7" }],
  });
  const result = await createGithubStore(PR, fn).write(FILE, OPTS);
  assert.deepEqual(result, { reviewNumber: 7, reviewUrl: "https://github.com/x/pull/7" });
  assert.equal(calls.filter((c) => c.method === "POST").length, 0); // no ref create, no PR create
  assert.equal(calls.filter((c) => c.method === "PATCH").length, 0); // no force reset
});

test("pr: STALE leftover branch (merged review, no open PR, no unique commits) is force-reset to base head", async () => {
  const { calls, fn } = mockApi({
    branches: ["main", "handbook/test-page"],
    openPrs: [],
    compareStatus: "behind", // its work was merged — nothing unique to lose
  });
  await createGithubStore(PR, fn).write(FILE, OPTS);
  const reset = calls.find((c) => c.method === "PATCH");
  assert.ok(decodeURIComponent(reset.url).includes("heads/handbook/test-page"));
  assert.deepEqual(reset.body, { sha: "sha-of-main", force: true });
});

test("pr: branch with ORPHANED commits (failed PR create) is NEVER reset — commits survive into the new review", async () => {
  // Regression for the data-loss bug: save 1 committed but PR creation 500'd;
  // save 2 must NOT force-reset the branch (that would orphan save 1's commit
  // beyond any ref) — it commits on top and the new PR carries both.
  const { calls, fn } = mockApi({
    branches: ["main", "handbook/test-page"],
    openPrs: [],
    compareStatus: "ahead", // unique commits exist on the edit branch
  });
  const result = await createGithubStore(PR, fn).write(FILE, OPTS);
  assert.equal(calls.filter((c) => c.method === "PATCH").length, 0); // no force reset
  assert.equal(result.reviewNumber, 42); // review created, prior commits included
});

test("pr: file sha is read from the EDIT branch, not base", async () => {
  const { calls, fn } = mockApi({
    branches: ["main", "handbook/test-page"],
    openPrs: [{ number: 7, html_url: "u" }],
    files: { "test-page": "branch-sha" },
  });
  await createGithubStore(PR, fn).write(FILE, OPTS);
  const shaRead = calls.find((c) => c.method === "GET" && c.url.includes("/contents/"));
  assert.ok(shaRead.url.includes("ref=handbook%2Ftest-page"));
  assert.equal(calls.find((c) => c.method === "PUT").body.sha, "branch-sha");
});

test("pr: no-op change (PR create 422: no commits) resolves without a review", async () => {
  const base = mockApi();
  const fn = async (url, init = {}) => {
    if ((init.method ?? "GET") === "POST" && String(url).endsWith("/pulls")) {
      return new Response(JSON.stringify({ message: "No commits between..." }), { status: 422 });
    }
    return base.fn(url, init);
  };
  const result = await createGithubStore(PR, fn).remove("gone", OPTS);
  assert.deepEqual(result, {});
});

// ---- discardDraft: delete-branch semantics for never-published pages ----

const { discardDraft } = await import("../src/lib/content/store.github.ts");
const DISCARD_CFG = { token: "user-token", repo: "osbrjp/handbook" };

test("discardDraft: deletes the edit branch ref and reports true", async () => {
  let seen;
  const fetchImpl = async (url, init) => {
    seen = { url: String(url), method: init?.method };
    return new Response(null, { status: 204 });
  };
  assert.equal(await discardDraft(DISCARD_CFG, "testing-page", fetchImpl), true);
  assert.equal(seen.method, "DELETE");
  assert.ok(seen.url.includes(encodeURIComponent("heads/handbook/testing-page")));
});

test("discardDraft: no branch to discard (404/422) -> false, no throw", async () => {
  for (const status of [404, 422]) {
    const fetchImpl = async () => new Response(null, { status });
    assert.equal(await discardDraft(DISCARD_CFG, "testing-page", fetchImpl), false);
  }
});

test("discardDraft: API trouble throws (surfaced as a friendly 503 upstream)", async () => {
  const fetchImpl = async () => new Response(null, { status: 500 });
  await assert.rejects(() => discardDraft(DISCARD_CFG, "testing-page", fetchImpl));
});

test("discardDraft: missing token/repo -> false without any API call", async () => {
  const fetchImpl = async () => {
    throw new Error("should not be called");
  };
  assert.equal(await discardDraft({ token: "", repo: "" }, "x", fetchImpl), false);
});
