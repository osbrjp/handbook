import type { APIRoute } from "astro";
import { requireEditor } from "../../lib/auth/requireEditor";
import { checkCsrf } from "../../lib/csrf";
import { getEditablePageBySlug, type Visibility } from "../../lib/content/pages";
import {
  type ContentStore,
  getContentStore,
  isWritable,
  type PageFile,
} from "../../lib/content/store";
import { isSafeSlug } from "../../lib/content/serialize";

const VISIBILITIES = new Set(["public", "internal"]);
const bad = (msg: string) => new Response(msg, { status: 400 });
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// The action comes from the clicked button:
//   draft  → commit the work to the page's edit branch, NO review opened
//            (unless one is already pending — then the commit joins it)
//   submit → commit AND make sure a review (PR) is open for it
// "Published" is not a field — it means MERGED. Local dev has no reviews;
// both actions are just a save there.
export const POST: APIRoute = async ({ locals, request, cookies, redirect }) => {
  const denied = requireEditor(locals);
  if (denied) return denied;

  const f = await request.formData();
  if (!checkCsrf(cookies, f.get("csrf"))) return new Response("Bad CSRF token", { status: 403 });

  // Preview-only environment: the buttons are live (so hover/layout look real)
  // but there's no write path. Bounce back with a friendly error instead of a
  // bare 503, and don't touch the store.
  if (!isWritable(locals.contentStore)) {
    const src = String(f.get("orig_slug") ?? "").trim();
    const back = src && isSafeSlug(src) ? `/edit-pages/edit/${src}` : "/edit-pages/create";
    return redirect(`${back}?error=readonly`, 303);
  }

  const origSlug = String(f.get("orig_slug") ?? "").trim(); // empty on create
  const title = String(f.get("title") ?? "").trim();
  const slug = slugify(String(f.get("slug") ?? "") || title);
  const section = String(f.get("section") ?? "").trim();
  const nav_label = String(f.get("nav_label") ?? "").trim() || title;
  const visibility = String(f.get("visibility") ?? "internal") as Visibility;
  const submit = String(f.get("action") ?? "draft") === "submit";
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
  if (body.length > 256 * 1024) return bad("Body too large (max 256KB)");

  // Slug clash: a DIFFERENT page already occupies this slug/filename.
  const existing = await getEditablePageBySlug(slug);
  if (existing && slug !== origSlug) return bad("That page URL is already in use");

  const editor = locals.visitor?.login ?? "unknown";
  const file: PageFile = {
    slug,
    frontmatter: {
      title,
      section,
      nav_label,
      sort,
      visibility,
      updated_by: editor, // GitHub login — no emails in content files
      updated_at: new Date().toISOString(),
    },
    body,
  };

  const message = `${submit ? "Submit" : "Draft"} "${title}" (${slug})`;
  let result: Awaited<ReturnType<ContentStore["write"]>>;
  try {
    const store = await getContentStore(locals.contentStore);
    if (origSlug && origSlug !== slug) {
      result = await store.rename(origSlug, file, { editor, message, submit });
    } else {
      result = await store.write(file, { editor, message, submit });
    }
  } catch (e) {
    // Dev: the local content agent is likely not running (pnpm content:agent).
    // Prod: no/expired user token, or a GitHub-side edit conflict — the store's
    // message says which, and it never contains the token.
    const detail = e instanceof Error ? e.message : "unknown error";
    return new Response(`Could not save. ${detail}`, { status: 503 });
  }

  // Review mode: the change lives on the edit branch / its PR, NOT in the
  // built content — the edit route for a brand-new page would 404, so land on
  // the listing with the appropriate banner.
  if (result?.reviewNumber) {
    return redirect(`/edit-pages?submitted=${slug}&pr=${result.reviewNumber}`, 303);
  }
  if (result?.draftSaved) {
    return redirect(`/edit-pages?drafted=${slug}`, 303);
  }
  // Local dev: the file was written directly; back to the editor.
  return redirect(`/edit-pages/edit/${slug}?saved=1`, 303);
};
