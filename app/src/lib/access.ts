// Access-control helpers.
//
// IMPORTANT: the actual reader access decision is NOT made here. It is enforced
// SERVER-SIDE BY DIRECTUS (the mature, fail-closed engine) via per-user
// policies. The app fetches content AS THE VISITOR and renders only what comes
// back. These helpers are for cache safety and the (deferred) Google Groups
// seam — never for gating content in app code.

import type { Visibility } from "./directus";

/**
 * Set cache headers for a reader response. Non-public content must never be
 * cached by a shared CDN/edge (red-team R3). Public content may be cached.
 */
export function setReaderCacheHeaders(headers: Headers, visibility: Visibility): void {
  if (visibility === "public") {
    headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
    return;
  }
  // internal / restricted: per-visitor, never shared-cache.
  headers.set("Cache-Control", "private, no-store");
  headers.set("Vary", "Cookie");
}

/**
 * SEAM for the deferred Google Groups → policy sync (requirement 4b).
 *
 * In the POC, group membership is assigned BY HAND in Directus (policies on the
 * user), so this function is NOT used for enforcement. It exists so the
 * pre-prod work — reading real Google Workspace groups via the Admin SDK
 * Directory API (service account + domain-wide delegation) and reconciling them
 * to Directus policies — has a single, obvious place to land.
 */
export async function resolveUserGroups(_user: DirectusUser): Promise<string[]> {
  // POC: groups come from Directus policy assignment, not from here.
  // Pre-prod: replace with Admin SDK Directory API lookup.
  return [];
}
