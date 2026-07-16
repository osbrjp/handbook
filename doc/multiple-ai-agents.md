# Multiple AI Agents

Every OSBR developer keeps **at least two coding agents usable every day** — for
example Claude Code and one other — with authentication, permissions, and working
environments already configured so that switching between them is a matter of
minutes, not a project. When one provider fails, rate-limits, silently changes
model quality, or ships a breaking spec change, work continues on the other. This
page is the *discipline* for holding that second path warm, not merely
theoretically available. It is the AI-layer companion to the [AI Usage
Guideline](/ai-usage-guideline) (how we work with agents at all) and to
[Policies as Plugins](/policies-as-plugins) (the shared standard every agent is
held to).

The failure this prevents is concrete: a whole team blocked for an afternoon
because one vendor is down, one account is throttled, or a model update quietly
regressed on the exact task we depend on. A backup agent that nobody has logged
into for a month is not a backup — it is a cold spare that will itself need
debugging at the worst possible moment.

This page is where OSBR's **Be Strong** value becomes operational: *strong =
never single-point-dependent.* **Be Nice**: an agent-agnostic ticket and a synced
policy version are a gift to whoever picks the task up next. **Be Kind**: doing
the dull readiness check on the calm day is what spares a teammate the bad one.

## How to read this policy

* **Requirement levels** follow RFC 2119, as elsewhere in the handbook.
  **MUST** / **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a
  strong default overridable only with a documented reason. **MAY** marks a free
  choice.
