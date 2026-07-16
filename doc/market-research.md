# Market Research

This policy defines what OSBR does **before** it takes a single requirement from
a client. We proactively study the client's industry, its market structure, and
the actual work people do inside it — so that when we finally sit down to gather
requirements, we already speak the field's language and understand the business
the software has to serve. It sits at the front of the [Development
Guide](/development-guide)'s Planning & Shaping work: this policy is about
understanding the problem, so that everything downstream is about building the
right solution.

We do not treat the client's stated request as the specification. A stated
request is a **symptom and a hypothesis** — evidence about a deeper business
need, not the need itself. Serving the client well is **Be Nice** and **Be
Kind**: we serve the real need, even when it differs from the literal ask. Doing
that takes **Be Strong** — the discipline to research before building, and the
honesty to tell a client that their stated solution is not the one their
business needs.

## How to read this policy

* **Requirement levels** follow RFC 2119. **MUST** / **MUST NOT** are absolute.
  **SHOULD** / **SHOULD NOT** state a strong default overridable only with a
  documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is
  named inline and cited under [References](#references). We adopt the *criteria*
  of each practice and right-size it for an SME engagement — we do not import the
  headcount or ceremony of the reference material.

[[TOC]]

## 1. Goal

The goal of market research at OSBR is to **enter every engagement already fluent
in the client's world**, so that requirements-gathering refines a shared
understanding instead of starting from zero. Concretely, before requirements are
taken we aim to know:

- **The industry** — how this sector makes money, who the players are, and what
  forces shape it. We use Porter's Five Forces and the value chain as the lens
  for market structure: suppliers, buyers, substitutes, new entrants, rivalry,
  and where value is actually added along the chain. Software that ignores this
  optimises the wrong link.
- **The real workflows and pain points** — what people actually do all day, in
  their real context, versus the idealised process on the org chart. This is
  grounded in contextual inquiry and the broader UX-research practice.
- **The job to be done** — the progress the client and their users are trying to
  make, independent of any particular solution. *People don't want a
  quarter-inch drill; they want a quarter-inch hole.*
- **The field's own language** — the exact terms, units, artefacts, and
  edge-cases practitioners use, captured verbatim as the raw material for the
  project's [domain terminology](/domain-terminology).

The output of this phase is not a signed spec. It is a **shared, evidence-based
understanding of the client's business** that de-risks everything downstream —
because most expensive project failures are failures of understanding the
problem, not of building the solution.

## 2. Responsibility

Whoever leads an engagement owns this research. It is not optional homework, and
it is not the client's job to spoon-feed us.

- The engagement lead **MUST** complete a market-and-workflow survey before the
  first formal requirements session, and record it where the whole team — human
  and AI — can read it.
- We **MUST NOT** take a stated request at face value as the specification. Every
  stated request is logged together with the **underlying job** it is trying to
  satisfy, and the two are tracked separately.
- We **MUST** bring the field's own terminology back into the project as
  candidate terms for its [domain terminology](/domain-terminology) — not
  paraphrased into our own words, which quietly discards meaning.
- We **MUST** be honest and kind when research contradicts the client's stated
  solution: surface the gap early, with evidence, framed as service to their
  business — not as being clever at their expense. This is **Be Nice** and **Be
  Kind** expressed as professional courage (**Be Strong**), not as quiet
  compliance.
- This work is a **human ⇄ AI collaboration**. AI agents fan out the desk
  research, structure findings, and draft the domain glossary at speed; humans
  own the field contact, judgement, and the relationship with the client.
  Neither half is optional.

## 3. Practices

### 3-1. Desk research first — industry and market structure

Before talking to anyone, build a map of the sector.

- **MUST** analyse market structure with **Porter's Five Forces and the value
  chain**: who the client's suppliers, buyers, substitutes, and rivals are, and
  where in the value chain the client actually captures value.
- **SHOULD** identify the incumbents, their products, and the standard tools
  practitioners already use — the software we build competes with, or must
  interoperate with, these.
- **SHOULD** collect the industry's regulations, standards bodies, and compliance
  constraints as first-class inputs, not late surprises.

### 3-2. Study the real work, in context

Idealised process diagrams lie; watch the actual work.

- **SHOULD** run lightweight **contextual inquiry** — observe real users doing
  real tasks in their real environment, and let them teach you (the
  master/apprentice stance) rather than interviewing them in a meeting room.
- **MUST** capture the pain points, workarounds, and **shadow processes** — the
  private spreadsheets and side-channels people have built to survive the current
  process. These are the sharpest signal of unmet need.
- **SHOULD** choose research methods deliberately from the established
  UX-research menu (interviews, field studies, diary studies, surveys) —
  attitudinal versus behavioural, qualitative versus quantitative — matching the
  method to the question.

### 3-3. Frame needs as jobs, not features

- **MUST** express each finding as a **Job-To-Be-Done**: *"When [situation], I
  want to [motivation], so I can [expected outcome]."* This separates the durable
  need from the disposable solution the client happened to ask for.
- **SHOULD** trace every stated request down to the job beneath it, and validate
  that job with evidence from §3-1 and §3-2 before it becomes a requirement. A
  request is a hypothesis; the job is what we are actually serving.

### 3-4. Harvest the field's language

- **MUST** record domain terms **verbatim**, with the practitioner's own
  definition, units, and edge-cases — the seed of the project's [domain
  terminology](/domain-terminology). One term, one meaning, used identically by
  code, docs, and client.
