# Repository & Documentation Standards

This is the standard the [Quality Gate](/quality-gate)'s **Sustainability** lens
holds a repository to for how it is laid out and how it carries its own
knowledge. One idea runs through all of it: **the repository is the single
source of truth** — for the code, for the reasoning behind every change, and for
the facts from which any report, diagram, or briefing is generated. When
structure, history, and knowledge all live in the clone, anyone who opens it —
the next developer, yourself in six months, the client's team, or an AI agent
working in the tree without a colleague beside it — can find what they need by
reasoning about *where it must be*, not by being given a tour. Deviations are
allowed, but — as everywhere in the handbook — they must be deliberate and
recorded in the project's README or design notes.

This standard is where three OSBR values become load-bearing structure. **Be
Nice**: a predictable layout and a legible record are the clearest documentation
a teammate or agent will ever read, so we write for whoever comes next. **Be
Kind**: never leave a colleague to re-learn the map under incident pressure, or
to inherit five drifting copies of the same fact — leave them one stable
skeleton and one true source. **Be Strong**: invest effort where it compounds
(the structural source that survives staff turnover and tool churn), not where it
evaporates (a hand-polished one-off document). Humans and AI agents both read and
write in this tree as collaborators, and every rule here is chosen so that
collaboration stays cheap and correct.

## How to read this standard

