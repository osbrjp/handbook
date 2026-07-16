# Weekly AI Quota

This policy defines how we treat the **prepaid weekly AI subscription quota**: a
**fixed cost that is already paid** and that **resets on a timer whether or not it
was used.** Capacity left unspent at reset is gone — we cannot bank it, refund it,
or carry it forward. The discipline is therefore simple: **turn paid-for-but-idle
capacity into real value before the reset, without manufacturing busywork to run
the number up.** It sits under the [AI Usage Guideline](/ai-usage-guideline) (what
we let AI do and on what terms) and complements [Preparing for Overnight AI
Operation](/overnight-ai) (the biggest single sink for spare capacity is the
unattended night) and the [Development Guide](/development-guide) (what "value" and
"done" mean here).

Two failure modes are equally wrong, and this policy exists to steer between them:
**waste** — letting paid capacity expire unused — and **count-filling** — burning
the quota on processing that produces no value just to say it was used. The target
is neither an idle meter nor a maxed-out one; it is **the most value the paid week
can yield.** Requirement levels follow RFC 2119: **MUST** / **MUST NOT** are
absolute, **SHOULD** / **SHOULD NOT** are strong defaults overridable only with a
documented reason.

This is where three OSBR values pull the same direction. **Be Nice**: spend the
spare cycles on the debt, security, and research that make a teammate's next week
easier. **Be Kind**: never hand a colleague or client output that exists only
because a meter had to be emptied. **Be Strong**: do the harder planning work of
pointing idle capacity at real problems, instead of letting it lapse or letting it
churn.

[[TOC]]

## 1. Goal

Extract the **maximum genuine value** from capacity that has **already been paid
for** before it resets and disappears. The quota is a fixed weekly cost; once
bought, the only question left is how much useful work it produces before the clock
runs out. An unused hour of quota at reset is not "saved" — it is **spent and
wasted**, identical in cost to an hour used well, but with nothing to show for it.

The goal is **high utilisation of a fixed cost**, not high *activity*. A week that
ends with the quota near-exhausted **on work worth doing** is a success; a week that
ends the same way **on work not worth doing** is a more expensive failure than
leaving it idle, because it also burned the developer's review attention.
Utilisation is the means; value is the end.

## 2. Responsibility

- **The developer owns the utilisation decision.** Noticing that capacity will
  expire unused, and directing it at something worthwhile before reset, is the
  developer's job. Quota that lapses idle week after week is a **planning failure**,
  not a property of the subscription.
- **The developer owns the value bar.** Every unit of quota spent MUST clear the
  same "is this worth doing?" bar as any other work. The quota being prepaid lowers
  the *threshold of urgency* for spare-cycle work — it does **not** lower the
  threshold of *value* to zero.
- **No count-filling.** Running the meter up on valueless processing to feel
  productive, hit an internal number, or "not waste it" is itself waste — it
  consumes the quota *and* the human review it generates.
- **The reviewer still owns quality.** Spare-cycle output enters the codebase like
  any other change, so it meets the same AI code review the [Quality
  Gate](/quality-gate) requires — the prepaid origin buys no exemption (§3-5).

## 3. Practices

### 3-1. Treat the quota as a fixed, perishable cost — not a sunk one to ignore

The weekly fee is paid up front regardless of use. That has a precise economic
consequence: at any moment mid-week, the **money is already gone** (it is *sunk* and
must not sway the decision), but the **remaining capacity is a live asset** worth
something only if used before reset.

