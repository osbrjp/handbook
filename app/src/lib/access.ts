import type { Visibility } from "./content/pages";
import type { Visitor } from "./auth/visitor";

// Cache headers for reader responses. Non-public content must never be shared-
// cached by an edge/CDN (red-team R3). A public page may be edge-cached ONLY for
// an anonymous visitor: once a visitor is present the rendered HTML carries their
// identity (GitHub login + an editor link in the page chrome — no emails exist
// in this system), so it must stay private.
export function setReaderCacheHeaders(
  headers: Headers,
  visibility: Visibility,
  visitor: Visitor | null,
): void {
  if (visibility === "public" && !visitor) {
    headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
    return;
  }
  headers.set("Cache-Control", "private, no-store");
  headers.set("Vary", "Cookie");
}
