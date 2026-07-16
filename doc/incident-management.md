# Incident Management

This is the standard the [Quality Gate](/quality-gate)'s **Reliability** lens
holds work to for the moment something goes wrong in production. It covers the
whole arc of an incident: how anyone raises one, how we respond and meet our
legal duties, and how AI helps us investigate without widening the blast radius.
It builds on the [Infrastructure Planning Policy](/infra-planning-policy) (which
gives us backups, RPO/RTO targets, and reversible deploys), the [Security
Policy](/security-policy) (what we protect and the risks we assume), and the
pull-request discipline of the [Development Guide](/development-guide). Deviations
are allowed, but — as everywhere in the handbook — they must be deliberate and
justified in the project's design notes.

An incident is where OSBR's values are tested hardest. **Be Nice**: we keep
stakeholders informed, on time, in plain language, and we never hand a tired
on-call human a change they did not ask for. **Be Kind**: the person who reports
an incident — or caused one — is doing us a favour by surfacing it, so the report
is thanked and the post-mortem is blameless; we fix systems, not people. **Be
Strong**: we face the incident directly, contain it, tell the client the truth
even when it hurts, and know when to call for help. Humans and AI agents work an
incident here as collaborators — and that partnership carries a specific hazard,
live production, that this policy names head-on (§3).

## How to read this policy

