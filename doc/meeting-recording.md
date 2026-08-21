# Meeting Recording

This standard governs how OSBR records and transcribes meetings: **only with
prior consent from everyone present**, and only for the purpose everyone agreed
to. A decision made in a meeting and remembered only in people's heads gets
misremembered, disputed, or silently reversed; "I think we agreed to…" is not
good enough six months on. Done right, the recording becomes a searchable
**decision record** — usually produced with the help of AI transcription (see
the [AI Usage Guideline](/ai-usage-guideline)) — that the client and the team
both trust. It is bound by the consent and retention discipline of the [Data
Protection Policy](/data-protection), and the records it produces link back into
the [Development Guide](/development-guide)'s tickets and pull requests.
Requirement levels follow RFC 2119: **MUST** / **MUST NOT** are absolute,
**SHOULD** states a strong default overridable only with a documented reason,
**MAY** marks a free choice.

Recording is where our values meet a hard boundary. **Be Nice**: nobody has to
reconstruct a meeting from memory, and the client can always retrieve the exact
record of what was decided and why. **Be Kind**: we never record someone who did
not agree to it — consent comes first, every time, with no exception dressed up
as convenience. **Be Strong**: we build the shared record deliberately, before a
dispute needs it, so that under scrutiny the truth is already written down and
attributable.

[[TOC]]

## 1. Goal

The goal is to **preserve the decision-making process, not just the
conclusion**, as a single shared source of truth. The transcript is the record
of *what was said*; the decisions and action items extracted from it are the
record of *what was agreed*. When the transcript, a ticket, and someone's memory
disagree, the decision record is the one that governs.

This exists to serve, not to surveil. A recording captures a conversation people
chose to have on the record, and the data is used **only within the scope the
client agreed to**.

## 2. Responsibility

- The **meeting owner (OSBR side)** MUST obtain and confirm prior consent from
  every participant before recording starts, state the purpose and scope, and
  stop recording if anyone declines.
- **Project / Engineering** runs the transcription pipeline, stores transcripts
  and summaries in the access-controlled knowledge base, and enforces retention
  and deletion — including confirming the tooling's own data handling matches the
  agreed scope.
- **Data protection** honours access, correction, and deletion requests over
  recordings and transcripts, retains only for the agreed period, and confirms
  the consent model and any vendor's data-processing terms are acceptable for the
  applicable jurisdiction (per the [Data Protection Policy](/data-protection)).
- **Every participant** — client or OSBR — MAY decline to be recorded or ask that
  a portion be off the record. That request is honoured without penalty.

## 3. Practices

### 3-1. Prior consent is a precondition, not a formality

Recording MUST NOT begin until **every participant has given prior, informed
consent**. This is both a legal requirement and a trust requirement.

- The meeting owner MUST announce, **before recording starts**, that the meeting
  will be recorded and transcribed, **why** (to preserve decisions as a shared
  record), and **who** will have access. Recording begins only after agreement.
- Consent MUST be **prior** and **affirmative** — an announced "I'm starting the
  recording now, any objections?" with a real pause, not a recording that
  silently began before anyone was asked. Silence after a genuine, clearly-heard
  request MAY count as consent only where everyone could realistically object;
  when in doubt, ask each person explicitly.
- The consent itself SHOULD be captured as a record — the opening seconds of the
  recording where consent is given, or a written agreement.
- Any participant MUST be able to **decline** or ask that a segment be **off the
  record**, and that MUST be honoured immediately, with no penalty.

**Why "prior" and "all-party" matter legally.** Many jurisdictions require
all-party (two-party) consent to record a conversation, and the strictest
applicable law governs a multi-jurisdiction call. As a Malaysian company,
OSBR starts with Malaysia's **Personal Data Protection Act 2010 (PDPA)**: a
recording of an identifiable person is personal data, so the PDPA's **Notice and
Choice** principle applies — give notice and obtain consent **before** recording,
and use it only for the stated purpose. Japan's **APPI** likewise treats a
recording of an identifiable person as personal information whose acquisition and
use must stay within a stated purpose (利用目的); the EU **GDPR** requires consent
that is specific, informed, and unambiguous. The safe, universal rule that
satisfies all of these: **get everyone's consent, in advance, on the record.**

### 3-2. Use only within the client-agreed scope

The recording and everything derived from it MUST be used **only for the purpose
the client agreed to** — preserving the decision record for that engagement.

- The transcript, summary, and audio MUST NOT be repurposed — not for training
  models outside the agreed scope, not for marketing, not for sharing with other
  clients or teams — without fresh, specific consent. This is **purpose
  limitation** under Malaysia's PDPA, Japan's APPI, and the GDPR.
- Access MUST be limited to the people who need it for the engagement, under the
  access controls of the [Data Protection Policy](/data-protection).
