// Review-dashboard API layer: the pending handbook edits are OPEN PULL REQUESTS
// from `handbook/<slug>` branches, and "approve & publish" is a real GitHub
// review + merge — performed AS THE SIGNED-IN EDITOR (their session token), so
// the branch ruleset (1 approval, run-tests) is fully honored. GitHub also
// enforces you can't approve your own submission (→ a 2-person review).

// .ts extensions: imported by node --test too (no extensionless resolution).
import { GITHUB_API as API, githubHeaders } from "../githubApi.ts";
import { EDIT_BRANCH_PREFIX } from "./store.github.ts";

export interface ReviewsConfig {
  token: string; // the signed-in editor's session token
  repo: string; // "owner/name"
  base: string; // base branch the reviews target
}

/**
 * Validate a ?pr/?submitted-style query param (numeric PR number) and build
 * its GitHub link. The number comes from a redirect WE issued, but it's still
 * a URL param — validate before echoing; the URL is built from the
 * server-known repo, never from user input.
 */
export function prLinkFromParam(
  repo: string | undefined,
  raw: string | null,
): { number: string; url: string | null } | null {
  if (!raw || !/^[0-9]{1,8}$/.test(raw)) return null;
  return { number: raw, url: repo ? `https://github.com/${repo}/pull/${raw}` : null };
}

/**
 * Human label for a review: our own save/delete flows title PRs in
 * commit-speak (`Submit "X" (slug)` / `Delete "X" (slug)`) — show a
 * non-technical reviewer just X. Titles that don't match (hand-made PRs)
 * pass through untouched.
 */
export function reviewLabel(title: string): string {
  const m = /^(?:Submit|Draft|Delete) "(.+)" \([a-z0-9-]+\)$/.exec(title);
  return m ? m[1] : title;
}

export type ChecksState = "passing" | "failing" | "pending" | "none";

export interface ReviewItem {
  number: number;
  url: string;
  slug: string;
  title: string;
  author: string;
  updatedAt: string;
  checks: ChecksState;
}

const headers = (token: string) => githubHeaders(token, true);

/** Roll individual check runs up into one badge state. Exported for tests. */
export function rollupChecks(
  runs: Array<{ status: string; conclusion: string | null }>,
): ChecksState {
  if (runs.length === 0) return "none";
  if (runs.some((r) => r.status !== "completed")) return "pending";
  return runs.every((r) => r.conclusion === "success" || r.conclusion === "skipped")
    ? "passing"
    : "failing";
}

/**
 * Open handbook-edit PRs, newest first.
 *
 * KNOWN N+1: one check-runs call per open review (parallelized, editor-only
 * page, ≤50 PRs) — fine at this scale. If it ever matters, replace with a
 * single GraphQL query using `statusCheckRollup` across all PRs.
 */
