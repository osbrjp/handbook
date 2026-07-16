# Domain Terminology

Every OSBR project maintains a **ubiquitous-language dictionary**: one
authoritative word per domain concept, agreed with the domain experts and
mirrored everywhere the concept appears — code, schema, docs, tests, logs, and
error messages. This page is the per-project *discipline* for building and
holding that dictionary.

It is **distinct from the org-wide [Technical Glossary](/technical-glossary)**.
The Technical Glossary defines cross-project *technical* vocabulary (DI, IaC,
Clean Architecture) so everyone at OSBR reads code the same way. This discipline
is *per-project* and *domain*-facing: the nouns and verbs of *this* product's
business — `Booking`, `Invoice`, `Ledger`, `settle`, `void` — the words a domain
expert would recognise. One is a shared reference book; the other is a living
project artifact you grow and defend as the model evolves.

The words themselves are not invented at the keyboard. They are the language we
first hear in [Market Research](/market-research) and pin down while
[Requirements Modeling](/requirements-modeling) — the domain expert's own terms,
carried into the code unchanged. This page is where that discipline meets the
[Development Guide](/development-guide)'s **Planning & Shaping**: naming is
shaped with the model, not bolted on after.

[[TOC]]

## 1. Goal

A codebase where **the same concept has exactly one name, and that name means
exactly one thing** — end to end. A new engineer, a domain expert, or an AI agent
reading any layer (a Postgres column, a Go struct, a log line, an error string)
encounters the *same* word for the *same* idea, and can therefore reason about
the system without a translation table in their head.

This directly serves the OSBR human⇄AI principle: **one word per concept keeps
the codebase self-explanatory to humans and AI alike.** An AI agent editing our
code has no hallway to ask "is a `client` the same as a `customer`?" — it infers
meaning from names. Synonyms and drift are, for an agent, silent corruption of
the model; for a human, a 3am bug.

This is **Ubiquitous Language** in the Domain-Driven Design sense (Eric Evans):
the language of the model, spoken by developers and domain experts, embedded
rigorously in the software. The dictionary is where we write that language down.

## 2. Responsibility

- **Every engineer** searches the dictionary before coining a term, and appends
  to it when the domain reveals a genuinely new concept.
- **The person who renames a concept** owns updating *every* affected surface in
  the same change (§3-5).
- **Reviewers** reject PRs that introduce a synonym, a modifier-laden alias, or
  an identifier that diverges from the agreed word — naming is part of code
  review, not a follow-up.
- **The whole team** treats the dictionary as the source of truth for the model's
  vocabulary; disagreements about a word are resolved *with the domain expert*,
  then written down, not re-litigated per PR.

## 3. Practices

### 3-1. One word per concept — maintain the dictionary

- Keep a project **dictionary** (a `TERMS.md`, a docs page, or a section in the
  domain model) listing each concept, its single agreed word, and a one-line
  definition. This is **glossary-driven development** in Gojko Adzic's sense — the
  glossary of business terms is a first-class deliverable that the specification,
  the code, and the conversation all draw from.
- You MUST record a concept in the dictionary before it spreads across more than
  one module. A word that only lives in three engineers' heads has three
  definitions.
- The definition SHOULD be phrased so a domain expert would nod at it — not a
  technical restatement.

### 3-2. Search before you coin

- Before introducing a new noun or verb, you MUST **search the existing terms**
  (the dictionary first, then the codebase — `grep`, symbol search) for an
  established word for that concept.
- If a word already exists for the idea, use it. If a *near* word exists but the
  concept is genuinely different, the resolution is a conversation with the
  domain expert to name the distinction — not a quiet second synonym.
- This is the cheap half of the old adage that the two hard things in computer
  science are cache invalidation and naming things. Searching first is how we
  stop the naming problem from compounding.

### 3-3. No synonyms, no modifier-laden names

- **One concept, one word.** `customer` / `client` / `account` for the same
  entity is a defect, not a style choice. Pick one; the dictionary records which.
- Avoid **modifier-laden names** that encode uncertainty or overlap: `realUser`,
  `actualTotal`, `finalFinalInvoice`, `newBookingData`. A qualifier that exists
  only to disambiguate from a near-synonym is a signal the underlying concept is
  unclear — fix the concept, not the label.
- A name that needs a compound of three nouns usually means the *ubiquitous
  language itself* is too compound. A long, modifier-heavy identifier means the
  domain vocabulary needs simplifying upstream: agree a simple, ideally
  single-word term with the domain expert, and short identifiers follow for free.

### 3-4. Identifiers mirror the ubiquitous language

- Struct/type names, function names, variables, DB tables and columns, API
  fields, config keys, event names, and log keys MUST use the dictionary word for
  the concept they carry.
