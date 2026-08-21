---
created_at: 2026-07-13T20:02:57+09:00
author: po.ching.yu.alex@oz-design.jp
type: housekeeping
layer: [UX, Config]
effort:
commit_hash:
category:
depends_on: []
mission: null
status: todo
---

# Land infra planning policy docs on PR #89 (branch is empty; work already committed locally)

## Summary

PR #89 ("Add Infrastructure Planning Policy, Database Guidelines, and Terraform
Style Guide", closes #88) was auto-opened from the placeholder branch
`i88-20260713-1954` and contains **zero file changes** — only the bot's empty
"Initial commit for the issue #88".

The actual implementation **already exists, committed, in the local clone** at
`/Users/alex/Projects/osbrjp/handbook`:

- branch: `worktree-infra-planning-policy` (worktree
  `.claude/worktrees/infra-planning-policy`)
- commit: `d73577c` — "Add infrastructure planning policy, database guidelines,
  and Terraform style guide" (4 files, +434/−1):
  - `doc/infra-planning-policy.md` (new, 150 lines)
  - `doc/database-guidelines.md` (new, 153 lines)
  - `doc/style-guide-terraform.md` (new, 122 lines)
  - `doc/.vitepress/config.mts` (sidebar entries)
- its parent `b454758` is already on remote `main` (merged via PR #86), so the
  commit applies cleanly on top of `origin/main` and on `i88-20260713-1954`.

**Do not re-implement anything.** This ticket is only about landing the existing
commit on the PR branch and finishing the PR housekeeping.

## Scope

In scope:
- Push commit `d73577c` to the remote PR branch `i88-20260713-1954`
  (cherry-pick or merge from `worktree-infra-planning-policy`; the placeholder
  commit is empty so either is conflict-free).
- Fill in the PR body sections (2. Specification / Test Plan, 4. self-review
  checkboxes, 5. Evidence — screenshots of the three rendered pages and the
  sidebar) per the repository PR template.
- Clean up: delete the now-redundant local branch/worktree
  `worktree-infra-planning-policy` after the push, per worktree hygiene.

Out of scope:
- Any content changes to the three documents (review feedback is a later,
  separate concern).
- Merging the PR.

## Key Files

- local worktree `.claude/worktrees/infra-planning-policy/doc/` — the committed
  implementation (source of truth).
- `doc/.vitepress/config.mts` — sidebar wiring included in `d73577c`.
- remote branch `i88-20260713-1954` — the PR #89 head to push onto.

## Implementation Steps

1. In the clone, fetch and confirm `origin/i88-20260713-1954` still only has the
   placeholder commit (`000d3ea`).
2. Merge or cherry-pick `d73577c` onto `i88-20260713-1954` and push (push
   requires operator approval per house rules).
3. `pnpm docs:build` on the branch — must pass with no dead links.
4. Update the PR #89 body: fill §2, tick §4 after self-review, attach §5
   evidence (rendered page screenshots).
5. Remove the stale local worktree + branch.

## Considerations

- The PR base is `main` at `12dd0ef`; `d73577c`'s parent `b454758` is an
  ancestor of it — no rebase needed, but verify with a fresh fetch before
  pushing.
- Issue #88 says "a draft PR will follow"; #89 (bot-opened) fills that role —
  do not open a second PR.
- `git push` and PR mutation are operator-approval actions; the driving session
  must stop and ask before pushing.

## Quality Gate

All must hold before approval:

1. **PR #89 diff shows exactly the 4 files** of `d73577c` (three new doc pages +
   `config.mts` sidebar), nothing else.
2. **`pnpm docs:build` passes** on the PR branch with no dead-link or build
   error.
3. **Sidebar renders**: Infrastructure Planning Policy under Policies;
   Database Guidelines under Guideline; Terraform under Style Guide — verified
   in `pnpm docs:dev` and captured as PR evidence.
4. **PR template complete**: §2 filled, §4 boxes ticked after self-review, §5
   evidence attached.
