import type { Visibility } from "./db/pages";

// Cache headers for reader responses. Non-public content must never be shared-
// cached by an edge/CDN (red-team R3). Public content may be cached.
export function setReaderCacheHeaders(headers: Headers, visibility: Visibility): void {
  if (visibility === "public") {
    headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
    return;
  }
  headers.set("Cache-Control", "private, no-store");
  headers.set("Vary", "Cookie");
}
