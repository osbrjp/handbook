# CI/CD Pipeline

This is the standard for how a change travels from a developer's machine to
production at OSBR. It expands the CI/CD stance the [Infrastructure Planning
Policy](/infra-planning-policy) states — deploy from the reviewed main line, at
dev/prod parity, measured with DORA — into a working pipeline: three gates, what
each one owns, and where the authoritative pass/fail is decided. It is the
delivery half of the story the [Testing Standards](/testing-standards) tell about
*where tests run* (§3-12); read the two together. Deviations are allowed, but —
as everywhere in the handbook — they must be deliberate and justified in the
project's design notes.

The pipeline is where OSBR's values stop being aspirations and become machine
enforcement. **Be Nice**: the same script an engineer runs locally is the script
CI runs, so the pipeline is legible — nobody has to reverse-engineer a bespoke CI
config to know what "green" means. **Be Kind**: the release gate is enforced by
the machine, not by any one operator's diligence, so no teammate carries the
release on their personal care and no colleague inherits a break because someone
was tired on a Friday. **Be Strong**: the gate runs against a real
production-simulation, on a fixed architecture, so it finds the environment- and
architecture-dependent failure before a user does — not the tautology of a check
that only passes because it never touched anything real.

## How to read this policy

* **Requirement levels** follow RFC 2119, as in the [Coding Style
  Guide](/style-guide). **MUST** / **MUST NOT** are absolute. **SHOULD** /
  **SHOULD NOT** state a strong default overridable only with a documented
  reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice or tool, it is
  named inline and cited under [References](#references). We adopt the *criteria*
  of large-scale practice and right-size them for an SME — we do not adopt the
  headcount or infrastructure behind their reference setups.

[[TOC]]

## 1. Goal

The goal of the pipeline at OSBR is **the same change, the same result — fast
where feedback can be fast, and authoritative where correctness must be
decided.** Concretely, an engineer who picks up a task produces the **same
result** regardless of host OS (PC / Mac) or CPU architecture (x86 / ARM), and no
change reaches production until it has passed authoritatively in a
**production-simulation environment**. Three properties define success:

- **Deterministic.** The release gate gives one answer across PC / Mac / x86 /
  ARM, never two "official" results that disagree because one ran on Apple
  Silicon and one on an x86 runner.
- **Machine-enforced.** The gate is enforced by the pipeline, not by an
  operator remembering to run it. A change that has not passed cannot merge or
  deploy — this is not a convention, it is a mechanism.
- **Production-like where it counts.** The authoritative gate runs against a
  simulation of production — same container images, real or emulated managed
  services, prod-like config — that a deliberately light local loop does not
  reproduce.

A gate that does not move one of these properties is waste. We optimise for a
trustworthy release, not for a fast pipeline that lets the wrong thing through.

## 2. Responsibility

The pipeline runs in **three gates, each a prerequisite of the next.** Every
engineer owns getting their change through all three; the gates are shared
infrastructure and their health is a team-level signal, never an individual
rating — the same way the DORA metrics are read in the [Infrastructure Planning
Policy](/infra-planning-policy).

- The **author of a change** owns getting it green through Local and CI before it
  merges. "Done" includes a green CI run, not just a green laptop.
- The **reviewer** treats the pipeline result as part of the reviewable surface
  ([Code Review](/code-review)): a passing CI run is a precondition for review,
  not a substitute for it.
- The **team** owns the health of the shared gates: a perpetually-red or flaky CI
  on main is a team-level defect that blocks everyone, and fixing it is a duty
  owed to the team.
- **AI agents** are first-class contributors here and are held to exactly the
  same bar; the human who merges an agent's change owns its passage through the
  gates.

### 2-1. Local — fast, environment-agnostic feedback (not a production simulation)

On the engineer's own machine, run the **environment-agnostic checks only**:
domain logic, type-checking, unit tests, lint. These fail the same way on any
host, so they belong where feedback is fastest. Local **MUST NOT** be relied on
to stand up production-like infrastructure — it stays light so the inner loop
stays in seconds. Local green means *"my logic and types are correct,"* and
nothing more. It is the same environment-agnostic inner loop the [Testing
Standards](/testing-standards) require of small tests (§3-3, §3-12).

### 2-2. CI — the production-simulation environment (the authoritative gate)

CI **is** the production simulation, and it is the single authoritative result.
It MUST run centrally on one **canonical architecture**, from the **same
container images** as production, with:

- managed services **emulated** (e.g. LocalStack) or provisioned as **ephemeral
  sandboxes**;
- **production-like configuration and secrets**, injected via OIDC at runtime,
  never committed to the repo;
- **seeded data** for the run.

Integration and end-to-end tests run **here**, not locally — this is where
environment- and architecture-dependent failures surface: native binaries (x86
vs ARM), integration with real dependencies, config and secret wiring,
networking, managed-service behaviour, timing and concurrency. A change **MUST
NOT** merge until CI is green, and CI's fixed architecture means x86-vs-ARM
differences never produce two "official" answers.

### 2-3. CD — deploy, only after CI is green

On merge to `main` / release, CD deploys. It **MUST** run only after the CI
production-simulation gate is green — never before. CD runs the reproducible
deploy script (`scripts/deploy.sh`), uses **progressive delivery** (canary /
blue-green), and **verifies production responses online after the release** — a
failed post-release verification is a failed release. Credentials are passed only
at runtime.

## 3. Practices

### 3-1. Determinism across host and architecture

The whole point of the pipeline is that the machine, not the machine's owner,
decides correctness. That requires the run to be reproducible byte-for-byte.

- **Containerize everything.** Local checks, CI, and the build MUST run the same
  command in the same container image. The container is the parity mechanism: Mac
  or PC, inside the container it is the same Linux userland.
- **Pin versions.** Base images MUST be pinned to a digest or specific tag (never
  `latest`); toolchain versions (Node / Go / Python) pinned; lockfiles committed
  so dependencies resolve to exact versions.
- **Fix the canonical build/test architecture.** The authoritative CI MUST run on
  one chosen architecture (e.g. `linux/amd64`), so native-binary dependencies
  (image processing, bundlers, database engines, `node-gyp`-built modules)
  produce one official result. Engineers on Apple Silicon (ARM64) get parity
  through the same container image — via emulation locally when needed — but the
  official answer comes from the fixed-arch CI.
- **Deterministic builds.** Build outputs MUST NOT bake in wall-clock timestamps,
  randomness, or machine-specific paths.

### 3-2. One set of scripts across all three gates

Consolidate the pipeline into runnable scripts (e.g. `scripts/ci.sh`,
`scripts/deploy.sh`) that Local, CI, and CD all **invoke** — never reimplement
inline. What an engineer runs locally MUST be the same command CI runs. This is
the **Be Nice** rule for the pipeline: the checks are legible because they live
in the repo as plain scripts, not scattered across a CI platform's bespoke
configuration.

- Keeping one script set is what stops the three gates from drifting apart.
- It keeps the pipeline portable: CI only invokes the scripts, so there is no
  CI-platform-specific logic to lock the project in.

### 3-3. Two classes of error, two loops

Where a check runs follows from what class of error it catches:

| Error class | Examples | Caught at |
| ----------- | -------- | --------- |
| Environment/arch-agnostic | domain logic, types, unit, lint | **Local** (fast) |
| Environment/arch-dependent | integration, native binaries (x86/ARM), config/secret wiring, networking, managed-service behaviour, timing/concurrency | **CI production-simulation** (authoritative) |

Local green is **never** taken as proof that production will work — that is the CI
production-simulation gate's job. Pushing an environment-dependent check down into
the local loop only makes the loop slow and the result unreliable; pushing an
agnostic check up into CI only makes feedback slower. Each check belongs in the
loop that matches its error class.

### 3-4. Secrets and config are injected, never committed

- Secrets **MUST NOT** live in the repository. CI and CD obtain
  production-like credentials at runtime via **OIDC** (short-lived, federated
  identity), so there is no long-lived secret to leak.
- Configuration is supplied to the container as environment / config at run
  time, so the **same image** is promoted unchanged from CI through to
  production — the parity the [Infrastructure Planning
  Policy](/infra-planning-policy) requires, achieved by IaC and containers rather
  than a hand-maintained shared box.

### 3-5. Managed services are emulated or ephemeral in CI

Integration against real dependencies is where belief meets reality, so CI must
provide something real enough to break against — without depending on a shared,
long-lived environment.

- Managed and external services **SHOULD** be **emulated** (e.g. LocalStack for
  cloud APIs) or stood up as **ephemeral sandboxes** for the duration of the run,
  then torn down. This mirrors the throwaway-real-dependency discipline the
  [Testing Standards](/testing-standards) require of integration tests (§3-7).
- CI **MUST NOT** depend on a shared, hand-maintained environment: parity comes
  from IaC and containers, not from a fragile staging box everyone shares.

### 3-6. Deploy is progressive and verified online

A green CI gate says the change is correct in simulation; it does not by itself
prove the change is healthy in production. CD closes that last gap.

- CD **SHOULD** use **progressive delivery** — canary or blue-green — so a bad
  release is exposed to a fraction of traffic before it reaches everyone, and can
  be rolled back without a redeploy.
- CD **MUST** verify production responses **online after the release**. A failed
  verification is a failed release and MUST trigger rollback — deploying is not
  "done" until production is observed healthy.

### 3-7. The gate is machine-enforced, not operator-trusted

- A change **MUST NOT** be merged or deployed on the strength of a local run or a
  reviewer's recollection that "CI usually passes." The authoritative CI run is
  the gate, and the branch-protection / pipeline configuration MUST enforce it —
  **Be Kind** means no colleague's release rests on another's personal
  vigilance.
- Bypassing the gate (force-merge, skipped CI, deploying a build CI did not
  produce) is prohibited except as a deliberate, recorded emergency action with
  a follow-up to restore the invariant.

### 3-8. Acceptance criterion

> An engineer, on any OS / architecture, runs the same container and the same
> script and gets a byte-identical build and the same agnostic-test result
> locally; the authoritative pass/fail for environment- and
> architecture-dependent behaviour is decided by the CI production-simulation
> environment on the fixed canonical architecture; and CD deploys only after that
> gate is green, verifying production online before the release is called done.

## References

**Delivery practice & metrics**

- DORA — *Accelerate* / State of DevOps research on the four key delivery metrics — <https://dora.dev/>
- Jez Humble & David Farley, *Continuous Delivery* — <https://continuousdelivery.com/>
- Martin Fowler, "Continuous Integration" — <https://martinfowler.com/articles/continuousIntegration.html>

**Techniques & tooling**

- LocalStack — local emulation of cloud services for CI — <https://www.localstack.cloud/>
- Martin Fowler, "Blue Green Deployment" — <https://martinfowler.com/bliki/BlueGreenDeployment.html>
- Martin Fowler, "Canary Release" — <https://martinfowler.com/bliki/CanaryRelease.html>
- OpenID Connect — federated, short-lived identity for secretless CI/CD — <https://openid.net/developers/how-connect-works/>

**Related OSBR standards**

- [Infrastructure Planning Policy](/infra-planning-policy) — CI/CD stance, dev/prod parity, DORA metrics.
- [Testing Standards](/testing-standards) — where tests run: local-agnostic vs CI production-simulating (§3-12).
- [Quality Gate](/quality-gate) — the always-on review and reliability lens the pipeline serves.
- [Code Review](/code-review) — a passing pipeline is a precondition for review, not a substitute.
- [Development Guide](/development-guide) — the pull-request flow the gates sit within.
