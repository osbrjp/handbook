import { test } from "node:test";
import assert from "node:assert/strict";

const { roleFromPermission, resolveRole, GithubApiError } = await import(
  "../src/lib/auth/github.ts"
);

test("roleFromPermission: any push-capable level -> editor, rest readers", () => {
  assert.equal(roleFromPermission("admin"), "editor");
  assert.equal(roleFromPermission("maintain"), "editor");
  assert.equal(roleFromPermission("write"), "editor");
  assert.equal(roleFromPermission("triage"), "reader");
  assert.equal(roleFromPermission("read"), "reader");
  assert.equal(roleFromPermission(undefined), "reader");
});

// Mock fetch: routes /collaborators/{login} (gate) and .../permission (role).
const mockFetch = (gateStatus, roleName) => async (url) => {
  if (String(url).endsWith("/permission")) {
    return new Response(JSON.stringify({ role_name: roleName }), { status: 200 });
  }
  return new Response(null, { status: gateStatus });
};

const OPTS = { token: "t", repo: "osbrjp/handbook", login: "someone" };

test("resolveRole: collaborator with write -> editor", async () => {
  assert.equal(await resolveRole(OPTS, mockFetch(204, "write")), "editor");
});

test("resolveRole: collaborator with read -> reader", async () => {
  assert.equal(await resolveRole(OPTS, mockFetch(204, "read")), "reader");
});

test("resolveRole: NOT a collaborator -> null, even though a public repo would report permission 'read'", async () => {
  // The verified trap: the permission endpoint answers "read" for ANY GitHub
  // user while the repo is public. The 404 on the explicit-collaborator gate
  // must win — otherwise every GitHub account becomes a reader.
  assert.equal(await resolveRole(OPTS, mockFetch(404, "read")), null);
});

test("resolveRole: API trouble throws (distinct from revoked)", async () => {
  await assert.rejects(() => resolveRole(OPTS, mockFetch(500, "read")), GithubApiError);
  // gate ok but permission check fails
  const permFail = async (url) =>
    String(url).endsWith("/permission")
      ? new Response(null, { status: 502 })
      : new Response(null, { status: 204 });
  await assert.rejects(() => resolveRole(OPTS, permFail), GithubApiError);
});

test("resolveRole: login is URL-encoded (no path injection)", async () => {
  let seen = "";
  const spy = async (url) => {
    seen = String(url);
    return new Response(null, { status: 404 });
  };
  await resolveRole({ ...OPTS, login: "a/../b" }, spy);
  assert.ok(seen.includes("a%2F..%2Fb"));
});
