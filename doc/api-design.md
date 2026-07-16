# API Design

This is the standard the [Quality Gate](/quality-gate)'s **Sustainability**
lens holds HTTP API work to. Where the [Development Guide](/development-guide)
covers how a change is proposed and reviewed, and the [Architecture
Standards](/architecture-standards) cover how a service is shaped internally,
this page covers the one thing consumers actually depend on: the **contract**
we expose over the wire. An API is the longest-lived promise most services
make — sustaining it means designing it once, consistently, so it can grow for
years without every addition becoming a new dialect. Deviations are allowed,
but — as everywhere in the handbook — they must be deliberate and justified in
the project's design notes.

This standard leans on the public HTTP standards and the enterprise API style
guides that already exist — [Fielding's REST
constraints](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm),
[HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110), the
[Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines),
the [Google API Design Guide (AIPs)](https://google.aip.dev/), and the [Zalando
RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)
— and **right-sizes them for an SME.** We adopt their *criteria* without
adopting their scale.

An API is where OSBR's values become a public interface. **Be Kind**: an API is
a promise you make to everyone downstream — client developers, integration
partners, your own future services, and the AI agents that call it without a
human reading the docs first — so a predictable, uniform surface that lets a
consumer reason about an endpoint by analogy with one it already knows is a
kindness owed to all of them. **Be Strong**: a uniform contract is the
load-bearing structure that lets the system grow without every addition
becoming a special case, and it is designed to fail safely under the retries
and partial outages real networks produce. **Be Nice**: the contract and its
definition are documentation a teammate — human or AI — reads to learn what the
system promises, so both must read plainly and stay honest.

## How to read this policy

