import type { ContentStore, PageFile, WriteOpts } from "./store";

// Production driver: commit content to the repo via the GitHub API (fetch-only,
// so it runs in the Worker). DEFERRED — like the OAuth/DEV_LOGIN shim, the
// wiring is here but it is intentionally not active until a repo-scoped token
// is provisioned and a build-on-commit pipeline exists. A committed change goes
// live only after that rebuild/redeploy (the accepted "edits live in minutes").
//
// Implementation notes for when this is turned on:
//   - Use a GitHub App installation token (contents:write, single repo), NOT a
//     broad PAT; store the App key as a Worker secret. Never log it.
//   - PUT /repos/{repo}/contents/{path} to create/update (send the current blob
//     `sha` on update so concurrent edits 409 instead of clobbering).
//   - Rename = PUT new path + DELETE old path (or one Git Data API tree commit
//     for atomicity). Delete = DELETE /repos/{repo}/contents/{path}.
//   - Validate the API `path` server-side (slug already isSafeSlug-checked).

export interface GithubConfig {
  token?: string;
  repo?: string; // "owner/name"
  branch?: string;
}

function notConfigured(): never {
  throw new Error(
    "GitHub content store is not configured (deferred). Set CONTENT_STORE=local for dev, " +
      "or provision GITHUB_TOKEN/GITHUB_REPO + a build-on-commit pipeline for production.",
  );
}

export function createGithubStore(_config: GithubConfig): ContentStore {
  return {
    async write(_file: PageFile, _opts: WriteOpts) {
      notConfigured();
    },
    async rename(_oldSlug: string, _file: PageFile, _opts: WriteOpts) {
      notConfigured();
    },
    async remove(_slug: string, _opts: WriteOpts) {
      notConfigured();
    },
  };
}
