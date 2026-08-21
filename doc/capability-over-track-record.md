# Capability over Track Record

This policy defines how OSBR **proves it can do the work.** When a client or a
user needs to believe we are capable, we do not reach first for a résumé of past
projects, a logo wall, or a list of credentials. We reach for the real thing at
hand — a working proof-of-concept, the concrete design reasoning behind a
decision, and the running service itself. A track record answers *"were they any
good before?"*; a demonstration answers *"are they solving **this** problem, for
**this** client, right now?"* — and only the second question keeps our motivation
aligned with client and user value, because the only way to answer it is to
actually engage with their problem.

It sits close to two other standards. It complements [Verify Before
Building](/verify-before-building): that policy uses small disposable experiments
to *learn* whether an idea holds; this one uses the real artifact to *show* that
we can deliver it. It also carries a duty into the open — a public write-up is
attack surface, so this policy leans on [Application
Security](/application-security) for the anti-reconnaissance discipline that
keeps a reputation piece from becoming an attacker's map. And it shapes how we
pitch: the demonstrated-capability stance belongs in the [Planning & Shaping
stage](/development-guide) of any proposal, before a track record is ever
offered as a substitute for evidence.

This is where three OSBR values pull in the same direction. **Be Strong** is
proving by building, not by boasting: anyone can narrate a win, but it takes
strength to put a running artifact in front of people and let it be inspected,
questioned, and broken. **Be Nice** is letting the client judge us on evidence
they can see rather than asking them to defer to our authority — it respects
their time and their judgement. **Be Kind** is guarding the people behind a case
study: never publishing without consent, never handing an attacker
reconnaissance detail about systems a client trusted us with. We protect the
client before we promote ourselves.

## How to read this policy

* **Requirement levels** follow RFC 2119, as elsewhere in the handbook.
  **MUST** / **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a
  strong default overridable only with a documented reason. **MAY** marks a free
  choice.
* **Named practice.** Where a rule adopts a widely-recognised idea, the idea is
  named inline and cited under [References](#references). We adopt ideas a small
  team can actually run, not the ceremony larger organisations wrap around them.

[[TOC]]

## 1. Goal

The goal is to **establish credibility through evidence the other side can
inspect, not claims they must take on faith — while never letting that evidence
become a gift to an attacker.** Concretely:

- **Show, don't tell.** A demo the client can click, poke, and try to break is
  worth more than any narrated success. Demo-driven credibility means we let the
  work speak.
- **Anchor proposals in something runnable.** A proof-of-concept that touches
  the client's actual problem beats a slide claiming "deep experience in X." The
  PoC *is* the pitch.
- **Keep motivation honest.** Leaning on the real thing forces us to stay
  engaged with the client's and users' value — you cannot fake a running service
  the way you can embellish a track record.
- **Do not over-share.** What we publish to build reputation MUST NOT double as
  reconnaissance for whoever is probing the client's systems.

## 2. Responsibility

- **Everyone proposing or pitching work** owns demonstrating capability with the
  real thing at hand — a PoC, concrete design reasoning, or the running service —
  *before* falling back on past-project name-dropping. This is part of the
  [Planning & Shaping](/development-guide) work of a proposal, not an
  afterthought.
- **The engineer building a demo or PoC** owns making it genuinely runnable and
  honest: a demonstration that quietly fakes its result is worse than none, and
  defeats the entire point.
- **Whoever publishes a case study** owns obtaining client consent first, and
  keeping configuration and stack detail coarse enough that it cannot be used to
  attack the client.
- **Nobody** owns a track record being impressive. The prior list is not the
  evidence; the working thing in front of us is.

## 3. Practices

### 3-1. Prove with the real thing at hand

Capability is shown, not asserted. The strongest evidence is something the other
side can exercise for themselves.

- You **MUST** demonstrate capability using a working PoC or prototype, concrete
  design reasoning, or the running service before resorting to a recital of past
  achievements. Show, don't tell.
- Proposals **MUST** be anchored in something runnable wherever possible: a PoC
  that engages the client's actual problem, not a generic claim of experience.
  If we cannot yet build it, we **MUST** say so plainly rather than substituting
  a track record for evidence.
- A demo **MUST** work against reality before it is shown — verified end to end
  so it is not quietly faking its result. See [Verify Before
  Building](/verify-before-building) for how we prove a thing works against
  reality before presenting it, and the [Quality Gate](/quality-gate) for the
  bar the artifact itself must clear.
- The live service **SHOULD** be treated as the primary credential. A URL the
  client can exercise beats any list of prior engagements.
- Design reasoning **SHOULD** be walkable end to end — why this trade-off, what
  we rejected and why — so capability is visible in the thinking, not only in the
  outcome.
- Prefer **live demonstration over static portfolio** when both are possible: a
  running system that can be exercised is stronger evidence than a screenshot of
  one that once ran.

### 3-2. Publish case studies without arming an attacker

The urge to show *exactly* how clever the build was is how a reputation piece
turns into an attacker's map. The reader we must design for is not only the
prospective client — it is also the one probing the client's systems tonight. A
public write-up is OSINT surface, and this section applies the
reconnaissance-minimising discipline of [Application
Security](/application-security) to what we say about our own work.

- You **MUST** obtain explicit client consent before publishing any case study,
  screenshot, metric, or architecture detail that identifies the client or their
  system.
- Published configuration and stack detail **MUST** stay coarse. Name the *shape*
  of a solution ("event-driven ingestion with a managed queue"), never the
  operational specifics an attacker needs — exact versions, endpoint paths,
  internal hostnames, header or token formats, IAM structure, or infrastructure
  topology.
- You **SHOULD** scrub every case study for reconnaissance value the same way you
  scrub code for secrets: ask what a hostile reader now knows that they didn't
  before. Assume the write-up is read by someone looking for a way in.
- When consent is absent or the detail cannot be made coarse without gutting the
  story, **do not publish.** A missing case study costs us a marketing asset; a
  careless one costs the client their security margin.

## References

Named ideas this policy draws on, chosen because they are widely recognised and
adoptable by a small team.

**Prove by demonstrating**

- *Show, don't tell* / demo-driven credibility — evidence a client can inspect
  over claims they must trust.
- PoC-driven proposals — anchoring a pitch in a runnable proof of concept against
  the client's real problem.
- Portfolio vs. live demonstration — a running, exercisable service as stronger
  evidence than a static portfolio entry.

**Disclose without over-sharing**

- Security through not over-sharing — public configuration and stack detail as
  reconnaissance / OSINT surface for attackers.
- Responsible case-study disclosure — client consent and coarse-grained detail as
  preconditions for publishing what we built.

**Related OSBR standards**

- [Verify Before Building](/verify-before-building) — reduce uncertainty with
  small disposable experiments, and prove the thing works against reality before
  presenting it.
- [Quality Gate](/quality-gate) — the bar the demonstrated artifact itself must
  clear.
- [Application Security](/application-security) — the reconnaissance-minimising
  discipline behind coarse-grained disclosure.
- [Development Guide](/development-guide) — the Planning & Shaping stage where a
  proposal earns its credibility with the real thing.