* **Requirement levels** follow RFC 2119. **MUST** / **MUST NOT** are absolute.
  **SHOULD** / **SHOULD NOT** state a strong default overridable only with a
  documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry standard or style guide,
  it is named inline and cited under [References](#references). We adopt the
  criteria of large-scale guides and right-size them; we do not adopt the
  headcount or platform behind their reference setups.

[[TOC]]

## 1. Goal

Every business concept is exposed as a **resource**, and the *same* concept is
always found at the *same* URL, reached with the *same* method, at the *same*
granularity, and returned in the *same* representation — everywhere in the API.
A consumer who has learned one part of the API can predict the rest.

An inconsistent API forces every consumer to special-case every corner, and
that is where 3am incidents come from. This matters more, not less, as AI
agents become callers: an agent cannot ask a colleague "oh, that one endpoint
is weird" — it infers behaviour from patterns. When `GET /orders/{id}` and
`GET /invoices/{id}` behave identically in shape, status codes, pagination, and
errors, an agent that learned one can safely drive the other. Consistent with
OSBR building for AI users, uniformity here is not just developer ergonomics —
it is machine-readability, and human⇄AI cooperation depends on it.

## 2. Responsibility

- **The API author** owns the contract. Before adding or changing an endpoint,
  you are responsible for checking how neighbouring endpoints already behave and
  carrying those conventions over (§3-3). You do not get to invent a local
  convention.
- **The reviewer** rejects endpoints that break established conventions without
  a recorded reason, exactly as they would reject a security or schema
  violation. This is the AI code review the [Quality
  Gate](/quality-gate) requires.
- **The API definition** — the [OpenAPI](https://spec.openapis.org/) document
  (§3-9) — is the source of truth. Anything not captured there does not exist as
  far as consumers are concerned. Any RPC-style deviation, non-obvious read
  semantics, or idempotency guarantee MUST be recorded there.
- **AI agents** author and review API changes here as first-class contributors,
  held to exactly this bar; the human who merges an agent's change owns it.

## 3. Practices

### 3-1. Model business concepts as resources

- **MUST** model the API around **nouns (resources)**, not verbs (actions). A
  resource is a business concept — `order`, `invoice`, `member` — identified by
  a stable URL.
- **MUST** use plural collection names and address individual members by
  identifier: a collection at `/orders`, a member at `/orders/{id}`. This mirrors
  the ubiquitous language one-to-one, the same singular-entity / plural-collection
  discipline we hold the domain model to.
- **SHOULD** express relationships as sub-resources when a child only exists in
  the context of a parent — `/orders/{id}/line-items` — and as top-level
  resources with a reference field when the child has independent identity.
- **MUST NOT** encode actions in the path as a default (`/getOrder`,
  `/createOrder`, `/orders/{id}/doCancel`). The method carries the verb; the path
  carries the noun. (Exception: §3-5.)

This is levels 1 and 2 of the **[Richardson Maturity
Model](https://martinfowler.com/articles/richardsonMaturityModel.html)**
(Leonard Richardson; popularised by Martin Fowler): level 1 introduces
resources, level 2 uses HTTP verbs and status codes correctly. **Level 2 is the
OSBR baseline.** Level 3 (hypermedia / HATEOAS) is encouraged where it earns its
keep but is not mandated.

### 3-2. Same concept, same shape

The core rule. For any given business concept, these MUST be identical
everywhere it appears:

- **Path** — the concept lives at one canonical URL. `member` is `/members/{id}`;
  it is not `/members/{id}` in one service and `/users/{id}` in another for the
  same thing.
- **Method** — the same kind of operation uses the same verb across all resources
  (see §3-4).
- **Granularity** — if `order` is addressable as a whole, every comparable concept
  is addressable as a whole; you do not expose one concept field-by-field and
  another only as a monolithic blob without a reason.
- **Type / representation** — a concept serialises to the same JSON shape, with
  the same field names, casing, date format, money format, and null conventions,
  in every response that embeds it. An `order` embedded in a `GET /orders/{id}`
  looks like an `order` embedded in a `GET /customers/{id}/orders`.

Naming and representation are **house decisions, not per-endpoint choices.**
Field casing (`snake_case` vs `camelCase`), timestamp format (RFC 3339 / ISO
8601, UTC), money (integer minor units or decimal string — never a binary
float), enum spelling, and null-vs-absent semantics are decided **once per API**
and never re-litigated per endpoint. Pick the convention your primary style
guide dictates ([Google AIP-140/142](https://google.aip.dev/) and
[Zalando](https://opensource.zalando.com/restful-api-guidelines/) both give
concrete rulings) and hold every endpoint to it.

### 3-3. Confirm neighbouring conventions before adding an endpoint

- **MUST**, before adding an endpoint, read the nearest existing endpoints in the
  same API and carry their conventions over: pagination style, filtering syntax,
  error shape, authentication (per the [Application
  Security](/application-security) standard), status-code choices, naming, and
  versioning. The default answer to "how should this behave?" is "the way its
  neighbours already behave."
- **MUST** record any *deliberate* departure from a neighbouring convention in the
  API definition, with the reason. An undocumented departure is a bug.
- **SHOULD** treat the first endpoint of a new kind as setting precedent — design
  it knowing everything after it will copy it.

An endpoint is not a fresh design surface; it is another instance of an
already-agreed pattern. Consistency is a property you protect on every addition,
not one you can add back later.

### 3-4. Use HTTP semantics as defined

Follow **[HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110)**
and the [Fielding
constraints](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
(client–server, **stateless**, cacheable, uniform interface, layered system) as
written — do not invent local meanings for standard machinery.

- **Methods MUST carry their standard semantics:**
  - `GET` — read, **safe** (no side effects) and **idempotent**. Never mutate
    state on a `GET`.
  - `PUT` — full replace, **idempotent**.
  - `PATCH` — partial update.
  - `DELETE` — remove, **idempotent**.
  - `POST` — create / non-idempotent submission (see §3-6 for making it safe to
    retry).
- **Status codes MUST be used for their defined meaning** — `200/201/204` for
  success, `400/401/403/404/409/422` for client faults, `5xx` for server faults.
  Do not return `200` with an error body.
- **MUST** keep the server **stateless**: every request carries what it needs to
  be understood; no server-side session affinity. This is what lets a service
  scale horizontally and to zero, per the [Architecture
  Standards](/architecture-standards).
- **SHOULD** respect caching and concurrency headers where they apply — `ETag` /
  `If-None-Match` for conditional reads, `If-Match` for optimistic concurrency on
  writes.

### 3-5. RPC-style endpoints only where a resource form distorts meaning

Some operations are genuinely verbs — `POST /orders/{id}:cancel`,
`POST /payments/{id}:refund`, `POST /reports:export`. Forcing these into pure
resource CRUD (e.g. inventing a `cancellation` resource nobody in the business
talks about) can distort the domain more than it clarifies it. A **custom
method** is then acceptable.

- **SHOULD** prefer a resource + state field first: modelling cancellation as
  `PATCH /orders/{id}` with `{ "status": "cancelled" }` is often the honest
  model. Use a custom method only when the action is not well-described as a state
  field — because it has side effects beyond the resource, or is a process rather
  than a state.
- **MUST**, when using a custom method, follow the house convention for it
  consistently. The [Google AIP-136 custom-methods](https://google.aip.dev/136)
  form `POST /resource/{id}:verb` (colon-delimited verb) is a good default;
  whatever you pick, every custom method in the API uses the same shape.
- **MUST** record, in the API definition for that endpoint: whether it **reads or
  changes state** (and what state), its **idempotency** (can the caller safely
  retry? — §3-6), and any side effects a consumer cannot infer from the resource
  alone.
- **MUST NOT** reach for a custom method to avoid learning the correct HTTP verb.
  "It's easier to POST everything" is not a distortion of meaning; it is
  Richardson level 0 ("the swamp of POX") and is not permitted.

The bar is "a resource form distorts meaning" — **not** "a resource form is
slightly more typing." Custom methods are the documented exception, not an
escape hatch. Every one you add is a thing consumers and agents cannot predict
by analogy, so each MUST earn its place in writing.

### 3-6. Idempotency and safe retries

Networks retry. An API that double-charges on a retry is not being kind to
anyone.

- **MUST** make `GET`, `PUT`, `DELETE` naturally idempotent (§3-4).
- **SHOULD**, for non-idempotent `POST` and custom methods that create or move
  money/state, accept an **idempotency key** — a client-supplied unique token
  (conventionally the `Idempotency-Key` request header, per the [IETF
  Idempotency-Key header
  draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/)
  and [Stripe's idempotency
  pattern](https://docs.stripe.com/api/idempotent_requests)) — so a retried
  request returns the original result instead of performing the operation twice.
- **MUST** document, per write endpoint, whether it is idempotent and whether it
  honours an idempotency key.

### 3-7. Collections: filtering, sorting, pagination

- **MUST** paginate any collection that can grow unbounded. **SHOULD** default to
  **cursor (keyset) pagination** — an opaque `cursor` / `next` token — over
  offset/limit, for stable results under concurrent writes and no deep-offset
  performance cliff. ([Zalando](https://opensource.zalando.com/restful-api-guidelines/)
  and [Google AIP-158](https://google.aip.dev/158) both codify this.)
- **MUST** keep the pagination, filtering, and sorting **syntax identical across
  every collection** in the API (§3-2). One collection using `?sort=` and another
  using `?order_by=` is exactly the inconsistency this policy exists to prevent.
- **SHOULD** return pagination metadata (next cursor, and total only if it is
  cheap to compute) in a consistent envelope across all list responses.

### 3-8. Errors: one machine-readable shape

- **MUST** return errors as **[Problem Details for HTTP APIs (RFC
  9457)](https://www.rfc-editor.org/rfc/rfc9457)** — the
  `application/problem+json` body with `type`, `title`, `status`, `detail`,
  `instance` — used **uniformly** across the whole API. (RFC 9457 obsoletes RFC
  7807; use 9457.)
- **MUST NOT** invent a bespoke error shape per service. One error contract,
  everywhere, is what lets a consumer — and an agent — handle failures
  programmatically instead of string-matching prose.
- **SHOULD** include a stable, documented machine-readable error code (in `type`
  or an extension member) so consumers branch on a code, not on human-readable
  `detail` text. Error bodies MUST NOT leak internal detail (stack traces,
  queries, credentials) — see the [Application
  Security](/application-security) standard.

### 3-9. The OpenAPI contract

- **MUST** describe every API with an **[OpenAPI
  3.x](https://spec.openapis.org/)** document, kept in the repo and reviewed with
  the code. The contract is not documentation-after-the-fact; it is the
  specification the implementation must satisfy.
- **MUST** capture in it: every resource, method, status code, the shared
  representations (as reusable `components/schemas`), the error shape (§3-8),
  pagination, and any §3-5 custom-method deviation with its read/write/idempotency
  notes.
- **SHOULD** reuse shared schemas by reference (`$ref`) rather than re-declaring a
  concept's shape per endpoint — the schema is where "same concept, same type"
  (§3-2) is mechanically enforced.
- **SHOULD**, where a project adopts a full body convention, follow
  **[JSON:API](https://jsonapi.org/)** or a documented house profile — but
  consistency within one API always outranks conformance to any external profile.

### 3-10. Versioning

- **MUST** version the API and treat the contract as a published promise governed
  by **[Semantic Versioning](https://semver.org/)**: breaking changes require a
  new major version; additive, backward-compatible changes do not.
- **SHOULD** prefer **additive, non-breaking evolution** — add fields and
  endpoints; do not repurpose or remove existing ones — so consumers rarely have
  to move. This is the same expand / migrate / contract discipline we apply to
  schema evolution.
- **MUST NOT** make a breaking change to a concept's shape, path, or semantics
  under the same version. Changing what an existing field means silently is the
  most consumer-hostile thing an API can do.
- **SHOULD** carry the versioning *mechanism* (URL prefix `/v1`, or a header)
  consistently across the whole API — never mix styles.

## References

**REST & HTTP foundations**

- Roy Fielding — Architectural Styles and the Design of Network-based Software Architectures (REST constraints) — <https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm>
- Richardson Maturity Model (Martin Fowler) — <https://martinfowler.com/articles/richardsonMaturityModel.html>
- RFC 9110 — HTTP Semantics — <https://www.rfc-editor.org/rfc/rfc9110>
- RFC 9457 — Problem Details for HTTP APIs — <https://www.rfc-editor.org/rfc/rfc9457>

**Enterprise API style guides**

- Microsoft REST API Guidelines — <https://github.com/microsoft/api-guidelines>
- Google API Design Guide / AIPs — <https://google.aip.dev/>
- Zalando RESTful API Guidelines — <https://opensource.zalando.com/restful-api-guidelines/>

**Contract, format & conventions**

- OpenAPI Specification 3.x — <https://spec.openapis.org/>
- JSON:API — <https://jsonapi.org/>
- Semantic Versioning — <https://semver.org/>
- IETF draft — The Idempotency-Key HTTP Header Field — <https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/>
- Stripe — Idempotent requests — <https://docs.stripe.com/api/idempotent_requests>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the Sustainability lens this standard serves.
- [Architecture Standards](/architecture-standards) — statelessness, scaling, and service shape.
- [Application Security](/application-security) — authentication conventions and safe error surfaces.
- [Development Guide](/development-guide) — how an API change is proposed and reviewed.
