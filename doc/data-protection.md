# Data Protection

This is the standard the [Quality Gate](/quality-gate)'s **Security** lens holds
work to whenever a system handles **personal data** — the data a user entrusts to
us. It sits alongside the [Security Policy](/security-policy) (which keeps that
data safe from attackers) and describes the other half of the duty: the user's own
rights over their data — to know what they agreed to, to see it, to take it, to
leave with it — and the discipline that makes those rights answerable years later
rather than promised in prose. It builds on the [Infrastructure Planning
Policy](/infra-planning-policy) (data residency, backups, durability) and the
[Database Guidelines](/database-guidelines) (schema and history design).

This is an **engineering** standard: how we design schemas, record consent, keep
history, and send mail so that personal data is handled correctly by construction.
The user-facing **Privacy Policy** — the legal notice of what we collect and why —
is the organisation-level [Privacy Policy](/privacy-policy) standard; this page is
what the system must actually do so that policy is truthful. As everywhere in the
handbook, deviations are allowed but must be deliberate and justified in the
project's design notes.

Data protection is where OSBR's values become load-bearing. **Be Nice**: the user
always knows what they agreed to and what we hold, and can retrieve both — and
anyone who comes after us, human or AI, can see how a record reached its current
state without having to guess. **Be Kind**: the user owns their data; we only ever
hold it on loan, so leaving must be as easy as joining, we never sneak a material
change past someone by burying it in "continued use," and we never quietly erase a
fact someone may later depend on. **Be Strong**: we build the audit trail before we
need it, so that under scrutiny — a regulator, a dispute, a breach, a corrupted
write — the truth is already recorded, tamper-evident, and reconstructable. Humans
and AI agents design and review these systems here as collaborators, held to one
bar.

> **Silence is not consent, and the past is a fact, not a field.** If we cannot
> show a clear affirmative act against a specific version, we do not have consent.
> If we overwrite state in place, we are choosing — usually without deciding to —
> that history is worthless. It rarely is.

## How to read this policy

