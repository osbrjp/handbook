# Self-Explanatory UI

This policy defines what OSBR means by a finished screen: **every screen MUST
be operable without documentation.** If a user needs a manual, a walkthrough
video, or a tooltip tour to complete an ordinary task, the screen is not
finished — the design is doing less than its job and pushing the shortfall onto
the user. This is the standard the [Quality Gate](/quality-gate) holds
interface work to, and it sits alongside the [Design
Guidelines](/design-guidelines) and [Interaction Design](/interaction-design)
policies as the screen-level expression of both.

We do not invent our own usability theory. We stand on named, published
practice — Don Norman's *The Design of Everyday Things*, the Nielsen Norman
Group's usability heuristics and writing guidelines, and the plain-language
movement — and apply it at the altitude of a single screen. Deviations are
allowed, but — as everywhere in the handbook — they must be deliberate and
justified in the project's design notes.

A screen is where OSBR's values meet the person using the product. **Be Nice**:
writing every label and message in the user's language, not ours, is an act of
respect for the person on the other side of the glass. **Be Kind**: the screen
explains itself so the user never has to feel stupid — it never leaves them
staring at a dead end, an unlabelled icon, or an error that only says something
broke. **Be Strong**: it means refusing to ship the false-finished screen and
paper the gap over with a help doc.

## How to read this policy

* **Requirement levels** follow RFC 2119. **MUST** / **MUST NOT** are absolute.
  **SHOULD** / **SHOULD NOT** state a strong default overridable only with a
  documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is
  named inline and cited under [References](#references). We adopt the
  *criteria* of these sources and right-size them for an SME — we do not adopt
  the research apparatus behind them.

[[TOC]]

## 1. Goal

The goal is a screen that **explains itself in the act of being used.** A
first-time user, given the screen and nothing else, can tell what it is, what
they can do, what is happening, and what to do next — including when things go
wrong.

A screen carries the whole conversation with the user. Whatever the screen
fails to say, the user must guess, ask, or look up — and every guess is a chance
to get it wrong. So the design's job is to say it: on the control, in the user's
own words, at the moment and place it is needed.

## 2. Responsibility

Whoever builds a screen owns its self-evidence. This is not a hand-off to a
separate "UX" role who cleans up copy at the end — the person building the
screen is the person who makes it self-explanatory, because the two are the same
act. Concretely, that person or pair MUST:

- Design **all four states** of every screen — loading, empty, error, success —
  not just the happy path (§3-2).
- Write every label, action, and message in the **user's vocabulary** (§3-1),
  reusing the terms the [Design Guidelines](/design-guidelines) settle on for
  each concept.
- Make every error message **actionable and adjacent to its cause** (§3-3).
- Treat a needed **onboarding tour or tooltip coach-mark as a design finding**,
  not a feature — investigate the underlying screen before adding the overlay
  (§3-4).

## 3. Practices

### 3-1. Speak the user's language, and let controls signal their use

Two named ideas from Norman govern this. First, **match between system and the
real world** — the first of the Nielsen Norman Group's [10 Usability
Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): "speak
the users' language, with words, phrases and concepts familiar to the user,
rather than internal jargon." Second, **affordances and signifiers** (Norman,
*The Design of Everyday Things*): an affordance is what an element lets you do; a
**signifier** is the perceivable cue that tells you it. A button that does not
look pressable has hidden its affordance.

- Labels, buttons, empty states, and messages MUST use the words the user uses.
  If the domain term is "consignment", the button is not "Submit Record" — the
  vocabulary the [Design Guidelines](/design-guidelines) fix for the product
  reaches the surface unchanged, never swapped for an internal name.
- Interactive elements MUST carry a signifier that they are interactive — a
  control must look like a control. Do not rely on the user hovering, guessing,
  or remembering that a thing is clickable. The same cue also serves users on
  assistive technology (see [Accessibility](/accessibility)): a control the eye
  can recognise is a control the screen reader can name.
- **Mapping** MUST be natural: the arrangement of controls should mirror the
  thing they affect (Norman's example — the layout of stove-burner knobs
  matching the burners). Order, group, and place controls so their relationship
  to their effect is visible, not memorised.
