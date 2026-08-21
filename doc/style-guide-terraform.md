# Terraform Style Guide

Per-tool style guide for Terraform / OpenTofu (HCL) — OSBR's Infrastructure as
Code tooling (IaC is the category; Terraform is the tool). Shared rules: the
[Coding Style Guide](/style-guide). The policy that *mandates* IaC and sets tool
choice, state, and resource-ownership rules is the
[Infrastructure Planning Policy](/infra-planning-policy) — this page is the
coding-level how-to. Requirement levels follow RFC 2119; tags 🌎 / 🏠 are defined
in the [Coding Style Guide](/style-guide).

[[TOC]]

## 1. Formatting 🌎

* Code MUST be formatted with `terraform fmt` (or `tofu fmt`). A `fmt` diff MUST
  block review.
* Configuration MUST pass `terraform validate` before merge.
* Indent two spaces per nesting level; align the `=` for consecutive single-line
  arguments at the same nesting level, per the
  [HashiCorp Style Guide](https://developer.hashicorp.com/terraform/language/style).

## 2. Naming 🌎

* Resources, variables, outputs, and locals MUST use `snake_case` with a
  descriptive noun.
* A resource identifier MUST NOT repeat its resource type — the resource address
  already includes it.

❌ The type is duplicated in the name:

```hcl
resource "aws_instance" "web_api_aws_instance" {}
# referenced as aws_instance.web_api_aws_instance — redundant
```

✅ The name is just the descriptive noun:

```hcl
resource "aws_instance" "web_api" {}
# referenced as aws_instance.web_api
```

## 3. File Structure 🌎

* A module SHOULD use the conventional file split: `main.tf` (resources and data
  sources), `variables.tf`, `outputs.tf`, `providers.tf`, `terraform.tf` (version
  requirements), `backend.tf`, and `locals.tf` as needed.
* `variables.tf` and `outputs.tf` SHOULD be ordered alphabetically.
* Every variable MUST declare a `type` and a `description`; secret-bearing
  variables MUST be marked `sensitive = true`.
* Multi-environment setups SHOULD use per-environment directories rather than
  deeply nested modules.

## 4. Version Pinning 🌎

* `terraform` / `tofu` `required_version` MUST be set.
* Every provider MUST be pinned in a `required_providers` block, and modules MUST
  be pinned to a specific version — use the pessimistic `~>` constraint for
  predictable upgrades.

```hcl
terraform {
  required_version = ">= 1.6"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}
```

## 5. Remote State 🏠

* State MUST be stored in a remote backend with locking (e.g. an R2/S3 backend).
  Local state MUST NOT be committed, and MUST NOT be the source of truth for any
  shared environment.
* State can contain secrets in plaintext; the state backend MUST therefore be
  access-controlled and MUST NOT be a public bucket.

*Rationale: diverges from Terraform's default of local `terraform.tfstate`. A
laptop-local state file cannot be shared, locked, or recovered, and leaks
secrets if committed — unacceptable for team infrastructure.*

## 6. Secrets & Credentials 🏠

* Credentials MUST NOT be hardcoded in `.tf` files. Pass them via variables fed
  from environment variables or a secret manager.
* `*.tfvars` files containing secrets MUST NOT be committed.
* Provider credentials MUST use scoped API tokens, not global/legacy keys, per
  the [Security Policy](/security-policy).

*Rationale: stricter than the many published examples that inline tokens. A
committed credential is a breach; scoping limits blast radius.*

## 7. Modules 🌎

* Reuse a module only for genuine, repeated structure — do not build a module,
  factory, or wrapper for a single call site.
* Do NOT over-modularize provider resources. Google's
  [Best practices for Terraform](https://docs.cloud.google.com/docs/terraform/best-practices-for-terraform)
  and the Cloudflare provider both caution against wrapping auto-generated
  provider resources in bespoke modules; prefer environment directories with
  shared state.

## 8. One Tool Owns Each Resource 🏠

* A resource MUST be managed by exactly one tool. Terraform and an application
  deploy tool (e.g. Wrangler for Cloudflare Workers) MUST NOT manage the same
  resource.
* Split by ownership: Terraform owns the durable platform (DNS, zones, WAF, Zero
  Trust access, IP restrictions); the app tool owns the application layer. See
  [Infrastructure Planning Policy §1-4](/infra-planning-policy).

*Rationale: two tools on one resource produce state drift and conflicting
applies. This is an OSBR hard rule, not a stylistic preference.*

## References

* HashiCorp — Terraform Style Guide — <https://developer.hashicorp.com/terraform/language/style>
* Google Cloud — Best practices for Terraform — <https://docs.cloud.google.com/docs/terraform/best-practices-for-terraform>
* Infrastructure Planning Policy — [/infra-planning-policy](/infra-planning-policy)
