# Coding Style Guide

Language-agnostic coding policy for OSBR repositories. Per-language policy:

* [TypeScript Style Guide](/style-guide-typescript)
* [Golang Style Guide](/style-guide-golang)
* [Python Style Guide](/style-guide-python)
* [HTML & CSS Style Guide](/style-guide-html-css)

## How to read this guide

* **Requirement levels** follow RFC 2119. **MUST** / **MUST NOT** are absolute.
  **SHOULD** / **SHOULD NOT** state a strong default that MAY be overridden only
  with a documented reason. **MAY** marks a choice left to the author.
* **Rule tags.** Every rule carries exactly one tag. 🌎 (**Industry standard**)
  is backed by an official or widely adopted source. 🏠 (**OSBR house rule**) is
  deliberately stricter than, or divergent from, mainstream practice; every 🏠
  section ends with a *Rationale:* line naming the baseline it diverges from.
  Sources are listed under References.
* **Worked examples.** The per-language pages state a rule, then show it with a
  ❌ counter-example followed by the ✅ form to write instead.
* **Defined terms.** Words in **bold links** are defined in the
  [Technical Glossary](/technical-glossary).

[[TOC]]

## 1. Correctness by Construction — Zero Runtime Errors 🏠

Every rule below serves one goal: eliminate avoidable runtime errors and make
the unavoidable ones explicit.

