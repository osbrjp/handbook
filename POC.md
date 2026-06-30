# Handbook POC — Astro + Cloudflare D1, from scratch (no CMS)

A proof-of-concept moving the OSBR handbook **off VitePress** to a fully custom
Astro app on Cloudflare, with a **built-in editor for non-technical staff** and
**server-side per-page reader access** keyed to Google Workspace identity — all
written from scratch, no Directus/headless-CMS.

> The reader ACL, editor RBAC, CSRF, and stored-XSS defenses are **verified live**
> against a local D1 (see below). Only the live Google OAuth handshake is deferred
> (needs a real Workspace OAuth client); its session/cookie/enforcement machinery
> is already proven via the dev-login shim.

## Architecture

```
Browser ──> Astro SSR Worker (@astrojs/cloudflare)  ──>  Cloudflare D1 (SQLite)
            - custom UI, owns the whole frontend          content + users + groups + ACL
            - middleware: decrypt session cookie,
              re-resolve role+groups from D1 per request (no identity bleed)
            - readableWhere(): ONE SQL predicate = the entire reader ACL
            - /admin editor (editor-role only, 404 otherwise) + live preview
            - hand-written Google OAuth (AES-GCM session cookie), coop-pattern
```

- **One datastore** (D1), **one deploy** (a single Worker) — no separate backend service.
- Reader access is enforced **server-side**, fails **closed**, and forbidden == not-found (both 404 — no existence signal).
- Page bodies are stored as **markdown** and **sanitized at render** (`rehype-sanitize`), shared by the reader page and the editor preview.
- Auth = **hand-written Google OAuth** ported from `osbrjp/coop-csnet-poc` (AES-GCM encrypted session cookie), hardened with a state-nonce CSRF check the original lacked.

## What's verified

**Verified locally with no Docker/Google (unit):**
- `pnpm check` (types), `pnpm build`, `pnpm test` (26 tests), `pnpm guard`.
- Session crypto round-trip + tamper/expiry/wrong-key rejection; `readableWhere` ACL table; render pipeline (callouts/TOC/mermaid + XSS sanitize); `doc/*.md → seed`.

**Verified LIVE against a local Cloudflare D1 (Miniflare, via `astro dev`):**
- Reader ACL matrix through the real app (dev-login shim as each persona):

  | persona | public | internal | restricted |
  |---|:--:|:--:|:--:|
  | anonymous | 200 | 404 | 404 |
  | reader | 200 | 200 | 404 |
  | leader (leadership group) | 200 | 200 | **200** |
  | editor | 200 | 200 | 200 |

- Nav + sitemap as anon contain **only public** slugs (no enumeration).
- Editor RBAC: `/admin*` is 200 for editors, **404** for readers/anon.
- CSRF: bad double-submit token → 403; cross-origin POST → 403 (Astro origin check).
- Stored XSS: an editor saving `<script>`/`javascript:` → the published reader page strips both, callout still renders.

**Deferred (needs a real Google OAuth client / pre-prod):**
- The live Google OAuth handshake (`/api/auth/login` + `/api/auth/callback` are written and code-reviewable).
- Google Group → role/group sync (POC assigns groups by hand in the seed).
- Production: remote D1, Worker secrets, prod cookie flags already handled (`secure` keys off `https` origin), single-flight refresh, backups.

## Prerequisites

- Node 20+ and pnpm
- `wrangler` (installed as a dev dependency)
- (Optional, for the real login) a Google OAuth **Internal** Workspace client

## Quickstart (local, no Google needed)

```sh
cd app
pnpm install
cp .dev.vars.example .dev.vars          # set COOKIE_ENCRYPTION_KEY (>=32 chars); DEV_LOGIN=1
pnpm db:reset                           # create local D1, apply schema, seed from doc/*.md
pnpm dev                                # astro dev on http://localhost:4321 (local D1 via Miniflare)
```

Log in as a seeded persona without Google via the dev-login shim (works only when `DEV_LOGIN=1`):

```
http://localhost:4321/api/auth/dev-login?email=bruce.l@osbrjp.com    # editor
http://localhost:4321/api/auth/dev-login?email=reader@osbrjp.com     # reader
http://localhost:4321/api/auth/dev-login?email=leader@osbrjp.com     # reader + leadership (sees restricted)
```

- Reader site: http://localhost:4321/  · Editor: http://localhost:4321/admin

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
  src/lib/auth/      session (AES-GCM), oauth, origin, accessList, cookies, visitor, requireEditor
  src/lib/db/        pages (readableWhere ACL + reads/upsert), groups
  src/lib/csrf.ts    double-submit CSRF
  src/middleware.ts  per-request: decrypt session, resolve role+groups, fail closed
  src/pages/         index, [...slug], sitemap.xml, api/auth/*, admin/*
  src/lib/markdown.ts  callouts / [[TOC]] / mermaid + rehype-sanitize (reader + preview)
  scripts/guard-no-module-client.mjs  CI guard vs identity bleed
  db/                migrations/0001_init.sql, reset.sql, migrate-doc.mjs, seed/0002_seed.sql
  wrangler.toml      D1 binding + vars
```
