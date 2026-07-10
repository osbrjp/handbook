---
title: Fix Style Guide sidebar default-expanded and missing parent-page link
layer: Documentation
mission: null
depends_on: []
status: todo
created: 2026-07-10
---

# Fix Style Guide sidebar default-expanded and missing parent-page link

## Summary

Two navigation defects in the VitePress handbook, both editorial/config only —
no changes to the Style Guide rule content.

1. **Style Guide is expanded by default.** In `doc/.vitepress/config.mts` the
   parent **Development Guide** sidebar group is `collapsed: false`, so its
   nested Style Guide sub-tree shows expanded on load. (The Style Guide group
   itself is already `collapsed: true`; the parent is the cause.)
2. **No link to the Style Guide from its parent page.** `doc/development-guide.md`
   has no in-content link to the Style Guide, so a reader on the Development
   Guide page can only reach it via the sidebar.

## Scope

In scope:
- Set the Development Guide sidebar group to `collapsed: true` in
  `doc/.vitepress/config.mts`.
- Add an in-content link to `/style-guide` in `doc/development-guide.md`, at the
  natural anchor **§1-4 Editor Configuration** (which already discusses Prettier
  and `go fmt`).

Out of scope:
- No changes to the Style Guide pages' rules/content.
- No file/slug renames; no other sidebar restructuring.

## Key Files

- `doc/.vitepress/config.mts` — sidebar; the `Development Guide` group's
  `collapsed` flag (currently `false`).
- `doc/development-guide.md` — add the Style Guide link (§1-4).

## Implementation Steps

1. In `config.mts`, change the `Development Guide` group `collapsed: false` →
   `collapsed: true`. Leave the nested `Style Guide` group as `collapsed: true`.
2. In `development-guide.md` §1-4 Editor Configuration, add a sentence linking to
   the [Style Guide](/style-guide) (e.g. "Follow the Style Guide for the full
   per-language formatting and coding policy.").
3. `pnpm docs:build` and confirm no dead links.

## Considerations

- Keep the link text/target consistent with the sidebar label ("Style Guide",
  `/style-guide`).
- Do not touch the glossary anchors or the `/style-guide*` slugs.

## Quality Gate

Both must hold before approval:

1. **Build passes** — `pnpm docs:build` completes with no dead-link or build
   error.
2. **Local visual check** (`pnpm docs:dev`):
   - The Style Guide sub-tree is **collapsed by default** (the Development Guide
     group no longer auto-expands on load).
   - The Development Guide page shows a **working** in-content link to the Style
     Guide.
