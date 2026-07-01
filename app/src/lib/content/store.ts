import type { PageMeta } from "./acl";

// The editor writes CONTENT AS FILES (git), not DB rows. The SSR runtime is
// workerd (dev AND prod) — no local filesystem, no child_process — so the ONLY
// way to persist from a request is over the network: commit via the GitHub API.
// That driver (fetch-based) is DEFERRED for now (needs a repo-scoped token + a
// build-on-commit pipeline), so in-browser editing is stubbed; content is edited
// by committing markdown to the repo directly. See store.github.ts.

export interface PageFile {
  slug: string;
  frontmatter: PageMeta;
  body: string;
}
export interface WriteOpts {
  editorEmail: string;
  message: string; // commit message
}

export interface ContentStore {
  write(file: PageFile, opts: WriteOpts): Promise<void>;
  rename(oldSlug: string, file: PageFile, opts: WriteOpts): Promise<void>;
  remove(slug: string, opts: WriteOpts): Promise<void>;
}

export interface ContentStoreConfig {
  kind: "local" | "github";
  github?: { token?: string; repo?: string; branch?: string };
}

export async function getContentStore(config: ContentStoreConfig): Promise<ContentStore> {
  // Only the GitHub (network) driver can run in workerd. It is deferred for now,
  // so its methods throw a clear "not enabled" error until a token + pipeline
  // are wired. Kept as the single, forward-looking write path.
  const mod = await import("./store.github");
  return mod.createGithubStore(config.github ?? {});
}
