import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { fetchUpstreamAuthToken, fetchGoogleUserinfo } from "../../../lib/auth/oauth";
import { getOrigin, safeReturnUrl } from "../../../lib/auth/origin";
import { isAllowed } from "../../../lib/auth/accessList";
import { lookupUser } from "../../../lib/auth/directory";
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

  // 2. Authorization code.
  const code = url.searchParams.get("code");
  if (!code) return fail("missing_code");
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return fail("not_configured");

  // 3. Code -> token.
  const token = await fetchUpstreamAuthToken({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    code,
    redirectUri: `${origin}/api/auth/callback`,
  });
  if ("error" in token) return fail("token_exchange_failed");

  // 4. Userinfo.
  const info = await fetchGoogleUserinfo(token.accessToken);
  // Require a Google-verified email — never trust an unverified address as identity.
  if (!info?.email || info.verified_email !== true) return fail("userinfo_failed");
  const email = info.email.toLowerCase();

  // 5. Allow-list AND a directory entry (git config; fail closed). New staff are
  //    provisioned by editing the directory / Google-Group sync (pre-prod).
  if (!isAllowed(email)) return fail("access_denied");
  // DEV_USERS override honored only in local dev (DEV_LOGIN=1); inert in prod.
  const devUsers = env.DEV_LOGIN === "1" ? env.DEV_USERS : undefined;
  if (!lookupUser(email, devUsers)) return fail("access_denied");

  // 6. Mint session (identity only; no datastore to record a login into).
  const cookie = await encryptSession(
    { email, exp: Date.now() + 7 * 86_400_000 },
    env.COOKIE_ENCRYPTION_KEY,
  );
  cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(origin));

  return redirect(safeReturnUrl(returnUrl, origin), 302);
};
