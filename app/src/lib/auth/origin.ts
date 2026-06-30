// Resolve the public origin of this app. OAUTH_ORIGIN (env) wins so prod is
// explicit; otherwise derive from forwarded headers / request URL.
export function getOrigin(request: Request, env: { OAUTH_ORIGIN?: string }): string {
  if (env.OAUTH_ORIGIN) return env.OAUTH_ORIGIN.replace(/\/$/, "");
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
