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
}

// In PR ("submit for review") mode, a mutation yields the pull request that now
// carries it; empty/void when the change applied directly (local dev, direct mode).
export interface WriteResult {
  reviewNumber?: number;
  reviewUrl?: string;
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
  // token = the USER's session token; mode "pr" = submit-for-review (default)
  github?: { token?: string; repo?: string; branch?: string; mode?: "pr" | "direct" };
}

/** Whether a real write path exists for this request (drives the editor UI). */
export function isWritable(config: ContentStoreConfig): boolean {
  if (config.kind === "local") return !!config.localAgentUrl;
  return !!(config.github?.token && config.github?.repo);
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
