import type { APIRoute } from "astro";
import { requireEditor } from "../../lib/auth/requireEditor";
import { checkCsrf } from "../../lib/csrf";
import { upsertPage, setPageGroups, type Visibility } from "../../lib/db/pages";
import { listGroups } from "../../lib/db/groups";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VISIBILITIES = new Set(["public", "internal", "restricted"]);
const STATUSES = new Set(["draft", "published"]);
const bad = (msg: string) => new Response(msg, { status: 400 });

export const POST: APIRoute = async ({ locals, request, cookies, redirect }) => {
  const denied = requireEditor(locals);
  if (denied) return denied;

  const f = await request.formData();
  if (!checkCsrf(cookies, f.get("csrf"))) return new Response("Bad CSRF token", { status: 403 });

  const idRaw = f.get("id");
  const id = idRaw ? Number(idRaw) : undefined;
  const title = String(f.get("title") ?? "").trim();
  const slug = String(f.get("slug") ?? "").trim().toLowerCase();
  const section = String(f.get("section") ?? "").trim();
  const nav_label = String(f.get("nav_label") ?? "").trim() || title;
  const visibility = String(f.get("visibility") ?? "internal") as Visibility;
  const status = String(f.get("status") ?? "draft");
  const body = String(f.get("body") ?? "");
  const sort = Number(f.get("sort") ?? 0) || 0;

  if (!title) return bad("Title is required");
  if (!SLUG_RE.test(slug)) return bad("Slug must be lowercase words separated by hyphens");
  if (!section) return bad("Section is required");
  if (!VISIBILITIES.has(visibility)) return bad("Invalid visibility");
  if (!STATUSES.has(status)) return bad("Invalid status");
  if (body.length > 256 * 1024) return bad("Body too large (max 256KB)");

  const clash = await locals.db.prepare("SELECT id FROM pages WHERE slug=? AND id != ?").bind(slug, id ?? -1).first();
  if (clash) return bad("That slug is already in use");

  let newId: number;
  try {
    newId = await upsertPage(
      locals.db,
      { slug, title, section, nav_label, sort, visibility, status: status as "draft" | "published", body },
      locals.visitor?.email ?? "unknown",
      id,
    );
  } catch {
    // UNIQUE(slug) race after the pre-check — return the clean 400, not a 500.
    return bad("That slug is already in use");
  }

  // Group grants apply only to restricted pages; otherwise clear them. Unknown
  // group keys are dropped (fail toward LESS access).
  let groupKeys: string[] = [];
  if (visibility === "restricted") {
    const known = new Set((await listGroups(locals.db)).map((g) => g.key));
    groupKeys = f.getAll("groups").map(String).filter((k) => known.has(k));
  }
  await setPageGroups(locals.db, newId, groupKeys);

  return redirect(`/admin/edit/${newId}`, 303);
};
