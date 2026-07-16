# AI Data-Handling

This is the highest-priority page of OSBR's AI operating model, and the one the
[Quality Gate](/quality-gate)'s **Security** lens holds work to whenever a project
uses AI. The [AI Usage Guideline](/ai-usage-guideline) is the operating-model
overview; this page is its load-bearing core. AI-assisted work is OSBR's **default**
way of building — humans and AI agents together, not an exception a project opts
into — and that default is only safe when one thing is settled before the first
commit: **a written, client-agreed, version-controlled record of which data classes
may enter which AI providers, under what configuration.** No developer, human or
AI, should ever have to guess whether a given file, secret, or dataset is allowed
into a given model. The record answers that in advance, for everyone. It builds on
the [Security Policy](/security-policy) and the [Data Protection](/data-protection)
standard, and — as everywhere in the handbook — deviations must be deliberate and
justified in the project's design notes.

This is where OSBR's values become a boundary the machine can see. **Be Kind**:
we protect a client's data — their code, their users' personal data, their secrets
— as if it were our own, so it never leaks into a service that could learn from it
or retain it. **Be Strong**: we do not rely on good intentions or a developer's
memory in the moment; we draw the boundary of what the AI may see *in writing,
agreed with the client, before the first commit*, and hold generation, review, and
audit to that same standard. **Be Nice**: the record is documentation first — one
document a new teammate opens to learn, without asking anyone, exactly what is
permitted where. Cooperation between humans and AI is only trustworthy when that
boundary is drawn deliberately and written down.

## How to read this policy

