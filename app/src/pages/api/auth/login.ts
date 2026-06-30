import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getUpstreamAuthorizeUrl } from "../../../lib/auth/oauth";
import { getOrigin } from "../../../lib/auth/origin";
import { OAUTH_STATE_COOKIE } from "../../../lib/auth/cookies";

// Start Google login. Sets a short-lived state-nonce cookie (CSRF for the
// callback — a hardening the coop pattern lacked) and redirects to Google.
export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  if (!env.GOOGLE_CLIENT_ID) return new Response("Google OAuth not configured", { status: 503 });
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
  const authorizeUrl = getUpstreamAuthorizeUrl({
    clientId: env.GOOGLE_CLIENT_ID,
    redirectUri: `${origin}/api/auth/callback`,
    scope: "email profile",
    state,
    hd: "osbrjp.com", // hint Workspace domain (enforcement is the Internal OAuth app + allow-list)
  });
  return redirect(authorizeUrl, 302);
};
