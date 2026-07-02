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
              carries title/section/sort/visibility/groups/status), read via an
              Astro content collection bundled at build
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
- Reader access is enforced **server-side**, fails **closed**, and forbidden == not-found (both 404 — no existence signal). A file with missing/invalid `visibility` defaults to the **tightest** tier (restricted) via the collection schema.
- **Sidebar shows `restricted` pages a signed-in user can't read as "no access"** (title visible, body gated) — a deliberate transparency choice so staff know such content exists and can request it. **Content guideline:** because the title is disclosed to signed-in users, **keep `restricted` page titles non-sensitive** (e.g. "Leadership Resources", not "Acme Acquisition Terms") — put the sensitive detail in the body, which stays gated. A page whose very title must be secret does not belong in this system.
- Page bodies are **markdown**, **sanitized at render** (`rehype-sanitize`), shared by the reader page and the editor preview.
- Auth = **hand-written GitHub OAuth** (session crypto ported from
  `osbrjp/coop-csnet-poc`, AES-GCM encrypted cookie), hardened with a
  state-nonce CSRF check the original lacked. The user grants **no scopes**
  (public identity only); authorization runs server-side with a bot token
  (`GITHUB_TOKEN` secret) against the repo's collaborator permissions.
  Note: the permission API reports `read` for *any* GitHub user while the repo
  is public, so the gate is the **explicit-collaborator check** (204/404) —
  which behaves identically once the repo goes private.
- **Editing:** a save in the in-browser editor becomes a **git commit authored
  by the signed-in person** — locally via the content agent (your own git), in
  production via the GitHub Contents API using the user's **own GitHub App
  token** (carried encrypted in the session, auto-refreshed). No bot identity:
  attribution is real, and GitHub refuses the write the instant someone's push
  access is revoked. Concurrent edits 409 (sha check) instead of clobbering.
  A published change appears on the live site after the next rebuild/redeploy
  (content is bundled at build) — the deploy-on-push pipeline is the remaining
  deferred piece.
- **Public repo caveat:** while the content repo is public, `internal`/`restricted` page *source* is readable in git even though the deployed site gates the rendered page. Move the content repo private to make gated content actually private (no code change needed).

## What's verified

**Verified locally with no Docker/GitHub (unit):**
- `pnpm check` (types), `pnpm build`, `pnpm test` (47 tests), `pnpm guard`.
- Session crypto round-trip + tamper/expiry/wrong-key/bad-role rejection; the `canRead` ACL truth table + `searchRows` ACL; the GitHub role mapping (collaborator 404 → no access even where a public repo reports `read`); render pipeline (callouts/TOC/mermaid + XSS sanitize); `doc/*.md → content-file` helpers.
- The role-resolution calls were also probed against the **live GitHub API** (real org/repo): collaborator 204/404 gate + `role_name` mapping behave as coded.

**Verified LIVE via `astro dev` (no database):**
- Reader ACL matrix through the real app (dev-login shim as each persona):

  | persona | public | internal | restricted |
  |---|:--:|:--:|:--:|
  | anonymous | 200 | 404 | 404 |
  | reader | 200 | 200 | 404 |
  | editor | 200 | 200 | 200 |

  (The restricted/group-gated level is still supported by the schema and ACL,
  but no access group or restricted page is seeded by default.)

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
- (Optional, for the real login) a GitHub **OAuth App** under the org + a bot token

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
2. **Bot token** for the role checks: a **fine-grained PAT** scoped to the
   handbook repo (read access to metadata/collaborators is enough), or an org
   GitHub App token later. This token also becomes the prod content-write
   credential when editor writes land.
3. Put `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` / `GITHUB_TOKEN`
   in `app/.dev.vars`, set `DEV_LOGIN=0`, restart `pnpm dev`, hit "Sign in".

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

## Migration & production cutover

**Where the OLD handbook lives today:** static **VitePress on GitHub Pages**.
`.github/workflows/release.yml` builds VitePress and publishes to Pages on merge
to the `release` branch; `handbook.osbrjp.com` is a CNAME to `osbrjp.github.io`
(GitHub Pages anycast IPs `185.199.108–111.153`). Everything is public — Pages
serves static files and can't gate per user.

**Why the host must change:** this app is Astro **SSR on Cloudflare Workers** —
it checks GitHub identity and per-page access on every request, which a static
host (GitHub Pages) fundamentally can't do. So the cutover is a host swap, not a
redeploy of the same thing.

**Cutover steps (when ready to go live):**
1. **Deploy the Worker.** `wrangler deploy` (or a CI job) publishes the Astro
   build. Verify on the `*.workers.dev` URL first.
2. **Real GitHub OAuth.** Create the org OAuth App (callback
   `https://handbook.osbrjp.com/api/auth/callback`); set
   `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` / `GITHUB_TOKEN`
   (bot PAT for role checks) + `COOKIE_ENCRYPTION_KEY` as **Worker secrets**
   (`wrangler secret put …`), `DEV_LOGIN=0`.
3. **Enable editor writes in prod.** Create a **GitHub App** (org-owned): callback
   `https://handbook.osbrjp.com/api/auth/callback`, permission `contents: write`,
   "expire user tokens" on. Install it **on this repo** (org admin approves).
   Its client id/secret replace the OAuth App's in the same env vars — sign-in
   then yields each user's own commit credential (per-person commits, no bot;
   the write driver is already implemented). Add a **deploy-on-push** action so
   a content commit rebuilds + redeploys the Worker.
4. **DNS cutover.** Point `handbook.osbrjp.com` at the Cloudflare Worker (add it
   as a custom domain / route on the Worker) instead of `osbrjp.github.io`.
5. **Retire GitHub Pages.** Remove the Pages custom domain (frees the CNAME) and
   disable/delete `.github/workflows/release.yml` so it stops publishing to Pages.
6. **Privacy (if internal content must be private).** The content repo is public,
   so `internal`/`restricted` markdown is readable in git even though the site
   gates the rendered page. Make the content repo **private** (no code change) —
   or split gated content into a private repo — before relying on those tiers.
7. **Verify** the reader ACL matrix + editor flow on the live domain, then
   decommission the old VitePress site.
