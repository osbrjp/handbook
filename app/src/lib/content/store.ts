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
  localAgentUrl?: string; // dev: the Node content agent (file write + git commit)
  localAgentToken?: string;
  github?: { token?: string; repo?: string; branch?: string };
}

export async function getContentStore(config: ContentStoreConfig): Promise<ContentStore> {
  // Dev: talk to the local content agent (Node) over fetch — it does the real
  // file write + git commit that workerd can't. Prod: the GitHub API driver
  // (deferred until a token + build-on-commit pipeline exist).
  if (config.kind === "local" && config.localAgentUrl) {
    const mod = await import("./store.local");
    return mod.createLocalStore(config.localAgentUrl, config.localAgentToken ?? "dev-agent");
  }
  const mod = await import("./store.github");
  return mod.createGithubStore(config.github ?? {});
}
