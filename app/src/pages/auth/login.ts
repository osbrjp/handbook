import type { APIRoute } from "astro";

// Kick off Google login via Directus's built-in OpenID driver. Directus runs
// the OAuth dance and redirects back to /auth/callback with a session cookie.
export const GET: APIRoute = ({ redirect }) => {
  const directus = import.meta.env.PUBLIC_DIRECTUS_URL || "http://localhost:8055";
  const app = import.meta.env.PUBLIC_APP_URL || "http://localhost:4321";
  const callback = encodeURIComponent(`${app}/auth/callback`);
  return redirect(`${directus}/auth/login/google?redirect=${callback}`, 302);
};
