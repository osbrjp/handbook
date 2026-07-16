# Privacy Policy

This is OSBR's organisation-level commitment on personal information (個人情報保護方針)
— the promise, made to the people whose data we hold, that stands behind everything else
in this handbook. It is the counterpart of the [Security Policy](/security-policy) (which
protects information assets) and the [SHEQ Policy](/sheq-policy) (which commits us on safety,
health, environment, and quality): where those govern what we protect, this governs the trust
of the person the data describes. It is a **notice**, not an engineering spec — the concrete
technical controls that satisfy these commitments live in the [Data Protection](/data-protection)
standard, and the legal judgement calls behind them in [Legal Compliance](/legal-compliance).
This document is the promise those pages keep.

Personal information is not ours. It belongs to the person it describes, and they lend it to us
for a purpose. **Be Nice**: a person who can see what we hold, correct it, and ask us to stop is
someone we have treated as a partner, not a resource. **Be Kind**: behind every record is a human
being who trusted someone with it, and honouring that trust is the whole point. **Be Strong**: do
the unglamorous work of collecting less, deleting on time, and telling a client plainly when a use
of data exceeds what the person consented to — even when more data would be convenient.

## How to read this policy

* **Requirement levels** follow RFC 2119, as elsewhere in the handbook. **MUST** / **MUST NOT**
  are absolute. **SHOULD** / **SHOULD NOT** state a strong default overridable only with a
  documented reason. **MAY** marks a free choice.
