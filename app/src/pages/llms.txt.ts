import type { APIRoute } from "astro";
import { setReaderCacheHeaders } from "../lib/access";
import { buildLlmsIndex } from "../lib/content/llms";
import { getNavPages } from "../lib/content/pages";

// /llms.txt (llmstxt.org) — the handbook index for AI agents. getNavPages
// applies the same canRead ACL as every HTML page: anonymous fetch (how agents
// and the standard-repository hook arrive) sees PUBLIC pages only; a signed-in
// session sees its full set. Fail closed: any backend error → 503, no partial
// index. Cache: anonymous output is public-only (edge-cacheable); with a
// session it varies by cookie ("public" + visitor → private, no-store).
export const GET: APIRoute = async ({ locals, url }) => {
  const visitor = locals.visitor ?? null;
  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
  setReaderCacheHeaders(headers, "public", visitor);
  try {
    const rows = await getNavPages(visitor);
    return new Response(buildLlmsIndex(rows, url.origin), { headers });
  } catch {
    return new Response("Service unavailable", { status: 503, headers });
  }
};
