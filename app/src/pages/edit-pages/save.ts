import type { APIRoute } from "astro";
import { requireEditor } from "../../lib/auth/requireEditor";
import { checkCsrf } from "../../lib/csrf";
import { getEditablePageBySlug, type Visibility } from "../../lib/content/pages";
import { listGroups } from "../../lib/auth/groups";
import { getContentStore, type PageFile } from "../../lib/content/store";
import { isSafeSlug } from "../../lib/content/serialize";

const VISIBILITIES = new Set(["public", "internal", "restricted"]);
const STATUSES = new Set(["draft", "published"]);
const bad = (msg: string) => new Response(msg, { status: 400 });
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const POST: APIRoute = async ({ locals, request, cookies, redirect }) => {
  const denied = requireEditor(locals);
  if (denied) return denied;

  const f = await request.formData();
  if (!checkCsrf(cookies, f.get("csrf"))) return new Response("Bad CSRF token", { status: 403 });

  const origSlug = String(f.get("orig_slug") ?? "").trim(); // empty on create
  const title = String(f.get("title") ?? "").trim();
  const slug = slugify(String(f.get("slug") ?? "") || title);
  const section = String(f.get("section") ?? "").trim();
  const nav_label = String(f.get("nav_label") ?? "").trim() || title;
  const visibility = String(f.get("visibility") ?? "internal") as Visibility;
  const status = String(f.get("status") ?? "draft") as "draft" | "published";
  const body = String(f.get("body") ?? "");
  const sort = Number(f.get("sort") ?? 0) || 0;

  if (!title) return bad("Title is required");
  if (!slug) return bad("Enter a title or a page URL");
  if (!isSafeSlug(slug))
    return bad("Invalid page URL (lowercase letters, numbers and hyphens only)");
  // Validate the rename SOURCE slug too — it becomes a file/repo path in store.rename.
  if (origSlug && !isSafeSlug(origSlug)) return bad("Invalid original page URL");
  if (!section) return bad("Section is required");
  if (!VISIBILITIES.has(visibility)) return bad("Invalid visibility");
  if (!STATUSES.has(status)) return bad("Invalid status");
  if (body.length > 256 * 1024) return bad("Body too large (max 256KB)");

  // Slug clash: a DIFFERENT page already occupies this slug/filename.
  const existing = await getEditablePageBySlug(slug);
  if (existing && slug !== origSlug) return bad("That page URL is already in use");

  // Group grants apply only to restricted pages; validate keys against the
  // directory's group definitions (git config). Unknown keys are dropped.
  let groups: string[] = [];
  if (visibility === "restricted") {
    const known = new Set(listGroups().map((g) => g.key));
    groups = f
      .getAll("groups")
      .map(String)
      .filter((k) => known.has(k));
  }

  const editor = locals.visitor?.login ?? "unknown";
  const file: PageFile = {
    slug,
    frontmatter: {
      title,
      section,
      nav_label,
      sort,
      visibility,
      groups,
      status,
      updated_by: editor, // GitHub login — no emails in content files
      updated_at: new Date().toISOString(),
    },
    body,
  };

  const message = `${status === "published" ? "Publish" : "Save"} "${title}" (${slug})`;
  try {
    const store = await getContentStore(locals.contentStore);
    if (origSlug && origSlug !== slug) {
      await store.rename(origSlug, file, { editor, message });
    } else {
      await store.write(file, { editor, message });
    }
  } catch {
    // Dev: the local content agent is likely not running. Prod: the GitHub
    // write driver is deferred. Either way, the save didn't persist.
    return new Response(
      "Could not save. In local dev, ensure the content agent is running (pnpm content:agent). In production, the GitHub write driver isn't configured yet.",
      { status: 503 },
    );
  }

  // Redirect by slug (the edit route keys on slug); slug may have just changed.
  return redirect(`/edit-pages/edit/${slug}?saved=${status}`, 303);
};
