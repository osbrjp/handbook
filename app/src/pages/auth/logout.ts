import type { APIRoute } from "astro";

export const GET: APIRoute = ({ cookies, redirect }) => {
  cookies.delete("directus_session_token", { path: "/" });
  // POC: clearing the cookie logs the visitor out of the app. Server-side
  // Directus session invalidation is a pre-prod hardening item.
  return redirect("/", 302);
};
