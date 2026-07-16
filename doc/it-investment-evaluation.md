# IT Investment Evaluation

This policy defines how OSBR decides whether a piece of work is **worth doing**
before we do it, and how we express that judgement to the client. It sits at the
front of [Planning & Shaping](/development-guide): every proposal is assessed by
its **return to the client's business** — not by how large an order it would be
for us — and that assessment is made *up front*, showing the expected effect and
how certain we are of it. Large investments are **phased into small, verifiable
increments** so the client keeps deciding on evidence, rather than a single big
return being promised once and then hidden.

It builds on two neighbouring standards. [Cost Estimation](/cost-estimation)
puts an honest, ranged number on *what it costs to do the work*;
[Market Research](/market-research) spends a little to *learn whether the thing
is worth building at all*. This policy sits above both and asks the prior
question — **for this client's business, does the return justify the spend, and
how sure are we?** We ground it in named investment-appraisal and value-based
delivery practice rather than house intuition, and right-size it for an SME and
its clients. Deviations are allowed, but — as everywhere in the handbook — they
must be deliberate and justified in the project's design notes.

This is where OSBR's values meet the client's money. **Be Nice**: we put the
client's return ahead of our order size, and recommend the work that serves
their business best even when it bills us less. **Be Kind**: we record the
accepted case and its assumptions so the teammate who inherits the project, and
the client who signed off, are both protected when a plan has to change.
**Be Strong**: we do the honest thinking up front — stating the effect, its
certainty, and what it depends on — instead of dressing work up with an
impressive-looking number.

## How to read this policy

* **Requirement levels** follow RFC 2119, as elsewhere in the handbook.
  **MUST** / **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a
  strong default overridable only with a documented reason. **MAY** marks a
  free choice.
