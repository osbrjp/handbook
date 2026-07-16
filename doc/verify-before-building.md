# Verify Before Building

This is the standard OSBR holds work to when an idea carries real **uncertainty**
before we commit to building it. Where the risk is genuine — will it pay off, is
it what the client actually needs, will people use it, can we even build it — we
do **not** find out by building the whole thing. We find out cheaply, first, with
a small disposable experiment that actually runs, and we make the result visible
to the client.

This standard sits upstream of the [Development Guide](/development-guide): its
**Planning & Shaping** stage governs how verified work is built, while this
standard decides *whether, and in what shape,* to build it at all. The evidence it
produces is what the [Quality Gate](/quality-gate) later leans on — a decision
made on proof rather than opinion. For the investment question — is there a market,
will it pay off — verification overlaps with [Market
Research](/market-research). We lean on named practices the software industry
already trusts — Lean Startup, the XP Spike Solution, Tracer Bullets, Set-Based
design, the Design Sprint, and Working-Backwards — and **right-size them for an SME
and its clients.** Deviations are allowed, but — as everywhere in the handbook —
they must be deliberate and justified in the project's design notes.

Verification is where OSBR's values meet the client's budget. **Be Strong**: it
takes strength to kill your own idea cheaply, before it costs the client — a demo
is not proof, and an opinion is not evidence. **Be Nice**: the client is always
told plainly what is proven and what is still a guess, never sold a settled fact
that is really an assumption. **Be Kind**: spending a client's money on a cheap
test before an expensive build protects the people who trust us — we protect the
client's budget before we protect our own idea.

## How to read this policy