* **Requirement levels** follow RFC 2119, as in the [Coding Style
  Guide](/style-guide). **MUST** / **MUST NOT** are absolute. **SHOULD** /
  **SHOULD NOT** state a strong default overridable only with a documented reason.
  **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an external standard or legal regime, it
  is named inline and cited under [References](#references). OSBR's home regime is
  Malaysia's **PDPA** (Personal Data Protection Act 2010, as amended in 2024); its
  Japanese parent studio and international clients also bring Japan's **APPI**, the
  EU's **GDPR**, and **CCPA/CPRA** into scope, and these rest on the same core
  duties. We adopt the *criteria* — PDPA, APPI, GDPR, CCPA/CPRA,
  SQL:2011, the email authentication RFCs — and right-size them for an SME; we do
  not adopt the headcount behind a large organisation's compliance function. The
  organisation-level notice these controls make truthful is the [Privacy
  Policy](/privacy-policy).

[[TOC]]

## 1. Goal

The goal of data protection at OSBR is that **personal data is handled correctly
by design, and every promise we make about it is one the system can actually
keep.** Concretely, for any personal data we hold, we can:

- **Prove consent** — reconstruct, for that exact user against that exact wording
  at that exact moment, what they affirmatively agreed to.
- **Honour the user's rights** — let them see all their data, take a portable copy,
  and delete their account and data completely, as first-class product features and
  not back-office favours.
- **Reconstruct the past** — answer "what did this record look like then?" because
  state transitions were recorded as history, not overwritten into silence.
- **Hold only what we should** — collect the minimum, retain it for a documented
  period, and keep it where it is legally allowed to live.
- **Reach the inbox with restraint** — send only mail a recipient expected and can
  act on, without damaging the reputation every other message depends on.

These capabilities are almost impossible to retrofit. They MUST be designed into
the very first user-data model, because a schema that never planned for deletion,
history, or consent versioning cannot grow them later — the history you need has
already been overwritten by the time you need it.

## 2. Responsibility

- **Whoever designs the first user-data schema owns the shape of protection.**
  Define deletion semantics and cascade behaviour, the retention period and
  category of each field, and the history structure for every stateful record — all
  *at schema time*, before the first migration ships. "Add history/deletion later"
  is a design defect, not a backlog item.
- **Every developer touching user data owns minimization.** Collect only what the
  feature uses; do not add a column, log line, or third-party sync that widens what
  we hold without a reason recorded in the design notes. Write state transitions as
  appends, never as destructive updates.
- **The PR author who introduces an email trigger** owns justifying it, classifying
  it, and confirming authentication and (where required) unsubscribe controls are in
  place before it can send in production.
- **The reviewer** treats data-protection surface as reviewable: an unexplained
  `send_email(...)`, a schema with no answer for "where does the old value go?", or
  a consent record with no version is a change that needs an owner and a reason —
  refused the same way code without a security review is refused.
- **Legal** owns the wording of each ToS / Privacy Policy version, classifies every
  change as material or non-material with a recorded rationale, and sets the
  retention floor for records the law requires us to keep.
- **The project's technical owner** ensures export, deletion, retention, and history
  are on the roadmap from v1, and audits actual retention against the published
  privacy policy at least quarterly.
- **AI agents** are first-class contributors here and held to exactly the same bar;
  the human who merges an agent's schema, migration, or consent flow owns it.

Privacy is everyone's job, not a compliance team's — this is Cavoukian's principle
of protection **embedded into design** rather than bolted on afterwards.

## 3. Practices

### 3-1. Design data protection into the first schema

Export, deletion, retention, minimization, consent versioning, and change history
MUST be decided when the first user-data model is designed, not deferred. For every
table holding personal data, the design notes MUST answer, before the first
migration ships: what category each field is, its retention period, what happens to
it on account deletion (hard delete, anonymise, or retain under a lawful
exception), and where else the data flows. A schema with no answer for "what
happens to this row when the user leaves?" is not finished.

### 3-2. If a record holds state, history is a requirement — not an enhancement

For any record that carries status, state, a mutable classification, a price, a
policy version, or any field whose *previous* value could later be asked about, a
change-history structure MUST be designed in from the start.

- The design MUST make it possible to answer, for any record: **what its state was
  at an arbitrary past instant**, and **what sequence of changes** produced the
  current state.
- Each recorded change SHOULD capture at minimum the **entity identifier**, the
  **new state** (or delta), a **valid-from timestamp**, the **actor / cause**, and —
  where the history feeds audit — enough context to explain *why* it changed.
- "We'll add history when we need it" MUST be treated as a design defect: by the
  time you need it, the history you need has already been overwritten. If history is
  genuinely not required for a record, that decision MUST be recorded in a schema
  comment or design note, so it is a choice and not an omission.

### 3-3. Choose a history structure that fits the record

There is more than one well-established way to keep history. Engineering MUST choose
deliberately from these (or a documented equivalent) rather than default to
overwrite because it is less code today. All are appropriate; the wrong choice is
*none*.

| Structure | Keeps | Best when | Anchor |
| --- | --- | --- | --- |
| **Append-only / immutable audit log** | One immutable row per change (who/what/when), separate from the live row | You need a tamper-evident trail alongside a normal mutable table | WORM / audit-log discipline |
| **System-versioned temporal table** | Every row version with `[valid-from, valid-to]` system time, queryable "AS OF" a past instant | The database can own history transparently and you want point-in-time SQL | **SQL:2011** system-versioned tables |
| **Bi-temporal** | Two timelines — *valid time* (when the fact was true) and *transaction time* (when we recorded it) | The real-world effective date differs from when we learned it (back-dated corrections, retroactive consent) | **SQL:2011** bi-temporal |
| **Slowly Changing Dimension (Type 2)** | A new row per change with effective/expiry dates and a "current" flag | Analytical / warehouse dimensions reporting over historical attribute values | Kimball **SCD Type 2** |
| **Event Sourcing** | The full sequence of state-changing events; current state is a *derived projection* | State is inherently a sequence of business events and the event log is the source of truth | Fowler / Greg Young **Event Sourcing** |

Whichever is chosen, the **previous value MUST remain retrievable** after a change.
A change that leaves no recoverable prior state is an overwrite, whatever it is
called. Corrections SHOULD be new records that supersede, not edits that erase.

### 3-4. Derive "current", don't destroy "past"

The current state of a stateful record MUST be **derivable** from its history, not
maintained by destroying the history.

- "Current" is a **projection / replay** over the events, or the row with the latest
  `valid-from` (or `is_current = true`) — computed, not carved out by deletion.
- A denormalised current-state column or table is permitted as an **optimisation**,
  but it MUST be reproducible from the history and MUST NOT be the only place the
  fact lives.
- Withdrawals, reversals, and cancellations MUST be recorded as **new** entries (a
  `cancelled` event, a superseding row), never as deletion of the prior entry. That
  something *was* active and then cancelled is itself history worth keeping.

### 3-5. Make history queryable, not just retained

Retained history no one can query is a liability, not an asset — it costs storage
and answers nothing.

- Each history structure MUST carry the **temporal join keys** needed to reconstruct
  a point in time: a stable entity id plus the time bounds
  (`valid-from`/`valid-to`, effective/expiry dates, or event sequence + timestamp).
- Point-in-time reconstruction ("state AS OF date D") SHOULD be a documented, tested
  query — not a one-off archaeology exercise when a dispute lands.
- Where the database offers it natively (SQL:2011 `FOR SYSTEM_TIME AS OF`, or engine
  equivalents), prefer the native mechanism over hand-rolled history tables: less
  code, and harder to get subtly wrong.

### 3-6. Data minimization

The least data we can hold is the safest data — data we never collected can never
leak, never needs exporting, and never needs deleting.

- Collect only fields the feature **actually uses** (PDPA General Principle; the
  APPI's purpose-of-use limitation; GDPR Art. 5(1)(c)). Do not collect "just in
  case."
- Prefer not storing personal data at all where a design allows it — derive rather
  than store, reference rather than copy.
- Logs, analytics, and error reports are personal data when they carry user
  identifiers: minimize and set retention on them too, consistent with the
  [Security Policy](/security-policy)'s treatment of logs as protected assets.

### 3-7. Documented retention, audited against the running system

Retention MUST be a decision on the record, not an accident of "we never delete
anything" (PDPA **Retention** Principle; the APPI's retention limits; GDPR Art.
5(1)(e), storage limitation).

- Each category of personal data MUST have a **documented retention period** and a
  reason. "Indefinite" is a choice that must be justified, not a default.
- Retention SHOULD be **enforced automatically** — a scheduled job that deletes or
  anonymises data past its period — not left to manual cleanup that never happens.
- Retention periods MUST be reflected truthfully in the user-facing privacy policy
  and **audited against the running system at least quarterly**. If the database
  keeps data longer than the policy promises, one of the two is wrong — fix it.
- History (§3-2) is bounded by **two independent floors**: keep *at least* as long
  as law and audit require (consent, financial, personal-data-change records), and
  keep *no longer* than minimization allows for personal data. Neither "keep
  everything forever" nor "overwrite immediately" is automatically correct; design
  the window to satisfy both.

### 3-8. Self-service data export (portability)

A user MUST be able to export their own data themselves, without emailing support
and without a developer running a query (PDPA **Access** Principle and the
**data-portability** right added by the 2024 Amendment; the APPI's 開示 access
right; GDPR Art. 20).

- Export MUST be **portable and machine-readable** — JSON or CSV, documented schema,
  UTF-8 — per the Art. 20 standard of "structured, commonly used and
  machine-readable."
- Export SHOULD cover **all** data tied to the user — content they created, settings,
  retained activity — matching the access right of GDPR Art. 15, not just their
  profile.
- Export SHOULD be self-service in the product UI. Large exports MAY be generated
  asynchronously and delivered via a time-limited, authenticated link.
- The export path MUST authenticate the requester as the data subject — an
  unauthenticated export endpoint is a data-exfiltration endpoint. A portable export
  is the difference between a user *choosing* to stay and a user *trapped* into
  staying; make the door visible.

### 3-9. Complete account and data deletion (erasure)

A user MUST be able to delete their account and have their personal data actually
deleted (PDPA **Access** Principle and the right to withdraw consent; the APPI's
利用停止・消去 cease-use/erasure right; GDPR Art. 17; CCPA/CPRA right to delete).

- **Deletion semantics and cascade MUST be defined at schema time** (§3-1): for every
  table, decide up front whether the row is hard-deleted, anonymised, or retained
  under a lawful exception, and wire the foreign-key cascade / cleanup job to match.
- Deletion MUST propagate to **all copies**: primary store, caches, search indexes,
  analytics, and any third-party processor the data was shared with. Enumerate these
  at design time — a copy you forgot about is a copy you did not delete.
- **Backups** are the documented exception: personal data MAY persist in encrypted
  backups until they age out on normal rotation, provided the window is documented
  and the data is not restored into live use.
- Where full erasure is impossible because a lawful obligation requires a record
  (e.g. financial/transaction records), **anonymise** rather than retain
  identifiable data, and record which exception applies.
- Deletion SHOULD be self-service, with a clear confirmation and a stated completion
  timeframe. A short, cancellable, disclosed grace period (to guard against account
  takeover or misclicks) is acceptable.

### 3-10. Data subject request (DSR) workflow

Even with self-service, some access/deletion/portability requests arrive by other
channels. Have a defined path for them.

- There MUST be a known, documented way to receive and fulfil an access, deletion,
  or portability request, with a **named owner**.
- Requests SHOULD be fulfilled within the statutory window (GDPR: **one month**;
  CCPA/CPRA: **45 days**), and the requester's identity MUST be verified before data
  is handed over or destroyed.
- Wherever possible the DSR workflow SHOULD reuse the *same* export and deletion
  machinery as the self-service features — one code path, not a fragile manual side
  channel.

### 3-11. Data residency and sovereignty

"Data sovereignty" also means honouring *where* the data is legally allowed to live
— the PDPA's **cross-border transfer** rule (under the 2024 Amendment, transfer only
to a place with substantially similar or an adequate level of protection, or on
another permitted ground such as consent), the APPI's cross-border-provision rule,
and the GDPR's Chapter V transfer safeguards.

