import type { ContentStore, PageFile, WriteOpts, WriteResult } from "./store";
// .ts extension: this module is also imported by node --test (which strips
// types but does NOT resolve extensionless specifiers).
import { serializePageFile } from "./serialize.ts";

// Production driver: persist content via the GitHub API, WITH THE SIGNED-IN
// USER'S OWN TOKEN — every save is a commit authored by the actual person
// (real attribution, no bot identity, and GitHub itself refuses the write the
// moment their push access is revoked).
//
// Two modes:
//   "pr" (default — main is PR-protected): a save commits to an edit branch
//        `handbook/<slug>` and opens ONE pull request per page ("submit for
//        review"). Repeat saves stack commits onto the same open PR. An admin
//        approves & merges — from the in-app review dashboard or on GitHub —
//        and only then is the change live (after rebuild). NOTE: while a page
//        has a pending review, the editor still loads the PUBLISHED version,
//        so a second edit round starts from that, not the pending text.
//   "direct": straight commit to the base branch (only works where the branch
//        ruleset allows direct pushes).
//
// A merged change appears on the live site after the next rebuild/redeploy
// (content is bundled at build) — the deploy-on-push pipeline is the remaining
// deferred piece.

const API = "https://api.github.com";
const UA = "osbr-handbook";
// Repo-relative home of the content files (mirrors scripts/content-agent.mjs).
const CONTENT_DIR = "app/src/content/pages";
const EDIT_BRANCH_PREFIX = "handbook/";

