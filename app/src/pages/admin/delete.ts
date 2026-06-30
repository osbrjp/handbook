import type { APIRoute } from "astro";
import { requireEditor } from "../../lib/auth/requireEditor";
import { checkCsrf } from "../../lib/csrf";
import { deletePage, getPageById } from "../../lib/db/pages";

export const POST: APIRoute = async ({ locals, request, cookies, redirect }) => {
  const denied = requireEditor(locals);
  if (denied) return denied;

  const f = await request.formData();
  if (!checkCsrf(cookies, f.get("csrf"))) return new Response("Bad CSRF token", { status: 403 });

  const idRaw = f.get("id");
  const id = idRaw ? Number(idRaw) : NaN;
  if (!Number.isFinite(id)) return new Response("Invalid page id", { status: 400 });

  // 404 (not 500) if it's already gone — idempotent from the editor's view.
  const page = await getPageById(locals.db, id);
  if (!page) return new Response(null, { status: 404 });

  await deletePage(locals.db, id);

  return redirect("/admin?deleted=1", 303);
};
