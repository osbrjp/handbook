# Architecture Standards

This is the standard the [Quality Gate](/quality-gate) holds structural and
architectural decisions to: how a system is deployed, how a package is arranged
inside, how boundaries are drawn so parts can be rebuilt, how tenants are walled
off, and how external dependencies are chosen and contained. It expands the
architectural side of the one-line rule the [Coding Style Guide](/style-guide)
carries — *dependencies point inward, ports and adapters at the edge* — into a
working standard for the shapes above that rule. It builds on the
[Infrastructure Planning Policy](/infra-planning-policy) (which prefers managed,
stateless, disposable services and weighs lock-in and exit cost) and shares the
"assume breach" instinct of [Application Security](/application-security).
Deviations are allowed, but — as everywhere in the handbook — they must be
deliberate and justified in the project's design notes or an ADR.

Architecture is where OSBR's values become load-bearing. **Be Nice**: a teammate
can run the whole system on a laptop, change two modules in one commit, read a
package in the client's own vocabulary, and find the reasoning for every hard
choice written down beside the code. **Be Kind**: we hand the next maintainer —
human or AI — one process to reason about instead of a call graph across the
network, a dependency they can swap without asking the whole codebase, and an
exit written before it is needed rather than discovered at the worst moment.
**Be Strong**: we refuse the false sophistication of a distributed system nobody
needs yet, we keep the freedom to switch vendors, and we stay willing to throw
away and rebuild code we now judge wrong — without ego or sunk-cost paralysis.

## How to read this policy

