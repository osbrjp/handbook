import type { APIRoute } from "astro";
import { requireEditor } from "../../lib/auth/requireEditor";
import { renderMarkdown } from "../../lib/markdown";

// Editor-only live preview. Renders with the SAME sanitizing pipeline the reader
// uses, so the preview can't run script and matches the published output.
export const POST: APIRoute = async ({ locals, request }) => {
  const denied = requireEditor(locals);
  if (denied) return denied;
  const body = await request.text();
  if (body.length > 256 * 1024) return new Response("Body too large", { status: 413 });
  return new Response(renderMarkdown(body), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
};
