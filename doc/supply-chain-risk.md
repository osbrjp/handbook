# Supply Chain & Risk

This is the standard the [Quality Gate](/quality-gate)'s **Security** lens holds
work to for two questions that turn out to be the same question: *what third-party
code do we ship, and how do we decide how much risk in it we are willing to live
with?* It sits beside the [Security Policy](/security-policy) and
[Application Security](/application-security) standard — those cover the controls
we build and the code we write; this covers the code we **import**, and the
register that governs the risks we knowingly accept. Most breaches don't start in
the code we wrote; they arrive through the code we depended on, or through a risk
nobody wrote down. Deviations are allowed, but — as everywhere in the handbook —
they must be deliberate and justified in the project's design notes.

Owning our supply chain is where OSBR's values become operational. **Be Nice**:
the safest dependency is the one we never added, so we don't drag in a tree to
save a few lines a teammate then has to reason about. **Be Kind**: a known-vulnerable
package or an unwritten risk is a hazard we would be handing to our clients and to
whoever maintains this next, so we keep the surface known, pinned, and scanned.
**Be Strong**: when a dependency has a flaw and no patch yet, we say so plainly,
put a name against the residual risk, and decide in the open rather than shipping
past it in silence.

## How to read this policy

* **Requirement levels** follow RFC 2119. **MUST** / **MUST NOT** are absolute.
  **SHOULD** / **SHOULD NOT** state a strong default overridable only with a
  documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice or framework, it is
  named inline and cited under [References](#references). We adopt the *criteria* of
  large-scale frameworks (OWASP, NIST, SLSA, ISO) and right-size them for an SME —
  we do not adopt the headcount or committee structure behind their reference
  programmes.

[[TOC]]

## 1. Goal

Ship software whose every third-party component is **known, pinned, scanned,
current, and attestable**, and carry every risk we accept **named, assessed, and
signed for**. Concretely, when a CVE lands or a package is compromised, we can
answer three questions in minutes, not days:

1. **Do we use it?** — we have an SBOM.
2. **Where, and at exactly which version?** — we have committed lockfiles.
3. **Is what we built actually what we shipped?** — we have provenance.

And when a flaw has no fix yet, we can answer a fourth: **who decided to live with
it, and until when?** — we have a risk register (§4). An unknown or unpatched
dependency is treated as a live risk to the client, not a backlog item.

## 2. Responsibility

- **Every developer** keeps lockfiles committed, does not add a dependency to dodge
  a few lines of code, does not merge past a failing security gate without a
  recorded exception, and raises a new or changed risk the moment they see one (a
  new dependency, a new data flow, a near-miss).
- **The reviewer** treats an automated dependency-update PR like any other change —
  reviewed before merge, never rubber-stamped — and treats the supply-chain surface
  as part of the reviewable code, an extension of the always-on review the
  [Quality Gate](/quality-gate) requires.
- **The project lead** owns the remediation clock (§3-7), the exception log, the
  project's single risk register (§4), and its review cadence. Residual-risk
  acceptances are theirs to ensure are signed.
- **The risk owner** (named per register entry) is accountable for one risk: that
  its countermeasures hold, its residual risk stays acceptable, and its
  re-evaluation date is honoured.
- **The client** is informed of accepted residual risk that materially affects their
  data or service and — where the risk is theirs to carry — co-signs the acceptance.

Risk is not a separate team's job; it is a shared reflex. These duties build on the
frameworks OSBR already aligns to: the **OWASP Top 10**, specifically
[A06:2021 Vulnerable & Outdated Components](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/);
the [NIST SSDF (SP 800-218)](https://csrc.nist.gov/pubs/sp/800/218/final) practices
PW.4 (reuse well-secured components) and PS.3 (protect each release with
provenance); and the ISMS risk-management cycle of
[ISO/IEC 27001:2022](https://www.iso.org/standard/27001) (clauses 6.1.2, 6.1.3,
8.2–8.3).

## 3. Supply-chain security

### 3-1. Lockfiles and exact versions

- Projects **MUST** commit a lockfile that resolves every direct and transitive
  dependency to an **exact version** (`package-lock.json` / `pnpm-lock.yaml`,
  `go.sum`, `poetry.lock` / `uv.lock`, `Cargo.lock`, etc.).
- CI **MUST** install from that lockfile with a frozen/CI-only install (`npm ci`,
  `pnpm install --frozen-lockfile`, `poetry install --no-update`) so a build can
  never silently float to a newer version.
- Version ranges (`^`, `~`, `latest`) in a manifest are fine as *intent*; the
  lockfile is the *truth*. A PR that changes resolved versions **MUST** show the
  lockfile diff. A lockfile you don't install from is theatre — the frozen install
  is the part that actually protects you.

### 3-2. Software Composition Analysis (SCA) in CI

Every pipeline **MUST** scan dependencies for known vulnerabilities on each pull
request and **MUST** fail the build on findings above the project's agreed
threshold (default: High and Critical). See the [CI/CD Pipeline](/ci-cd-pipeline)
standard for where this gate sits in the flow.

- **First pass:** the ecosystem's native auditor — `npm audit` / `pnpm audit`,
  `pip-audit`, `govulncheck`, `cargo audit` — fast and fluent in its own
  ecosystem's quirks.
- **Backstop:** a cross-ecosystem scanner on an open advisory feed —
  [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/) or an
  [OSV](https://osv.dev/)-based scanner
  ([`osv-scanner`](https://google.github.io/osv-scanner/)). [OSV](https://osv.dev/)
  and the [GitHub Advisory Database](https://github.com/advisories) are the
  canonical, machine-readable sources of truth; prefer them over ad-hoc blog
  reports.
- Scanners **MUST** run on the **committed lockfile** (§3-1) so results are
  reproducible and match what actually ships.

The two layers earn their keep together: native auditors are fast and
ecosystem-aware; a cross-ecosystem OSV/Dependency-Check pass catches what a single
package manager misses and gives one consistent report across a polyglot repo.

### 3-3. Secrets scanning

A leaked credential is a supply-chain failure in the other direction — our secret,
out the door. Scanning **MUST** happen at two points:

- **Pre-commit** — a local hook ([gitleaks](https://github.com/gitleaks/gitleaks)
  or [TruffleHog](https://github.com/trufflesecurity/trufflehog)) so a secret is
  caught *before* it reaches history.
- **Pipeline** — the same scan in CI as a backstop for anyone who bypassed the
  hook, plus repository push protection / secret scanning.

If a credential is committed it **MUST** be revoked immediately (per the
[Security Policy](/security-policy)), not merely deleted from the branch — history
and forks retain it.

### 3-4. Version pinning for images and tools

- Container base images **MUST** be pinned by **digest** (`image@sha256:…`), not by
  a moving tag like `:latest` or even `:3.19`. Tags are reassignable; a digest is
  the exact bytes.
- CI actions and tools that run with repository credentials (e.g. third-party CI
  actions) **SHOULD** be pinned to a full commit SHA, not a branch or floating tag.
- Pins are updated deliberately through the same automated-PR flow as any other
  dependency (§3-5).

### 3-5. Dependency updates — automated, but merged by a human

Stale dependencies are how A06 happens. Updates are automated; merging stays human.

- Every repo **MUST** enable an automated update bot
  ([Dependabot](https://docs.github.com/en/code-security/dependabot) or
  [Renovate](https://docs.renovatebot.com/)) configured to open PRs for dependency
  and base-image bumps, grouped where sensible to cut noise.
- Update PRs **MUST** pass the full CI gate (tests + SCA + secrets) and **MUST** be
  reviewed by a person before merge. **Auto-merge without review is prohibited** — a
  compromised update is exactly the case where a robot rubber-stamping itself hurts
  most.
- Security bumps follow the remediation clock in §3-7; routine version bumps are
  handled on a regular cadence (default: reviewed weekly).

### 3-6. SBOM, provenance, and integrity

Every release **MUST** be able to say what's in it and prove it built it.

- **SBOM** — generate a Software Bill of Materials per release in a standard format
  ([CycloneDX](https://cyclonedx.org/) or [SPDX](https://spdx.dev/)) and store it as
  a release artifact, so §1's "do we use it?" is a lookup, not an investigation.
- **Provenance** — target [SLSA](https://slsa.dev/) build levels: produce signed
  build provenance so the link from source commit → build → published artifact is
  verifiable and tamper-evident.
- **Integrity** — sign release artifacts and container images with
  [Sigstore / cosign](https://docs.sigstore.dev/) and verify signatures at deploy
  time. An unsigned or signature-mismatched artifact **MUST NOT** be deployed.

SBOM answers *what*, provenance answers *how it was built*, signing answers *is this
the real one*. Each is cheap to add in CI once and pays off the first time an
advisory names a package we might use.

### 3-7. Remediation time-frames by severity

When a known vulnerability affects a dependency we ship, the clock starts at
disclosure (advisory published, or bot PR opened). Severity uses the advisory's
CVSS rating.

| Severity | Remediate within |
|----------|------------------|
| Critical | 3 business days (patch, or documented mitigation + isolation) |
| High     | 7 business days |
| Medium   | 30 days |
| Low      | Next regular update cycle |

- If a fix is unavailable, the project lead **MUST** record a mitigation (config
  change, WAF rule, feature disable, network isolation) and a re-check date — an
  unfixable vuln is *managed*, never ignored.
- A gate exception (merging past a failing SCA finding, or holding a release with a
  known unpatched flaw) **MUST** be logged with reason, owner, and expiry, and
  **MUST** be carried as a named entry in the risk register (§4). No silent
  bypasses: choosing to live with an unpatched dependency is a risk-acceptance
  decision, and §4 is where such decisions are made and signed.

### 3-8. Minimize the dependency surface

The safest dependency is the one you didn't add — a security posture and OSBR's
**vendor-neutrality** stance at once, since fewer external lock-ins mean more of the
system we can actually reason about.

- Before adding a dependency, climb down: does the standard library or an
  already-installed package do it? A few lines we own beat a transitive tree we
  don't.
- Prefer well-maintained, widely-used packages with a healthy release history over
  a thin wrapper that saves a handful of lines but drags in a deep tree.
- Periodically prune: dependencies no longer used **SHOULD** be removed. Every
  package on the manifest is attack surface, an update burden, and one more line in
  the SBOM. A system built on a small, well-understood base is one we can move,
  audit, and hand to a client without a proprietary anchor.

## 4. The risk register that governs accepted risk

Sections 3-1 to 3-8 keep the surface small and current, but no control reduces risk
to zero, and some risks — a flaw with no patch, a control we chose not to build —
we knowingly carry. Those decisions live in **one risk register per project**: the
single place OSBR decides *how much security is enough* for a given project, by
assessed risk, recorded and kept current. This is the OSBR-scale application of the
ISMS risk cycle in [ISO/IEC 27001:2022](https://www.iso.org/standard/27001), with
the how-to drawn from [ISO/IEC 27005:2022](https://www.iso.org/standard/80585.html)
and [NIST SP 800-30 Rev. 1](https://csrc.nist.gov/pubs/sp/800/30/r1/final).

### 4-1. Start from an information-asset inventory

You cannot assess risk to assets you have not listed. Before assessing risk, a
project **MUST** hold a current inventory of the information assets it touches — the
protected assets enumerated in the [Security Policy](/security-policy) (source code
and accounts; user data and uploads; access logs and metrics; communication
history), made concrete for *this* project.

- For each asset, record what it is, where it lives (which service, which region —
  mind data residency), who can reach it, and its sensitivity.
- The inventory seeds the register: risks are assessed **against named assets**, not
  in the abstract. This is the asset-based identification path of
  [ISO/IEC 27005:2022](https://www.iso.org/standard/80585.html); the event-based
  path (start from a threat scenario, trace it to assets) is equally valid and the
  two are complementary — use whichever surfaces the risk.

### 4-2. Keep one register, and keep it current

There **MUST** be exactly **one** risk register per project, and it **MUST** be the
single source of truth for security-risk decisions. A register that is out of date
is worse than none, because it manufactures false confidence. It **SHOULD** live
where the project already works (a repository file or the tracker),
version-controlled so its history is auditable. Each entry **MUST** carry all of:

| Field | What it captures |
| --- | --- |
| **Description** | The risk as a scenario: threat source → what it does → which asset → the harm. Vague entries ("security", "AWS") are not risks. |
| **Likelihood** | How probable, on a scale the project has defined (§4-3). |
| **Impact** | How bad if it happens, on the same defined scale. |
| **Countermeasures** | The controls in place or planned to reduce likelihood and/or impact. |
| **Residual risk (named and accepted)** | The risk that *remains* after countermeasures — stated explicitly, formally accepted by a named person (§4-4). |
| **Owner** | The single named risk owner (§2). |
| **Re-evaluation date** | When this entry is next reviewed, even if nothing triggers it sooner (§4-6). |

An unpatched dependency held past the §3-7 clock is exactly such an entry: the
description names the CVE and the asset it exposes, the countermeasures record the
mitigation, and the residual risk is signed with an expiry.

### 4-3. Assess by likelihood × impact; make control weight proportional

Score each risk by **likelihood × impact**, following the method of
[NIST SP 800-30 Rev. 1](https://csrc.nist.gov/pubs/sp/800/30/r1/final) (prepare →
conduct → maintain). A qualitative scale (Low / Medium / High on each axis) is the
sensible default for an SME project — fast, good enough to rank, readable by
everyone.

- **Control weight MUST be proportional to assessed risk.** A high-likelihood,
  high-impact risk earns strong, possibly redundant controls; a low-likelihood,
  low-impact risk earns a light touch or explicit acceptance. Spending a High
  control budget on a Low risk is gold-plating — it steals attention from where the
  risk really is.
- **Quantify when the decision turns on the number.** When "is this worth it?"
  hinges on how big the loss really is — a costly control, a client escalation, an
  insurance or spend trade-off — reach for
  [FAIR](https://www.fairinstitute.org/) to express likelihood and impact as
  loss-event frequency and loss magnitude in money rather than a colour. Use
  quantification where it changes the decision; do not impose it on every row.
- Prioritise treatment by risk level, not by whichever risk is loudest or newest.

### 4-4. Name and accept residual risk — with a sign-off

No control reduces risk to zero. What remains is **residual risk**, and OSBR's rule
is that it is never left implicit.

- Every entry **MUST** state its residual risk in plain terms: *after these
  countermeasures, this much could still go wrong.*
- Residual risk **MUST** be **formally accepted by a named person with the authority
  to carry it** (the risk owner, and where it is the client's risk, the client).
  This is the risk-acceptance step of
  [ISO/IEC 27001:2022](https://www.iso.org/standard/27001) clause 8.3.
- Accepting a risk is a legitimate, **Be Strong** decision — not a failure. What is
  not legitimate is carrying a risk nobody has looked at and nobody has agreed to.
  An unsigned residual risk is an open item, not an accepted one.

### 4-5. Treat, then record what you chose

For each risk, choose a treatment and record it: **reduce** (add countermeasures),
**avoid** (don't do the risky thing), **transfer** (a managed service or insurance
carries it), or **accept** (per §4-4). This is the treatment vocabulary of
[ISO/IEC 27005:2022](https://www.iso.org/standard/80585.html). The register records
the choice and its rationale so a future reader — or an auditor — can see *why* the
control weight is what it is.

### 4-6. Re-evaluation triggers

The register is a living document. A project **MUST** re-evaluate the affected
entries — and add new ones — whenever any of the following happens, without waiting
for the scheduled date:

- **A new vendor or dependency** is introduced (SaaS, third-party API, library, or
  sub-processor) — it brings its own attack surface and data flows. This is the
  same event that §3-8 asks you to weigh before adding.
- **Authentication or authorization changes** — a new login path, a new role, a
  change to who can reach what, a new set of credentials.
- **Data scope expands** — the project starts collecting, storing, or moving a new
  class of data (especially personal data), or moves existing data to a new place
  or region.
- **An incident or near-miss occurs** — any incident, or a close call, is direct
  evidence that a likelihood or impact estimate was wrong; feed it straight back
  into the register.

Absent a trigger, every entry is still re-evaluated on its **re-evaluation date**
(§4-2). Risk assessment is a loop, not a one-time gate — the "maintain the
assessment" step of NIST SP 800-30 and the continuous monitoring of the ISO/IEC
27005 cycle.

## References

**Supply-chain standards & frameworks**

- OWASP Top 10 — A06:2021 Vulnerable & Outdated Components — <https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/>
- OWASP Dependency-Check — <https://owasp.org/www-project-dependency-check/>
- NIST Secure Software Development Framework (SSDF, SP 800-218) — <https://csrc.nist.gov/pubs/sp/800/218/final>
- SLSA — Supply-chain Levels for Software Artifacts — <https://slsa.dev/>

**Vulnerability data**

- OSV — Open Source Vulnerabilities — <https://osv.dev/>
- OSV-Scanner — <https://google.github.io/osv-scanner/>
- GitHub Advisory Database — <https://github.com/advisories>

**Auditing & updates**

- npm audit — <https://docs.npmjs.com/cli/commands/npm-audit>
- pnpm audit — <https://pnpm.io/cli/audit>
- Dependabot — <https://docs.github.com/en/code-security/dependabot>
- Renovate — <https://docs.renovatebot.com/>

**Secrets scanning**

- gitleaks — <https://github.com/gitleaks/gitleaks>
- TruffleHog — <https://github.com/trufflesecurity/trufflehog>

**SBOM, provenance & signing**

- CycloneDX — <https://cyclonedx.org/>
- SPDX — <https://spdx.dev/>
- Sigstore / cosign — <https://docs.sigstore.dev/>

**ISMS risk management (the frame)**

- ISO/IEC 27001:2022 — Information security management systems — Requirements (risk assessment and treatment: clauses 6.1.2, 6.1.3, 8.2, 8.3) — <https://www.iso.org/standard/27001>
- ISO/IEC 27005:2022 — Guidance on managing information security risks — <https://www.iso.org/standard/80585.html>

**Risk assessment method, register & quantification**

- NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments — <https://csrc.nist.gov/pubs/sp/800/30/r1/final>
- NIST SP 800-37 Rev. 2 — Risk Management Framework — <https://csrc.nist.gov/pubs/sp/800/37/r2/final>
- FAIR (Factor Analysis of Information Risk) — the FAIR Institute — <https://www.fairinstitute.org/>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the Security lens this standard serves.
- [Security Policy](/security-policy) — the concrete controls, protected assets, and credential-revocation rules.
- [Application Security](/application-security) — the code we write, alongside the code we import here.
- [CI/CD Pipeline](/ci-cd-pipeline) — where the SCA, secrets, and provenance gates run.
- [Development Guide](/development-guide) — pull-request Specification and review flow.
