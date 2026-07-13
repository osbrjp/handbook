import type { APIRoute } from "astro";
import { setReaderCacheHeaders } from "../lib/access";
import { buildLlmsFull } from "../lib/content/llms";
import { getNavPages } from "../lib/content/pages";

// /llms-full.txt (llmstxt.org) — every readable page's full markdown in one
// document. Same ACL/caching/fail-closed contract as llms.txt.
export const GET: APIRoute = async ({ locals }) => {
  const visitor = locals.visitor ?? null;
  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
  setReaderCacheHeaders(headers, "public", visitor);
  try {
    const rows = await getNavPages(visitor);
    return new Response(buildLlmsFull(rows), { headers });
  } catch {
    return new Response("Service unavailable", { status: 503, headers });
  }
};
