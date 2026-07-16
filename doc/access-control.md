# Access Control

This is the standard the [Quality Gate](/quality-gate)'s **Security** lens holds
work to for knowing *who a user is* and deciding *what they may do*. It expands
the [Security Policy](/security-policy) — which sets the organisational rules
(account MFA, least privilege, quarterly access review) — into a working
standard for the authentication and authorization built *inside* an application:
how we procure it, how we model it, and how we wall off the most dangerous
surface of all, the admin plane. It sits under the [Infrastructure Planning
Policy](/infra-planning-policy)'s Zero Trust posture ("never trust, always
verify") and works alongside the [Database Guidelines](/database-guidelines),
because the last line of defence for row-level rules is the database itself.
Deviations are allowed, but — as everywhere in the handbook — they must be
deliberate and justified in the project's design notes.

Access control is where OSBR's values point outward, at the people whose data we
hold. **Be Kind**: a home-grown login screen can look identical to a bought one
and be one missing check away from leaking every account, so we do not make users
the test subjects for auth code a hardened solution would have gotten right.
**Be Strong**: we choose the boring, adversarially-tested path over the flattering
one of building it ourselves, and we hold the admin boundary as a hard wall, not a
role flag. **Be Nice**: the authorization model is documentation a teammate reads
to learn who may touch what, so it lives in one legible place, in the same pull
request as the data it guards. Humans and AI agents build these controls as
collaborators, and both are held to exactly the same bar.

## How to read this policy

