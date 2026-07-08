import type { ContentStore, PageFile, WriteOpts, WriteResult } from "./store";
// .ts extensions: this module is also imported by node --test (which strips
// types but does NOT resolve extensionless specifiers).
import { GITHUB_API as API, githubHeaders } from "../githubApi.ts";
import { type ParsedPage, parsePageFile } from "./frontmatter.ts";
import { serializePageFile } from "./serialize.ts";

// Production driver: persist content via the GitHub API, WITH THE SIGNED-IN
// USER'S OWN TOKEN — every save is a commit authored by the actual person
// (real attribution, no bot identity, and GitHub itself refuses the write the
// moment their push access is revoked).
//
// Two modes:
//   "pr" (default — main is PR-protected): a save commits to the edit branch
//        `handbook/<slug>`. "Save draft" stops there (no PR — private WIP);
//        "Submit for approval" ensures ONE pull request per page. Repeat saves
//        stack onto the branch/PR, and the editor RESUMES from the branch (see
//        readDraft) so a second session never clobbers unmerged work. Another
//        editor approves & merges — dashboard or GitHub — and only then is the
//        change live (after rebuild).
//   "direct": straight commit to the base branch (only works where the branch
//        ruleset allows direct pushes).
//
// A merged change appears on the live site after the next rebuild/redeploy
// (content is bundled at build) — the deploy-on-push pipeline is the remaining
// deferred piece.

// Repo-relative home of the content files (mirrors scripts/content-agent.mjs).
const CONTENT_DIR = "app/src/content/pages";
// One edit branch per page. The single source of truth for this prefix —
// reviews.ts imports it (a PR whose head is handbook/* is a handbook edit).
export const EDIT_BRANCH_PREFIX = "handbook/";

export interface GithubConfig {
  token?: string; // the SIGNED-IN USER's token — never a shared credential
  repo?: string; // "owner/name"
  branch?: string; // base branch (default "main")
  mode?: "pr" | "direct";
}

// GitHub's base...ref comparison status ("ahead" = ref has unique commits,
// "behind"/"identical" = nothing unique, "diverged" = both moved), or null if
// the ref/compare isn't available. "ahead"|"diverged" ⇒ real draft/pending work.
async function compareStatus(
  fetchImpl: typeof fetch,
  headers: Record<string, string>,
  repo: string,
  base: string,
  ref: string,
): Promise<string | null> {
  const res = await fetchImpl(
    `${API}/repos/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(ref)}`,
    { headers },
  );
  if (!res.ok) return null;
  return ((await res.json()) as { status?: string }).status ?? null;
}
const hasUniqueCommits = (status: string | null) => status === "ahead" || status === "diverged";

