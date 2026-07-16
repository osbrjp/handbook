# Code Review

This is the standard the [Quality Gate](/quality-gate)'s always-on review holds
every change to before it merges. It expands that gate into a working policy:
**what** the review guards, in **what priority**, **who** stays accountable, and
**where** it runs. OSBR's stance is that automated AI review is the default gate
on every change — consistent and thorough rather than dependent on who happens to
be free to look. It runs pre-merge alongside the CI production-simulation gate
described in the [CI/CD Pipeline](/ci-cd-pipeline) standard. Deviations are
allowed, but — as everywhere in the handbook — they must be deliberate and
justified in the project's design notes.

Review is where OSBR's cooperation between humans and AI becomes a gate rather
than a hope. **Be Kind**: an unreviewed change that regresses safety or leaves
bloat behind is a cost the whole team pays later, so guarding every change is a
duty owed to the team, not a courtesy. **Be Nice**: the review leaves behind
concrete, cited findings a teammate can act on, not vague disapproval. **Be
Strong**: the reviewer's job is to catch the correctness or security defect
before a user does, and it holds that line on every change without tiring. The
machine is tireless and consistent; the human interprets, overrides with a
recorded reason, and stays accountable.

## How to read this policy

* **Requirement levels** follow RFC 2119, as in the [Coding Style
  Guide](/style-guide). **MUST** / **MUST NOT** are absolute. **SHOULD** /
  **SHOULD NOT** state a strong default overridable only with a documented
  reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is
  named inline and cited under [References](#references). We adopt the *criteria*
  of large-scale practices and right-size them for an SME — we do not adopt the
  headcount behind their reference setups.

[[TOC]]

## 1. Goal

The goal of code review at OSBR is a **consistent, thorough guard on every
change — for correctness, security, and readability, in that priority order —
that does not depend on who happens to review.** OSBR believes in cooperation
between humans and AI: code is a shared artifact both must be able to work with,
so the standard is code that is **correct, safe, and legible to a human with or
without AI.** Automated AI review is the mechanism that keeps every change to
that standard.

A review that does not move one of those three concerns is noise. We optimise for
findings that change the code, not for the appearance of having looked.

## 2. Responsibility

- **AI-automated review is the default review gate on every change.** It is not
  removed on the argument that policy-grounded generation and each developer's own
  QA suffice, and it is not left to a human reviewer's availability. An AI
  reviewer inspects each change and MUST pass — or surface findings to be
  addressed — before merge.
- **Humans stay in the loop and remain accountable.** The AI review is the
  always-on baseline, not the final word: an engineer interprets its findings, MAY
  override a finding with a stated reason, and owns the merged change. This is the
  same implementer-owns-quality rule the [Quality Gate](/quality-gate) states —
  verification is planned at design, not handed to a separate stage. This is
  cooperation, not delegation.
- **Human review is welcome but not the enforced default.** A human reviewer MAY
  review any change and SHOULD on the changes where judgment matters most (novel
  design, security-sensitive surfaces, wide blast radius). What OSBR does *not* do
  is make a human reviewer the mandatory gate that every change waits on — the AI
  review is that gate.
- **AI agents are first-class authors and are reviewed to exactly the same bar.**
  The human who merges an agent's change owns it; a large, green, agent-authored
  diff is not self-justifying (§3-5).

## 3. Practices

### 3-1. Run the AI reviewer as a pre-merge gate, alongside CI

Run the AI reviewer on each pull request (or pre-merge), **alongside** the CI
production-simulation gate — a change merges only when both are satisfied.

- The two gates are complementary and MUST NOT be collapsed into one: CI proves
  the change *runs* correctly against a production-like environment (see the
  [CI/CD Pipeline](/ci-cd-pipeline) and [Testing Standards](/testing-standards));
  the AI review judges whether the change is *built* correctly, safely, and
  legibly. A green test suite is not a substitute for review, and a clean review
  is not a substitute for tests.
- The review runs from the reviewed main line's workflow, so it is present on
  every change by construction, not by a reviewer remembering to look.

### 3-2. Guard three concerns, in priority order

The reviewer — human or AI — guards three concerns, and the order is a
tie-breaker when effort or attention is finite:

1. **Correctness (first priority)** — the code does what it is meant to, **and no
   more.** This is judged against **KISS** (the simplest thing that works),
   **DRY** (one source of truth; reuse what already exists rather than
   re-implementing it), and **YAGNI** (build only what is needed now — no
   speculative abstraction, no "for later" scaffolding). Over-engineering, bloat,
   and code that does not serve the stated purpose are **findings, not neutral
   background.** An interface with one implementation, a factory for one product,
   config for a value that never changes — each is a correctness finding even when
   the code runs green. Every part must earn its place.
2. **Security (second priority)** — injection, secrets in code, authorization
   gaps, unsafe defaults, and the input/output handling an application-layer
   review should catch. This is the OWASP/ASVS-class lens; the authoritative depth
   lives in the [Application Security](/application-security) standard and the
   [Security Policy](/security-policy), and the reviewer applies it on every
   change rather than deferring it to a separate audit.
3. **Readability (third priority)** — an engineer can read and understand the code
   **with or without AI.** Legibility to an unaided human is the floor: clear
   naming aligned to the project's ubiquitous language, small and obvious
   structure. Being easy for an AI to update follows from that, but a human being
   able to follow it *without* AI is the bar that must hold.

### 3-3. Findings are concrete, cited, and severity-gated

- The reviewer MUST produce **concrete, cited findings** — file and line, with a
  proposed fix — not a prose verdict. A finding a reader cannot locate and act on
  is not a finding.
- A finding **above the agreed severity** blocks merge until it is resolved or
  **explicitly waived with a recorded reason.** The waiver is the human staying in
  the loop (§2): an override is a decision on the record, never a silent skip.
- Findings below the threshold are advisory: surfaced for the author's judgment,
  not gating.

### 3-4. The single-sentence standard

The whole bar is one sentence a reviewer — human or AI — can hold in mind:

> **Correct and minimal (KISS / DRY / YAGNI), safe, and legible to a human with
> or without AI.**

A change that adds bloat, regresses safety, or is only followable with AI
assistance is a finding — **even when it is functionally working.** "It passes" is
necessary, not sufficient. This mirrors the [Testing Standards](/testing-standards)
stance that a green result is evidence to interpret, not a goal to farm.

### 3-5. A large green AI-authored diff is not self-justifying

OSBR embraces human ⇄ AI cooperation, and agents are productive authors. That
productivity carries the same trap the [Testing Standards](/testing-standards)
name for generated tests: **a large, passing, AI-authored change can look like
health while hiding bloat, an unsafe default, or logic no human has actually
followed.**

- The merging human MUST review an agent's change against this policy exactly as
  they would a human's — the AI review gate applies to AI-authored code too, and a
  passing gate is not a reason to skip the human's own read.
- Volume is never the signal. We judge a change by the three concerns of §3-2, not
  by how much code it adds or how quickly it was produced — and the ease of
  generating code makes that discipline *more* important here, not less.

### 3-6. The token cost is an accepted cost

Running an AI review on every change costs tokens. That cost is **accepted, not
minimised away.** The correctness, safety, and legibility it buys — for both the
humans and the AI agents who will maintain the code — is worth more than the
tokens. A gate that runs only sometimes, to save cost, is not the always-on guard
this standard requires.

## 4. Relationship to human review

OSBR reconciles two opposed positions rather than picking one. Removing default
review entirely — trusting policy-grounded generation plus each developer's own
QA — leaves changes unguarded when that self-QA lapses. Mandating a human
reviewer on every change makes the guard hostage to reviewer availability and
turns review into a bottleneck. OSBR takes a third path: **keep a review gate,
but make it AI-automated and always-on**, so the guard is present on every change
(unlike "no review") without waiting on a human's calendar (unlike "mandatory
human reviewer"). Human review stays available and welcome (§2); it is simply not
the enforced default — the AI review is, and the human's accountability sits on
top of it.

## References

**Design principles the correctness lens applies**

- KISS / DRY / YAGNI, "You Aren't Gonna Need It" — <https://martinfowler.com/bliki/Yagni.html>
- Andy Hunt & Dave Thomas, *The Pragmatic Programmer* (DRY — one source of truth) — <https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/>

**Security lens**

- OWASP Application Security Verification Standard (ASVS) — <https://owasp.org/www-project-application-security-verification-standard/>
- OWASP Top Ten — <https://owasp.org/www-project-top-ten/>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the always-on review this standard implements.
- [Security Policy](/security-policy) — the org-level security stance the review's security lens enforces.
- [Application Security](/application-security) — the OWASP/ASVS-class depth behind §3-2's second concern.
- [Testing Standards](/testing-standards) — the complementary evidence gate; the "green is not self-justifying" discipline.
- [CI/CD Pipeline](/ci-cd-pipeline) — the production-simulation gate the review runs alongside.
- [Development Guide](/development-guide) — the pull-request workflow this review gates.
- [Coding Style Guide](/style-guide) — the ubiquitous language and RFC 2119 levels the readability lens leans on.
