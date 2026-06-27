import { defineMiddleware } from "astro:middleware";
import { publicClient, visitorClient, fetchMe } from "./lib/directus";

// Attaches a per-request Directus client + the resolved visitor to locals.
//
// FAIL CLOSED (red-team R5): if a session token is present but the user can't be
// resolved (expired/invalid), we drop to the PUBLIC client and treat the
// visitor as logged-out — they then see only public content, never a stale or
// over-privileged view. For the POC, expiry == silently drop to public view
// (no auto-redirect to login). Single-flight refresh + redirect is a pre-prod item.
export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get("directus_session_token")?.value ?? null;

  if (token) {
    const client = visitorClient(token);
    const user = await fetchMe(client);
    if (user) {
      context.locals.client = client;
      context.locals.user = user;
      context.locals.sessionToken = token;
      return next();
    }
  }

  context.locals.client = publicClient();
  context.locals.user = null;
  context.locals.sessionToken = null;
  return next();
});