- **SHOULD** run collaborative discovery — **Event Storming** or example mapping
  — with the client's domain experts to surface the events, commands, and
  boundaries in their own words. This doubles as the first draft of the domain
  model.
- **MUST** treat conflicts and synonyms in the terminology as findings, not
  noise: two words for one thing (or one word for two) usually marks a boundary
  between sub-domains.

### 3-5. Run a structured discovery, not an ad-hoc chat

Use a named inception format so nothing is skipped and the client is a
participant, not a spectator.

- **SHOULD** adopt one of the established discovery frameworks and right-size it:
  - **Lean Inception** — a week-shaped sequence for aligning on the product's
    vision, personas, and a lean MVP.
  - **Design Sprint** — a time-boxed map → sketch → decide → prototype → test
    loop when the problem space is genuinely uncertain.
  - **Working Backwards (PR-FAQ)** — draft the future press release and customer
    FAQ *first*, forcing clarity on the customer benefit before any building.
- **MUST** produce, from whichever format is used, an artefact that states the
  customer, the job, and the expected outcome in the client's own language —
  reviewable by the client and by AI agents downstream.

### 3-6. Feed research into requirements, then keep it honest

- **MUST** hand the survey, the JTBD list, and the draft domain glossary into the
  requirements phase as its starting inputs — requirements refine this
  understanding, they do not replace it. This is the understanding the [Quality
  Gate](/quality-gate) later holds the delivered work against: a solution can
  only be judged fit if the problem it serves was understood first.
- **SHOULD** revisit the research when reality contradicts it; a survey that is
  never updated becomes a comfortable fiction. As in
  [Verify Before Building](/verify-before-building), verify against ground truth —
  the field, the data, the client's actual numbers — not against our earlier
  assumptions.

The lazy version of this phase is to write down the client's request and start
coding. It feels efficient and it is the most common way projects fail.
Researching first, and telling a client the honest result even when it is not
what they asked for, is **Be Strong** in service of **Be Nice** and **Be Kind**:
we protect the client's business, not just our own comfort.

## References

Named practice this policy draws on, chosen because each is publicly documented
and adoptable by a small team.

**Market structure**

- Michael Porter, "How Competitive Forces Shape Strategy" (Five Forces, value chain), HBR — <https://hbr.org/1979/03/how-competitive-forces-shape-strategy>

**Customer need & jobs**

- Clayton Christensen et al., "Know Your Customers' Jobs to Be Done", HBR — <https://hbr.org/2016/09/know-your-customers-jobs-to-be-done>

**User & market research**

- Nielsen Norman Group, "Which UX Research Methods?" — <https://www.nngroup.com/articles/which-ux-research-methods/>
- Beyer & Holtzblatt, *Contextual Design* (contextual inquiry) — <https://www.sciencedirect.com/book/9780123044518/contextual-design>

**Domain discovery & language**

- Eric Evans, *Domain-Driven Design Reference* (ubiquitous language) — <https://www.domainlanguage.com/ddd/reference/>
- Alberto Brandolini, Event Storming — <https://www.eventstorming.com/>

**Discovery & inception formats**

- ThoughtWorks / Martin Fowler, "Lean Inception" — <https://martinfowler.com/articles/lean-inception/>
- Google Ventures, Design Sprint — <https://www.gv.com/sprint/>
- Amazon, "Working Backwards" (PR-FAQ) — <https://www.aboutamazon.com/news/workplace/an-insiders-guide-to-working-backwards>

**Related OSBR standards**

- [Development Guide](/development-guide) — the Planning & Shaping work this research feeds.
- [Domain Terminology](/domain-terminology) — where the field's harvested language becomes the project's ubiquitous language.
- [Quality Gate](/quality-gate) — the gate that judges whether the delivered solution serves the understood problem.
- [Verify Before Building](/verify-before-building) — verifying against ground truth rather than earlier assumptions.
