# Handbook POC — Astro + git-backed content on Cloudflare (no CMS)

A proof-of-concept moving the OSBR handbook **off VitePress** to a fully custom
Astro app on Cloudflare, with **git-backed markdown content** and
**server-side per-page reader access** keyed to GitHub identity — all
written from scratch, no Directus/headless-CMS.

> The reader ACL, editor RBAC, CSRF, stored-XSS defenses, and the **real GitHub
> OAuth login** are all **verified live** (see below). Editor saves commit via
> the GitHub API **as the signed-in person** (no bot) — implemented and
> unit-tested; live use needs the GitHub App installed on the repo plus a
> deploy-on-push pipeline (the remaining deferred piece).

## Architecture

```
Browser ──> Astro SSR Worker (@astrojs/cloudflare)  — NO DATABASE (stateless)
            - custom UI, owns the whole frontend
            - CONTENT = git-backed markdown (doc/*.md at the repo root — the
              SAME files the legacy VitePress site builds from; single source,
              nothing ported, nothing to drift. Frontmatter carries title/
              section/sort/visibility/parent [sidebar nesting]; VitePress
              ignores keys it doesn't know. Bodies keep their `# H1` on disk
              for VitePress — the app strips it on load / re-adds on save,
              both sides of that boundary in serialize.ts), read via an Astro
              content collection bundled at build — everything in the build is
              PUBLISHED (drafts/pending edits live on handbook/<slug> branches
              + their PRs)
            - ACCESS = GitHub itself: sign in with GitHub, then your access to
              the handbook repo IS your access to the site (collaborator ->
              reader, push permission -> editor). NO allow-list in the codebase.
            - canRead(): ONE predicate over frontmatter = the entire reader ACL
            - middleware: decrypt session cookie; the GitHub-verified role is
              re-checked against the repo every ~10 min (no identity bleed)
            - hand-written GitHub OAuth (AES-GCM session cookie), coop-pattern
