import type { APIRoute } from "astro";
import { requireEditor } from "../../../lib/auth/requireEditor";
import { checkCsrf } from "../../../lib/csrf";
import { approveAndPublish } from "../../../lib/content/reviews";
import { resolveBase } from "../../../lib/content/store.github";

// Approve + merge a pending handbook edit AS THE SIGNED-IN EDITOR. GitHub
// enforces the ruleset (checks, no self-approval) — we just surface its answer.
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
    await approveAndPublish({ token: gh.token, repo: gh.repo, base: await resolveBase(gh) }, pr);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Approve failed.";
    return redirect(`/edit-pages/reviews?err=${encodeURIComponent(msg)}`, 303);
  }
  return redirect(
    `/edit-pages/reviews?ok=${encodeURIComponent(`Published review #${pr}. It appears on the site after the next deploy.`)}`,
    303,
  );
};
