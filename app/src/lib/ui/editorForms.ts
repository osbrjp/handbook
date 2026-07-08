// Shared client helpers for the editor's write forms (save/submit/delete),
// used by both EditorForm.astro and the Pages listing. Bundled into the page
// <script> like ./backLink. Keeps the "environment check first, then a
// popup-not-a-raw-error-page" behaviour identical across every write button.

/** Show the app-wide alert dialog (rendered once via AlertDialog.astro). */
export function showAlert(msg: string): void {
  document.dispatchEvent(new CustomEvent("app:alert", { detail: msg }));
}

/** Shown when a write is attempted in a preview-only environment (no write path). */
export const READONLY_MSG =
  "Saving isn't enabled in this environment (preview only). Editing needs the production setup (a GitHub App on the repo); otherwise commit the markdown to the repository directly.";

/**
 * A failure message safe to show a human. Our endpoints answer text/plain, so
 * only a short plain-text body is shown verbatim; anything else (a rendered
 * HTML error/404 page) becomes a friendly status message instead of a wall of
 * page source in the popup.
 */
async function failureMessage(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/plain")) {
    const t = (await res.text().catch(() => "")).trim();
    if (t && t.length <= 400) return t;
  }
  if (res.status === 403) return "Your session needs a refresh — reload the page and try again.";
  if (res.status === 404)
    return "Save failed: the server couldn't find your editor session (it may have expired) — reload the page and try again.";
  return READONLY_MSG;
}

/**
 * POST a form via fetch so a failure shows the popup instead of navigating to
 * a raw error page; on success, follow the server's 303 redirect. `submitter`
 * carries the clicked button's name/value (action=draft|submit) — with a
 * fallback for browsers that ignore FormData's second arg (else a Submit would
 * silently save as a draft).
 */
export async function submitForm(
  form: HTMLFormElement,
  submitter?: HTMLElement | null,
): Promise<void> {
  const fd = new FormData(form, submitter ?? undefined);
  const btn = submitter as HTMLButtonElement | null;
  if (btn?.name && !fd.has(btn.name)) fd.append(btn.name, btn.value);
  // getAttribute, NOT form.action: the draft/submit buttons are name="action",
  // and named fields SHADOW the property — form.action then returns a
  // RadioNodeList that stringifies into the URL ("/edit-pages/[object
  // RadioNodeList]" → 404). The attribute is immune to that clobbering.
  const url = form.getAttribute("action") || window.location.pathname;
  try {
    const res = await fetch(url, {
      method: "POST",
      body: fd,
      headers: { "X-Requested-With": "fetch" },
    });
    if (res.ok) {
      window.location.href = res.url; // the saved/submitted landing page
      return;
    }
    showAlert(await failureMessage(res));
  } catch {
    showAlert("Couldn't reach the server — check your connection and try again.");
  }
}
