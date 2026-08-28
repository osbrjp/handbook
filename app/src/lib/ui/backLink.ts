// Wire a "back" link/button to return to the previous page (history.back) when
// it's safe to do so — i.e. there IS a same-origin referrer in this tab's
// history. Otherwise the element's own href is used as the fallback. Shared by
// the editor "Back without saving" and the Pages "Back to handbook" links.
export function wireBackLink(id: string): void {
  const el = document.getElementById(id);
  el?.addEventListener("click", (e) => {
    let sameOrigin = false;
    try {
      sameOrigin = !!document.referrer && new URL(document.referrer).origin === location.origin;
    } catch {
      sameOrigin = false;
    }
    if (window.history.length > 1 && sameOrigin) {
      e.preventDefault();
      history.back();
    }
  });
}