* **Requirement levels** follow RFC 2119, as elsewhere in the handbook. **MUST** /
  **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a strong default
  overridable only with a documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is
  named inline and cited under [References](#references). We adopt the *criteria*
  of these practices and right-size them for a small team and its clients — we do
  not adopt the headcount or ceremony behind their reference setups.

[[TOC]]

## 1. Goal

Spend the smallest amount of money, time, and code needed to turn an unknown into a
known — **before** the expensive commitment, not after it.

- **Kill bad ideas cheaply.** A PoC that fails in three days has saved the client
  three months. That is a success, not a waste.
- **Learn before we scale.** Following the Lean Startup **Build–Measure–Learn**
  loop and its idea of **validated learning** ([Ries, *The Lean
  Startup*](http://theleanstartup.com/principles)), each experiment must answer a
  real question with evidence, not opinion.
- **Attack the risk, not the easy part.** Do the scary, uncertain thing first. The
  **Riskiest Assumption Test (RAT)** ([Gothelf](https://www.jeffgothelf.com/blog/there-is-no-such-thing-as-an-mvp/))
  says: find the single assumption that would sink the project if it's wrong, and
  test *that* — cheaper and earlier than a full MVP.
- **Keep the client's trust.** The client always knows what has been proven and
  what is still a guess.

## 2. Responsibility

- **Everyone proposing work in a high-uncertainty area** is responsible for naming
  the uncertainty *before* estimating or building, and for choosing the cheapest
  experiment that resolves it.
- **The engineer running the experiment** is responsible for keeping it small and
  disposable, and for reporting the honest result — including "it didn't work."
- **The lead / project owner** is responsible for the verified-vs-unverified split
  being visible to the client, and for making the go / no-go / pivot call on the
  evidence.
- **Nobody** is responsible for making an experiment "succeed." An experiment's job
  is to produce a truthful answer, not a green light. This is the **Be Strong**
  duty in practice: the strength to kill your own idea cheaply, before it costs the
  client.

## 3. Practices

### 3-1. Verify the four high-uncertainty areas small, first

Before full development, uncertainty in any of these areas **MUST** be reduced with
a small experiment that actually runs:

| Area | The question | Named test |
| --- | --- | --- |
| **Investment / value** | Is this worth doing? Will it pay off? | Lean Startup MVP, RAT, [Market Research](/market-research) |
| **Requirements** | Is this actually what the client / user needs? | [Working-Backwards PR-FAQ](https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes), Design Sprint |
| **Experience** | Will people understand and use it? | [Design Sprint](https://www.thesprintbook.com/the-design-sprint) prototype + test |
| **Technical feasibility** | Can we build it? Is the approach sound? | XP Spike, Tracer Bullet, walking skeleton |

- You **MUST** be able to state, in one sentence, which of the four you are
  de-risking and what result would change the plan.
- If none of the four is genuinely uncertain, you **SHOULD** skip the experiment
  and just build — this policy is for reducing real risk, not for adding ceremony
  to safe work (§4).

### 3-2. Make it disposable — PoC, prototype, or in-repo lab

The experiment's value is the **learning**, not the code. The code is expected to
be thrown away; the lesson is what survives.

- Technical-feasibility spikes **SHOULD** follow the XP **Spike Solution**
  ([Extreme Programming](http://www.extremeprogramming.org/rules/spike.html)): a
  rough, throwaway program written only to answer a technical question, then
  deleted.
- To validate an idea end-to-end, prefer a **Tracer Bullet** ([*The Pragmatic
  Programmer*](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/))
  or **walking skeleton**: a thin but *real* slice that runs through every layer,
  proving the pieces connect, then thickened later. A tracer bullet is
  production-track and evolves; a spike is scaffolding and is binned — **know which
  one you're firing** and say so.
- Experiments **MUST NOT** be quietly promoted into production. A spike that
  "works" gets rewritten properly; only a deliberate tracer bullet / walking
  skeleton is grown. The temptation to "just keep" spike code is how unverified
  guesses smuggle themselves into production: the spike proved the *what*, it is not
  the *how*.
- Keep experiments in a clearly marked disposable space — a `lab/` or `spike/`
  branch or directory, or a scratch repo — never mixed into the product code as if
  verified. Labs **MAY** live in the repository so the learning is not lost, but
  they **MUST** be marked as labs, and shortcuts **SHOULD** be flagged as such
  (e.g. a `// spike:` comment) so nobody mistakes scaffolding for a decision.

### 3-3. Keep options open until evidence closes them

When several approaches are plausible and the cost of the wrong bet is high, don't
commit to one early.

- Follow **Set-Based** / options thinking (from the [Lean product development
  tradition](https://www.lean.org/lexicon-terms/set-based-concurrent-engineering/)):
  carry two or three candidate approaches far enough to compare on evidence, and
  eliminate the losers as data arrives — rather than picking one upfront and
  discovering its flaws late.
- This **SHOULD** be reserved for genuinely high-stakes, hard-to-reverse decisions.
  For everyday reversible choices, pick one and move — carrying options has a cost
  too.

### 3-4. Time-box and write down the question

- Every experiment **MUST** be **time-boxed** (hours or a few days) with a written
  question and a written "what result changes our decision." An open-ended "let's
  explore" is not an experiment.
- When it ends, record the answer and the decision it drove — **go**, **no-go**, or
  **pivot** — even (especially) when the answer is "no." A killed idea with a
  recorded reason is a deliverable.

### 3-5. Make verified-vs-unverified visible to the client

Transparency to clients is an OSBR commitment, and it applies to certainty as much
as to progress. This is the **Be Nice** and **Be Kind** rule in one: being honest
about what's still a guess, and spending the client's money on a cheap test before
an expensive build, is thinking wholeheartedly about the people who trust us.

- The client **MUST** always be able to see what has been **verified by evidence**
  versus what is still an **assumption**. Never present an unproven guess as a
  settled fact.
- For requirements and scope, you **SHOULD** use an [Amazon-style
  **Working-Backwards PR-FAQ**](https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes)
  — write the "press release" and FAQ for the finished feature *before* building —
  to surface, with the client, what everyone is actually assuming about value and
  need.
- Frame experiment results to the client as **de-risking**: "we spent 2 days to
  avoid a 2-month bet." A cheaply-killed idea is a win you share, not a failure you
  hide.
- Prefer to show the client **a working thing over a list of past work.** A running
  slice that proves *this* idea is stronger evidence than a portfolio of what we
  built before — the same reasoning the handbook makes explicit in [Capability Over
  Track Record](/capability-over-track-record).

## 4. When this policy does *not* apply

Verification is for reducing **real** uncertainty. Don't turn it into ritual.

- **Well-understood, low-risk work:** just build it. Do not manufacture a "spike"
  for something the team has done ten times.
- **Reversible decisions:** if a wrong choice is cheap to undo, undoing it later
  can be cheaper than testing it now.
- **The experiment costs as much as the real thing:** if the only honest test *is*
  building it, build the thinnest real version (a walking skeleton, §3-2) and treat
  that as the experiment.

## References

Named industry practices this policy draws on, chosen because they are widely
documented and adoptable by a small team.

**Validate the idea (investment, requirements, experience)**

- Lean Startup — Build-Measure-Learn, MVP, validated learning — <http://theleanstartup.com/principles>
- Riskiest Assumption Test (RAT) — <https://www.jeffgothelf.com/blog/there-is-no-such-thing-as-an-mvp/>
- Working-Backwards (PR-FAQ) — <https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes>
- Design Sprint — <https://www.thesprintbook.com/the-design-sprint>

**De-risk the build (technical feasibility)**

- XP Spike Solution — <http://www.extremeprogramming.org/rules/spike.html>
- Tracer Bullets — *The Pragmatic Programmer* — <https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/>
- Set-Based Concurrent Engineering (options thinking) — <https://www.lean.org/lexicon-terms/set-based-concurrent-engineering/>

**Related OSBR standards**

- [Development Guide](/development-guide) — the Planning & Shaping stage verified work enters, and the standard workflow after.
- [Quality Gate](/quality-gate) — the decision lens that leans on the evidence this policy produces.
- [Capability Over Track Record](/capability-over-track-record) — why a working thing beats a list of past work.
- [Market Research](/market-research) — validating the investment / value question this policy de-risks.
