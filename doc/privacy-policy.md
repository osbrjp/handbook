# Privacy Policy

This is OSBR's organisation-level commitment on personal data — the promise, made to the people whose data we hold, that stands behind everything else in this handbook. It is the counterpart of the [Security Policy](/security-policy) (which protects information assets) and the [SHEQ Policy](/sheq-policy) (which commits us on safety, health, environment, and quality): where those govern what we protect, this governs the trust of the person the data describes. It is a **notice**, not an engineering spec — the concrete technical controls that satisfy these commitments live in the [Data Protection](/data-protection) standard, and the legal judgement calls behind them in [Legal Compliance](/legal-compliance). This document is the promise those pages keep.

OSBR is a Malaysian company, so our home law is Malaysia's **Personal Data Protection Act 2010 (PDPA)**. Because we work with a Japanese parent studio and with clients elsewhere, **Japan's APPI** and, where a client brings us within their reach, the **EU's GDPR** and comparable US regimes also apply. These regimes rest on the same core duties, so the commitments below honour all of them.

Personal data is not ours. It belongs to the person it describes, and they lend it to us for a purpose. **Be Nice**: a person who can see what we hold, correct it, and ask us to stop is someone we have treated as a partner, not a resource. **Be Kind**: behind every record is a human being who trusted someone with it, and honouring that trust is the whole point. **Be Strong**: do the unglamorous work of collecting less, deleting on time, and telling a client plainly when a use of data exceeds what the person consented to — even when more data would be convenient.

## How to read this policy

* **Requirement levels** follow RFC 2119, as elsewhere in the handbook. **MUST** / **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a strong default overridable only with a documented reason. **MAY** marks a free choice.
* **Named practice.** These principles are not novel inventions — they are the long-settled duties shared across the world's data-protection regimes, named inline and cited under [References](#6-references). We adopt the *discipline* of these regimes and right-size it for an SME; we do not import a large enterprise's headcount or ceremony to do so.

[[TOC]]

## 1. Goal

Every protection in this handbook exists so that OSBR can be trusted with a loan of personal data: that we take only what the purpose needs, use it only for what we said, guard it as if it were our own most sensitive secret, and hand it back, correct it, or stop using it the moment the person asks and the law allows.

**OSBR commits to handling personal data lawfully and fairly: to obtain it only within the scope necessary for clearly stated business purposes and with consent; to give clear notice and a real choice; to use it only within those stated purposes, re-obtaining consent before exceeding them; to restrict disclosure to third parties without consent; to protect it with organizational, human, physical, and technical safeguards; to keep it accurate and no longer than needed; to supervise anyone we entrust it to; and to honour a person's rights of access, correction, and withdrawal as the law requires.**

