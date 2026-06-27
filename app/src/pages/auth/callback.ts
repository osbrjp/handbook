import type { APIRoute } from "astro";

// Directus has completed the Google dance and set the `directus_session_token`
// cookie (host-only on localhost, so the browser sends it to this app too).
// Nothing to do but land the visitor on the home page.
export const GET: APIRoute = ({ redirect }) => redirect("/", 302);
