# Building for AI Users

The software we ship is driven by both people and autonomous agents, so we plan
for **AI agents as first-class users** — alongside humans — from the earliest
scoping stage. This standard sets out who we build for; it complements the
[Development Guide](/development-guide) and [Quality Gate](/quality-gate) (which
shape *how* we build and how work is held to a bar), the [API Design
Guide](/api-design) (the machine-consumable contracts agents call), the
[Application Security](/application-security) standard (least-privilege and
auditability for agent-facing surfaces), and the [Design
Guidelines](/design-guidelines) (the human-facing legibility that oversight
depends on). It is the planning-time face of the [AI Usage
Guideline](/ai-usage-guideline). Deviations are allowed, but — as everywhere in
the handbook — they must be deliberate and justified in the project's design
notes.

This is where OSBR's **human⇄AI cooperation** stance becomes concrete: design
for both users, and keep humans in control. **Be Nice**: never trap a user —
the person at the keyboard, or the humans behind an agent — in a process they
cannot escape. **Be Kind**: make the system legible enough that people can
genuinely understand and intervene, not merely rubber-stamp what an agent did.
**Be Strong**: build systems robust enough to be trusted with autonomy, with a
human path that holds even when the automation misbehaves.

## How to read this policy

* **Requirement levels** follow RFC 2119. **MUST** / **MUST NOT** are absolute.
  **SHOULD** / **SHOULD NOT** state a strong default overridable only with a
  documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry standard or protocol, it
  is named inline and cited under [References](#references). We pick standards
  that are open and adoptable by a small team, and right-size them — we do not
  take on the infrastructure behind their reference deployments.

[[TOC]]

## 1. Goal

Plan every product so that:

1. **Both users are designed for.** Humans and AI agents are both intended
   consumers of what we ship. Interfaces, data, and actions are reachable by
   machines without scraping, screen-driving, or reverse-engineering — the
   [API-first](https://www.openapis.org/) posture of the [API Design
   Guide](/api-design), extended to agents.
2. **Humans stay in control.** No AI-driven process runs where a human cannot
   see what it is doing, understand why, stop it cleanly, and take the wheel.
   This is **human oversight** as a hard requirement, not a feature bolted on
   later.

A capability that serves an agent audience but hides behind a human-only GUI, or
an autonomous flow whose only off switch is killing the process, fails this goal
regardless of how well it demos.

## 2. Responsibility

- **Planners and product owners** MUST treat "an AI agent is a user of this
  feature" as an explicit scenario during scoping, and MUST record the
  human-in-the-loop path for any autonomous flow as an acceptance criterion —
  not a later enhancement.
- **Architects** MUST choose interfaces and autonomy levels deliberately (§3,
  §5) and document them in the project's design notes.
- **Engineers** MUST build the observe / interpret / interrupt / take-over path
  (§4) into the feature, and MUST NOT ship an autonomous flow whose only stop
  control is killing the process.
- **Reviewers** MUST reject autonomous features that are unobservable or
  non-interruptible, exactly as the [Quality Gate](/quality-gate) rejects
  features that are insecure or untested.

## 3. Two Users: Humans and Agents

### 3-1. Agents are users, not an afterthought

The industry is standardising on **agentic AI** — software that plans and acts
toward goals with limited supervision — and on open protocols for agents to use
tools and talk to one another. Plan for this reality:

- **Model Context Protocol (MCP)** is the emerging open standard for exposing
  tools, data, and actions to AI agents ([modelcontextprotocol.io](https://modelcontextprotocol.io/)).
  When a capability should be usable by an agent, prefer exposing it as an **MCP
  tool** with typed inputs and outputs over expecting the agent to drive a human
  UI.
- **WebMCP** extends this into the browser: a site registers structured tools
  that in-browser agents discover and call, instead of scraping the DOM
  ([W3C Web Machine Learning CG draft](https://webmachinelearning.github.io/webmcp/)).
  For web front-ends whose actions an agent should perform, consider exposing
  tools via WebMCP rather than relying on the agent to click through the page.
- **Agent-to-Agent (A2A)** is the open protocol (originally Google, now a Linux
  Foundation project) for agents to discover each other's capabilities and
  collaborate across vendors and frameworks ([a2a-protocol.org](https://a2a-protocol.org/),
  [github.com/a2aproject/A2A](https://github.com/a2aproject/A2A)). When our
  system is one participant among several autonomous services, plan its
  capabilities as an A2A-style advertised interface, not a private integration.

You do not have to adopt MCP / WebMCP / A2A on day one. The requirement is to
**decide deliberately** at planning time whether a capability has an agent
audience, and to design the interface so that adopting these standards later is a
small step, not a rewrite.

### 3-2. Machine-consumable by design

- Every capability meant for agents MUST be reachable through a
  **machine-consumable, documented interface** — a stable API with a published
  contract (e.g. [OpenAPI](https://www.openapis.org/), per the [API Design
  Guide](/api-design)) or an MCP/A2A surface — never only a human GUI.
- Actions exposed to agents MUST have **typed, validated inputs and explicit
  outcomes**, so both a caller and a human observer can tell what was requested
  and what happened.
- Agent-facing surfaces MUST be **least-privilege and auditable**, per the
  [Application Security](/application-security) standard: an agent gets only the
  tools and scopes it needs, and every agent-invoked action is attributable in
  logs.

## 4. Keep Humans in the Loop

Every AI-driven process MUST provide a human path with four capabilities. Name
them in the requirements and test them like any other acceptance criterion.

1. **Observe** — a human can see, in near-real time and after the fact, what the
   agent is doing and has done. Emit structured logs, decisions, and the inputs
   behind them; standardising on [OpenTelemetry](https://opentelemetry.io/)
   keeps agent activity as inspectable as any other service.
2. **Interpret** — the human can understand *why* the agent acted: what goal,
   what inputs, what tool calls, what alternatives. An action a human cannot
   interpret cannot be meaningfully approved or overridden, which is why the
   legibility the [Design Guidelines](/design-guidelines) require extends to
   agent activity too.
3. **Interrupt** — the human can **pause or stop** the process cleanly, at any
   point, without corrupting state. This draws on the AI-safety notions of
   **controllability and interruptibility**: an agent should be safely
   interruptible — able to be stopped by an operator without the system learning
   to prevent, resist, or route around that intervention ([Orseau & Armstrong,
   *Safely Interruptible Agents*](https://intelligence.org/files/Interruptibility.pdf)).
4. **Take over** — the human can assume manual control and complete or reverse
   the task themselves. Autonomous actions SHOULD therefore be **reversible or
   confirmable** (expand/contract, staged commits, undo), consistent with our
   deploy-safely-and-reversibly stance.

**Human-in-the-loop** means a human approves each consequential action before it
takes effect; **human-on-the-loop** means the agent acts autonomously while a
human monitors and can intervene. Both are legitimate; the choice depends on the
autonomy level (§5) and the blast radius of a wrong action. Higher stakes ⇒
closer to in-the-loop. This mirrors the **human oversight** requirement in
emerging AI governance ([EU AI Act, Article 14](https://artificialintelligenceact.eu/article/14/))
and the [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework).

- **MUST:** for any action that spends money, changes production data, contacts
  a third party, or is otherwise hard to reverse, default to
  **human-in-the-loop** (explicit confirmation) unless a deliberate, documented
  decision says otherwise.
- **MUST:** every autonomous flow has a working **stop control** reachable by a
  human, and stopping never leaves data in a corrupt state.
- **SHOULD:** prefer **human-on-the-loop** with strong observability for
  high-volume, low-stakes actions, so humans are not a bottleneck where the risk
  does not warrant it.

## 5. Levels of Autonomy

State the autonomy level of each AI-driven feature explicitly, the way the
automotive industry names **SAE levels of driving automation (J3016)** — from
driver-assist to full self-driving ([SAE J3016](https://www.sae.org/standards/content/j3016_202104/)).
The analogy is deliberate: the hard questions are the same — *who is responsible
for the task right now, and how fast can control hand back to a human?*

A practical OSBR ladder:

- **L0 — Manual:** human does the work; no AI action.
- **L1 — Assist:** AI suggests; a human performs every action.
- **L2 — Supervised (human-in-the-loop):** AI proposes and can act, but each
  consequential action needs human confirmation.
- **L3 — Monitored (human-on-the-loop):** AI acts autonomously within bounds; a
  human monitors and can interrupt or take over at any time.
- **L4 — Bounded-autonomous:** AI acts without routine human attention *within a
  constrained, well-understood domain*; humans handle exceptions and set the
  bounds.

Rules:

- Each feature MUST declare its level in the design notes, and MUST NOT operate
  above the level it was reviewed for.
- The **interrupt** and **take-over** paths (§4) are mandatory at **every** level
  from L2 upward — there is no OSBR level at which a human loses the ability to
  intervene.
- Raising a feature's autonomy level is a **change that requires review**, not a
  config tweak.

As with SAE's levels, the value is in the shared vocabulary, not in racing to the
highest number. Most OSBR features should sit at L1–L3. L4 is a deliberate,
justified choice for a narrow, well-bounded domain.

## 6. Planning Checklist

Answer these while scoping any feature that an agent might use or that acts
autonomously:

- [ ] **Audience:** Is an AI agent an intended user of this capability? If yes,
  what interface serves it (API / MCP / WebMCP / A2A)?
- [ ] **Contract:** Is the agent-facing surface machine-consumable, typed,
  documented, and least-privilege?
- [ ] **Autonomy level (§5):** What level is this, and who is responsible for the
  task at that level?
- [ ] **Observe:** How does a human see what the agent is doing and has done?
  What is logged or traced?
- [ ] **Interpret:** Can a human reconstruct *why* an action was taken?
- [ ] **Interrupt:** What is the stop control, and does stopping leave state
  consistent?
- [ ] **Take over:** Can a human finish or reverse the task manually? Are actions
  reversible or confirmable?
- [ ] **In-the-loop vs on-the-loop:** For each consequential action, which is it,
  and does the blast radius justify the choice?

If any answer is "we don't know yet," that is a planning gap to close before
build — not a detail to discover in production.

## References

**Agentic AI & interoperability**

- Model Context Protocol (MCP) — <https://modelcontextprotocol.io/>
- WebMCP (W3C Web Machine Learning Community Group draft) — <https://webmachinelearning.github.io/webmcp/>
- Agent2Agent (A2A) Protocol — <https://a2a-protocol.org/> · <https://github.com/a2aproject/A2A>

**API-first / machine-consumable design**

- OpenAPI Specification — <https://www.openapis.org/>

**Human oversight & AI governance**

- NIST AI Risk Management Framework — <https://www.nist.gov/itl/ai-risk-management-framework>
- EU AI Act, Article 14 (Human Oversight) — <https://artificialintelligenceact.eu/article/14/>

**Controllability & interruptibility (AI safety)**

- Orseau & Armstrong, *Safely Interruptible Agents* (UAI 2016) — <https://intelligence.org/files/Interruptibility.pdf>

**Levels of autonomy (analogy)**

- SAE J3016 — Levels of Driving Automation — <https://www.sae.org/standards/content/j3016_202104/>

**Observability**

- OpenTelemetry — <https://opentelemetry.io/>

**Related OSBR standards**

- [AI Usage Guideline](/ai-usage-guideline) — the human⇄AI cooperation stance this planning policy makes concrete.
- [API Design Guide](/api-design) — the machine-consumable, contract-first surfaces agents call.
- [Application Security](/application-security) — least-privilege, auditability, and access control for agent-facing surfaces.
- [Design Guidelines](/design-guidelines) — the human-facing legibility that observe and interpret depend on.
- [Quality Gate](/quality-gate) — where unobservable or non-interruptible autonomy is rejected.
- [Development Guide](/development-guide) — how these requirements land as acceptance criteria and design notes.
