# The Quality Gate

A piece of work is not done when it runs. It is done when it clears three
checks — it is **reliable**, **secure**, and **sustainable**. One engineer, with
their AI, holds all three as they build, and nothing moves to `Done` on the
board until all three are met.

These are lenses, not a checklist someone else runs at the end. Each names the
standards we hold the work to, and points at the policy that defines the posture
behind them — the gate is where we confirm the work meets that standard, not
where the standard is re-written. The gate sits between `Impl Review` and
`Done`: a change that adds bloat, weakens a defence, or leaves a solution costly
to keep alive is a finding — even when it works — and goes back before it ships.

Holding this bar is where our values meet the code. It is **Be Nice** — a high
standard of care for the people who use what we build and the next person who
maintains it; **Be Kind** — a solution left sound enough for someone else to
own; and **Be Strong** — the readiness to find our own gaps rather than ship
them.

[[TOC]]

## Reliability

A reliable solution does what it is meant to, and keeps doing it.

**It starts in how the code is written.** We build the simplest thing that
works, keep one source of truth for each fact, and add only what is needed now.
Code shaped this way — small, clear, purposeful — behaves predictably, and the
next reader, human or AI, can change it without fear. Design begins from a model
of the problem, not from the first screen: who the actors are, what events
occur, what data and demands follow. Code that mirrors a clear model stays
reliable as it grows.

**We prove it as we build.** The engineer who writes a change plans and judges
its verification — quality is not handed to a separate stage at the end. We test
against real databases and real interfaces, not only mocks, because the failures
that matter live at the seams; we aim tests at those boundaries and at the
domain logic that carries the business. Coverage is a signal, not a goal. An
always-on review — an AI reading every change, a person judging what it finds —
is part of how a change earns its merge, not an optional courtesy.

**We assume things will break.** Every call that leaves our process has a
timeout and a defined behaviour when it fails; every dependency can fall over,
so we plan for it — sensible retries, a circuit breaker where a retry storm
would hurt, and a rollback path decided before the change ships, not during an
incident. Where one tenant's trouble must not reach another, we keep them apart.

**We can see it once it runs, and we answer for it when it breaks.** Every
service emits structured logs, metrics, and traces from day one, and we alert on
user-facing symptoms, not on every low-level metric. When something goes wrong
we record it — blamelessly, and regardless of scale — contain it, remediate the
cause, and investigate production read-only, with personal data masked before it
reaches any AI context. The reporter of an incident does not decide whether it
was worth reporting.

Held to the standards that carry the detail: [Testing
Standards](/testing-standards), [Observability &
Resilience](/observability-resilience), [Incident
Management](/incident-management), [Code Review](/code-review), [CI/CD
Pipeline](/ci-cd-pipeline), and [Architecture Standards](/architecture-standards)
— and to the [Infrastructure Planning Policy](/infra-planning-policy) (measured
SLI/SLO and delivery, resilience patterns, environment parity, backups and
disaster recovery, safe and reversible deploys) and the [Non-functional
Requirements](/predefining-non-functional-requirements) (the availability, RPO,
and RTO targets a solution is sized against).

- We **MUST** let the engineer who builds a change also test it, run it, and
  answer for it — verification is planned at design, not bolted on at the end.
- We **MUST** exercise critical paths against real dependencies, not only mocks,
  aiming tests at boundaries and domain logic.
- We **MUST** give every outbound call an explicit timeout and a defined failure
  behaviour, and decide the rollback path before a change ships.
- We **MUST** make every service observable — structured logs, metrics, traces —
  and alert on user-facing symptoms.
- We **MUST** record an incident regardless of who noticed or how small it
  looks, and investigate production read-only with personal data masked.
- We **SHOULD** keep modules inside one deployable unit until a concrete need —
  independent scaling, deployment, or fault isolation — is written down and
  agreed. A distributed system is a cost, paid whether or not it is needed.

## Security

A secure solution protects the people and the data inside it.

