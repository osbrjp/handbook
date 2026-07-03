import type { PageMeta } from "./acl";

// The editor writes CONTENT AS FILES (git), not DB rows. The SSR runtime is
// workerd (dev AND prod) — no local filesystem, no child_process — so the ONLY
// way to persist from a request is over the network. Two drivers:
//   dev  (DEV_LOGIN=1): the local content agent (Node) writes the file + commits
//   prod: the GitHub Contents API, using the SIGNED-IN USER's own token — every
//         save is a commit authored by the actual person (see store.github.ts)

export interface PageFile {
  slug: string;
  frontmatter: PageMeta;
  body: string;
}
export interface WriteOpts {
  editor: string; // GitHub login of the signed-in editor (commit attribution)
  message: string; // commit message
  // true  → make sure a review (PR) is open for this page ("Submit for approval")
  // false → draft: commit to the edit branch only; if a review is ALREADY open
  //         the commit joins it (you can't draft "behind" a pending review)
  submit?: boolean;
}

// Review mode outcomes: the PR now carrying the change, or draftSaved when the
// work went to the edit branch with no review open. Void when the change
// applied directly (local dev, direct mode).
export interface WriteResult {
  reviewNumber?: number;
  reviewUrl?: string;
  draftSaved?: boolean;
}

export interface ContentStore {
  write(file: PageFile, opts: WriteOpts): Promise<WriteResult | void>;
  rename(oldSlug: string, file: PageFile, opts: WriteOpts): Promise<WriteResult | void>;
  remove(slug: string, opts: WriteOpts): Promise<WriteResult | void>;
}

export interface ContentStoreConfig {
  kind: "local" | "github";
  localAgentUrl?: string; // dev: the Node content agent (file write + git commit)
  localAgentToken?: string;
  // token = the USER's session token; mode "pr" = submit-for-review (default).
  // writeEnabled = this environment can ACTUALLY persist writes: the login
  // token carries write scope (a GitHub App is installed). Our plain OAuth App
  // grants NO scopes, so until the App is set up this is false and the editor
  // is preview-only — the write buttons short-circuit client-side instead of
  // attempting a doomed round-trip.
  github?: {
    token?: string;
    repo?: string;
    branch?: string;
    mode?: "pr" | "direct";
    writeEnabled?: boolean;
  };
}

/**
 * Whether a real write path exists for this request (drives the editor UI AND
 * the client-side "check the environment first" short-circuit). This is the
 * SINGLE source of truth for "can we save here" — the buttons, the banners and
 * save.ts all read it, so a doomed environment never gets past the first check.
 */
export function isWritable(config: ContentStoreConfig): boolean {
  if (config.kind === "local") return !!config.localAgentUrl;
  return !!(config.github?.token && config.github?.repo && config.github?.writeEnabled);
}

/** Whether saves become submit-for-review PRs (drives editor banners/labels). */
export function isReviewMode(config: ContentStoreConfig): boolean {
  return config.kind === "github" && config.github?.mode !== "direct";
}

export async function getContentStore(config: ContentStoreConfig): Promise<ContentStore> {
  // Dev: talk to the local content agent (Node) over fetch — it does the real
  // file write + git commit that workerd can't. Prod: the GitHub Contents API
  // with the signed-in user's token (per-person commits).
  if (config.kind === "local" && config.localAgentUrl) {
    const mod = await import("./store.local");
    return mod.createLocalStore(config.localAgentUrl, config.localAgentToken ?? "dev-agent");
  }
  const mod = await import("./store.github");
  return mod.createGithubStore(config.github ?? {});
}
