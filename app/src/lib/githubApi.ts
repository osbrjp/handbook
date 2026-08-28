// The ONE place for GitHub REST plumbing shared by every module that talks to
// the API (auth/github.ts, content/store.github.ts, content/reviews.ts):
// base URL, User-Agent (GitHub rejects requests without one — workerd sets
// none), and the standard header set. Error semantics stay with the callers.

export const GITHUB_API = "https://api.github.com";
export const GITHUB_UA = "osbr-handbook";

/** Standard headers for a GitHub API call with a bearer token. */
export function githubHeaders(token: string, withJsonBody = false): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": GITHUB_UA,
  };
  if (withJsonBody) h["Content-Type"] = "application/json";
  return h;
}
