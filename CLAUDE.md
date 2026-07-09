# Claude instructions — osbrjp/handbook

App code lives in `app/` (Astro SSR on Cloudflare Workers). `doc/` is the
legacy VitePress site. `POC.md` records architecture decisions, deploy
mechanics, and the cutover plan — read it before changing auth, deploy
config, or the content workflow.

## Code quality (apply to every change)

- **No duplicates.** Before finishing any change, sweep for copy-pasted
  logic/markup/CSS it introduced or touched. Extract a helper or shared
  component when the same rule lives in two places (see
  `app/src/lib/ui/editorForms.ts`, `app/src/components/Icon.astro` for the
  established pattern). Don't extract when call sites merely look similar
  but encode different behavior.
- **Comments: short, but enough context for the next session.** Explain WHY
  (the constraint, the trap, the verified fact) — never what the next line
  does. Delete comments that describe old iterations.
- **CSS**: source order matters in `global.css` — same-specificity overrides
  must come AFTER the base rules they override (this has silently broken
  before; grep "admin-list mobile" for the documented example).

## Hard rules (public repo)

- **Scan every diff before commit/push** for secrets, tokens, personal
  emails, account ids, and live non-production URLs. Encrypted values and
  credentials live in Cloudflare/GitHub settings, never in the repo.
- No allow-lists, no databases: GitHub repo access IS the access control.
- Use **pnpm** in `app/` (never npm).

## Gates before any commit

Run in `app/`: `pnpm test` and `pnpm build` — both must pass.
