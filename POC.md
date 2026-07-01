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
Browser ──> Astro SSR Worker (@astrojs/cloudflare)
            - custom UI, owns the whole frontend
            - CONTENT = git-backed markdown (src/content/pages/*.md, frontmatter
              carries title/section/sort/visibility/groups/status), read via an
              Astro content collection bundled at build
            - canRead(): ONE predicate over frontmatter = the entire reader ACL
            - middleware: decrypt session cookie, re-resolve role + group KEYS
              from D1 per request (no identity bleed)
            - hand-written Google OAuth (AES-GCM session cookie), coop-pattern
                    │
                    └─> Cloudflare D1 (SQLite) = IDENTITY ONLY
                        users / groups / user_groups (no content)
```

- **Content in git** (source of truth); **identity in D1**. One Worker deploy.
- A published content change goes live after a **rebuild/redeploy** (content is
  bundled at build). Local dev picks up file edits via HMR.
- Reader access is enforced **server-side**, fails **closed**, and forbidden == not-found (both 404 — no existence signal). A file with missing/invalid `visibility` defaults to the **tightest** tier (restricted) via the collection schema.
- Page bodies are **markdown**, **sanitized at render** (`rehype-sanitize`), shared by the reader page and the editor preview.
- Auth = **hand-written Google OAuth** ported from `osbrjp/coop-csnet-poc` (AES-GCM encrypted session cookie), hardened with a state-nonce CSRF check the original lacked.
- **Editing:** for now, edit the markdown files under `src/content/pages/` and commit. The in-browser editor is **preview-only** (its write path — commit via the GitHub API + a build-on-commit pipeline — is scaffolded but deferred).
- **Public repo caveat:** while the content repo is public, `internal`/`restricted` page *source* is readable in git even though the deployed site gates the rendered page. Move the content repo private to make gated content actually private (no code change needed).

## What's verified

**Verified locally with no Docker/Google (unit):**
- `pnpm check` (types), `pnpm build`, `pnpm test` (33 tests), `pnpm guard`.
- Session crypto round-trip + tamper/expiry/wrong-key rejection; the `canRead` ACL truth table + `searchRows` ACL; render pipeline (callouts/TOC/mermaid + XSS sanitize); `doc/*.md → content-file` helpers.

**Verified LIVE against a local Cloudflare D1 (Miniflare, via `astro dev`):**
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
- Production: remote D1 (identity), Worker secrets, prod cookie flags (`secure` keys off `https`), backups.

## Prerequisites

- Node 20+ and pnpm
- `wrangler` (installed as a dev dependency)
- (Optional, for the real login) a Google OAuth **Internal** Workspace client

## Quickstart (local, no Google needed)

```sh
cd app
pnpm install
cp .dev.vars.example .dev.vars          # set COOKIE_ENCRYPTION_KEY (>=32 chars); DEV_LOGIN=1
pnpm db:reset                           # create local D1, apply schema, seed identity (users)
pnpm content:seed                       # (re)generate src/content/pages/*.md from doc/*.md
pnpm dev                                # astro dev on http://localhost:4321 (local D1 via Miniflare)
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
row in `users` — new staff are provisioned by an editor / group sync, not auto-created.

## Layout

```
app/
  src/content/pages/ git-backed content: one <slug>.md per page (frontmatter)
  src/content.config.ts  collection schema (fail-closed defaults)
  src/lib/content/   acl.ts (canRead + searchRows, pure), pages.ts (collection reads),
                     store.ts + store.github.ts (deferred write driver), serialize.ts
  src/lib/auth/      session (AES-GCM), oauth, origin, accessList, cookies, visitor, requireEditor
  src/lib/db/        groups (identity only — listGroups)
  src/lib/csrf.ts    double-submit CSRF
  src/middleware.ts  per-request: decrypt session, resolve role + group keys, fail closed
  src/pages/         index, [...slug], sitemap.xml, api/auth/*, api/search, edit-pages/* (preview)
  src/lib/markdown.ts  callouts / [[TOC]] / mermaid + rehype-sanitize (reader + preview)
  scripts/seed-content.mjs  doc/*.md -> src/content/pages/*.md
  scripts/guard-no-module-client.mjs  CI guard vs identity bleed
  db/                migrations/0001_init.sql (identity), reset.sql, seed/0002_identity.sql
  wrangler.toml      D1 binding + vars
```