- Know and document **which region** personal data is stored and processed in, and
  keep it consistent with client and legal requirements — this extends the residency
  note in the [Infrastructure Planning Policy](/infra-planning-policy).
- When a client or jurisdiction requires data to stay in a region, that constraint
  MUST be reflected in the infrastructure, not just promised in prose.

### 3-12. Version every legal document with a persistent identifier

Each ToS and Privacy Policy MUST carry a **persistent, immutable version
identifier**. A published version is frozen — never edited in place; a change
produces a **new version**.

- Each version MUST record a stable version id (e.g. `privacy-policy@2026-07-15` or
  a monotonic `v7`), its **effective date**, the **full text** (or a content hash),
  and the **classification** of the change relative to the previous version (§3-14).
- Superseded versions MUST remain retrievable forever: a user who consented to `v5`
  MUST be able to retrieve the exact `v5` text they saw.
- The identifier MUST be the join key between the consent event (§3-13) and the
  document text. A consent record pointing at "the Privacy Policy" with no version is
  **not** a valid record — the PDPA **Notice and Choice** Principle and GDPR Art.
  7(1) put the burden on us to *demonstrate* consent, which is impossible for wording
  we can no longer reproduce.

### 3-13. Record each consent as an immutable event

Every act of consent MUST be written to an **append-only, immutable audit trail** as
a discrete event — a specific application of the history discipline in §3-2 to §3-5.
The event is a fact about the past; it is never updated or deleted.

