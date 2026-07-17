import type { APIRoute } from "astro";
import { setReaderCacheHeaders } from "../access";
import type { PageRow } from "./acl";
import { getNavPages } from "./pages";

// Shared GET handler for /llms.txt and /llms-full.txt (the per-page .md route
// has different behavior — per-page ACL + no-existence-signal 404 — and stays
// separate). getNavPages applies the same canRead ACL as every HTML page:
// anonymous (how agents and the standard-repository hook arrive) sees PUBLIC
// pages only; a signed-in session sees its full set. Fail closed: any backend
// error → 503, no partial output. Cache: "public" + visitor collapses to
// exactly the aggregate's truth — anonymous output is public-only, a session's
// output may carry internal pages (private, no-store).
//
// Anonymous responses are additionally memoized per isolate: content is
// bundled at build (a deploy replaces the isolate), and Cloudflare does NOT
// edge-cache Worker responses off Cache-Control alone — without the memo every
// anonymous hook fetch would rebuild the full text. Keyed by origin (links
// embed it). Dev is exempt so content edits show up without a restart.
export function llmsTextEndpoint(build: (rows: PageRow[], origin: string) => string): APIRoute {
  const anonCache = new Map<string, string>();
  return async ({ locals, url }) => {
    const visitor = locals.visitor ?? null;
    const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
    setReaderCacheHeaders(headers, "public", visitor);
    try {
      const cached = !visitor && import.meta.env.PROD ? anonCache.get(url.origin) : undefined;
      const text = cached ?? build(await getNavPages(visitor), url.origin);
      if (!visitor && import.meta.env.PROD) anonCache.set(url.origin, text);
      return new Response(text, { headers });
    } catch {
      return new Response("Service unavailable", { status: 503, headers });
    }
  };
}