* **Named practice.** These principles are not novel inventions — they are the long-settled
  duties shared across the world's data-protection regimes, named inline and cited under
  [References](#6-references). We adopt the *discipline* of the reference regimes and right-size
  it for an SME; we do not import a large enterprise's headcount or ceremony to do so.

[[TOC]]

## 1. Goal

Every protection in this handbook exists so that OSBR can be trusted with a loan of personal
information: that we take only what the purpose needs, use it only for what we said, guard it as
if it were our own most sensitive secret, and hand it back, correct it, or stop using it the moment
the person asks and the law allows.

**OSBR commits to handling personal information lawfully and fairly: to obtain it only within the
scope necessary for clearly stated business purposes and with consent; to use it only within those
stated purposes, re-obtaining consent before exceeding them; to restrict provision to third parties
without consent; to protect it with organizational, human, physical, and technical safeguards; to
supervise anyone we entrust it to; and to respond to requests for disclosure, correction, and
suspension of use as the law requires.**

These are the principles common to Japan's [個人情報保護法 (APPI)](https://www.ppc.go.jp/en/legal/),
the EU's [GDPR](https://gdpr-info.eu/), the
[OECD Privacy Guidelines](https://www.oecd.org/en/publications/2013/07/the-oecd-privacy-framework_g1g33269.html),
and the privacy-information-management system codified in
[ISO/IEC 27701](https://www.iso.org/standard/71670.html). OSBR adopts them as commitments, not as
a compliance chore.

## 2. Responsibility

| Role | Responsibility |
| --- | --- |
| **OSBR (as a company)** | Owns this commitment. Provides the policies, training, and controls that make it real, and answers for it when it fails. |
| **Personal-information owner** (named per project) | The person accountable for personal information in a given engagement: that purposes are stated, consent is recorded, retention is bounded, and disclosure/correction/suspension requests are answered in time. |
| **Every developer / collaborator** | Handles personal information only within the stated purpose and their granted access; raises the moment a design or request would collect more, use it differently, or send it somewhere new. |
| **Contractors & sub-processors** | Bound by contract to protect personal information to the same standard, and supervised by OSBR for the life of the engagement (§3-5). |
| **Client** (often the data controller) | Confirms the business facts that set the purpose and lawful basis, and co-owns the duties that are legally theirs as the operator. |

Which "personal information protection manager" role this is depends on the engagement — where OSBR
is the operator we hold the duty directly; where we build for a client who is the controller, we are
the processor and honour the same principles on their behalf. Genuinely legal judgement calls (does a
given use exceed the stated purpose? is a transfer a "third-party provision"?) are escalated per
[Legal Compliance](/legal-compliance); this policy makes sure the question gets asked in time.

## 3. Practices

Named, established practice, right-sized for an SME. The principles are universal; the ceremony is
not — adopt the discipline of the reference regimes without importing a large enterprise's headcount.

### 3-1. Obtain only what the purpose needs, lawfully and fairly

We do not collect personal information because it might be useful someday. Collection is tied to a
**stated purpose** and kept to the **minimum that purpose requires** — the *data minimisation* and
*collection limitation* principle common to
[GDPR Art. 5(1)(c)](https://gdpr-info.eu/art-5-gdpr/), the
[OECD Collection Limitation principle](https://www.oecd.org/en/publications/2013/07/the-oecd-privacy-framework_g1g33269.html),
and the APPI's requirement to specify the purpose of use (利用目的) as clearly as possible.

- Every collection of personal information MUST have a **purpose of use stated before or at the
  point of collection**, in language the person can understand ([APPI](https://www.ppc.go.jp/en/legal/);
  [GDPR Arts. 13–14](https://gdpr-info.eu/art-13-gdpr/)).
- Collection MUST be by **lawful and fair means** — never by deception, concealment, or coercion
  (the APPI's 適正取得 / fair-acquisition duty; the OECD collection-limitation principle).
- We collect the **minimum fields** the stated purpose needs, and no more. A field nobody can tie
  to a stated purpose is a field we do not collect.
- Where consent is the basis, it MUST be a **specific, informed, freely-given** agreement to that
  stated purpose, and MUST be **recorded** — the wording agreed, and when — so we can later prove
  exactly what was consented to.

### 3-2. Use it only within the stated purpose; re-consent to exceed it

The purpose stated at collection is a **boundary**, not a formality. This is *purpose limitation* —
[GDPR Art. 5(1)(b)](https://gdpr-info.eu/art-5-gdpr/), the OECD Purpose Specification and Use
Limitation principles, and the APPI's rule that personal information may not be handled beyond the
scope necessary to achieve the specified purpose of use without the person's consent.

- Personal information MUST be used **only within the stated purpose of use**. A new purpose is a
  new decision, not an extension of an old one.
- To use personal information **beyond the stated purpose**, OSBR MUST either **re-state the purpose
  and obtain fresh consent** before the new use, or rely on another lawful basis where the law
  provides one. Silence is not consent, and "they already gave us the data" is not a basis.
- A change of purpose is a **material change**: the new wording is put to the person and the fresh
  consent recorded (§3-1) before any use under it begins.

### 3-3. Do not provide to third parties without consent

Handing personal information to someone outside OSBR is the moment of highest risk and highest duty.
The APPI's third-party-provision rule (第三者提供) and the GDPR's transfer safeguards both start from
restriction.

- OSBR MUST **not provide personal information to a third party without the person's prior consent**,
  except where the law expressly permits it (e.g. legal obligation, protection of life, or a
  properly-scoped entrustment under §3-5).
- A **processor/contractor we entrust data to in order to carry out the stated purpose is not the
  same as a "third-party provision"** — but it is only exempt when it is properly contracted and
  supervised (§3-5). The distinction is legal, not convenient; when unsure, treat it as a provision
  and get consent.
- **Cross-border transfers** get particular care: the destination's protections, where the data
  physically resides, and any additional consent or safeguards the law requires are decided in
  [Legal Compliance](/legal-compliance) before the transfer is made.

### 3-4. Protect it with organizational, human, physical, and technical safeguards

OSBR commits to the **four categories of safeguard** the APPI names as necessary and appropriate
measures for the security control of personal data (安全管理措置), which map onto the controls of
[ISO/IEC 27701](https://www.iso.org/standard/71670.html) /
[27001](https://www.iso.org/standard/27001) and satisfy the GDPR's
[Art. 32 security-of-processing](https://gdpr-info.eu/art-32-gdpr/) duty:

| Safeguard | What OSBR commits to | Where it is specified |
| --- | --- | --- |
| **Organizational** | A named owner per engagement, defined handling rules, access review, and an incident response path. | [Security Policy](/security-policy) |
| **Human** | Security and privacy training before joining a project; a culture where raising a concern is expected, not punished. | [Security Policy](/security-policy) |
| **Physical** | Device encryption, auto-lock, no work in public spaces, no uncontrolled removable media, remote-wipe. | [Security Policy](/security-policy) |
| **Technical** | Least-privilege access, MFA/passkeys, no long-lived credentials, encryption in transit and at rest, logging and monitoring. | [Data Protection](/data-protection) |

The commitment here is the *promise*; the concrete controls are specified in the
[Security Policy](/security-policy) and, for the technical layer, the engineering
[Data Protection](/data-protection) standard. This policy binds OSBR to keep those adequate to the
personal information we actually hold.

### 3-5. Supervise everyone we entrust personal information to

When OSBR entrusts personal information to a contractor or sub-processor to carry out the stated
purpose, the duty of care does not transfer with the data — it stays with us. This is the APPI's duty
to exercise **necessary and appropriate supervision over a trustee** (委託先の監督) and the GDPR's
[Art. 28 processor](https://gdpr-info.eu/art-28-gdpr/) requirements.

- Entrustment MUST be under a **written contract** binding the contractor to protect the data to at
  least OSBR's standard, to use it only for the entrusted purpose, and to return or delete it at the
  end.
- OSBR MUST **supervise** the contractor for the life of the engagement — selecting them for adequate
  protection, and not treating the contract as the end of the duty.
- A sub-contractor of a contractor is entrusted onward **only with the same protections carried
  through**, and within what the person consented to.
- This is the same supply-chain diligence OSBR applies to any vendor, focused specifically on
  personal information.

### 3-6. Honour disclosure, correction, and suspension requests

A person's rights over their own data are the point at which all of the above becomes real to them.
OSBR commits to honouring **data-subject requests** as the law requires — the APPI's rights of
disclosure, correction, addition, deletion, and suspension of use (開示・訂正・利用停止), which parallel
the GDPR's [rights of access, rectification, erasure, and restriction](https://gdpr-info.eu/chapter-3/)
(Arts. 15–18) and the OECD Individual Participation principle.

- OSBR MUST provide a **reachable way to make a request** and MUST respond within the period and
  manner the applicable law sets — verifying the requester's identity first, so a request cannot
  become a leak.
- On a valid request, OSBR MUST **disclose** what personal information it holds, **correct or add to**
  it where it is wrong or incomplete, and **suspend use, delete, or stop third-party provision** where
  the law requires.
- A request that the law does *not* oblige us to grant (e.g. it would breach another's rights, or a
  retention duty overrides it) is answered with a **reasoned explanation**, not silence.
- Retention is bounded: personal information is **kept only as long as the stated purpose and any legal
  retention duty require**, then deleted — the *storage limitation* balance set in
  [Legal Compliance](/legal-compliance).

## 4. Rules Summary (MUST / SHOULD)

- Every collection of personal information **MUST** have a purpose of use stated at or before
  collection, be limited to the minimum that purpose needs, and be obtained by lawful and fair means
  (§3-1).
- Where consent is the basis, it **MUST** be specific, informed, freely given, and recorded (§3-1).
- Personal information **MUST** be used only within the stated purpose; exceeding it **MUST** be
  preceded by a re-stated purpose and fresh consent, or another lawful basis (§3-2).
- OSBR **MUST NOT** provide personal information to a third party without prior consent, except where
  the law expressly permits or under a properly-supervised entrustment (§3-3).
- OSBR **MUST** protect personal information with organizational, human, physical, and technical
  safeguards, kept adequate to what it holds (§3-4).
- Every contractor entrusted with personal information **MUST** be bound by written contract and
  supervised for the life of the engagement (§3-5).
- OSBR **MUST** respond to disclosure, correction, and suspension requests as the law requires, after
  verifying the requester's identity (§3-6).
- Personal information **MUST** be retained only as long as the purpose and legal duty require, then
  deleted (§3-6).
- Genuinely legal judgement calls (purpose scope, third-party vs. entrustment, cross-border transfer)
  **MUST** be escalated per [Legal Compliance](/legal-compliance) (§2).
- OSBR **SHOULD** review this commitment, and the controls that satisfy it, at least annually and
  whenever the personal information it handles materially changes.

## 5. Related Guidelines

- [Data Protection](/data-protection) — the engineering standard specifying the technical controls
  that satisfy the safeguard commitment (§3-4).
- [Security Policy](/security-policy) — the organizational, human, and physical controls, and the
  incident path, behind the safeguard commitment (§3-4).
- [Legal Compliance](/legal-compliance) — which privacy laws apply, retention limits, cross-border
  transfer, and the escalation of legal judgement calls (§2, §3-3, §3-6).
- [SHEQ Policy](/sheq-policy) — the sibling company-level commitment on safety, health, environment,
  and quality.

## 6. References

The authoritative privacy regimes this commitment is grounded in, chosen because they are the settled
sources on the principles above and are adoptable by a small team.

**Japan**

- 個人情報保護法 (Act on the Protection of Personal Information, APPI) — Personal Information Protection
  Commission (PPC) — <https://www.ppc.go.jp/en/legal/>

**EU data protection**

- GDPR (Regulation (EU) 2016/679) — full text — <https://gdpr-info.eu/>
- GDPR Art. 5 — principles (lawfulness, fairness, purpose limitation, data minimisation, storage
  limitation) — <https://gdpr-info.eu/art-5-gdpr/>
- GDPR Arts. 13–14 — information to be provided (purpose/notice) — <https://gdpr-info.eu/art-13-gdpr/>
- GDPR Arts. 15–18 — rights of access, rectification, erasure, restriction — <https://gdpr-info.eu/chapter-3/>
- GDPR Art. 28 — processor obligations (entrustment/supervision) — <https://gdpr-info.eu/art-28-gdpr/>
- GDPR Art. 32 — security of processing — <https://gdpr-info.eu/art-32-gdpr/>

**International frameworks**

- OECD Privacy Framework (the eight basic principles: Collection Limitation, Purpose Specification,
  Use Limitation, Security Safeguards, Individual Participation, and others) —
  <https://www.oecd.org/en/publications/2013/07/the-oecd-privacy-framework_g1g33269.html>
- ISO/IEC 27701 — Privacy Information Management System (PIMS), extending ISO/IEC 27001/27002 —
  <https://www.iso.org/standard/71670.html>
- ISO/IEC 27001 — Information security management systems — <https://www.iso.org/standard/27001>
