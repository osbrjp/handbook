import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getGithubAuthorizeUrl } from "../../../lib/auth/github";
import { getOrigin } from "../../../lib/auth/origin";
import { OAUTH_STATE_COOKIE } from "../../../lib/auth/cookies";

// Start GitHub login. Sets a short-lived state-nonce cookie (CSRF for the
// callback) and redirects to GitHub. No scopes are requested — the app only
// needs the public identity; access is decided by repo permissions server-side.
export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  if (!env.GITHUB_OAUTH_CLIENT_ID)
    return new Response("GitHub OAuth not configured", { status: 503 });
  const origin = getOrigin(request, env);
  const nonce = crypto.randomUUID();
  const returnUrl = url.searchParams.get("return_url") ?? "/";

  cookies.set(OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: origin.startsWith("https://"),
  });

  const state = btoa(JSON.stringify({ n: nonce, r: returnUrl }));
  const authorizeUrl = getGithubAuthorizeUrl({
    clientId: env.GITHUB_OAUTH_CLIENT_ID,
    redirectUri: `${origin}/api/auth/callback`,
    state,
  });
  return redirect(authorizeUrl, 302);
};
