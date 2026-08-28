import type { APIRoute } from "astro";
import { requireEditor } from "../../lib/auth/requireEditor";
import { checkCsrf } from "../../lib/csrf";
import { getEditablePageBySlug } from "../../lib/content/pages";
import { type ContentStore, getContentStore, isWritable } from "../../lib/content/store";
import { discardDraft } from "../../lib/content/store.github";
import { isSafeSlug } from "../../lib/content/serialize";

export const POST: APIRoute = async ({ locals, request, cookies, redirect }) => {
  const denied = requireEditor(locals);
  if (denied) return denied;

  const f = await request.formData();
  if (!checkCsrf(cookies, f.get("csrf"))) return new Response("Bad CSRF token", { status: 403 });

  // Preview-only: buttons are live but there's no write path (see save.ts).
  if (!isWritable(locals.contentStore)) return redirect("/edit-pages?error=readonly", 303);

  const slug = String(f.get("slug") ?? "").trim();
  if (!slug || !isSafeSlug(slug)) return new Response("Invalid page URL", { status: 400 });

  // Not in the published build → either a DRAFT-ONLY page (never merged) or
  // already gone. Draft-only: "delete" = discard the edit branch — no review,
  // nothing was ever public. Already gone: 404 (idempotent for the editor).
  const page = await getEditablePageBySlug(slug);
  if (!page) {
    const gh = locals.contentStore.github;
    if (locals.contentStore.kind === "github" && gh?.token && gh.repo) {
      try {
        if (await discardDraft({ token: gh.token, repo: gh.repo }, slug)) {
          return redirect("/edit-pages?discarded=1", 303);
        }
      } catch (e) {
        const detail = e instanceof Error ? e.message : "unknown error";
        return new Response(`Could not discard the draft. ${detail}`, { status: 503 });
      }
    }
    return new Response(null, { status: 404 });
  }

  let result: Awaited<ReturnType<ContentStore["remove"]>>;
  try {
    const store = await getContentStore(locals.contentStore);
    result = await store.remove(slug, {
      editor: locals.visitor?.login ?? "unknown",
      message: `Delete "${page.title}" (${slug})`,
      submit: true, // a delete is always a review request, never a silent draft
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "unknown error";
    return new Response(`Could not delete. ${detail}`, { status: 503 });
  }

  if (result?.reviewNumber) {
    return redirect(`/edit-pages?submitted=${slug}&pr=${result.reviewNumber}`, 303);
  }
  return redirect("/edit-pages?deleted=1", 303);
};