* **Requirement levels** follow RFC 2119, as in the [Coding Style
  Guide](/style-guide). **MUST** / **MUST NOT** are absolute. **SHOULD** /
  **SHOULD NOT** state a strong default overridable only with a documented
  reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is
  named inline and cited under [References](#references). We adopt the *criteria*
  of large-scale practices and right-size them for an SME — we do not adopt the
  headcount or infrastructure behind their reference setups.
* **Architecture Decision Records (ADRs).** Several rules here require a decision
  to be recorded. An ADR is a short, versioned note kept in the repository (per
  the [Repository Documentation Standards](/repository-documentation-standards))
  stating the decision, its driver, the alternatives rejected, and when to
  revisit it. An ADR is immutable once accepted; a later reversal is a *new* ADR
  that supersedes it, so the causal history stays legible.

[[TOC]]

## 1. Goal

The goal of OSBR's architecture is **software a small team can ship, change, and
hand over at the speed it actually has — without paying for sophistication it has
no use for yet.** Concretely:

- **One deployment unit by default.** A new system is a single modular monolith
  that builds, tests, deploys, and rolls back as one artifact. There is one place
  to look when something breaks. Distribution is a cost taken on only against a
  written, approved need.
- **Uncorrupted domain.** Every package reads in the client's vocabulary, with
  frameworks, SDKs, and databases contained at the edge — so the business is
  legible and the vendor is replaceable.
- **Rebuildable parts.** Boundaries are drawn along units that can be deleted and
  regrown from what the repo already holds, so "rewrite this part" sits beside
  "extend this part" as an ordinary engineering choice.
- **Isolation built in, not retrofitted.** Multi-tenant separation and the freedom
  to switch vendors are decided proactively and recorded, because both are
  dramatically cheaper built in than bolted on later.

A structure that does not serve one of these goals is ceremony. We optimise for
the option to change cheaply, not for the appearance of a grown-up architecture.

## 2. Responsibility

- **Whoever starts a new system** starts it as one modular monolith with named,
  in-process module boundaries and the package layout of §3-6. The single unit is
  the default and needs no justification; a distributed or layer-first start does.
- **Every developer adding a feature** keeps it inside the monolith, in the module
  and responsibility it belongs to, reaching external dependencies only through
  their contained adapter. New code goes where the rules below put it, not where
  it is quickest to paste.
- **Whoever proposes a split, a rebuild, a new dependency, or a tenant-isolation
  model** records the decision — the concrete need and the cost accepted — in a PR
  or ADR *before* it ships. An undocumented architectural change is an
  architectural defect, not a preference.
- **Code reviewers** treat structure as reviewable surface, per the AI code
  review the [Quality Gate](/quality-gate) requires: they reject an undocumented
  split, a leaked vendor type, a layer-first tree, or a tenant-scoped table with no
  isolation decision. Security-sensitive structure (tenant boundaries especially)
  is verified under [Application Security](/application-security)'s mandatory
  review.
- **AI agents** are first-class contributors of architecture and are held to
  exactly the same bar. The human who merges an agent's structural change owns it
  — and agents make the "write the reasoning down" discipline (§3-15, §3-17) more
  important, not less, because an agent regenerates from what is written, never
  from a teammate it can ask.

This is not a job for a separate "architect" gatekeeping a catalogue. In a small
team the person building the feature is the person who keeps the system in one
piece; the defaults below are what make the sound choice the path of least
resistance.

## 3. Practices

### Deployment shape — modular monolith first

We stand on named, published practice: Fowler's **MonolithFirst** and
**Microservice Premium**, the **Modular Monolith** (Simon Brown, Kamil Grzybek),
the **Majestic Monolith** (Shopify, DHH), DDD **bounded contexts** as in-process
modules, and the **fallacies of distributed computing**.

#### 3-1. Start as one modular monolith

- A new system MUST start as **one deployment unit** — a single artifact that
  builds, tests, deploys, and rolls back together. Splitting into separately
  deployed services from day one is prohibited unless §3-4's documented-need bar is
  met before the first release.
- The monolith MUST be **modular from the first commit**: divided into modules
  matching bounded contexts and the ubiquitous language, each owning its own logic
  and data (§3-2). A monolith without internal boundaries — a "big ball of mud" —
  is *not* what this endorses; the modularity is the point.
- Follow **MonolithFirst**: almost all successful microservice systems began as a
  monolith that was later split, and most microservices-first builds ran into
  trouble. You cannot design good service boundaries for a domain you have not yet
  built. Learn the boundaries from a running monolith, then extract if the evidence
  says to.

#### 3-2. Give modules real in-process boundaries

- Modules MUST interact only through **explicit, published in-process interfaces**
  — a module's public functions — never by importing another module's internals.
- Each module SHOULD **own its own data**. No module reads or writes another's
  tables directly; it asks through the owning module's interface. Shared mutable
  tables across modules are the coupling that makes a future split impossible.
- A call between two of our modules SHOULD be an **ordinary function call**, not a
  network request. In-process calls are synchronous, fast, transactional, and
  cannot half-fail — none of which survives a network hop. The clean boundary is
  the asset: a module that already exposes a narrow interface and owns its data can
  be lifted into its own service mechanically; a tangled one cannot be split at any
  price short of a rewrite.

#### 3-3. Treat distribution as a cost, not a default

- Before introducing a network boundary between our own code, the developer MUST
  account for the **fallacies of distributed computing**: the network is not
  reliable, not zero-latency, not infinite-bandwidth, not secure, and topology,
  ordering, and administration are not free. Each becomes your code's problem the
  moment the hop exists.
- A split MUST be recognised as buying **partial failure, network latency, eventual
  consistency, distributed debugging, and independent deploy coordination** — the
  *Microservice Premium*, paid up front whether or not the split ever delivers a
  benefit. Below the complexity threshold where most SME systems live, a
  distributed design is slower to build, change, and operate than the monolith it
  replaced.
- Do NOT reach for a separate service, or an async queue between our own modules,
  to achieve **code organisation** — that is what modules inside the monolith are
  for. Distribution is a runtime-topology decision, not a tidiness decision.

#### 3-4. Split only on a documented, concrete need

- A module MAY be extracted into its own deployed service, but the proposal MUST
  document a **concrete, present need** of one of these kinds:
  - **Independent scaling** — this module's load profile genuinely differs and
    scaling it inside the monolith is demonstrably wasteful or infeasible.
  - **Independent deploy cadence** — this module must ship on a materially
    different schedule (regulatory, or a much faster/slower rhythm) than the rest.
  - **Fault isolation** — a failure here must be prevented from taking the rest of
    the system down, and in-process isolation cannot achieve it.
- The need MUST be recorded in a **PR or ADR** with its evidence and the cost
  accepted, and ships only after approval. Speculation ("might need to scale",
  "microservices are best practice") does NOT meet this bar.
- Extraction SHOULD happen along an **existing clean module boundary** (§3-2) — you
  split what is already a clean module; you do not first tangle things and then try
  to cut. If the boundary is not clean yet, fix it in the monolith first.

#### 3-5. Keep managed services as edge scaffolding

- A managed queue, scheduler, object store, or database MAY be used as **plumbing
  at the edge** of the monolith. It does not, by itself, split the domain — the
  domain still lives in one deployable unit. This is consistent with the
  [Infrastructure Planning Policy](/infra-planning-policy)'s preference for managed,
  serverless services for a small team.
- Do NOT let a managed service become a **backdoor topology**: two of our modules
  coordinating through a queue purely to feel decoupled, when an in-process call
  would do, is a network hop in a managed-service costume — and it pays §3-3's
  premium just the same.
- Reach every managed service through **one contained adapter** (§3-7, §3-10) so
  the monolith is not welded to it and stays portable.

### Package internals — anti-corruption structure

We stand on named practice: Evans's **Anti-Corruption Layer**, Cockburn's
**Hexagonal Architecture (Ports & Adapters)**, Martin's **Dependency Rule**,
Palermo's **Onion Architecture**, Bernhardt's **functional core / imperative
shell**, and **package-by-feature**. This is the code-level expression of the
same [Style Guide](/style-guide) dependency rules.

#### 3-6. Divide the package by domain (package-by-feature)

- A package MUST be divided into **domain sections** that match the ubiquitous
  language and bounded contexts (`billing`, `scheduling`, `consignment`), each
  self-contained. A `scheduling` folder holds scheduling's model, service, and
  adapters together.
- Group code that changes for the same reason together — Single Responsibility read
  as cohesion. A change to how billing works should touch the `billing` section and
  little else.
- Do NOT create a **layer-first tree** (`controllers/`, `models/`, `dao/`) as the
  primary division. Layer-first scatters one feature across the repo and lets the
  payment SDK leak across the whole `dao/` layer, so no boundary can promise "the
  vendor is spoken to *here* and nowhere else."

#### 3-7. Split each domain section into three responsibilities

Inside a domain section there are exactly three homes for code — Onion/Clean
collapsed to the smallest honest number of rings, mapping onto *functional core,
imperative shell*:

| Responsibility | Holds | Purity |
| -------------- | ----- | ------ |
| **model** | Domain data (value objects, entities) and pure functions over them — the rules and calculations | Pure: no IO, no side effects, no framework types |
| **service** | Outward procedures — the use cases that orchestrate the model to get something done | Effectful, but only via *ports* it declares; no concrete SDK |
| **dependency implementation** | The one place an external dependency (DB, SDK, HTTP API) is actually called; translates SDK/DB shapes to and from domain types | Effectful and technology-specific; the SDK lives here |

- The **model** MUST be pure and MUST NOT import the service, the dependency
  implementation, or any external library beyond the language's own value types. It
  is testable with no mocks.
- The **service** MUST express what it needs from the outside world as a *port* — a
  function signature or a record of functions it declares — and MUST receive the
  concrete implementation by injection, not by importing it (§3-8).
- The **dependency implementation** MUST be the *only* code in the section that
  imports the external SDK/driver, and it MUST return domain types (§3-10).
- Three responsibilities is the whole model. Do not add "domain services",
  "mappers", and "DTOs" as ceremonial extra layers unless a section genuinely needs
  them — the rings exist to protect the domain, not to be counted.

#### 3-8. Point every dependency toward the domain

```
dependency-implementation  ──▶  service  ──▶  model
        (adapters)              (use cases)   (pure core)
```

- Source-code dependencies MUST point **inward only**, per the Dependency Rule. The
  model is imported by the service and the adapter; it imports neither.
- Where a service needs an effect (persist, fetch, call an API), the dependency MUST
  be **inverted**: the service declares the port; the dependency-implementation
  satisfies it. Control points outward at runtime, but source-code dependency still
  points inward.
- **Litmus test:** could you delete the `dependency-implementation` folder and still
  compile the model and service? If yes, the direction is correct. If deleting the
  adapter breaks the domain, the dependency has leaked inward.

#### 3-9. Keep entry points as thin external shells

- `main`, HTTP handlers, message-queue consumers, CLI commands, and scheduled-job
  entry functions are **shells**: read input, call a service, translate the result.
  An entry point MUST NOT contain domain rules — a business decision belongs in a
  `model` function the handler calls.
- An entry point MUST assemble the wiring at the edge (composition root):
  construct the concrete adapters and pass them into the service. This is the one
  place concrete dependencies and the domain meet, and they meet only to be
  connected.
- Keep shells thin enough to need no unit tests of their own beyond the integration
  test that exercises the real path; the logic worth testing has already been
  pushed into the pure model.

#### 3-10. Let no external library type cross the boundary

This is the anti-corruption rule proper, and the one reviewers guard hardest.

- Model and service signatures MUST use **domain types only**. A `Stripe.Charge`,
  `sql.Rows`, `AxiosResponse`, `bigquery.Row`, `boto3` client, or ORM entity MUST
  NOT appear above the `dependency-implementation` seam.
- The adapter MUST **translate both ways**: incoming SDK/DB shapes map to domain
  types before they travel inward; domain types map to SDK calls at the edge.
- Errors cross the boundary as **domain errors** (`Result` values per the [Style
  Guide](/style-guide)), not raw SDK exceptions. The `try`/`catch` around the SDK
  lives in the adapter and converts the throw into a `Result` right there.
- A leaked type is a **structural defect**. The test: if replacing the vendor would
  force a change to a model or service signature, the vendor has already corrupted
  the domain. It is always tempting to pass the SDK's rich object one layer inward
  "just this once" — that one shortcut is how a vendor ends up owning your domain.

### Vendor neutrality — keep the freedom to switch

The anti-corruption layer of §3-10 is the *mechanism*; this cluster is the
*discipline* around it — when to take a dependency on at all, and how to keep the
exit payable. We stand on Cockburn's Ports & Adapters, Evans's ACL, and ADR
practice (Nygard).

#### 3-11. Add a dependency only on a clearly-met criterion

- The default answer to "should we pull in this external dependency?" is **no —
  implement it, or use what we already have**, following the same ladder the [Style
  Guide](/style-guide) mandates (standard library → already-installed dependency →
  custom code → last, a new dependency).
- A new external dependency MUST clear a stated criterion before it is added: the
  capability is **genuinely hard to own** (a security surface we should not
  reinvent, a specialised system with real operational depth, a commodity we have
  no business rebuilding) *and* the dependency earns its permanent cost. "It would
  save a few lines" is not the criterion.
- "Cost" is **Total Cost of Ownership** — integration, version churn, the CVE class
  we inherit, the exit cost the day we leave — not the sticker price. Every package
  on the manifest is attack surface, an update burden, and one more master. The
  safest dependency is the one we did not add.

#### 3-12. Log every dependency decision as an ADR

Every decision to take on (or deliberately reject) an external dependency MUST be
recorded as an ADR. Each dependency ADR MUST state four things:

- **Reason** — why this dependency, why now, and which §3-11 criterion it meets.
- **Assessment** — the alternatives weighed (including "implement it ourselves"),
  the TCO, and the lock-in / exit-cost judgement.
- **Monitoring plan** — what we watch after adopting it: the vendor's health,
  pricing changes, deprecations, its CVE feed, and our own usage growth against the
  criterion that justified it.
- **Exit strategy** — concretely *how we would leave*: the replacement path, the
  data we would export, the format we would export it in, and roughly what the
  switch would cost. An exit strategy written before we are trapped is a plan; one
  written after is an incident.

#### 3-13. Preserve the freedom to switch — and prove it is preserved

- Replaceable external dependencies — **database, email, payments, auth, AI/LLM
  providers, third-party APIs** — MUST be reached only through the contained,
  one-way adapter of §3-10, expressed in our vocabulary (`sendReceipt`, not
  `stripe.charges.create`). One adapter, one implementation, is fine — the port
  names the boundary and pins the translation; it is not a speculative abstraction.
- Do NOT wrap a dependency you will never replace and that has no domain vocabulary
  to protect (a logging library, a date formatter). Anti-corruption is translation,
  not abstraction for its own sake; the layer earns its place only where the vendor
  is *replaceable* and its model would otherwise *leak*.
- Data MUST be kept in **portable, open formats** wherever practical, so an exit is
  an export, not an excavation — the same stance as the [Infrastructure Planning
  Policy](/infra-planning-policy). The exit strategy (§3-12) SHOULD be *tested*, not
  just asserted: a second adapter behind the same port is the strongest evidence a
  dependency is replaceable, and a fake for tests already counts — if the port
  admits a test double, it admits a replacement vendor.
- A dependency the codebase touches in only one place is one whose exit we can
  price. A dependency whose calls are scattered across the domain is lock-in that
  has already happened, whatever the contract says. Favour portable, open standards
  over proprietary anchors: a system we can move, audit, and hand to a client is a
  stronger deliverable than one that runs slightly faster but can never leave.

### Rebuildable boundaries — sacrificial architecture

We stand on Fowler's **Sacrificial Architecture** and **Strangler Fig**, the
**Building Evolutionary Architectures** work (Ford, Parsons, Kua) and its
**fitness functions**, **YAGNI**, Twelve-Factor **disposability**, and Brooks's
**second-system effect** as the anti-pattern.

#### 3-14. Draw boundaries along wholly-rebuildable units

- Each module boundary MUST be drawn so the unit inside is **wholly rebuildable** —
  replaceable in one piece, behind a stable interface, without a coordinated
  rewrite of its neighbours. The test is concrete: *could you delete this directory
  and regrow it from its interface plus its recorded intent, and would anything
  outside it need to change?* If yes to the second, the boundary leaks.
- The boundary's **contract MUST be explicit and narrow** — the interface a
  neighbour depends on is the thing that must survive a rebuild, so it is stated,
  not implied by whatever internals happen to be reachable. This is the same clean
  seam §3-2 requires; here the point of the seam is that you can *cut* along it.
- Prefer **smaller, independently disposable units** over one large unit that can
  only be rebuilt all-or-nothing — Twelve-Factor disposability applied to source
  structure, not just to running processes.

#### 3-15. Keep the regeneration basis in the repository

The **regeneration basis** is everything a rebuilder needs to regrow a module
*correctly* without reverse-engineering it: what it must do, why, and which
decisions are load-bearing.

- The basis MUST live **in the repository, versioned beside the code** (per the
  [Repository Documentation Standards](/repository-documentation-standards)): the
  spec or acceptance criteria, the domain model, and the ADRs explaining the
  non-obvious choices. Intent that lives only in a person's memory or a closed chat
  is not a basis; it is a single point of failure.
- Capture **the reasoning, not just the outcome.** "We chose eventual consistency
  here *because* the client accepts a 5-minute lag and it lets the module scale to
  zero" is regenerable; "uses eventual consistency" is not — a rebuilder cannot tell
  whether that was essential or incidental.
- Any behaviour that is *deliberate but non-obvious* (a hardware calibration
  constant, a retry ceiling, a quirk that matches a legal requirement) MUST be
  written down, because it is exactly the behaviour an innocent rebuild will drop.
  This matters most for AI agents: an agent regenerates from what is written and
  cannot ask "was this weird retry loop intentional?" — so a repo-resident basis is
  what makes "have the agent rebuild that package overnight" a safe sentence to say.

#### 3-16. Treat discard-and-rebuild as a normal option — especially early

- Weigh **rebuild against incremental change on the merits of the change in front of
  you**, not on a reflex that rewriting is always reckless. When requirements are
  still fluid — early in a project, or after a pivot — the first implementation was
  built on assumptions that have since moved, and rebuilding from the *current*
  understanding is frequently cheaper and cleaner than bending the old shape.
- Use the **Strangler Fig** approach where a big-bang replacement would be risky:
  stand the new implementation up beside the old behind the same boundary, route
  traffic over gradually, retire the old one once the new carries the load. A clean
  boundary (§3-14) is what makes strangling possible at all.
- Let **fitness functions** guard what a rebuild must not break — the tests,
  performance budgets, and architectural checks a rebuilt module must still pass. A
  rebuild backed by fitness functions is a safe move; one with nothing asserting the
  old guarantees is a leap.

#### 3-17. Record the decision to rebuild

- When choosing to rebuild a module rather than change it incrementally, the reason
  MUST be recorded in the PR description or an ADR: what the module was, why the
  incremental path was worse, and what the rebuild must preserve (the contract, the
  fitness functions).
- MUST NOT silently rewrite. An unexplained rebuild costs the reviewer the ability
  to tell a reasoned sacrifice from churn, and costs the next reader the reasoning
  they will need when *they* face the same call.
- Capture, in the same record, **what you learned from the discarded version** — the
  assumption that turned out wrong, the edge case the first cut missed. The value of
  a sacrificial first version is partly the lessons it bought; write them down so
  the rebuild does not re-buy them.

#### 3-18. Do not gold-plate the first version (YAGNI)

- Build the first version to **the requirement in front of you**, not a speculative
  future. The whole strategy depends on the first version being *cheap enough to
  throw away*; one pre-loaded with abstractions for demand that may never arrive is
  expensive to build, understand, and — the cruel part — discard, which quietly
  removes the sacrificial option you were trying to keep.
- MUST NOT fall into the **second-system effect** — Brooks's warning that the second
  system a team designs is the most dangerous, because they over-engineer it with
  every feature held back from the first. A sacrificial rebuild replaces a module
  with the **simplest thing that meets current requirements**, so it too stays cheap
  to sacrifice next time. Rebuild lean, not baroque.

### Multi-tenancy — decide isolation before the first table

Isolation is one of the few architectural properties dramatically cheaper built
in than retrofitted: a shared table with no tenant boundary, once it holds two
customers' production data, cannot be split into per-tenant databases without a
migration project. We name the endpoints and the middle with the industry's
**silo / pool / bridge** vocabulary.

#### 3-19. Decide the isolation model before the first tenant-scoped table

- Before the first tenant-scoped table exists, a project serving more than one
  tenant MUST choose an isolation model and record it in an ADR:
  - **Shared schema / pool** — one set of tables, every tenant-scoped row carries a
    `tenant_id`. Lowest cost per tenant, highest density, hardest isolation to
    guarantee (it rests on a discriminator column). Default for low-sensitivity,
    high-tenant-count products.
  - **Schema-per-tenant / bridge** — one database, one schema per tenant. Shared
    infrastructure, separate namespaces, per-tenant backup/restore granularity.
    Reasonable tenant counts, moderate sensitivity.
  - **Database-per-tenant / silo** — one database or instance per tenant. Strongest
    isolation and blast-radius containment, per-tenant keys and residency, highest
    cost and operational overhead. Reach for it when compliance demands physical
    separation or a contract requires it.
- The choice MUST be **driven by data classification and regulatory regime first**
  (per [Application Security](/application-security)), then bounded by cost and
  tenant count — never picked by default. SHOULD prefer the **least separation that
  satisfies the classification** — pool before bridge before silo.
- The ADR MUST name the chosen model, the compliance / data-sensitivity driver, the
  rejected alternatives, and when to revisit — and MUST be revisited when an
  incoming tenant's compliance profile exceeds what the current model guarantees. A
  **hybrid** (pooled standard tenants, siloed regulated ones) is legitimate when the
  ADR names the requirement that justifies it.

#### 3-20. Automate tenant provisioning regardless of model

- A new tenant's isolation boundary — row, schema, or database — MUST be created by
  **code, not by hand**: pool provisioning inserts the tenant record and RLS policy;
  bridge runs the migration set against a freshly created schema; silo stands up the
  per-tenant database and migrates it.
- Manual provisioning does not scale, drifts between tenants, and is the classic
  source of "tenant 47 is missing the RLS policy." Keep provisioning and migration
  on **one code path** so every tenant is identical by construction.

#### 3-21. Enforce pooled isolation at the database

- In the shared-schema model the tenant boundary is a column value, and
  application-only filtering is one forgotten `WHERE tenant_id = ?` away from a
  cross-tenant leak. Pooled tenant boundaries MUST be enforced **at the database**
  with Row-Level Security — set the current tenant in a session variable and let an
  RLS policy scope every query — not only in application query code.
- This is defence in depth consistent with [Application
  Security](/application-security)'s "assume breach": the boundary holds even when a
  query forgets its filter.

#### 3-22. Design against the noisy neighbour

- Sharing infrastructure means one tenant's load can starve others. The isolation
  model sets exposure: pooled tenants share a connection pool and query capacity and
  are most exposed; silo tenants are naturally insulated.
- Whatever the model, the ADR SHOULD state the **performance-isolation stance** —
  per-tenant rate limits, connection quotas, or the explicit acceptance that
  low-tier tenants share best-effort capacity — so the trade is deliberate rather
  than discovered under load.

## References

**Deployment shape — monolith first & the cost of distribution**

- Martin Fowler — MonolithFirst — <https://martinfowler.com/bliki/MonolithFirst.html>
- Martin Fowler — Microservice Premium — <https://martinfowler.com/bliki/MicroservicePremium.html>
- Simon Brown — Modular Monoliths — <https://www.codingthearchitecture.com/presentations/sa2015-modular-monoliths>
- Kamil Grzybek — Modular Monolith: A Primer — <https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer>
- Shopify (Kirsten Westeinde) — Deconstructing the Monolith — <https://shopify.engineering/deconstructing-monolith-designing-software-maximize-developer-productivity>
- David Heinemeier Hansson — The Majestic Monolith — <https://signalvnoise.com/svn3/the-majestic-monolith/>
- L. Peter Deutsch et al. — Fallacies of Distributed Computing — <https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing>

**Package internals — boundary architectures**

- Eric Evans — *Domain-Driven Design* (2003): Bounded Context, Anti-Corruption Layer — <https://www.domainlanguage.com/ddd/>
- DDD-crew — Anticorruption Layer pattern (Context Mapping) — <https://github.com/ddd-crew/context-mapping>
- Alistair Cockburn — Hexagonal Architecture (Ports & Adapters) — <https://alistair.cockburn.us/hexagonal-architecture>
- Robert C. Martin — The Clean Architecture / The Dependency Rule — <https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html>
- Jeffrey Palermo — The Onion Architecture — <https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/>
- Gary Bernhardt — Boundaries (functional core, imperative shell) — <https://www.destroyallsoftware.com/talks/boundaries>
- Package by feature, not layer — <https://phauer.com/2020/package-by-feature/>

**Vendor neutrality — lock-in, portability, decision records**

- Michael Nygard — Documenting Architecture Decisions (ADR) — <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions>
- Architecture Decision Records — <https://adr.github.io/>
- Gregor Hohpe — "Don't get locked up into avoiding lock-in" — <https://martinfowler.com/articles/oss-lockin.html>
- ISO/IEC 25010 — Portability (adaptability, replaceability) — <https://iso25000.com/index.php/en/iso-25000-standards/iso-25010>

**Rebuildable boundaries — sacrificial & evolutionary architecture**

- Martin Fowler — Sacrificial Architecture — <https://martinfowler.com/bliki/SacrificialArchitecture.html>
- Martin Fowler — Strangler Fig Application — <https://martinfowler.com/bliki/StranglerFigApplication.html>
- Neal Ford, Rebecca Parsons, Patrick Kua — Building Evolutionary Architectures (fitness functions) — <https://evolutionaryarchitecture.com/>
- Martin Fowler — Yagni — <https://martinfowler.com/bliki/Yagni.html>
- The Twelve-Factor App — Disposability — <https://12factor.net/disposability>
- Fred Brooks — *The Mythical Man-Month* (the second-system effect) — <https://en.wikipedia.org/wiki/Second-system_effect>

**Multi-tenancy — tenant isolation**

- AWS — *SaaS Architecture Fundamentals: Tenant Isolation* (silo / pool / bridge) — <https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/tenant-isolation.html>
- AWS — *SaaS Architecture Fundamentals: Tenant Onboarding* (automated provisioning) — <https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/tenant-onboarding.html>
- Microsoft — Architecture approaches for multitenancy: Tenancy models — <https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models>
- Microsoft — Noisy Neighbor antipattern — <https://learn.microsoft.com/en-us/azure/architecture/antipatterns/noisy-neighbor/noisy-neighbor>
- PostgreSQL — Row Security Policies (RLS for pool isolation) — <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the AI code review this standard's structural rules are checked under.
- [Coding Style Guide](/style-guide) — the Dependency Rule, Ports & Adapters, `Result` errors, and the KISS/YAGNI dependency ladder this page operationalises.
- [Infrastructure Planning Policy](/infra-planning-policy) — managed/serverless preference, stateless & disposable runtime, lock-in and exit-cost weighing.
- [Application Security](/application-security) — data classification, mandatory security review, and the "assume breach" stance behind tenant isolation.
- [Repository Documentation Standards](/repository-documentation-standards) — where ADRs and the regeneration basis live, versioned beside the code.