/** UTF-8-safe base64 (btoa alone corrupts multibyte chars). Exported for tests. */
export function toBase64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function fromBase64Utf8(b64: string): string {
  const bin = atob(b64.replace(/\n/g, "")); // the contents API wraps base64 in newlines
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/**
 * The visitor's unmerged work on a page, if any: the page file as it stands on
 * `handbook/<slug>` — but ONLY when that branch has unique commits ("ahead" /
 * "diverged"), i.e. a real draft or pending review. A leftover branch from an
 * already-merged review has nothing unique and returns null, so the editor
 * falls back to the published version. Any API/parse trouble → null (same
 * fallback — never block editing).
 */
export async function readDraft(
  config: GithubConfig,
  slug: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ParsedPage | null> {
  const { token, repo } = config;
  if (!token || !repo) return null;
  const base = await resolveBase(config, fetchImpl);
  const headers = githubHeaders(token);
  const editBranch = `${EDIT_BRANCH_PREFIX}${slug}`;
  try {
    // Only resume when the branch has unique commits (a real draft/pending
    // review); a merged-leftover or missing branch → fall back to published.
    if (!hasUniqueCommits(await compareStatus(fetchImpl, headers, repo, base, editBranch)))
      return null;

    const res = await fetchImpl(
      `${API}/repos/${repo}/contents/${CONTENT_DIR}/${encodeURIComponent(slug)}.md?ref=${encodeURIComponent(editBranch)}`,
      { headers },
    );
    if (!res.ok) return null; // e.g. the draft is a pending DELETE of this page
    const { content } = (await res.json()) as { content?: string };
    if (!content) return null;
    return parsePageFile(fromBase64Utf8(content));
  } catch {
    return null;
  }
}

/**
 * Which branch content work should target. Normally `main` — but during the
 * POC period staging sets GITHUB_BRANCH to the POC branch so editor
 * submissions demo against the code that's actually deployed. The rule is
 * self-retiring: use the configured branch WHILE IT EXISTS; once it's deleted
 * (which happens when its PR merges), everything automatically targets `main`
 * — no config change needed at merge time.
 */
/**
 * Discard a DRAFT-ONLY page (never merged/published): delete its edit branch.
 * GitHub auto-closes any open PR whose head branch is deleted, so this is the
 * whole "discard" in one call. No review step — nothing was ever public.
 * Returns true if a branch existed and was removed; false when there was
 * nothing to discard (404/422 = no such ref). Throws on real API trouble.
 */
export async function discardDraft(
  config: Pick<GithubConfig, "token" | "repo">,
  slug: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const { token, repo } = config;
  if (!token || !repo) return false;
  const res = await fetchImpl(
    `${API}/repos/${repo}/git/refs/${encodeURIComponent(`heads/${EDIT_BRANCH_PREFIX}${slug}`)}`,
    { method: "DELETE", headers: githubHeaders(token, true) },
  );
  if (res.status === 404 || res.status === 422) return false;
  if (!res.ok) throw new Error(`Couldn’t discard the draft (HTTP ${res.status}). Try again.`);
  return true;
}

export async function resolveBase(
  config: GithubConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const configured = config.branch;
  if (!configured || configured === "main") return "main";
  if (!config.token || !config.repo) return configured;
  try {
    const res = await fetchImpl(
      `${API}/repos/${config.repo}/git/ref/${encodeURIComponent(`heads/${configured}`)}`,
      { headers: githubHeaders(config.token) },
    );
    if (res.status === 404) return "main"; // branch merged+deleted → auto-switch
    return configured; // exists (or API trouble — honor the config; ops fail loudly anyway)
  } catch {
    return configured;
  }
}

export type EditState = "pending" | "draft";

/**
 * slug → edit state for the listing chips: "pending" = an open review PR,
 * "draft" = an edit branch with unique commits but no PR. Best-effort — any
 * API trouble yields fewer chips, never an error.
 */
export async function listEditStates(
  config: GithubConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<Record<string, EditState>> {
  const { token, repo } = config;
  if (!token || !repo) return {};
  const base = await resolveBase(config, fetchImpl);
  const headers = githubHeaders(token);
  const states: Record<string, EditState> = {};
  try {
    const [prsRes, branchesRes] = await Promise.all([
      fetchImpl(
        `${API}/repos/${repo}/pulls?state=open&base=${encodeURIComponent(base)}&per_page=100`,
        {
          headers,
        },
      ),
      fetchImpl(`${API}/repos/${repo}/branches?per_page=100`, { headers }),
    ]);
    const prs = prsRes.ok ? ((await prsRes.json()) as Array<{ head: { ref: string } }>) : [];
    const branches = branchesRes.ok ? ((await branchesRes.json()) as Array<{ name: string }>) : [];

    const pending = new Set(
      prs
        .map((p) => p.head.ref)
        .filter((r) => r.startsWith(EDIT_BRANCH_PREFIX))
        .map((r) => r.slice(EDIT_BRANCH_PREFIX.length)),
    );
    for (const slug of pending) states[slug] = "pending";

    // Branches without a PR are drafts only if they hold unique commits
    // (a merged review's leftover branch has none).
    const candidates = branches
      .map((b) => b.name)
      .filter((n) => n.startsWith(EDIT_BRANCH_PREFIX))
      .map((n) => n.slice(EDIT_BRANCH_PREFIX.length))
      .filter((slug) => !pending.has(slug));
    await Promise.all(
      candidates.map(async (slug) => {
        try {
          const status = await compareStatus(
            fetchImpl,
            headers,
            repo,
            base,
            `${EDIT_BRANCH_PREFIX}${slug}`,
          );
          if (hasUniqueCommits(status)) states[slug] = "draft";
        } catch {
          // best-effort
        }
      }),
    );
  } catch {
    // best-effort
  }
  return states;
}

export function createGithubStore(
  config: GithubConfig,
  fetchImpl: typeof fetch = fetch,
): ContentStore {
  const { token, repo } = config;
  const mode = config.mode ?? "pr";
  // Resolved once per store instance (= per request): the configured branch
  // while it exists, else main — see resolveBase.
  let basePromise: Promise<string> | undefined;
  const baseRef = () => {
    basePromise ??= resolveBase(config, fetchImpl);
    return basePromise;
  };
  if (!token || !repo) {
    // No user token in the session (dev-shim login, or a dropped/expired
    // refresh). save.ts turns this into a friendly 503.
    throw new Error(
      "GitHub content store unavailable: sign in with GitHub again to get a fresh write credential.",
    );
  }
  const owner = repo.split("/")[0];
  const headers = githubHeaders(token, true);
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

  // GitHub answers 401/403 — and 404 on a public repo — when a token may not
  // WRITE. Surface that as the human situation ("you can't save here yet"),
  // not API trivia like "branch create failed (404)".
  function writeFailed(what: string, status: number): Error {
    if (status === 401 || status === 403 || status === 404) {
      return new Error(
        "Your GitHub sign-in doesn't have permission to save handbook changes in this environment yet (editing needs the GitHub App set up). Nothing was changed.",
      );
    }
    return new Error(
      `GitHub refused the ${what} (HTTP ${status}). Nothing was changed — try again.`,
    );
  }

  /** Current blob sha of the file on `ref`, or undefined if it doesn't exist. */
  async function getSha(slug: string, ref: string): Promise<string | undefined> {
    const res = await api("GET", `${fileUrl(slug)}?ref=${encodeURIComponent(ref)}`);
    if (res.status === 404) return undefined;
    if (!res.ok)
      throw new Error(`Couldn’t read the page from GitHub (HTTP ${res.status}). Try again.`);
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
    if (!res.ok) throw writeFailed("save", res.status);
  }

  async function del(slug: string, message: string, onBranch: string) {
    const sha = await getSha(slug, onBranch);
    if (!sha) return; // already gone — idempotent, matches the local agent
    const res = await api("DELETE", fileUrl(slug), { message, sha, branch: onBranch });
    if (!res.ok) throw writeFailed("delete", res.status);
  }

  /** The one open review PR for this page's edit branch, if any. */
  async function findOpenPr(
    editBranch: string,
  ): Promise<{ number: number; html_url: string } | undefined> {
    const q = `state=open&base=${encodeURIComponent(await baseRef())}&head=${encodeURIComponent(`${owner}:${editBranch}`)}`;
    const res = await api("GET", `${API}/repos/${repo}/pulls?${q}`);
    if (!res.ok)
      throw new Error(`Couldn’t check for a pending review (HTTP ${res.status}). Try again.`);
    const prs = (await res.json()) as Array<{ number: number; html_url: string }>;
    return prs[0];
  }

  /**
   * Make `handbook/<slug>` exist and be CURRENT: created from the base head, or
   * force-reset to it when it's a leftover from an already-merged/closed review
   * (no open PR). With an open PR, leave it alone — saves stack onto the review.
   */
  async function ensureEditBranch(editBranch: string, hasOpenPr: boolean): Promise<void> {
    const base = await baseRef();
    const headRes = await api(
      "GET",
      `${API}/repos/${repo}/git/ref/${encodeURIComponent(`heads/${base}`)}`,
    );
    if (!headRes.ok)
      throw new Error(`Couldn’t reach the content branch (HTTP ${headRes.status}). Try again.`);
    const baseSha = ((await headRes.json()) as { object: { sha: string } }).object.sha;

    const refUrl = `${API}/repos/${repo}/git/ref/${encodeURIComponent(`heads/${editBranch}`)}`;
    const existing = await api("GET", refUrl);
    if (existing.status === 404) {
      const res = await api("POST", `${API}/repos/${repo}/git/refs`, {
        ref: `refs/heads/${editBranch}`,
        sha: baseSha,
      });
      if (!res.ok) throw writeFailed("save", res.status);
      return;
    }
    if (!existing.ok)
      throw new Error(`Couldn’t check your edit branch (HTTP ${existing.status}). Try again.`);
    if (!hasOpenPr) {
      // Reset ONLY when the branch has no unique commits ("identical"/"behind"
      // = its work was merged or it's empty). A branch that is ahead/diverged
      // holds commits from a save whose PR creation failed — resetting would
      // DESTROY that content (unreachable from any ref), so keep the commits
      // and let ensurePr sweep them into the new review instead.
      const cmp = await api(
        "GET",
        `${API}/repos/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(editBranch)}`,
      );
      if (!cmp.ok)
        throw new Error(`Couldn’t compare your edit branch (HTTP ${cmp.status}). Try again.`);
      const { status } = (await cmp.json()) as { status?: string };
      if (status !== "identical" && status !== "behind") return; // unique commits — preserve
      const res = await api(
        "PATCH",
        `${API}/repos/${repo}/git/refs/${encodeURIComponent(`heads/${editBranch}`)}`,
        { sha: baseSha, force: true },
      );
      if (!res.ok) throw writeFailed("save", res.status);
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
      base: await baseRef(),
      body: `Handbook editor submission by @${opts.editor}.\n\nPage: \`${slug}\` — approve & publish from the handbook review dashboard or merge here.`,
    });
    // 422 "no commits between base and head" = the operation was a no-op
    // (e.g. deleting an already-absent page). Nothing to review.
    if (res.status === 422) return {};
    if (!res.ok) throw writeFailed("review request", res.status);
    const pr = (await res.json()) as { number: number; html_url: string };
    return { reviewNumber: pr.number, reviewUrl: pr.html_url };
  }

  /**
   * Run `mutate(onBranch)` in the right place for the mode. Review mode:
   * commit to the edit branch; on submit (or when a review is already open)
   * make sure the PR exists — a plain draft stays PR-less on the branch.
   */
  async function withMode(
    slug: string,
    title: string,
    opts: WriteOpts,
    mutate: (onBranch: string) => Promise<void>,
  ): Promise<WriteResult | undefined> {
    if (mode === "direct") {
      await mutate(await baseRef());
      return undefined;
    }
    const editBranch = `${EDIT_BRANCH_PREFIX}${slug}`;
    const openPr = await findOpenPr(editBranch);
    await ensureEditBranch(editBranch, !!openPr);
    await mutate(editBranch);
    if (!opts.submit && !openPr) return { draftSaved: true };
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
