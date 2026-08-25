---
created_at: 2026-08-25T18:11:24+09:00
author: po.ching.yu.alex@oz-design.jp
assignees: []
depends_on:
mission:
merge_policy: review
verification_handoff: Live CI plan/apply needs the AWS OIDC IAM role ARN and the state bucket, which exist only in the AWS account (PR #99's own apply was already blocked on MFA); an unattended run can only verify workflow syntax and the local checks.
---

# Close PR #99's gaps against issue #98: OIDC CI pipeline for plan/apply, and canonical-host function on every cache behavior

## Overview

PR #99 delivers the Terraform for the CloudFront reverse proxy in front of the
handbook Worker, and its load-bearing caching claim checks out against the AWS
docs (`Managed-UseOriginCacheControlHeaders-QueryStrings` keys on **all
cookies** and **all query strings** and honours origin `Cache-Control`, min TTL
0). Two gaps remain between the PR and issue #98's acceptance criteria:

1. **No CI pipeline.** Issue #98 accepts only when "`plan` / `apply` run from CI
   with OIDC short-lived credentials, not long-lived keys". The PR ships
   `infra/scripts/plan.sh` / `deploy.sh` for local use and the README *asserts*
   "from OIDC in CI", but no workflow exists and no OIDC role is provisioned in
   Terraform.
2. **The `canonical_host` function is attached only to the default cache
   behavior.** CloudFront function associations are per-behavior, and ordered
   behaviors match before the default — so a request to
   `d*.cloudfront.net/_astro/*` or `d*.cloudfront.net/api/*` is never redirected
   to the canonical host. The PR's own unit test exercises
   `/api/auth/callback`, a path that in production routes through the `/api/*`
   behavior where the function never runs: an OAuth callback arriving on the
   distribution domain passes through un-canonicalised, which is exactly the
   split-host cookie problem the function's header comment says it exists to
   prevent.

## Policies

The implementing session MUST read each hard copy before writing code and keep
every change defensible against it. This repository is the handbook, so the
governing pages are its own `doc/` sources:

- `doc/infra-planning-policy.md` §1-9 (OIDC for CI, short-lived scoped
  credentials over long-lived keys) and §1-10 (deploys automated through CI/CD
  from the reviewed main line) — the CI gap is a direct policy gap.
- `doc/style-guide-terraform.md` — fmt/validate as blocking checks, pinning,
  naming, remote state; the new OIDC role resources must conform.
- `doc/ci-cd-pipeline.md` — credentials injected at runtime via OIDC
  (short-lived, federated); the workflow shape follows this page.
- `workaholic:implementation` + `workaholic:operation` pillars (Infrastructure
  layer lens: IaC, CI/CD automation) — general lens for all code work here.

## Key Files

- `infra/main.tf` — `aws_cloudfront_distribution.handbook`: the two
  `ordered_cache_behavior` blocks lack the `function_association` the
  `default_cache_behavior` has; also where the OIDC role/provider resources
  (or a reference to them) land.
- `infra/functions/canonical-host.test.mjs` — the `/api/auth/callback` test
  documents behaviour production does not have until the association is added.
- `infra/scripts/plan.sh`, `infra/scripts/deploy.sh` — the checks the CI
  workflow must run (init, fmt -check, validate, node --test, plan; apply of
  the saved plan).
- `.github/workflows/` (new) — plan on PR, apply on approved main-line run,
  authenticated via `aws-actions/configure-aws-credentials` with
  `role-to-assume` (OIDC), `permissions: id-token: write`. No repository
  secrets holding long-lived keys.

## Implementation Steps

1. Reproduce gap 2 locally: the defect is in Terraform, not JS. Add the
   `function_association` block (viewer-request,
   `aws_cloudfront_function.canonical_host.arn`) to both
   `ordered_cache_behavior` blocks in `infra/main.tf`, matching the default
   behavior.
2. Add the GitHub OIDC trust: `aws_iam_openid_connect_provider` (or a data
   source if the account already has one — check first), an
   `aws_iam_role` scoped to this repository's `sub` claim, and a least-privilege
   policy covering the stack's resources plus the state bucket. Decide
   placement (`infra/` alongside the stack, or a small `infra/ci/` bootstrap
   applied once) and record the choice in `infra/README.md`.
3. Add `.github/workflows/terraform.yml`: on `pull_request` touching `infra/**`
   run init + fmt-check + validate + node --test + `terraform plan`; on
   `workflow_dispatch` (or push to main, per review) run the apply of a saved
   plan. `permissions: id-token: write, contents: read`; credentials only via
   `configure-aws-credentials` with `role-to-assume`.
4. Update `infra/README.md`: CI is now the documented path; local scripts stay
   as the fallback.
5. `terraform fmt -check -recursive`, `terraform validate`, `node --test
   infra/functions/*.test.mjs` all green.

## Quality Gate

**Acceptance criteria** — the checkable conditions that must hold:

- Every cache behavior in `aws_cloudfront_distribution.handbook` (default plus
  both ordered) carries the viewer-request `function_association` to
  `aws_cloudfront_function.canonical_host`.
- A workflow under `.github/workflows/` runs plan for `infra/**` changes using
  OIDC (`permissions: id-token: write`, `role-to-assume`); no step reads a
  long-lived AWS key from repository secrets.
- The OIDC provider/role/policy are Terraform resources (no click-ops), pinned
  and formatted per the Terraform Style Guide.

**Verification method** — the commands/tests/probes that prove them:

- `grep -c function_association infra/main.tf` returns 3.
- `terraform fmt -check -recursive` and `terraform validate` exit 0 in
  `infra/` (Decided: validate-only in the unattended run, live plan deferred to
  the handoff — the account credentials are not in the environment; developer
  may override at /drive).
- `node --test infra/functions/*.test.mjs` — 5/5 pass, unchanged.
- `actionlint` (or `gh workflow view` after push) accepts the workflow file;
  the workflow's YAML contains `id-token: write` and no
  `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` reference.

**Gate** — what must pass before approval:

- All verification commands green in-session; the live CI plan run and first
  apply are the named handoff (AWS role ARN + state bucket) and block the merge
  until a human runs them.

## Patches

### infra/main.tf

> **Note**: apply the same block to both `ordered_cache_behavior` entries
> (`/_astro/*` and `/api/*`), after their `response_headers_policy_id` line:

```
     cache_policy_id            = data.aws_cloudfront_cache_policy.caching_disabled.id
     origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
     response_headers_policy_id = aws_cloudfront_response_headers_policy.hsts.id
+
+    function_association {
+      event_type   = "viewer-request"
+      function_arn = aws_cloudfront_function.canonical_host.arn
+    }
   }
```

## Considerations

- CloudFront Functions bill per invocation; attaching the function to
  `/_astro/*` adds invocations on the hottest, cheapest path. The alternative —
  accepting non-canonical asset URLs — costs nothing and leaks nothing
  (content-hashed public files), so a reviewer may deliberately scope the
  association to `/api/*` + default only; record whichever is chosen in
  `infra/README.md` (`infra/main.tf`).
- If the AWS account already has a GitHub OIDC provider (one per account),
  `aws_iam_openid_connect_provider` must be a data source, not a resource, or
  the apply fails on the duplicate (`infra/main.tf`).
- The apply job should reuse the saved-plan discipline `deploy.sh` documents —
  applying a plan the PR reviewer read, not a fresh one
  (`infra/scripts/deploy.sh`).
- Worker-side `X-Origin-Verify` enforcement and WAF stay out of scope: the
  first lives in the Worker's repository, the second is an explicitly deferred
  follow-up in issue #98's open decisions (PR #99 `infra/README.md`, "Still
  open").
