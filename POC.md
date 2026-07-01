# Handbook POC — Astro + git-backed content on Cloudflare (no CMS)

A proof-of-concept moving the OSBR handbook **off VitePress** to a fully custom
Astro app on Cloudflare, with **git-backed markdown content** and
**server-side per-page reader access** keyed to Google Workspace identity — all
written from scratch, no Directus/headless-CMS.

> The reader ACL, editor RBAC, CSRF, and stored-XSS defenses are **verified live**
> (see below). Deferred: the live Google OAuth handshake (needs a Workspace OAuth
> client) and in-browser editor **writes** (the workerd runtime can't touch the
> filesystem, so writes must go via the GitHub API — see below).

## Architecture

```
Browser ──> Astro SSR Worker (@astrojs/cloudflare)  — NO DATABASE (stateless)
            - custom UI, owns the whole frontend
            - CONTENT = git-backed markdown (src/content/pages/*.md, frontmatter
              carries title/section/sort/visibility/groups/status), read via an
              Astro content collection bundled at build
            - IDENTITY = git-committed config (src/lib/auth/directory.ts):
              who may sign in, their role, and group membership
            - canRead(): ONE predicate over frontmatter = the entire reader ACL
            - middleware: decrypt session cookie, resolve role + group keys from
              the directory per request (no identity bleed)
            - hand-written Google OAuth (AES-GCM session cookie), coop-pattern
```

- **Everything in git** — content AND identity. No datastore; the Worker is
  stateless (session identity lives in the signed cookie). One Worker deploy.
- A published content change goes live after a **rebuild/redeploy** (content is
  bundled at build). Local dev picks up file edits via HMR.
- Reader access is enforced **server-side**, fails **closed**, and forbidden == not-found (both 404 — no existence signal). A file with missing/invalid `visibility` defaults to the **tightest** tier (restricted) via the collection schema.
- **Sidebar shows `restricted` pages a signed-in user can't read as "no access"** (title visible, body gated) — a deliberate transparency choice so staff know such content exists and can request it. **Content guideline:** because the title is disclosed to signed-in users, **keep `restricted` page titles non-sensitive** (e.g. "Leadership Resources", not "Acme Acquisition Terms") — put the sensitive detail in the body, which stays gated. A page whose very title must be secret does not belong in this system.
- Page bodies are **markdown**, **sanitized at render** (`rehype-sanitize`), shared by the reader page and the editor preview.
- Auth = **hand-written Google OAuth** ported from `osbrjp/coop-csnet-poc` (AES-GCM encrypted session cookie), hardened with a state-nonce CSRF check the original lacked.
- **Editing:** for now, edit the markdown files under `src/content/pages/` and commit. The in-browser editor is **preview-only** (its write path — commit via the GitHub API + a build-on-commit pipeline — is scaffolded but deferred).
- **Public repo caveat:** while the content repo is public, `internal`/`restricted` page *source* is readable in git even though the deployed site gates the rendered page. Move the content repo private to make gated content actually private (no code change needed).

## What's verified

**Verified locally with no Docker/Google (unit):**
- `pnpm check` (types), `pnpm build`, `pnpm test` (33 tests), `pnpm guard`.
- Session crypto round-trip + tamper/expiry/wrong-key rejection; the `canRead` ACL truth table + `searchRows` ACL; render pipeline (callouts/TOC/mermaid + XSS sanitize); `doc/*.md → content-file` helpers.

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

**Deferred:**
- **In-browser editor writes.** The workerd SSR runtime has no filesystem, so a save can't write a file — it must commit via the GitHub API (scaffolded in `lib/content/store.ts`), which needs a repo-scoped token + a build-on-commit pipeline. Until then the editor is preview-only; edit content by committing markdown to the repo.
- The live Google OAuth handshake (`/api/auth/login` + `/api/auth/callback` are written and code-reviewable); dev-login shim proves the session/enforcement machinery.
- Google Group → role/group sync (POC seeds identity by hand).
- Production: Worker secrets, prod cookie flags (`secure` keys off `https`). No datastore to provision.

## Prerequisites

- Node 20+ and pnpm
- `wrangler` (installed as a dev dependency)
- (Optional, for the real login) a Google OAuth **Internal** Workspace client

## Quickstart (local, no Google needed)

```sh
cd app
pnpm install
cp .dev.vars.example .dev.vars          # set COOKIE_ENCRYPTION_KEY (>=32 chars); DEV_LOGIN=1
pnpm content:seed                       # (re)generate src/content/pages/*.md from doc/*.md (once)
pnpm dev                                # astro dev on http://localhost:4321  (no database)
# or: pnpm dev:edit                     # also runs the local content agent (in-browser editing)
```

Log in as a seeded persona without Google via the dev-login shim (works only when `DEV_LOGIN=1`):

```
http://localhost:4321/api/auth/dev-login?email=editor@osbrjp.com    # editor
http://localhost:4321/api/auth/dev-login?email=reader@osbrjp.com     # reader
```

- Reader site: http://localhost:4321/  · Editor: http://localhost:4321/edit-pages

### Acceptance test (scripted)

`pnpm dev` running, then exercise the matrix above with the dev-login shim (see the persona table). `pnpm test` covers the pure ACL/crypto/render units.

## Real Google login (when you have a client)

Create an OAuth 2.0 **Web** client in Google Cloud Console as an **Internal**
(Workspace-only) app:

- Authorized redirect URI: `http://localhost:4321/api/auth/callback` (and your prod origin)
- Put `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `app/.dev.vars`, set `DEV_LOGIN=0`.

Login is restricted by `src/lib/auth/accessList.ts` (Workspace domains) **and** a
entry in the directory (`src/lib/auth/directory.ts`) — new staff are provisioned by editing
that git config / a Google-Group sync (pre-prod), not auto-created.

## Layout

```
app/
  src/content/pages/ git-backed content: one <slug>.md per page (frontmatter)
  src/content.config.ts  collection schema (fail-closed defaults)
  src/lib/content/   acl.ts (canRead + searchRows, pure), pages.ts (collection reads),
                     store.ts + store.local.ts (dev agent) + store.github.ts (prod, deferred),
                     serialize.ts
  src/lib/auth/      directory.ts (WHO can sign in — git config, no DB), session (AES-GCM),
                     oauth, origin, accessList, cookies, visitor, requireEditor
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
it checks Google identity and per-page access on every request, which a static
host (GitHub Pages) fundamentally can't do. So the cutover is a host swap, not a
redeploy of the same thing.

**Cutover steps (when ready to go live):**
1. **Deploy the Worker.** `wrangler deploy` (or a CI job) publishes the Astro
   build. Verify on the `*.workers.dev` URL first.
2. **Real Google OAuth.** Create the Internal Workspace OAuth client; set
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` + `COOKIE_ENCRYPTION_KEY` as
   **Worker secrets** (`wrangler secret put …`), `DEV_LOGIN=0`, and add the prod
   redirect URI `https://handbook.osbrjp.com/api/auth/callback`.
3. **Enable editor writes in prod (deferred piece).** Provision a **GitHub App**
   (repo-scoped, `contents:write`), store its key as a Worker secret, finish
   `src/lib/content/store.github.ts`, and add a **deploy-on-push** action so a
   content commit rebuilds + redeploys the Worker.
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
