import type { Visitor } from "./visitor";

// Hard write-gate. Returns a 404 (NOT 403) for non-editors so the admin surface
// gives no existence signal. Role and reader-group access are independent axes:
// an editor with no leadership group still 404s reading a restricted page.
export function requireEditor(locals: { visitor: Visitor | null }): Response | null {
  return locals.visitor?.role === "editor" ? null : new Response(null, { status: 404 });
}
