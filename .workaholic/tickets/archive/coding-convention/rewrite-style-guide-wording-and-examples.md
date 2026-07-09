---
title: Rewrite the Style Guide pages — wording, grammar, consistency, worked examples
layer: Documentation
mission: null
depends_on: []
status: archived
created: 2026-07-09
branch: coding-convention
pr: 73
---

# Rewrite the Style Guide pages — wording, grammar, consistency, worked examples

## Summary

Editorial rewrite of the four Style Guide pages so they read cleanly and
consistently, and so the per-language pages teach with worked examples in the
manner of the Google / Airbnb / GitLab guides. This is a copy-edit and
presentation pass — **not** a policy change: every rule's substance, RFC-2119
level, and 🌎/🏠 tag is preserved.

"Reference GitLab / Google / Airbnb" here means emulate their **grammar and
document style** (writing quality, formatting conventions, and Google-style
bad/good code examples). It does **not** mean adding new citations to those
guides or importing their content.

## Scope

In scope:
- Fix wording, grammar, and clarity; normalize to **American English** spelling
  (behavior, modeled, organize — currently mixed with British forms).
- Enforce one-concept-one-word terminology across all four pages (e.g. settle on
  a single term chain for domain-layer code — "project code" / "own types" /
  "the core" / "the pure core" are used near-synonymously; likewise
  "boundary" / "edge" / "adapter", and "Result (Either)" / "Result" / "error
  channel").
- Reconcile the §1 core framing contradiction ("Eliminating runtime errors is
  the goal every rule below serves" vs "literal zero runtime errors is
  impossible").
- Structural consistency across the four pages: every section heading carries
  exactly one 🌎/🏠 tag (fix Go §4 "Interfaces" — currently untagged and with no
  Rationale); every 🏠 section ends with a *Rationale:* line that names the
  mainstream baseline it diverges from; normalize section names (Python
  "Formatting & Linting" vs siblings' "Formatting").
- Add Google-style **bad/good** (❌ / ✅) worked examples to the per-language
  pages for the highest-value rules (at least TypeScript Total Types, Result
  error handling, no-classes; Go errors-as-values / panic; Python EAFP vs
  return-values).
- Add a short "How to read this guide" convention note (GitLab-handbook style)
  in the core page explaining the RFC-2119 levels, the 🌎/🏠 tags, and the
  bad/good example format — once, single-sourced.

Out of scope:
- No new citations or reference entries (do not add GitLab or others to
  References; existing References stay for 🌎/🏠 provenance).
- No change to any rule's substance, RFC-2119 level, or 🌎/🏠 classification.
- No file/slug/H1 renames; no sidebar restructure.

## Key Files

- `doc/style-guide.md` — language-agnostic hub; sets the RFC-2119 legend, 🌎/🏠
  definitions, Rationale-line convention. Primary template the others mirror.
- `doc/style-guide-typescript.md` — already names Google/Airbnb as divergence
  baselines; natural anchor for bad/good examples.
- `doc/style-guide-golang.md` — has the untagged "Interfaces" section to fix.
- `doc/style-guide-python.md` — section naming diverges from siblings.
- `doc/.vitepress/config.mts` — do **not** touch unless a title/slug changes
  (not planned). The four `/style-guide*` routes + H1s are wired here.
- `doc/technical-glossary.md` — only if a new **bold-link** term is introduced
  (add a matching heading, or the build flags a dead anchor).

## Related History

- PR #73 (branch `coding-convention`) contains the guides; the rewrite lands on
  this branch/PR. Commits: `8803297` (Add Coding Style Guide), `9e8c3ee`
  (rename to Style Guide + nest), `25bae56` (original).
- No prior ticket or overlapping work (moderation: clear).

## Implementation Steps

1. Read all four pages together; build a terminology map and pick the canonical
   term for each concept cluster. Apply consistently across all four in the same
   change (terminology policy: update all affected areas together).
2. Copy-edit each page for grammar/clarity; normalize to US English spelling.
3. Fix the §1 framing contradiction in the core page.
4. Tag every section (fix Go "Interfaces"); ensure every 🏠 section has a
   *Rationale:* naming its baseline; align section names across pages.
5. Add the "How to read this guide" note to the core page.
6. Add ❌/✅ bad-then-good examples to the per-language pages for the listed
   high-value rules; keep them minimal and correct.
7. Preserve every glossary **bold-link** (14 anchors), the four slugs/H1s, and
   the [[TOC]] + single-sourced RFC-2119 legend.
8. `pnpm docs:build` and confirm no dead-link / build errors.

## Considerations

- **Objective documentation** (実装 pillar): keep language factual and
  verifiable; do not introduce evaluative adjectives (elegant, powerful, simple)
  or empty hedges (basically, essentially) while "improving wording."
- **One concept, one word** (企画 pillar): do not add synonyms or notational
  variants for terms already fixed in the Technical Glossary; reword sentences,
  not the defined vocabulary.
- **Honest provenance**: the rewrite must not flip a rule's 🌎/🏠 tag or
  misstate what it diverges from; editorial polish only.
- **Load-bearing invariants**: 14 `/technical-glossary#<anchor>` links (exact
  spelling), the four `/style-guide*` slugs + H1s wired in `config.mts`, and the
  core page's single RFC-2119 legend must all survive.

## Quality Gate

Both must hold before approval:

1. **Build passes** — `pnpm docs:build` completes with no dead-link or build
   errors (this is the only automated check; VitePress fails the build on a
   broken `/technical-glossary#anchor` or `/style-guide*` link). Confirms all 14
   glossary anchors and the four slugs/H1s still resolve.
2. **Named human review** — a reviewer reads all four pages and confirms:
   - grammar/wording is clean and consistent; spelling is uniformly US English;
   - terminology is consistent (one word per concept, matching the glossary);
   - every section is 🌎/🏠-tagged and every 🏠 section has a Rationale line;
   - bad/good examples are present for the listed high-value rules and are
     correct;
   - **no rule's substance, RFC-2119 level, or 🌎/🏠 tag changed** (diff read
     against the pre-rewrite version to confirm editorial-only).

Reviewer: to be assigned on the PR (mention on PR #73).