Each consent event MUST capture at minimum:

- **User** — a stable subject identifier.
- **Policy type** — e.g. `terms-of-service`, `privacy-policy`, `cookie-consent`, or a
  specific processing purpose.
- **Policy version** — the persistent identifier from §3-12 (which exact wording was
  shown and agreed to).
- **Timestamp** — a trusted, timezone-explicit UTC timestamp of the affirmative act.
- **Consent action** — `granted` or `withdrawn` (withdrawal is a new event, never a
  deletion of the grant).
- **Method / context** — how consent was captured (checkbox on signup, re-consent
  modal) and, where practical, the collection point, so the record shows a **clear
  affirmative action**.

Rules:

- Events MUST be **immutable**; corrections are appended, never rewritten. The store
  SHOULD be append-only / WORM-style (hash-chained or write-once) so tampering is
  detectable. The current consent state of a user is *derived* by replaying their
  event stream (§3-4), not stored as an overwritable flag.
- **Withdrawal MUST be as easy as granting** (PDPA right to withdraw consent; GDPR
  Art. 7(3)) and MUST itself be recorded as an event.
- The consent request MUST be **clearly distinguishable** from other matters — not
  buried inside unrelated ToS acceptance (GDPR Art. 7(2)). This is how Consent
  Management Platforms operate under the IAB TCF: consent encoded per-purpose and
  per-vendor against a versioned specification, not a single opaque yes.

### 3-14. Classify changes: material vs non-material

