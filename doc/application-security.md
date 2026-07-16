# Application Security

This is the standard the [Quality Gate](/quality-gate)'s **Security** lens holds
work to for the running application. It is the application-layer complement to
the [Security Policy](/security-policy): where that policy governs *device and
account conduct* — how developers work, how they hold credentials — this page
starts at the first line of request-handling code and follows it through to the
logged response. It answers two questions together: *is each control correct?*
and *what still holds when a control fails?* Deviations are allowed, but — as
everywhere in the handbook — they must be deliberate and justified in the
project's design notes.

Like the rest of OSBR's engineering guidance, this leans on standards that
already exist rather than inventing a house security model. **OSBR adopts the
[OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/)
as its application-layer baseline** (§1), and grounds the practices below in the
[OWASP Top 10](https://owasp.org/Top10/), the
[OWASP Proactive Controls](https://owasp.org/www-project-proactive-controls/),
the [Cheat Sheet Series](https://cheatsheetseries.owasp.org/), the
[CWE Top 25](https://cwe.mitre.org/top25/), and
[NIST SSDF (SP 800-218)](https://csrc.nist.gov/pubs/sp/800/218/final). We adopt
their *criteria* and right-size them for an SME — we do not adopt the headcount
or infrastructure behind their reference setups.

Application security is where OSBR's values hold a wall. **Be Nice** to the
operator paged at 3am: an app that fails closed, leaks nothing, and logs what
happened is a far kinder thing to debug than one that fails open and silently.
**Be Kind** to the users whose data lives behind that boundary and to the next
engineer — human or AI — who extends the code: secure-by-default helpers are
defences they inherit rather than re-derive, and no user ever agreed to bet
their data on our getting a single regex or token check exactly right. **Be
Strong** on the boundary, and hold *more than one*: an attacker only has to win
once, so we plan to lose a layer and keep the breach contained rather than
catastrophic. AI agents increasingly both call these applications and write
their request-handling code — and neither can be trusted to infer an unwritten
convention, which is why the defence has to live in the framework and the shared
helpers, not in one developer's head.

## How to read this policy

* **Requirement levels** follow RFC 2119, as in the rest of the handbook.
  **MUST** / **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a
  strong default overridable only with a documented reason. **MAY** marks a free
  choice.
* **Named practice.** Where a rule adopts an industry practice or a specific
  ASVS/OWASP/NIST control, it is named inline and cited under
  [References](#references). ASVS is *how we check we did them* — every practice
  below maps to an ASVS requirement.

[[TOC]]

## 1. Goal

Every OSBR application is **secure by default at runtime, and every important
asset is reachable only through multiple independent boundaries that each start
closed.** No single control — no one firewall rule, auth check, input filter, or
output encoder — is the only thing between an attacker and the data; when one
layer fails, the next, on a different lineage, still holds. Concretely, an OSBR
application meets this policy when:

- Its application-layer security is **verifiable against OWASP ASVS** at the
  level its data sensitivity demands (§1), not asserted by feeling.
- **Authentication and sessions** are strong, phishing-resistant, and correctly
  invalidated (§3-6, §3-7).
- **All input is validated at the trust boundary and all output is encoded for
  its sink** (§3-8, §3-9), closing the injection classes — SQLi, XSS, CSRF,
  SSRF, command/template injection (§3-10).
- **Access control is enforced server-side, deny-by-default, on every request**
  (§3-11).
- **Secrets are never in code or logs** and are read from a secret store at
  runtime (§3-12).
- **Defaults are safe, errors leak nothing, and security events are logged**
  (§3-13, §3-14, §3-15).
- Each asset sits behind **two or more independent boundaries** that **start
  closed** (§3-3, §3-4), and **every deliberate relaxation is recorded** with its
  scope and duration (§3-16).

This is the **Swiss-cheese model**: each layer has holes, but if the layers are
independent the holes rarely line up, and a threat only passes when a hole in
*every* slice aligns. Our job is to keep the slices independent so the holes
stay misaligned — the defence-in-depth arrangement NIST and the NSA have
advocated for decades precisely because no single safeguard is ever perfect.

## 2. Responsibility

- **The developer** who writes a request handler owns its application-layer
  security. Before adding an endpoint you route it through the shared auth,
  validation, and access-control machinery — you do not get to invent a local
  security convention any more than a local API convention — and you keep
  defaults restrictive and escaping on, adding the redundant check even when it
  feels redundant, because that redundancy *is* the policy.
- **The reviewer** — the AI-automated review gate and any human reviewer —
  rejects changes that regress an ASVS control, add an unvalidated input sink,
  introduce an un-parameterised query, or quietly remove a layer, the same way
  they reject a broken build. Approving a relaxation is an act of **separation of
  duties**: the person who wants a hole is not the only one who decides it opens.
- **The project lead / architect** owns the **target ASVS level** (§1) and the
  **layering** — that each important asset has more than one independent boundary
  and that the layers do not secretly collapse onto a shared dependency (§3-4).
  They approve and record relaxations.
- **The design note** is the source of truth for the chosen ASVS level, any
  control marked *not applicable*, any deliberate deviation, and any relaxation
  accepted as risk. An undocumented deviation is a bug.

This page governs the **application**. The [Security Policy](/security-policy)
still governs the **developer and the account**; the two are read together.

## 3. Practices

### 3-1. Verify against OWASP ASVS — choose a level

ASVS is a catalogue of testable requirements, organised into three ascending
assurance levels. We use it as the yardstick and the audit checklist.

- **Level 1 (L1)** — the baseline every OSBR application **MUST** meet.
  Low-cost, fully black-box-testable controls; the floor, not the goal.
- **Level 2 (L2)** — **MUST** for any application handling **personal data,
  authentication, money, or client-confidential data** (which, per the Security
  Policy's protected assets, is most OSBR work). L2 is the effective OSBR
  default.
- **Level 3 (L3)** — for the **highest-assurance** systems (payments, health,
  high-value admin planes). Targeted where a client contract or the blast radius
  demands it.

Rules:

- Every project **MUST** record its **target ASVS level** in the design notes at
  project start, chosen by data sensitivity, not convenience.
- An ASVS requirement at the chosen level is a **MUST** for that project. A
  requirement judged *not applicable* **MUST** be recorded as N/A with a one-line
  rationale — never silently skipped.
- A project **SHOULD** run an ASVS-structured audit before a release that changes
  the security surface, recording which levels each chapter meets. (The
  `asvs-audit` tooling exists for exactly this; security-relevant behaviour is
  also tested per the [Testing Standards](/testing-standards).)
- Adopt controls **above** the chosen level opportunistically when they are cheap
  — levels are a floor, not a ceiling.

Use the **OWASP Top 10** and the **CWE Top 25** to understand *what goes wrong
and why*; use **ASVS** to verify *you closed it*; use the **Cheat Sheet Series**
for the *how-to* on each control.

### 3-2. Build on the OWASP Proactive Controls

The **Proactive Controls** are the positive, build-time counterpart to the Top
10's list of failures — the techniques applied by default. They frame the rest
of this section: define security requirements as ASVS levels (§1); **leverage
vetted frameworks and libraries** rather than hand-rolling crypto, session
handling, or output encoding (hand-rolled security is the single most common
source of the bugs this page prevents); validate all input (§3-8); encode and
escape output (§3-9); secure database access (§3-10); implement digital identity
(§3-6, §3-7); enforce access controls (§3-11); protect data everywhere; and
handle all errors and log security events (§3-14, §3-15). This maps onto **NIST
SSDF** practice group **PW (Produce Well-Secured Software)** — standardised,
vetted components and secure-by-default settings over bespoke security code —
with our CI gate and AI-automated review acting as the SSDF **PW.7/PW.8**
review-and-test practices.

### 3-3. Start closed: restrictive defaults, fail-secure

Every boundary **MUST** default to the safe state and open only by explicit,
recorded decision. A protection you must remember to enable is off in every
place someone forgot; a protection on by default is off only where someone
deliberately — and, under §3-16, *visibly* — turned it off. Defaults decide the
security of the code nobody reviewed closely.

- Access **MUST** be **deny-by-default** — allow-lists, not deny-lists. A new
  route, bucket, port, or table starts unreachable and is opened deliberately
  (NIST SP 800-53 **AC-3 / SC-7**; the OWASP secure-defaults position). The
  server-side enforcement of this is §3-11.
- Controls **MUST** be **fail-secure / fail-closed**: when a check errors, times
  out, or a dependency is unavailable, the system **denies** — it never falls
  through to allow. An auth service that is down must lock the door, not prop it
  open (Saltzer & Schroeder, *fail-safe defaults*).
- **Output escaping / encoding MUST be on by default** — contextual encoding is
  the framework default, and turning it off is the recorded exception (§3-16),
  never the ambient state. The sink-specific detail is §3-9.
- Restrictive defaults extend to headers, CORS, cookie flags, TLS, and
  permissions: the secure value is the default; the permissive value is a
  deliberate, recorded exception (concrete list in §3-13).

### 3-4. Layer independent boundaries

An important asset **MUST** be reachable only through **multiple** boundaries, so
that breaching one is not breaching all — and the layers only add up if they
fail **independently**.

- Combine controls at **different layers** — network (restrict who can reach it),
  identity (authenticate, §3-6), authorization (least privilege on what they may
  do, §3-11), and application (validate input §3-8, escape output §3-9). Each is
  a slice; the asset sits behind the stack.
- **Do not remove a check because another layer "already covers it."** The WAF
  does not excuse input validation; the network restriction does not excuse
  authentication; the ORM does not excuse least-privilege DB grants. Removing a
  layer is a relaxation and **MUST** be recorded (§3-16).
- Layers **SHOULD** sit on **different implementation, vendor, or operator
  lineages** so a single CVE, misconfiguration, stolen credential, or vendor
  outage cannot open all of them at once. Beware **common-mode failure**: a
  shared secret, base image, admin account, or dependency behind two "separate"
  layers collapses them into one. When you draw the layers, ask what they have in
  common — that commonality is the real single point of failure.
- **Least privilege is a layer in its own right** (NIST SP 800-53 **AC-6**): even
  an attacker who passes authentication reaches only the narrow scope the
  identity was granted, so the breach is bounded, not total. **Separation of
  duties** (**AC-5**) is the human-layer version — no single person both makes a
  change and approves it — which is why change goes through review.

This is the layered complement to our **Zero Trust** posture (NIST SP 800-207,
"assume breach"). Zero Trust tells us to distrust every *request*; defence in
depth tells us to distrust every *control*. A verified request that slips one
check must still meet the next.

### 3-5. Contain the blast radius

Because we assume a layer will fall, we design so the fall is survivable.

- **Segment** so a breach of one component, tenant, or surface does not reach the
  others.
- Keep **detection and audit on an independent layer**: a compromise of the thing
  being watched must not also grant control over the evidence (§3-15).
- Degrade safely — one breached layer should mean a contained, detected,
  recoverable incident, not silent, total damage.

### 3-6. Authentication

Authentication proves *who* is calling; getting it wrong is Top 10 A07
(Identification and Authentication Failures).

- **MUST** authenticate through a **vetted framework or identity provider** —
  never a hand-rolled login (see the OWASP Authentication Cheat Sheet and
  [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)).
- **MUST** store passwords, where the app holds them at all, with a **strong,
  salted, adaptive hash** (Argon2id, scrypt, or bcrypt) — never plain text, never
  a fast/general-purpose hash.
- **MUST** offer **phishing-resistant MFA** (passkeys / WebAuthn preferred),
  consistent with the passkey/MFA rule the [Security Policy](/security-policy)
  already mandates for developer accounts — user accounts get the same posture.
- **MUST** implement **anti-automation** on authentication endpoints — rate
  limiting and lockout/backoff — against credential stuffing and brute force
  (CWE-307).
- **MUST NOT** leak account existence through login, registration, or
  password-reset responses or timing (generic "invalid credentials" only).
- **SHOULD** re-authenticate (step-up) before sensitive operations, and force a
  fresh authentication event to reach any administrative surface.

### 3-7. Session management

Once authenticated, the session *is* the credential — the thing an attacker
wants to steal or fixate.

- **MUST** generate session tokens with a **CSPRNG**, of sufficient length, and
  treat them as opaque secrets.
- **MUST**, for cookie-based sessions, set `HttpOnly`, `Secure`, and an
  appropriate `SameSite`; scope the cookie to the narrowest path/domain.
- **MUST regenerate the session identifier on privilege change** — login,
  step-up, role elevation — to defeat session fixation (CWE-384).
- **MUST invalidate the session server-side on logout and on idle/absolute
  timeout.** A logout that only drops the client cookie is not a logout. Idle and
  absolute lifetimes SHOULD be short for high-value sessions.
- **SHOULD**, for stateless tokens (e.g. JWT), verify signature and algorithm
  explicitly (reject `alg: none`), enforce `exp`/`aud`/`iss`, and keep lifetimes
  short with a server-side revocation path.

### 3-8. Input validation

**All input from any trust boundary is untrusted** — request bodies, query and
path parameters, headers, cookies, file uploads, webhook payloads, and responses
from upstream services.

- **MUST validate at the trust boundary**, as close to entry as possible, using
  **positive (allow-list) validation** — assert the input matches an expected
  type, range, length, and format; reject what does not. Deny-list filtering of
  "bad" input is not sufficient.
- **MUST** validate structured input (JSON body, form) against a **schema** — the
  same schema the API contract publishes — and reject unexpected fields rather
  than silently ignoring them.
- **MUST** enforce type at the boundary in a way that survives to the query and
  render sinks — a validated integer id cannot become an injection string.
- **MUST** treat **file uploads** as hostile: validate type/size, store outside
  the web root, never trust the client-supplied filename or content type.
- **MUST NOT** rely on input validation *alone* to stop injection — validation
  reduces the attack surface; the sink-specific defence (parameterisation,
  encoding — §3-9, §3-10) is what actually closes it. They are layers, not
  alternatives.

### 3-9. Output encoding

Injection is ultimately an **output** problem: data crosses into an interpreter
(HTML, SQL, a shell, a URL) that mis-reads it as code. **Encode/escape data for
the specific sink it is written to, at the moment of output.**

- **MUST** contextually encode all untrusted data written into HTML — HTML body,
  attribute, JavaScript, CSS, and URL contexts each need their *own* encoding.
  Prefer a framework's auto-escaping template engine and do not defeat it.
- **MUST** encode **for the sink, not once generically** — the encoding for a SQL
  identifier, an OS command argument, an HTTP header, and an HTML attribute are
  all different.
- **SHOULD** deploy a strong **Content-Security-Policy** as defence-in-depth
  *behind* output encoding, never as a replacement for it.

### 3-10. Injection defences (SQLi, XSS, CSRF, SSRF, command/template)

Top 10 A03 (Injection) is a class, not a single bug. Each variant has a
**standard, non-negotiable defence** — use it, do not improvise.

- **SQL / NoSQL injection** — **MUST** use **parameterised queries / prepared
  statements** (or a vetted query builder / ORM that parameterises) for *every*
  query with a variable part. String-concatenating user input into a query is
  prohibited. Where an identifier (table/column) must be dynamic, allow-list it
  against a fixed set (CWE-89).
- **Cross-Site Scripting (XSS)** — **MUST** apply contextual output encoding
  (§3-9) plus framework auto-escaping; for user-supplied HTML, sanitise with a
  vetted library (e.g. DOMPurify) against an allow-list. Never build DOM from
  untrusted strings via `innerHTML`/`eval` (CWE-79).
- **Cross-Site Request Forgery (CSRF)** — **MUST** protect state-changing
  requests with **anti-CSRF tokens** (synchroniser or double-submit) and/or
  `SameSite` cookies; do not rely on a single mechanism. `GET` never mutates
  state (CWE-352).
- **Server-Side Request Forgery (SSRF)** — **MUST**, when the app fetches a URL
  derived from user input, **allow-list** the permitted hosts/schemes, resolve
  and validate the target against internal-range/metadata-endpoint blocks, and
  disable unneeded redirects (Top 10 A10; CWE-918).
- **OS command / template / LDAP / XML injection** — **MUST** avoid passing
  untrusted input to a shell, template engine, or expression evaluator at all;
  where unavoidable, use the safe API (argument arrays, not a shell string;
  sandboxed/logic-less templates; disabled XML external entities) (CWE-78,
  CWE-1336, CWE-611).

### 3-11. Access-control enforcement (authorization)

Top 10 A01 (Broken Access Control) is the #1 web application risk.
Authentication says *who you are*; access control says *what you may do* — and it
is checked far too often on the client, or not at all. This is the server-side
enforcement of the deny-by-default rule in §3-3, and it also anchors the
[Access Control](/access-control) standard.

- **MUST enforce access control on the server, on every request**, at the point
  the resource is accessed — never trust a hidden field, a client-side check, or
  a UI that "doesn't show the button."
- **MUST deny by default** — access is granted only by an explicit, positive
  rule; the absence of a rule is a denial.
- **MUST check object-level ownership** on every access to a specific record —
  that *this* user may act on *this* object — to close IDOR / broken object-level
  authorization (CWE-639/CWE-284). Guessing another id must not reveal another
  user's data.
- **MUST** enforce **least privilege** — every identity, and the app's own
  service identity, holds the narrowest permissions that do the job.
- **SHOULD** centralise authorization in shared middleware/helpers so a new
  endpoint is access-controlled by default rather than by the author remembering
  to add a check.
- Administrative functions have their **own, stronger** rules (separate origin, a
  fresh authentication event, immutable audit logs); this section is the baseline
  for ordinary user endpoints.

### 3-12. Secrets handling at runtime

The [Security Policy](/security-policy) already forbids committing credentials
and long-lived high-privilege keys. This is the **runtime** counterpart — how the
live app holds and uses secrets — and part of the broader
[Data Protection](/data-protection) standard.

- **MUST** read secrets at runtime from **environment configuration or a secret
  manager** (AWS Secrets Manager / SSM Parameter Store, GCP Secret Manager, or
  equivalent) — never hard-coded, never committed (Top 10 A05; CWE-798).
- **MUST** prefer **workload identity** over stored secrets where the platform
  offers it — IAM roles attached to the compute, OIDC for CI. The best-held
  secret is the one that does not exist.
- **MUST NOT** log secrets, tokens, session ids, or full credentials — scrub them
  from logs, error messages, and traces (§3-14, §3-15).
- **SHOULD** support **rotation** without a redeploy, and hold secrets in memory
  no longer than needed.

### 3-13. Secure defaults

Top 10 A05 (Security Misconfiguration): the app is only as safe as its least-safe
default. **Secure-by-default** (a NIST SSDF principle and a CISA Secure-by-Design
tenet) means the safe configuration is the one you get without opting in — the
concrete extension of §3-3.

- **MUST** ship with **debug/developer modes, verbose errors, default
  credentials, and sample/admin endpoints disabled** in production.
- **MUST** set security response headers by default — `Content-Security-Policy`,
  `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, a restrictive
  `Referrer-Policy`, and appropriate framing controls (see the OWASP Secure
  Headers Project).
- **MUST** enforce **TLS in transit**, disable insecure protocol/cipher
  fallbacks, and encrypt sensitive data at rest.
- **MUST** keep dependencies patched and free of known-vulnerable versions (Top
  10 A06; NIST SSDF **PW.4**) — enforced by the CI supply-chain scan, per the
  [Supply-Chain Risk](/supply-chain-risk) standard.
- **SHOULD** minimise the attack surface — no unused features, ports, or services
  enabled "just in case."

### 3-14. Error handling that doesn't leak internals

How an app fails is a security property. A leaked stack trace, SQL error, or
internal path is reconnaissance handed to an attacker (CWE-209).

- **MUST fail closed** — on an unexpected error, deny the operation; never fall
  through to an authenticated/authorised state on failure (this is §3-3's
  fail-secure rule at the code level).
- **MUST** return a **generic error** to the client (a stable error shape) while
  logging the full detail **server-side only**. Stack traces, SQL/driver
  messages, internal hostnames, and framework versions never reach the client.
- **MUST** centralise error handling so one boundary handler enforces this —
  matching OSBR's functional error-handling stance: expected failures returned as
  values, unexpected ones crashed loud and logged, caught only at the boundary.

### 3-15. Security logging and monitoring

Top 10 A09 (Security Logging and Monitoring Failures): an attack you cannot see
is an attack you cannot stop or explain afterwards.

- **MUST** log **security-relevant events** — authentication success/failure,
  access-control denials, input-validation rejections, and changes to permissions
  or sensitive data — with enough context (who, what, when, source) to
  investigate.
- **MUST NOT** log secrets, credentials, session tokens, or unnecessary personal
  data — logs are a protected asset and a breach target; neutralise log-injection
  by encoding untrusted values written to logs (CWE-117).
- **MUST** protect and retain logs appropriately, and keep the audit trail on an
  **independent** layer (§3-5) so a compromise of the system does not also grant
  control over its evidence; administrative actions carry the stronger immutable,
  ≥1-year audit-log rules.
- **SHOULD** alert on the high-signal events (repeated auth failure, denial
  spikes, break-glass use) rather than only storing them — NIST SSDF **RV
  (Respond to Vulnerabilities)** depends on detection.

### 3-16. Record every deliberate relaxation

Layers and defaults will sometimes be relaxed for a real reason. That is allowed
— **silently** relaxing them is not. An undocumented exception is
indistinguishable from a bug, so every relaxation **MUST** be recorded so the set
of deliberately-open holes is always known.

- Any **opened path, disabled escaping, widened default, or removed layer**
  **MUST** be captured in a **PR or ADR** (Architecture Decision Record) at the
  time it is made — not reconstructed later.
- Each record **MUST** state **what** is relaxed, its **scope** (where it applies,
  what asset it exposes), its **duration** (until when, and what closes it —
  "permanent" is a decision to be argued, not a default), and **why** (the reason,
  and which other layers still stand behind it).
- A relaxation with a stated duration **SHOULD** have a mechanism that surfaces it
  when the duration expires (a tracked issue, a review date), so temporary holes
  do not become permanent by neglect.
- The reviewer approving the PR/ADR exercises **separation of duties** (§3-4) —
  the relaxation is not the sole decision of the person who wants it. The audit
  trail *is* the layer that catches the other layers being lowered.

## 4. Anti-patterns

The failure modes this policy exists to prevent:

- ❌ **One wall.** A single auth check (or firewall rule, or input filter) is the
  only thing between the internet and the data.
- ❌ **Fail-open.** When the auth service errors, the request is allowed through
  "so we don't block users." A down check must deny, not admit.
- ❌ **Escaping off by default.** Raw output with escaping opt-in, so every
  forgotten call site is an injection hole.
- ❌ **Fake independence.** Two "layers" sharing one secret, library, admin
  account, or vendor — they fall together.
- ❌ **Silent relaxation.** Someone disables escaping or opens a path "just for
  now" and nobody records it, so the hole is permanent and invisible.
- ❌ **"The other layer covers it."** A control removed because a different layer
  supposedly handles it — collapsing depth back to a single point of failure.
- ❌ A login, session, or crypto routine **hand-rolled** instead of using a vetted
  library.
- ❌ A SQL query built by **string concatenation** "because it's just an internal
  admin screen."
- ❌ **Access control by hidden button** — no server-side check, so changing the
  id in the URL reaches another user's record.
- ❌ Untrusted HTML rendered via `innerHTML` with no encoding or sanitisation.
- ❌ A server that fetches a **user-supplied URL** with no host allow-list (SSRF to
  the cloud metadata endpoint).
- ❌ A **stack trace or SQL error** returned to the client on failure.
- ❌ **Secrets** in the repo, in a config file, or printed into the logs.
- ❌ **"We'll add the security tests / ASVS review later"** — later never comes,
  and the app ships unverified.

## References

Named standards and practice this policy draws on, chosen because they are
published, testable, and adoptable by a small team.

**Verification standard (adopted)**

- OWASP Application Security Verification Standard (ASVS) — L1/L2/L3
  application-layer requirements — <https://owasp.org/www-project-application-security-verification-standard/>

**Risk catalogues — the "what goes wrong"**

- OWASP Top 10 — <https://owasp.org/Top10/>
- CWE Top 25 Most Dangerous Software Weaknesses — <https://cwe.mitre.org/top25/>

**Positive controls & how-to**

- OWASP Top 10 Proactive Controls — <https://owasp.org/www-project-proactive-controls/>
- OWASP Cheat Sheet Series — <https://cheatsheetseries.owasp.org/>
- OWASP Secure Headers Project — <https://owasp.org/www-project-secure-headers/>

**Defence in depth & layered controls**

- NIST SP 800-53 Rev. 5 — AC-3 (access enforcement), AC-5 (separation of duties),
  AC-6 (least privilege), SC-7 (boundary protection) —
  <https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final>
- NSA — Defense in Depth guidance (layered, independent safeguards) —
  <https://apps.nsa.gov/iaarchive/library/reports/defense-in-depth.cfm>
- James Reason — the Swiss-cheese model of accident causation —
  <https://pubmed.ncbi.nlm.nih.gov/10720363/>

**Zero Trust, least privilege & fail-secure**

- NIST SP 800-207 — Zero Trust Architecture ("assume breach") —
  <https://csrc.nist.gov/pubs/sp/800/207/final>
- Saltzer & Schroeder — *The Protection of Information in Computer Systems* (least
  privilege; fail-safe defaults; separation of privilege) —
  <https://www.cs.virginia.edu/~evans/cs551/saltzer/>

**Process & secure-by-default**

- NIST SSDF — Secure Software Development Framework, SP 800-218 —
  <https://csrc.nist.gov/pubs/sp/800/218/final>
- NIST SP 800-63B — Digital Identity (authentication) —
  <https://pages.nist.gov/800-63-3/sp800-63b.html>
- CISA Secure by Design — <https://www.cisa.gov/securebydesign>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the Security lens this standard serves.
- [Security Policy](/security-policy) — the device/account complement: developer
  conduct, credential hygiene, MFA/passkeys, protected assets.
- [Testing Standards](/testing-standards) — how security-relevant behaviour is
  tested and kept green.
- [Access Control](/access-control) — the authorization surface §3-11 anchors.
- [Data Protection](/data-protection) — encryption and secret handling behind §3-12.
- [Supply-Chain Risk](/supply-chain-risk) — the dependency and CI scan enforcing §3-13.
