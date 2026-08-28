# The OSBR Handbook

A guide to our culture, values, and workflows. Transparency as our commitment to clients, team members, and future team members.

https://handbook.osbrjp.com

## What is in this repository

- `doc/` — the handbook content. One markdown file per page, carrying a
  frontmatter block that the app validates at build time.
- `app/` — the site that serves it: Astro SSR on Cloudflare Workers, with
  GitHub sign-in and an in-browser editor.
- `infra/` — Terraform for the CloudFront distribution that terminates TLS for
  `handbook.osbrjp.com` and reverse-proxies to the Worker.

The legacy VitePress build still lives in the tree and still ships to GitHub
Pages, but it is no longer what readers get — the live site is the Worker.

## Editing handbook pages

**People edit on the site, not in this repository.** Sign in at
https://handbook.osbrjp.com with your GitHub account and use the in-browser
editor; submitting a page for approval opens a pull request for it. Repository
access is the only permission there is — no separate accounts, no allow-list.

**AI agents editing `doc/*.md` directly** follow
[`.claude/CONTENT-GUIDE.md`](.claude/CONTENT-GUIDE.md). Those files carry a
required frontmatter block, and a plain markdown file dropped into `doc/` fails
the build and never reaches the Worker.

## Development Guide

This repository is maintained according to the
[guideline](https://handbook.osbrjp.com/development-guide), just like other
OSBR repositories.

Quick start — the app (use **pnpm**, never npm):

```sh
git clone git@github.com:osbrjp/handbook.git
cd handbook/app
pnpm install
pnpm dev        # the site
pnpm dev:edit   # the site plus the local content agent, so the editor can save
```

Gates before any commit, from `app/`:

```sh
pnpm check
pnpm test
pnpm guard
pnpm build
```

The legacy VitePress site, from the repository root:

```sh
pnpm install
pnpm docs:dev
```
