import { test } from "node:test";
import assert from "node:assert/strict";

const { listReviews, approveAndPublish, rejectReview, rollupChecks } = await import(
  "../src/lib/content/reviews.ts"
);

const CFG = { token: "admin-token", repo: "osbrjp/handbook", base: "main" };

test("rollupChecks: all success -> passing; any failure -> failing; any running -> pending", () => {
  assert.equal(rollupChecks([]), "none");
  assert.equal(rollupChecks([{ status: "completed", conclusion: "success" }]), "passing");
  assert.equal(
    rollupChecks([
      { status: "completed", conclusion: "success" },
      { status: "completed", conclusion: "skipped" },
    ]),
    "passing",
  );
  assert.equal(
    rollupChecks([
      { status: "completed", conclusion: "success" },
      { status: "completed", conclusion: "failure" },
    ]),
    "failing",
  );
  assert.equal(
    rollupChecks([
      { status: "in_progress", conclusion: null },
      { status: "completed", conclusion: "success" },
    ]),
    "pending",
  );
});

test("listReviews: only handbook/* PRs become review items, with slug from the branch", async () => {
  const fn = async (url) => {
    const u = String(url);
    if (u.includes("/pulls?")) {
      return new Response(
        JSON.stringify([
          {
            number: 5,
            html_url: "https://github.com/x/pull/5",
            title: 'Publish "Strategy" (strategy)',
            updated_at: "2026-07-02T00:00:00Z",
            user: { login: "octocat" },
            head: { ref: "handbook/strategy", sha: "abc" },
          },
          {
            number: 6,
            html_url: "u6",
            title: "Some feature branch",
            updated_at: "2026-07-02T00:00:00Z",
            user: { login: "dev" },
            head: { ref: "feature/api", sha: "def" },
          },
        ]),
        { status: 200 },
      );
    }
    if (u.includes("/check-runs")) {
      return new Response(
        JSON.stringify({ check_runs: [{ status: "completed", conclusion: "success" }] }),
        { status: 200 },
      );
    }
    return new Response(null, { status: 404 });
  };
  const items = await listReviews(CFG, fn);
  assert.equal(items.length, 1);
  assert.equal(items[0].slug, "strategy");
  assert.equal(items[0].author, "octocat");
  assert.equal(items[0].checks, "passing");
});

test("approveAndPublish: approves THEN merges, then deletes the edit branch", async () => {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push({ method: init.method ?? "GET", url: String(url) });
    if (String(url).endsWith("/pulls/5")) {
      return new Response(JSON.stringify({ head: { ref: "handbook/strategy" } }), { status: 200 });
    }
    return new Response(JSON.stringify({}), { status: 200 });
  };
  await approveAndPublish(CFG, 5, fn);
  const order = calls.map((c) => `${c.method} ${c.url.split("/repos/osbrjp/handbook")[1]}`);
  assert.deepEqual(order, [
    "POST /pulls/5/reviews",
    "PUT /pulls/5/merge",
    "GET /pulls/5",
    "DELETE /git/refs/heads%2Fhandbook%2Fstrategy",
  ]);
});

test("approveAndPublish: self-approval (422) gets a human message, merge never attempted", async () => {
  const calls = [];
  const fn = async (_url, init = {}) => {
    calls.push(init.method ?? "GET");
    return new Response(JSON.stringify({}), { status: 422 });
  };
  await assert.rejects(() => approveAndPublish(CFG, 5, fn), /different editor/i);
  assert.deepEqual(calls, ["POST"]);
});

test("approveAndPublish: blocked merge (405) kicks off update-branch and explains", async () => {
  const calls = [];
  const fn = async (url, init = {}) => {
    const u = String(url);
    calls.push(`${init.method ?? "GET"} ${u.split("/pulls/5")[1] ?? u}`);
    if (u.endsWith("/merge")) return new Response(JSON.stringify({}), { status: 405 });
    return new Response(JSON.stringify({}), { status: 200 });
  };
  await assert.rejects(() => approveAndPublish(CFG, 5, fn), /checks|refresh/i);
  assert.ok(calls.includes("PUT /update-branch"));
});

test("rejectReview: closes the PR and deletes the edit branch", async () => {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push({ method: init.method ?? "GET", url: String(url), body: init.body });
    if ((init.method ?? "GET") === "GET") {
      return new Response(JSON.stringify({ head: { ref: "handbook/strategy" } }), { status: 200 });
    }
    return new Response(JSON.stringify({}), { status: 200 });
  };
  await rejectReview(CFG, 9, fn);
  const patch = calls.find((c) => c.method === "PATCH");
  assert.ok(patch.url.endsWith("/pulls/9"));
  assert.deepEqual(JSON.parse(patch.body), { state: "closed" });
  assert.ok(calls.some((c) => c.method === "DELETE" && c.url.includes("handbook%2Fstrategy")));
});

// ---- reviewLabel: strip our own PR-title scaffolding for non-tech readers ----

const { reviewLabel } = await import("../src/lib/content/reviews.ts");

test("reviewLabel: our Submit/Draft/Delete titles show just the page title", () => {
  assert.equal(reviewLabel('Submit "Testing page" (testing-page)'), "Testing page");
  assert.equal(reviewLabel('Draft "On-boarding" (on-boarding)'), "On-boarding");
  assert.equal(reviewLabel('Delete "Old policy" (old-policy)'), "Old policy");
});

test("reviewLabel: foreign titles pass through untouched", () => {
  assert.equal(reviewLabel("Fix typos across guideline pages"), "Fix typos across guideline pages");
  assert.equal(reviewLabel('Submit "unclosed (weird'), 'Submit "unclosed (weird');
});
