# Requirements Modeling

This is the standard the [Development Guide](/development-guide)'s **Planning &
Shaping** stage holds requirements analysis to. It sets one rule and builds the
practice around it: **analysis MUST produce an explicit, diagrammed model of the
problem before anyone reaches for screens, tables, or code.** Screens and
schemas are consequences of the model, not substitutes for it. The model this
policy produces is what later becomes concrete in the [Architecture
Standards](/architecture-standards), and its vocabulary is the same [Domain
Terminology](/domain-terminology) the code and the client speak. Deviations are
allowed, but — as everywhere in the handbook — they must be deliberate and
justified in the project's design notes.

We do not invent a modeling method of our own. We stand on named, published
practice — Domain-Driven Design, the C4 model, BPMN, UML/ER, and Event Storming
— and right-size each for an SME, the same way our infrastructure guidance
right-sizes the cloud Well-Architected frameworks. We adopt the *criteria* of
these practices, not the headcount behind their reference setups.

Modeling is where OSBR's values become visible before a line is written. **Be
Nice**: a shared model makes our reasoning legible to collaborators — human and
AI — instead of hoarding it in one person's head. **Be Kind**: writing the
picture down once spares every future reader — the next developer, the client
six months on, the agent picking up a ticket — from reverse-engineering intent
from table names and screens. **Be Strong**: we refuse the false speed of coding
before we understand, because a disagreement caught as a diagram edit is
cheaper than the same disagreement caught three weeks into build. Humans and AI
agents model here as collaborators, against the same shared picture.

## How to read this policy

