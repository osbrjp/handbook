# Observability & Resilience

This is the standard the [Quality Gate](/quality-gate)'s **Reliability** lens
holds running systems to. It fills in the concrete defaults behind the
observability and resilience principles the [Infrastructure Planning
Policy](/infra-planning-policy) states (§1-5 *Reliability and Delivery Are
Measured*, §1-6 *Observability Is Built In*): that policy says *what* we hold to
— emit structured logs, metrics, and traces; hold an SLO; design with timeouts,
retries, circuit breakers, and health checks — and this page says *how*: the
exact log schema, the timeout and retry defaults, and what is allowed to wake a
human. A principle nobody can fail is a principle nobody follows, so these
defaults are checkable: a log line either has the required fields or it does
not; an external call either has a timeout or it does not. Deviations are
allowed, but — as everywhere in the handbook — they must be deliberate and
justified in the project's design notes.

This is also where **human⇄AI collaboration** meets the running system. We write
for both humans and AI. The same structured logs, metrics, and traces that let
an on-call engineer find a fault are what let an AI agent investigate one —
trace an error to its span, read the error budget, propose the rollback.
Observability that only a human can read is half-built. Ship telemetry an agent
can query.

**Requirement levels** follow RFC 2119, as elsewhere in the handbook.
**MUST** / **MUST NOT** are absolute; **SHOULD** / **SHOULD NOT** state a strong
default overridable only with a documented reason; **MAY** marks a free choice.
Where a rule adopts an industry practice, the practice is named inline and cited
under [References](#references) — we adopt the *criteria* of large-scale
practice and right-size them for an SME.

[[TOC]]

## 1. Goal

**Make every OSBR system observable enough to operate to an SLO, and resilient
enough to absorb the failures a distributed system will always have — without
paging a human for anything a machine can handle.**

Concretely, a service that meets this policy can answer, from its telemetry
alone:

- Is it up, is it ready, and is the business function actually working? (§4)
- When it broke, *where* did the request fail and *why*? (§2, §3)
- How much of the error budget is left, and is it burning? (§5, §6)
- When a dependency failed, did we contain it or cascade it? (§7)

This serves the values directly. **Be Nice** — we do not wake a colleague at 3am
for something a retry would have fixed. **Be Kind** — we mask personal data in
our telemetry so that watching the system never becomes surveilling the people
in it. **Be Strong** — a resilient system carries load and recovers on its own
instead of collapsing onto the on-call engineer.

## 2. Responsibility

Every service, worker, job, and function OSBR ships is responsible for its own
observability and its own resilience. This is not a platform team's job to bolt
on afterwards — per [Infra §1-6](/infra-planning-policy), it is built in from day
one. It is the same implementer-owns-quality rule the [Quality
Gate](/quality-gate) states: verification is planned at design, not handed to a
separate stage.

- **The author of a component** owns its log schema conformance, its
  instrumentation (traces + metrics), its health checks, and the
  timeout/retry/circuit-breaker configuration on every call it makes outward.
- **The reviewer** — through the always-on review the [Quality
  Gate](/quality-gate) requires — checks that new external calls carry the §7
  resilience defaults and that no new log field leaks personal data (§8).
- **The team** owns the SLOs, the alert rules, and the rollback triggers, and
  treats the [DORA](https://dora.dev/) four keys and SLO burn as team signals,
  never individual ratings.

We lean on published, freely available standards rather than inventing our own
vocabulary: Google's [SRE practice](https://sre.google/books/) for
SLI/SLO/error budgets and the four golden signals,
[OpenTelemetry](https://opentelemetry.io/) for the wire format of
traces/metrics/logs, the [RED and USE
methods](https://www.brendangregg.com/usemethod.html) for *which* metrics, and
Michael Nygard's [*Release
It!*](https://pragprog.com/titles/mnee2/release-it-second-edition/) for the
resilience patterns.

## 3. Structured Logging

Logs are event streams (per [Twelve-Factor](https://12factor.net/logs), echoed
in [Infra §1-6](/infra-planning-policy)): the process writes to stdout, the
platform ships them to a central store. The process must never manage log files,
rotation, or routing.

Every log line is **a single JSON object, one per line** (JSON Lines).
Human-formatted, multi-line, or free-text logs are for local development only
and MUST NOT reach a deployed environment.

### 3-1. Minimum Log Schema

Every log line from every component **MUST** carry at least these fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `timestamp` | string | **MUST** | ISO 8601 / RFC 3339, UTC, millisecond precision (`2026-07-15T09:12:33.482Z`). |
| `level` | string | **MUST** | One of `debug`, `info`, `warn`, `error`, `fatal`. |
| `service` | string | **MUST** | Stable service name, matching the OpenTelemetry `service.name` (§5). |
| `message` | string | **MUST** | Human-readable summary. A constant string per event; put the variables in their own fields, not interpolated into the message. |
| `trace_id` | string | **MUST** when a request/trace context exists | The OpenTelemetry trace ID, so a log line joins its trace (§5). |
| `span_id` | string | SHOULD | The active span, for the same reason. |
| `request_id` | string | **MUST** for request-handling components | Correlates all logs of one inbound request even without a full trace. |
| `error` | object | **MUST** when `level` is `error`/`fatal` | `{ "type", "message", "stack" }`. Never log an error as a bare string; never swallow it silently. |

A conformant `error`-level line:

```json
{
  "timestamp": "2026-07-15T09:12:33.482Z",
  "level": "error",
  "service": "checkout-api",
  "message": "payment authorization failed",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "request_id": "req_01J9Z3K8",
  "error": { "type": "GatewayTimeout", "message": "upstream timed out after 2000ms", "stack": "..." },
  "env": "production",
  "version": "2026.07.15-a1b2c3d"
}
```

### 3-2. Rules

- Services **SHOULD** also include `env` (dev/staging/production) and `version`
  (the deployed build/commit) so a log line is attributable to an environment
  and a release — this is what lets you tie an error spike to a specific deploy,
  and feeds the DORA change-failure signal.
- Choose `level` by **actionability**, not by volume. `error` means *a human or
  agent may need to act*; a handled, retried, recovered failure is `warn` or
  `info`. If everything is `error`, nothing is.
- Field names are **stable and flat**. Adding a field is fine; renaming or
  re-typing an existing one breaks every query and dashboard built on it — treat
  the schema as an interface.
- Logs answer *why*. For *how much* and *how often*, use metrics (§4) — do not
  reconstruct rates by counting log lines when a counter is cheaper and exact.

## 4. Metrics & Health Checks

### 4-1. The Four Golden Signals, RED, and USE

Instrument every service for Google SRE's **four golden signals** — **latency,
traffic, errors, saturation**. In practice:

- **Request-driven services** (APIs, workers): use the **RED** method —
  **R**ate, **E**rrors, **D**uration — per endpoint/route. This covers latency,
  traffic, and errors.
- **Resources** (CPU, memory, connection pools, queues): use the **USE** method
  — **U**tilization, **S**aturation, **E**rrors. This covers saturation.

Metrics **MUST** be exported via OpenTelemetry (§5). Emit latency as a
**histogram**, not an average — an average hides the tail, and the tail is where
users feel pain. Alert and SLO on percentiles (p95/p99).

### 4-2. Three Distinct Health Checks

A single `/health` endpoint conflates three different questions and gets used
wrongly. OSBR distinguishes them, and every long-running service **MUST** expose
them separately:

| Check | Question | If it fails | MUST NOT |
|-------|----------|-------------|----------|
| **Liveness** | Is the process alive and not deadlocked? | Orchestrator **restarts** the instance. | Check downstream dependencies — a dependency outage would trigger a pointless restart loop. |
| **Readiness** | Can this instance serve traffic *right now*? | Orchestrator **stops routing** to it (no restart). | Stay green while a required dependency (DB, cache) is unreachable. |
| **Business / deep health** | Is the core business function actually working end to end? | **Alerts** a human (§6); does not restart or de-route. | Be on the hot request path or run on every probe — it is heavier; run it on a schedule. |

The distinction is what stops the classic cascade: a shared dependency blips,
every service's liveness check fails, the orchestrator restarts the entire fleet
at once, and the blip becomes an outage. Liveness checks only what the process
itself owns.

## 5. Traces & OpenTelemetry

[OpenTelemetry](https://opentelemetry.io/) is the OSBR standard for all three
signals — traces, metrics, and logs — because it keeps instrumentation
vendor-portable (per [Infra §1-6](/infra-planning-policy)); the backend can
change without re-instrumenting the code.

- Every service **MUST** propagate **W3C Trace Context** (the `traceparent`
  header) on inbound and outbound calls, so a request keeps one `trace_id`
  across service boundaries. A trace that stops at a service boundary cannot
  show you where a distributed request failed.
- The `trace_id`/`span_id` in traces **MUST** be the same IDs written into logs
  (§3-1) — this correlation is the whole point: from a spike on a dashboard, to
  the slow span, to the exact log line, in three clicks (or three agent tool
  calls).
- Set a stable `service.name` resource attribute; it is the join key across
  logs, metrics, and traces.
- **Sample** in production (head or tail sampling) to control cost, but **always
  keep traces that contain an error**. The cheap traces are the ones you never
  need.

## 6. SLOs, Alerts & Self-Healing

### 6-1. Error Budgets

Per [Infra §1-5](/infra-planning-policy), reliability is measured, not assumed.
Each service defines **SLIs** (usually availability and latency, from the golden
signals) and an **SLO** target, agreed up front as a non-functional
requirement. The gap between the SLO and 100% is the **error budget** — the
amount of failure we have explicitly decided is acceptable. Self-healing spends
this budget silently; alerting is what we do when the *rate of spend* threatens
to exhaust it.

### 6-2. Alerts Wake a Human — So Alert Only on What a Human Must Fix

An alert is a claim that a human must act now. Every page that turns out to need
no action erodes trust in every future page (alert fatigue), and a tired on-call
engineer is neither Strong nor safe.

- Services **MUST** alert on **SLO burn rate and user-facing symptoms**, not on
  individual low-level metrics ([Infra §1-6](/infra-planning-policy)). "p99
  latency SLO is burning 10× budget" is a page; "CPU is at 80%" is not — 80% CPU
  with a healthy SLO is a system doing its job.
- If a condition is one a machine already handles — a retriable timeout, a
  single unhealthy instance being de-routed, a circuit breaker that opened and
  will half-open on its own — it **MUST NOT** page. Log it (§3), count it (§4),
  move on. Self-healing that still pages defeats its own purpose.
- Every alert **MUST** be actionable: it names a probable cause and points to a
  runbook. An alert with no action is a dashboard; put it on a dashboard. What
  happens once a page fires — escalation, roles, the postmortem — is the domain
  of [Incident Management](/incident-management).

### 6-3. Pre-Decided Rollback Triggers

Deploys must be reversible ([Infra §1-10](/infra-planning-policy)).
Reversibility is worthless if nobody decides to use it in time, and 3am is the
worst moment to invent the criteria. So the rollback triggers are **decided
before the deploy**, written down, and — where the platform allows — automated:

- Error rate exceeds *N×* the pre-deploy baseline for *M* minutes → **roll
  back**.
- SLO burn rate crosses the fast-burn threshold → **roll back**.
- A liveness or readiness check (§4-2) stays red past the deploy window → **roll
  back**.

Rolling back is the **Strong** move, not the failure. It is a normal, un-blamed
operation; the postmortem ([Incident Management](/incident-management)) asks
what the system missed, never who shipped it. Progressive delivery (canary /
blue-green, per [Infra §1-10](/infra-planning-policy)) is what makes these
triggers fire while a bad release still reaches few users.

## 7. Resilience Defaults on Every External Call

Every call that leaves the process — HTTP, database, cache, queue, third-party
API — **can and eventually will** fail, hang, or slow down (the fallacies of
distributed computing; how those boundaries are drawn is the domain of the
[Architecture Standards](/architecture-standards)). Michael Nygard's [*Release
It!*](https://pragprog.com/titles/mnee2/release-it-second-edition/) names the
patterns; these are OSBR's defaults. A call that reaches the network **MUST**
have all three of timeout, bounded retry, and a circuit breaker, unless the
design notes justify an exception. These defaults are checkable, so they
**SHOULD** be exercised against a real dependency in tests ([Testing
Standards](/testing-standards)) — a timeout you never fire is a timeout you do
not really have.

### 7-1. Timeouts

- **Every** external call **MUST** set an explicit timeout. The default
  connect/read timeout is a client library's most dangerous setting because it
  is so often *infinite* — one hung dependency exhausts your whole connection
  pool and takes you down with it.
- Set the timeout from the dependency's measured p99, not a guess. A caller's
  timeout **SHOULD** be shorter than its own caller's, so failures surface at
  the right layer instead of piling up.

### 7-2. Retries — Bounded, Backed Off, Jittered

- Retry **only idempotent** operations, and only on **transient** failures
  (timeouts, 429, 503, connection resets). Never retry a 400 or a 422 — the
  input is wrong; retrying just multiplies the load.
- Retries **MUST** be **bounded** (a small max, e.g. 3) with **exponential
  backoff *and* jitter**. Backoff without jitter synchronizes every client to
  retry at the same instant — a thundering herd that turns a blip into an
  outage. Jitter spreads them out.
- Respect a `Retry-After` header when the dependency sends one.

### 7-3. Circuit Breakers & Bulkheads

- Wrap a flaky dependency in a **circuit breaker**: after a threshold of
  failures it **opens** and fails fast for a cool-down window instead of
  hammering a service that is already down, then **half-opens** to test
  recovery. This is what gives the dependency room to heal — and what stops your
  retries from being the reason it can't.
- Use **bulkheads** to isolate resources (separate connection pools /
  concurrency limits per dependency) so that one saturated dependency cannot
  consume every worker and starve the healthy paths. Shed load at the edge
  rather than queue it unboundedly.

::: tip These are defaults, not dogma
A steady internal call to a fast, co-located dependency may not need a full
breaker. The rule is that the omission is *deliberate and justified in the
design notes* — recorded in the pull request's Specification per the
[Development Guide](/development-guide), the same standard
[Infra](/infra-planning-policy) sets for every deviation. The unacceptable case
is the call with no timeout because nobody thought about it.
:::

## 8. Privacy in Telemetry — Be Kind

Logs, metrics, and traces are **protected assets** ([Application
Security](/application-security)). Observability must never become surveillance
of users or colleagues.

- **PII MUST be masked or omitted** before it is written to any log, span
  attribute, or metric label. Names, emails, tokens, full card numbers, precise
  location, request bodies containing personal data — masked at the source, not
  in a downstream pipeline that might miss a field or a new code path.
- **Never** put secrets or credentials in telemetry. If one is logged, treat it
  as a leaked credential and revoke it immediately ([Application
  Security](/application-security)).
- Prefer **stable pseudonymous IDs** (a hashed user ID) over raw identifiers
  when you need to correlate a user's requests. You almost never need the real
  value to debug; you need to know it is *the same* user.
- No screenshots or telemetry containing personal data in issues, PRs, or
  channels without masking ([Application Security](/application-security)).

Masking protects the people in the system and it protects OSBR: telemetry an
attacker or a careless export can turn into a personal-data breach is a
liability, not an asset.

## References

Named, freely available standards this policy is built on.

**Reliability, SLOs & signals**

- Google SRE — *Site Reliability Engineering* & *The SRE Workbook* (SLI/SLO/error budgets, the four golden signals) — <https://sre.google/books/>
- Brendan Gregg — *The USE Method* — <https://www.brendangregg.com/usemethod.html>
- Tom Wilkie — *The RED Method* (Rate, Errors, Duration) — <https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/>

**Observability**

- OpenTelemetry (traces, metrics, logs; W3C Trace Context) — <https://opentelemetry.io/>
- W3C Trace Context — <https://www.w3.org/TR/trace-context/>
- The Twelve-Factor App — XI. Logs — <https://12factor.net/logs>

**Resilience patterns**

- Michael T. Nygard — *Release It!* (circuit breaker, bulkhead, timeout, fail fast) — <https://pragprog.com/titles/mnee2/release-it-second-edition/>
- Amazon Builders' Library — *Timeouts, retries, and backoff with jitter* — <https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/>
- Azure Cloud Design Patterns — <https://learn.microsoft.com/en-us/azure/architecture/patterns/>

**Delivery metrics**

- DORA (DevOps Research & Assessment) four keys — <https://dora.dev/>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the Reliability lens this standard serves.
- [Infrastructure Planning Policy](/infra-planning-policy) — §1-5, §1-6, §1-10; the observability and resilience principles this page makes concrete.
- [Testing Standards](/testing-standards) — exercising these defaults against real dependencies.
- [Development Guide](/development-guide) — the pull-request Specification where deviations are justified.
- [Incident Management](/incident-management) — escalation, on-call, and postmortems once an alert fires.
- [Architecture Standards](/architecture-standards) — how service boundaries are drawn.
- [Application Security](/application-security) — telemetry as a protected asset; PII and secret handling.
