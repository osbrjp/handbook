import type { APIRoute } from "astro";
import { setReaderCacheHeaders } from "../lib/access";
import { pageMarkdown } from "../lib/content/llms";
import { getPageBySlug } from "../lib/content/pages";

// /<slug>.md — one page as raw markdown (what /llms.txt links to; agents get
// clean markdown instead of scraping the rendered HTML). getPageBySlug applies
// the reader ACL; missing AND forbidden both 404 — no existence signal
// (red-team R2), exactly like the HTML route.
export const GET: APIRoute = async ({ locals, params }) => {
  const visitor = locals.visitor ?? null;
  try {
    const page = await getPageBySlug(params.slug ?? "", visitor);
    if (!page) return new Response(null, { status: 404 });
    const headers = new Headers({ "Content-Type": "text/markdown; charset=utf-8" });
    setReaderCacheHeaders(headers, page.visibility, visitor);
    return new Response(pageMarkdown(page), { headers });
  } catch {
    return new Response("Service unavailable", { status: 503 });
  }
};
