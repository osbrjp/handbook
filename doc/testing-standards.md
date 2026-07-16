# Testing Standards

This is the standard the [Quality Gate](/quality-gate)'s **Reliability** lens
holds work to for testing. It expands the one line the [Coding Style
Guide](/style-guide) carries — *"TDD SHOULD be used"* — into a working standard:
what to test, how, where it runs, and how we tell a genuinely healthy suite from
one that merely goes green. It builds on the [Infrastructure Planning
Policy](/infra-planning-policy) (which measures delivery with DORA and runs
CI/CD from the reviewed main line). Deviations are allowed, but — as everywhere
in the handbook — they must be deliberate and justified in the project's design
notes.

Testing is where OSBR's values become executable. **Be Nice**: a test is the
clearest documentation a teammate or future maintainer will read, so every one
describes a behaviour in plain terms. **Be Kind**: a red or flaky CI on main
blocks everyone, so keeping the suite fast, green, and honest is a duty owed to
the team, not a personal preference. **Be Strong**: tests exist to find the
failure before a user does, so they must run against the real thing and target
the conditions most likely to break. Humans and AI agents write tests here as
collaborators — and that partnership carries a specific hazard this policy names
head-on (§3-14).

## How to read this policy

* **Requirement levels** follow RFC 2119, as in the [Coding Style
  Guide](/style-guide). **MUST** / **MUST NOT** are absolute. **SHOULD** /
  **SHOULD NOT** state a strong default overridable only with a documented
  reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is
  named inline and cited under [References](#references). We adopt the *criteria*
  of large-scale practices and right-size them for an SME — we do not adopt the
  headcount or infrastructure behind their reference setups.

[[TOC]]

## 1. Goal

The goal of testing at OSBR is **fast, trustworthy evidence that the system does
what it should — and keeps doing it as it changes.** Concretely:

- Catch defects at the cheapest possible moment: a failing test on a laptop is
  cheaper than a failing check in CI, which is cheaper than an incident in
  production.
- Give every change a **regression net** so refactoring and dependency bumps are
  safe rather than scary.
- Make behaviour **legible**: the test suite is the executable specification a
  new teammate — human or AI — reads to learn what the code promises.

A test that does not move one of these goals is waste. We optimise for evidence,
not for a number on a coverage badge (§3-11).

## 2. Responsibility

- The **author of a change owns its tests.** "Done" includes tests; a pull
  request that changes behaviour without changing tests MUST say why in its
  Specification / Test Plan section (per the [Development
  Guide](/development-guide)). This is the same implementer-owns-quality rule the
  Quality Gate states: verification is planned at design, not handed to a
  separate stage.
- The **reviewer** treats tests as part of the reviewable surface: they judge
  whether the tests describe the right behaviour and target the right
  boundaries, not merely whether they exist and pass. This is a natural
  extension of the always-on review the [Quality Gate](/quality-gate) requires.
- The **team** owns the health of shared CI: a flaky or perpetually-red main is a
  team-level defect (§3-13), and — like the DORA metrics in the [Infrastructure
  Planning Policy](/infra-planning-policy) — suite health is read as a team
  signal, never an individual rating.
- **AI agents** are first-class contributors of tests and are held to exactly the
  same bar. The human who merges an agent's tests owns them (§3-14).

## 3. Practices

### 3-1. Test early, as footholds — and against the real thing

Write tests from early development, not as a post-hoc chore. Early tests are
**footholds**: small, cheap checks that pin down behaviour as you climb, so each
step stands on solid ground. This is the spirit of Test-Driven Development
(Beck) — the pure core described in [Style Guide §3-5](/style-guide) is testable
without mocks, so there is little excuse to defer.

- Tests SHOULD be written alongside the code they cover, close enough in time
  that writing them still shapes the design.
- A foothold test MUST assert **against the real behaviour**, not against a mock
  wired to return the answer the author expects. A test that only passes because
  a mock was told to pass proves nothing about the system — it is a tautology
  with a green tick. **Be Strong** means the test can actually fail when the code
  is wrong.
- Where the unit under test genuinely owns logic (a domain calculation, a parser,
  a state transition), test that logic directly rather than testing that a mock
  was called.

### 3-2. Shape of the suite — Pyramid and Trophy

OSBR does not mandate a single silhouette; it mandates a **deliberate** one. Two
named models bound the sensible choices:

- The **Test Pyramid** (Cohn; popularised by Fowler): many fast unit tests, fewer
  integration tests, fewest end-to-end tests. Default here for backend and
  domain-heavy code, where the pure core is large and cheap to cover.
- The **Testing Trophy** (Kent C. Dodds): weight shifted toward integration
  tests, on the argument that integration gives the most confidence per unit of
  cost. Preferred for UI and glue-heavy code where units are thin and the risk
  lives in the wiring.

Rules that hold under either shape:

- Every project MUST pick a shape and record it (a sentence in the repo README or
  design notes is enough), so the distribution is a decision, not an accident.
- End-to-end tests MUST be the minority. They are the slowest and flakiest tier;
  use them to cover critical user journeys, not to re-test logic a unit already
  covers.

### 3-3. Test sizes — classify by cost, not just by layer

Adopt the **small / medium / large** taxonomy (Google) to describe what a test is
allowed to touch, independent of what layer it targets:

- **Small** — single process, no network, no real disk, no sleep. Milliseconds.
  These MUST make up the bulk of the suite and MUST run on every change.
- **Medium** — single machine, may touch localhost services (a real DB in a
  container, a local browser). Seconds.
- **Large** — multiple machines / real external systems. Reserved for the few
  journeys that genuinely need them.

Size is about **isolation and speed**, and it maps directly to where a test runs
(§3-12). Label or fold the sizes into the suite so CI can run small tests on
every push and gate the slower tiers appropriately.

### 3-4. Coverage of intent — one behaviour-describing test per public function

- Every public function MUST have **at least one test that describes a
  behaviour** — named for the behaviour, not for the function ("returns an error
  when the cart is empty", not "test_checkout_2"). This is the **Be Nice** rule:
  the test is documentation, so it must read like a sentence a teammate can
  trust.
- Prefer tests that state *intent* over tests that pin *implementation detail*, so
  a refactor that preserves behaviour keeps the tests green.
- Private helpers are covered transitively through the public surface; do not
  reach in to test internals unless the internal logic is complex enough to
  warrant its own foothold.

### 3-5. Target boundary conditions over test count

- Tests MUST target **boundary conditions** — empty, one, many; zero, negative,
  overflow; first, last, off-by-one; null / absent; timezone and encoding edges;
  the exact threshold and one either side. Bugs cluster at boundaries; the
  interior is usually uniform.
- **Test count is not a goal.** Ten near-duplicate happy-path tests are worth
  less than three that pin the boundaries. When a function has a natural space of
  inputs, express the boundaries as **parameterized / table-driven tests** rather
  than copy-pasting cases — and consider property-based testing (§3-9) when the
  space is large.

### 3-6. Domain-layer regression tests — parameterized, faked, kept green in CI

The domain layer is where OSBR's value lives and where regressions hurt most. It
is also, by the hexagonal design in [Style Guide §3](/style-guide), the layer
with no real IO — so it is cheap to guard densely.

- Domain logic SHOULD be covered by **parameterized regression tests**: a table
  of (input, expected) cases that grows by one row every time a bug is found, so
  the same bug can never return silently.
- These tests MUST use **fakes** — in-memory implementations of the ports (an
  in-memory repository, a deterministic clock) — not mocks that merely assert
  calls. A fake is a real, working substitute; it lets the domain run its actual
  logic against predictable dependencies.
- This suite MUST stay **green in CI on every change**. It is small (§3-3), so it
  runs everywhere, fast, and its redness always means a real regression — never
  environmental noise.

### 3-7. Integration tests against real dependencies

Mocks encode what we *believe* a dependency does; real dependencies encode what
it *actually* does. For the code that crosses a boundary — repositories, HTTP
clients, migrations, queries — the belief is exactly the thing under test.

- **Critical paths MUST be exercised against real dependencies**, not only mocks
  — this is the bar the [Quality Gate](/quality-gate) holds. Boundary code more
  broadly SHOULD be tested against a **real instance** of its dependency: a
  real database, a real message broker, a real headless browser — not a mock of
  one. **Testcontainers** is the standard way to bring a throwaway real
  dependency up for the duration of the test.
- These are **medium** tests (§3-3): they run in CI and MAY be run locally, but
  MUST NOT gate the fast inner loop that small tests serve.
- A green integration test against a mock that "only passes" (§3-1) is the
  failure mode this rule exists to prevent. Prefer a real dependency you can
  actually break.

### 3-8. Contract testing across service boundaries

When two services are developed and deployed independently, integration tests on
each side can both pass while the two disagree about the wire format. **Contract
testing** (Pact) closes that gap: the consumer declares the interactions it
needs, and the provider is verified against that contract in its own pipeline.

- Independently-deployed services that talk to each other SHOULD have a
  consumer-driven contract, verified in CI on both sides, rather than relying on
  a shared end-to-end test to catch drift.
- This keeps the Test Pyramid honest: contract tests let each service stay fast
  and self-contained instead of dragging the whole system up for every check.

### 3-9. Property-based testing for input-heavy logic

Example-based tests check the cases the author thought of. **Property-based
testing** (fast-check for TypeScript, Hypothesis for Python) checks *invariants*
against hundreds of generated inputs, including the awkward ones no human
enumerates — and shrinks any failure to a minimal reproducing case.

- Logic with a large or adversarial input space (parsers, encoders/decoders,
  serialization round-trips, money and date arithmetic, sorting/merging) SHOULD
  be covered by at least one property (e.g. *decode(encode(x)) == x*, *the result
  is always sorted*, *the total is conserved*).
- Properties complement boundary tests (§3-5); they are how we let the machine
  hunt boundaries we would miss.

### 3-10. When to mock, deliberately

The two schools of TDD are a *tool-selection* guide, not a tribe to join:

- **Mockist** — test a unit in isolation by mocking its collaborators, asserting
  on interactions. Fits genuine *behaviour* boundaries: an outbound notification,
  a payment call — places where the interaction *is* the behaviour.
- **Classicist / state-based** — test through real collaborators (or fakes) and
  assert on resulting state. This is OSBR's **default**, because it aligns with
  our architecture: a large pure core (assert on returned values) and ports
  substituted by fakes (§3-6), not mocks.

Rule: **reach for a mock only at a true seam** — an expensive, non-deterministic,
or side-effecting boundary. Mocking a collaborator that owns real logic produces
the tautological green tick of §3-1. When in doubt, prefer a fake over a mock.

### 3-11. Coverage is a metric; mutation testing checks the tests

- **Code coverage is a metric, not a goal.** High coverage with weak assertions
  is a suite that executes code without checking it — it goes green while proving
  little. OSBR MUST NOT set a coverage percentage as an acceptance gate. Coverage
  is useful in one direction only: it reliably tells you what is *un*tested, so
  treat a drop as a prompt to look, never a target to farm.
- To ask the sharper question — *would my tests actually catch a bug?* — use
  **mutation testing** (Stryker for JS/TS). It injects small faults into the code
  and checks that some test fails; surviving mutants are lines your suite
  executes but does not truly test. Mutation testing SHOULD be run periodically
  (e.g. scheduled, or on the domain layer) rather than on every push, since it is
  expensive. A high mutation score is worth far more than a high coverage number.

### 3-12. Where tests run — local-agnostic vs CI production-simulating

Where a test runs follows from its size (§3-3) and from OSBR's CI/CD stance
(deploy from the reviewed main line, dev/staging/prod at parity — see the
[Infrastructure Planning Policy](/infra-planning-policy)):

- **Small tests** (§3-3) MUST be **environment-agnostic**: they run identically
  on any developer's laptop and in CI, with no network, no credentials, no
  external service. They are the inner loop.
- **Medium and large tests** — real dependencies via Testcontainers (§3-7),
  browser journeys, contract verification (§3-8) — run in **CI, which simulates
  production**: same build artifact, same runtime shape, real dependencies stood
  up in containers. They MAY be run locally but the authoritative run is CI.
- Tests MUST NOT depend on a shared, hand-maintained environment: parity comes
  from IaC and containers, not from a fragile staging box everyone shares. This
  is what lets the same artifact be promoted unchanged from dev to production.

### 3-13. Flaky tests are quarantined, not ignored

A test that passes and fails without a code change is worse than no test: it
trains the team to ignore red. **Be Kind** to everyone downstream of a flaky
main.

- A confirmed flaky test MUST be **quarantined** immediately — moved out of the
  blocking suite (e.g. tagged/skipped in the gate) and **tracked by an issue**,
  so main stays trustworthy while the flake is investigated.
- Quarantine is a holding cell, not a graveyard: a quarantined test MUST be fixed
  or deliberately deleted within a bounded time, not left skipped forever.
- Silencing a flake by deleting the assertion, adding a blind `sleep`, or
  retrying until green is prohibited — that hides the signal instead of fixing
  it.

### 3-14. "Many AI-generated tests pass" is not a healthy codebase

OSBR embraces human ⇄ AI cooperation, and agents are productive at generating
tests. That productivity carries a specific trap: **a large, green, AI-generated
suite can look like health while proving almost nothing.** Generated tests skew
toward happy-path assertions, toward asserting on mocks the same agent wired up
(§3-1), toward restating the implementation rather than the intent, and toward
volume over boundaries (§3-5). A thousand such tests passing is not evidence the
system works.

Therefore, for AI-generated tests specifically:

- The merging human MUST review them against this policy exactly as they would a
  human's — **do not treat a passing generated suite as self-justifying.**
- Reviewers MUST spot-check that the tests can actually fail: that assertions are
  on real behaviour, that boundaries (§3-5) are covered, that mocks appear only
  at true seams (§3-10). A quick mutation-testing pass (§3-11) is the sharpest
  way to catch a suite that executes everything and verifies nothing.
- **Count is never the signal.** As everywhere in this policy, we judge tests by
  the evidence they produce, not by how many there are — and the ease of
  generating tests makes that discipline *more* important here, not less.

## References

**Test-driven development & schools**

- Kent Beck, *Test-Driven Development: By Example* — <https://www.oreilly.com/library/view/test-driven-development/0321146530/>
- Martin Fowler, "Mocks Aren't Stubs" (classicist vs mockist) — <https://martinfowler.com/articles/mocksArentStubs.html>
- Steve Freeman & Nat Pryce, *Growing Object-Oriented Software, Guided by Tests* — <http://www.growing-object-oriented-software.com/>

**Suite shape**

- Mike Cohn, *Succeeding with Agile* — the Test Pyramid — <https://www.mountaingoatsoftware.com/blog/the-forgotten-layer-of-the-test-automation-pyramid>
- Martin Fowler, "The Practical Test Pyramid" — <https://martinfowler.com/articles/practical-test-pyramid.html>
- Kent C. Dodds, "The Testing Trophy and Testing Classifications" — <https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications>
- Google Testing Blog, "Test Sizes" (small / medium / large) — <https://testing.googleblog.com/2010/12/test-sizes.html>

**Techniques & tools**

- Testcontainers — real dependencies in throwaway containers — <https://testcontainers.com/>
- Pact — consumer-driven contract testing — <https://docs.pact.io/>
- fast-check — property-based testing for TypeScript/JavaScript — <https://fast-check.dev/>
- Hypothesis — property-based testing for Python — <https://hypothesis.readthedocs.io/>
- Stryker — mutation testing — <https://stryker-mutator.io/>

**Coverage & flakiness**

- Martin Fowler, "Test Coverage" (coverage as a guide, not a target) — <https://martinfowler.com/bliki/TestCoverage.html>
- Martin Fowler, "Eradicating Non-Determinism in Tests" — <https://martinfowler.com/articles/nonDeterminism.html>
- Google Testing Blog, "Flaky Tests at Google and How We Mitigate Them" — <https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the Reliability lens this standard serves.
- [Coding Style Guide](/style-guide) — the pure core, ports & fakes, RFC 2119 levels.
- [Infrastructure Planning Policy](/infra-planning-policy) — CI/CD stance, dev/prod parity, DORA metrics.
- [Development Guide](/development-guide) — pull-request Specification / Test Plan, the `run-tests` action.
