# Overnight AI Operation

This policy defines how an OSBR developer shapes the workday so that AI agents can
run **unattended overnight** on well-specified work, and how the human **judges the
results in the morning**. It is the working expression of the human ⇄ AI cooperation
the [AI Usage Guideline](/ai-usage-guideline) sets out: **the AI works the night, the
human owns the judgment.** It complements the [Development Guide](/development-guide)
(how we ship) and the [CI/CD Pipeline](/ci-cd-pipeline) (how the running system is
delivered and measured); this describes *how a person hands work to an agent and takes
it back.* Deviations are allowed, but — as everywhere in the handbook — they must be
deliberate and justified in the project's design notes.

The core discipline is simple and non-negotiable: **AI runs on rails you laid in
daylight, and nothing it produced is trusted until a human has looked.** There is no
blank cheque. Overnight autonomy is *earned* by the quality of the ticket, and
*checked* every morning on return.

This is where OSBR's values become a daily rhythm. **Be Nice**: leave the agent — and
your morning self — a clean, answerable brief, because a ticket is the clearest
instruction a collaborator will read. **Be Kind**: never let unverified machine output
reach a teammate or a client; the review you owe them is a duty, not a preference. **Be
Strong**: do the hard specification work up front, in daylight, instead of leaving the
agent to flail against ambiguity in the dark.

[[TOC]]

## 1. Goal

Turn a normal workday into fuel for a productive night. By the time the developer logs
off, the agent should have everything it needs to work for hours without a human
present — and everything the agent *cannot* safely decide alone should be collected,
not guessed. The next morning starts with **review, never with blind acceptance.**

