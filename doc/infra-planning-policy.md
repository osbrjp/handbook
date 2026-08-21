# Infrastructure Planning Policy

This policy defines the defaults every OSBR project starts from when planning and provisioning infrastructure. It complements the [Security Policy](/security-policy) and the [Non-functional Requirements](/predefining-non-functional-requirements) guide: those describe *what* a system must guarantee, while this describes *how* we shape infrastructure to get there.

Where possible we lean on the decision frameworks the large cloud vendors publish — the [AWS](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [Azure](https://learn.microsoft.com/en-us/azure/well-architected/), and [Google Cloud](https://cloud.google.com/architecture/framework) Well-Architected / Architecture Frameworks — and **right-size them for an SME.** We adopt their criteria for making a decision without adopting the scale, headcount, or budget assumptions behind their reference architectures. Deviations from this policy are allowed, but they must be deliberate and justified in the project's design notes.

[[TOC]]

## 1. Guiding Principles

### 1-1. Scale to Zero, Scale on Demand

OSBR prefers infrastructure that **scales to zero when idle and auto-scales under load.** We pay for what we actually use, not for idle capacity.

- Favour serverless and on-demand platforms (e.g. Cloudflare Workers, AWS Lambda/Fargate, on-demand databases) over always-on servers.
- Idle environments — staging, preview, low-traffic services — should cost close to nothing.
- Capacity should follow demand automatically; avoid hand-tuned fixed fleet sizes unless a workload genuinely requires them.
- Build apps to be **stateless and disposable** so they can scale horizontally and to zero — the baseline is [The Twelve-Factor App](https://12factor.net/) (config in the environment, stateless processes, fast startup and graceful shutdown, logs as event streams).

::: tip NOTE
"Scale to zero" is a cost and operations default, not a dogma. Some workloads (steady high traffic, latency-sensitive warm paths) are cheaper or more predictable on reserved capacity. Choose deliberately.
:::

### 1-2. Assume a Hostile Internet (Zero Trust)

Assume the internet is dirty and full of enemies. Every exposed surface is under attack. This is the same **Zero Trust** posture the big platforms document (Google's [BeyondCorp](https://cloud.google.com/beyondcorp) and the NIST [Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final)), applied at our scale.

- **Never trust, always verify** — do not grant trust because a request comes from "inside" the network or from an already-authenticated session. Verify every access.
- **Assume breach** — design so that a single compromised component does not hand over everything.
- Private by default; expose only what must be public. Put a WAF, IP restrictions, and rate limits in front of public endpoints.
- Staging and production remain IP-restricted and are reached through company-provided access paths, per the [Security Policy](/security-policy).
- Follow published baselines rather than inventing our own: the [OWASP Top 10](https://owasp.org/www-project-top-ten/) and [ASVS](https://owasp.org/www-project-application-security-verification-standard/) for application security, the [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks) for OS / cloud / Kubernetes hardening, and the [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework) to manage overall risk.

### 1-3. Infrastructure as Code Is Mandatory

Every durable resource must be provisioned as code — **no click-ops, no manual dashboard changes** for anything that must survive.

- **Tool preference:** Terraform / OpenTofu as the unified IaC standard across all vendors (AWS, GCP, Cloudflare, GitHub, and the SaaS we rely on). Vendor-native IaC (CloudFormation, CDK) cannot span multiple vendors, so it cannot be our cross-vendor standard.
- Native vendor IaC is acceptable within a single-vendor project, but the hard rule stands: **something declarative owns every durable resource.**
- Store state remotely with locking (e.g. an R2/S3 backend), never on a laptop.
- Infrastructure changes go through the same review as application code.
- Coding conventions (formatting, naming, structure, state, secrets) live in the [Terraform Style Guide](/style-guide-terraform), which follows the [HashiCorp Style Guide](https://developer.hashicorp.com/terraform/language/style) and Google's [Best practices for Terraform](https://docs.cloud.google.com/docs/terraform/best-practices-for-terraform).

::: info Tool choice is secondary; IaC itself is not
No matter native or Terraform — IaC is a must. The debate over which tool is a project-level decision; provisioning durable infrastructure by hand is not an option.
:::

### 1-4. One Tool Owns Each Resource

A single resource must be managed by exactly one tool. Two tools managing the same resource cause drift and conflicting state.

- Cloudflare Workers and Pages are deployed with **Wrangler**; `wrangler.jsonc` is the single source of truth for each app and its tightly-coupled bindings.
- Terraform and Wrangler must never manage the same resource. Split by ownership: Terraform owns the durable platform (DNS, zones, WAF, Zero Trust access, IP restrictions); Wrangler owns the application layer.

### 1-5. Reliability and Delivery Are Measured, Not Assumed

Hold the running system to explicit, published targets rather than gut feel.

- **Reliability** — define **SLIs and SLOs** and spend an **error budget**, following Google's freely available [SRE practice](https://sre.google/books/). Availability targets are set per the [Non-functional Requirements](/predefining-non-functional-requirements) guide.
- **Delivery** — track the [DORA](https://dora.dev/) four keys (deployment frequency, lead time for changes, change failure rate, failed-deployment recovery time) as the health signal for how we ship. Treat them as team signals, never individual ratings.
- **Resilience patterns** — design for the fallacies of distributed computing with established patterns: timeouts, retries with backoff and jitter, circuit breakers, health checks, and load shedding, as documented in the [Amazon Builders' Library](https://builder.aws.com/learn/topics/builders-library) and the [Azure Cloud Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/) catalog.

### 1-6. Observability Is Built In, Not Bolted On

You cannot operate — or hold an SLO for — what you cannot see. Every service is observable from day one.

- Emit structured **logs, metrics, and traces**; standardise on [OpenTelemetry](https://opentelemetry.io/) so instrumentation stays vendor-portable.
- Alert on **SLO burn and user-facing symptoms**, not on every low-level metric — noisy alerts get ignored.
- Ship logs to a central store as **event streams** (per Twelve-Factor); never leave them only on the instance.

### 1-7. Environments and Promotion

- Keep **dev / staging / production at parity** — same IaC, same runtime, same config shape (Twelve-Factor dev/prod parity) — so behaviour is predictable across them.
- Prefer **ephemeral preview environments** per branch or PR where the platform supports it (e.g. Cloudflare / Vercel previews), torn down on merge.
- Promote the **same build artifact** through environments; never rebuild per environment. Configuration differs only by environment variables.

### 1-8. Backups, Durability, and Disaster Recovery

Data durability is non-negotiable; a service you cannot restore is a service you can lose.

- Define **RPO** (how much data you can afford to lose) and **RTO** (how fast you must recover) per datastore, aligned with the [Non-functional Requirements](/predefining-non-functional-requirements).
- Automate backups and, critically, **test restores** — an untested backup is not a backup.
- Keep backups **separate from the primary** (different account or region) and encrypted.

### 1-9. Secrets and Least-Privilege Access

- Store secrets in a **secret manager** or platform secret store — never in code, images, or committed config.
- Prefer **short-lived, scoped credentials** (OIDC for CI, IAM roles for services) over long-lived keys, per the [Security Policy](/security-policy).
- Grant **least privilege** and review access regularly; each component gets only what it needs.

### 1-10. Deploy Safely and Reversibly

- Deploys are **automated through CI/CD** from the reviewed main line — no manual production changes.
- Use **progressive delivery** where the platform allows (canary / blue-green / gradual rollout) so a bad release reaches few users.
- Every deploy must be **reversible**: a fast rollback path plus forward-compatible data migrations (expand/contract, per the [Database Guidelines](/database-guidelines)).

### 1-11. Cost Is a Design Constraint

- Scale-to-zero (§1-1) is the first cost lever; beyond it, set **budgets and cost alerts** so surprises are caught early.
- **Tag or label resources** for cost allocation so spend is attributable to a project or environment.
- Weigh cost explicitly in design trade-offs, per the cost-optimization pillar of the Well-Architected frameworks.

### 1-12. Prefer Managed Services; Mind Data Residency

- Prefer **managed / serverless services over self-hosting** — we are a small team and operational toil is expensive. Self-host only with a clear, justified reason.
- When choosing a service, weigh **lock-in and exit cost**; favour open standards and portable data formats where practical.
- Be explicit about **data residency and sovereignty** — know which region customer and personal data lives in, and keep it consistent with client and legal requirements.

## 2. Related Guidelines

- [Database Guidelines](/database-guidelines) — choosing a data store (SQL vs NoSQL) and structuring relational schemas.
- [Terraform Style Guide](/style-guide-terraform) — Terraform / OpenTofu coding conventions.

## 3. References

Big-tech decision frameworks and guidance this policy draws on, chosen because they are freely published and adoptable by a small team.

**Decision frameworks**

- AWS Well-Architected Framework — <https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html>
- Azure Well-Architected Framework — <https://learn.microsoft.com/en-us/azure/well-architected/>
- Google Cloud Architecture Framework — <https://cloud.google.com/architecture/framework>

**App architecture & cloud-native**

- The Twelve-Factor App — <https://12factor.net/>
- Azure Cloud Design Patterns — <https://learn.microsoft.com/en-us/azure/architecture/patterns/>

**Reliability & operations**

- Google SRE books (Site Reliability Engineering, The SRE Workbook) — <https://sre.google/books/>
- Amazon Builders' Library — <https://builder.aws.com/learn/topics/builders-library>
- OpenTelemetry (observability framework) — <https://opentelemetry.io/>

**Delivery metrics**

- DORA (DevOps Research & Assessment) — <https://dora.dev/>

**Security & hardening**

- OWASP Top 10 — <https://owasp.org/www-project-top-ten/>
- OWASP Application Security Verification Standard (ASVS) — <https://owasp.org/www-project-application-security-verification-standard/>
- CIS Benchmarks — <https://www.cisecurity.org/cis-benchmarks>
- NIST Cybersecurity Framework 2.0 — <https://www.nist.gov/cyberframework>
- NIST Zero Trust Architecture (SP 800-207) — <https://csrc.nist.gov/pubs/sp/800/207/final>

**Infrastructure as Code**

- HashiCorp Terraform Style Guide — <https://developer.hashicorp.com/terraform/language/style>
- Google Cloud — Best practices for Terraform — <https://docs.cloud.google.com/docs/terraform/best-practices-for-terraform>
