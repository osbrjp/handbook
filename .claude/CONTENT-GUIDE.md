# Editing handbook content (guide for AI agents)

Read this before creating, editing, renaming or deleting any page under `doc/`.
A markdown file dropped into `doc/` **without** the frontmatter block below
fails the build — the Cloudflare Worker serves pages from a build-time content
collection with a strict schema, not from raw files at runtime.

Source of truth for everything here: `app/src/content.config.ts` (schema),
`app/src/lib/content/serialize.ts` (on-disk format), `app/src/lib/markdown.ts`
(what a body may contain).

## 1. Where a page lives

- `doc/<slug>.md` — **top level only**. Files in subdirectories are not pages.
- The filename stem **is** the slug **is** the URL: `doc/code-review.md` → `/code-review`.
- Slug must match `^[a-z0-9][a-z0-9-]*$` (lowercase, digits, hyphens; no dots, no slashes).
- `doc/index.md` is excluded from the collection — the app has its own root
  page, so `index.md` is not a handbook page.

## 2. The frontmatter block

Copy this shape exactly. String values are double-quoted; `sort` and
`visibility` are bare.

```markdown
---
title: "Access Control"
section: "Guideline"
parent: "quality-gate"
nav_label: "Access Control"
sort: 590
visibility: public
---

# Access Control

Body starts here.
```

| Key | Required | Rules |
| --- | --- | --- |
| `title` | yes | Quoted string. Also rendered as the page `<h1>` by the app. |
| `section` | yes | Quoted string. Sidebar group. Use an existing one: `About`, `People & Culture`, `Guideline`, `Policies`. A new value creates a new group. |
| `parent` | no | Slug of the parent page, **in the same section**. A parent in another section (or a missing one) silently makes the page top-level. Nesting is capped at 4 levels. |
| `nav_label` | no | Quoted string; sidebar label when it should differ from `title`. Empty string = fall back to `title`. |
| `sort` | no (defaults 0) | Number. Orders pages within a section **and** orders the sections themselves (a section sits where its lowest-`sort` page falls). |
| `visibility` | no (defaults `internal`) | `public` (anyone) or `internal` (signed-in only). **Fails closed** — a typo means internal. |
| `updated_by` / `updated_at` | no | Written by the in-app editor. Do not hand-author them. |

No other keys. Anything else is ignored by the app and just noise.

`sort` bands currently in use — pick a free number in the right band, step 10:

- `100–199` About · `200–299` People & Culture · `300–759` Guideline · `800–899` Policies

## 3. The body

- The body **must open with `# <title>`** (same text as `title`), then a blank
  line. This is the on-disk format: `serializePageFile` re-adds that H1 every
  time the in-browser editor saves, and the app strips it on load
  (`stripLeadingH1`) before rendering its own `<h1>` from frontmatter. Omit it
  and your file diverges from every file the editor writes; use different text
  and the page contradicts its own frontmatter.
- Allowed: GitHub-flavoured markdown (tables, task lists, strikethrough),
  fenced code, `:::info` / `:::tip` / `:::warning` / `:::danger` / `:::note` /
  `:::caution` / `:::important` / `:::details` callouts (with or without a
  label), ` ```mermaid ` diagrams, and `[[TOC]]` on its own line for an
  in-body table of contents.
- **Every page already gets an "On this page" outline** — `[...slug].astro`
  calls `extractHeadings`, which collects **`##` and `###` only** (fenced code
  skipped). Anything deeper never appears in it, so carry the page's structure
  on h2/h3. `[[TOC]]` is a separate, optional in-body list.
- **Raw HTML is dropped** — the renderer parses no HTML and sanitizes its own
  output. Never reach for `<div>`, `<br>`, `<details>` or inline styles.
- Internal links are root-relative slugs: `[Quality Gate](/quality-gate)`.
- **Never commit a personal email address.** `pnpm guard` fails CI on any
  `@osbrjp.com` / `@oz-design.jp` address other than `handbook@` and `info@`.
  Identity in this repo is GitHub usernames. The repo is public — the same
  applies to tokens, account ids and non-production URLs.

## 4. Task recipes

**Add a page**

1. Create `doc/<slug>.md` with the frontmatter block and the `# Title` H1.
2. Pick `section` + `sort` + `parent` so it lands where intended in the
   sidebar. That is the whole job — the live sidebar is generated from
   frontmatter (`Sidebar.astro` groups by `section`, nests by `parent`, orders
   by `sort`, labels with `nav_label` or `title`). There is nothing to register.
3. Run the gates (§5).

**Edit a page** — edit the body; leave frontmatter alone unless the change is
about placement, title or visibility. Run the gates.

**Rename / move a page** — the filename is the slug, so `git mv` the file, then
fix every reference: `parent:` in child pages and `](/old-slug)` links across
`doc/`. Old URL will 404.

**Delete a page** — remove the file, then the same two reference sweeps.

Nothing in `doc/.vitepress/` is part of any of this — see §7.

## 5. Gates before commit (non-negotiable)

Run in `app/`:

```sh
pnpm check   # typecheck + content schema
pnpm test
pnpm guard   # no personal emails, no module client
pnpm build   # the real schema gate: bad frontmatter fails here
```

A frontmatter mistake surfaces as an `astro build` schema error naming the file
and the offending key. CI runs the same four, plus one legacy build (§7).

## 6. How it reaches production

**The Cloudflare Worker is the live site.** `handbook.osbrjp.com` resolves to
CloudFront, which fronts the Worker — a response carries both vendors' headers
(`via: …cloudfront.net` and `cf-ray` / `server: cloudflare`), so seeing
CloudFront in the headers does not mean you are looking at a cached static
site. Note `POC.md` still describes the pre-cutover DNS. Content is
**bundled at build time**: a merged change to `doc/**` on `main` triggers the
Worker deploy (`.github/workflows/deploy-worker.yml`), and until that deploy
finishes the new page does not exist for the Worker. Adding a file to the repo
is not publishing.

Drafts and pending edits from the in-app editor live on `handbook/<slug>`
branches and their PRs — never as hidden pages in `doc/`. Everything in `doc/`
on `main` is published. `visibility` decides who may read it, not whether it is
live.

## 7. The one legacy thing, so you can ignore it deliberately

`doc/.vitepress/` is the old VitePress site — the GitHub Pages version, which
predates the app. **The Astro app never reads any of it**, including the
hand-maintained sidebar in `doc/.vitepress/config.mts`. Its build
(`pnpm run docs:build` at the repo root) is still a CI check, so don't break
it, and `.github/workflows/release.yml` still ships it to Pages on a push to
`release` — but DNS no longer resolves there, so that deploy publishes nothing
to readers.

Practical rule: write for the app. Leave `doc/.vitepress/` alone unless you
were asked to work on the Pages version.
