import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { encryptSession } from "../../../lib/auth/session";
import { SESSION_COOKIE, sessionCookieOptions } from "../../../lib/auth/cookies";
import { isAllowed } from "../../../lib/auth/accessList";
import { getOrigin } from "../../../lib/auth/origin";

// DEV-ONLY login shim. Mints the SAME session cookie as the real Google flow so
// the middleware/ACL/editor paths are exercised locally with no Google client.
// Bypasses ONLY the Google round-trip — still requires DEV_LOGIN=1, an allowed
// email, AND a row in `users`. Returns 404 in prod (no signal it exists).
export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  if (env.DEV_LOGIN !== "1") return new Response(null, { status: 404 });

  const email = (url.searchParams.get("email") ?? "editor@osbrjp.com").toLowerCase();
  if (!isAllowed(email)) return new Response(null, { status: 404 });

  const exists = await env.DB.prepare("SELECT 1 FROM users WHERE email=?").bind(email).first();
  if (!exists) return new Response(null, { status: 404 });

  const origin = getOrigin(request, env);
  const cookie = await encryptSession(
    { email, exp: Date.now() + 86_400_000 },
    env.COOKIE_ENCRYPTION_KEY,
  );
  cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(origin));
  return redirect("/", 302);
};