- Where the transcription tool is a third party, its **data-processing terms**
  MUST be verified before client data flows through it — where the audio and text
  are stored, whether the vendor trains its models on content, and how deletion is
  honoured (see the [AI Usage Guideline](/ai-usage-guideline)). A tool that trains
  on client audio by default is not acceptable for scoped client data without
  explicit client agreement.
- Retention MUST be bounded: transcripts and recordings are kept only for the
  agreed period and then deleted. Deletion MUST propagate to the vendor, not just
  OSBR's copy.

### 3-3. Capture decisions as data, not just prose

A wall of transcript text is searchable but not yet *useful*. Each meeting record
SHOULD distil the raw transcript into **structured decisions and action items** —
a decision as a first-class record with attributes, not a paragraph someone has
to re-read.

- Each summary SHOULD extract, at minimum: the **decisions made**, the **options
  considered and rejected** (the reasoning, not only the outcome), **action items
  with owners**, and **open questions** deferred to later.
- Each decision SHOULD be attributable and dated, so the record answers not just
  *what* was decided but *when*, *by whom*, and *why the alternatives were set
  aside*.
- The structured summary is what makes the record a genuine single source of
  truth: the transcript is the evidence; the decision log is the answer.

### 3-4. Make the record searchable and single-source

The transcripts and summaries MUST be stored in a **searchable knowledge base**
so the record is retrievable, not merely archived.

- The record MUST be **full-text searchable** across meetings, so "what did we
  decide about authentication?" returns the relevant moment across every meeting,
  not a folder of dated audio files nobody opens.
- Each record SHOULD be **cross-linked** to the artefacts it drove — the tickets,
  pull requests, and design docs of the [Development
  Guide](/development-guide) — so a decision and its implementation are traceable
  in both directions.
- There MUST be **one** canonical store for meeting decisions per engagement.
  Scattering the same decision across email, chat, and three people's notes
  recreates exactly the ambiguity this policy exists to remove.

### 3-5. Shared with the client, not held over them

The record is **shared** — it belongs to the relationship, not to OSBR alone.

- The client SHOULD receive the summary (and, on request, the transcript) of
  meetings they took part in. It is a mutual reference, not OSBR's private
  evidence file.
- Corrections MUST be possible: if a participant says the transcript misheard or
  misattributed something, the correction is recorded (appended, not silently
  overwritten), so the record stays honest and the original remains auditable.

## 4. Minimum record — checklist

A meeting recording is legitimate only if **all** of the following hold:

- [ ] **Prior consent** obtained from **every** participant, before recording began
- [ ] Purpose and access **stated** to participants up front
- [ ] Consent itself **captured** (recorded statement or written agreement)
- [ ] Vendor **data-processing terms** verified acceptable for client data (storage, training, deletion)
- [ ] Transcript + **structured summary** (decisions, rejected options, action items, owners) produced
- [ ] Stored in the **access-controlled, searchable** knowledge base as the single source of truth
- [ ] Used **only within the client-agreed scope**; retention bounded and deletion propagated

If prior consent cannot be shown, there is no recording — full stop.

## References

**Consent law**

- **All-party (two-party) consent** — many jurisdictions require every party to a
  conversation to consent before it may be recorded; the strictest applicable law
  governs a multi-jurisdiction call.
- **PDPA (Personal Data Protection Act 2010)** — Malaysia's data-protection law
  (amended 2024; regulator: Personal Data Protection Commissioner,
  <https://www.pdp.gov.my/>). A recording of an identifiable person is personal
  data, so the **Notice and Choice** principle requires notice and consent before
  recording, the **Retention** principle limits keeping it beyond need, and use
  stays bound to the stated purpose — a consent-based regime.
- **APPI (個人情報の保護に関する法律)** — Japan's Act on the Protection of Personal
  Information: a recording of an identifiable person is personal information, and
  its acquisition and use must stay within a stated purpose (利用目的).
- **GDPR — Regulation (EU) 2016/679** — Art. 4(11) & Recital 32 (consent must be
  specific, informed, unambiguous, by clear affirmative act); Art. 5(1)(b)
  (purpose limitation); Art. 6 (lawful basis).

**Practice**

- **Decision log / "decisions as data"** — recording each decision as a discrete,
  queryable record with its context, alternatives, and consequences (a lightweight
  cousin of the Architecture Decision Record).
- **Searchable knowledge base / single source of truth** — one canonical,
  full-text-searchable store governs each engagement's decisions, so scattered
  notes never compete with the record.

**Related OSBR standards**

- [Data Protection Policy](/data-protection) — consent, access control, retention, and deletion.
- [AI Usage Guideline](/ai-usage-guideline) — using AI transcription tooling on client data.
- [Development Guide](/development-guide) — the tickets and pull requests a decision record links to.
