# Policies as Plugins

This is the standard for how the OSBR engineering policy series reaches the AI
agents that write our code. Every policy in the series is not only a page a
person reads here at [handbook.osbrjp.com](https://handbook.osbrjp.com) — it also
**ships as a plugin the agents load**, so the standard is present in the model's
context *at the moment of generation*, not discovered in review after the
violation is already written. The aim is a **single source of truth** that a
person can read and a machine can load: one policy, rendered for both, never two
copies quietly drifting apart. It works alongside the [AI Usage
Guideline](/ai-usage-guideline) (how humans and agents share the work) and the
[Quality Gate](/quality-gate) (where compliance is actually proven). Deviations
are allowed, but — as everywhere in the handbook — they must be deliberate and
justified in the project's design notes.

This is where OSBR's values reach the agents as directly as they reach us.
**Be Nice**: one source of truth is an honesty owed to everyone downstream —
no engineer, and no agent, is ever governed by a stale copy nobody remembered to
update. **Be Kind**: we meet the agents where they work, putting the standard in
their context in the form they can load, so the next contributor — human or
model — inherits rules that are present exactly where the work happens.
**Be Strong**: we hold the same line for the agent that we hold for ourselves —
refusing to merge a policy change that leaves humans and machines reading
different rules, and refusing to accept a silent plugin as proof of anything.
This is the human ⇄ AI principle made operational: the same words govern the
person and the agent, and they are updated together.

## How to read this policy

* **Requirement levels** follow RFC 2119. **MUST** / **MUST NOT** are absolute.
  **SHOULD** / **SHOULD NOT** state a strong default overridable only with a
  documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice — shift-left
  governance, policy-as-code, docs-as-code — the practice is named inline and
  cited under [References](#references). We adopt the *idea* and right-size it for
  an SME; we do not adopt the tooling or scale behind its reference setups.

[[TOC]]

## 1. Goal

The goal is a policy that is **readable by a person and loadable by a machine** —
one source of truth, two renderings, never two divergent copies. Concretely:

- Put the standard in the model's working context **before the first line is
  generated**, so the agent writes to the rule instead of being corrected against
  it afterwards. The cheapest violation to fix is the one the agent never writes
  because it already knew the rule.
- Prevent the named failure this policy exists for: **standards drift between
  humans and AI** — the state where the handbook says one thing, the plugin the
  agent loads says another (or nothing), and neither the reviewer nor the model
  can tell which is authoritative. An agent cannot follow a rule it never
  received; a policy that lives only on a docs site the agent does not read is,
  from the agent's side, not a policy at all.
- Keep the machine-facing copy an honest rendering of the human-facing one, so the
  two never quietly disagree.

This is **shift-left governance** applied to how we author software with AI. Just
as [policy-as-code](#references) moves compliance from a late audit gate to an
early, version-controlled artifact, distributing our policies as plugins moves the
standard from a post-hoc review comment into the model's context. The plugin
shifts the standard *left* into generation — it does not replace the gate on the
right (§3-4).

## 2. Responsibility

- The **author of a policy change owns every rendering of it.** "Done" includes
  the agent plugins, not just the page; a pull request that edits the article
  without updating the plugins it renders MUST say why in its Specification
  section (per the [Development Guide](/development-guide)). This is the same
  implementer-owns-quality rule the Quality Gate states.
- The **reviewer** treats the plugin diff as part of the reviewable surface: a PR
  that updates one surface but not the others is rejected exactly as an incomplete
  rename is (§3-2). This is a natural extension of the always-on review the
  [Quality Gate](/quality-gate) requires.
- The **team** owns drift over time: the plugins are periodically audited against
  the published articles, as part of the policy-conformance auditing the [SHEQ
  Policy](/sheq-policy) already runs, and any divergence is a defect to reconcile.
- **AI agents** are governed by the same policies they help author and are held to
  exactly the same bar — the human ⇄ AI stance of the [AI Usage
  Guideline](/ai-usage-guideline). The human who merges an agent's work owns it.

## 3. Practices

### 3-1. Ship every policy as a plugin the agents load

Each article in the engineering policy series MUST be reachable by our AI agents
as a plugin, in the native form each coding agent understands, loaded into context
when the matching kind of work is scoped or implemented.

- The plugin MUST carry the policy's **normative content** — its Goal,
  Responsibility, and Practices, its MUST / SHOULD rules — not a lossy summary. A
  summary that drops a MUST is a new, weaker policy wearing the old one's name.
- The plugin SHOULD be **scoped to trigger on the work it governs** (the database
  policy loads when schema work is in play; the security policy when an auth
  surface is touched), the way our pillar-policy skills already preload as a lens
  for their domain. Relevance is what keeps the context useful rather than noise.
- The mechanism is deliberately close to the **Model Context Protocol (MCP)**
  stance on context: a policy is context the model needs to do the task correctly,
  delivered through a stable interface rather than pasted ad hoc into a prompt —
  scoped to the work at hand instead of bloating every prompt with the whole
  handbook.

### 3-2. Update the article and every plugin in one pull request

Because the human page and the agent plugins are **renderings of one policy**,
they MUST move together. A change to a policy MUST update the handbook article and
every plugin that renders it **in the same pull request**.

- A PR that edits the article but not the plugins, or vice versa, MUST be rejected
  in review. Naming the divergence a "follow-up" is precisely how the two copies
  part ways — drift starts with one deferred surface.
- The surfaces MUST NOT carry divergent normative content. There is one policy; the
  renderings are reviewed against one another, never allowed to disagree.
- Where practical, the plugins SHOULD be **generated from the same source** as the
  page, so "same PR" is enforced by the build rather than by reviewer memory. A
  single source of truth is strongest when divergence is structurally impossible,
  not merely discouraged.

### 3-3. Keep every policy in the Goal / Responsibility / Practices shape

Every policy — page and plugin alike — MUST keep the house structure: **Goal**,
**Responsibility**, **Practices**, with normative force carried by explicit MUST /
SHOULD. This is not house style for its own sake; it is what makes a policy
*loadable*:

- **Goal** tells the model *why*, so it can reason about cases the rules did not
  enumerate.
- **Responsibility** gives the MUST / SHOULD rules the model applies directly.
- **Practices** gives the concrete, worked guidance that pins ambiguous rules to a
  recognisable shape.

A consistent structure is good prompt engineering at the corpus level: the agent
learns the shape once and reads every policy the same way, and a reviewer checks
every policy against the same skeleton. An article that abandons the structure is
harder for both to consume, and is itself a review defect.

### 3-4. Treat plugin silence as unknown, not clean

A loaded policy that raises no objection is **not** evidence the work is
compliant. The plugin puts the standard in context; it does not *prove* adherence.

- The absence of a flag MUST NOT be read as a pass. The agent may not have loaded
  the relevant policy, the policy may not cover this case, or the model may simply
  have missed it. Silence is *unknown*, not *clean*.
- Compliance is still earned the way it always is: by **human review and by
  executable checks** — the genuine [policy-as-code](#references) gate where one
  exists, tests, and reviewer judgement — the proof the [Quality
  Gate](/quality-gate) requires. The plugin shifts the standard left into
  generation; it is additive to verification on the right, never a substitute for
  it. Both are needed.
- Verify against ground truth; do not infer success from a tool that stayed quiet.

### 3-5. Working rules

- **One PR, all surfaces.** When you change a policy, the checklist is: article
  updated, every plugin updated — in *this* PR. If you cannot update them all now,
  do not merge a partial change.
- **Write the normative content once, render it everywhere.** Prefer generating the
  plugins from the same source as the page over hand-maintaining separate copies.
  Hand-kept copies are chances to diverge; one source with rendered outputs has
  none.
- **Scope the plugin to its work.** A policy that loads on every prompt is noise the
  model learns to ignore; one that loads when its domain is in play is a lens the
  model actually uses. Match the pillar-policy preloading pattern.
- **Load the policy before you generate, not after.** The value of a policy-as-plugin
  is realised only if the relevant policy is in context *at generation time* — pull
  it in when you scope the work, the way you would read the handbook page before
  designing against it.
- **Verify anyway.** Treat the plugin as a well-informed collaborator, not an
  auditor. Run the real checks, get the human review, and never let a quiet plugin
  stand in for either.
- **Keep the plugins honest about drift.** Periodically diff the plugin content
  against the published article; any divergence is a defect to reconcile, and a
  signal that "same PR" was skipped somewhere upstream.

## References

**Shift-left governance & policy-as-code**

- Shift-left — moving checks earlier, into the authoring loop — <https://martinfowler.com/articles/shift-left-testing.html>
- Open Policy Agent (OPA) / Rego — policy as versioned, testable code — <https://www.openpolicyagent.org/docs/latest/policy-language/>
- Conftest — test configuration against OPA policies in CI — <https://www.conftest.dev/>

**Single source of truth & docs-as-code**

- Docs-as-Code (Write the Docs) — docs in version control, reviewed and shipped like code — <https://www.writethedocs.org/guide/docs-as-code/>
- Single Source of Truth (SSOT) — one authoritative, non-duplicated definition — <https://en.wikipedia.org/wiki/Single_source_of_truth>

**Context for models**

- Model Context Protocol (MCP) — supplying context to models through declared interfaces — <https://modelcontextprotocol.io/>

**Related OSBR standards**

- [AI Usage Guideline](/ai-usage-guideline) — the human ⇄ AI stance this policy operationalises.
- [Quality Gate](/quality-gate) — the human review and executable checks that prove compliance on the right.
- [SHEQ Policy](/sheq-policy) — policy-conformance auditing that catches plugin↔article drift.
- [Development Guide](/development-guide) — the pull-request Specification section where "same PR" is owned.
