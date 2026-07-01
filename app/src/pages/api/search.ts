import type { APIRoute } from "astro";
import { searchPages } from "../../lib/content/pages";

// Visitor-scoped handbook search. Results are filtered by the SAME canRead ACL
// as page reads (anon → public only; reader → +internal +groups; editor →
// everything), so this endpoint can never leak a page the caller can't read.
//
// Caching: results depend on the session cookie, so they MUST NOT be shared —
// private + no-store, and Vary: Cookie for any well-behaved intermediary.
//
// Fail closed: on ANY DB error we return empty results, never partial/unfiltered
// content and never a raw error body.
export const GET: APIRoute = async ({ locals, url }) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "private, no-store",
    Vary: "Cookie",
  };

  const q = url.searchParams.get("q") ?? "";
  try {
    const results = await searchPages(q, locals.visitor ?? null);
    return new Response(JSON.stringify({ results }), { headers });
  } catch {
    // Don't echo the error (could carry content); just fail closed.
    return new Response(JSON.stringify({ results: [] }), { status: 503, headers });
  }
};