* **Requirement levels** follow RFC 2119, as in the [Coding Style
  Guide](/style-guide). **MUST** / **MUST NOT** are absolute. **SHOULD** /
  **SHOULD NOT** state a strong default overridable only with a documented
  reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry standard, it is named
  inline and cited under [References](#references). We adopt the *criteria* of
  large-scale practices — PAM, control-plane/data-plane separation, the NIST
  control families — and right-size them for an SME, taking their criteria
  without their headcount.

[[TOC]]

## 1. Goal

Every protected action in an OSBR system is guarded by an access decision that
is **procured responsibly, modelled at the lowest sufficient power, enforced
where it cannot be bypassed, and — for administrative capability — entered as a
separate, logged, deliberate act.** Concretely:

- **Authentication is bought, not built.** Knowing *who a user is* reaches for a
  hardened existing solution first; custom auth is the exception that must
  justify itself in writing.
- **Authorization is the simplest sufficient model.** The decision expresses the
  actual access rules the product requires and no more, lives in one auditable
  layer, and denies by default.
- **Row-scoped rules reach the database.** Access scoped to rows is enforced by
  the database, not only by application code a forgotten `WHERE` clause can
  bypass.
- **The admin surface is a separate place.** Administrative capability lives on
  its own surface, behind its own authentication event, with every write left as
  an immutable, attributable audit record.

A control that does not serve one of these goals is either missing or waste. We
optimise for a decision a reviewer can read end to end, not for a policy engine
nobody yet needs — unread complexity someone debugs at 3am is not "secure".

## 2. Responsibility

- The **author of a change owns its access control.** "Done" includes the
  authorization model: a pull request that adds or changes a table MUST state,
  in the same PR, who may read/write those rows, under what rule, and where the
  check is enforced. A schema change with no authz note is incomplete. This is
  the same implementer-owns-quality rule the [Quality Gate](/quality-gate)
  states — verification is planned at design, not handed to a later stage.
- The **reviewer** (per the [Security Policy](/security-policy)'s mandatory
  security review) verifies that the chosen model is the *simplest sufficient*
  one, that the check sits in one place, that row-level rules reach the database,
  and — for auth — that a buy-vs-build evaluation exists.
- The **project lead / architect** owns the admin boundary. The admin surface is
  designed as a separate plane from day one; retrofitting isolation onto a shared
  origin is expensive and error-prone.
- The **infrastructure owner** provisions the network restriction, the immutable
  audit store, the separate identity configuration, and the break-glass path — all
  as code (see the [Infrastructure Planning Policy](/infra-planning-policy)).
- **AI agents** are first-class contributors of access-control code and are held
  to exactly the same bar; the human who merges an agent's work owns it.

## 3. Practices — Procure authentication before you build it

### 3-1. Buy-before-build is the default; the burden of proof is on building

The oldest rule in the field applies: **do not roll your own auth or crypto.**
The failure modes — credential theft, session fixation, account takeover,
privilege escalation — land on *users*, not on us.

- Before any custom authentication or authorization is scoped, the project MUST
  produce a **short written evaluation** naming its requirements (identity
  sources, MFA/AAL target, SSO/federation needs, user volume, data residency,
  budget) and scoring candidate solutions against them.
- If the decision is to build, the evaluation MUST document **why every candidate
  was rejected** — a specific unmet requirement per candidate, not a general
  "none felt right." Absent that record, buy.
- "Build" means writing our own password hashing, session issuance, token
  signing, MFA enrolment, or federation handling. Configuring, theming, and
  integrating a bought solution is **not** building — it is the expected work.
- Build-vs-buy is a **TCO and security-surface argument, not a licence-fee one.**
  The cost of building is perpetual: patching the CVE class you now own, staffing
  the on-call for the 3am account-takeover, passing the audit for code only you
  have reviewed. A subscription that moves that surface to a vendor whose whole
  business is defending it is usually cheaper *and* safer.

### 3-2. Express auth against named standards, not improvisation

Auth requirements and designs MUST be grounded in named standards so the
evaluation is checkable rather than improvised:

- **OWASP ASVS** — the requirements checklist. Its Authentication and Session
  Management chapters define what any solution, bought or built, must satisfy; a
  custom build would have to meet them line by line.
- **NIST SP 800-63B** — the assurance-level yardstick. The project MUST state a
  target **Authenticator Assurance Level (AAL1 / AAL2 / AAL3)** and pick a
  solution that meets it. Handling personal or client-privileged data (see the
  [Security Policy](/security-policy) protected-assets list) generally means
  **AAL2** (MFA required); high-value admin paths lean **AAL3** (hardware-backed,
  phishing-resistant).
- **OAuth 2.0 / OpenID Connect** — the protocols for delegated authorization and
  federated authentication. Prefer these for third-party login and for
  issuing/validating tokens; do not invent a token format or grant flow.
- **SAML 2.0** — the enterprise-SSO protocol many client identity providers still
  speak. A client SAML mandate is a *buy* signal; a hand-rolled SAML
  implementation is a classic source of critical bugs.
- **Passkeys / WebAuthn / FIDO2** — the phishing-resistant, passwordless
  authenticators the [Security Policy](/security-policy) already mandates for
  internal accounts. User-facing auth SHOULD offer passkeys, and the chosen
  solution SHOULD support WebAuthn natively rather than us building the ceremony.

### 3-3. Keep authentication separate from authorization

The two concerns MUST NOT be conflated in design or procurement:

- **Authentication** answers *who is this?* — login, MFA, sessions, tokens. This
  is the part we almost always **buy**, because it holds the crypto and the
  well-known attack surface.
- **Authorization** answers *what may they do?* — roles, permissions, tenant
  isolation, resource ownership. This is usually **application-domain logic** we
  own, because it encodes *our* business rules, though the enforcement primitives
  (scopes, claims, policy engines) can still be bought.
- A bought authentication provider gives you an identity and a token; it does
  **not** know your domain's permission model. The project MUST state where the
  authentication boundary ends and its own authorization logic begins, so no one
  assumes the provider is enforcing rules it was never told about.

### 3-4. Document what the chosen solution does not cover

Every auth decision MUST record its **gaps** — what the solution explicitly does
*not* handle — so those gaps are owned rather than silently assumed away. State
coverage for, at minimum: authorization / fine-grained permissions (usually ours,
not the provider's); account recovery and de-provisioning; audit logging of auth
events; session revocation and token lifetime; data residency of the identity
store and PII; and rate limiting / brute-force and enumeration protection at *our*
edges. A gap that is written down is a task; a gap that is assumed covered is an
incident.

### 3-5. If you must build, treat the primitives as library, not project, code

If custom auth is genuinely unavoidable, the crypto and session/token primitives
are **library code, not project code** (per [Style Guide](/style-guide)): use
vetted, standard implementations (a maintained OIDC library, a standard
password-hash such as Argon2 via its reference library), never a bespoke
algorithm. Reserve original code for the *authorization* domain logic, which is
legitimately ours. The bar to clear before any custom auth code is scoped: the
written evaluation (§3-1), an AAL target (§3-2), an authn/authz boundary
statement (§3-3), and a documented gap list (§3-4) — all four must exist first.

## 4. Practices — Choose and place the authorization model

### 4-1. Climb the escalation ladder; stop at the first rung that states the rule

Authorization models trade expressiveness for complexity. Pick the **least
powerful model that can state your rule** and escalate only when a concrete,
named rule cannot be expressed at the current rung — least privilege applied to
the *mechanism itself*, not just the grants.

1. **Owner check** — "the actor owns this row / is the actor." A single ownership
   predicate (`resource.owner_id == actor.id`). Most CRUD apps never need more.
   Start here.
2. **RBAC (roles)** — permissions attach to named roles, users hold roles. Reach
   for it when access depends on a *job function* (admin, editor, viewer) rather
   than ownership. This is the NIST RBAC model (ANSI INCITS 359): roles, role
   hierarchies, and permission assignments.
3. **Admin escape hatch** — a coarse "staff can see everything" capability is fine
   as an explicit, audited RBAC role (and see §5). Keep it deny-by-default for
   everyone else.
4. **ABAC / ReBAC / policy engine** — only when a rule depends on *attributes*
   (time, location, resource state, clearance) or on *relationships between
   objects* that roles cannot enumerate ("editors of the parent folder", "members
   of the owning team"). ABAC is defined in NIST SP 800-162; relationship-based
   access at scale is the Zanzibar model. Externalise policy with a tool such as
   Open Policy Agent only when policy genuinely needs to live outside application
   code (multiple services sharing one policy, non-developer policy authors).

The trigger to move up a rung is a **specific rule you cannot currently express**
("a contractor may edit a document only during the project window, and only if
they belong to the owning team"). "We might need ABAC later" is not a trigger.
YAGNI applies to authorization models too.

### 4-2. Deny by default

The absence of an explicit grant is a denial. New endpoints, new columns, and new
resource types are **inaccessible until a rule says otherwise** — never accessible
until a rule forbids them. This is fail-safe defaults (Saltzer & Schroeder) and
the baseline expectation of OWASP ASVS: access control fails closed and is
enforced on the server.

### 4-3. One auditable authorization layer

The authorization decision lives in **one place** a reviewer can point to — a
single middleware, guard, or policy module — not smeared across controllers, view
templates, and query builders. A reviewer MUST be able to answer "where is this
checked?" with one file, and "what does it decide?" by reading it.

- Controllers and UI call *into* the authorization layer; they MUST NOT
  re-implement the decision.
- The UI hiding a button is **not** authorization — it is convenience. The real
  check is server-side (OWASP ASVS). Client-side hiding is never the control.

### 4-4. Enforce row-level rules at the database

When access is scoped to *rows* ("a user sees only their own orders", "a tenant
sees only its own data"), enforce it in the database with row-level security (for
example, PostgreSQL Row-Level Security), not only in application queries.
Application-only filtering is one forgotten `WHERE` clause away from a cross-tenant
leak; a database policy holds even when a query forgets. This is defence in depth,
consistent with the [Infrastructure Planning Policy](/infra-planning-policy)'s
"assume breach". Row-level rules belong in the database as a *backstop* — coarser
role and ownership decisions can still live in the single application layer (§4-3).
Use both: the app layer for the readable decision, the database for the guarantee.

### 4-5. Document the authz model in the same PR as the schema

The authorization model is part of the data model. When a PR adds or changes a
table, that same PR states, in prose or a short table: **who may read/write these
rows, under what rule, and where the check is enforced** (owner predicate, RBAC
role, database policy, external policy). Schema and its access rules are reviewed
together or not at all. Grants SHOULD be reviewed periodically and the unused ones
removed, per the [Security Policy](/security-policy)'s quarterly access review.

## 5. Practices — Isolate administrative functions

An admin panel is not "the app with more buttons." It is a different blast radius:
a stolen session on the user surface exposes one account; the same on the admin
surface exposes the whole tenant. We model the admin surface as the system's
**control plane** and keep it architecturally distinct from the **data plane**
that serves users.

### 5-1. A separate surface, not a route prefix

Administrative functions MUST be served from a surface distinct from the user
application:

- A **separate domain or subdomain** (e.g. `admin.example.com`), never merely
  `example.com/admin` sharing the user origin, session cookie, and code path.
  Sharing an origin means the admin panel inherits every XSS, CSRF, dependency,
  and session weakness of the far larger user app.
- The admin surface SHOULD be **network-restricted** — reachable only from company
  access paths (IP allow-list / Zero Trust access), consistent with the
  staging/production access rules in the [Security Policy](/security-policy). A
  public login page is a bigger attack surface than no login page.
- Admin and user surfaces SHOULD NOT share an authentication session or token
  audience. A user session token MUST NOT be silently promotable to admin by
  adding a claim. This is the OWASP ASVS position on administrative interfaces:
  isolate them and protect them more strongly than the rest of the application.

### 5-2. A separate authentication event (step-up, MFA minimum)

Reaching the admin surface MUST require its **own authentication event**:

- **MFA is the minimum** — a phishing-resistant second factor (passkey / WebAuthn
  preferred), per the [Security Policy](/security-policy). A role check on an
  already-established user session is **NOT** sufficient.
- Sensitive or destructive admin actions SHOULD trigger **step-up
  (re-authentication)** even within an admin session — the operator proves
  presence again before a high-impact write, following NIST SP 800-63B guidance
  on re-authentication for sensitive operations.
- Admin sessions SHOULD be short-lived and idle-timeout aggressively; they are
  more valuable than user sessions, so they should live shorter.

### 5-3. Just-in-time, not standing privilege

Follow **Privileged Access Management (PAM)** practice: privilege is granted when
needed and expires, not held permanently.

- Admins SHOULD hold no standing admin rights by default; they **elevate
  just-in-time (JIT)** for a bounded window, and the grant drops automatically.
- Grants SHOULD be scoped to the task (least privilege, NIST SP 800-53 **AC-6**) —
  the narrowest role that does the job, for the shortest time.
- Privileged accounts MUST be **separate identities** from the same person's
  ordinary user account (NIST SP 800-53 **AC-2**, **AC-6(2)/(5)**): one human, two
  accounts, so routine activity never runs with admin rights.

### 5-4. Break-glass (emergency access)

There MUST be a documented **break-glass** path for when normal admin auth is
unavailable (identity-provider outage, locked-out operator):

- Break-glass credentials are highly privileged, rarely used, and stored
  **offline / sealed** (e.g. in a sealed secret, not a daily-driver vault entry).
- Using break-glass MUST raise an alert and generate an audit record the same as
  any other admin action — ideally a louder one. Any use is reviewed after the
  fact.
- The procedure — who, when, and how it is re-sealed and rotated afterwards — MUST
  be written down before it is needed.

### 5-5. Audit every admin write — immutable, attributable, retained ≥ 1 year

Every administrative **create / update / delete** MUST produce an audit record.
The boundary is only trustworthy if we can prove, after the fact, who did what.

- Each record MUST capture, at minimum (NIST SP 800-53 **AU-2 / AU-3 / AU-12**):
  **who** (the named human identity, not a shared "admin" account), **what** (the
  action and its target), **when** (a trustworthy timestamp), **where/how**
  (source IP / access path, and whether it was a normal or break-glass session),
  and **outcome** (success or failure — failed admin attempts are logged too).
- Records MUST be written to an **append-only / immutable** store — WORM semantics
  such as object-lock, an immutable log bucket, or an equivalent the admin
  application itself cannot rewrite or delete (NIST SP 800-53 **AU-9**). The
  admins being logged MUST NOT be able to edit their own trail.
- Records MUST be retained for **at least one year** (NIST SP 800-53 **AU-11**),
  longer where a client contract or law requires it. The audit store SHOULD be
  isolated from the admin surface — a compromise of the admin plane must not also
  grant delete over its own evidence — shipped as event streams to a separate
  store (see the [Infrastructure Planning Policy](/infra-planning-policy)).
- High-risk actions (bulk export, permission grants, break-glass use, mass delete)
  SHOULD **alert in real time**, not merely sit in a log nobody reads, and audit
  logs SHOULD be reviewed as part of the quarterly access review the
  [Security Policy](/security-policy) already mandates.

"Immutable" is right-sized: object-lock / WORM on the log store plus an isolated
account is enough. You do not need a dedicated SIEM to satisfy this policy — you
need a trail the logged party cannot alter and a retention clock of at least a
year.

## 6. Anti-patterns

The failure modes this policy exists to prevent:

- ❌ A home-grown login screen — custom password hashing, session issuance, or
  token signing — shipped without a written buy-vs-build evaluation.
- ❌ Assuming the bought identity provider enforces your permission model. It
  authenticates; your domain authorizes.
- ❌ Scattered ad-hoc `if (user.role === ...)` checks across controllers,
  templates, and queries instead of one auditable layer.
- ❌ Row-scoped access enforced only by application `WHERE` clauses, one forgotten
  filter away from a cross-tenant leak.
- ❌ `/admin` on the same origin, guarded only by `if (user.role === "admin")` on
  the user session. One session token, one blast radius.
- ❌ A shared `admin@` login used by several people — no attribution, so the audit
  trail cannot name a human.
- ❌ Standing, permanent admin rights on daily-driver accounts.
- ❌ Audit logs writable (or deletable) by the same admin role they record, or
  logging that captures reads but not the destructive writes.

## References

**Foundations & least privilege**

- Saltzer, J. H. & Schroeder, M. D., *The Protection of Information in Computer
  Systems* (1975) — least privilege, fail-safe defaults —
  <https://www.cs.virginia.edu/~evans/cs551/saltzer/>
- OWASP Application Security Verification Standard (ASVS) — authentication,
  session management, authorization, and logging chapters; administrative-interface
  isolation — <https://owasp.org/www-project-application-security-verification-standard/>
- OWASP Top 10 — <https://owasp.org/www-project-top-ten/>

**Authentication & identity (NIST / protocols)**

- NIST SP 800-63B, *Digital Identity Guidelines* — Authenticator Assurance Levels,
  re-authentication — <https://pages.nist.gov/800-63-3/sp800-63b.html>
- OAuth 2.0 — <https://datatracker.ietf.org/doc/html/rfc6749> — and OpenID Connect
  — <https://openid.net/developers/how-connect-works/>
- SAML 2.0 — <https://docs.oasis-open.org/security/saml/v2.0/>
- WebAuthn / FIDO2 passkeys — <https://www.w3.org/TR/webauthn-2/>

**Authorization models**

- NIST, *Role-Based Access Control (RBAC)* / ANSI INCITS 359 —
  <https://csrc.nist.gov/projects/role-based-access-control>
- NIST SP 800-162, *Guide to Attribute Based Access Control (ABAC)* —
  <https://csrc.nist.gov/pubs/sp/800/162/final>
- Google, *Zanzibar: Google's Consistent, Global Authorization System* (USENIX ATC
  2019) — relationship-based access (ReBAC) —
  <https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/>
- Open Policy Agent — policy-as-code engine — <https://www.openpolicyagent.org/>
- PostgreSQL — Row Security Policies —
  <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>

**Privileged access & audit**

- Privileged Access Management (PAM) — just-in-time elevation, session isolation,
  credential vaulting (NIST references under AC-6 / AC-2).
- NIST SP 800-53 Rev. 5 — AC family (AC-2 account management, AC-6 least privilege
  incl. AC-6(2)/(5)) and AU family (AU-2/AU-3/AU-12 logging, AU-9 protection of
  audit info, AU-11 retention) —
  <https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final>
- NIST SP 800-207, *Zero Trust Architecture* —
  <https://csrc.nist.gov/pubs/sp/800/207/final>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the Security lens this standard serves.
- [Security Policy](/security-policy) — account MFA/passkey rules, access paths,
  quarterly access review, protected assets.
- [Infrastructure Planning Policy](/infra-planning-policy) — Zero Trust posture,
  least-privilege credentials, immutable log streams, IaC for the isolation.
- [Database Guidelines](/database-guidelines) — where row-level security policies
  live.
- [Coding Style Guide](/style-guide) — library vs project code, RFC 2119 levels.
- [Development Guide](/development-guide) — the pull-request review surface.
