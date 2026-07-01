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
      editorEmail: locals.visitor?.email ?? "unknown",
      message: `Delete "${page.title}" (${slug})`,
    });
  } catch {
    // In-browser editing is deferred (see save.ts). Delete by removing the file.
    return new Response(
      "In-browser editing isn't enabled yet. To remove a page, delete its markdown file in the repository and commit.",
      { status: 501 },
    );
  }

  return redirect("/edit-pages?deleted=1", 303);
};
