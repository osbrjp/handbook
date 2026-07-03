// GitHub OAuth + authorization. Identity AND access control both live in
// GitHub: signing in proves who you are (OAuth), and your access to the
// handbook repo decides what you may do (role). There is NO allow-list in this
// codebase — GitHub's collaborators/org People pages are the access control,
// managed there and never committed here.
//
// Role mapping (verified against the live API):
//   push permission on the repo (write/maintain/admin)  -> editor (edit+approve)
//   explicit collaborator with read/triage              -> reader
//   not a collaborator                                  -> null (no access)
//
// IMPORTANT: the permission endpoint reports "read" for ANY GitHub user while
// the repo is public, so `permission === "read"` is NOT proof of access. The
// explicit-collaborator check (204 vs 404) is the real gate — it behaves the
// same for public and private repos, so making the repo private changes nothing.
//
// The checks run with a server-side bot token (Worker secret GITHUB_TOKEN),
// NOT the user's OAuth token — the user grants no scopes at all (public
// profile only), and a reader's own token couldn't query the collaborator API.

// .ts extension: imported by node --test too (no extensionless resolution).
import { GITHUB_API as API, GITHUB_UA as UA, githubHeaders } from "../githubApi.ts";
import type { Role } from "./visitor";

export function getGithubAuthorizeUrl(o: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const u = new URL("https://github.com/login/oauth/authorize");
  u.searchParams.set("client_id", o.clientId);
  u.searchParams.set("redirect_uri", o.redirectUri);
  u.searchParams.set("state", o.state);
  // No scope: we only need the public identity; authorization is the bot
  // token's collaborator check, not anything granted by the user.
  return u.toString();
}

// Token set from GitHub. A GitHub App issues EXPIRING user tokens (~8h) with a
// refresh token; a classic OAuth App issues a non-expiring token (refresh/expiry
// absent). Both shapes flow through the same session plumbing.
export interface GithubTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms; undefined = non-expiring
}

async function postTokenEndpoint(
  params: Record<string, string>,
): Promise<GithubTokenSet | { error: string }> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": UA,
    },
    body: new URLSearchParams(params),
  });
  if (!res.ok) return { error: `token_exchange_${res.status}` };
  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!json.access_token) return { error: "no_access_token" };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: json.expires_in ? Date.now() + json.expires_in * 1000 : undefined,
  };
}

export async function fetchGithubAuthToken(o: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<GithubTokenSet | { error: string }> {
  return postTokenEndpoint({
    client_id: o.clientId,
    client_secret: o.clientSecret,
    code: o.code,
    redirect_uri: o.redirectUri,
  });
}

/** Exchange a GitHub App refresh token for a fresh user token. */
export async function refreshGithubToken(o: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<GithubTokenSet | { error: string }> {
  return postTokenEndpoint({
    client_id: o.clientId,
    client_secret: o.clientSecret,
    grant_type: "refresh_token",
    refresh_token: o.refreshToken,
  });
}

/** The signed-in user's GitHub login (username). Public profile; no scopes. */
export async function fetchGithubUser(accessToken: string): Promise<{ login: string } | null> {
  const res = await fetch(`${API}/user`, { headers: githubHeaders(accessToken) });
  if (!res.ok) return null;
  const json = (await res.json()) as { login?: string };
  return typeof json.login === "string" && json.login ? { login: json.login } : null;
}

/** Pure mapping: GitHub role_name -> handbook role. Exported for tests.
 * Any push-capable level is an editor (can edit + approve/merge reviews);
 * read/triage is a reader. */
export function roleFromPermission(roleName: string | undefined): Role {
  return roleName === "admin" || roleName === "maintain" || roleName === "write"
    ? "editor"
    : "reader";
}

export class GithubApiError extends Error {}

/**
 * Resolve a user's handbook role from their repo access, using the bot token.
 *
 * Returns null for "no access" (fail closed). Throws GithubApiError on any
 * OTHER failure (bad token, rate limit, network) so callers can tell
 * "revoked" apart from "GitHub is down" — the login flow fails closed on
 * either, while the middleware keeps a previously-verified role through an
 * outage rather than locking the whole company out.
 */
export async function resolveRole(
  o: { token: string; repo: string; login: string },
  fetchImpl: typeof fetch = fetch,
): Promise<Role | null> {
  const headers = githubHeaders(o.token);
  const login = encodeURIComponent(o.login);

  // Gate: EXPLICIT collaborator (204) or not (404). Public-repo-safe.
  const gate = await fetchImpl(`${API}/repos/${o.repo}/collaborators/${login}`, { headers });
  if (gate.status === 404) return null;
  if (gate.status !== 204) throw new GithubApiError(`collaborator_check_${gate.status}`);

  // Role: their granted permission level on the repo.
  const perm = await fetchImpl(`${API}/repos/${o.repo}/collaborators/${login}/permission`, {
    headers,
  });
  if (!perm.ok) throw new GithubApiError(`permission_check_${perm.status}`);
  const json = (await perm.json()) as { role_name?: string };
  return roleFromPermission(json.role_name);
}
