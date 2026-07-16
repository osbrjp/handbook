# Legal Compliance

This is the standard for enumerating the legal and regulatory constraints on a
project **before design begins**, and recording them where they will actually be
honoured — the project's risk register. It sits at the planning end of the
lifecycle, alongside the [Development Guide](/development-guide)'s *Planning &
Shaping* stage: that stage says *understand the client's business before you take
requirements*; this standard says *enumerate the legal duties that business
carries before you draw the architecture*. Legal constraints are design premises,
not late surprises. Deviations are allowed, but — as everywhere in the handbook —
they must be deliberate and justified in the project's design notes.

Almost every expensive compliance failure is a failure of *timing*, not of
intent: the duty was real and knowable, but nobody looked it up until the
architecture was already built around ignoring it. This standard is where OSBR's
values become preventative. **Be Nice**: surfacing a constraint early is a gift
to your future teammate — the design that already assumes consent, notation, and
retention limits is the one nobody has to tear apart later. **Be Kind**: these
rules exist to protect the people whose personal data and money pass through what
we build, so honouring them is a duty owed to those people, not a box-ticking
chore. **Be Strong**: do the unglamorous legal homework up front and tell a
client plainly when the law forbids what they asked for, instead of discovering
it in an audit or a complaint.

## How to read this policy

* **Requirement levels** follow RFC 2119, as elsewhere in the handbook.
  **MUST** / **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a strong
  default overridable only with a documented reason. **MAY** marks a free choice.
