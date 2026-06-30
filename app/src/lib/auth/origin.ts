// Resolve the public origin of this app. OAUTH_ORIGIN (env) wins so prod is
// explicit. Deriving from forwarded headers is allowed ONLY in dev — those
// headers are client-spoofable and drive the cookie `secure` flag + OAuth
// redirect_uri, so a non-dev env MUST set OAUTH_ORIGIN (fail closed).
export function getOrigin(
  request: Request,
  env: { OAUTH_ORIGIN?: string; DEV_LOGIN?: string },
): string {
  if (env.OAUTH_ORIGIN) return env.OAUTH_ORIGIN.replace(/\/$/, "");
  if (env.DEV_LOGIN !== "1") {
    throw new Error("OAUTH_ORIGIN must be set outside local dev");
  }
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

// Same-origin / relative-path guard for post-login redirects (open-redirect defense).
export function safeReturnUrl(candidate: string | null | undefined, origin: string): string {
  if (!candidate) return "/";
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  if (candidate.startsWith(`${origin}/`)) return candidate;
  return "/";
}