export interface GithubConfig {
  token?: string; // the SIGNED-IN USER's token — never a shared credential
  repo?: string; // "owner/name"
  branch?: string; // base branch (default "main")
  mode?: "pr" | "direct";
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
  const { token, repo } = config;
  const base = config.branch || "main";
  const mode = config.mode ?? "pr";
  if (!token || !repo) {
    // No user token in the session (dev-shim login, or a dropped/expired
    // refresh). save.ts turns this into a friendly 503.
    throw new Error(
      "GitHub content store unavailable: sign in with GitHub again to get a fresh write credential.",
    );
  }
  const owner = repo.split("/")[0];
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": UA,
    "Content-Type": "application/json",
  };
  // slug is isSafeSlug-validated upstream ([a-z0-9-]); encode it anyway.
  const fileUrl = (slug: string) =>
    `${API}/repos/${repo}/contents/${CONTENT_DIR}/${encodeURIComponent(slug)}.md`;

  async function api(method: string, url: string, body?: unknown): Promise<Response> {
    return fetchImpl(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  /** Current blob sha of the file on `ref`, or undefined if it doesn't exist. */
  async function getSha(slug: string, ref: string): Promise<string | undefined> {
    const res = await api("GET", `${fileUrl(slug)}?ref=${encodeURIComponent(ref)}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`github read failed (${res.status})`);
    const json = (await res.json()) as { sha?: string };
    return json.sha;
  }

  async function put(slug: string, text: string, message: string, onBranch: string, sha?: string) {
    const body: Record<string, unknown> = {
      message,
      content: toBase64Utf8(text),
      branch: onBranch,
    };
    if (sha) body.sha = sha; // update: sha makes concurrent edits 409, not clobber
    const res = await api("PUT", fileUrl(slug), body);
    if (res.status === 409 || res.status === 422) {
      throw new Error(
        "Edit conflict: this page changed on GitHub since you loaded it. Reload and re-apply your change.",
      );
    }
    if (!res.ok) throw new Error(`github write failed (${res.status})`);
  }

  async function del(slug: string, message: string, onBranch: string) {
    const sha = await getSha(slug, onBranch);
    if (!sha) return; // already gone — idempotent, matches the local agent
    const res = await api("DELETE", fileUrl(slug), { message, sha, branch: onBranch });
    if (!res.ok) throw new Error(`github delete failed (${res.status})`);
  }

  /** The one open review PR for this page's edit branch, if any. */
  async function findOpenPr(
    editBranch: string,
  ): Promise<{ number: number; html_url: string } | undefined> {
    const q = `state=open&base=${encodeURIComponent(base)}&head=${encodeURIComponent(`${owner}:${editBranch}`)}`;
    const res = await api("GET", `${API}/repos/${repo}/pulls?${q}`);
    if (!res.ok) throw new Error(`github pr lookup failed (${res.status})`);
    const prs = (await res.json()) as Array<{ number: number; html_url: string }>;
    return prs[0];
  }

  /**
   * Make `handbook/<slug>` exist and be CURRENT: created from the base head, or
   * force-reset to it when it's a leftover from an already-merged/closed review
   * (no open PR). With an open PR, leave it alone — saves stack onto the review.
   */
  async function ensureEditBranch(editBranch: string, hasOpenPr: boolean): Promise<void> {
    const headRes = await api(
      "GET",
      `${API}/repos/${repo}/git/ref/${encodeURIComponent(`heads/${base}`)}`,
    );
    if (!headRes.ok) throw new Error(`github base ref failed (${headRes.status})`);
    const baseSha = ((await headRes.json()) as { object: { sha: string } }).object.sha;

    const refUrl = `${API}/repos/${repo}/git/ref/${encodeURIComponent(`heads/${editBranch}`)}`;
    const existing = await api("GET", refUrl);
    if (existing.status === 404) {
      const res = await api("POST", `${API}/repos/${repo}/git/refs`, {
        ref: `refs/heads/${editBranch}`,
        sha: baseSha,
      });
      if (!res.ok) throw new Error(`github branch create failed (${res.status})`);
      return;
    }
    if (!existing.ok) throw new Error(`github branch lookup failed (${existing.status})`);
    if (!hasOpenPr) {
      const res = await api(
        "PATCH",
        `${API}/repos/${repo}/git/refs/${encodeURIComponent(`heads/${editBranch}`)}`,
        { sha: baseSha, force: true },
      );
      if (!res.ok) throw new Error(`github branch reset failed (${res.status})`);
    }
  }

  async function ensurePr(
    editBranch: string,
    existing: { number: number; html_url: string } | undefined,
    title: string,
    opts: WriteOpts,
    slug: string,
  ): Promise<WriteResult> {
    if (existing) return { reviewNumber: existing.number, reviewUrl: existing.html_url };
    const res = await api("POST", `${API}/repos/${repo}/pulls`, {
      title,
      head: editBranch,
      base,
      body: `Handbook editor submission by @${opts.editor}.\n\nPage: \`${slug}\` — approve & publish from the handbook review dashboard or merge here.`,
    });
    // 422 "no commits between base and head" = the operation was a no-op
    // (e.g. deleting an already-absent page). Nothing to review.
    if (res.status === 422) return {};
    if (!res.ok) throw new Error(`github pr create failed (${res.status})`);
    const pr = (await res.json()) as { number: number; html_url: string };
    return { reviewNumber: pr.number, reviewUrl: pr.html_url };
  }

  /** Run `mutate(onBranch)` in the right place for the mode; PR mode wraps it in a review. */
  async function withMode(
    slug: string,
    title: string,
    opts: WriteOpts,
    mutate: (onBranch: string) => Promise<void>,
  ): Promise<WriteResult | undefined> {
    if (mode === "direct") {
      await mutate(base);
      return undefined;
    }
    const editBranch = `${EDIT_BRANCH_PREFIX}${slug}`;
    const openPr = await findOpenPr(editBranch);
    await ensureEditBranch(editBranch, !!openPr);
    await mutate(editBranch);
    return ensurePr(editBranch, openPr, title, opts, slug);
  }

  return {
    async write(file: PageFile, opts: WriteOpts) {
      return withMode(file.slug, opts.message, opts, async (onBranch) => {
        const sha = await getSha(file.slug, onBranch);
        await put(
          file.slug,
          serializePageFile(file.frontmatter, file.body),
          opts.message,
          onBranch,
          sha,
        );
      });
    },
    async rename(oldSlug: string, file: PageFile, opts: WriteOpts) {
      // One branch (keyed by the NEW slug) carries both halves of the rename.
      // New path FIRST, old path second: a mid-rename failure can leave a
      // duplicate (harmless, visible) but never lose the content.
      return withMode(file.slug, opts.message, opts, async (onBranch) => {
        const sha = await getSha(file.slug, onBranch);
        await put(
          file.slug,
          serializePageFile(file.frontmatter, file.body),
          opts.message,
          onBranch,
          sha,
        );
        await del(oldSlug, opts.message, onBranch);
      });
    },
    async remove(slug: string, opts: WriteOpts) {
      return withMode(slug, opts.message, opts, async (onBranch) => {
        await del(slug, opts.message, onBranch);
      });
    },
  };
}