Every new version MUST be classified by Legal before publication, with the rationale
recorded alongside the version.

- **Non-material change** — wording clarifications, typo fixes, restructuring,
  contact-detail updates: anything that does **not** alter what data is collected,
  the purposes, legal basis, recipients, retention, user rights, or cross-border
  transfers. Non-material changes MUST be **notified** to users but do **not** require
  fresh consent.
- **Material change** — any change to the scope or substance of processing: new
  categories of personal data, new purposes, new recipients or sharing, new
  international transfers, changed retention, changed legal basis, or any expansion of
  what the user is agreeing to. A material change **invalidates prior consent for the
  changed scope** and MUST trigger re-consent (§3-15).

When in doubt, classify as **material**. The cost of over-classifying is one extra
prompt; the cost of under-classifying is processing personal data without a valid
legal basis. **Be Kind** — err toward asking again.

### 3-15. Force re-consent on material changes — never rely on "continued use"

On a **material** change, OSBR MUST obtain **fresh, affirmative consent against the
new version** before continuing to process personal data under the new scope.

- OSBR MUST **block or limit access** to force re-consent — e.g. an interstitial the
  user must actively act on. Access to the changed processing is gated until a new
  consent event (§3-13) is recorded against the new version.
- OSBR MUST NOT treat **continued use, silence, inactivity, or a pre-ticked box** as
  acceptance. Consent requires a **clear affirmative act** (GDPR Recital 32; Art.
  4(11) — freely given, specific, informed, unambiguous). This is the same principle
  the ePrivacy Directive applies to cookies: prior, informed, affirmative consent,
  not opt-out-by-continuing.
- The re-consent flow MUST show, or clearly link to, **what changed**, so consent is
  **informed**.
- Gating SHOULD be **proportionate**: limit access to the affected feature or
  processing, not the user's own data or account. A user who declines MUST retain the
  ability to access and export their existing data (§3-8) and to withdraw.
- For non-material changes, **notice** is sufficient and MUST still be logged.

### 3-16. Notice at collection

At the point personal data is first collected, OSBR MUST present a **notice at
collection** identifying the categories of data and the purposes, and link to the
current Privacy Policy version (the PDPA **Notice and Choice** Principle; the APPI's
purpose-of-use notice; CCPA/CPRA notice-at-collection; the *informed* limb of GDPR
consent). The version shown at collection MUST match the version recorded in
the consent event.

### 3-17. Justify and review every email trigger

An email trigger is any code path that sends a message to a person. Each new or
changed trigger MUST be described in the PR that introduces it: what event fires it,
who receives it, why it needs to exist, and how often it can fire per recipient. A
trigger that cannot be justified in a sentence should not ship — reviewers treat an
unexplained `send_email(...)` the way they treat an unexplained network call.

### 3-18. Classify transactional vs marketing

Every trigger MUST be classified as **transactional** or **marketing /
notification**, because the classification determines the legal and consent rules
that apply.

- **Transactional** — a message sent in direct response to an action or relationship
  the recipient initiated: password resets, receipts, security alerts, booking
  confirmations, account notices. These generally do not require prior opt-in but MUST
  still identify the sender honestly and carry no marketing content, or they lose
  transactional status.
- **Marketing / notification** — anything promoting a product, feature,
  re-engagement, digest, or optional update. These require consent and unsubscribe
  controls (§3-20, §3-21).

The **primary purpose** of a message, not its label, decides classification (the
CAN-SPAM "primary purpose" test): a "receipt" padded with promotions is a marketing
message. When a message mixes purposes, the stricter rule wins.

### 3-19. Authenticate the domain before the first production send

The sending domain MUST have **SPF**, **DKIM**, and **DMARC** configured and verified
*before* any production email is sent from it — not after deliverability problems
appear. Unauthenticated mail is filtered, spoofable, and increasingly rejected.

- **SPF** — publish the sending service's hosts in a DNS TXT record so receivers can
  verify the envelope sender is authorised.
- **DKIM** — sign outgoing mail with a domain key so receivers can verify it was not
  altered and genuinely came from the domain.
- **DMARC** — publish a policy telling receivers what to do when SPF/DKIM fail and
  where to send aggregate reports. Start at `p=none` to observe, then move to
  `p=quarantine` / `p=reject` once aligned.
