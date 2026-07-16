# Cost Estimation

This is the standard OSBR holds its cost and effort estimates to: how we
produce them, how we express them, and how we record them. It sits next to the
[Development Guide](/development-guide)'s Planning & Shaping work and the [IT
Investment Evaluation](/it-investment-evaluation) guide — those describe how we
shape work and judge whether it is worth doing; this describes *how we put a
number on doing it*, and how honest that number is allowed to be. Estimates are
part of the reviewable surface the [Quality Gate](/quality-gate) holds work to,
not a private guess that skips review.

An estimate is a communication to the client that serves a decision — go/no-go,
scope trade-off, sequencing, budget approval — not a promise extracted from us.
A number with no traceable reasoning behind it, or a single figure that hides
how little we know, is not honest work. It fails **Be Nice** (we set the client
up to be surprised), **Be Kind** (we let a teammate inherit a commitment nobody
could keep), and **Be Strong** (we did not do the hard thinking). Humans and AI
agents estimate here as collaborators — and that partnership carries a specific
hazard this policy names head-on (§3-4).

## How to read this policy

* **Requirement levels** follow RFC 2119. **MUST** / **MUST NOT** are absolute.
  **SHOULD** / **SHOULD NOT** state a strong default overridable only with a
  documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts a published estimation practice, the
  practice is named inline and cited under [References](#references) — chiefly
  Steve McConnell's *Software Estimation: Demystifying the Black Art*. We adopt
  the *criteria* of these practices and right-size them for an SME. Deviations
  are allowed but must be deliberate and justified in the project's design notes
  and the meeting record.

[[TOC]]

## 1. Goal

Produce estimates a client can trust *because* they can see the reasoning, and
that a team can be held to *because* the uncertainty in them was stated up front
rather than discovered later. Concretely, every OSBR estimate must:

1. **Carry a traceable breakdown** — a reader can see what tasks the number is
   composed of, not just the total.
2. **State scope explicitly** — what is included, and just as importantly what is
   *excluded*.
3. **Express uncertainty as a range**, never a single figure presented as fact.
4. **Budget for AI-productivity variance** — the same task costs very differently
   with and without agent scaffolding, and the estimate must say which world it
   assumes.
5. **Be recorded in the meeting record** as an agreement, with its assumptions
   attached.

The point is never false precision. "Seven days" is a worse answer than "five to
twelve days, most likely eight, assuming X" — because the second one is true.

## 2. Responsibility

- The **estimator** (the engineer scoping the work) builds the breakdown, states
  the assumptions and scope boundaries, gives a range rather than a point, and
  flags which AI-scaffolding assumption applies. They own the honesty of the
  number.
- The **reviewer** (a second engineer) sanity-checks the breakdown and the range
  independently before it reaches the client. Estimates are reviewed like code —
  the same AI code review the [Quality Gate](/quality-gate) requires.
- The **project lead** ensures the estimate reaches the client as a range with
  its assumptions intact, and that the agreement and its assumptions land in the
  meeting record. They own that we do not quietly collapse the range to its low
  end under pressure.
- The **whole team** feeds actuals back so future estimates improve. An estimate
  nobody checks against reality is a guess we keep repeating.

## 3. Practices

### 3-1. Every estimate carries a traceable breakdown

- Estimates **MUST** be built **bottom-up** where the work is understood:
  decompose into tasks small enough to reason about (McConnell's guidance: aim
  for pieces of roughly 1–3 days). Decomposition itself reduces error, because
  independent over- and under-estimates partially cancel.
- Where the work is *not* yet understood well enough to decompose, use
  **analogous estimation** — size it against a comparable past OSBR project — and
  **say so**. An analogous estimate is a legitimate early-phase tool; passing one
  off as if it were bottom-up is not.
- The breakdown **MUST** be preserved, not discarded once a total is reached. The
  client — and the next engineer — is entitled to see the parts.
- A bare total with no visible composition **MUST NOT** be sent to a client.

### 3-2. Scope inclusions and exclusions are explicit

- Every estimate **MUST** list what it **includes** and what it **excludes**.
  Silent scope is the single largest source of estimate disputes.
- Common exclusions to state explicitly when they apply: data migration,
  third-party integration work, content population, non-functional hardening,
  infrastructure provisioning, client-side review cycles, and post-launch
  support.
- Assumptions **MUST** be written down beside the estimate — this is the
  *explicit-assumptions discipline*. Every "we assume the API is documented / the
  design is final / the client provides X by date Y" is a load-bearing condition.
  When an assumption breaks, the estimate is void and is re-quoted; that is the
  deal, and stating the assumption up front is what makes re-quoting fair rather
  than a fight.

### 3-3. Uncertainty is expressed as a range, not a single figure

- Estimates **MUST** be given as a **range** (low–high), not a single number. A
  single number is a claim to knowledge we do not have.
- The width of the range **MUST** reflect where we are on the **Cone of
  Uncertainty** (McConnell): early in a project, estimates are legitimately off
  by a factor of several in either direction; that spread narrows only as real
  decisions are made and unknowns are closed. Early estimates therefore carry
  *wide* ranges, and narrowing the cone is earned by doing the discovery work,
  not by wishful confidence.
- For individual tasks with real uncertainty, use **three-point / PERT
  estimation**: capture optimistic (O), most-likely (M), and pessimistic (P); the
  expected value is `(O + 4M + P) / 6` and the spread `(P − O) / 6` gives a usable
  sense of the risk on that task. Summing PERT expected values across a breakdown
  gives a defensible project figure with a defensible spread.
- For whole-project figures, prefer **reference-class forecasting** over pure
  bottom-up when comparable past projects exist: anchor on what *similar OSBR
  projects actually cost*, then adjust. This counters the optimism bias and
  planning fallacy that make inside-view bottom-up estimates systematically too
  low.
- Presenting a range's low end alone, or averaging a range down to one number to
  "look competitive," manufactures a surprise for the client later. That is a
  violation of **Be Nice**, and we **MUST NOT** do it.

### 3-4. Budget for AI-productivity variance

AI coding agents change task cost dramatically — but *unevenly*, and mostly as a
function of whether the ground is prepared. This variance is a first-class term
in our estimates, not a footnote.

- An estimate **MUST** state which world it assumes: **scaffolded** (agent-ready
  — clear specs, existing patterns to follow, good test coverage, tight feedback
  loops, established conventions in the repo) or **unscaffolded** (greenfield
  ambiguity, no tests to check against, a novel domain, poor or absent
  conventions).
- **Scaffolded work SHOULD be estimated lower**, reflecting realistic agent
  leverage — but the range **MUST** still be a range, because agent output on a
  bad day still needs human correction.
- **Unscaffolded work MUST NOT claim the scaffolded speed-up.** The agent
  productivity gain is real where the scaffolding exists and largely absent where
  it does not; assuming the best case on unprepared ground is exactly the
  optimism bias §3-3 warns against.
- Where scaffolding *could* be built first (writing the specs, the tests, the
  conventions) and would move the work into the cheaper world, the estimate
  **SHOULD** surface that as an explicit option with its own cost — "N days
  as-is, or M days to scaffold + cheaper thereafter." That is a real decision the
  client is entitled to make.
- The AI-productivity assumption is itself an assumption under §3-2 and **MUST**
  be recorded as one.

### 3-5. Choose the method to fit what is known

- **Bottom-up** when the work is decomposable and understood (§3-1) — most
  accurate, most effort.
- **Analogous** when it is not yet, early in a project — fast, coarse, honest
  about being coarse.
- **Reference-class** when comparable past projects exist — the strongest defence
  against optimism bias at the whole-project level (§3-3).
- Use more than one method when the stakes justify it, and **compare**:
  convergent estimates raise confidence; divergent estimates have found a hidden
  assumption worth chasing before quoting.

### 3-6. Story points, #NoEstimates, and where they fit

- For **internal iteration planning**, teams **MAY** use relative **story
  points** and velocity to forecast sprint throughput. Points measure relative
  size for flow forecasting; they are an internal planning aid.
- Story points **MUST NOT** be handed to a client as a cost. Clients decide in
  time and money, not in a relative unit only meaningful inside one team's
  velocity.
- The **#NoEstimates** argument — that fine-grained upfront estimation is often
  waste, and that slicing work small and shipping continuously forecasts better
  than estimating — is a legitimate influence on *how we work* (thin vertical
  slices, frequent delivery, empirical forecasting from actuals). But OSBR
  clients contract for scope against budget, so a defensible **range-based
  estimate with stated assumptions remains required** for client-facing
  commitments. We take #NoEstimates' discipline without dropping the client's
  right to a bounded number.

### 3-7. Record the agreement in the meeting record

- The agreed estimate — its **range**, its **breakdown**, its **scope
  inclusions/exclusions**, its **assumptions** (including the AI-scaffolding
  assumption), and the **method** used — **MUST** be captured in the meeting
  record when it is agreed with the client.
- What is recorded is the **agreement**, not a single negotiated-down number
  stripped of its conditions. If the range narrowed or scope changed in the
  meeting, the record reflects *why*.
- When an assumption later breaks, the meeting record is what makes re-quoting
  straightforward and fair rather than a dispute over memory. This is the **Be
  Kind** clause: it protects the teammate who inherits the project and the client
  who signed off.
- Estimates **SHOULD** be revisited as the Cone of Uncertainty narrows; a
  materially updated estimate is a new agreement and is recorded as one.

## 4. Anti-patterns

- **False precision** — "12.5 days." Presenting a single figure as if the
  uncertainty were resolved. Give the range.
- **Silent scope** — a number with no stated inclusions/exclusions. Disputes live
  here.
- **Ranges quoted at the low end** — sending "5 days" from a "5–12 day" estimate
  to win the work. Dishonest by omission.
- **Best-case AI assumption on unprepared ground** — claiming agent speed-ups for
  unscaffolded, ambiguous work.
- **Inside-view optimism** — bottom-up summing with no reference-class sanity
  check on a project type we have history for.
- **Estimate as commitment** — treating an early, wide-cone estimate as a fixed
  promise, then blaming the team when reality lands inside the range we stated.

## References

**Core**

- Steve McConnell, *Software Estimation: Demystifying the Black Art* (Microsoft
  Press, 2006) — Cone of Uncertainty, decomposition, estimate-vs-commitment,
  method selection.

**Techniques**

- Three-point / **PERT** estimation — expected value `(O + 4M + P)/6`, spread
  `(P − O)/6` (Program Evaluation and Review Technique).
- **Range estimation** — expressing estimates as intervals that reflect position
  on the Cone of Uncertainty.
- **Reference-class forecasting** — the outside-view corrective to optimism bias:
  Daniel Kahneman, *Thinking, Fast and Slow* (2011); Bent Flyvbjerg on the
  planning fallacy and outside-view forecasting.
- **Bottom-up vs analogous estimation** — decomposition vs comparison-to-past-
  project methods (McConnell, above).
- **Explicit-assumptions discipline** — assumptions recorded beside the estimate
  as the basis for re-quoting when they break.

**Agile / debate**

- **Story points & velocity** — relative sizing for empirical iteration
  forecasting.
- **#NoEstimates** — Vasco Duarte and others; the argument for small slices and
  forecasting from actuals over fine-grained upfront estimation.

**Related OSBR standards**

- [Development Guide](/development-guide) — Planning & Shaping, iteration cadence
  that internal forecasting feeds.
- [IT Investment Evaluation](/it-investment-evaluation) — judging whether the
  work an estimate prices is worth doing.
- [Quality Gate](/quality-gate) — the AI code review that estimates, like code,
  pass through.