```

- **Everything in git/GitHub** — content in the repo, access control on the
  repo. No datastore; the Worker is stateless (session identity lives in the
  signed cookie). One Worker deploy.
- **Who gets in = who has repo access.** Managed on GitHub (org People / repo
  Collaborators — a private page, so nothing about staff is published even
  while the repo itself is public): grant someone the repo -> they can read the
  handbook; grant them **write** -> they can also use the editor; revoke ->
  locked out within ~10 minutes. Outside collaborators (people beyond the org)
  work exactly the same way. Identity is the GitHub username — **no emails
  anywhere in the system**.
- A published content change goes live after a **rebuild/redeploy** (content is
  bundled at build). Local dev picks up file edits via HMR.
- **Two visibility tiers, roles play no part in reading:** `public` (anyone) and
  `internal` (any signed-in person). There is deliberately NO finer tier: every
  signed-in user is a repo collaborator who could read the markdown source on
  GitHub anyway, so a site-side "restricted" tier would be theater. Truly
  secret content belongs in a different (private) repo, not behind a flag here.
- Reader access is enforced **server-side**, fails **closed**, and forbidden == not-found (both 404 — no existence signal). A file with missing/invalid `visibility` defaults to the **tightest** tier (internal) via the collection schema.
- Page bodies are **markdown**, **sanitized at render** (`rehype-sanitize`), shared by the reader page and the editor preview.
- **Agent surface (llmstxt.org):** `/llms.txt` (index), `/llms-full.txt` (all
  readable content) and per-page `/<slug>.md` (raw markdown) — dynamic
  endpoints through the SAME `canRead` gate as HTML (anon → public only, fail
  closed, forbidden == 404). This is what the `standard-repository`
  code-quality hook consumes (it sends every org AI session to the handbook
  for the style guides — those pages must be `public` by cutover, since the
  hook fetches anonymously). The legacy site gets the same files statically
  from `vitepress-plugin-llms` at build (fine while everything there is
  public); the dynamic version supersedes it at cutover, same URLs.
- Auth = **hand-written GitHub OAuth** (session crypto ported from
  `osbrjp/coop-csnet-poc`, AES-GCM encrypted cookie), hardened with a
  state-nonce CSRF check the original lacked. The user grants **no scopes**
  (public identity only). Authorization has two paths, picked by the token
  kind: **GitHub App sign-in → the user's own token self-checks** its
  explicit repo access (`/user/installations/{id}/repositories` — no bot
  credential at all); classic OAuth App sign-in → a bot token (`GITHUB_TOKEN`
  secret, fallback only) checks the repo's collaborator permissions.
  Note: a *public* repo is readable by any GitHub user, so both gates key on
  **explicit** access (collaborator 204/404; presence in the explicit-permission
  listing) — never `permission === "read"` — and behave identically once the
  repo goes private.
- **Publishing is git-native — there is no `status` field.** Published means
  MERGED to the content branch; everything in the build is live. The editor's
  two verbs map onto git states:
  - **Save draft** → a commit on `handbook/<slug>` with NO pull request:
    private work-in-progress, invisible to readers and to the review queue.
    Reopening the page **resumes from the draft** (the editor reads the edit
    branch, so a second session can't clobber it), and the Pages listing chips
    it "draft in progress" (new-not-yet-published pages get their own section).
  - **Submit for approval** → the same branch gets its **one PR per page** —
    now it's pending. Further saves join the pending review.
  Every commit is **authored by the signed-in person** (their own GitHub App
  token, carried encrypted in the session, auto-refreshed — no bot identity).
- **Review dashboard** (`/edit-pages/reviews`, editors): pending edits with
  author + checks state; each opens an **internal review page**
  (`/edit-pages/reviews/{n}`) rendering the proposed version like a real page,
  with the published version collapsible for comparison — reviewing needs no
  GitHub trip (GitHub stays the audit link). **Approve & publish** performs a
  real GitHub review + merge *as the signed-in editor* (ruleset fully honored —
  GitHub blocks self-approval, failing checks, stale branches; a blocked merge
  auto-triggers update-branch). **Reject** closes the review and discards the
  edits. **Delete** on a never-published page discards its draft branch
  outright (nothing was public, no review needed).
- **Two roles from GitHub repo permission, pure CAPABILITY**: any push-capable
  level (`write`/`maintain`/`admin`) → **editor**, read collaborator →
  **reader**. Editors both edit AND approve/merge reviews — GitHub write already
  allows merging — so there is no separate "approver" tier; GitHub still blocks
  approving your OWN PR, so publishing needs a **second editor** (a 2-person
  review). Roles never change what published content someone can read. Locally
  (agent mode) saves are direct file writes (one "Save" button);
  `GITHUB_WRITE_MODE=direct` restores direct API commits for unprotected setups.
  A merged change appears on the live site after the next rebuild/redeploy —
  deploy-on-push is the remaining deferred piece.
- **Public repo caveat:** while the content repo is public, `internal` page *source* is readable in git even though the deployed site gates the rendered page. Move the content repo private to make gated content actually private (no code change needed).

## What's verified

**Verified locally with no Docker/GitHub (unit):**
- `pnpm check` (types), `pnpm build`, `pnpm test` (94 tests), `pnpm guard`.
- Session crypto round-trip + tamper/expiry/wrong-key/bad-role rejection; the `canRead` ACL truth table + `searchRows` ACL; the GitHub role mapping (collaborator 404 → no access even where a public repo reports `read`); render pipeline (callouts/TOC/mermaid + XSS sanitize); `doc/*.md → content-file` helpers.
- The role-resolution calls were also probed against the **live GitHub API** (real org/repo): collaborator 204/404 gate + `role_name` mapping behave as coded.

**Verified LIVE via `astro dev` (no database):**
- Reader ACL matrix through the real app (dev-login shim as each persona) —
  reading depends only on being signed in, roles are capability-only:

  | persona | public | internal | /edit-pages |
  |---|:--:|:--:|:--:|
  | anonymous | 200 | 404 | 404 |
  | reader | 200 | 200 | 404 |
  | editor | 200 | 200 | 200 |

- Nav + sitemap as anon contain **only public** slugs (no enumeration).
- Editor RBAC: `/edit-pages*` (preview) is 200 for editors, **404** for readers/anon.
- CSRF: bad double-submit token → 403; cross-origin POST → 403 (Astro origin check).
- Stored XSS: content containing `<script>`/`javascript:` → the reader page strips both, callout still renders.
- Search is ACL-gated: an internal-only term returns 0 for anon, results for a signed-in reader.

**Verified LIVE — the real GitHub OAuth round-trip** (local `astro dev`, real
GitHub, real repo): sign-in → token exchange → collaborator/permission check →
editor role resolved → session minted. The dev shim is now only a convenience,
not the only proof.

**Deferred:**
- **GitHub App provisioning.** Editor writes are implemented (per-user commits
  via the Contents API, `store.github.ts`, unit-tested against a mock API) but
  need a **GitHub App** created for login (its client id/secret replace the
  OAuth App's — same env vars) and **installed on this repo** by a repo/org
  admin (`contents: write`). Until then, deployed editors see "Preview only".
- **Deploy-on-push pipeline** so a content commit rebuilds + redeploys the
  Worker (a saved change is otherwise live only after the next manual deploy).
- The `restricted`/groups tier is supported by the schema/ACL but has no group source yet — it would map to **GitHub teams** (see `lib/auth/groups.ts`).
- Production: Worker secrets, prod cookie flags (`secure` keys off `https`). No datastore to provision.

## Prerequisites

- Node 20+ and pnpm
- `wrangler` (installed as a dev dependency)
- (Optional, for the real login) a **GitHub App** — or a classic OAuth App plus
  a bot token (`GITHUB_TOKEN`, needed for the classic path only)

## Quickstart (local, no GitHub OAuth needed)

```sh
cd app
pnpm install
cp .dev.vars.example .dev.vars          # set COOKIE_ENCRYPTION_KEY (>=32 chars); DEV_LOGIN=1
pnpm dev                                # astro dev on http://localhost:4321  (no database)
                                        # (content = ../doc/*.md directly; no seed step)
# or: pnpm dev:edit                     # also runs the local content agent (in-browser editing)
```

Log in as any persona without GitHub via the dev-login shim (works only when `DEV_LOGIN=1`):

```
http://localhost:4321/api/auth/dev-login?user=alice&role=editor
http://localhost:4321/api/auth/dev-login?user=bob&role=reader
```

- Reader site: http://localhost:4321/  · Editor: http://localhost:4321/edit-pages

### Acceptance test (scripted)

`pnpm dev` running, then exercise the matrix above with the dev-login shim (see the persona table). `pnpm test` covers the pure ACL/crypto/render/role-mapping units.

## Real GitHub login (when you have the OAuth App)

1. **OAuth App** (org Settings → Developer settings → OAuth Apps → New): set the
   callback URL to `<origin>/api/auth/callback` (one app per origin — make a
   separate one for localhost testing). No special permissions; it only proves
   identity.
2. **Bot token** (classic OAuth App only) for the role checks — verified live
   (July 2026): a **classic PAT with `public_repo` + `read:org`** is the
   minimal scope set that works. Rejected by testing: `public_repo` alone
   (masked 404 on the collaborator gate), fine-grained "public repos
   read-only" (403 — the collaborator API needs push-level access; the PAT's
   owner must have push on the repo), fine-grained org-scoped (works on paper
   but osbrjp queues those for owner approval). Skip this entirely when
   sign-in uses a **GitHub App** — App-issued user tokens self-check their own
   repo access, no bot credential.
3. Put `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` (+ `GITHUB_TOKEN`
   if classic) in `app/.dev.vars`, set `DEV_LOGIN=0`, restart `pnpm dev`, hit
   "Sign in".

**Provisioning people = GitHub, not code.** Anyone with access to the handbook
repo (org member via team, or outside collaborator) can sign in: repo access →
reader, push permission → editor, revoked → locked out within ~10 minutes.
There is no allow-list, directory, or email anywhere in this codebase.

## Layout

```
doc/                 git-backed content: one <slug>.md per page (frontmatter) —
                     shared with the legacy VitePress site (single source)
app/
  src/content.config.ts  collection schema over ../doc (fail-closed defaults)
  src/lib/content/   acl.ts (canRead + searchRows, pure), pages.ts (collection reads),
                     store.ts + store.local.ts (dev agent) + store.github.ts (prod, deferred),
                     serialize.ts
  src/lib/auth/      github.ts (OAuth + role from repo permissions — the WHOLE
                     access model), session (AES-GCM), origin, cookies, visitor,
                     groups (restricted-tier stub), requireEditor
  src/lib/csrf.ts    double-submit CSRF
  src/middleware.ts  per-request: decrypt session, resolve role + group keys, fail closed
  src/pages/         index, [...slug], sitemap.xml, api/auth/*, api/search, edit-pages/*
  src/lib/markdown.ts  callouts / [[TOC]] / mermaid + rehype-sanitize (reader + preview)
  scripts/content-agent.mjs  dev-only Node helper: file write + git commit for the editor
  scripts/guard-no-module-client.mjs  CI guard vs identity bleed
  wrangler.toml      vars (no bindings — stateless)
```

## Deploy to staging

Staging is DEPLOYED: the `osbr-handbook` Worker's `*.workers.dev` URL (in the
Cloudflare dashboard → the Worker's overview; not written out here — this repo
is public and the temporary auth setup below is best not advertised alongside
a clickable link). Any host other than `handbook.osbrjp.com` serves
`X-Robots-Tag: noindex` (search engines won't index the staging copy).

Deploy-mechanics facts, learned the hard way — read before deploying:

- **`[env.staging]` is INERT.** The Cloudflare adapter regenerates the deploy
  config (`dist/server/wrangler.json`) at build time and flattens everything
  to the base environment — `wrangler deploy --env staging` deploys the SAME
  `osbr-handbook` worker. One worker is fine for the POC; don't chase the
  `-staging` name.
- **Config lives in the DASHBOARD, not the repo.** `keep_vars = true` in
  `wrangler.toml` makes deploys leave dashboard-managed vars alone. (Without
  it, every deploy replaces remote plain-text vars with the file's `[vars]`
  block — which once silently wiped `GITHUB_OAUTH_CLIENT_ID`/`OAUTH_ORIGIN`/
  `GITHUB_BRANCH` mid-demo. Encrypted **Secrets** always survive deploys.)
- Deploying: `pnpm build && npx wrangler deploy` (in `app/`), with a
  `CLOUDFLARE_API_TOKEN` that has **Workers Scripts: Edit** AND **Workers KV
  Storage: Edit** (the adapter provisions a SESSION KV namespace).

Worker configuration (dashboard → Settings → Variables and Secrets):
vars `GITHUB_OAUTH_CLIENT_ID`, `OAUTH_ORIGIN` (dashboard-managed), and
`GITHUB_BRANCH` (pinned in `wrangler.toml` `[vars]` — losing it silently
retargets editor PRs to `main`); Secrets `COOKIE_ENCRYPTION_KEY`,
`GITHUB_OAUTH_CLIENT_SECRET` (+ `GITHUB_TOKEN`, see below).

**Current auth state (since 2026-07-09): the org GitHub App is live** —
permissions set, installed on the repo, its client id/secret in the Worker.
Login, role self-checks and per-person editing all run through it; the whole
draft→submit→approve→merge loop works on the deployed site. Residual cleanup:
`GITHUB_WRITE_ENABLED=1` is currently FORCED on the worker — delete the var
and re-login to confirm refresh-token auto-detect, else keep it and note the
App's "expire user authorization tokens" is off; delete the `GITHUB_TOKEN`
secret if still present (App sign-ins never use it); revoke the personal demo
PAT + demo OAuth app from the pre-App workaround. (For the record, the classic
fallback's minimal PAT scope was live-verified as `public_repo` + `read:org` —
lesser scopes fail the collaborator API.)

**POC-period editing on staging:** `GITHUB_BRANCH=i68-handbook-poc` (pinned
in `wrangler.toml` `[vars]`), so the draft→submit→approve→merge loop demos
against the POC branch — merged pages land on the branch staging is actually
built from. The targeting is **self-retiring**: when the POC branch is deleted
(its PR merged), everything automatically targets `main`; the only follow-up
is a cleanup task (delete the var for tidiness, prune any demo pages/branches).

**Deploy-on-push CI:** `.github/workflows/deploy-worker.yml` deploys the
Worker on pushes to the deployed branch (POC branch now, `main` post-merge) —
this is what makes an approved submission actually appear on the site. It is
INERT until a repo admin adds the `CLOUDFLARE_API_TOKEN` repo secret (Workers
Scripts:Edit + Workers KV Storage:Edit); until then it skips with a notice and
deploys stay manual.

**Deferred (tracked, non-blocking):** rate limiting on `/api/auth/*` (do as a
Cloudflare dashboard rule), observability beyond `wrangler tail`, CSP/HSTS at
prod cutover.

## Migration & production cutover

**Where the OLD handbook lives today:** static **VitePress on GitHub Pages**.
`.github/workflows/release.yml` builds VitePress and publishes to Pages on merge
to the `release` branch; `handbook.osbrjp.com` is a CNAME to `osbrjp.github.io`
(GitHub Pages anycast IPs `185.199.108–111.153`). Everything is public — Pages
serves static files and can't gate per user.

**DNS reality (re-checked 2026-08-21):** the `osbrjp.com` zone is hosted on
**AWS Route 53** (`awsdns-*` nameservers, confirmed at the `.com` registry) and
`handbook.osbrjp.com` is still a CNAME to `osbrjp.github.io` with a **3600s
TTL**. No DNSSEC (no `DS` at the parent). The zone also carries the company's
**Google Workspace mail** — `MX → smtp.google.com`, a four-include SPF, DMARC
at `p=quarantine`, and six domain-verification TXT records.

**The apex already runs the pattern we need.** `www.osbrjp.com` returns *both*
vendors' headers:

```
cf-ray / cf-cache-status: HIT / server: cloudflare     ← Cloudflare served it
via: 1.1 ….cloudfront.net (CloudFront) / x-amz-cf-id   ← CloudFront in front
```

So the live chain is **Route 53 → CloudFront → Cloudflare Worker**. CloudFront
terminates TLS for the hostname and the Worker is just a custom origin. (The
apex itself is a CloudFront Function issuing a 301 to `www`.)

**This removes the prerequisite this document used to state.** An earlier
revision required moving the whole `osbrjp.com` zone into Cloudflare, on the
grounds that Workers custom domains need the zone in the Cloudflare account.
That constraint is real *for Workers custom domains* — but it is not the only
way to serve a hostname from a Worker, and the company already runs the
alternative in production. **Do not move the zone.** Doing so would put the
Google Workspace mail records through an unnecessary migration for no benefit,
and would need registrar access nobody has had to find.

`handbook.osbrjp.com` follows the same path as `www`: a CloudFront
distribution with the handbook Worker as its origin, and a Route 53 record
pointing at that distribution. Route 53 stays authoritative for everything.

**⚠️ The handbook is NOT the marketing site — caching must be off.** `www`
happily serves `cf-cache-status: HIT` because every byte of it is public. The
handbook serves **per-reader access-controlled** content. If CloudFront caches
an authenticated `200` and replays it to the next requester, the Worker's
fail-closed `canRead` gate never runs and the ACL is bypassed entirely — the
request never reaches the origin. The distribution therefore needs:

- **`CachingDisabled`** cache policy on all handbook routes. Don't try to be
  clever with a cookie-keyed cache key; the content is small and the Worker is
  fast.
- **Origin request policy forwarding all cookies** — the session is an AES-GCM
  encrypted cookie and must reach the Worker on every request.
- **Host handling that preserves the OAuth origin check.** The app verifies
  request origin explicitly (`app/src/lib/auth/origin.ts`, covered by
  `tests/origin.test.mjs`). If CloudFront presents the origin a different Host
  than the browser saw, sign-in breaks — or the check silently weakens.
- **`OAUTH_ORIGIN = https://handbook.osbrjp.com`**, not the `workers.dev`
  hostname. It is dashboard-managed and survives deploys via `keep_vars = true`
  (see `app/wrangler.toml`), so this is a dashboard change, not a commit.

Note the `*.workers.dev` hostname stays publicly reachable alongside
CloudFront. That is acceptable — the Worker enforces auth itself — but two
hostnames then serve the same gated content, and the origin check should
reject the one we don't intend.

**Before the swap:** drop the `handbook` CNAME TTL in Route 53 from 3600 to
60–300. It is free, has zero user impact, and it is what makes both the
cutover and the rollback fast.

**Why the site host must change:** this app is Astro **SSR on Cloudflare
Workers** — it checks GitHub identity and per-page access on every request,
which a static host (GitHub Pages) fundamentally can't do. So the cutover is a
host swap, not a redeploy of the same thing.

**Cutover prerequisite — style-guide visibility:** the `standard-repository`
code-quality hook fetches the style guides ANONYMOUSLY; they are `internal`
in the POC content, so post-cutover the hook would 404. Flip all **six**
`doc/style-guide*.md` files to `visibility: public` (one frontmatter word
each) before the DNS swap — pending an explicit "coding standards are public"
sign-off (they are already world-readable on the current site and in git).

More broadly: the 2026-08-21 frontmatter migration set **every** newly-migrated
page to `visibility: internal` — the schema's fail-closed default, chosen so a
bulk migration could not silently publish anything. But all 55 pages are
public on the live VitePress site *today*, so at cutover any page left
`internal` becomes **less** visible than it is now. Deciding which pages are
`public` is a content call that must happen before the DNS swap, not after.

**Cutover steps (when ready to go live):**
1. **Deploy the Worker.** `wrangler deploy` (or a CI job) publishes the Astro
   build. Verify on the `*.workers.dev` URL first.
2. **Real GitHub sign-in.** The org **GitHub App** from step 3 is the login app
   (callback `https://handbook.osbrjp.com/api/auth/callback`); set
   `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` +
   `COOKIE_ENCRYPTION_KEY` as **Worker secrets** (`wrangler secret put …`),
   `DEV_LOGIN=0`. No `GITHUB_TOKEN` in prod: App sign-ins self-check roles
   with the user's own token (the secret exists only as a classic-OAuth
   fallback).
3. **Enable editor writes — DONE (2026-07-09).** The org GitHub App
   ("OSBR Handbook", org-owned) is configured and installed on the repo:
   Contents + Pull requests Read & write, callbacks for both the workers.dev
   host and `handbook.osbrjp.com`, client id/secret in the Worker. Sign-in
   yields each user's own commit credential (per-person commits, no bot).
   Residuals tracked in "Deploy to staging" → *Current auth state*: confirm
   refresh-token auto-detect (drop `GITHUB_WRITE_ENABLED`), delete
   `GITHUB_TOKEN` if still present, revoke the pre-App demo PAT/OAuth app.
   The **deploy-on-push** action exists so a content commit
   rebuilds + redeploys the Worker.
   **Ownership rule: NO production credential may belong to an individual.**
   The GitHub App must be org-owned (it supersedes the personal staging OAuth
   App, and retires the personal bot PAT outright — App sign-ins self-check
   roles with the user's own token, implemented in `resolveRoleSelf`), and the
   Workers live in the company Cloudflare account. If any of these sat on a
   personal account, that person leaving/losing access would break sign-in or
   force a mass logout.
4. **DNS cutover — CloudFront in front of the Worker.** Mirror what `www`
   already does; no zone move, no Cloudflare custom domain.
   1. Create a CloudFront distribution for `handbook.osbrjp.com`: origin = the
      Worker's `*.workers.dev` hostname, ACM cert for the alternate domain
      name, **cache policy `CachingDisabled`**, origin request policy
      **forwarding all cookies** (see the caching warning above — this is an
      ACL-bypass risk, not a performance tuning knob).
   2. Set `OAUTH_ORIGIN` to `https://handbook.osbrjp.com` and add that
      callback to the GitHub App.
   3. Test **against the distribution hostname** signed-out *and* signed-in
      before touching DNS: a `public` page renders anonymously; an `internal`
      page 404s anonymously and renders once signed in; two different users
      never see each other's responses.
   4. In Route 53 (TTL already lowered): replace the
      `handbook → osbrjp.github.io` CNAME with the distribution.

   **Both sites stay up throughout** — GitHub Pages keeps serving anyone with a
   stale DNS answer, the distribution serves everyone else; visitors see old or
   new, never an outage. **Rollback = restore the CNAME to `osbrjp.github.io`**
   (keep Pages alive until step 8 precisely so rollback stays one step).
5. **Re-establish staging isolation — BEFORE routine post-cutover deploys.**
   Once `osbr-handbook` serves the live domain, `pnpm build && npx wrangler
   deploy` deploys straight to PRODUCTION (the POC's single-worker setup has
   no second target). Create a separate staging worker first (e.g. a
   `wrangler.staging.toml` with its own `name =` passed via `--config`, or a
   CI-only prod deploy with local deploys pointed at the staging name) so a
   local experiment can never overwrite the live handbook.
6. **Retire GitHub Pages — only after days of confidence.** Remove the Pages
   custom domain and disable/delete `.github/workflows/release.yml`; the
   `release` branch retires with it (publishing is merge-to-main + deploy now).
7. **Privacy (if internal content must be private).** The content repo is public,
   so `internal`/`restricted` markdown is readable in git even though the site
   gates the rendered page. Make the content repo **private** (no code change) —
   or split gated content into a private repo — before relying on those tiers.
8. **Verify** the reader ACL matrix + editor flow on the live domain, then
   decommission the old VitePress site.