- We **SHOULD** think of unused quota the way an airline thinks of an empty seat on
  a departing flight, or a hotel an unsold room-night: a **perishable good** whose
  value drops to zero at a known deadline. The marginal cost of using already-paid
  capacity is effectively zero, so **any** positive-value use beats letting it
  expire (see [References](#references): perishable-inventory / yield management).
- We **MUST NOT** let the *sunk* fee drive behaviour ("we paid for it, so we must
  thrash it to get our money's worth"). The fee is gone either way; the only live
  question is the value of the *remaining* capacity between now and reset (see
  [References](#references): sunk-cost fallacy).
- The right frame is **opportunity cost**: idle capacity with a queue of worthwhile
  work waiting is capacity spent on *nothing* when it could have been spent on
  *something* — the classic definition of an opportunity cost.

> **Sunk vs. perishable — hold both.** The *money* is sunk: never let "but we
> already paid" justify low-value churn. The *capacity* is perishable: never let "we
> might not need it" justify letting it lapse. Both truths point the same way —
> spend the remaining capacity on the best available work, and only that.

### 3-2. Keep a standing backlog of spare-cycle work

Utilisation only works if there is somewhere worthwhile for spare capacity to go the
moment it appears. Idle capacity with an empty backlog is what *causes*
count-filling.

- Teams **SHOULD** maintain a ready queue of **genuinely valuable but
  non-time-critical** work sized for spare cycles — the kind of thing that is always
  worth doing but rarely urgent enough to schedule:
  - **Refactoring & paying down technical debt** — the cleanup that never makes it
    into a sprint but compounds if left (see [References](#references): technical
    debt).
  - **Security checks** — dependency and vulnerability scans, hardening passes, and
    security audits.
  - **Research & spikes** — evaluating a library, prototyping an approach, reading
    into a problem the team will hit later.
  - **Tests, docs, and observability** — coverage, missing docs, and the
    instrumentation that makes the running system legible.
- This is the **spare-cycle / background-work pattern**: a system with fixed, paid
  capacity and idle time puts that idle time to productive use on low-priority
  batchable work, exactly as an operating system schedules background jobs or
  distributed-computing projects harvest idle CPU (see [References](#references):
  idle-time utilisation, cycle scavenging).
- The overnight run is the natural home for most of this — see [Preparing for
  Overnight AI Operation](/overnight-ai). Spare quota plus a queue of self-contained
  tickets plus an unattended night is the same idea three times.

### 3-3. Direct idle capacity before it lapses — "use it before you lose it"

Capacity that will expire unused should be **actively steered** at the standing
backlog, not left to evaporate.

- When a developer can see the week's quota will not be exhausted by scheduled work,
  they **SHOULD** pull the highest-value item off the spare-cycle backlog (§3-2) and
  queue it — ideally as overnight work — rather than let the capacity reset unused.
- Point capacity at the **highest-value available use first**, not merely the first
  use to hand. "Use it before you lose it" is an allocation rule for perishable
  capacity, not a licence to spend it on anything.
- If, honestly, **no worthwhile work remains**, the correct action is to **let the
  quota lapse.** Unused capacity is a small, acceptable loss; valueless processing
  is a larger loss because it also consumes review attention. **Idle beats
  busywork.**

### 3-4. Do not optimise the count — beware Goodhart's Law

The instant "quota utilisation" becomes a number people feel judged by, the
incentive flips from *doing valuable work* to *making the number go up* — and those
two come apart fast.

- Developers **MUST NOT** run processing whose purpose is to raise a usage figure,
  empty a meter, or hit a utilisation target rather than to produce value. Padding a
  ticket, re-running work that is already done, or inflating a task to consume more
  capacity are all **count-filling** and are prohibited.
- **Utilisation is a diagnostic, never a target.** The moment it becomes a target it
  stops measuring anything useful — this is **Goodhart's Law**: "when a measure
  becomes a target, it ceases to be a good measure" (see [References](#references)).
  We read quota utilisation only as a *hint* that valuable capacity may be lapsing,
  prompting a look at the backlog — never as a score to maximise.
- Judge the week by the **value delivered**, not the quota consumed. High
  utilisation on real work is good; high utilisation is not itself the good. If the
  two ever conflict, value wins and the meter loses.

> **A full meter is not an achievement.** "We used 98% of the quota" says nothing on
> its own — 98% on debt paid down, security hardened, and research banked is a great
> week; 98% on padding and re-runs is waste dressed as productivity. Never
> celebrate, target, or rank on the utilisation number. Celebrate what the capacity
> *produced*.

### 3-5. Every spare-cycle result still gets reviewed

Work done to soak up spare capacity is **still work**, and it enters the codebase
and the client's world exactly like scheduled work. The prepaid, low-urgency origin
of a task lowers its *scheduling* priority — it lowers **none** of its quality bar.

- Output produced from spare quota — overnight or otherwise — **MUST** be reviewed
  by a human before it is merged, deployed, or built upon, on the same terms as any
  other work (consistent with the [Quality Gate](/quality-gate), [Preparing for
  Overnight AI Operation](/overnight-ai), and the [Development
  Guide](/development-guide)).
- Spare-cycle security work **MUST** route through the same review as any other
  security-relevant change; a scan run "to use the quota" that no one reads is
  count-filling by another name.
- If reviewing a spare-cycle result costs more human attention than the result is
  worth, that is a signal the task **should not have been queued** — feed that back
  into the backlog's value bar (§3-2), do not lower the review bar.

## 4. Summary loop

1. **See** — recognise the weekly quota as a fixed, prepaid, *perishable* cost:
   unused at reset means spent-and-wasted, and the fee itself is sunk and irrelevant
   to the decision.
2. **Stock** — keep a standing backlog of genuinely valuable, non-urgent
   spare-cycle work: refactoring, security, research, tests, docs.
3. **Steer** — point capacity that would otherwise lapse at the highest-value
   backlog item, usually as overnight work; if nothing is worth doing, let it lapse.
4. **Don't game** — never run the meter up for its own sake; utilisation is a
   diagnostic, never a target (Goodhart), and value, not consumption, judges the
   week.
5. **Review** — every spare-cycle result clears the same human review bar as
   scheduled work before it is trusted.

**Waste nothing that is worth doing. Manufacture nothing that isn't.**

## References

Named ideas this policy is built on, chosen because they are established and freely
readable.

**Fixed cost, sunk cost & opportunity cost**

- Sunk cost (a cost already incurred and unrecoverable; must not drive current
  decisions) — <https://en.wikipedia.org/wiki/Sunk_cost>
- Opportunity cost (the value of the best alternative forgone) —
  <https://en.wikipedia.org/wiki/Opportunity_cost>
- Fixed cost (a cost that does not vary with usage in the period) —
  <https://en.wikipedia.org/wiki/Fixed_cost>

**Perishable capacity & utilisation — "use it before you lose it"**

- Yield / revenue management (pricing and filling perishable capacity — the airline
  seat / hotel room-night that expires at a deadline) —
  <https://en.wikipedia.org/wiki/Yield_management>
- Capacity utilization (the share of available capacity actually put to use) —
  <https://en.wikipedia.org/wiki/Capacity_utilization>

**Spare-cycle / idle-time work**

- Cycle scavenging / idle-time harvesting (putting otherwise-idle capacity to
  productive use) — <https://en.wikipedia.org/wiki/Cycle_scavenging>
- Technical debt (deferred cleanup that compounds if left; natural spare-cycle
  work) — <https://en.wikipedia.org/wiki/Technical_debt>

**Don't optimise the count**

- Goodhart's Law ("when a measure becomes a target, it ceases to be a good
  measure") — <https://en.wikipedia.org/wiki/Goodhart%27s_law>

**Related OSBR standards**

- [AI Usage Guideline](/ai-usage-guideline) — the terms under which AI runs at all.
- [Preparing for Overnight AI Operation](/overnight-ai) — the natural home for spare
  capacity.
- [Quality Gate](/quality-gate) — the AI code review every spare-cycle result
  meets.
- [Development Guide](/development-guide) — what "value" and "done" mean here.