* **Requirement levels** follow RFC 2119, as in the [Coding Style
  Guide](/style-guide). **MUST** / **MUST NOT** are absolute. **SHOULD** /
  **SHOULD NOT** state a strong default overridable only with a documented
  reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is
  named inline and cited under [References](#references). We stand on published
  convention and right-size it for an SME — we do not adopt the headcount or
  infrastructure behind anyone's reference setup.

[[TOC]]

## 1. Goal

The goal is that **structure carries knowledge**. When the shape of the tree is
predictable, a location becomes information: `scripts/` *is* where the runnable
scripts are, `docs/` *is* where the prose lives, and there is exactly one obvious
place for each kind of thing. When the reasoning behind a change is durable,
local, and reconstructable, a reader with **only this clone** can answer, for any
non-trivial change: *what* was decided and what was rejected, *why*, and *when*
relative to the decisions around it. And when facts are stored structurally, OSBR
stays permanently able to generate a correct explanation for any reader — a
one-line answer for a busy manager, a deep trace for an engineer, a
plain-language summary for a client — without anyone hand-maintaining a library
of finished documents.

A person who has navigated one OSBR repo can navigate the next one without a
guide, and an AI agent can act by deriving a path instead of listing directories
until it stumbles on the right one. Every exploration step an agent avoids is
context saved, latency removed, and a chance to guess wrong eliminated.

## 2. Responsibility

- **Whoever creates or restructures a repository** owns its top-level layout.
  Before inventing a new top-level directory, you check how OSBR repos already
  divide the tree (§3-1) and carry that division over — you do not coin a local
  convention because it suited one afternoon.
- **Every contributor** owns the record of their own change being present in the
  repository before the change merges. A merged change with no retrievable
  rationale is an incomplete change. The bar is not "was a ticket filed
  somewhere"; it is "can the next reader, with only this clone, understand why".
- **Reviewers** reject a new top-level directory, an abbreviation, or a second
  home for an existing kind of thing when it departs from the standard without a
  recorded reason — exactly as they would reject a broken naming or schema
  convention. They also check that the record of a change exists and is legible,
  not only that the code is correct.
- **AI agents** working in the repository are held to the same standard: they
  produce the same documents and the same structured commits, and they are
  expected to *read* those records to reconstruct intent before acting. The human
  who merges an agent's work owns it, whoever drafted it.
- **The repository README** is where any deliberate, project-specific departure
  is recorded, with its reason. A directory or record whose purpose a newcomer
  cannot guess and the README does not explain is a defect.

## 3. Repository structure — divide the top level by role

### 3-1. Divide the top level by role

The top level of a repository is carved into a **small, fixed set of
directories, one per role.** The role is what the directory holds and why it
exists — not which team owns it or which feature it belongs to. The OSBR baseline
vocabulary:

| Directory | Role — what lives here |
| --------- | ---------------------- |
| `packages/` | The shippable code units — one directory per package (§3-3) |
| `scripts/` | Runnable operational and developer scripts (setup, migration runners, one-off tasks) |
| `workloads/` | Deployable/runnable workloads — services, jobs, workers, functions |
| `databases/` | Schema, migrations, seed data — the persisted-state layer |
| `docs/` | Human-readable documentation and the models that back it |
| `outputs/` | Generated artifacts — build output, reports, exports (git-ignored unless a build genuinely needs to track them) |

- **MUST** place each kind of thing under the one top-level directory whose role
  fits it, and **MUST NOT** create a second home for a kind of thing that already
  has one. Two directories that both hold "scripts" is exactly the ambiguity this
  standard exists to prevent.
- **MUST NOT** divide the top level by anything other than role — not by team, not
  by author, not by "old vs new". Feature and layer live *inside* a package
  (§3-4), not at the top of the tree.
- **SHOULD** treat this list as the default vocabulary and reach outside it only
  when a project genuinely has a role none of these names covers — and then name
  the new directory by the same rules (§3-2) and record it in the README.

This is **convention over configuration** (the Rails Doctrine): a fixed default
for *where things go* frees you from re-deciding and re-explaining the layout on
every project. The productivity does not come from any one name being optimal —
it comes from the name being *the same every time* so nobody has to think about
it. OSBR adopts the stance, not Rails' specific folders.

### 3-2. Names are pronounceable, non-abbreviated words

- **MUST** name every top-level directory with a **whole, pronounceable word** —
  `packages`, `scripts`, `databases` — never an abbreviation, contraction, or
  initialism. `pkgs`, `wl`, `db`, `docs-src`, `svc` are prohibited as top-level
  names. (`docs` is the one settled exception — a universally-read word in its own
  right, matching near-universal ecosystem convention. But `outputs`, not `out`;
  `databases`, not `db`.)
- **MUST** keep names plural where the directory holds many of a thing
  (`packages`, `scripts`, `workloads`): the collection is plural, and the
  individual package inside it is named for the one concept it is (§3-3).
- **SHOULD** keep names to a single word. A compound, underscore-heavy directory
  name is usually a smell that the role is not crisp — fix the concept, not just
  the label.

A name you can say out loud is one a team can talk about, one that survives a
code-review conversation, and one an AI agent tokenises and reasons over cleanly.
Abbreviations save keystrokes once and cost comprehension forever: the keystrokes
are yours; the expansion tax is everyone's.

### 3-3. One directory per package

- **MUST**, under `packages/` (and equally under `workloads/`), give each package
  **its own directory, named for the one concept it is** — `packages/billing`,
  `packages/notifications` — with nothing shared loosely between siblings at that
  level.
- **MUST** make the package directory the self-contained unit: its own manifest,
  source, tests, and local docs. A reader should understand one package by
  looking in one directory, not by cross-referencing five.
- **SHOULD** keep package names aligned with the ubiquitous language — the package
  that owns *invoices* is `invoices`, not `inv` and not `billing-stuff`.

This is the layout the major monorepo tools assume: Nx and Turborepo structure a
workspace as many self-contained projects, each in its own directory under a
small number of role folders; Bazel formalises it hardest, where a directory with
a `BUILD` file *is* a package. OSBR uses `packages/` for library code and
`workloads/` for the deployable units — the same split Nx/Turborepo draw as
`packages/` vs `apps/`, named for what we deploy.

### 3-4. Package by feature, not by layer — inside the package

Role divides the *top* of the tree. **Inside** a package, structure follows the
**feature/domain**, not the technical layer. Do not create top-level
`controllers/`, `services/`, `models/`, `utils/` buckets that every feature has
to be smeared across.

- **SHOULD**, within a package, group code by the business capability it serves
  (package-by-feature) so that everything touching *one* concept sits together,
  rather than scattering one feature across parallel layer folders.
- The reasoning is the documented **package-by-feature vs package-by-layer**
  trade-off: layer-first grouping maximises the distance between things that
  change together; feature-first grouping keeps a change local and makes deletion
  clean. This is the same instinct the [Architecture
  Standards](/architecture-standards) apply to module boundaries.

This is Robert C. Martin's **screaming architecture**: the top level of a system
should *scream* what it **does**, not which framework built it. Package
directories named `invoices/`, `scheduling/`, `notifications/` tell you what the
business is; the framework is a detail you find later, inside.

### 3-5. The same layout across every project

- **MUST** carry the same top-level division and the same names from one OSBR
  repository to the next. The point of a convention is that it is invariant — a
  `scripts/` directory means the same thing, lives in the same place, and is named
  the same word in every repo.
- **MUST** record any project-specific deviation in the README, with the reason.
  An undocumented departure from the standard layout is a bug.
- **SHOULD** establish the standard directories up front on a new repository, even
  if some start nearly empty, so the shape is present and predictable before the
  code arrives — rather than growing the tree ad hoc and abbreviating under
  pressure later.

The Go community codified exactly this instinct as `golang-standards/project-layout`:
one agreed set of role directories, reused everywhere, so familiarity transfers
across the whole portfolio. The bar for a new top-level directory is *a genuinely
new role* — not "it felt tidy today".

## 4. Documentation lives in the repository

The rationale behind a change is worth as much as the change itself — and it is
worth nothing if a future reader cannot find it. The same is true of every
durable fact the project depends on. So both the *why* of a change and the facts
that back an explanation live inside the repository, reviewed in the same pull
request, versioned in the same history, and found by the same `grep`.

### 4-1. Store the record in the repository, as markdown

Tickets, branch stories, and release notes **MUST** live as markdown files
committed to the repository, not solely in an issue tracker, chat, or SaaS tool.
External trackers **MAY** mirror or link to them, but the repository copy is
canonical.

This is the **docs-as-code** discipline: documentation authored in plain text,
versioned in git, reviewed through pull requests, travelling with the code it
describes. A record that lives only in a hosted tool has a different lifecycle
from the code — it can be edited without review, lost on a licence lapse, or made
unreachable by an offline clone. A record in the repo cannot.

- Records **MUST** be plain markdown (no proprietary format), so any human or AI
  reader can consume them with standard text tools.
- Each record **SHOULD** sit as close to the code it concerns as is practical —
  proximity is what keeps decisions discoverable and stops them drifting out of
  date.
- A link is a promise about a system you do not control. Link *out* for
  convenience; keep the truth *in*.

### 4-2. One fact, one place — store it structurally

The Pragmatic Programmer's **DRY principle** — *"every piece of knowledge must
have a single, unambiguous, authoritative representation within a system"* —
applies to knowledge, not just code. A fact duplicated across five deliverables
is a fact that will be wrong in four of them within a month.

- A number, definition, or decision **MUST** have exactly one authoritative home;
  everything else links to it. If you find yourself copying a fact to "make the
  document complete", stop — link instead, or generate the document from the
  source.
- Store information in the **smallest reusable unit** — structured topics and data
  — not in long prose blobs. This is the discipline of structured, composable
  content (the idea behind DITA's "write once, use many"): store data *as* data
  (tables, config, structured files), not as sentences describing the data.
  Sentences cannot be recombined; data can.
- Give each unit a stable identifier so it can be referenced, not re-typed.

### 4-3. Keep terms composable

Composable content requires composable vocabulary. Two units that describe the
same thing with different words cannot be safely assembled into one explanation.

- **SHOULD** name things with the project's ubiquitous language — the same
  discipline applied to code and domain modelling, extended to all stored
  knowledge. A new domain term is defined once, in the project's glossary, before
  it is used.
- Design each stored unit assuming an AI agent will assemble it into an
  explanation for an unknown reader: clear, self-contained, consistently named.

### 4-4. Record architectural decisions as ADRs

Decisions with lasting structural consequence **MUST** be captured as
**Architecture Decision Records** — short markdown files, one per decision,
committed under the repository (conventionally `doc/adr/` or `docs/decisions/`).
Follow Nygard's original lightweight form or the MADR template:

- **Context** — the forces and constraints in play.
- **Decision** — what we chose to do.
- **Consequences** — what becomes easier and what becomes harder.
- **Status** — proposed / accepted / superseded.

ADRs are **immutable once accepted**: a reversed decision gets a *new* ADR that
supersedes the old one, so the reasoning trail — including the roads not taken —
stays intact. We amend history by *appending*, never by rewriting. A pull request
itself serves as a lightweight ADR for smaller decisions (see the [Development
Guide](/development-guide)); reserve a standalone ADR for the structural ones.

### 4-5. Let AI generate structured commit messages

Commit messages **MUST** follow **Conventional Commits** (`type(scope): summary`,
with `feat`, `fix`, `refactor`, `docs`, etc., and `BREAKING CHANGE:` where it
applies). This gives the history a machine-readable shape that both tooling and
AI agents can parse for changelogs, release scoping, and traceability.

- Commit messages **SHOULD** be **generated by AI from the actual diff and the
  surrounding record**, not hand-typed. An agent that reads the diff, the ticket,
  and the relevant ADR writes a more complete, consistent message than a tired
  human at the end of a session — stating *what* changed and *why*, linking back
  to the ticket or ADR.
- Commit bodies **SHOULD** name the *why* and reference the ticket / ADR / branch
  story that carries the fuller context.
- The human author remains **responsible** for the committed message being true,
  whoever (or whatever) drafted it. This is human⇄AI cooperation working as
  intended: the human decides, the AI documents, and the reasoning lands where the
  next reader will look for it.

### 4-6. Documents are the curated record; commit history is raw material

The **document files — tickets, branch stories, release notes, ADRs — are the
central, curated record.** The commit history is the **raw material** behind them:
high-fidelity, append-only, never groomed away. This is **living documentation**
in Martraire's sense — authoritative knowledge kept alongside the code and
refreshed as the code changes.

- Commit history **MUST NOT** be squashed, rebased, or groomed in a way that
  destroys the granular record. Preserving the individual commits preserves the
  order and reasoning of the work — the raw material future readers and AI agents
  mine for provenance. A squash merge collapses a branch's reasoning into one
  opaque blob and discards the very sequence that shows *how* the change was
  reasoned through.
- The curated documents **MUST** be kept current as the central record — they are
  the map; the commits are the territory. When a document and the commit history
  disagree, that is a signal to fix the document, not to discard the commits.

### 4-7. Treat reports and diagrams as generated derivatives

A deliverable is an *output*, not an *asset*. A slide deck is a photograph; the
repository is the subject — we invest in the subject.

- **MUST** treat reports, briefings, and diagrams as generated derivatives:
  regenerate them from source rather than editing the derivative and letting the
  source go stale. If a report can be produced from the source, it must not be
  maintained separately.
- Diagrams **SHOULD** be defined as code (e.g. Mermaid) next to the facts they
  depict, so they update when the facts do.
- A generated deliverable can be thrown away without loss, because the capacity to
  regenerate it never left the repository — the mark of living documentation.
  Delete generated deliverables freely once delivered, trusting the repository to
  regenerate them.

### 4-8. Write for the next reader — human or AI

Structured facts answer *what is true*; the commit and PR history answers *why it
became true*. Together they let an explanation be generated at any depth,
including the reasoning — and, because the source is versioned, *as of a point in
time*: what did we believe, and why, on a given date.

Every record **MUST** be written so that a reader with **only this clone** and no
access to us can reconstruct the reasoning. Assume the tracker is gone, the chat
is unsearchable, and the author has left. What remains is the repository — so the
repository must carry enough. That is **Be Kind** made operational.

## References

**Repository & project layout**

- Ruby on Rails — The Rails Doctrine (convention over configuration) — <https://rubyonrails.org/doctrine>
- Nx — Folder structure / workspace conventions — <https://nx.dev/concepts/decisions/folder-structure>
- Turborepo — Structuring a repository — <https://turborepo.com/docs/crafting-your-repository/structuring-a-repository>
- Bazel — Packages, targets, and the BUILD concept — <https://bazel.build/concepts/build-ref>
- golang-standards/project-layout — a shared Go project layout — <https://github.com/golang-standards/project-layout>
- Robert C. Martin — Screaming Architecture — <https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html>
- Package by feature, not layer (the trade-off) — <https://phauer.com/2020/package-by-feature/>

**Records, decisions & change history**

- Michael Nygard — Documenting Architecture Decisions — <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions>
- MADR — Markdown Any Decision Records — <https://adr.github.io/madr/>
- Architecture Decision Records (ADR) — <https://adr.github.io/>
- Conventional Commits — <https://www.conventionalcommits.org/>

**Docs-as-code, structured content & living documentation**

- Write the Docs — Docs as Code — <https://www.writethedocs.org/guide/docs-as-code/>
- The Pragmatic Programmer — DRY / single source of truth — <https://pragprog.com/tips/>
- OASIS DITA — structured, reusable topic-based content — <https://docs.oasis-open.org/dita/dita/v1.3/dita-v1.3-part0-overview.html>
- Mermaid — diagrams as code — <https://mermaid.js.org/>
- Cyrille Martraire — *Living Documentation* — <https://www.livingdocumentation.net/>
- Martin Fowler — Living Documentation — <https://martinfowler.com/bliki/LivingDocumentation.html>

**Related OSBR standards**

- [Quality Gate](/quality-gate) — the Sustainability lens this standard serves.
- [Architecture Standards](/architecture-standards) — module boundaries and package-by-feature structure.
- [Coding Style Guide](/style-guide) — RFC 2119 levels, ubiquitous language, the pure core.
- [Development Guide](/development-guide) — tickets, branch stories, pull-requests-as-ADRs.