**We verify against a published baseline.** We hold our work to the OWASP
Application Security Verification Standard (ASVS), so that "secure" is a verdict
we can trace rather than a feeling. We verify authentication and session
handling, validate and bound every input at its trust boundary, encode every
output for its destination, and treat every external input as untrusted until
proven otherwise.

**Access is least-privilege and auditable.** Each component gets only what it
needs. Administrative power sits on its own surface, behind its own explicit
authorisation step, never one checkbox away from ordinary use, and its actions
are logged. We layer independent defences so that no single lapse is fatal, and
we write down every place we deliberately relax one.

**The data we hold is a responsibility, not a hoard.** We record consent as an
event, collect the minimum for a stated purpose and re-consent when that purpose
changes, keep only what we need, and let people export and delete what is
theirs. We are careful with what leaves the system — an email, a log line, a
value handed to an AI — because each one is a door, and we know which region
personal data lives in and keep it consistent with what the client and the law
require.

**We own our supply chain,** because most breaches arrive through code we
imported, not code we wrote: we pin versions, scan dependencies, and would
rather hold a release than ship past a known, unpatched flaw. Risks we cannot
remove we name in a living register — with an owner, and an explicit decision to
accept them — rather than leave them unspoken.

Held to the standards that carry the detail: [Application
Security](/application-security), [Access Control](/access-control), [Data
Protection](/data-protection), and [Supply Chain & Risk](/supply-chain-risk) —
and to the [Security Policy](/security-policy) and the OWASP ASVS baseline.

- We **MUST** verify the solution against ASVS at the level its data warrants,
  and record any requirement waived, with the reason.
- We **MUST** validate and bound every input at its trust boundary, and encode
  every output for its context.
- We **MUST** keep administrative functions on a separate surface with a
  separate, logged authorisation step.
- We **MUST** pin and scan dependencies, and hold any release that ships a known
  unpatched vulnerability.
- We **SHOULD** mask personal data before it enters a log or an AI context, and
  name every accepted risk in a register with an owner.

## Sustainability

A sustainable solution endures — it keeps running without asking much of whoever
keeps it, and it costs little to keep alive.

**It endures in the code and the record.** A well-built, well-documented
solution can sit for months and be picked up again — by us, by a client, or by
an AI — with the facts it needs already in the repository. Documentation lives
as code beside what it describes, not in a separate deliverable that rots; the
directory says what each part is; concepts map to resources and URLs the same
way every time. We favour boring, standard, replaceable parts over clever ones,
and draw clean boundaries — an anti-corruption shell between our model and a
dependency, cut lines that let a part be rebuilt rather than nursed — so keeping
the thing alive stays a small, quiet job rather than a standing burden.

**It stays portable, so leaving stays possible.** When we depend on a vendor we
weigh its lock-in and exit cost, favouring open standards and portable data. A
solution we can move is a solution a client can take.

**It is light because it is efficient.** The efficiency that makes a solution
cheap to keep alive is the same efficiency that makes it light on the world, and
we design for both at once — the infrastructure defaults that deliver this
(scale-to-zero when idle, capacity that follows demand, cost as a design
constraint, managed services over self-hosting) are set in the Infrastructure
Planning Policy, and a solution is held to them here.

Held to the standards that carry the detail: [Architecture
Standards](/architecture-standards), [Repository & Documentation
Standards](/repository-documentation-standards), and [API Design](/api-design) —
and to the [Infrastructure Planning Policy](/infra-planning-policy)
(scale-to-zero and on-demand infrastructure, cost as a design constraint,
managed services, data portability).

- We **MUST** keep the facts needed to run and change a solution in its
  repository, so operating it never depends on one person's memory.
- We **MUST** meet the infrastructure defaults set in the Infrastructure
  Planning Policy, and record why when a workload genuinely cannot.
- We **SHOULD** favour boring, standard, replaceable parts, and place an
  anti-corruption boundary between our own model and an external dependency.
- We **SHOULD** weigh lock-in and exit cost when choosing a vendor, favouring
  open standards and portable data.
