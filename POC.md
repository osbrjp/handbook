# Handbook POC — Astro frontend + Directus (reader RBAC + Google Workspace auth)

A proof-of-concept for moving the OSBR handbook **off VitePress** to a fully
custom frontend with a built-in editor for non-technical staff and **server-side
per-page reader access control** keyed to Google Workspace identity.

> Scope: this POC proves the **enforcement engine** with **manually-assigned
> groups/policies**. Automatic Google-Group → policy sync, CDN cache-safety, and
> production hosting are **pre-prod** work, not proven here. See _Deferred_ below.

Decision rationale and the red-team ruling live in the linked issue/PR.

## Architecture

```
Browser ──HTTP──> Astro SSR app (app/, :4321)  ──server fetch (as the visitor)──> Directus (:8055) ──> Postgres
                   - custom UI, owns 100% of the frontend            - reader RBAC + per-page policies (fails closed)
                   - per-request Directus client (no shared client)  - built-in editor for non-tech staff
                   - renders markdown (callouts, [[TOC]], mermaid)    - Google Workspace OAuth (OpenID driver)
```

- **Content** lives in Directus as **markdown** (`pages` collection). Source of
  truth is the DB; `doc/*.md` is migrated in once via `directus/migrate-doc.mjs`.
- **Reader access is enforced by Directus**, not in app code. The app fetches
  **as the visitor** and renders only what comes back; it **fails closed** on any
  error and returns **404** for not-found *and* forbidden (no existence leak).

## What's verified vs deferred

**Verified in this branch (no Docker needed):**
- ✅ Astro app type-checks (`pnpm check`) and builds (`pnpm build`).
- ✅ Markdown render pipeline — `:::` callouts, `[[TOC]]`, ```mermaid``` — unit-tested.
- ✅ `doc/*.md` → `directus/seed/pages.json` migration runs and is unit-tested.
- ✅ CI guardrail (`pnpm guard`) blocks module-scoped/identity-leaking clients.

**Requires Docker + your Google OAuth client (run locally to verify):**
- ⏳ Directus stack boot, schema bootstrap, Google login on localhost.
- ⏳ The reader-ACL acceptance matrix (below) — the core security claim.

**Deferred to pre-prod (explicitly NOT in this POC):**
- Automatic Google-Group → policy sync (Admin SDK + domain-wide delegation; needs a Workspace super-admin).
- CDN/edge cache-safety for authenticated responses (designed for via headers; untestable on localhost).
- Production hosting/hardening, backups, single-flight token refresh, server-side session invalidation.

## Prerequisites

- Docker + Docker Compose
- Node 20+ and pnpm
- A Google OAuth 2.0 **Web** client (Google Cloud Console)

## Quickstart

```sh
# 1. Frontend deps + sanity checks (no Docker needed)
cd app && pnpm install && pnpm check && pnpm test && pnpm guard && cd ..

# 2. (Re)generate the seed from doc/*.md
node directus/migrate-doc.mjs

# 3. Configure + start the backend
cp directus/.env.example directus/.env      # then edit (secrets, Google creds)
cd directus && docker compose up -d && cd ..

# 4. Create the pages collection + import content
#    (--env-file so the admin credentials from directus/.env are used)
node --env-file=directus/.env directus/bootstrap.mjs

# 5. Create roles & policies in the Directus UI (see below), then set
#    READER_ROLE_ID in directus/.env and: cd directus && docker compose up -d

# 6. Start the frontend
cp app/.env.example app/.env                # defaults are fine for localhost
cd app && pnpm dev
```

- Frontend: http://localhost:4321
- Directus admin: http://localhost:8055

## Google OAuth client

In Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID
(**Web application**):

- Authorized redirect URI: `http://localhost:8055/auth/login/google/callback`
- Put the client ID/secret into `directus/.env` (`AUTH_GOOGLE_CLIENT_ID/SECRET`).

> ⚠️ **Domain restriction (required).** Configure the OAuth consent screen as an
> **Internal** app (User type: Internal) so only OSBR Workspace accounts can log
> in. The compose file auto-provisions any successful Google login as a Reader —
> if the app is **External**, anyone with a Google account could read internal
> pages, so set `AUTH_GOOGLE_ALLOW_PUBLIC_REGISTRATION=false` and provision
> Readers by hand instead.

Google permits `http://localhost` redirect URIs, so the full login loop works
locally with no HTTPS. (Reading group membership is a *separate*, deferred concern.)

