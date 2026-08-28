import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  fetchGithubAuthToken,
  fetchGithubUser,
  resolveRole,
  resolveRoleSelf,
} from "../../../lib/auth/github";
import { getOrigin, safeReturnUrl } from "../../../lib/auth/origin";
import { encryptSession } from "../../../lib/auth/session";
import {
  SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
  sessionCookieOptions,
} from "../../../lib/auth/cookies";

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  const origin = getOrigin(request, env);
  const fail = (e: string) => redirect(`/?error=${e}`, 302);

  // 1. State-nonce CSRF: the state must echo the single-use cookie value.
  const rawState = url.searchParams.get("state");
  const nonceCookie = cookies.get(OAUTH_STATE_COOKIE)?.value;
  cookies.delete(OAUTH_STATE_COOKIE, { path: "/" });
  let returnUrl = "/";
  try {
    const parsed = JSON.parse(atob(rawState ?? "")) as { n?: string; r?: string };
    if (!parsed.n || parsed.n !== nonceCookie) return fail("invalid_state");
    if (typeof parsed.r === "string") returnUrl = parsed.r;
  } catch {
    return fail("invalid_state");
  }

  // 2. Authorization code. (GITHUB_TOKEN is deliberately NOT required here —
  //    it's only the fallback credential for classic-OAuth sign-ins, checked
  //    below once the token kind is known.)
  const code = url.searchParams.get("code");
  if (!code) return fail("missing_code");
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET) return fail("not_configured");

  // 3. Code -> token (identity only; no scopes were requested).
  const token = await fetchGithubAuthToken({
    clientId: env.GITHUB_OAUTH_CLIENT_ID,
    clientSecret: env.GITHUB_OAUTH_CLIENT_SECRET,
    code,
    redirectUri: `${origin}/api/auth/callback`,
  });
  if ("error" in token) return fail("token_exchange_failed");

  // 4. Who is this?
  const user = await fetchGithubUser(token.accessToken);
  if (!user) return fail("userinfo_failed");

  // 5. Authorization = their access to the handbook repo (fail closed —
  //    includes GitHub API trouble: no role, no session). There is no
  //    allow-list; GitHub collaborators/org membership IS the gate.
  //    GitHub App sign-in (refresh token present): the user's own token
  //    self-checks — no bot credential. Classic OAuth sign-in: the bot token
  //    does the collaborator check (and self-check trouble falls back to it
  //    when it's configured, so setting GITHUB_TOKEN always keeps login up).
  const repo = env.GITHUB_REPO || "osbrjp/handbook";
  let role: Awaited<ReturnType<typeof resolveRole>>;
  try {
    if (token.refreshToken) {
      role = await resolveRoleSelf({ userToken: token.accessToken, repo }).catch((e) => {
        if (!env.GITHUB_TOKEN) throw e;
        return resolveRole({ token: env.GITHUB_TOKEN, repo, login: user.login });
      });
    } else if (env.GITHUB_TOKEN) {
      role = await resolveRole({ token: env.GITHUB_TOKEN, repo, login: user.login });
    } else {
      return fail("not_configured");
    }
  } catch {
    return fail("access_check_failed");
  }
  if (!role) return fail("access_denied");

  // 6. Mint session: login + verified role, stamped for periodic re-verification.
  //    The user's own token rides along (encrypted) so editor saves commit AS
  //    THE PERSON — expiring GitHub App tokens get refreshed by the middleware.
  const now = Date.now();
  const cookie = await encryptSession(
    {
      login: user.login,
      role,
      checkedAt: now,
      exp: now + 7 * 86_400_000,
      ghToken: {
        access: token.accessToken,
        refresh: token.refreshToken,
        expiresAt: token.expiresAt,
      },
    },
    env.COOKIE_ENCRYPTION_KEY,
  );
  cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(origin));

  return redirect(safeReturnUrl(returnUrl, origin), 302);
};