- **Naming is design, not decoration.** A well-named function reveals its
  contract; a mis-named one hides a mismatch between the code and the model. Treat
  a name you keep wanting to qualify as a design smell pointing at a missing or
  wrong concept — the fix is usually to split or rename the concept, and the
  better name falls out.
- Where a mechanical convention applies (singular entity, plural table;
  `snake_case` in SQL; the per-language style guides), the *convention* shapes the
  casing but the *word* still comes from the dictionary.

### 3-5. Renaming is an atomic, whole-system change

When a concept is renamed — because the domain expert corrected us, or the model
sharpened — you MUST update **every affected surface in the same change**:

- production code and type definitions,
- database schema / migrations,
- tests and fixtures,
- **logs, metrics, and event names**,
- **error messages** and user-facing strings,
- docs, comments, and the dictionary entry itself.

A rename that lands in the code but not the logs, or in the schema but not the
error text, re-creates the two-names-one-concept problem it was meant to kill —
and leaves a landmine for whoever (human or agent) next greps for the old word.
If a full atomic rename is genuinely too large for one PR, apply an
expand/migrate/contract discipline: introduce the new word, migrate every surface
across explicit steps, then remove the old — never leave both live indefinitely.

### 3-6. Contradictions are findings, not footnotes

A dictionary earns its keep by surfacing the two shapes of naming trouble, and
each marks a real boundary in the domain:

- **Two words for one thing** — a synonym. Usually harmless-looking drift; resolve
  it to the single agreed word (§3-3).
- **One word for two things** — a homonym. `settle` meaning both "mark an invoice
  paid" and "close a dispute" is the more dangerous case: the shared word hides
  that these are *different concepts*. Flag it, take it to the domain expert, and
  split it into two words that each mean one thing.

When you hit either, you MUST raise it as a finding — a note in the dictionary or
an issue — not paper over it. A contradiction between two names is the model
telling you where a boundary actually runs; naming it right sharpens the domain,
not just the code.

## 4. Pinning subtle terms by example

When a term is subtle, pin it down with a concrete example, not a longer abstract
definition — Gojko Adzic's **specification by example**. `A Booking is void once
the guest no-shows past the cutoff` teaches the word better than a paragraph, and
doubles as a test name. Examples in the dictionary keep humans and AI reading the
same meaning, and tie the vocabulary straight back to the scenarios captured
during [Requirements Modeling](/requirements-modeling).

## 5. Quick Checklist

Before merging, the author and reviewer confirm:

- [ ] Any new concept has a dictionary entry (one word, one definition).
- [ ] No new synonym for an existing concept was introduced.
- [ ] No modifier-laden alias (`real*`, `actual*`, `*Data`, `new*`) papering over
      a fuzzy concept.
- [ ] No word quietly carrying two meanings (§3-6) — homonyms raised as findings.
- [ ] Identifiers across code, schema, API, and events use the agreed word.
- [ ] Any rename updated code **and** tests **and** logs **and** error messages
      **and** docs — in this change.

## 6. OSBR Values in Practice

- **Be Nice** — a clear, single, honest name is a gift to the next reader. Naming
  things well is one of the kindest, least glamorous things we do for teammates.
- **Be Kind** — take the time to learn the domain expert's real word rather than
  inventing a developer-convenient one. Meeting people in *their* language, and
  writing it down so it lasts, is respect made durable.
- **Be Strong** — hold the line in review: reject the second synonym now, because
  the drift you wave through today is the ambiguous model everyone fights for the
  project's life. Do the whole atomic rename, not the convenient half.

One word per concept is how we keep the codebase **self-explanatory to humans and
to the AI agents that read and write it beside us** — no glossary lookup, no
guessing, no drift.

## References

- Eric Evans — *Domain-Driven Design: Tackling Complexity in the Heart of
  Software* (Ubiquitous Language) — <https://www.domainlanguage.com/ddd/reference/>
- Gojko Adzic — *Specification by Example* (glossary-driven / living
  documentation) — <https://gojko.net/books/specification-by-example/>
- Martin Fowler — Ubiquitous Language — <https://martinfowler.com/bliki/UbiquitousLanguage.html>
- Martin Fowler — "TwoHardThings" (naming things, cache invalidation) — <https://martinfowler.com/bliki/TwoHardThings.html>

**Related OSBR standards**

- [Technical Glossary](/technical-glossary) — cross-project technical vocabulary,
  the complementary reference to this per-project domain dictionary.
- [Requirements Modeling](/requirements-modeling) — where the domain's concepts
  and their names are first captured.
- [Market Research](/market-research) — where we first hear the domain expert's
  language.
- [Development Guide](/development-guide) — Planning & Shaping, and the
  pull-request review where naming is held to the dictionary.