> ⚠️ Do **not** sign in with Google until you have created the **Reader** role,
> set `READER_ROLE_ID` in `directus/.env`, and restarted Directus. Auto-provisioned
> logins before the role exists become roleless users (they see nothing — fail
> closed — but you'll then have to fix them up by hand).

## Roles & policies (manual — Directus UI)

The POC's three reader levels map to policies:

| Visibility   | Who can read                          | How                                         |
| ------------ | ------------------------------------- | ------------------------------------------- |
| `public`     | anyone (anonymous)                    | **Public** policy: read `pages` where `visibility = public` |
| `internal`   | any logged-in user                    | **Reader** policy (on Reader role): read `pages` where `visibility in [public, internal]` |
| `restricted` | only users with the extra policy      | **Restricted** policy (attach to a user by hand): read `pages` where `visibility = restricted` |

Editors additionally get create/update on `pages` via an **Editor** policy on the
Editor role.

Setup:
1. **Settings → Access Policies** → create `Public read`, `Reader`, `Editor`,
   `Restricted` policies with the rules above (collection `pages`, action `read`,
   plus create/update for Editor).
2. **Settings → Roles** → create `Reader` and `Editor` roles; attach the matching
   policies. Attach the `Public read` policy to the built-in **Public** policy/role.
3. Copy the **Reader** role UUID → `directus/.env` `READER_ROLE_ID` → restart
   Directus (so auto-provisioned Google logins become Readers).
4. To demo `restricted` + **union**: create a test user, give them the **Reader**
   role *and* attach the **Restricted** policy. They should now see
   internal ∪ restricted — proving additive (OR) policy merge.

## Acceptance test matrix (the core security claim)

Walk this in a real browser after setup. **The non-member-on-restricted case is
the one that matters most.**

| Visitor                         | public | internal | restricted |
| ------------------------------- | :----: | :------: | :--------: |
| anonymous                       |  200   |   404    |    404     |
| logged-in, no restricted policy |  200   |   200    |  **404**   |
| logged-in, restricted policy    |  200   |   200    |    200     |
| editor                          |  200   |   200    |    200 + can edit |

Also verify:
- **No existence leak:** as anonymous, `/sitemap.xml` and the home nav list
  contain **only public** slugs — no internal/restricted titles or URLs.
- **Fail closed:** stop the Directus container, reload an internal page → you get
  an error/empty state, **never** restricted content.
- **Editor RBAC:** an Editor can edit a page in the Directus editor and the change
  renders; a Reader has no edit access.
- **Render fidelity:** a page with a `:::` callout and a ```mermaid``` block
  renders both correctly (`strategy` has several mermaid diagrams).

## Build-time guardrails honored (from the red-team)

- **Per-request visitor client only** — no module-scoped/stateful Directus auth
  client. Enforced by `app/scripts/guard-no-module-client.mjs` (`pnpm guard`).
- **Fail closed** on every error path (404 for not-found/forbidden; no public
  fallback render).
- **No enumeration** — nav and sitemap are built from permission-filtered queries
  (sitemap uses the anonymous client).
- **Cache headers** — non-public responses set `Cache-Control: private, no-store`
  + `Vary: Cookie` (full CDN-safety is a pre-prod check).
- **Markdown stored verbatim** — never rich-text JSON, preserving fidelity.
- **Output sanitized** — page bodies pass through `rehype-sanitize` before
  `set:html`, stripping `<script>`, event handlers, and `javascript:` URLs
  (stored-XSS defense) while keeping callouts/TOC/mermaid.
- **Login domain-restricted** — the Google OAuth app must be Internal
  (Workspace-only); see the warning above.

## Layout

```
app/                     Astro SSR frontend (custom UI, auth, rendering)
  src/lib/directus.ts    per-request client factory + read helpers
  src/lib/markdown.ts    callouts / [[TOC]] / mermaid pipeline
  src/middleware.ts      attaches visitor; fails closed
  src/pages/             index, [...slug], sitemap.xml, auth/*
  scripts/guard-*.mjs    CI guard against identity-leaking clients
  tests/                 render + migration unit tests
directus/
  docker-compose.yml     Directus 11 + Postgres 16
  bootstrap.mjs          creates the pages collection + imports seed
  migrate-doc.mjs        doc/*.md -> seed/pages.json
  seed/pages.json        generated seed (10 pages)
```
