import type { ContentStore, PageFile, WriteOpts } from "./store";
// .ts extension: this module is also imported by node --test (which strips
// types but does NOT resolve extensionless specifiers).
import { serializePageFile } from "./serialize.ts";

// Production driver: commit content via the GitHub Contents API, WITH THE
// SIGNED-IN USER'S OWN TOKEN — every save is a commit authored by the actual
// person (real attribution, no bot identity, and GitHub itself refuses the
// write the moment their push access is revoked). The token comes from the
// session (GitHub App user token, refreshed by the middleware).
//
// A committed change appears on the live site after the next rebuild/redeploy
// (content is bundled at build) — the deploy-on-push pipeline is the remaining
// deferred piece.

const API = "https://api.github.com";
const UA = "osbr-handbook";
// Repo-relative home of the content files (mirrors scripts/content-agent.mjs).
const CONTENT_DIR = "app/src/content/pages";

export interface GithubConfig {
  token?: string; // the SIGNED-IN USER's token — never a shared credential
  repo?: string; // "owner/name"
  branch?: string; // omitted -> the repo's default branch
}

/** UTF-8-safe base64 (btoa alone corrupts multibyte chars). Exported for tests. */
export function toBase64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function createGithubStore(
  config: GithubConfig,
  fetchImpl: typeof fetch = fetch,
): ContentStore {
  const { token, repo, branch } = config;
  if (!token || !repo) {
    // No user token in the session (dev-shim login, or a dropped/expired
    // refresh). save.ts turns this into a friendly 503.
    throw new Error(
      "GitHub content store unavailable: sign in with GitHub again to get a fresh write credential.",
    );
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": UA,
    "Content-Type": "application/json",
  };
  // slug is isSafeSlug-validated upstream ([a-z0-9-]); encode it anyway.
  const fileUrl = (slug: string) =>
    `${API}/repos/${repo}/contents/${CONTENT_DIR}/${encodeURIComponent(slug)}.md`;

  /** Current blob sha of the file, or undefined if it doesn't exist. */
  async function getSha(slug: string): Promise<string | undefined> {
    const q = branch ? `?ref=${encodeURIComponent(branch)}` : "";
    const res = await fetchImpl(fileUrl(slug) + q, { headers });
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`github read failed (${res.status})`);
    const json = (await res.json()) as { sha?: string };
    return json.sha;
  }

  async function put(slug: string, text: string, message: string, sha?: string): Promise<void> {
    const body: Record<string, unknown> = { message, content: toBase64Utf8(text) };
    if (sha) body.sha = sha; // update: sha makes concurrent edits 409, not clobber
    if (branch) body.branch = branch;
    const res = await fetchImpl(fileUrl(slug), {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    if (res.status === 409 || res.status === 422) {
      throw new Error(
        "Edit conflict: this page changed on GitHub since you loaded it. Reload and re-apply your change.",
      );
    }
    if (!res.ok) throw new Error(`github write failed (${res.status})`);
  }

  async function del(slug: string, message: string): Promise<void> {
    const sha = await getSha(slug);
    if (!sha) return; // already gone — idempotent, matches the local agent
    const body: Record<string, unknown> = { message, sha };
    if (branch) body.branch = branch;
    const res = await fetchImpl(fileUrl(slug), {
      method: "DELETE",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`github delete failed (${res.status})`);
  }

  return {
    async write(file: PageFile, opts: WriteOpts) {
      const sha = await getSha(file.slug);
      await put(file.slug, serializePageFile(file.frontmatter, file.body), opts.message, sha);
    },
    async rename(oldSlug: string, file: PageFile, opts: WriteOpts) {
      // New path FIRST, old path second: a mid-rename failure can leave a
      // duplicate (harmless, visible) but never lose the content.
      const sha = await getSha(file.slug);
      await put(file.slug, serializePageFile(file.frontmatter, file.body), opts.message, sha);
      await del(oldSlug, opts.message);
    },
    async remove(slug: string, opts: WriteOpts) {
      await del(slug, opts.message);
    },
  };
}
