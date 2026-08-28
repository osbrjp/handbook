// Shared client helpers for the editor's write forms (save/submit/delete),
// used by both EditorForm.astro and the Pages listing. Bundled into the page
// <script> like ./backLink. Keeps the "environment check first, then a
// popup-not-a-raw-error-page" behaviour identical across every write button.

/** Show the app-wide alert dialog (rendered once via AlertDialog.astro). */
export function showAlert(msg: string): void {
  document.dispatchEvent(new CustomEvent("app:alert", { detail: msg }));
}

// bfcache: pressing Back can restore a page frozen mid-submit — busy flag set,
// button disabled and reading "Submitting…". Reload to reset that state (only
// when it exists; normal Back navigations are untouched).
window.addEventListener("pageshow", (e) => {
  if ((e as PageTransitionEvent).persisted && document.querySelector("form[data-busy]")) {
    window.location.reload();
  }
});

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
    return "That didn't go through — the page/draft may already be deleted, or your session expired. Reload the page and try again.";
  return READONLY_MSG;
}

/**
 * POST a form via fetch so a failure shows the popup instead of navigating to
 * a raw error page; on success, follow the server's 303 redirect. `submitter`
 * carries the clicked button's name/value (action=draft|submit) — with a
 * fallback for browsers that ignore FormData's second arg (else a Submit would
 * silently save as a draft).
 */
/**
 * Wire a <dialog>-based delete confirmation (Pages listing + editor share the
 * exact shape). Rules kept in ONE place: environment check FIRST on open AND
 * on confirm (readonly → friendly popup, never a doomed round-trip); confirm
 * submits via fetch so failures pop up too. `onOpen` lets the listing stuff
 * per-row data (slug/title) into the dialog before it shows.
 */
export function wireConfirmDelete(o: {
  dialog: HTMLDialogElement | null;
  form: HTMLFormElement | null;
  openButtons: Iterable<HTMLElement>;
  cancel: HTMLElement | null;
  readonly: boolean;
  onOpen?: (btn: HTMLElement) => void;
}): void {
  for (const btn of o.openButtons) {
    btn.addEventListener("click", () => {
      if (o.readonly) return showAlert(READONLY_MSG);
      o.onOpen?.(btn);
      o.dialog?.showModal();
    });
  }
  o.cancel?.addEventListener("click", () => o.dialog?.close());
  o.form?.addEventListener("submit", (e) => {
    e.preventDefault();
    o.dialog?.close();
    if (o.readonly) return showAlert(READONLY_MSG);
    if (o.form) submitForm(o.form, (e as SubmitEvent).submitter);
  });
}

export async function submitForm(
  form: HTMLFormElement,
  submitter?: HTMLElement | null,
): Promise<void> {
  // Re-entry guard + busy state: a submit fans out into several GitHub API
  // round-trips (seconds) — without feedback the click feels dead and invites
  // double-submits. Button shows its data-busy label until we navigate away.
  if (form.dataset.busy) return;
  form.dataset.busy = "1";
  const fd = new FormData(form, submitter ?? undefined);
  const btn = submitter as HTMLButtonElement | null;
  if (btn?.name && !fd.has(btn.name)) fd.append(btn.name, btn.value);
  const originalLabel = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.textContent = btn.dataset.busy ?? "Working…";
  }
  const done = () => {
    delete form.dataset.busy;
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalLabel ?? "";
    }
  };
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
      return; // keep the busy state — we're navigating
    }
    done();
    showAlert(await failureMessage(res));
  } catch {
    done();
    showAlert("Couldn't reach the server — check your connection and try again.");
  }
}
