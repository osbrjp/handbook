import type { APIRoute } from "astro";
import { requireEditor } from "../../lib/auth/requireEditor";
import { checkCsrf } from "../../lib/csrf";
import { getEditablePageBySlug } from "../../lib/content/pages";
import { getContentStore } from "../../lib/content/store";
import { isSafeSlug } from "../../lib/content/serialize";

export const POST: APIRoute = async ({ locals, request, cookies, redirect }) => {
  const denied = requireEditor(locals);
  if (denied) return denied;

  const f = await request.formData();
  if (!checkCsrf(cookies, f.get("csrf"))) return new Response("Bad CSRF token", { status: 403 });

  const slug = String(f.get("slug") ?? "").trim();
  if (!slug || !isSafeSlug(slug)) return new Response("Invalid page URL", { status: 400 });

  // 404 (not 500) if it's already gone — idempotent from the editor's view.
  const page = await getEditablePageBySlug(slug);
  if (!page) return new Response(null, { status: 404 });

  try {
    const store = await getContentStore(locals.contentStore);
    await store.remove(slug, {
      editor: locals.visitor?.login ?? "unknown",
      message: `Delete "${page.title}" (${slug})`,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "unknown error";
    return new Response(`Could not delete. ${detail}`, { status: 503 });
  }

  return redirect("/edit-pages?deleted=1", 303);
};
