# The OSBR Handbook

A guide to our culture, values, and workflows. Transparency as our commitment to clients, team members, and future team members.

https://osbrjp.github.io/handbook/

## Development Guide

This repository is maintained according to the [guideline](https://osbrjp.github.io/handbook/development-guide.html), just like other OSBR repositories. 

Quick start:

```sh
$ git clone git@github.com:osbrjp/handbook.git
$ cd handbook
$ sh/start-vitepress.sh

vitepress v1.6.3

➜  Local:   http://localhost:5173/handbook/
➜  Network: use --host to expose
➜  press h to show help
```

## Run the Local Demo Stack

A self-contained, two-stack local demo of how the OSBR handbook could be hosted in production — a static landing page in front of an editable wiki. It runs entirely in Docker and is intended for evaluation, demos, and forking (especially for UI / branding experiments on top of Wiki.js).

### Architecture

Two independent Docker stacks model the eventual two-host setup:

- `landing/` — nginx serving the VitePress static build on port `8080`. Public-facing entry point; the hero "Enter Handbook" button links to the Wiki.js URL below.
- `wikijs/` — Wiki.js 2.x + PostgreSQL on port `3000`. Hosts the editable handbook content.

Helper scripts live in `sh/`. The umbrella entry point is `sh/hbw` — every operation below is reachable through it.

### How it works

VitePress and Wiki.js disagree on where content lives:

- **VitePress** (what `main` already serves) treats the markdown in `doc/` as the source of truth and renders it to static HTML at build time. Edits go through git.
- **Wiki.js** stores pages, assets, navigation, and theming inside its PostgreSQL database. Edits happen in the web UI and are written straight to the DB; the markdown files in `doc/` are not consulted at runtime.

The local demo bridges the two with a one-shot import pipeline so the wiki ships pre-populated with the handbook's existing content:

```
doc/*.md  ──►  prepare-import.mjs  ──►  wikijs/generated-import/
               (host, Node)             (normalized .md + assets
                                          + navigation.json)
                                                  │
                                                  │  docker cp
                                                  ▼
                                    /wiki/import/handbook (in container)
                                                  │
                                                  ▼
                                    import-handbook.js (in container)
                                       │
                                       ├─ boots Wiki.js's own runtime
                                       ├─ diskImporter.processPage(...)    ─┐
                                       ├─ diskImporter.processAsset(...)   ─┤─► Postgres
                                       └─ models.navigation.patch('site')  ─┘
```

Step by step:

1. **`wikijs/prepare-import.mjs` (host)** reads each file listed in `pageOrder`, strips the first H1 (it becomes the page title in front matter), removes `[[TOC]]` markers, rewrites VitePress `:::` admonitions as blockquotes, normalizes code fences, and writes the result into `wikijs/generated-import/` (gitignored). It also builds `navigation.json` from a hard-coded section/page list.
2. **`sh/import-wikijs-local.sh`** copies that directory into the running `handbook-wikijs` container, then executes `import-handbook.js` inside it.
3. **`wikijs/import-handbook.js` (in-container)** bootstraps Wiki.js's own modules — database, auth, page model, disk-storage importer — and uses `diskImporter.processPage` / `processAsset` to write pages and uploads into Postgres exactly as if you had triggered Wiki.js's built-in storage import from the UI. Finally it patches the `navigation` table with the generated tree.

Styling and branding take the same shape — they write straight into the `settings` table:

- **`sh/style-wikijs-local.sh`** updates the `theming` row (Wiki.js stores its injected CSS there as JSON).
- **`sh/brand-wikijs-local.sh`** updates the `title` and `logoUrl` rows (the logo is embedded as a base64 data URI sourced from `doc/public/logo1.svg`) and restarts the wiki container so the title picks up.

Implications worth keeping in mind:

- **`doc/*.md` is still the source of truth** for this repo. The DB is a downstream artifact built by the import. Re-running `sh/hbw import` overwrites the imported pages from `doc/`.
- **Edits made in the Wiki.js UI live only in the DB.** They are *not* synced back to `doc/*.md`. If someone edits a page through the wiki and you then re-run `import`, those edits are lost.
- **The DB lives in a named Docker volume** (`wikijs_wikijs_db_data`). `sh/hbw stop` / `start` preserve it; only `sh/hbw reset` removes it.

### Prerequisites

- Docker Desktop, or Docker Engine + Compose v2
- Node.js 18+ and npm — used to build the VitePress landing and to prepare the import payload
- git

### First-time setup

Walk through this top to bottom on a fresh clone:

```sh
$ git clone git@github.com:osbrjp/handbook.git
$ cd handbook
$ npm install
$ sh/hbw start
```

`sh/hbw start` builds the VitePress landing into `doc/.vitepress/dist/`, copies `landing/.env.example` and `wikijs/.env.example` to their `.env` files if missing, then brings both stacks up. First Wiki.js boot can take up to a minute.

Once they're up:

- Landing page — http://localhost:8080
- Wiki.js     — http://localhost:3000

Open the Wiki.js URL. You'll see the **initial setup screen** — pick an admin email + password and save. This creates the root admin that the importer writes content as.

Import the handbook content, then apply styling and branding:

```sh
$ sh/hbw import
$ sh/hbw style
$ sh/hbw brand
```

- `import` normalizes `doc/*.md`, copies static assets, builds the Wiki.js navigation tree, and runs the importer inside the container.
- `style` hides the default Wiki.js sidebar and page-header for a cleaner reading view.
- `brand` swaps the site title and logo to OSBR (embeds `doc/public/logo1.svg`) and restarts the wiki container so the title picks up.

Reload http://localhost:3000 — the navigation should match the handbook structure, and the "Enter Handbook" hero on http://localhost:8080 should link straight in.

### Day-to-day operations

`sh/hbw` is the single entry point. Run it from anywhere inside the repo:

| Command             | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `sh/hbw start`      | Build VitePress + start landing and Wiki.js stacks          |
| `sh/hbw stop`       | Stop both stacks                                            |
| `sh/hbw restart`    | `stop` then `start`                                         |
| `sh/hbw status`     | Show running handbook containers                            |
| `sh/hbw import`     | Re-import handbook content from `doc/` into Wiki.js         |
| `sh/hbw style`      | (Re-)apply Wiki.js CSS overrides                            |
| `sh/hbw brand`      | (Re-)apply OSBR logo + site title                           |
| `sh/hbw logs [svc]` | Tail logs — `wiki` (default), `landing`, or `db`            |
| `sh/hbw psql`       | Open a `psql` shell on the Wiki.js database                 |
| `sh/hbw urls`       | Print the local URLs                                        |
| `sh/hbw reset`      | **Destructive.** Wipe the Wiki.js DB volume and start clean |
| `sh/hbw help`       | Full command list                                           |

Rule of thumb for re-runs:

- Edited `doc/*.md` → `sh/hbw import`
- Edited `sh/style-wikijs-local.sh` → `sh/hbw style`
- Edited `sh/brand-wikijs-local.sh` or `doc/public/logo1.svg` → `sh/hbw brand`
- Edited the VitePress landing (`doc/index.md`, `doc/.vitepress/`) → `sh/hbw restart` to rebuild + redeploy

### Per-stack config

`landing/.env` and `wikijs/.env` are created from `.env.example` on first start and are gitignored. Tweak ports / DB credentials there and restart the relevant stack.

| File           | Knobs                                                   |
| -------------- | ------------------------------------------------------- |
| `landing/.env` | `LANDING_PORT`                                          |
| `wikijs/.env`  | `WIKI_PORT`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` |

Note: the hero "Enter Handbook" link in `doc/index.md` is hard-coded to `http://localhost:3000`. If you change `WIKI_PORT`, update the link too.

### Forking for UI work

If you want to experiment with the look and feel, these are the files to start from:

- **Landing page UI** — `doc/index.md` (VitePress home front matter), `doc/.vitepress/` (theme + config), `doc/public/` (assets, including `logo1.svg`)
- **Wiki.js CSS overrides** — `sh/style-wikijs-local.sh` (CSS injected into the Wiki.js `theming` settings row)
- **Wiki.js branding** — `sh/brand-wikijs-local.sh` (site title + logo data URI)
- **Content shape / navigation** — `wikijs/prepare-import.mjs` (`pageOrder`, `navItems`, admonition normalization)
- **Importer internals** — `wikijs/import-handbook.js` (runs inside the Wiki.js container, uses the storage + page helpers)

After editing CSS or branding, re-run the matching `sh/hbw` subcommand. After editing content or the import prep, re-run `sh/hbw import`. After editing the VitePress landing, `sh/hbw restart`.

### Starting over

```sh
$ sh/hbw reset
```

Stops both stacks, removes the `wikijs_wikijs_db_data` Docker volume (admin user, all pages, all settings), then brings the stacks back up clean. You'll need to redo the Wiki.js setup screen and the `import` / `style` / `brand` steps. Useful after diverging experiments or before sharing a clean snapshot.
