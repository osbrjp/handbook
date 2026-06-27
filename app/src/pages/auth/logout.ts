import type { APIRoute } from "astro";

const DIRECTUS =
  import.meta.env.DIRECTUS_INTERNAL_URL ||
  import.meta.env.PUBLIC_DIRECTUS_URL ||
  "http://localhost:8055";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get("directus_session_token")?.value;
  if (token) {
    // Best-effort: revoke the session server-side so a captured token dies now,
    // not at cookie TTL (security review #4). Non-fatal if it fails.
    try {
      await fetch(`${DIRECTUS}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `directus_session_token=${token}` },
        body: JSON.stringify({ mode: "session" }),
      });
    } catch {
      // ignore — clearing the cookie below still logs the user out of the app
    }
  }
  cookies.delete("directus_session_token", { path: "/" });
  return redirect("/", 302);
};