* Avoidable errors MUST be moved to compile time. Illegal states MUST be made
  unrepresentable through the type system (strict types, total types,
  discriminated unions, [**Brand Type**](/technical-glossary#brand-type)s) rather
  than guarded at runtime.
* Code MUST NOT fail at runtime for a condition the types could have rejected:
  no `any` escape hatch, no unchecked `null` / `undefined`, no unvalidated
  external input reaching the pure core.
* Unavoidable failures (IO, network, DB, external input) MUST be handled
  explicitly as values ([**Result (Either)**](/technical-glossary#result-either) /
  [**Option (Maybe)**](/technical-glossary#option-maybe), §5) and MUST NOT be
  left to throw uncaught.

*Rationale: literal zero runtime errors is impossible — external systems fail.
The target is to make every avoidable error a compile error and every
unavoidable one an explicit, handled value. The strict-typing, total-type, and
error-handling rules below are the mechanism.*

## 2. Functional Style 🏠

* Project code MUST NOT use classes. Prefer functions, plain data, and
  composition.
* Project code MUST NOT mutate data in place.
* Functions MUST be free of [**Side Effect**](/technical-glossary#side-effect)s;
  IO MUST be pushed to the boundary (§3-5, §5).
* Dependencies SHOULD be inverted by passing behavior as a
  [**Higher Order Function**](/technical-glossary#higher-order-function), not by
  hard-wiring a concretion.
* Classes and mutation MAY be used inside external libraries, or at framework
  boundaries that require them (e.g. React error boundaries, ORM entities).

*Rationale: stricter than mainstream, which permits classes and limits
immutability to the binding level.*

## 3. Design Principles & Separation of Responsibilities

These rules apply the handbook's
[**Clean Architecture**](/technical-glossary#clean-architecture),
[**DiP**](/technical-glossary#dip-dependency-inversion-principle),
[**DI**](/technical-glossary#di-dependency-injection), and
[**Ubiquitous Language**](/technical-glossary#ubiquitous-language) commitments.
SOLID is stated paradigm-neutrally; Robert C. Martin restates it without
reference to classes.

### 3-1. Single Responsibility 🌎

* A module MUST have one reason to change — one *actor* (person or business
  function). Group code that changes for the same reason; separate code that
  changes for different reasons.
* The rule applies to functions and modules, not only classes.

*Rationale: SRP is a cohesion rule, not "do one thing." The function-cohesion
reading is the functional community's.*

### 3-2. Separation of Concerns 🌎

* Each concern — domain rules, application orchestration, IO, presentation —
  MUST live in its own module.

*Rationale: the term originates with Dijkstra (EWD447, 1974).*

### 3-3. The Dependency Rule 🌎

* Source-code dependencies MUST point inward only. An inner layer MUST NOT know
  anything about an outer layer.
* **Domain (Entities)** — enterprise-wide business rules. MUST be pure: no
  [**Side Effect**](/technical-glossary#side-effect), no IO; built from
  [**Value Object**](/technical-glossary#value-object)s named in the
  [**Ubiquitous Language**](/technical-glossary#ubiquitous-language).
* **Application (Use Cases)** — application-specific rules orchestrating the
  domain.
* **Infrastructure** — UI, DB, frameworks; outermost and replaceable.
* The Domain MUST NOT import from Application or Infrastructure — Domain-Driven
  Design concentrates domain-model code in one isolated layer (Evans).

*Rationale: an entity "can be a set of data structures and functions" (Martin),
so a pure functional domain is in scope; the layer count is an example, not a
mandate.*

### 3-4. Dependency Inversion 🌎 *(functional mapping is community practice)*

* High-level modules MUST depend on abstractions, not concretions
  ([**DiP**](/technical-glossary#dip-dependency-inversion-principle)).
* In no-classes code, dependencies MUST be inverted by passing functions inward:
  the inner layer declares the signature it needs; an outer layer supplies it
  ([**Higher Order Function**](/technical-glossary#higher-order-function) /
  [**DI**](/technical-glossary#di-dependency-injection)).
* A port with several operations SHOULD be a record of functions, not a
  multi-method interface.

*Rationale: the function mapping is Seemann's synthesis, not Martin's wording.*

### 3-5. Ports & Adapters 🌎

* The pure core MUST define *ports*; technology-specific IO MUST live in
  *adapters* at the boundary. Inner code MUST NOT leak to the outside.

*Rationale: Hexagonal Architecture (Cockburn); the structural form of §5's
boundary rule — Bernhardt's "functional core, imperative shell."*

### 3-6. Responsibility Segregation 🌎

* A function SHOULD either perform an effect (command) or return a value
  (query), not both (Command–Query Separation, Meyer).
* CQRS (separate read and write models) MUST NOT be a default. It MAY be used
  only where a specific bounded context requires it.

*Rationale: Fowler — "for most systems CQRS adds risky complexity"; using it by
default is [**Over Engineering**](/technical-glossary#over-engineering) (§4).*

## 4. Simplicity First — KISS / YAGNI 🌎

* Abstractions MUST NOT be added before they are needed: no interface with a
  single implementation, no factory for a single product, no config for a value
  that never changes.
* Deletion SHOULD be preferred over addition, and boring over clever.
* The standard library, then an already-installed dependency, MUST be preferred
  before writing custom code or adding a new dependency.
* Non-obvious design decisions MUST be recorded as an
  [**ADR**](/technical-glossary#adr-architecture-decision-record), not encoded in
  speculative abstraction.

## 5. Error Handling

* Failures MUST be returned as values
  ([**Result (Either)**](/technical-glossary#result-either)), not thrown.
  Absence MUST be represented with
  [**Option (Maybe)**](/technical-glossary#option-maybe), not `null`.
* Programmer bugs, broken invariants, and impossible states MUST throw or panic:
  crash, log, no recovery.
* Expected failures (bad input, not-found, IO failure) MUST return a `Result`.
  Test: *"would retrying succeed?"* — yes → `Result`; no → throw.
* `try`/`catch` MUST be confined to the boundary (IO / network / DB) and convert
  throws into a `Result` there. The pure core MUST stay free of `try`/`catch`.
  One top-level catch-all SHOULD remain as a safety net.
* Errors MUST be collected in an array (`E[]`); a single error is length 1.
* Context MUST be appended to the flat error array (chain), not nested.

*Rationale: Go 🌎 — errors-as-values is mandated by Go. TypeScript & Python 🏠 —
Google's guides and PEP 8 use exceptions; the `Result` policy is an OSBR choice.*

## 6. Formatting & Tooling 🌎

* Editors MUST format on save.
* Formatting MUST be enforced by tooling (gofmt, Prettier / gts, Black / Ruff);
  see each language page.
* Repositories MUST use the shared config templates
  ([`templates/`](https://github.com/osbrjp/handbook/tree/main/templates)):
  the language-agnostic `.editorconfig` plus the per-language formatter config.
  The same files ship in `osbrjp/standard-repository`, so a repo scaffolded from
  that template already carries them.
* [**TDD**](/technical-glossary#tdd-test-driven-development) SHOULD be used; the
  pure core (§3-5) is testable without mocks.

## References

* Robert C. Martin, The Single Responsibility Principle — <https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html>
* Robert C. Martin, SOLID Relevance — <https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html>
* Robert C. Martin, The Clean Architecture — <https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html>
* Alistair Cockburn, Hexagonal Architecture — <https://alistair.cockburn.us/hexagonal-architecture>
* Edsger W. Dijkstra, EWD447, On the role of scientific thought — <https://www.cs.utexas.edu/~EWD/transcriptions/EWD04xx/EWD447.html>
* Eric Evans, Domain-Driven Design — <https://fabiofumarola.github.io/nosql/readingMaterial/Evans03.pdf>
* Gary Bernhardt, Boundaries — <https://www.destroyallsoftware.com/talks/boundaries>
* Martin Fowler, CQRS — <https://martinfowler.com/bliki/CQRS.html>
* Martin Fowler, CommandQuerySeparation — <https://martinfowler.com/bliki/CommandQuerySeparation.html>
* Mark Seemann, SOLID: the next step is Functional — <https://blog.ploeh.dk/2014/03/10/solid-the-next-step-is-functional/>
* Google TypeScript Style Guide — <https://google.github.io/styleguide/tsguide.html>
* Go Code Review Comments — <https://go.dev/wiki/CodeReviewComments>
* Uber Go Style Guide — <https://github.com/uber-go/guide/blob/master/style.md>
* Effective Go — <https://go.dev/doc/effective_go>
* PEP 8 — <https://peps.python.org/pep-0008/>
* Google Python Style Guide — <https://google.github.io/styleguide/pyguide.html>