* **Named practice.** Where a rule adopts a standard resilience practice, the
  practice is named inline and cited under [References](#references). We adopt the
  *criteria* — vendor-neutrality, N+1 redundancy, bus-factor thinking — and
  right-size them for an SME, not the infrastructure of the reference setups.
* Deviations are allowed but, as everywhere in the handbook, must be deliberate
  and justified in the project's design notes.

[[TOC]]

## 1. Goal

Development at OSBR **never has a single point of failure at the AI-provider
layer.** On any project, on any day, a developer — or the AI agent working beside
them — can move the current task from one coding agent to another and keep going,
because the second agent is already authenticated, already permissioned, already
pointed at the same repository and the same policy standard.

Concretely, the goal is that the answer to *"provider X is down / throttled / just
changed — can we still ship today?"* is always **yes**, and proving it takes
minutes. This is the AI-layer expression of **Be Strong**: *never
single-point-dependent.* We treat a coding agent the way a serious operation
treats any critical supplier — as one interchangeable source among several, not
as the foundation the whole business rests on.

This is standard resilience engineering applied to our development tools.
**Vendor-neutrality and avoiding lock-in** keep our choices open; **multi-vendor
sourcing** removes the single supplier as a single point of failure; **redundancy
(N+1)** keeps a spare warm; **Business Continuity Planning (BCP)** and
**bus-factor** thinking demand the work survive the loss of any one dependency;
**portability** and **abstraction over provider-specific features** are what make
the switch cheap when we need it.

## 2. Responsibility

- **Every developer** keeps at least two coding agents installed, authenticated,
  and *actually exercised* — not just installed. If you have not run a real task
  through your backup agent this week, you do not have a backup.
- **Whoever writes a ticket, command, or procedure** writes it
  **agent-agnostically** (§3-2). Per the [Development Guide](/development-guide),
  a ticket states the task and its acceptance criteria; one that only makes sense
  to a single agent is a lock-in defect, the same way a synonym is a naming
  defect.
- **Whoever bumps a policy plugin** on one agent MUST bring every other agent to
  the **same version** in the same change (§3-4). Divergent policy versions across
  agents mean the same code passes on one agent and fails on another — silent,
  maddening drift.
- **The whole team** treats "can we switch providers today?" as a standing
  readiness question, not a disaster-day discovery. Readiness is verified on a
  cadence (§3-5), not assumed.

## 3. Practices

### 3-1. Keep two agents warm, not one warm and one cold

- You MUST keep **at least two coding agents** usable daily, with auth,
  permissions, and environment ready to switch. Two is the floor (**N+1**
  redundancy over a single agent); a third is cheap insurance where a project's
  risk warrants it.
- **Exercise the spare.** A backup path you never run rots — credentials expire,
  config drifts, the CLI is three versions behind. You SHOULD route real work
  through each agent regularly so the switch is proven, not hoped for. This is the
  difference between a *hot* standby and a *cold* one: only the hot standby is a
  real BCP control.
- Keep authentication for each agent **current and independent** — separate
  credentials, no shared token that takes both down at once. Correlated failure
  defeats the point of redundancy: two agents behind one dependency are one agent
  wearing two hats.
- Keep the **environments** (repo checkout, tooling, MCP servers, secrets access)
  reachable from either agent, so switching is "point the other agent at this
  repo," not "spend a day rebuilding a workspace."

### 3-2. Write tickets, commands, and procedures agent-agnostically

- Tickets, runbooks, slash-command procedures, and project-memory guidance MUST be
  written to the **task and the repository**, not to one vendor's quirks. State
  *what* must be true (the acceptance criteria, the files, the checks), not *which*
  agent's private feature you happen to be using.
- This is **abstraction over provider-specific features**: depend on the
  capability (edit files, run tests, open a PR), which every serious coding agent
  has, not on a single vendor's proprietary surface. Where a provider-specific
  feature genuinely earns its keep, isolate it behind a thin, documented seam so
  the fallback path is obvious — the same **portability** discipline that keeps
  application code off a single cloud's proprietary API.
- A good test: **could the other agent pick up this ticket and finish it with no
  rewrite?** If not, the ticket is coupled to a provider — fix the ticket.
  Agent-agnostic wording is to provider lock-in what one-word-per-concept is to
  naming drift: cheap to hold if you hold it continuously, expensive to unwind
  once it spreads.

### 3-3. Treat a provider change as an expected event, not a surprise

- A rate-limit, an outage, a quality regression after a model update, or a
  breaking spec/API change is a **when, not an if** — plan for it. The response is
  a rehearsed switch, not an emergency.
- When a provider degrades, **switch first, report second**: move the task to the
  warm agent, keep shipping, then record what happened (which provider, what
  symptom, what you switched to) so the team sees the pattern. Recurrent
  degradation at one provider is a supplier-management signal, not just a bad
  afternoon.
- Never let one provider's convenience quietly become a hard dependency. Each time
  you reach for a feature only one agent has, you SHOULD ask whether you are
  re-introducing the single point of failure this policy exists to remove.

### 3-4. Keep policy plugins synchronized to the same version across agents

- The OSBR **policy plugins are the shared evaluation standard** every agent is
  held to — the same standard the [Quality Gate](/quality-gate) enforces, packaged
  as described in [Policies as Plugins](/policies-as-plugins). They MUST be at the
  **same version across all agents you use.** The same code reviewed by two agents
  on two plugin versions gets two answers — that divergence is a correctness bug
  in our process, not a quirk to work around.
- When you bump a plugin on one agent, you MUST bump it on the others **in the
  same change**, and note the version. Pin the version explicitly rather than
  letting each agent float to "latest" independently — floating versions re-create
  the drift by default.
- Verify the versions **match** as part of the readiness check (§3-5), the same way
  a rename is not done until every surface is updated: policy sync is not done
  until every agent reports the same version.

### 3-5. Verify switch-readiness on a cadence

- On a regular cadence (SHOULD be at least weekly), each developer confirms the
  fallback is real: **each agent authenticates, runs a real task, and reports the
  same policy-plugin version.** A backup asserted but never verified is **BCP
  theatre** — it fails exactly when it is finally needed.
- Treat a failed readiness check like a broken build: fix the cold agent *now*,
  while there is no pressure, not on the day the primary is down. The whole value
  of **N+1** is that the spare is known-good *before* the failure, not diagnosed
  during it.

## 4. Quick Checklist

Before relying on "we can always switch," confirm:

- [ ] At least two coding agents are installed, authenticated, and have run a real
      task this week.
- [ ] Each agent has independent, current credentials — no shared token that fails
      both at once.
- [ ] Either agent can reach this repo, its tooling, and its secrets with no
      day-long setup.
- [ ] Tickets/commands/procedures read agent-agnostically — the other agent could
      finish them with no rewrite.
- [ ] Policy plugins are pinned to the **same version** across every agent, bumped
      together.
- [ ] The last switch-readiness check passed (auth + real task + matching plugin
      version).

## 5. OSBR Values in Practice

- **Be Nice** — an agent-agnostic ticket and a synced policy version are a gift to
  the next developer, who can pick up the task on whichever agent they have without
  hitting a wall you left behind. Portability is consideration made durable.
- **Be Kind** — do the unglamorous readiness check on the calm day so a teammate is
  not stranded on the bad one. Sparing others a 3am scramble by keeping the spare
  genuinely ready is kindness that costs you a few minutes and saves them an
  afternoon.
- **Be Strong** — *never single-point-dependent.* Strength here is refusing to let
  one vendor's outage, throttle, or quiet quality change decide whether OSBR ships
  today. Keep the second path warm and proven so no single provider can stop the
  work.

Two warm agents, agent-agnostic work, and synchronized policy are how OSBR stays
**strong at the AI layer — dependent on no single provider, ready to switch before
we ever have to.**

## References

**Resilience & continuity practice**

- NIST SP 800-34 Rev. 1 — *Contingency Planning Guide for Federal Information
  Systems* (business continuity, alternate providers, redundancy) —
  <https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final>
- ISO 22301 — *Business Continuity Management Systems* (continuity of critical
  operations through supplier disruption) — <https://www.iso.org/standard/75106.html>
- The Open Group — vendor-neutrality and portability as architecture principles —
  <https://www.opengroup.org/>

**Redundancy & bus-factor**

- N+1 redundancy — resilience by keeping at least one spare beyond the minimum
  needed — <https://en.wikipedia.org/wiki/N%2B1_redundancy>
- Bus factor — resilience against the loss of any single critical dependency —
  <https://en.wikipedia.org/wiki/Bus_factor>
- Multi-cloud / multi-vendor resilience — removing the single supplier as a single
  point of failure — <https://en.wikipedia.org/wiki/Multicloud>

**Related OSBR standards**

- [AI Usage Guideline](/ai-usage-guideline) — how we work with AI agents at all;
  this page is its no-single-provider companion.
- [Policies as Plugins](/policies-as-plugins) — the policy plugins that must stay
  version-synced across agents (§3-4).
- [Quality Gate](/quality-gate) — the shared evaluation standard every agent, on
  any provider, is held to.
- [Development Guide](/development-guide) — agent-agnostic tickets, commands, and
  pull-request procedure.
