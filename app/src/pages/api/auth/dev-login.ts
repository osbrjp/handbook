import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { encryptSession } from "../../../lib/auth/session";
import { SESSION_COOKIE, sessionCookieOptions } from "../../../lib/auth/cookies";
import { getOrigin } from "../../../lib/auth/origin";

// DEV-ONLY login shim. Mints the SAME session cookie as the real GitHub flow so
// the middleware/ACL/editor paths are exercised locally with no OAuth app or
// bot token. Bypasses ONLY the GitHub round-trip — still requires DEV_LOGIN=1
// (the middleware also skips role re-verification in dev, so these fake users
// survive past the revalidation TTL). Returns 404 in prod (no signal it exists).
//
//   /api/auth/dev-login?user=alice&role=editor
//   /api/auth/dev-login?user=bob&role=reader
//   /api/auth/dev-login?user=carol&role=admin
export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  if (env.DEV_LOGIN !== "1") return new Response(null, { status: 404 });

  const login = url.searchParams.get("user") ?? "dev-editor";
  const param = url.searchParams.get("role");
  const role = param === "reader" || param === "admin" ? param : "editor";

  const origin = getOrigin(request, env);
  const now = Date.now();
  const cookie = await encryptSession(
    { login, role, checkedAt: now, exp: now + 86_400_000 },
    env.COOKIE_ENCRYPTION_KEY,
  );
  cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(origin));
  return redirect("/", 302);
};