* **Requirement levels** follow RFC 2119, as in the rest of the handbook.
  **MUST** / **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a
  strong default overridable only with a documented reason. **MAY** marks a free
  choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is
  named inline and cited under [References](#references). Reach for the lightest
  notation that makes the requirement unambiguous — formality serves clarity,
  never the reverse.

[[TOC]]

## 1. Goal

The goal of requirements analysis is **one agreed picture of the problem** —
shared by client, developers, and AI agents — before implementation begins.

A model is that picture. It names the stakeholders, the events that happen in
their world, the systems involved, the data that flows, what people actually
demand, where it hurts today, and how we intend to relieve it. When this picture
exists and everyone can point at it, disagreements surface as diagram edits
instead of as rework deep into build. A model that documents a solution without
ever stating the problem it fixes is the exact failure mode this policy prevents
(§4).

## 2. Responsibility

Whoever picks up requirements analysis for a project owns the model. Concretely,
that person or pair MUST:

- Produce the model **before** proposing screens, database tables, or code.
- Keep the model **in the repository**, as text, reviewed alongside code (§3-6).
- **Return to the model on every change.** When a requirement shifts, the model
  is updated first and the code follows — never the reverse. A change that lands
  in code but not in the model has desynchronised the shared picture, which is a
  defect (§3-7).
- Use the shared [Domain Terminology](/domain-terminology) (§3-1) in the model,
  the code, and conversation with the client — the same word for the same thing,
  everywhere.

This is not a hand-off to a separate "analyst" role. In a small team the person
who will build it is usually the person who models it; that is deliberate,
because modeling is how you understand what you are about to build. The reviewer
treats the model as part of the reviewable surface, exactly as the [Quality
Gate](/quality-gate)'s AI code review treats the code.

## 3. Practices

### 3-1. Establish a ubiquitous language first

Before drawing anything, agree on the words. **Domain-Driven Design** (Eric
Evans) calls this the **ubiquitous language**: a single vocabulary, drawn from
the business domain, used identically by domain experts, developers, code, and
diagrams.

- The team MUST maintain a short glossary of domain terms as part of the model —
  this is the project's [Domain Terminology](/domain-terminology).
- Code, diagrams, and client conversation MUST use those exact terms. If the
  client says "consignment", the class is not `Order`.
- When a term is ambiguous, that ambiguity is a finding: it usually means two
  concepts are hiding under one word, or one concept under two words.

Every diagram that follows is only as clear as the words on it. Nail the language
and the models label themselves; skip it and every diagram needs a translator.

### 3-2. Discover the domain with Event Storming

To *find* the model — not just document one you already assume — OSBR's default
discovery technique is **Event Storming** (Alberto Brandolini). It is a fast,
low-tech workshop that maps a business process as a timeline of **domain events**
(things that happened, past tense: "Order Placed", "Payment Captured"), then
layers on the commands, actors, systems, and — critically — the **pain points and
hotspots** where the process breaks down.

- For any non-trivial new feature or project, the team SHOULD run an Event
  Storming pass with the client or domain expert before modeling structure. This
  builds directly on the business understanding gathered during [Market
  Research](/market-research).
- The output MUST be captured in the repo as a model (a Mermaid timeline or flow
  is fine — see §3-6), not left on a physical wall or in a photo.
- Hotspots discovered in the storm map directly onto the **demands** and **pain
  points** the model must record (§4).

Event Storming is where stakeholders, events, and pain points enter the model.
The later techniques give that raw discovery its structure.

### 3-3. Draw boundaries: bounded contexts and context maps

DDD's second big idea is that a large domain is not one model but several. A
**bounded context** is a boundary within which the ubiquitous language is
consistent; a **context map** shows how those contexts relate and integrate.

- Where the domain is large enough that one word means different things in
  different areas (a `Customer` in billing vs. in support), the team MUST split
  it into bounded contexts rather than force one bloated model.
- The relationships between contexts SHOULD be drawn as a context map, using the
  DDD-crew Context Mapping patterns (Customer/Supplier, Anticorruption Layer,
  Shared Kernel, and so on).
- Within a context, group entities into **aggregates** (a consistency boundary
  with one root) so invariants have a clear owner — this is what later drives
  transaction and table design in the [Architecture
  Standards](/architecture-standards).

### 3-4. Model the systems and structure with C4

For the *systems* dimension — what software exists and how it fits together —
OSBR uses the **C4 model** (Simon Brown). C4 gives a small, fixed set of zoom
levels so a diagram's altitude is never ambiguous:

| Level | Answers | Use when |
| ----- | ------- | -------- |
| 1. System Context | Who uses it, what other systems it talks to | Almost always — the one-picture overview |
| 2. Container | The deployable/runnable pieces (apps, DBs, workers) and their tech | Planning the build; feeds the [Architecture Standards](/architecture-standards) |
| 3. Component | Major building blocks inside a container | Only where a container is complex enough to warrant it |
| 4. Code | Classes / schema | Rarely by hand — generate it if you need it |

- Every project MUST have at least a **System Context** and a **Container**
  diagram in the repo.
- Do not draw Component or Code diagrams speculatively — draw them only where the
  structure is genuinely hard to hold in your head. Levels 1–2 earn their keep;
  3–4 usually do not.

### 3-5. Model processes with BPMN, data with UML/ER

Use the notation that fits the dimension, rather than forcing everything into one
diagram type:

- **Processes and workflows** — where the requirement is a business process with
  steps, decisions, and hand-offs (approvals, onboarding, order fulfilment),
  model it with **BPMN 2.0** (an OMG standard). Mermaid's flowchart and sequence
  diagrams cover the common cases as diagram-as-code.
- **Data and relationships** — model entities and their relationships with an
  **ER diagram**, and use **UML** class / sequence / state diagrams (OMG) where
  object structure or lifecycle needs to be explicit. These are what later become
  the relational schema in the [Architecture
  Standards](/architecture-standards) — the ER model is drawn *before* the
  `CREATE TABLE`, not derived after it.

Reach for the lightest notation that makes the requirement unambiguous. A
three-box Mermaid flowchart the client understands beats a formally perfect BPMN
diagram nobody reads. Formality serves clarity; when it stops doing so, stop.

### 3-6. Keep the model in the repo as diagram-as-code

This is the practice that makes all the others stick: **models MUST live in the
repository as text, not as images or in an external drawing tool.**

- Use **Mermaid** as the default diagram-as-code format. It renders natively in
  GitHub, in our handbook, and in most editors, so a diagram is reviewable in a
  pull request like any other change.
- Prefer text-based models (Mermaid, PlantUML, or C4-as-code) over binary exports
  from a GUI tool. A `.png` from a drawing app cannot be diffed, reviewed
  line-by-line, or updated by an AI agent; a Mermaid block can.
- Because the model is text in the repo, **model changes go through the same
  review as code** — and a pull request that changes behaviour SHOULD update the
  model in the same PR.

A diagram-as-code model is diffable, mergeable, greppable, and editable by both
humans and AI agents. That is the whole point: the shared picture stays live and
in-sync because it is version-controlled next to the thing it describes, not
rotting in a wiki or a kickoff slide.

### 3-7. Return to the model on every change

The model is not a phase you finish and leave behind — it is the **living
reference you return to**. The model leads, the implementation follows.

- On any requirement change, update the model **first**, review it, then change
  the code to match.
- Treat model/code drift as a bug. If the code does something the model does not
  show, one of them is wrong — reconcile before shipping.
- Periodically — at minimum, at the start of any significant new work in an area
  — re-read the model to confirm it still matches reality, and correct it if the
  domain has moved.

## 4. What the model must capture

Regardless of notation, the model for a project MUST make all of the following
explicit and locatable in the repo. These seven elements are the concerns the
analysis exists to surface:

| Element | What it records | Typical notation |
| ------- | --------------- | ---------------- |
| **Stakeholders** | Who uses or is affected by the system; their roles and goals | C4 actors, Event Storming actors |
| **Events** | The things that happen in the domain, over time | Event Storming timeline, sequence / state diagrams |
| **Systems** | The software and external systems involved, and how they connect | C4 System Context / Container |
| **Data** | Entities, their attributes, and their relationships | ER diagram, UML class diagram |
| **Demands** | What stakeholders actually need the system to do (functional intent) | Event Storming commands |
| **Pain points** | Where the current situation or process hurts today | Event Storming hotspots |
| **Solutions** | How the proposed design relieves each pain point and meets each demand | Annotated on the models above |

A model that shows systems and data but never names the pain points it exists to
fix is incomplete — it has documented a solution without stating the problem.
**Be Strong** here means holding the line: no model is done until all seven are
present and point at each other.

## References

Named, published practice this policy is grounded in — chosen because each is a
documented industry standard an SME can adopt directly.

**Domain-Driven Design**

- Eric Evans — *Domain-Driven Design: Tackling Complexity in the Heart of Software* — <https://www.domainlanguage.com/ddd/>
- DDD-crew — Context Mapping patterns — <https://github.com/ddd-crew/context-mapping>

**Collaborative discovery**

- Alberto Brandolini — Event Storming — <https://www.eventstorming.com/> · *Introducing EventStorming* — <https://leanpub.com/introducing_eventstorming>

**Architecture / systems modeling**

- Simon Brown — The C4 model for visualising software architecture — <https://c4model.com/>

**Standard notations**

- OMG — Business Process Model and Notation (BPMN) 2.0 — <https://www.omg.org/spec/BPMN/>
- OMG — Unified Modeling Language (UML) — <https://www.omg.org/spec/UML/>

**Diagram-as-code**

- Mermaid — text-based diagramming — <https://mermaid.js.org/>

**Related OSBR standards**

- [Development Guide](/development-guide) — the Planning & Shaping stage this standard serves.
- [Quality Gate](/quality-gate) — the AI code review the model is part of.
- [Architecture Standards](/architecture-standards) — where the C4 Container, aggregate, and ER models become concrete.
- [Domain Terminology](/domain-terminology) — the ubiquitous language the model, code, and client share.
- [Market Research](/market-research) — the business understanding Event Storming builds on.