* **Requirement levels** follow RFC 2119, as across the handbook. **MUST** /
  **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a strong default
  overridable only with a documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry instrument — a Data
  Processing Agreement, a data-classification scheme, a risk framework — the
  instrument is named inline and cited under [References](#references). We adopt
  the *criteria* of large-enterprise practice and right-size them for an SME; we do
  not adopt the headcount or bureaucracy behind their reference setups.

[[TOC]]

## 1. Goal

The goal is that on any OSBR project a developer — human or AI agent — can open
**one document** and see, without asking anyone: what data classes exist, which are
permitted into which providers, under which data-handling configuration
(no-training / minimal-retention / region-pinned), and which are prohibited
outright. Concretely:

- Make the boundary **legible**: the answer to "may this data enter this model?"
  exists in writing before anyone needs it, not as a judgment call made under
  deadline.
- Make it **enforceable, not decorative**: the record is expressed against the same
  policy plugins that generation, review, and audit already run under, so it is
  machinery held to from the first commit — not a paragraph in a proposal nobody
  reads again.
- Make it **accountable to the client**: the record is agreed with them in writing
  and is the standing authorization for every AI provider that touches their data.

This is standard large-enterprise practice at OSBR's scale. A **Data Processing
Agreement (DPA)** governs a processor's use of a controller's data
([GDPR Art. 28](https://gdpr-info.eu/art-28-gdpr/)); a **data-classification
scheme** decides how each class may be handled; and an **AI Acceptable Use Policy**
binds those two to the specific AI services in play. We adopt the same three
instruments and right-size them into a single record.

## 2. Responsibility

**Before a project starts, the AI Data-Handling Record MUST exist, be agreed with
the client in writing, and be consultable by every developer on the project.** It
is a precondition of the first commit — the same gate class as the security
onboarding in the [Security Policy](/security-policy). A project that has not
produced this record is not ready to write code.

The record is OSBR's project-level **AI Acceptable Use Policy**, and it sits inside
(or is referenced by) the client **DPA**. It MUST state, per project:

1. **Data-classification tiers** — every data class the project touches, sorted
   into named tiers (e.g. *Public → Internal → Confidential → Restricted*, the
   conventional 3–4 tier model behind ISO/IEC 27001 information classification).
   Personal data, secrets/credentials, and regulated data are called out
   explicitly.
2. **Permitted providers** — which AI services are approved, named exactly, and for
   which tiers.
3. **Required configuration per provider** — the data-handling posture each
   approved provider MUST run under: **no-training / opt-out**, **zero or minimal
   retention**, **model/tenant isolation**, and **data residency / region**. Each
   posture MUST cite the provider's *current* enterprise data-handling terms as the
   authoritative source, not memory.
4. **Prohibited data classes** — the classes that MUST NOT enter any AI service
   under any configuration (secrets/credentials, and any Restricted-tier or
   regulated data the client has not cleared).

**Accountability follows the GDPR processor model:** the client is the data
controller, OSBR is a processor, and any AI provider is a **sub-processor**. Under
[GDPR Art. 28](https://gdpr-info.eu/art-28-gdpr/) a processor MUST NOT engage a
sub-processor without the controller's authorization and MUST bind it by contract
to equivalent protection. The AI Data-Handling Record is that authorization, made
explicit. Where client data originates under another regime (e.g. Japan's APPI for
cross-border transfer and third-party handling), the record MUST satisfy it too —
see [Data Protection](/data-protection).

Every developer is responsible for **staying inside the record**. If a task seems
to need data or a provider the record does not permit, the answer is never to
proceed and work around it — it is to stop and get the record **amended and
re-agreed** with the client first.

## 3. Practices

### 3-1. The record itself — committed, version-controlled, plugin-expressed

- The AI Data-Handling Record **MUST** be committed to the project repository (or
  linked from it) and version-controlled, so it is consultable by all developers
  and its change history is auditable — the same reasoning as tracking any other
  standard the [Development Guide](/development-guide) treats as part of the repo.
- It **MUST** be agreed with the client in writing before the first commit, and
  **MUST** be re-agreed before any change to permitted providers, configuration, or
  data classes takes effect.
- It **MUST** be expressed against the **policy plugins**, so AI generation,
  automated review, and audit all evaluate against the same standard from commit
  one — not a separate document that quietly drifts from what the tooling enforces.
- It **SHOULD** map each data class to its tier and each tier to its permitted
  providers in a single table a developer can read at a glance.

### 3-2. Data classification — every class tiered before it touches a model

- Every data class the project handles **MUST** be assigned a tier before it is used
  with any AI service. Unclassified data defaults to the **most restrictive** tier
  and MUST NOT enter an AI service until classified.
- Secrets and credentials (API keys, tokens, connection strings, private keys)
  **MUST** be treated as prohibited from AI services, consistent with the
  [Security Policy](/security-policy)'s ban on committing credentials. This is
  absolute: no configuration makes a secret admissible.
- Personal data and any client-designated regulated data **MUST NOT** enter an AI
  service unless the record explicitly permits it under a named no-training,
  zero-retention configuration **and** the client has agreed in writing. The
  handling of such data also answers to [Data Protection](/data-protection).

### 3-3. Provider configuration — no-training, minimal-retention, region-pinned

- Approved providers **MUST** run under enterprise/commercial terms that
  contractually exclude training on client data and offer retention controls. The
  record **MUST** cite the provider's own *current* data-handling documentation as
  the source of truth — verified against the provider, never asserted from memory.
  For example:
  - **Anthropic** — [Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms)
    (inputs/outputs from commercial use are not used to train models) and
    [zero-data-retention](https://privacy.anthropic.com/) options.
  - **OpenAI** — [Enterprise privacy / API data usage](https://openai.com/enterprise-privacy/)
    (API data not used to train by default; retention controls and ZDR available).
  - **Google Cloud Vertex AI** — [data governance](https://cloud.google.com/vertex-ai/generative-ai/docs/data-governance)
    (customer data not used to train foundation models; in-region processing).
  - **AWS Bedrock** — [data protection](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
    (prompts/completions not used to train base models; stays within the account
    and region).
- Where a provider offers it, developers **SHOULD** prefer the isolated-tenant,
  region-pinned, zero-retention configuration for anything above the Internal tier.
- Consumer or free-tier AI products whose terms permit training on user input
  **MUST NOT** be used with any non-Public client data.

### 3-4. Vendor / sub-processor assurance

- An AI provider **SHOULD** be selected in part on independent assurance of its
  controls — an **ISO/IEC 27001** certificate and/or a **SOC 2 Type II** report
  (AICPA Trust Services Criteria) covering the service. Prefer providers that also
  hold **ISO/IEC 27701** (privacy) or **ISO/IEC 42001** (AI management system) where
  available.
- The record **MUST** name each AI provider as a **sub-processor** and keep the list
  current. Adding a sub-processor requires client re-agreement (GDPR Art. 28) — the
  same amend-and-re-agree gate as §2, not a silent addition.

### 3-5. Governance — mapped risk, reviewed cadence

- Project AI use **SHOULD** be governed against the [NIST AI Risk Management
  Framework (AI 100-1)](https://www.nist.gov/itl/ai-risk-management-framework) — its
  *Map / Measure / Manage / Govern* functions — so risks are identified and owned,
  not discovered after a leak.
- The record **SHOULD** be reviewed at the same cadence as the access review in the
  [Security Policy](/security-policy), and **MUST** be revisited whenever a provider
  changes its data-handling terms — the citations in §3-3 are only as good as their
  currency.

## References

**Data protection & processor obligations**

- GDPR Article 28 (processor / sub-processor obligations) — <https://gdpr-info.eu/art-28-gdpr/>

**AI governance & management standards**

- NIST AI Risk Management Framework (AI 100-1) — <https://www.nist.gov/itl/ai-risk-management-framework>
- ISO/IEC 42001 (AI management system) — <https://www.iso.org/standard/81230.html>

**Vendor / sub-processor assurance**

- ISO/IEC 27001 (information security management) — <https://www.iso.org/standard/27001>
- ISO/IEC 27701 (privacy information management) — <https://www.iso.org/standard/71670.html>
- AICPA SOC 2 (Trust Services Criteria) — <https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2>

**Provider enterprise data-handling terms**

- Anthropic Commercial Terms of Service — <https://www.anthropic.com/legal/commercial-terms>
- OpenAI Enterprise privacy — <https://openai.com/enterprise-privacy/>
- Google Cloud Vertex AI data governance — <https://cloud.google.com/vertex-ai/generative-ai/docs/data-governance>
- AWS Bedrock data protection — <https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html>

**Related OSBR standards**

- [AI Usage Guideline](/ai-usage-guideline) — the AI operating-model overview this page anchors.
- [Quality Gate](/quality-gate) — the Security lens this standard serves.
- [Security Policy](/security-policy) — credential handling, onboarding gate, access-review cadence.
- [Data Protection](/data-protection) — personal and regulated data, cross-border handling.
- [Development Guide](/development-guide) — how project standards live in the repo.
