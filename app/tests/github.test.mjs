import { test } from "node:test";
import assert from "node:assert/strict";

const {
  roleFromPermission,
  roleFromRepoPermissions,
  resolveRole,
  resolveRoleSelf,
  GithubApiError,
} = await import("../src/lib/auth/github.ts");

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

// ---- resolveRoleSelf: role from the user's OWN GitHub App token ----

test("roleFromRepoPermissions: any push-capable flag -> editor, rest readers", () => {
  assert.equal(roleFromRepoPermissions({ admin: true }), "editor");
  assert.equal(roleFromRepoPermissions({ maintain: true }), "editor");
  assert.equal(roleFromRepoPermissions({ push: true }), "editor");
  assert.equal(roleFromRepoPermissions({ push: false }), "reader");
  assert.equal(roleFromRepoPermissions({}), "reader");
  assert.equal(roleFromRepoPermissions(undefined), "reader");
});

// Mock fetch for the two self-check endpoints: /user/installations and
// /user/installations/{id}/repositories.
const mockSelfFetch =
  ({ installations, repositories }) =>
  async (url) => {
    if (/\/user\/installations\?/.test(String(url))) {
      return new Response(JSON.stringify({ installations }), { status: 200 });
    }
    return new Response(JSON.stringify({ repositories }), { status: 200 });
  };

const HANDBOOK_INST = { id: 7, account: { login: "osbrjp" } };
const SELF_OPTS = { userToken: "t", repo: "osbrjp/handbook" };

test("resolveRoleSelf: repo listed with push -> editor", async () => {
  const fetch = mockSelfFetch({
    installations: [HANDBOOK_INST],
    repositories: [{ full_name: "osbrjp/handbook", permissions: { push: true, pull: true } }],
  });
  assert.equal(await resolveRoleSelf(SELF_OPTS, fetch), "editor");
});

test("resolveRoleSelf: repo listed pull-only -> reader (explicit read collaborator)", async () => {
  const fetch = mockSelfFetch({
    installations: [HANDBOOK_INST],
    repositories: [{ full_name: "osbrjp/handbook", permissions: { push: false, pull: true } }],
  });
  assert.equal(await resolveRoleSelf(SELF_OPTS, fetch), "reader");
});

test("resolveRoleSelf: repo NOT in the explicit-permission list -> null (public-repo trap)", async () => {
  // The analog of the collaborator-404 gate: a random GitHub user can READ a
  // public repo, but it never appears in their explicit-permission listing —
  // so they must resolve to no access, not reader.
  const fetch = mockSelfFetch({
    installations: [HANDBOOK_INST],
    repositories: [{ full_name: "osbrjp/other-repo", permissions: { pull: true } }],
  });
  assert.equal(await resolveRoleSelf(SELF_OPTS, fetch), null);
});

test("resolveRoleSelf: no visible installation -> null (fail closed)", async () => {
  const fetch = mockSelfFetch({ installations: [], repositories: [] });
  assert.equal(await resolveRoleSelf(SELF_OPTS, fetch), null);
});

test("resolveRoleSelf: installations for OTHER owners are ignored", async () => {
  const fetch = mockSelfFetch({
    installations: [{ id: 9, account: { login: "someone-else" } }],
    repositories: [{ full_name: "osbrjp/handbook", permissions: { push: true } }],
  });
  assert.equal(await resolveRoleSelf(SELF_OPTS, fetch), null);
});

test("resolveRoleSelf: classic OAuth token (403) throws, distinct from no-access", async () => {
  // Verified live: /user/installations rejects non-App tokens with 403.
  const fetch = async () => new Response(null, { status: 403 });
  await assert.rejects(() => resolveRoleSelf(SELF_OPTS, fetch), GithubApiError);
});

test("resolveRoleSelf: API trouble throws (distinct from revoked)", async () => {
  const instOk = async (url) =>
    /\/user\/installations\?/.test(String(url))
      ? new Response(JSON.stringify({ installations: [HANDBOOK_INST] }), { status: 200 })
      : new Response(null, { status: 502 });
  await assert.rejects(() => resolveRoleSelf(SELF_OPTS, instOk), GithubApiError);
});

test("resolveRoleSelf: walks pages until the repo is found", async () => {
  const page1 = Array.from({ length: 100 }, (_, i) => ({
    full_name: `osbrjp/filler-${i}`,
    permissions: { pull: true },
  }));
  const fetch = async (url) => {
    const s = String(url);
    if (/\/user\/installations\?/.test(s))
      return new Response(JSON.stringify({ installations: [HANDBOOK_INST] }), { status: 200 });
    const page = Number(new URL(s).searchParams.get("page"));
    return new Response(
      JSON.stringify({
        repositories:
          page === 1 ? page1 : [{ full_name: "osbrjp/handbook", permissions: { push: true } }],
      }),
      { status: 200 },
    );
  };
  assert.equal(await resolveRoleSelf(SELF_OPTS, fetch), "editor");
});
