# Accessibility

We put **accessibility at the start of the experience, not at the end of it.**
This page sets the floor every OSBR product clears for the people who use it, and
it extends that same floor in a direction many teams still skip: a product that
is genuinely reachable must be reachable by **AI agents too** — as operators
acting on a user's behalf, and as consumers of the information the product holds.
It builds on the concrete rules in the [Design Guidelines](/design-guidelines),
shares its machine-access half with [Building for AI
Users](/building-for-ai-users), and is held to work by the [Quality
Gate](/quality-gate)'s review. Deviations are allowed, but — as everywhere in the
handbook — they must be deliberate and justified in the project's design notes.

Accessibility is where our values meet the person, or agent, actually in front of
the product. **Be Nice**: meet people through the tools they already rely on — a
screen reader, a keyboard, an agent — rather than the one input we happened to
design for. **Be Kind**: assume the user reaching for a feature may be a person
*or* the AI acting for them, and let both in without a fight. **Be Strong**: hold
a real, tested floor rather than "accessible enough" — the failure we guard
against is invisible to the person who never has to hit it. This commitment runs
through **human ⇄ AI** cooperation the same way it runs through human use.

## How to read this policy

* **Requirement levels** follow RFC 2119, as elsewhere in the handbook. **MUST** /
  **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a strong default
  overridable only with a documented reason. **MAY** marks a free choice.