These commitments are the **seven Personal Data Protection Principles** of Malaysia's [PDPA](https://www.pdp.gov.my/) — **General, Notice and Choice, Disclosure, Security, Retention, Data Integrity, and Access** — as amended by the Personal Data Protection (Amendment) Act 2024. The same duties are named in Japan's [個人情報保護法 (APPI)](https://www.ppc.go.jp/en/legal/), the EU's [GDPR](https://gdpr-info.eu/), the [OECD Privacy Guidelines](https://www.oecd.org/en/publications/2013/07/the-oecd-privacy-framework_g1g33269.html), and the privacy-information-management system codified in [ISO/IEC 27701](https://www.iso.org/standard/71670.html). OSBR adopts them as commitments, not as a compliance chore.

## 2. Responsibility

| Role | Responsibility |
| --- | --- |
| **OSBR (as a company)** | Owns this commitment. Provides the policies, training, and controls that make it real, and answers for it when it fails. Appoints a **Data Protection Officer** where the PDPA requires one. |
| **Data Protection Officer** (where required) | The person accountable for personal-data compliance — that purposes are stated, consent is recorded, retention is bounded, breaches are notified, and access/correction/withdrawal requests are answered in time. Under the amended PDPA a DPO must be appointed above the prescribed thresholds and be ordinarily resident in Malaysia. |
| **Every developer / collaborator** | Handles personal data only within the stated purpose and their granted access; raises the moment a design or request would collect more, use it differently, or send it somewhere new. |
| **Contractors & data processors** | Bound by contract to protect personal data to the same standard, and supervised by OSBR for the life of the engagement (§3-5). |
| **Client** (often the data controller) | Confirms the business facts that set the purpose and lawful basis, and co-owns the duties that are legally theirs as the controller. |

Whether OSBR is the **data controller** (we set the purpose) or a **data processor** (we build and run it for a client who is the controller) depends on the engagement — the amended PDPA now places obligations directly on processors too, and we honour the same principles in either role. Genuinely legal judgement calls (does a given use exceed the stated purpose? is a transfer a "disclosure"?) are escalated per [Legal Compliance](/legal-compliance); this policy makes sure the question gets asked in time.

## 3. Practices

Named, established practice, right-sized for an SME. The principles are universal; the ceremony is not — adopt the discipline of the reference regimes without importing a large enterprise's headcount.

### 3-1. Notice and choice: obtain only what the purpose needs, lawfully and fairly

We do not collect personal data because it might be useful someday. Collection is tied to a **stated purpose** and kept to the **minimum that purpose requires** — the PDPA's **General** and **Notice and Choice** principles, echoed by the APPI's duty to specify the purpose of use (利用目的), [GDPR Art. 5(1)(c)](https://gdpr-info.eu/art-5-gdpr/) data minimisation, and the OECD Collection Limitation principle.

- Every collection of personal data MUST give the person **written notice of the purpose before or at the point of collection**, in a language they can understand — the PDPA Notice and Choice Principle (notice in Malay and English), the APPI purpose-of-use duty, and [GDPR Arts. 13–14](https://gdpr-info.eu/art-13-gdpr/).
- Collection MUST be by **lawful and fair means** — never by deception, concealment, or coercion.
- We collect the **minimum fields** the stated purpose needs, and no more. A field nobody can tie to a stated purpose is a field we do not collect.
- Where consent is the basis, it MUST be a **specific, informed, freely-given** agreement to that stated purpose, and MUST be **recorded** — the wording agreed, and when. **Sensitive personal data** (health, religion, political opinion, and the like) requires **explicit consent** under the PDPA.

### 3-2. Use it only within the stated purpose; re-consent to exceed it

The purpose stated at collection is a **boundary**, not a formality. This is *purpose limitation* — the PDPA General Principle, the APPI's rule that personal data may not be handled beyond the specified purpose without consent, [GDPR Art. 5(1)(b)](https://gdpr-info.eu/art-5-gdpr/), and the OECD Purpose Specification and Use Limitation principles.

- Personal data MUST be used **only within the stated purpose of use**. A new purpose is a new decision, not an extension of an old one.
- To use personal data **beyond the stated purpose**, OSBR MUST either **re-state the purpose and obtain fresh consent** before the new use, or rely on another lawful basis where the law provides one. Silence is not consent, and "they already gave us the data" is not a basis.
- A change of purpose is a **material change**: the new wording is put to the person and the fresh consent recorded (§3-1) before any use under it begins.

### 3-3. Disclosure: do not provide to third parties without consent

Handing personal data to someone outside OSBR is the moment of highest risk and highest duty. The PDPA **Disclosure Principle**, the APPI's third-party-provision rule (第三者提供), and the GDPR's transfer safeguards all start from restriction.

- OSBR MUST **not disclose personal data to a third party without the person's prior consent**, except where the law expressly permits it (e.g. legal obligation, protection of life, or a properly-scoped data-processor arrangement under §3-5).
- A **data processor we entrust data to in order to carry out the stated purpose is not the same as a disclosure** — but it is only exempt when it is properly contracted and supervised (§3-5). The distinction is legal, not convenient; when unsure, treat it as a disclosure and get consent.
- **Cross-border transfers**: the amended PDPA permits transfer to a place with **substantially similar protection or that ensures an equivalent level of protection**, or under consent or another permitted ground. Where the data physically resides and any additional safeguards are decided in [Legal Compliance](/legal-compliance) before the transfer is made.

### 3-4. Security: protect it with organizational, human, physical, and technical safeguards

OSBR commits to the **four categories of safeguard** that satisfy the PDPA **Security Principle**, the APPI's necessary-and-appropriate measures (安全管理措置), the controls of [ISO/IEC 27701](https://www.iso.org/standard/71670.html) / [27001](https://www.iso.org/standard/27001), and the GDPR's [Art. 32 security-of-processing](https://gdpr-info.eu/art-32-gdpr/) duty:

| Safeguard | What OSBR commits to | Where it is specified |
| --- | --- | --- |
| **Organizational** | A named owner per engagement, defined handling rules, access review, and an incident response path. | [Security Policy](/security-policy) |
| **Human** | Security and privacy training before joining a project; a culture where raising a concern is expected, not punished. | [Security Policy](/security-policy) |
| **Physical** | Device encryption, auto-lock, no work in public spaces, no uncontrolled removable media, remote-wipe. | [Security Policy](/security-policy) |
| **Technical** | Least-privilege access, MFA/passkeys, no long-lived credentials, encryption in transit and at rest, logging and monitoring. | [Data Protection](/data-protection) |

**Breach notification.** Under the amended PDPA, OSBR MUST **notify the Personal Data Protection Commissioner of a personal-data breach as soon as practicable**, and **notify affected individuals where the breach is likely to cause significant harm** — the same duty the APPI places toward the PPC and the GDPR toward the supervisory authority. The operational flow is the [Incident Management](/incident-management) standard.

### 3-5. Supervise everyone we entrust personal data to

When OSBR entrusts personal data to a data processor to carry out the stated purpose, the duty of care does not transfer with the data — it stays with us. This is part of the PDPA Security Principle (and the amended Act's direct obligations on processors), the APPI's duty to supervise a trustee (委託先の監督), and the GDPR's [Art. 28 processor](https://gdpr-info.eu/art-28-gdpr/) requirements.

- Entrustment MUST be under a **written contract** binding the processor to protect the data to at least OSBR's standard, to use it only for the entrusted purpose, and to return or delete it at the end.
- OSBR MUST **supervise** the processor for the life of the engagement — selecting them for adequate protection, and not treating the contract as the end of the duty.
- A sub-processor is entrusted onward **only with the same protections carried through**, and within what the person consented to.
- This is the same supply-chain diligence OSBR applies to any vendor, focused specifically on personal data.

### 3-6. Retention, integrity, and access: keep it right, no longer than needed, and honour the person's rights

Three PDPA principles meet here — **Retention**, **Data Integrity**, and **Access** — and this is where all of the above becomes real to the person.

- **Retention.** Personal data is **kept only as long as the stated purpose and any legal retention duty require**, then deleted — the PDPA Retention Principle, [GDPR Art. 5(1)(e)](https://gdpr-info.eu/art-5-gdpr/) storage limitation, and the balance set in [Legal Compliance](/legal-compliance).
- **Data integrity.** We take reasonable steps to keep personal data **accurate, complete, not misleading, and up to date** for its purpose (PDPA Data Integrity Principle).
- **Access & correction.** OSBR MUST provide a **reachable way to make a request** and respond within the period the applicable law sets — verifying the requester's identity first, so a request cannot become a leak. On a valid request we **disclose** what we hold, **correct or complete** it where wrong, and **stop use, delete, or withdraw** where the law requires (PDPA Access Principle and the rights to withdraw consent and to **data portability** added by the 2024 amendment; the APPI's 開示・訂正・利用停止; the GDPR's [Arts. 15–18 and 20](https://gdpr-info.eu/chapter-3/)).
- A request the law does *not* oblige us to grant (e.g. it would breach another's rights, or a retention duty overrides it) is answered with a **reasoned explanation**, not silence.

## 4. Rules Summary (MUST / SHOULD)

- Every collection of personal data **MUST** give notice of the purpose at or before collection, be limited to the minimum that purpose needs, and be obtained by lawful and fair means (§3-1).
- Where consent is the basis it **MUST** be specific, informed, freely given, and recorded; **sensitive personal data MUST** have explicit consent (§3-1).
- Personal data **MUST** be used only within the stated purpose; exceeding it **MUST** be preceded by a re-stated purpose and fresh consent, or another lawful basis (§3-2).
- OSBR **MUST NOT** disclose personal data to a third party without prior consent, except where the law expressly permits or under a properly-supervised data-processor arrangement (§3-3).
- Cross-border transfers **MUST** meet the PDPA's adequacy/consent grounds, decided per [Legal Compliance](/legal-compliance) (§3-3).
- OSBR **MUST** protect personal data with organizational, human, physical, and technical safeguards kept adequate to what it holds (§3-4).
- OSBR **MUST** notify the Commissioner of a personal-data breach as soon as practicable, and affected individuals where significant harm is likely (§3-4).
- Every data processor entrusted with personal data **MUST** be bound by written contract and supervised for the life of the engagement (§3-5).
- Personal data **MUST** be kept accurate and retained only as long as the purpose and legal duty require, then deleted (§3-6).
- OSBR **MUST** honour access, correction, withdrawal, and data-portability requests as the law requires, after verifying the requester's identity (§3-6).
- OSBR **MUST** appoint a Data Protection Officer where the PDPA thresholds require one (§2).
- OSBR **SHOULD** review this commitment, and the controls that satisfy it, at least annually and whenever the personal data it handles materially changes.

## 5. Related Guidelines

- [Data Protection](/data-protection) — the engineering standard specifying the technical controls that satisfy the safeguard commitment (§3-4).
- [Security Policy](/security-policy) — the organizational, human, and physical controls, and the incident path, behind the safeguard commitment (§3-4).
- [Incident Management](/incident-management) — the breach-notification flow (§3-4).
- [Legal Compliance](/legal-compliance) — which privacy laws apply, retention limits, cross-border transfer, and the escalation of legal judgement calls (§2, §3-3, §3-6).
- [SHEQ Policy](/sheq-policy) — the sibling company-level commitment on safety, health, environment, and quality.

## 6. References

The authoritative privacy regimes this commitment is grounded in.

**Malaysia**

- Personal Data Protection Act 2010 (Act 709) and the seven Personal Data Protection Principles — Personal Data Protection Department (JPDP) — <https://www.pdp.gov.my/>
- Personal Data Protection (Amendment) Act 2024 (Act A1727) — data-controller terminology, mandatory breach notification, Data Protection Officer, data portability, cross-border transfer — <https://www.pdp.gov.my/ppdpv1/en/akta/personal-data-protection-amendment-act-2024/>

**Japan**

- 個人情報保護法 (Act on the Protection of Personal Information, APPI) — Personal Information Protection Commission (PPC) — <https://www.ppc.go.jp/en/legal/>

**EU / international baseline**

- GDPR (Regulation (EU) 2016/679) — full text — <https://gdpr-info.eu/>
- GDPR Art. 5 — principles (lawfulness, fairness, purpose limitation, data minimisation, storage limitation) — <https://gdpr-info.eu/art-5-gdpr/>
- GDPR Arts. 13–14 — information to be provided (purpose/notice) — <https://gdpr-info.eu/art-13-gdpr/>
- GDPR Arts. 15–18, 20 — rights of access, rectification, erasure, restriction, and portability — <https://gdpr-info.eu/chapter-3/>
- GDPR Art. 28 — processor obligations (entrustment/supervision) — <https://gdpr-info.eu/art-28-gdpr/>
- GDPR Art. 32 — security of processing — <https://gdpr-info.eu/art-32-gdpr/>
- OECD Privacy Framework — <https://www.oecd.org/en/publications/2013/07/the-oecd-privacy-framework_g1g33269.html>
- ISO/IEC 27701 — Privacy Information Management System (PIMS) — <https://www.iso.org/standard/71670.html>
- ISO/IEC 27001 — Information security management systems — <https://www.iso.org/standard/27001>