- **BIMI** *(SHOULD, once DMARC is enforced)* — publish a verified brand logo;
  requires an enforced DMARC policy and, for most providers, a Verified Mark
  Certificate.

Bulk senders MUST additionally meet the **Google & Yahoo 2024 bulk-sender
requirements**: authenticate with SPF and DKIM, publish a DMARC policy, keep reported
spam rates below the 0.3% threshold, send from aligned domains, and provide one-click
unsubscribe (RFC 8058) honoured within two days.

### 3-20. Send through a managed service

Production email MUST go through a managed email service provider (ESP) — never a
self-operated SMTP server or a raw library talking directly to recipient MX hosts.
Managed providers give us authenticated sending, reputation monitoring, and
bounce/complaint handling a hand-rolled sender does not. Bounces and complaints MUST
feed a **suppression list** so we stop mailing addresses that hard-bounce or
complain; ignoring them is the fastest way to lose sender reputation and get all our
mail — including transactional — filtered.

### 3-21. Unsubscribe and preference management before any marketing send

No marketing or notification email may be sent in production until unsubscribe and
preference management are in place. Every such message MUST include a clear, working
unsubscribe mechanism that takes effect promptly and requires no login or reply. This
is both an OSBR courtesy and a hard legal requirement in every market we operate in:

- **CAN-SPAM (US)** — a visible, working opt-out honoured within 10 business days,
  honest headers and subject lines, and a physical postal address.
- **特定電子メール法 (Japan)** — an **opt-in** regime: advertising email may be sent only
  to recipients who consented in advance, with consent records kept, sender
  identification present, and an opt-out path in every message.
- **GDPR (EU/EEA)** — marketing to individuals requires a freely given, specific,
  informed, unambiguous opt-in, records proving it, and withdrawal as easy as it was
  given (§3-13).

Where these regimes overlap for a recipient, apply the strictest: default to opt-in,
keep consent records, and make opting out trivial.

### 3-22. Protect deliverability and sender reputation as a shared asset

Sender reputation is domain-wide: a noisy marketing trigger degrades delivery of
password resets and receipts too. Send only wanted mail, keep volume and cadence
steady rather than spiky, warm up new sending domains/IPs, monitor bounce and
complaint rates against provider thresholds, and remove addresses that bounce or
complain. Reputation is earned slowly and lost in a single bad send.

## 4. Design-time checklist

Before the first user-data migration ships, the design notes SHOULD answer:

- [ ] What personal data does this model hold, and what category is each field?
- [ ] What is the retention period for each, and why? Does the privacy policy's
      stated retention match what the schema actually does?
- [ ] On account deletion, what happens to each table — hard delete, anonymise, or
      retain under which exception? Is the cascade wired?
- [ ] Where else does this data flow (cache, index, analytics, third parties), and
      how is each cleaned on deletion?
- [ ] How does a user export this data themselves, in a machine-readable format?
- [ ] For every field that holds **state / status / a mutable classification**: is a
      history structure identified (§3-3), or is "no history required" recorded as a
      deliberate decision?
- [ ] Is the **previous value retrievable** after any change, "current" **derivable**
      from history, and are withdrawals/cancellations recorded as **new entries**?
- [ ] Does the history carry the **temporal keys** to answer "state AS OF a past
      instant," and does retention satisfy both the **legal floor** and the
      **minimisation ceiling**?
- [ ] For consent: is every record joined to a **persistent policy version**, written
      **append-only**, and captured as a **clear affirmative act**?

If personal-data state can be overwritten with no recoverable prior value, or consent
cannot be tied to an exact version, the design is not ready.

## References

**Privacy law.** The organisation-level notice these controls uphold is the
[Privacy Policy](/privacy-policy).

*Malaysia*

- Personal Data Protection Act 2010 (Act 709) and the seven Personal Data Protection Principles — General, Notice and Choice, Disclosure, Security, Retention, Data Integrity, Access — Personal Data Protection Commissioner / JPDP — <https://www.pdp.gov.my/>
- Personal Data Protection (Amendment) Act 2024 (Act A1727) — mandatory breach notification, Data Protection Officer duty, data portability, cross-border transfer to jurisdictions with substantially similar / adequate protection, and "data user" → "data controller" — <https://www.pdp.gov.my/>

*Japan*

