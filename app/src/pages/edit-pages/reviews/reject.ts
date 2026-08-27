import type { APIRoute } from "astro";
import { requireEditor } from "../../../lib/auth/requireEditor";
import { checkCsrf } from "../../../lib/csrf";
import { rejectReview } from "../../../lib/content/reviews";
import { resolveBase } from "../../../lib/content/store.github";

// Close a pending handbook edit without publishing (discards the submission).
export const POST: APIRoute = async ({ locals, request, cookies, redirect }) => {
  const denied = requireEditor(locals);
  if (denied) return denied;

  const f = await request.formData();
  if (!checkCsrf(cookies, f.get("csrf"))) return new Response("Bad CSRF token", { status: 403 });

  const pr = Number(f.get("pr"));
  if (!Number.isInteger(pr) || pr <= 0) return new Response("Invalid review", { status: 400 });

  const gh = locals.contentStore.github;
  if (!gh?.token || !gh?.repo) {
    return redirect(
      `/edit-pages/reviews?err=${encodeURIComponent("Sign in with GitHub first.")}`,
      303,
    );
  }

  try {
    await rejectReview({ token: gh.token, repo: gh.repo, base: await resolveBase(gh) }, pr);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reject failed.";
    return redirect(`/edit-pages/reviews?err=${encodeURIComponent(msg)}`, 303);
  }
  return redirect(`/edit-pages/reviews?ok=${encodeURIComponent(`Rejected review #${pr}.`)}`, 303);
};