* **Named practice.** This is the *compliance-by-design* and *privacy-by-design*
  posture — building legal obligations into the design from the first line rather
  than inspecting for them at the end. Privacy-by-design is codified as **data
  protection by design and by default** in
  [GDPR Article 25](https://gdpr-info.eu/art-25-gdpr/) and traces to
  [Ann Cavoukian's seven foundational principles](https://iapp.org/resources/article/privacy-by-design-the-7-foundational-principles/).
  We adopt the *discipline* of these frameworks and right-size it for an SME
  engagement — we do not import the headcount or ceremony of their reference
  setups.
* **Escalation.** Where a question is genuinely a legal judgement call, escalate
  to qualified counsel. This policy makes sure the question gets *asked* in time —
  not that engineers answer it alone.

[[TOC]]

## 1. Goal

A cookie banner bolted on after launch, a mandatory online-seller disclosure page
— Malaysia's under the Consumer Protection (Electronic Trade Transactions)
Regulations 2024, or Japan's 特定商取引法に基づく表記 — scrambled together the week
before a store opens, a data flow that turns out to need a telecom-business
notification after the pipes are already laid — each is cheap to design in and
painful to retrofit. The goal here is to move that work to the one
moment it is cheap:

**Before design begins, enumerate every legal and regulatory requirement that
applies to this project, treat each as a fixed design premise, and record it in
the project's risk register so it is owned, tracked, and re-evaluated like any
other risk.**

The register itself is the **legal & regulatory register** required by
[ISO/IEC 27001:2022 Annex A control 5.31](https://www.iso.org/standard/27001)
("Legal, statutory, regulatory and contractual requirements shall be identified,
documented and kept up to date") — the same single [risk
register](/supply-chain-risk) the project already keeps, not a parallel document
that quietly falls out of date.

## 2. Responsibility

- The **project lead** owns the legal & regulatory enumeration: that it happens
  *before* design, that it is recorded in the [risk register](/supply-chain-risk),
  and that each requirement has a named owner and a re-evaluation trigger.
- The **requirement owner** (named per entry) is accountable for one legal
  requirement: that the design satisfies it, that evidence of compliance exists,
  and that its re-evaluation date is honoured.
- **Every developer and collaborator** raises a newly-triggered legal duty the
  moment a design change creates one — a new data class, a new payment flow, a
  new external transmission, a new jurisdiction. Compliance is not a lawyer's
  phase bolted onto the end; it is a shared reflex during planning. If you can see
  a legal constraint, you own naming it.
- The **client** confirms the business facts that decide applicability (who the
  users are, where they are, what is sold, what data is collected) and co-owns the
  duties that are legally theirs as the operator or data controller.
- Genuine legal judgement calls — does *this* service count as a 電気通信事業? is
  *this* processing high-risk enough to need a DPIA? — MUST be escalated to
  qualified counsel. This policy ensures the question is asked in time, not that
  engineers answer it alone.

## 3. Practices

Named, established practice, right-sized for an SME engagement. Import the
discipline of the reference material, not its headcount or ceremony.

### 3-1. Enumerate applicable law from the business facts, before design

You cannot design around constraints you have not listed. Before design begins,
the project MUST produce a **legal & regulatory enumeration** derived from the
concrete facts of the engagement (established during the [Development
Guide](/development-guide)'s *Planning & Shaping* stage):

- **Who are the users, and where are they?** Jurisdiction of the users — not of
  the company — is what pulls in most obligations. Users in Malaysia pull in the
  [PDPA (Personal Data Protection Act 2010)](https://www.pdp.gov.my/); users in
  Japan pull in the [APPI (個人情報保護法)](https://www.ppc.go.jp/en/legal/);
  EU/EEA users pull in [GDPR](https://gdpr-info.eu/); users elsewhere pull in
  their own regimes (for example the CCPA/CPRA for California consumers).
- **What data is collected, for what purpose, and how long is it kept?** This
  decides consent, notification, purpose-limitation, and log-retention duties.
- **Is anything sold, and to consumers?** Consumer online sales pull in an
  online-seller disclosure duty. In Malaysia the **Consumer Protection
  (Electronic Trade Transactions) Regulations 2024** require the seller to
  disclose its name/company, business (company) registration number, contact
  (email, phone, address), and the full price, with the **Electronic Commerce
  Act 2006** governing the validity of the electronic contract; in Japan the
  [特定商取引法 (Act on Specified Commercial Transactions)](https://www.no-trouble.caa.go.jp/)
  and its mandatory 特定商取引法に基づく表記 (seller notation).
- **Does the service transmit user information to third parties, or operate as a
  communications service?** This pulls in Japan's telecom rules (§3-3).
- **Are card payments handled?** This pulls in [PCI DSS](https://www.pcisecuritystandards.org/).

The output is a list of *named* obligations tied to *named* business facts — not
"we should probably be compliant", but "Malaysian users → PDPA applies → notice
and choice, security, and retention limits are design premises; EU users → GDPR
adds lawful basis, privacy notice, and data-subject rights".

### 3-2. The starter checklist — enumerate, then justify each in or out

Every project MUST walk this list and, for each item, record either **how it will
be satisfied** or **why it does not apply**. An explicit "not applicable,
because…" is a required answer, not a silent omission.

| Requirement | Trigger | Named source |
| --- | --- | --- |
| **Terms of Service** | Any service users sign up for or transact through | Contract law; consumer-protection statutes |
| **Privacy policy / privacy notice** | Any collection of personal data | [PDPA](https://www.pdp.gov.my/) Notice and Choice Principle; [APPI](https://www.ppc.go.jp/en/legal/) purpose-of-use notification; [GDPR Arts. 13–14](https://gdpr-info.eu/art-13-gdpr/) |
| **Data-subject / individual rights** | Processing personal data of Malaysian, Japanese, or EU/EEA users | [PDPA](https://www.pdp.gov.my/) Access Principle (access, correction, withdrawal, portability); [APPI](https://www.ppc.go.jp/en/legal/) 開示・訂正・利用停止; [GDPR Arts. 6, 15–22](https://gdpr-info.eu/art-6-gdpr/) |
| **Consumer privacy rights (US)** | Personal data of California (or similar-state) consumers | CCPA / CPRA |
| **Online-seller disclosure (Malaysia)** | Consumer online sales from Malaysia | Consumer Protection (Electronic Trade Transactions) Regulations 2024; Electronic Commerce Act 2006 |
| **特定商取引法 notation (表記)** | Consumer online sales from Japan | [特定商取引法](https://www.no-trouble.caa.go.jp/) |
| **Cookie / tracker consent + disclosure** | Cookies or trackers beyond the strictly necessary | [ePrivacy Directive 2002/58/EC](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058); Japan external-transmission rules (§3-3) |
| **Telecom-business notification** | Operating a telecommunications service in Japan | [電気通信事業法 (Telecommunications Business Act)](https://www.soumu.go.jp/main_sosiki/joho_tsusin/eng/) |
| **PCI DSS controls** | Storing, processing, or transmitting cardholder data | [PCI DSS](https://www.pcisecuritystandards.org/) |
| **Log-retention duties (and limits)** | Any logging of user activity | Retention obligations vs. GDPR storage limitation (§3-5) |
| **DPIA** | High-risk processing (§3-4) | [GDPR Art. 35](https://gdpr-info.eu/art-35-gdpr/) |

The checklist is a floor, not a ceiling. It is a prompt to think, not the full
universe of law — sector rules (finance, health, education) and other
jurisdictions are enumerated the same way.

### 3-3. Get the Malaysia- and Japan-specific and cookie duties right

These are the ones most often missed by teams anchored on GDPR alone.

- **Consumer Protection (Electronic Trade Transactions) Regulations 2024
  (Malaysia).** Consumer online sales from Malaysia require the seller to
  publish its name/company, business (company) registration number, contact
  (email, phone, address), and the full price; the **Electronic Commerce Act
  2006** governs the validity of the resulting electronic contract and records.
  Like Japan's notation below, this is a design premise — a page that must exist
  and be reachable, decided before the checkout flow is drawn.
- **特定商取引法 (Specified Commercial Transactions Act).** Consumer online sales
  require a published **特定商取引法に基づく表記**: seller identity, address,
  contact, price, delivery, and return/cancellation terms. It is a design premise
  for any store — a page that must exist and must be reachable, decided before the
  checkout flow is drawn.
- **電気通信事業法 (Telecommunications Business Act).** A service that mediates
  others' communications (messaging, some SaaS, some platforms) may be a
  **電気通信事業** requiring **notification (届出) to the MIC**. Whether a given
  service qualifies is a legal judgement — the duty here is to *raise the question*
  before architecture assumes the answer is "no".
- **External-transmission rules (外部送信規律).** The 2023 amendment to the
  Telecommunications Business Act requires services to **disclose to users when
  their information is transmitted to third parties** (analytics, ad tags, embedded
  widgets) — Japan's functional counterpart to the ePrivacy cookie-consent regime.
  If the design embeds third-party tags, the disclosure mechanism is a design
  premise.
- **Cookie / ePrivacy consent (EU).** Under the [ePrivacy
  Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058),
  non-essential cookies and trackers require **prior consent**. That means consent
  MUST be capturable *before* the tracker fires — an architectural constraint on
  how analytics and tags load, not a banner you sprinkle on at the end.

### 3-4. Decide DPIA up front, not after launch

A **Data Protection Impact Assessment** is required by [GDPR Article
35](https://gdpr-info.eu/art-35-gdpr/) when processing is **likely to result in a
high risk** to individuals — large-scale profiling, systematic monitoring, or
large-scale processing of special-category data are the canonical triggers (see
the [EDPB / WP29 DPIA guidelines](https://ec.europa.eu/newsroom/article29/items/611236)).

- The project MUST decide **whether a DPIA is required during planning**, because
  a DPIA that concludes "this is too risky as designed" is only useful *before*
  the design is built.
- A DPIA is the privacy-by-design mechanism made concrete: it identifies the risk
  to data subjects, the measures that reduce it, and the residual risk that
  remains — the same shape as a [risk-register](/supply-chain-risk) entry, and it
  SHOULD live there.
- Where APPI applies, treat the equivalent risk-of-leakage assessment and the
  Personal Information Protection Commission's guidance as the parallel
  obligation.

### 3-5. Treat log retention as a two-sided duty

Logs attract *two* opposing legal pressures, and the design MUST satisfy both:

- **A duty to retain** — some records must be kept for a defined minimum
  (accounting/tax records, sector-specific audit trails, and communications
  records where a telecom obligation applies). Losing them too early is the
  violation.
- **A duty not to over-retain** — Malaysia's [PDPA](https://www.pdp.gov.my/)
  **Retention Principle**, APPI's purpose-limitation principle, and [GDPR Article
  5(1)(e)](https://gdpr-info.eu/art-5-gdpr/) **storage limitation** require that
  personal data is **not kept longer than necessary**. Keeping everything forever
  is the violation.

The resolution is a **defined, per-data-class retention period** chosen at design
time and recorded in the register — long enough to meet retention duties, short
enough to meet minimisation duties. "We keep all logs indefinitely" is a design
decision that fails both tests and MUST be caught before, not after, the logging
pipeline is built. The concrete controls that implement a retention schedule live
in [Data Protection](/data-protection); this standard is where the *duty* to have
one is fixed.

### 3-6. Record every requirement in the risk register

Enumeration is worthless if it lives in a one-off document nobody revisits. Each
identified legal requirement MUST become an entry — or a linked set of entries —
in the project's single [risk register](/supply-chain-risk), carrying the same
fields every entry carries:

| Field | For a legal requirement |
| --- | --- |
| **Description** | The obligation and what triggers it: *Malaysian users → PDPA → the seven Personal Data Protection Principles are design premises; EU users → GDPR Art. 25 → data protection by design and by default is required.* |
| **Likelihood / Impact** | The risk of non-compliance — how likely to be caught, how bad the consequence (fine, injunction, reputational, client harm). |
| **Countermeasures** | The design and process controls that satisfy the obligation (consent flow, notation page, DPIA, retention schedule). |
| **Residual risk (named & accepted)** | Any remaining exposure, explicitly accepted by an authorised named person — including "we sought counsel and this is the agreed interpretation". |
| **Owner** | The single named requirement owner. |
| **Re-evaluation date / trigger** | When it is revisited; and the design changes that force an early revisit. |

This makes legal compliance **one kind of risk among others**, handled by the
machinery the project already runs, rather than a separate track. It is the
[ISO/IEC 27001:2022 control 5.31](https://www.iso.org/standard/27001) legal
register and control 5.34 (privacy and protection of PII), made operational.

## 4. Rules summary (MUST / SHOULD)

- A project **MUST** produce a legal & regulatory enumeration from the business
  facts **before design begins** (§3-1).
- Every item on the §3-2 checklist **MUST** be answered explicitly — how it is
  satisfied, or a reasoned "not applicable" (§3-2).
- Consent and disclosure mechanisms (cookie/ePrivacy, external-transmission)
  **MUST** be treated as architectural premises capturable *before* trackers fire,
  not retrofitted (§3-3).
- The project **MUST** decide during planning whether a **DPIA** is required, and
  run it before the design it assesses is built (§3-4).
- Every data class that is logged **MUST** have a defined retention period that
  satisfies both retention duties and storage-limitation/minimisation duties
  (§3-5).
- Every identified legal requirement **MUST** be recorded as an owned,
  re-evaluated entry in the project's single [risk register](/supply-chain-risk)
  (§3-6).
- Genuinely legal judgement calls (telecom-business applicability, DPIA necessity,
  lawful-basis choice) **MUST** be escalated to qualified counsel (§2).
- Projects **SHOULD** revisit the enumeration whenever a design change alters the
  business facts that decided applicability (§5).

## 5. Re-evaluation triggers

Applicable law is not fixed for the life of a project — the *facts* that decide it
change. A project **MUST** re-evaluate the affected legal entries, and add new
ones, whenever any of the following happens, without waiting for the scheduled
date:

- **A new user jurisdiction** — the service opens to users in Malaysia, Japan, the
  EU, a US state, or elsewhere it did not serve before, pulling in that
  jurisdiction's regime.
- **A new data class or purpose** — the project starts collecting or using a new
  category of personal data, or uses existing data for a new purpose (re-checks
  consent, notice, DPIA).
- **A new payment or commerce flow** — card handling (PCI DSS) or consumer sales
  (Malaysia's Consumer Protection (Electronic Trade Transactions) Regulations
  2024; Japan's 特定商取引法) enters scope.
- **A new external transmission or third-party tag** — analytics, ads, or embeds
  that transmit user information (external-transmission disclosure, cookie
  consent).
- **A change in the service's nature** — it begins mediating communications
  (possible telecom notification) or changes retention behaviour.
- **A change in the law itself** — a regulation is amended (as the
  Telecommunications Business Act was in 2023); the register entry's source has
  moved.

## References

The authoritative regimes this policy is grounded in.

**Compliance- and privacy-by-design (the frame)**

- Privacy by Design — the 7 Foundational Principles (Ann Cavoukian) — <https://iapp.org/resources/article/privacy-by-design-the-7-foundational-principles/>
- GDPR Article 25 — Data protection by design and by default — <https://gdpr-info.eu/art-25-gdpr/>
- ISO/IEC 27001:2022 — Annex A controls 5.31 (legal, statutory, regulatory & contractual requirements) and 5.34 (privacy and protection of PII) — <https://www.iso.org/standard/27001>

**Malaysia**

- Personal Data Protection Act 2010 (Act 709) and the seven Personal Data Protection Principles — Personal Data Protection Department (JPDP) — <https://www.pdp.gov.my/>
- Personal Data Protection (Amendment) Act 2024 (Act A1727) — data-controller terminology, mandatory breach notification, Data Protection Officer, data portability, cross-border transfer — <https://www.pdp.gov.my/ppdpv1/en/akta/personal-data-protection-amendment-act-2024/>
- Consumer Protection (Electronic Trade Transactions) Regulations 2024 — online-seller disclosure (identity, business registration number, contact, full price); in force 25 December 2024, revoking the 2012 version
- Electronic Commerce Act 2006 (Act 658) — validity of electronic contracts and records

**Japan**

- APPI (個人情報保護法) — Personal Information Protection Commission — <https://www.ppc.go.jp/en/legal/>
- 特定商取引法 (Act on Specified Commercial Transactions) — <https://www.no-trouble.caa.go.jp/>
- 電気通信事業法 (Telecommunications Business Act), incl. the 2023 external-transmission rules (外部送信規律) — Ministry of Internal Affairs and Communications — <https://www.soumu.go.jp/main_sosiki/joho_tsusin/eng/>

**EU / international data protection**

- GDPR (Regulation (EU) 2016/679) — full text — <https://gdpr-info.eu/>
- GDPR Article 35 — Data Protection Impact Assessment — <https://gdpr-info.eu/art-35-gdpr/>
- EDPB / WP29 — DPIA guidelines (WP248) — <https://ec.europa.eu/newsroom/article29/items/611236>
- ePrivacy Directive 2002/58/EC (cookie consent) — <https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058>

**Payments**

- PCI DSS — Payment Card Industry Data Security Standard — <https://www.pcisecuritystandards.org/>

**Related OSBR standards**

- [Development Guide](/development-guide) — the *Planning & Shaping* stage where the business facts that decide legal applicability are established.
- [Supply-Chain Risk](/supply-chain-risk) — the single risk register these requirements are recorded in, and the likelihood × impact machinery that ranks non-compliance against every other risk.
- [Data Protection](/data-protection) — the concrete controls (access control, logging, retention) that many of these obligations are satisfied by.
- [Quality Gate](/quality-gate) — the AI code review that checks these premises were honoured in the delivered design, not just listed.
