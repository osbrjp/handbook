# Directus backend (handbook POC)

Self-hosted Directus 11 + Postgres 16 for the handbook POC. Full run guide,
architecture, and the acceptance-test matrix live in [`../POC.md`](../POC.md);
this file covers the backend and the **manual roles & policies** step that
`bootstrap.mjs` points you to.

## Run order (summary)

```sh
cp .env.example .env                                   # edit: secrets + Google creds
docker compose up -d                                   # Directus :8055 + Postgres
node --env-file=.env bootstrap.mjs                     # create `pages` collection + import seed
# then set up roles & policies (below), set READER_ROLE_ID in .env, and:
docker compose up -d                                   # restart so the Google default role applies
```

`migrate-doc.mjs` regenerates `seed/pages.json` from `../doc/*.md`.

## Roles & policies (manual — Directus UI)

The v11 policy API is version-sensitive, so this is a click-path rather than
automated. The three reader levels map to policies on the `pages` collection:

| Visibility   | Who can read                     | Policy rule (`pages`, action `read`)            |
| ------------ | -------------------------------- | ----------------------------------------------- |
| `public`     | anyone (anonymous)               | `visibility = public`                           |
| `internal`   | any logged-in user               | `visibility in [public, internal]`              |
| `restricted` | only users with the extra policy | `visibility = restricted`                       |

Steps:

1. **Settings → Access Policies** — create:
   - **Public read** — read `pages` where `visibility = public`. Attach to the built-in **Public** policy/role.
   - **Reader** — read `pages` where `visibility in [public, internal]`.
   - **Editor** — read all `pages` + **create/update** `pages`.
   - **Restricted** — read `pages` where `visibility = restricted` (do **not** attach to a role; attach to individual users to grant restricted access).
2. **Settings → Roles** — create **Reader** and **Editor** roles; attach the matching policies.
3. Copy the **Reader** role UUID into `.env` → `READER_ROLE_ID`, then
   `docker compose up -d` so auto-provisioned Google logins become Readers.
4. **Demo restricted + union:** create a test user with the **Reader** role *and*
   the **Restricted** policy attached. They should see internal ∪ restricted —
   proving Directus merges policies additively (OR).

> ⚠️ Don't sign in with Google before the Reader role exists and `READER_ROLE_ID`
> is set (see POC.md) — earlier logins create roleless users.

## Files

```
docker-compose.yml   Directus 11 + Postgres 16 (localhost cookie/CORS, Google OpenID)
.env.example         copy to .env and fill in
bootstrap.mjs        fetch-based: creates the pages collection + imports seed
migrate-doc.mjs      ../doc/*.md -> seed/pages.json
seed/pages.json      generated seed (10 pages, 3 visibility levels)
```