* **Named standards.** Where a rule adopts an external standard (WCAG, WAI-ARIA),
  the standard is named inline and cited under [References](#references). We adopt
  its *criteria* and right-size the process around them.

[[TOC]]

## 1. Goal

Every OSBR product is usable, from the first interaction, by:

- **people using assistive technology** — screen readers, keyboard-only
  navigation, switch devices, magnification — and
- **AI agents** acting as operators on a user's behalf, or reading the product as
  a source of information,

**without either being forced to reverse-engineer a UI built only for a sighted
mouse user.** Accessibility is designed in at the start, not bolted on as
late-stage polish.

The reasoning is one idea, not two. An interface that states its meaning and its
operations explicitly — semantic structure for people, declared tools for
machines — is reachable by whoever, or whatever, shows up. A screen reader and an
AI agent both consume a product through its *stated* structure, never its pixels;
build well for the one and you have most of the other. This is the
inclusive-design bargain: designing for the edges makes the centre better for
everyone.

## 2. Responsibility

- **Every engineer and designer** owns accessibility for the surfaces they build.
  It is not a specialist's job handed off at the end, and it is not the reviewer's
  to discover after the fact — the same implementer-owns-quality rule the [Quality
  Gate](/quality-gate) states everywhere.
- **Designers** account for keyboard order, focus, contrast, and non-visual
  meaning in the design itself, before implementation begins.
- **Engineers** build from semantic HTML, verify with a real screen reader and
  keyboard, and expose machine-callable operations where the product does real
  work.
- **Reviewers** treat a missing label, an unreachable control, or an unexposed
  core operation as a defect, not a nice-to-have — part of the reviewable surface,
  exactly like tests.
- **Project leads** scope the accessibility floor and the machine-access surface
  into the work from the start, so neither is deferred to a later "accessibility
  pass" that never arrives.

## 3. Practices

### 3-1. Accessibility comes first, not last

Accessibility is a **starting constraint**, alongside "does it work" — never a
finishing touch. A control that cannot be reached by keyboard, or an image with no
text alternative, is an **unfinished feature**, exactly as a broken button is.

- Accessibility MUST be scoped into a feature from the start; it MUST NOT be
  deferred to a later pass.
- Designs SHOULD be reviewed for keyboard order, focus, and non-visual meaning
  *before* implementation begins, per the [Development Guide](/development-guide).

### 3-2. WCAG 2.2 AA is the floor

[WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) is the **minimum**, not the target —
the target is a product people actually find easy. 2.2 is the current W3C
Recommendation and supersedes 2.1; the handbook is standardized on **2.2 AA**, and
the [Design Guidelines](/design-guidelines) carry the concrete rules that meet it.

- Every product MUST meet **WCAG 2.2 AA** as its floor.

### 3-3. Verify with a screen reader and keyboard — not just a linter

Automated checkers ([axe](https://www.deque.com/axe/), Lighthouse) catch perhaps a
third of issues. They cannot tell us whether a flow *makes sense* announced aloud
or driven by Tab alone — and that is the part that decides whether the product is
actually usable.

- Every UI-bearing feature MUST be verified before it ships:
  - **keyboard-only** — every control reachable, operable, and showing a visible
    focus indicator, with no keyboard traps; and
  - **with a screen reader** (VoiceOver, NVDA, or Orca) — every control announcing
    a sensible name and role, and the reading order matching the visual order.
- Automated tooling MAY gate the obvious regressions, but MUST NOT be the only
  check.

### 3-4. Build from semantic HTML; ARIA only to fill gaps

Native semantic elements carry role, state, focus, and keyboard behaviour for
free. We reach for them first.

- UI MUST be built from **semantic HTML first**.
- [WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/) MUST be used only to *supplement*
  what no native element can express — never to re-implement a native control on a
  `<div>`. The first rule of ARIA is: don't use ARIA when a native element already
  does the job.
- The [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) is the
  reference for the rare patterns that genuinely need it; the concrete HTML/CSS
  rules live in the [Design Guidelines](/design-guidelines).

### 3-5. Open operations to AI agents

Where a product performs real operations — search, create, update, submit,
query — we expose those operations as **machine-callable tools** so an AI agent
can operate the product and read its information without scraping the DOM or
guessing from screenshots. This is the same accessibility problem as a screen
reader operating the product: meaning must be *stated*, not painted. The full
agent-facing standard lives in [Building for AI Users](/building-for-ai-users);
this page states the floor it shares with human accessibility.

- Products that perform real operations SHOULD expose them as
  [MCP](https://modelcontextprotocol.io/)-compatible tool definitions — each a
  named tool with a declared input schema, a declared output, and a description of
  what it does.
- Web products SHOULD prefer the browser-native
  [WebMCP](https://webmachinelearning.github.io/webmcp/) surface
  (`navigator.modelContext`) where the platform supports it, so the page itself
  declares its tools to an in-browser agent — the site *is* the server, no
  separate backend required.
- These tools SHOULD cover **both read and write**: an agent is an information
  *consumer* (read) and an *operator* (write); a read-only surface leaves it
  half-blind, a write-only one leaves it unable to check its own work.
- The agent surface MUST enforce the **same authentication and authorization** as
  the human surface. Opening to AI is not opening a side door — an agent acts *as*
  a user and inherits exactly that user's permissions, nothing more.
- Teams SHOULD add at least one flow driven **end-to-end by an AI agent** to the
  acceptance checks for agent-facing surfaces, mirroring the screen-reader
  walk-through and the [Development Guide](/development-guide)'s test plan.

*Same principle, one rung further: declared tools serve the machine consumer the
way semantic HTML serves the assistive-technology consumer.*

## References

**Accessibility standards & guidance**

- WCAG 2.2 (W3C Recommendation) — <https://www.w3.org/TR/WCAG22/>
- WAI-ARIA Authoring Practices Guide (APG) — <https://www.w3.org/WAI/ARIA/apg/>
- W3C WAI — Accessibility Fundamentals & Inclusive Design — <https://www.w3.org/WAI/fundamentals/accessibility-intro/>
- HTML — the semantic elements (MDN) — <https://developer.mozilla.org/en-US/docs/Web/HTML/Element>

**Verification**

- Deque axe (automated checks) — <https://www.deque.com/axe/>
- NVDA screen reader — <https://www.nvaccess.org/>
- Apple VoiceOver — <https://support.apple.com/guide/voiceover/welcome/mac>

**Machine access (AI agents)**

- Model Context Protocol (MCP) — <https://modelcontextprotocol.io/>
- WebMCP (`navigator.modelContext`, W3C Web Machine Learning Community Group) — <https://webmachinelearning.github.io/webmcp/>

**Related handbook pages**

- [Design Guidelines](/design-guidelines) — the concrete HTML/CSS accessibility rules.
- [Building for AI Users](/building-for-ai-users) — the agent-facing surface this page shares its machine-access half with.
- [Quality Gate](/quality-gate) — the review that holds this floor.
- [Development Guide](/development-guide) — pull-request specification, test plan, and acceptance checks.
