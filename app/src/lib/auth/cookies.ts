export const SESSION_COOKIE = "handbook_session";
export const OAUTH_STATE_COOKIE = "oauth_state";
export const CSRF_COOKIE = "handbook_csrf";

// Session cookie flags. Secure is on only for https origins (off on http
// localhost so dev works); httpOnly + Lax suit a top-level OAuth callback GET.
export function sessionCookieOptions(origin: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7d (server-side exp is the real gate)
    secure: import.meta.env.PROD || origin.startsWith("https://"),
  };
}