This mirrors an established idea about autonomy: a person can supervise a system either
**in the loop** — approving each individual action before it happens — or **on the
loop** — setting the goal and boundaries up front, letting the system act, and reviewing
the outcome afterward (supervisory control; see [References](#references)). Overnight
operation is deliberately **human-on-the-loop**: the human is not awake to approve each
step, so the approval has to be *front-loaded into the ticket* and the *review moved to
the morning*. That only works if the boundaries were drawn well while the human was
still awake.

## 2. Responsibility

- **The developer owns the specification and the verdict.** Writing a ticket an agent
  can run unattended, and judging what came back, are the developer's job — not the
  agent's. An agent that did the wrong thing overnight because the ticket was vague is a
  **specification failure**, not an AI failure.
- **The developer owns the guardrails.** What the agent may touch, what it must never
  touch, and where it must stop and leave a question are set by the human before the run
  (§3-5).
- **No unattended run without morning verification.** Whoever launched the overnight
  run is responsible for reviewing its output before any of it is merged, deployed, or
  built upon. This is the same implementer-owns-quality rule the [Quality
  Gate](/quality-gate) states, and it does not transfer to the agent.
- **AI agents are first-class contributors, held to exactly the same bar.** The human
  who merges an agent's work owns it, exactly as they would their own.

## 3. Practices

### 3-1. Structure the day around ticket-writing, not just doing

The overnight run is only as good as the tickets waiting for it. Treat **ticket
preparation as a first-class daytime activity**, not an afterthought at the end of the
day.

- Developers **SHOULD** reserve daytime — when questions can still be asked of humans —
  for turning fuzzy intentions into **well-formed work items**, and reserve the night
  for the mechanical execution an agent can carry alone.
- The unit of overnight work is a ticket that is **independently runnable**: it does not
  depend on a mid-run human decision, and it does not block on another ticket finishing
  first.
- This is **batch processing** applied to knowledge work: accumulate a queue of
  self-contained jobs during the day, then let them run as an unattended batch overnight
  (see [References](#references)). The daytime human is the interactive session; the
  night is the batch window.

### 3-2. A "Definition of Ready" for overnight tickets

Borrowing Agile's **Definition of Ready** — the gate a work item must pass before a team
commits to it — OSBR adds an *overnight* bar on top. A ticket is **ready to run
unattended** only when it meets **all** of the following. Developers **MUST NOT** queue
a ticket for overnight operation that fails any item.

- **Independent & self-contained** — runnable on its own, no mid-run human input, no
  hidden dependency on another unfinished ticket.
- **Decided up front, not overnight** — every choice the agent would otherwise have to
  *negotiate* with a human is already made and written down (see §3-3).
- **Valuable & clear** — the outcome and the reason for it are stated, so the agent
  optimises for the right thing.
- **Small enough to verify by morning** — scoped so a human can actually review the
  result the next day, not a sprawl no one can check.
- **Testable** — the ticket states how "done" is proven (tests pass, a command succeeds,
  output matches a stated shape). If done cannot be defined, the ticket is not ready.
- **Bounded** — the files, systems, and blast radius the agent may touch are named, and
  the off-limits areas are named too (see §3-5).

These map directly onto the well-known **INVEST** qualities of a good work item —
Independent, Negotiable, Valuable, Estimable, Small, Testable — with "negotiable"
resolved *before* the run rather than during it, because there is no human to negotiate
with in the middle of the night (see [References](#references)).

::: tip A vague ticket is worse at night than by day
By day, a confused agent can ask you. By night it cannot — it will guess, and you
inherit the guess in the morning. The cost of ambiguity is paid in full overnight.
:::

### 3-3. Pre-answer the judgment calls you can anticipate

The heart of this policy: **walk the ticket in your head, find the forks in the road,
and pre-answer the ones you can.** A well-specified prompt closes the decisions an agent
would otherwise resolve by guessing.

- Before queueing, the developer **SHOULD** ask: *"Where will the agent hit a decision
  it isn't equipped to make?"* — naming conventions, library choice, an ambiguous
  requirement, an edge case, a trade-off between two valid approaches.
- For each anticipated fork, **write the answer into the ticket**: the preferred option
  and *why*, or an explicit rule ("if X is ambiguous, prefer Y"). This is what turns a
  prompt from *suggestive* into *well-specified*.
- Give the agent the **context it needs to stay on rails**: relevant files, the
  conventions to follow, examples of the pattern you want, and the acceptance check.
  Under-specifying is the single largest cause of a wasted night.

### 3-4. Collect the judgment calls you *can't* pre-answer — don't let the agent guess them

Some decisions genuinely need a human: they are irreversible, they touch shared state,
they require taste or client knowledge the agent doesn't have, or they only surface once
the work is underway. These **MUST be surfaced, not silently decided.**

- Tickets **MUST** instruct the agent, on hitting an un-pre-answered judgment call, to
  **stop that thread, record the question, and move on** to other work — never to guess
  and barrel ahead on an irreversible or shared-state action.
- The output of the night therefore includes a **morning question queue**: the decisions
  the agent parked for a human. This is the deliberate handoff back from on-the-loop
  (overnight) to in-the-loop (the human, at their desk).
- **Reversibility decides the rule** (consistent with the [Development
  Guide](/development-guide)): a cleanly reversible step the agent may take and flag for
  review; an irreversible or shared-state action (a production change, a destructive
  migration, anything teammates or clients can observe) the agent **MUST** leave for a
  human. When unsure, park it as a question — parking is always safe.

::: warning No blank-cheque trust
"The agent ran all night and it's probably fine" is not a verification. An unattended
run that touched things no human has reviewed is **unverified work**, and unverified
work does not merge, deploy, or get built upon — full stop.
:::

### 3-5. Set guardrails before the run

An unattended agent needs **hard boundaries**, not just good intentions — the fence that
makes autonomy safe rather than reckless (see [References](#references)).

- Developers **MUST** define, before launching, the agent's **allowed scope** (which
  repos, directories, branches, and systems it may touch) and its **prohibitions**
  (production, secrets, destructive operations, anything outside the ticket).
- Overnight agents **SHOULD** work on an **isolated, reversible surface** — a branch, a
  worktree, a preview environment — so the entire night's work can be inspected as a
  diff and thrown away if wrong, touching nothing shared until a human approves. This is
  the same reviewed-main-line discipline the [CI/CD Pipeline](/ci-cd-pipeline) depends
  on: nothing reaches the shared line unreviewed.
- Match the leash to the ticket's risk. Think in **levels of autonomy**: a low-risk,
  well-fenced ticket (docs, tests, a mechanical refactor) earns a long leash; a ticket
  near shared state or client data earns a short one, or waits for a daytime pairing
  session. Not every ticket has earned the right to run alone (the levels-of-automation
  idea, from self-driving classification and human-factors research; see
  [References](#references)).

### 3-6. Begin every day by reviewing the night

The morning is the **review-on-return** half of on-the-loop supervision, and it is
mandatory. The day does not start with new work; it starts with **judging last night's
work.**

- The developer **MUST** begin the day by reviewing the overnight output **before**
  merging, deploying, or building on any of it: read the diff, run the checks, confirm
  the agent stayed in scope. The always-on review the [Quality Gate](/quality-gate)
  requires applies in full, and [Code Review](/code-review) is where that judgment
  happens — an agent's diff is reviewed exactly as a human's would be.
- Then **work the morning question queue** from §3-4 — answer the parked judgment calls,
  which either unblocks a follow-up run or becomes the day's interactive work.
- What passes review is accepted; what doesn't is **corrected in the ticket, not patched
  in the output** — a ticket that produced a bad night gets a clearer specification for
  the next one. Over time this tightens the Definition of Ready (§3-2) for the whole
  team.
- Treat the review honestly and at **team level**: a bad overnight result is a signal
  about the *ticket and the guardrails*, never a rating of a person (consistent with how
  OSBR treats delivery metrics in the [CI/CD Pipeline](/ci-cd-pipeline)).

## 4. Summary Loop

1. **Day** — write well-formed, independent tickets; pre-answer the anticipated judgment
   calls; set the guardrails.
2. **Handoff** — queue only tickets that pass the overnight Definition of Ready; the
   agent parks (does not guess) anything it can't safely decide.
3. **Night** — the agent runs on-the-loop, unattended, on an isolated reversible
   surface.
4. **Morning** — review the night's output before trusting any of it; work the question
   queue; feed corrections back into the tickets.

**The AI works the night. The human judges the morning. Neither skips their half.**

## References

Named practices this policy is built on, chosen because they are established and freely
readable.

**Supervisory autonomy — in-the-loop vs on-the-loop**

- Sheridan & Verplank, *Human and Computer Control of Undersea Teleoperators* (levels of
  automation; supervisory control) — <https://apps.dtic.mil/sti/citations/ADA057655>
- NIST AI Risk Management Framework (human oversight of AI systems) —
  <https://www.nist.gov/itl/ai-risk-management-framework>

**Levels of autonomy**

- SAE J3016 — Levels of Driving Automation (the popular "levels 0–5" model of graded
  autonomy) — <https://www.sae.org/standards/content/j3016_202104/>

**Well-formed work items — Definition of Ready & INVEST**

- Bill Wake, *INVEST in Good Stories, and SMART Tasks* —
  <https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/>
- Scrum Guide (the empirical basis for a shared Definition of Ready) —
  <https://scrumguides.org/scrum-guide.html>

**Agentic AI, guardrails & prompting**

- Anthropic, *Building Effective Agents* (agentic patterns; guardrails and scope) —
  <https://www.anthropic.com/research/building-effective-agents>
- Anthropic, *Claude Code Best Practices* (well-specified prompts, unattended runs) —
  <https://www.anthropic.com/engineering/claude-code-best-practices>

**Batch processing**

- Batch processing (accumulate self-contained jobs, run unattended) —
  <https://en.wikipedia.org/wiki/Batch_processing>

**Related OSBR standards**

- [AI Usage Guideline](/ai-usage-guideline) — the human ⇄ AI cooperation stance this policy operationalises.
- [Quality Gate](/quality-gate) — implementer-owns-quality; always-on review.
- [Code Review](/code-review) — where the morning review of an agent's diff happens.
- [CI/CD Pipeline](/ci-cd-pipeline) — reviewed main line, dev/prod parity, delivery metrics.
- [Development Guide](/development-guide) — how we ship; the reversibility rule.
