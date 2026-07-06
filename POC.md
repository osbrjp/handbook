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
            - CONTENT = git-backed markdown (src/content/pages/*.md, frontmatter
              carries title/section/sort/visibility), read via an Astro content
              collection bundled at build — everything in the build is PUBLISHED
              (drafts/pending edits live on handbook/<slug> branches + their PRs)
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
  author + checks state; **Approve & publish** performs a real GitHub review +
  merge *as the signed-in editor* (ruleset fully honored — GitHub blocks
  self-approval, failing checks, stale branches; a blocked merge auto-triggers
  update-branch). **Reject** closes the review and discards the edits.
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
- `pnpm check` (types), `pnpm build`, `pnpm test` (72 tests), `pnpm guard`.
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
pnpm content:seed                       # (re)generate src/content/pages/*.md from doc/*.md (once)
pnpm dev                                # astro dev on http://localhost:4321  (no database)
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
2. **Bot token** (classic OAuth App only) for the role checks: a
   **fine-grained PAT** scoped to the handbook repo (read access to
   metadata/collaborators is enough; the PAT's owner must have push access).
   Skip this entirely when sign-in uses a **GitHub App** — App-issued user
   tokens self-check their own repo access, no bot credential.
3. Put `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` (+ `GITHUB_TOKEN`
   if classic) in `app/.dev.vars`, set `DEV_LOGIN=0`, restart `pnpm dev`, hit
   "Sign in".

**Provisioning people = GitHub, not code.** Anyone with access to the handbook
repo (org member via team, or outside collaborator) can sign in: repo access →
reader, push permission → editor, revoked → locked out within ~10 minutes.
There is no allow-list, directory, or email anywhere in this codebase.

## Layout

```
app/
  src/content/pages/ git-backed content: one <slug>.md per page (frontmatter)
  src/content.config.ts  collection schema (fail-closed defaults)
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
  scripts/seed-content.mjs   doc/*.md -> src/content/pages/*.md
  scripts/content-agent.mjs  dev-only Node helper: file write + git commit for the editor
  scripts/guard-no-module-client.mjs  CI guard vs identity bleed
  wrangler.toml      vars (no bindings — stateless)
```

## Deploy to staging

A separate Worker (`osbr-handbook-staging`, `[env.staging]` in `wrangler.toml`)
so staging can never touch production. Any host other than
`handbook.osbrjp.com` serves `X-Robots-Tag: noindex` (search engines won't
index the staging copy).

1. Free Cloudflare account → `npx wrangler login` (in `app/`).
2. First deploy: `pnpm build && npx wrangler deploy --env staging` → note the
   `https://osbr-handbook-staging.<account>.workers.dev` URL. Public pages work
   immediately; login 503s until configured.
3. Create a **staging** GitHub OAuth App (callback `<staging-url>/api/auth/callback`).
4. Set the staging secrets (each: `npx wrangler secret put <NAME> --env staging`):
   `COOKIE_ENCRYPTION_KEY`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`,
   `OAUTH_ORIGIN` (= the staging URL) — plus `GITHUB_TOKEN` (bot PAT for role
   checks) **only if the login app is a classic OAuth App**; a GitHub App
   needs no bot token.
5. Sign in on the staging URL and verify the ACL matrix with real accounts.

**POC-period editing on staging:** `[env.staging]` sets
`GITHUB_BRANCH=i68-handbook-poc`, so once editing is enabled
(`GITHUB_WRITE_ENABLED=1`, needs the GitHub App) the whole
draft→submit→approve→merge loop can be demoed against the POC branch — merged
pages land on the branch staging is actually built from. The targeting is
**self-retiring**: when the POC branch is deleted (its PR merged), everything
automatically targets `main`; the only follow-up is a cleanup task (delete the
staging var for tidiness, prune any demo pages/branches).

**Deferred (tracked, non-blocking):** deploy-on-push CI (needs a
`CLOUDFLARE_API_TOKEN` repo secret), rate limiting on `/api/auth/*` (do as a
Cloudflare dashboard rule), observability beyond `wrangler tail`, CSP/HSTS at
prod cutover.

## Migration & production cutover

**Where the OLD handbook lives today:** static **VitePress on GitHub Pages**.
`.github/workflows/release.yml` builds VitePress and publishes to Pages on merge
to the `release` branch; `handbook.osbrjp.com` is a CNAME to `osbrjp.github.io`
(GitHub Pages anycast IPs `185.199.108–111.153`). Everything is public — Pages
serves static files and can't gate per user.

**DNS reality (checked 2026-07-03):** the `osbrjp.com` zone is hosted on
**AWS Route 53** (`awsdns-*` nameservers); the apex site rides CloudFront;
`handbook.osbrjp.com` is a CNAME to `osbrjp.github.io` with a **3600s TTL**.
This matters because **Cloudflare Workers custom domains require the domain's
DNS zone to live in the Cloudflare account** — an external (Route 53) CNAME
pointing at a Worker cannot terminate TLS for the hostname. So the cutover has
a prerequisite nobody pays for but someone must do: **move the `osbrjp.com`
DNS zone to the company Cloudflare account** (free plan is fine).

**Phase 0 — move DNS to Cloudflare (do anytime, zero user impact):**
1. Identify who holds **registrar access** for `osbrjp.com` (where its
   nameservers are set) and **Route 53 access** (to export records). This is
   the one new dependency.
2. In the company Cloudflare account: *Add a site* → `osbrjp.com` (Free plan).
   Cloudflare imports the records — **verify against a Route 53 export**
   (`aws route53 list-resource-record-sets`) so nothing is missed.
3. Set every imported record to **DNS only (grey cloud)** — especially the
   CloudFront apex — so the move changes *where DNS answers come from* and
   nothing about how any site behaves.
4. At the registrar, switch the nameservers to the pair Cloudflare assigns.
   Keep the Route 53 zone running unchanged during propagation (both providers
   give identical answers → zero downtime; NS changes take up to ~48h).
5. After the zone is active on Cloudflare, decommission the Route 53 zone.

The main osbrjp.com site stays on AWS/CloudFront exactly as-is — only its DNS
hosting moves. (Alternative if the zone must stay on Route 53: Cloudflare's
custom-hostname/SaaS setup — disproportionate complexity for one subdomain;
moving the zone is the standard path.)

**Why the site host must change:** this app is Astro **SSR on Cloudflare
Workers** — it checks GitHub identity and per-page access on every request,
which a static host (GitHub Pages) fundamentally can't do. So the cutover is a
host swap, not a redeploy of the same thing.

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
3. **Enable editor writes in prod.** Create a **GitHub App** (org-owned): callback
   `https://handbook.osbrjp.com/api/auth/callback`, permission `contents: write`,
   "expire user tokens" on. Install it **on this repo** (org admin approves).
   Its client id/secret replace the OAuth App's in the same env vars — sign-in
   then yields each user's own commit credential (per-person commits, no bot;
   the write driver is already implemented). Add a **deploy-on-push** action so
   a content commit rebuilds + redeploys the Worker.
   **Ownership rule: NO production credential may belong to an individual.**
   The GitHub App must be org-owned (it supersedes the personal staging OAuth
   App, and retires the personal bot PAT outright — App sign-ins self-check
   roles with the user's own token, implemented in `resolveRoleSelf`), and the
   Workers live in the company Cloudflare account. If any of these sat on a
   personal account, that person leaving/losing access would break sign-in or
   force a mass logout.
4. **DNS cutover (requires Phase 0 done).** In Cloudflare: delete the
   `handbook → osbrjp.github.io` CNAME and add `handbook.osbrjp.com` as a
   **custom domain on the prod Worker** (Cloudflare creates the record and the
   certificate automatically). Effectively instant at the edge. **Both sites
   stay up throughout** — GitHub Pages keeps serving anyone with a stale DNS
   answer, the Worker serves everyone else; visitors see old or new, never an
   outage. **Rollback = recreate the CNAME to `osbrjp.github.io`** (keep Pages
   alive until step 7 precisely so rollback stays one click).
5. **Retire GitHub Pages — only after days of confidence.** Remove the Pages
   custom domain and disable/delete `.github/workflows/release.yml`; the
   `release` branch retires with it (publishing is merge-to-main + deploy now).
6. **Privacy (if internal content must be private).** The content repo is public,
   so `internal`/`restricted` markdown is readable in git even though the site
   gates the rendered page. Make the content repo **private** (no code change) —
   or split gated content into a private repo — before relying on those tiers.
7. **Verify** the reader ACL matrix + editor flow on the live domain, then
   decommission the old VitePress site.