- Follow **plain-language** practice
  ([plainlanguage.gov guidelines](https://www.plainlanguage.gov/guidelines/)):
  short sentences, common words, active voice, "you" for the reader. A screen
  written plainly needs no glossary.

The test for a control is not "does it look nice" but "does an unfamiliar user
know it is a control, and what it will do, before they touch it." If they must
click to find out, the signifier is missing.

### 3-2. Design all four states, always

Most screens are designed for the moment they are full of data and everything
works. Users spend a large share of their time in the other three states — and
those are exactly where an undesigned screen abandons them. Every screen that
fetches, shows, or accepts data MUST design all four:

| State | What the user must be told | Grounded in |
| ----- | -------------------------- | ----------- |
| **Loading** | Something is happening, and roughly how far along | *Visibility of system status* (NN/g heuristic 1) |
| **Empty** | Why it is empty, and the one action to fill it | [Empty-state design](https://www.nngroup.com/articles/empty-state-interface-design/) |
| **Error** | What happened and what to do about it (§3-3) | *Help users recognise, diagnose, recover from errors* (heuristic 9) |
| **Success** | That it worked, and what changed | *Visibility of system status* (heuristic 1) |

- **Loading** MUST show system status. No frozen screen, no ambiguous spinner
  that could equally mean "working" or "hung" — say what is loading. (NN/g,
  [Visibility of System Status](https://www.nngroup.com/articles/visibility-system-status/).)
- **Empty** is a first impression, not an error. A good empty state (NN/g,
  [empty-state design](https://www.nngroup.com/articles/empty-state-interface-design/))
  explains what belongs here and offers the single next action to create the
  first item — never a blank void that reads as "broken".
- **Error** MUST follow §3-3.
- **Success** MUST confirm the outcome. A save that gives no feedback forces the
  user to re-check whether it worked — a small tax paid on every action.

A screen shipped with only its success-with-data state designed is **not
finished.** The missing three states will be filled by browser defaults, blank
space, and raw stack traces — i.e. by no design at all.

### 3-3. Errors: what happened + what to do, next to the cause

An error message is the screen speaking at the user's worst moment. Two of the
NN/g heuristics bear directly: **error prevention** (heuristic 5 — the best
message is the one designed out) and **help users recognise, diagnose, and
recover from errors** (heuristic 9 — messages "expressed in plain language,
precisely indicate the problem, and constructively suggest a solution"). The
NN/g [error-message guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
make this concrete.

- Every error message MUST state **both** halves: **what happened** and **what
  to do next.** "Something went wrong" states neither. "Card declined — check
  the number and expiry, or try another card" states both.
- Messages MUST be **adjacent to their cause.** A field error belongs at that
  field, not in a banner at the top of the page; a form-level error belongs
  where the user's eye is when it occurs. Distance between the error and its
  source makes the user hunt for what to fix.
- **Prevent the error first** (heuristic 5). Constrain inputs, disable
  impossible actions, confirm destructive ones, use the right input type. A
  prevented error needs no message.
- Error copy MUST be **plain and human** — no error codes as the primary
  message, no blame ("invalid input"), no jargon. Name the problem in the user's
  terms and point at the fix. (Plain-language, as §3-1.)
- Never blame the user, and never hide the failure. Surface it so they can
  recover — a silent failure is worse than a blunt one.

An error path with a vague message is an unfinished feature, not a finished
feature with rough edges. If the recovery instruction isn't written, the user
cannot recover — the code "handled" the error and the person did not.

### 3-4. A tour over a finished UI is a design failure

Onboarding tooltip tours, coach-marks, and "here's how this works" overlays are
the standard industry patch for a screen that does not explain itself. OSBR
reads them as a **signal**, not a solution.

- A screen that needs a guided tour to be operable has **failed §1** — it is not
  self-explanatory, and the tour is a manual wearing a costume. The default
  response is to fix the screen (labels, signifiers, states, mapping) so the
  tour becomes unnecessary.
- Reaching for a tooltip tour SHOULD trigger the question: *which of §3-1
  through §3-3 did this screen skip?* Usually the answer is a missing signifier,
  jargon in a label, or an undesigned empty state — fix that instead.
- This does not ban all in-context help. A genuinely novel interaction, or
  progressive disclosure of an advanced feature, MAY warrant a one-time hint.
  The line: a hint that *teaches an optional power-feature* is fine; a tour that
  is *required to do the ordinary task* is a defect. If removing the overlay
  makes the core task unusable, the core screen is broken.

Every tour is evidence that the design lost an argument with itself and
outsourced the loss to the user's patience. Users skip tours, forget them, and
arrive by deep link having never seen them. The screen must stand alone — the
tour cannot be relied on, so the screen cannot depend on it.

## 4. What "no manual" requires, per screen

Before a screen is called finished, it MUST satisfy all of the following. This
is the checklist the practices above add up to, and it is the surface the
[Quality Gate](/quality-gate) reviews interface work against:

| Requirement | The question it answers |
| ----------- | ----------------------- |
| **Vocabulary** | Are all labels, actions, and messages in the *user's* words? (§3-1) |
| **Signifiers** | Does every control look like what it is and does? (§3-1) |
| **Mapping** | Do control layout and grouping mirror what they affect? (§3-1) |
| **Loading state** | Does the user know something is happening? (§3-2) |
| **Empty state** | Does an empty screen explain itself and offer the first action? (§3-2) |
| **Error state** | Does every error say what happened *and* what to do, next to its cause? (§3-3) |
| **Success state** | Is the outcome confirmed? (§3-2) |
| **No required tour** | Is the ordinary task doable with no overlay, tooltip, or manual? (§3-4) |

A screen that shows data correctly but fails any row above is not finished — it
has documented the happy path and left the rest for the user to discover.

## References

Named, published practice this policy is grounded in — each a documented source
an SME can adopt directly.

**Foundations of usability**

- Don Norman — *The Design of Everyday Things* (revised ed., 2013) —
  affordances, signifiers, mapping, and the paired gulfs of execution and
  evaluation — <https://www.nngroup.com/books/design-everyday-things-revised/>
- Nielsen Norman Group — 10 Usability Heuristics for User Interface Design —
  <https://www.nngroup.com/articles/ten-usability-heuristics/>

**System status and states**

- Nielsen Norman Group — Visibility of System Status — <https://www.nngroup.com/articles/visibility-system-status/>
- Nielsen Norman Group — Empty States: More Than Just Blank Screens — <https://www.nngroup.com/articles/empty-state-interface-design/>

**Error messages**

- Nielsen Norman Group — Error-Message Guidelines — <https://www.nngroup.com/articles/error-message-guidelines/>
- Nielsen Norman Group — How to Report Errors in Forms — <https://www.nngroup.com/articles/errors-forms-design-guidelines/>

**Plain language**

- plainlanguage.gov — Federal Plain Language Guidelines — <https://www.plainlanguage.gov/guidelines/>

**Related OSBR standards**

- [Design Guidelines](/design-guidelines) — the product vocabulary and design principles §3-1 spends on the screen.
- [Interaction Design](/interaction-design) — the interaction-level companion to this screen-level standard.
- [Accessibility](/accessibility) — signifiers and states as they reach assistive technology.
- [Quality Gate](/quality-gate) — the standard this checklist is reviewed against.