export async function listReviews(
  cfg: ReviewsConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<ReviewItem[]> {
  const h = headers(cfg.token); // reused across the list + per-PR check calls
  const res = await fetchImpl(
    `${API}/repos/${cfg.repo}/pulls?state=open&base=${encodeURIComponent(cfg.base)}&per_page=50&sort=updated&direction=desc`,
    { headers: h },
  );
  if (!res.ok) throw new Error(`review list failed (${res.status})`);
  const prs = (await res.json()) as Array<{
    number: number;
    html_url: string;
    title: string;
    updated_at: string;
    user: { login: string };
    head: { ref: string; sha: string };
  }>;
  const edits = prs.filter((p) => p.head.ref.startsWith(EDIT_BRANCH_PREFIX));

  return Promise.all(
    edits.map(async (p) => {
      let checks: ChecksState = "none";
      try {
        const cr = await fetchImpl(
          `${API}/repos/${cfg.repo}/commits/${p.head.sha}/check-runs?per_page=50`,
          { headers: h },
        );
        if (cr.ok) {
          const json = (await cr.json()) as {
            check_runs: Array<{ status: string; conclusion: string | null }>;
          };
          checks = rollupChecks(json.check_runs ?? []);
        }
      } catch {
        // checks state is cosmetic — the merge itself is still gated by GitHub
      }
      return {
        number: p.number,
        url: p.html_url,
        slug: p.head.ref.slice(EDIT_BRANCH_PREFIX.length),
        title: p.title,
        author: p.user.login,
        updatedAt: p.updated_at,
        checks,
      };
    }),
  );
}

/**
 * One pending review, for the internal review page. Null when the PR doesn't
 * exist, isn't open, isn't a handbook edit (head not on an edit branch), or
 * targets a different base — the review UI only ever operates on our own
 * edit PRs, everything else 404s.
 */
export async function getReview(
  cfg: ReviewsConfig,
  number: number,
  fetchImpl: typeof fetch = fetch,
): Promise<ReviewItem | null> {
  const h = headers(cfg.token);
  const res = await fetchImpl(`${API}/repos/${cfg.repo}/pulls/${number}`, { headers: h });
  if (!res.ok) return null;
  const p = (await res.json()) as {
    number: number;
    html_url: string;
    title: string;
    updated_at: string;
    state: string;
    user: { login: string };
    head: { ref: string; sha: string };
    base: { ref: string };
  };
  if (p.state !== "open" || !p.head.ref.startsWith(EDIT_BRANCH_PREFIX) || p.base.ref !== cfg.base)
    return null;
  let checks: ChecksState = "none";
  try {
    const cr = await fetchImpl(
      `${API}/repos/${cfg.repo}/commits/${p.head.sha}/check-runs?per_page=50`,
      { headers: h },
    );
    if (cr.ok) {
      const json = (await cr.json()) as {
        check_runs: Array<{ status: string; conclusion: string | null }>;
      };
      checks = rollupChecks(json.check_runs ?? []);
    }
  } catch {
    // cosmetic — same as listReviews
  }
  return {
    number: p.number,
    url: p.html_url,
    slug: p.head.ref.slice(EDIT_BRANCH_PREFIX.length),
    title: p.title,
    author: p.user.login,
    updatedAt: p.updated_at,
    checks,
  };
}

async function headRef(cfg: ReviewsConfig, number: number, fetchImpl: typeof fetch) {
  const res = await fetchImpl(`${API}/repos/${cfg.repo}/pulls/${number}`, {
    headers: headers(cfg.token),
  });
  if (!res.ok) throw new Error(`review lookup failed (${res.status})`);
  const pr = (await res.json()) as { head: { ref: string } };
  return pr.head.ref;
}

async function deleteBranch(cfg: ReviewsConfig, ref: string, fetchImpl: typeof fetch) {
  // Cleanup only — a failure here never fails the operation.
  await fetchImpl(`${API}/repos/${cfg.repo}/git/refs/${encodeURIComponent(`heads/${ref}`)}`, {
    method: "DELETE",
    headers: headers(cfg.token),
  }).catch(() => undefined);
}

/**
 * Approve + merge as the signed-in editor, then tidy up the edit branch.
 * Throws user-presentable messages for the two expected refusals.
 */
export async function approveAndPublish(
  cfg: ReviewsConfig,
  number: number,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const approve = await fetchImpl(`${API}/repos/${cfg.repo}/pulls/${number}/reviews`, {
    method: "POST",
    headers: headers(cfg.token),
    body: JSON.stringify({ event: "APPROVE", body: "Approved via the handbook review dashboard." }),
  });
  if (approve.status === 422) {
    // GitHub forbids approving your own PR.
    throw new Error("You submitted this change yourself — a different editor has to approve it.");
  }
  if (!approve.ok) throw new Error(`approve failed (${approve.status})`);

  const merge = await fetchImpl(`${API}/repos/${cfg.repo}/pulls/${number}/merge`, {
    method: "PUT",
    headers: headers(cfg.token),
    body: JSON.stringify({ merge_method: "merge" }),
  });
  if (merge.status === 405 || merge.status === 409) {
    // Common causes: run-tests still running/failing, or the ruleset's
    // "branch must be up to date" (main moved since submission). Kick off an
    // update-branch so checks re-run against fresh main; the admin retries.
    await fetchImpl(`${API}/repos/${cfg.repo}/pulls/${number}/update-branch`, {
      method: "PUT",
      headers: headers(cfg.token),
    }).catch(() => undefined);
    throw new Error(
      "GitHub refused the merge — required checks may still be running (or the change needed a refresh against the latest handbook, which was just started). Try again in a couple of minutes.",
    );
  }
  if (!merge.ok) throw new Error(`merge failed (${merge.status})`);

  await deleteBranch(cfg, await headRef(cfg, number, fetchImpl).catch(() => ""), fetchImpl);
}

/** Close the review without publishing; the submitted edits are discarded. */
export async function rejectReview(
  cfg: ReviewsConfig,
  number: number,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const ref = await headRef(cfg, number, fetchImpl);
  const res = await fetchImpl(`${API}/repos/${cfg.repo}/pulls/${number}`, {
    method: "PATCH",
    headers: headers(cfg.token),
    body: JSON.stringify({ state: "closed" }),
  });
  if (!res.ok) throw new Error(`reject failed (${res.status})`);
  await deleteBranch(cfg, ref, fetchImpl);
}