* **Requirement levels** follow RFC 2119, as in the [Coding Style
  Guide](/style-guide). **MUST** / **MUST NOT** are absolute. **SHOULD** /
  **SHOULD NOT** state a strong default overridable only with a documented
  reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice — NIST SP 800-61,
  SANS PICERL, the incident-command patterns of Google SRE and PagerDuty — the
  practice is named inline and cited under [References](#references). We adopt the
  *criteria* of these practices and right-size them for an SME; we do not adopt
  the headcount or infrastructure behind their reference setups.
* **This is guidance, not legal advice.** The reporting deadlines and thresholds
  in §2-3 are OSBR's default reading of the law. For any serious personal-data
  incident, confirm the current obligation with the client's legal counsel. When
  in doubt, notify.

[[TOC]]

## 1. Reporting an Incident

The goal of reporting is to make it **fast, safe, and normal** for *any*
developer or collaborator to raise a suspected incident, so the Security Officer
can act while the situation is still small. The behaviour we want is simple:
**report early, report often.** A rumour of a problem, reported in two minutes,
beats a confirmed breach found three days later. This section exists to remove
every reason someone might hesitate — uncertainty, embarrassment, fear of blame,
or worry about "wasting" the officer's time.

### 1-1. The reporter does not decide whether it is an incident

This is the single most important rule of reporting:

- The reporter **MUST NOT** self-triage before reporting. Deciding *whether*
  something is "really" an incident is the **Security Officer's** call, not the
  reporter's. The reporter's only job is to surface what they noticed.
- Asking individuals to judge severity before speaking up is how real incidents
  get silently sat on. When in doubt, report — the cost of a false alarm is
  minutes; the cost of a missed incident is measured in trust and data.

### 1-2. Where to report — speed beats formality

- Reporters **MUST** raise suspected incidents in the dedicated
  **`#incident-response`** channel, addressed to the Security Officer.
- Reporters **MUST NOT** wait to gather a "complete" picture, open a formal
  ticket first, or route the report through a team lead before speaking up.
- If the dedicated channel is unavailable, reporters **SHOULD** contact the
  Security Officer directly (or `info@osbrjp.com` if the officer is unreachable)
  and note it in the channel once reachable.
- Reporters **MUST NOT** attempt to quietly fix a suspected incident alone. A
  delayed report turns a small incident into a large one.

### 1-3. What to report — the three points

Every report **MUST** include these three points. Keep it short; a few sentences
each is enough. You are **not** expected to know the full answer to any of them —
"I don't know yet" is a valid and useful answer.

1. **Summary** — What did you see? A plain description of the symptom (e.g. "prod
   API is returning other users' data on `/orders`", "I think I pushed an AWS key
   to a public repo").
2. **Status & certainty** — Is it ongoing or over? How sure are you? Say so
   honestly — "still happening", "not sure if it's real", "90% sure". **Low
   certainty is not a reason to stay silent.**
3. **Scope of impact** — Who or what looks affected, as far as you can tell? Which
   system, which data, which customers — even a rough guess ("looks like staging
   only, but I can't confirm prod is safe").

### 1-4. Report regardless of scale or certainty

- Reporters **MUST** report even when unsure whether the event qualifies as an
  incident, and regardless of how small it looks.
- Reporters **SHOULD** report *near-misses* too — the thing that almost went
  wrong. Near-misses are free lessons.
- A report made in good faith that turns out to be nothing is a **success**, not
  a mistake. We would rather investigate ten false alarms than miss one real
  event.

### 1-5. No blame for reporting in good faith

OSBR operates a **blameless / just culture** (Dekker), grounded in **psychological
safety** (Edmondson): people only surface problems early when they are confident
that doing so will not be held against them. Punishing reporters destroys exactly
the early-warning signal we depend on. This is **Be Kind** made concrete.

- There is **no personal penalty** for reporting a suspected incident in good
  faith — **including one you caused yourself**.
- The Security Officer and team leads **MUST** respond to reports with thanks and
  focus on the system and the fix, never on punishing the reporter.
- Every response review and post-incident write-up **MUST** stay blameless (§2-5):
  they ask *what in the system let this happen* and *how do we make it harder next
  time*, never *who to blame*.

## 2. Responding to an Incident

We do not invent our own incident model. We follow the practices the field has
already settled on — **NIST SP 800-61**, **SANS PICERL** (Prepare, Identify,
Contain, Eradicate, Recover, Lessons-learned), and the incident-command patterns
published by **Google SRE** and **PagerDuty** — right-sized for a small team. The
goal is to detect an incident quickly, **contain the damage**, meet every
mandatory reporting obligation on time, restore verified service, and make sure
the same thing cannot happen the same way twice.

### 2-1. One owner — the Security Officer as Incident Commander

Every incident has exactly **one owner**: the on-duty **Security Officer**, who
acts as **Incident Commander (IC)** in the sense used by Google SRE and PagerDuty.
The IC is the single decision-maker; they need not do every task, but own that
every task happens.

The Security Officer **MUST**:

- Declare the incident and take command; hand over explicitly if they step away —
  no incident is ever ownerless.
- Acknowledge every report promptly so the reporter knows it landed, and make the
  **incident-vs-not determination**.
- Determine the incident **type** and **severity** (§2-2).
- Assess **mandatory-reporting obligations** and start those clocks (§2-3).
- Select and drive the applicable **response flows** (§2-4).
- Own the closing artifacts: **blameless post-mortem**, **recurrence-prevention
  plan with a verification date**, and **stakeholder report** (§2-5).

The reporter **SHOULD** stay reachable to answer follow-up questions but is
**not** responsible for running the response unless asked.

**Roles scale down, they do not disappear.** On a large incident the IC delegates
two roles from the same playbooks: an **Operations/Tech lead** who actually
changes the system, and a **Communications lead** who handles client and internal
updates. On a small incident one person may wear all three hats — but the *roles*
still exist, so nothing is dropped.

### 2-2. Determine type and severity

Before acting, the Security Officer classifies the incident. Classification
decides severity, which decides how fast we move and who we wake up.

**Type** — classify against the risk categories in the [Security Policy, Appendix
2](/security-policy) (accidents / human error, external attacks, insider threats),
and note whether **personal data** is in scope, because that triggers the legal
duties in §2-3. Typical types: personal-data breach; unauthorised access /
account compromise; malware / ransomware; availability incident (ties into the
SLO / RTO / RPO targets in the [Infrastructure Planning
Policy](/infra-planning-policy)); accidental disclosure or data loss.

**Severity** — the Security Officer **MUST** assign a severity at declaration and
**MUST** revise it as facts change. Severity is about **impact and reach**, not
blame, and is set by the officer, never by the reporter.

| Sev | Meaning | Response |
| --- | --- | --- |
| **SEV1** | Confirmed personal-data breach, active attacker, or major outage. Reporting clocks likely running. | IC engages immediately; client notified; consider external assistance (§2-4). |
| **SEV2** | Contained or limited-blast-radius incident; potential (unconfirmed) data exposure. | IC owns; assess reporting duties (§2-3) without delay. |
| **SEV3** | Minor / suspected incident, no evidence of data exposure. | Handle in-hours; record and monitor. |
| **SEV4 / near-miss** | Caught before impact. | Record as a free lesson (§1-4); no urgent response. |

When unsure between two severities, the officer **MUST** pick the higher one and
de-escalate later. Under APPI and GDPR the reporting clock can start on a
*suspected* breach, not only a confirmed one (§2-3). Downgrading is cheap; a
missed legal deadline is not. **Do not under-classify to avoid paperwork.**

### 2-3. Mandatory-reporting obligations

As part of analysis, the Security Officer **MUST** determine whether a legal
notification duty applies **and start the clock the moment a breach is reasonably
suspected** — not when it is fully understood. If a duty applies, the **Disclose**
flow (§2-4) becomes mandatory, not optional.

**Japan — APPI (revised Act on the Protection of Personal Information).** A
business handling personal information must report a reportable breach to the
**Personal Information Protection Commission (PPC, 個人情報保護委員会)** and notify
affected individuals. A breach is **reportable** when it involves any of:
**sensitive personal information** (要配慮個人情報); a risk of **property damage** (e.g.
leaked payment data); a breach committed for an **improper purpose** (cyberattack
/ unauthorised access); or **more than 1,000 data subjects.** Reporting is
two-stage — a **preliminary report (速報)** promptly, within about **3–5 days** of
becoming aware, and a **final report (確報)** within **30 days** of awareness
(extended to **60 days** where the breach was for an improper purpose). If some
required items are not yet known by the deadline, file with what is known and
complete it as the facts are established.

**EU / EEA — GDPR (where applicable).** GDPR applies where a project processes the
personal data of individuals in the EU/EEA (confirm scope with the client; mind
data residency per the [Infrastructure Planning
Policy](/infra-planning-policy)). **Article 33** — notify the competent
supervisory authority **without undue delay and, where feasible, within 72
hours** of becoming aware, unless the breach is unlikely to result in a risk to
individuals; a missed 72-hour mark must be explained. **Article 34** — where the
breach is likely to result in a **high risk** to individuals' rights and freedoms,
communicate it to the **affected data subjects without undue delay**.

**Both may apply.** A single incident can trigger APPI *and* GDPR at once. Track
each clock separately — they have different recipients and different deadlines —
inside the incident record (§2-4).

### 2-4. The five response flows

Once type, severity, and reporting duties are set, the Security Officer executes
among these five flows. They are not strictly sequential: **Record** runs
throughout, **Disclose** runs on the legal clock, and **Request external
assistance** can start at any point. The lifecycle maps OSBR's flows onto SANS
PICERL and the NIST SP 800-61 phases; a real incident loops back as new facts
arrive.

| OSBR flow | PICERL phase | NIST SP 800-61 phase |
| --- | --- | --- |
| — (before the incident) | Prepare | Preparation |
| **Record** | Identify | Detection & Analysis |
| **Prevent (contain)** | Contain | Containment |
| **Remediate** | Eradicate + Recover | Eradication & Recovery |
| **Disclose** | (across all phases) | Post-Incident notification duties |
| **Request external assistance** | (any phase, as needed) | — |
| Close-out (§2-5) | Lessons-learned | Post-Incident Activity |

**Record** · *Identify.* Open the incident record the moment the incident is
declared and keep it current — it is the backbone of every later flow and of any
regulator submission. The Security Officer **MUST** capture: a **single,
timestamped, append-only timeline** of what was observed, decided, and done, by
whom; **type, severity, and scope** (which systems, whose data, how many records);
any **reporting clocks** started (§2-3), with their deadlines; and **evidence
preserved before it is destroyed** — logs, metrics, and communication history are
protected assets ([Security Policy, Appendix 1](/security-policy)). Preserve
first; **do not tamper** while containing. The record **SHOULD** live in the
project's agreed incident location, access-limited to those who need it, with
personal data masked per the Security Policy.

**Prevent (Contain)** · *Contain.* Stop the bleeding before cleaning up —
**containment comes before eradication.** The Security Officer **MUST** contain
proportionally to severity: revoke or rotate compromised credentials and keys
(**immediately revoke any committed credential**, per the [Security
Policy](/security-policy)); isolate affected hosts, disable compromised accounts,
or block malicious traffic at the WAF / edge; and where appropriate throttle or
take a service offline rather than let a breach continue — a short outage can beat
an ongoing data leak. Containment actions **MUST** be written to the record as
they happen.

**Remediate** · *Eradicate + Recover.* Once contained, remove the root cause and
restore verified service. The Security Officer **MUST**: **eradicate** — remove
the attacker's foothold, malware, or the defect and close the vulnerability that
allowed the incident, fixing the **root cause**, not the symptom; **recover** —
restore service from a known-good state and, where data was lost, restore from
**tested** backups against the datastore's **RPO / RTO** (per the [Infrastructure
Planning Policy](/infra-planning-policy)); and **verify** — confirm the system is
clean and healthy through monitoring before declaring recovery, watching for
recurrence. Root-cause fixes that cannot ship during the incident become items in
the recurrence-prevention plan (§2-5), each with an owner and a verification date.

**Disclose** · *cross-phase, on the legal clock.* Tell the people who need to know
— **honestly, promptly, in plain language.** This flow is **mandatory** whenever
§2-3 applies, and good practice even when it does not. The Security Officer (or
Communications lead) **MUST**: file the **regulator** notifications on their
deadlines (APPI 速報 / 確報 to the PPC; GDPR Art. 33 to the supervisory authority);
notify **affected individuals** where required (APPI; GDPR Art. 34 high-risk);
keep the **client** informed from the start — never let a client learn of their
own incident from a regulator or the news; and give internal stakeholders honest,
timely status updates (**Be Nice**). Disclosure **SHOULD** state what happened,
what data was involved, what we have done, and what affected parties should do —
no spin, no minimising. Every external communication is logged in the record.

**Request external assistance** · *any phase.* Knowing when to call for help is
**Be Strong**, not weakness. The Security Officer **SHOULD** bring in outside help
when the incident exceeds the team's capacity or authority: **legal counsel** for
reporting obligations and liability (the default for any SEV1/SEV2 personal-data
breach); the **cloud provider's** security team, or a specialist **DFIR**
(digital-forensics & incident-response) firm for serious intrusions; **law
enforcement**, where the client and counsel agree it is warranted; and the
relevant **CSIRT / JPCERT-CC**-style coordination body where appropriate. External
parties are given least-privilege access and recorded in the incident record.
Involving them never removes the Security Officer's ownership of the incident.

### 2-5. Close-out — every incident ends the same way

An incident is not closed when service is restored — it is closed when we have
**learned from it** (the PICERL Lessons-learned phase; NIST Post-Incident
Activity). The Security Officer **MUST** produce all three artifacts below.

- **Blameless post-mortem** — written in the sense established by Etsy and the
  Google SRE practice: the analysis assumes everyone acted reasonably with the
  information they had, and asks *how the system let this happen*, never *who to
  blame*. This is **Be Kind** made concrete — the reason people report honestly
  instead of hiding. It **MUST** cover timeline, impact, root cause(s), what went
  well, what went badly, and where we got lucky, and **MUST NOT** name individuals
  as causes.
- **Recurrence-prevention plan (with a verification date)** — the concrete actions
  that stop this class of incident from recurring. Each action **MUST** have an
  **owner** and a **verification date** — a scheduled point at which someone
  confirms the fix is in place and effective. A prevention plan with no
  verification date is a wish, not a plan.
- **Stakeholder report** — a written report to affected stakeholders (client
  first, plus internal leadership and, where relevant, regulators and affected
  individuals): what happened, the impact, what we did, and what we are changing
  so it does not recur. Plain language, no blame, on time.

## 3. AI-Assisted Production Investigation

The same structured logs, metrics, and traces that let an on-call engineer find a
fault are what let an AI agent investigate one. This section is the
access-control and data-handling contract that makes it safe to actually do that
in **production**. The promise is asymmetric on purpose: we want AI to make
investigation *faster* — trace an error to its span, correlate a spike to a
deploy, read the error budget, draft the root-cause narrative — without making the
*blast radius* any larger than a human investigator's already is. So AI gets
exactly the observer's reach and no more.

Two boundaries are **inviolable**: every path AI uses to reach production is
**read-only**, and **PII is masked before it enters AI context**. They are not
tunable per project, per incident, or per urgency. A faster investigation is never
a reason to widen either one; if a boundary is in the way, the answer is a better
read-only view or a better mask, never an exception. **Be Nice** — AI does the
tedious correlation across a hundred thousand log lines so a tired on-call human
does not. **Be Kind** — the people *in* the telemetry are protected, because their
personal data never reaches the model at all. **Be Strong** — an investigator,
human or AI, that can see the whole system reaches root cause faster.

We lean on published standards rather than inventing our own: the **principle of
least privilege** and **read-only / just-in-time access** (AWS IAM best practices;
NIST SP 800-207 Zero Trust), **PII de-identification / masking** (NIST SP
800-122), **data minimisation** (GDPR Art. 5(1)(c)), **human oversight of AI**
(NIST AI RMF), and the LLM-specific failure mode of **sensitive-information
disclosure** (OWASP Top 10 for LLM Applications).

### 3-1. Same outputs a human reaches — no private backchannel

AI investigates through the **same observation outputs** a human on-call engineer
uses — the central log store, the metrics and trace backend — defined by OSBR's
observability discipline.

- **MUST** give AI access to the *same* telemetry surface humans use, not a
  bespoke firehose, raw database, or node-level access a human investigator would
  never touch. Parity of *observation*, not a wider door.
- **MUST NOT** grant AI a path to production data that bypasses the observability
  pipeline's masking and access controls — reading raw production tables, tailing
  an unmasked log file on a host, or snapshotting memory. If a human investigator
  should not reach it, neither does AI.
- **SHOULD** expose telemetry through query tools/APIs (e.g. an MCP server, a
  read-only observability API) scoped to exactly the observation outputs, so the
  reach is defined by the tool surface, not by a broad cloud credential.

### 3-2. Read-only is the first inviolable boundary

Every path AI uses to reach production observation data is **read-only**, enforced
by the *permissions of the identity*, so that even a confused, prompt-injected, or
buggy agent **cannot** mutate production through its investigation path.

- **MUST** run all AI production investigation under a **dedicated, read-only,
  least-privilege identity** whose permissions include **no** write, delete,
  update, restart, scale, deploy, rollback, or configuration-change action on any
  production resource. Least privilege is the floor; read-only is the ceiling.
- **MUST** enforce read-only at the **permission layer** (IAM policy / role /
  scoped API token), not merely by instructing the model or filtering prompts. A
  boundary a prompt can talk its way past is not a boundary.
- **MUST** keep the investigation identity **separate** from any identity that can
  mutate production (§3-4). One credential never holds both "read the logs" and
  "restart the service."
- **MUST NOT** grant the investigation identity standing high-privilege access "to
  save a round trip."
- **SHOULD** scope the identity by time and blast radius where the platform allows
  — short-lived / just-in-time credentials, read replicas over primaries,
  environment- and service-scoped tokens.

### 3-3. PII masked before context is the second inviolable boundary

Personal data is **masked or removed before it enters AI context** — before the
bytes reach the model, not after. This inherits from OSBR's rule that PII must be
masked or omitted **at the source** before it is written to any log, span
attribute, or metric label, and from the [Security Policy](/security-policy)'s
treatment of telemetry as a **Protected Asset**. AI adds a second reason the
masking must already be done: data placed in a model's context is data
minimisation you can no longer take back.

- **MUST** ensure PII is masked, redacted, tokenised, or pseudonymised **at the
  source** so the observation outputs AI reads **do not contain** raw names,
  emails, tokens, full card/account numbers, precise location, or request/response
  bodies carrying personal data. The mask is upstream of AI, not a filter bolted
  on at query time that a new field can slip past (NIST SP 800-122).
- **MUST NOT** place unmasked personal data into an AI prompt, tool result, or
  retained context — including when a human pastes a raw log excerpt into an agent.
  The masking obligation follows the data, not the pipeline.
- **MUST** apply **data minimisation** to what enters context — only the
  observation data the investigation needs, only for as long as it needs it (GDPR
  Art. 5(1)(c)).
- **SHOULD** use **stable pseudonymous identifiers** (a hashed user id) over raw
  ones, so AI can correlate "the same user's requests" without ever holding who
  that user is.
- **SHOULD** treat any secret, credential, or token found in telemetry as a leaked
  credential — revoke it and fix the mask that let it through — rather than
  reasoning about it in context.

### 3-4. Mutating actions live on a separate, human-approved path

An investigation may conclude that production must change — restart an instance,
roll back a deploy, scale a pool, flip a flag, correct a record. That action does
**not** happen on the investigation path; it happens on a **separate path gated by
explicit human approval**, the way high-privilege and break-glass access is gated
elsewhere in modern practice (Google Cloud Privileged Access Manager; AWS IAM).

- **MUST** route every mutating production action through a **distinct,
  human-approved path** — a separate identity/role, a change gate, a break-glass
  procedure — never through the AI investigation identity (§3-2).
- **MUST** require a **human approval step** before any change is applied. AI may
  *prepare* the action (draft the rollback command, the scaling change, the
  runbook step); a human **approves and applies** it. AI approving its own
  proposed change is prohibited.
- **MUST** make break-glass / emergency-change use **auditable and alerting** —
  who invoked it, when, why, on what. Emergency speed does not buy silence.
- **SHOULD** prefer pre-decided, automated self-healing for the conditions a
  machine already handles — a retriable timeout, an unhealthy instance de-routed,
  a pre-agreed rollback trigger. Those need no live human approval *because they
  were approved when written down*. The approval gate here is for the **novel**
  change an investigation invents on the spot.

### 3-5. Human-in-the-loop — AI diagnoses, a human decides

The output of AI-assisted investigation is a **proposal**, not an executed
decision. Keeping a human in the loop for the *action* is what lets us take the
*speed* of AI investigation without inheriting the risk of an autonomous agent
changing production (NIST AI RMF).

- **MUST** treat AI conclusions as **advisory**. A root-cause narrative, a
  suspected bad deploy, a recommended rollback — a human reviews it and owns the
  decision to act, exactly as they would a colleague's suggestion.
- **MUST** keep the human **able to understand and override** the proposal: AI
  cites the specific traces/logs/metrics it reasoned from (the correlation a shared
  `trace_id` makes possible), so the human can check the evidence, not just the
  conclusion.
- **SHOULD** let AI do the **toil** end-to-end within the read-only boundary — fan
  out across logs, correlate spans, compute the error-budget burn, draft the
  incident timeline and the post-mortem — so the human spends their judgement on
  the decision, not the data-gathering.
- **SHOULD** capture the human's decision (approved / rejected / modified) so the
  investigation record shows both the AI proposal and the human call.

### 3-6. Attribution and audit

Both boundaries are only real if their use is visible.

- **MUST** make every AI query against production observation data **attributable
  to the AI investigation identity** and logged, so "what did the agent read" is
  answerable after the fact — telemetry access is itself a Protected-Asset access
  ([Security Policy](/security-policy)).
- **MUST** log every human-approved mutating action (§3-4) with who approved it,
  what AI proposed, and why — the change record ties the AI proposal to the human
  decision to the applied action.
- **SHOULD** alert on anomalies in the investigation path itself — an investigation
  identity attempting a write it should not have, an unusual volume of telemetry
  pulled into context — as a high-signal event.

**Anti-patterns this section exists to prevent:** handing the investigation agent
a broad admin/deploy credential "so it can fix things too"; enforcing read-only
only in the prompt while the underlying token can write; masking PII *after* it
reaches the model, or "planning to add masking later"; pasting a raw, unmasked
production log dump into an agent because it is faster; letting AI restart, roll
back, or scale production on its own conclusion with no human approving; a
break-glass change applied with no record of who, what, or why; and AI reaching
production data through a backchannel (raw DB, host shell) that bypasses the
observability pipeline's masking.

## References

**Incident-handling frameworks**

- NIST SP 800-61 — Computer Security Incident Handling Guide — <https://csrc.nist.gov/pubs/sp/800/61/r2/final>
- SANS — Incident Handler's Handbook (the PICERL model: Preparation, Identification, Containment, Eradication, Recovery, Lessons-learned) — <https://www.sans.org/white-papers/33901/>

**Incident command & operations**

- Google SRE — Managing Incidents (Incident Command System) — <https://sre.google/sre-book/managing-incidents/>
- PagerDuty Incident Response documentation — <https://response.pagerduty.com/>

**Blameless culture & post-mortems**

- Sidney Dekker, *Just Culture: Balancing Safety and Accountability* — separating honest error from the system that allowed it — <https://www.taylorfrancis.com/books/mono/10.1201/9781315251271/just-culture-sidney-dekker>
- Amy Edmondson, *The Fearless Organization* — psychological safety as the precondition for speaking up — <https://fearlessorganization.com/>
- Etsy — Blameless PostMortems and a Just Culture (John Allspaw) — <https://www.etsy.com/codeascraft/blameless-postmortems/>
- Google SRE — Postmortem Culture: Learning from Failure — <https://sre.google/sre-book/postmortem-culture/>

**Legal / mandatory reporting**

- GDPR Article 33 — Notification of a personal data breach to the supervisory authority (within 72 hours) — <https://gdpr-info.eu/art-33-gdpr/>
- GDPR Article 34 — Communication of a personal data breach to the data subject — <https://gdpr-info.eu/art-34-gdpr/>
- GDPR Article 5(1)(c) — Data minimisation — <https://gdpr-info.eu/art-5-gdpr/>
- Japan — Personal Information Protection Commission (PPC), breach-reporting duty under the revised APPI — <https://www.ppc.go.jp/en/>

**Least-privilege, read-only & human-approved access**

- AWS IAM — Security best practices (least privilege, read-only, just-in-time, short-lived credentials) — <https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html>
- NIST SP 800-207 — Zero Trust Architecture — <https://csrc.nist.gov/pubs/sp/800/207/final>
- Google Cloud — Privileged Access Manager (just-in-time elevation, emergency/break-glass access) — <https://docs.cloud.google.com/iam/docs/pam-overview>

**PII masking & AI oversight**

- NIST SP 800-122 — Guide to Protecting the Confidentiality of PII (de-identification/masking) — <https://csrc.nist.gov/pubs/sp/800/122/final>
- NIST AI Risk Management Framework (human oversight; govern/map/measure/manage) — <https://www.nist.gov/itl/ai-risk-management-framework>
- OWASP Top 10 for LLM Applications (Sensitive Information Disclosure; Excessive Agency) — <https://owasp.org/www-project-top-10-for-large-language-model-applications/>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the Reliability lens this standard serves.
- [Security Policy](/security-policy) — protected assets, credential hygiene, and the risk categories incidents fall into.
- [Infrastructure Planning Policy](/infra-planning-policy) — backups/DR, RPO/RTO, observability, and reversible deploys that make detection and recovery possible.
- [Development Guide](/development-guide) — the pull-request discipline that carries root-cause fixes and prevention items.
- [Code of Conduct](/code-of-conduct) — the behavioural baseline that makes blameless reporting safe.