* **Named practice.** Where a rule adopts an industry practice (WSJF, TCO, NPV),
  the practice is named inline and cited under [References](#6-references). We
  adopt the *criteria* of these practices and right-size them for an SME — a
  two-week job does not carry the appraisal apparatus of a six-figure platform
  decision.

[[TOC]]

## 1. Goal

The goal is to ensure that money the client spends with OSBR goes to the work
that returns the most to *their* business, and that the client can **see the
expected return and its certainty before committing** — not discover it
afterwards.

Concretely, every proposal OSBR puts to a client must:

1. **State the expected effect** — what business outcome the investment is
   expected to produce (revenue, cost saved, risk reduced, time returned), not
   just the feature delivered. A feature is a cost; the outcome it enables is
   the return.
2. **State the certainty** — how confident we are in that effect, and what the
   effect depends on. A likely-small win beats a maybe-huge one we cannot stand
   behind.
3. **Be ranked by return to the client, not by size to us.** The proposal that
   bills the most hours is not automatically the one we recommend. Usually it is
   not.
4. **Phase large spend into verifiable increments** — each increment delivering
   value the client can check before funding the next, rather than one lump
   commitment against one distant promised return.

The point is never to make work look impressive. An honest *"this saves roughly
two staff-days a month, we're fairly confident, payback in about a year"* is
worth more than a precise-looking ROI figure nobody can defend.

## 2. Responsibility

- The **proposer** (the engineer or lead scoping the work) frames the work as an
  investment: they name the expected business effect, its certainty, and what it
  depends on. They own that the case is honest and built around *the client's*
  return, not our order size.
- The **reviewer** independently sanity-checks the business case before it
  reaches the client — is the claimed effect real, is the certainty stated
  fairly, is a cheaper increment being skipped? Business cases are reviewed like
  estimates and like code; this is the always-on review the
  [Quality Gate](/quality-gate) requires, applied to the *why* of the work.
- The **project lead** ensures proposals reach the client ranked by client
  return, that large spend is offered as increments, and that the accepted case
  and its assumptions land in the meeting record. They own that we do not
  up-sell scope the client's return does not justify.
- The **whole team** feeds realised outcomes back — did the effect actually
  land? An investment case nobody checks against reality is a sales pitch we
  keep repeating.

A vendor paid by the hour has a standing incentive to grow scope; **Be Nice**
means we reject that incentive on purpose. Recommending work whose return we
could not defend fails Be Nice, and quietly padding scope fails **Be Strong** —
we didn't do the honest thinking.

## 3. Practices

### 3-1. Evaluate every proposal as an investment, up front

- Before work is committed, a proposal **MUST** be expressed as an investment
  case: the **expected business effect**, the **cost to achieve it** (see
  [Cost Estimation](/cost-estimation)), and the **certainty** of the effect.
- The effect **MUST** be stated in the client's terms — money made, money saved,
  risk lowered, time returned — not merely "we will build feature X."
- Certainty **MUST** be stated honestly and, like an estimate, as a **range or
  confidence**, never a single confident figure. A wide, honest range is worth
  more than false precision.
- Where the effect is genuinely unknown, the right first move is often **not** a
  full estimate but a cheap experiment — hand off to
  [Market Research](/market-research) to buy down the uncertainty before quoting
  a large build.

### 3-2. Rank by return to the client, not size to us

- Proposals **MUST** be ordered by their return to the *client's* business, not
  by revenue to OSBR. When a smaller engagement delivers most of the value, we
  say so and recommend it.
- Where value, cost, and urgency can be compared across candidate pieces of
  work, teams **SHOULD** use **Weighted Shortest Job First (WSJF)**: rank by
  *Cost of Delay ÷ job size*, so small high-value work is done first and large
  low-value work is deferred or dropped. WSJF is a deliberate structural counter
  to the "big project first" bias.
- **Cost of Delay** — what it costs the client *per unit time* to not have this
  yet — **SHOULD** be made explicit when sequencing work. Urgent, cheap,
  high-value work goes first; it is often not the largest order.
- We **MUST NOT** recommend a larger or longer engagement than the client's
  return justifies. The vendor incentive to up-sell scope is real, and it is
  named here precisely so that we refuse it.

### 3-3. Use real appraisal numbers, right-sized

Investment appraisal has standard, defensible tools. Use them at a depth that
fits the decision — not to impress, but so the client can compare this spend
against alternatives on the same footing.

- Compare cost against benefit over the asset's life, not just build cost. Where
  it matters, account for **Total Cost of Ownership (TCO)** — build *plus* run,
  maintenance, licences, and eventual replacement — so a cheap-to-build,
  expensive-to-run option is not sold as cheap.
- For investments with a return over time, teams **SHOULD** offer a simple
  **ROI**, a **payback period** (how long until the client is made whole), and,
  where the horizon is long enough to matter, **Net Present Value (NPV)** —
  future returns discounted to today, because money later is worth less than
  money now.
- These figures **MUST** carry their assumptions (discount rate, expected effect
  size, time horizon) exactly as estimates carry theirs. An NPV with a hidden
  discount rate is false precision. Right-size the rigour: a two-week job does
  not need a discounted cash-flow model; a six-figure platform decision does.

### 3-4. Phase large investments into small verifiable increments

Large upfront commitments concentrate risk and let a distant promised return
hide behind a big cheque. We break them up.

- Large investments **MUST** be phased into increments, each delivering value
  the client can **verify before funding the next**. This is **incremental
  funding**: release money in stages against demonstrated results, not one lump
  against one far-off promise.
- Each increment **SHOULD** be framed as a **real option**: the client pays a
  small amount now to keep the *right, but not the obligation,* to continue — and
  can stop, pivot, or expand as evidence arrives. Phasing is what converts an
  all-or-nothing bet into a series of cheap, revocable decisions.
- The expected return of each increment **MUST** be visible, not rolled into an
  opaque total. Hiding the expected return behind a single large number is
  exactly what this policy exists to prevent — it denies the client the
  information they need to stop early.
- Sequence the increments to **attack the riskiest, highest-value part first**
  (this aligns with WSJF in §3-2 and the riskiest-assumption discipline in
  [Market Research](/market-research)), so that if the investment is going to
  fail, it fails cheaply and early.

### 3-5. Value-based delivery, not scope delivery

- Success **MUST** be measured by value delivered to the client's business, not
  by scope shipped or hours billed. A delivered feature nobody uses is a cost
  with no return, and we treat it as such.
- Proposals **SHOULD** name how the expected effect will be *observed* after
  delivery — the signal that will tell us the return actually landed. An
  investment case with no way to check it later is unfalsifiable.
- When realised outcomes come back weaker than the case predicted, that is a
  **learning to feed forward** into the next proposal (§2, whole-team), not
  something to bury. Honest post-hoc review is how our investment cases stay
  trustworthy.

### 3-6. Record the accepted case in the meeting record

- The accepted investment case — its **expected effect**, its **certainty**, its
  **cost basis**, its **increment plan**, and the **assumptions** each rests on —
  **MUST** be captured in the meeting record when agreed with the client,
  alongside the estimate under [Cost Estimation](/cost-estimation).
- What is recorded is the **agreement and its reasoning**, not just a headline
  number. When an assumption breaks or an increment underperforms, the record is
  what makes re-planning fair rather than a dispute over memory. This is the
  **Be Kind** clause — it protects the teammate who inherits the project and the
  client who signed off.

## 4. Anti-patterns

- **Order-size ranking** — recommending the biggest engagement because it bills
  the most, not because it returns the most to the client.
- **Scope up-sell** — padding a proposal with work the client's return does not
  justify, because we are paid by the hour.
- **Hidden return** — one large commitment against one distant promised payoff,
  with the per-increment expected return never broken out, so the client cannot
  stop early.
- **False-precision ROI** — a confident single ROI or NPV figure with its
  discount rate, effect size, and horizon assumptions hidden.
- **Build-cost-only** — quoting build cost as the investment while ignoring run,
  maintenance, and licence cost (TCO).
- **Scope delivered ≠ value delivered** — declaring success because features
  shipped, with no check on whether the business effect landed.

## 5. Related standards

- [Cost Estimation](/cost-estimation) — putting an honest, ranged number on
  *what the work costs*; this policy weighs that cost against the client's
  return.
- [Market Research](/market-research) — spending a little to *learn whether the
  thing is worth building* before a large investment case is built on guesses.
- [Development Guide](/development-guide) — the Planning & Shaping stage this
  policy fronts, and the meeting record the accepted case lands in.
- [Quality Gate](/quality-gate) — the always-on review discipline applied here
  to the business case, not just the code.

## 6. References

Named investment-appraisal and value-based delivery practice this policy is
grounded in.

**Investment appraisal**

- **ROI / Total Cost of Ownership (TCO)** — comparing whole-of-life cost against
  benefit, not build cost alone.
- **Net Present Value (NPV) & payback period** — discounting future returns to
  present value and measuring time-to-recovery; standard capital-budgeting
  appraisal.
- **Business-case discipline** — expressing proposed work as expected benefit
  vs. cost with stated assumptions (the case-driven appraisal tradition; the
  HM Treasury *Green Book* five-case model is a useful reference point,
  right-sized for an SME).

**Value-based sequencing**

- **Weighted Shortest Job First (WSJF)** — rank by Cost of Delay ÷ job size —
  <https://framework.scaledagile.com/wsjf>
- **Cost of Delay** — Donald Reinertsen, *The Principles of Product Development
  Flow* — quantifying the cost per unit time of not having a capability yet.

**Incremental funding / options**

- **Incremental Funding Method (IFM)** — funding software in value-delivering
  increments; Denne & Cleland-Huang, *Software by Numbers*.
- **Real options thinking** — treating each increment as a paid option to
  continue, pivot, or stop as evidence arrives.

**Guarding against the vendor incentive**

- **Value-based delivery over scope delivery** — measuring success by client
  outcome, not hours billed — the deliberate counter to the paid-by-the-hour
  incentive to up-sell scope.