- 個人情報保護法 (Act on the Protection of Personal Information, APPI) — Personal Information Protection Commission (PPC) — purpose-of-use specification, cross-border-provision rule, and 開示・訂正・利用停止 rights — <https://www.ppc.go.jp/en/legal/>
- 特定電子メール法 — 特定電子メールの送信の適正化等に関する法律 (Japan) — opt-in regime for advertising email.

*EU / US / international*

- EU General Data Protection Regulation (GDPR), Regulation (EU) 2016/679 — <https://gdpr-info.eu/>
  - Art. 4(11) — definition of consent: freely given, specific, informed, unambiguous.
  - Art. 5 — principles incl. minimization (5(1)(c)) & storage limitation (5(1)(e)) — <https://gdpr-info.eu/art-5-gdpr/>
  - Art. 7 — conditions for consent: demonstrate (7(1)), distinguishable (7(2)), withdrawal (7(3)).
  - Art. 15 — right of access — <https://gdpr-info.eu/art-15-gdpr/>
  - Art. 17 — right to erasure — <https://gdpr-info.eu/art-17-gdpr/>
  - Art. 20 — right to data portability — <https://gdpr-info.eu/art-20-gdpr/>
  - Recital 32 — consent by a clear affirmative act; silence / pre-ticked boxes / inactivity do not constitute consent.
- California CCPA / CPRA (Cal. Civ. Code §1798.100 et seq.) — notice at collection, right to know, right to delete — <https://cppa.ca.gov/regulations/>
- ePrivacy Directive 2002/58/EC (as amended by 2009/136/EC), Art. 5(3) — prior informed consent for storing/accessing information on a terminal device.
- OECD Privacy Framework — collection limitation, purpose specification, use limitation, security safeguards — <https://www.oecd.org/en/publications/2013/07/the-oecd-privacy-framework_g1g33269.html>
- CAN-SPAM Act — 15 U.S.C. §§ 7701–7713; FTC *CAN-SPAM Act: A Compliance Guide for Business*.

**Privacy engineering frameworks**

- Privacy by Design — the 7 Foundational Principles (Ann Cavoukian) — <https://iapp.org/media/pdf/resource_center/pbd_implement_7found_principles.pdf>
- ISO/IEC 27701 — Privacy Information Management System (PIMS) — <https://www.iso.org/standard/71670.html>
- ISO/IEC 29100 — Privacy framework — <https://www.iso.org/standard/45123.html>
- IAB Europe Transparency & Consent Framework (TCF) — per-purpose / per-vendor consent encoded against a versioned specification (the TC String).

**History & temporal patterns**

- Martin Fowler — *Event Sourcing* — <https://martinfowler.com/eaaDev/EventSourcing.html>
- Greg Young — Event Sourcing / CQRS — the event log as authoritative source of truth, read models derived from it.
- Martin Fowler — *Temporal Patterns* (Audit Log, Effectivity, bi-temporal model) — <https://martinfowler.com/eaaDev/timeNarrative.html>
- SQL:2011 (ISO/IEC 9075:2011) — system-versioned temporal tables & bi-temporal data; `FOR SYSTEM_TIME AS OF` point-in-time queries.
- Ralph Kimball — Slowly Changing Dimensions, Type 2 (*The Data Warehouse Toolkit*).
- Append-only / immutable audit log (WORM) — write-once, tamper-evident change records kept alongside the live table.

**Email authentication & deliverability**

- SPF — RFC 7208, *Sender Policy Framework (SPF) for Authorizing Use of Domains in Email, Version 1*.
- DKIM — RFC 6376, *DomainKeys Identified Mail (DKIM) Signatures*.
- DMARC — RFC 7489, *Domain-based Message Authentication, Reporting, and Conformance*.
- One-click unsubscribe — RFC 8058, *Signaling One-Click Functionality for List Email Headers*.
- BIMI — *Brand Indicators for Message Identification* (AuthIndicators Working Group; requires enforced DMARC).
- Google — *Email sender guidelines* (2024 bulk-sender requirements); Yahoo — *Sender requirements & recommendations* (2024).

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the Security lens this standard serves.
- [Security Policy](/security-policy) — protecting data from unauthorised access; protected-asset definitions.
- [Infrastructure Planning Policy](/infra-planning-policy) — data residency, backups, durability, least-privilege access.
- [Database Guidelines](/database-guidelines) — schema and history structure design.
- [Development Guide](/development-guide) — pull-request Specification section where email triggers and schema changes are justified.
