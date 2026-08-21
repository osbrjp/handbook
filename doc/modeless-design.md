# Modeless Design

This policy defines OSBR's default posture for interaction: **modelessness is the default; a mode is the exception that must justify itself.** A *mode* is any state where the same user action produces a different result depending on where the interface currently is — the classic example being a modal dialog that seizes the screen and refuses every action but its own. Whenever a design reaches for a mode, the burden is on the design to prove the mode is warranted, and to record why. It sits under the [Design Guidelines](/design-guidelines) and sharpens one thread of [Interaction Design](/interaction-design) down to the altitude of a single interaction. Deviations are allowed, but — as everywhere in the handbook — they must be deliberate and recorded in the project's design notes.

We do not invent our own interaction theory. We stand on named, published practice — Jef Raskin's *The Humane Interface* on modelessness, Larry Tesler's lifelong campaign against modes, the Nielsen Norman Group's modal-dialog guidance and the *user control and freedom* heuristic, Apple's Human Interface Guidelines and Google's Material dialog guidance, and the W3C WAI-ARIA Authoring Practices dialog pattern — and apply it at the altitude of a single interaction. The accessibility obligations a mode must still satisfy when it does exist live in [Accessibility](/accessibility); this page is where interaction design decides, one interaction at a time, whether a mode should exist at all.

## How to read this policy

* **Requirement levels** follow RFC 2119. **MUST** / **MUST NOT** are absolute. **SHOULD** / **SHOULD NOT** state a strong default overridable only with a documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is named inline and cited under [References](#6-references). We adopt the *criteria* of these sources and right-size them for an SME — not the tooling or scale behind their reference setups.

[[TOC]]

## 1. Goal

The goal is an interface where **the user is always in a place they chose to be, and can always leave it.** A mode — most visibly a modal dialog — takes control away from the user: it decides what they may do next and blocks everything else. The default is to not do that. When the interface must impose a mode, it does so briefly, for a reason the user can see, and with the door left unlocked.

Raskin's argument is the root of this policy: **modes are a principal cause of user errors**, because a person acts on their intent while the system acts on its hidden state, and the two diverge (Jef Raskin, *The Humane Interface*, 2000). Larry Tesler spent his career on the same point — his "NOMODES" licence plate and the maxim *"Don't mode me in"* name the whole discipline. A modeless interface lets the user's habits transfer everywhere because the same gesture always means the same thing.

::: tip This is what "Be Kind" looks like in interaction
OSBR's values are **Be Nice**, **Be Kind**, and **Be Strong**. **Be Nice** is, when a mode is genuinely justified, making it painless — obvious exits, preserved input, a readable background — so even the necessary mode respects the person inside it. In interaction design, **Be Kind** is literal: **never trap the user in a mode.** A modal the user cannot escape, that eats their half-typed input when it closes, or that hides the context they were reading, is unkindness encoded in software. **Be Strong** is refusing the lazy modal that exists only because it was easier to build than an inline flow.
:::

## 2. Responsibility

Whoever designs an interaction owns the decision to introduce a mode. Concretely, that person or pair MUST:

- Treat **modelessness as the default** and reach for a modal only when the interaction fits one of the justified cases (§3-1).
- **Record the trade-off** in the PR or an ADR whenever a modal is introduced — the justification is part of the change, not tribal memory (§3-1).
- Hold view and selection **state in the URL**, not in ephemeral modal state, so a place is addressable, shareable, and survivable across reload (§3-2).
- Give every modal **more than one exit** and **preserve in-progress input** on close (§3-3).
- **Trap focus** inside a modal for assistive-technology correctness while keeping the **background visible and readable** (§3-4).

This is not a hand-off to a separate role who audits modals at the end. The person who introduces the mode is the person who justifies it, because the two are the same decision.

## 3. Practices

### 3-1. Modeless by Default; a Modal Only for Justified Cases

The NN/g guidance on [modal & nonmodal dialogs](https://www.nngroup.com/articles/modal-nonmodal-dialog/) is blunt: modals interrupt and demand action, so they should be reserved for the few situations that genuinely need to stop the world. Everything else — editing, creating, filtering, previewing — SHOULD happen inline, in a panel, on its own page, or in a nonmodal surface the user can ignore and return to.

A modal is justified only when the interaction is one of these:

- **Irreversible confirmation** — a destructive or non-undoable action (delete, permanent send, irrecoverable overwrite) where a deliberate stop-and-confirm prevents a costly mistake. NN/g's *error prevention* heuristic backs the interruption here; a reversible action does **not** qualify — prefer an undo to a confirm.
- **A single, indivisible submission unit** — a short, self-contained task that must be completed or abandoned as one atomic unit (e.g. a focused credential or payment step) and that would be corrupted by leaving it half-done in the background.
- **Physically-exclusive interaction** — a task that genuinely needs the full surface or an exclusive input channel (a media crop, a full-screen capture, an OS-level permission prompt) where a background interaction would be meaningless or conflicting.

- If the interaction is none of the above, it MUST NOT be a modal. "It was easier to drop in a dialog" is not a justification — it is the failure mode this policy exists to catch.
- Whenever a modal **is** introduced, the design MUST **record the trade-off in the PR description or an ADR**: which of the three cases it falls under, and why a modeless surface would not serve. This makes the exception auditable and reversible later.

::: info The default carries no burden; the mode does
A modeless design needs no defence — it is the baseline. A modal is a claim that *this* interaction is special enough to take control away from the user. If that claim cannot be written down in a sentence tied to one of the three cases, the claim is false and the modal should not ship.
:::

### 3-2. Hold State in the URL, Not in the Mode

A mode that lives only in transient in-memory state is a place with no address: the user cannot bookmark it, share it, reload into it, or navigate back out of it with the browser's own controls. Raskin's modelessness has a direct web-era corollary — **the URL is the application's modeless state.** NN/g's *user control and freedom* heuristic (heuristic 3 of the [10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)) wants a clearly marked exit at all times; the browser's Back button and address bar are that exit, and they only work if state is in the URL.

- View, selection, filter, and "which item is open" state SHOULD be encoded in the URL (path or query), so every meaningful place is **addressable, shareable, and reload-survivable.**
- Opening a detail or edit surface SHOULD change the URL so **Back closes it** and forward/reload restores it. The browser's native navigation then becomes a free, always-present modeless exit.
- State that is genuinely ephemeral (a hover, an unsaved draft mid-keystroke) MAY stay in memory — but anything a user could reasonably want to return to, link to, or refresh into belongs in the URL.

::: tip The Back button is a modeless exit you get for free
When the current place is in the URL, the browser's Back button already does what §3-3 asks every modal to do — it lets the user leave. Building on the URL means you inherit a universal exit instead of reimplementing one badly.
:::

### 3-3. Multiple Exits, and Never Eat the User's Input

If a mode must exist, it must be trivial to leave, and leaving must not punish the user. The WAI-ARIA Authoring Practices [dialog (modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) requires that **Escape closes the dialog** — this is a baseline accessibility expectation, not a nicety. NN/g's *user control and freedom* heuristic frames the rest: users need a clearly marked way out that does not force them through an unwanted flow.

- Every modal MUST offer **at least two ways to close it**: the **Escape key** (required by the ARIA pattern) **and** a **click on the background/overlay**, in addition to any explicit Close or Cancel control. Multiple exits mean the user never has to hunt for the one door that works.
- Closing a modal MUST **preserve in-progress input** rather than silently discarding it. A user who typed three fields and pressed Escape by reflex should get those fields back, not a blank form — re-open restores, or an "unsaved changes" guard intervenes before loss.
- The one exception to easy dismissal is the **irreversible-confirmation** case (§3-1): a delete-confirm MAY intentionally require an explicit choice rather than a background-click dismissal — but Escape (i.e. "cancel, do nothing") MUST still work, because cancelling a destructive action is always safe.
- Never make the user complete a modal to escape it. A dialog with only a single "OK" that commits an action is a trap; there must be a safe way out that changes nothing.

::: info Dismissal is safe by default; only destruction is guarded
The asymmetry is deliberate. *Cancelling* is always harmless, so it should be effortless and available every way — Escape, background click, Close. *Committing* something irreversible is the only thing that earns a deliberate, guarded gesture. Guard the destruction, never the retreat.
:::

### 3-4. Trap Focus, but Keep the Background Readable

A modal has two audiences at once — a keyboard or screen-reader user who must not be able to tab out into dead background controls, and a sighted user who often needs the context behind the dialog to answer it. Both the WAI-ARIA APG [dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and the platform dialog guidance (Apple's [Human Interface Guidelines — Modality](https://developer.apple.com/design/human-interface-guidelines/modality), Google's [Material dialogs](https://m3.material.io/components/dialogs/guidelines)) speak to this: contain interaction, but do not obliterate context. The full accessibility bar these rules serve is set out in [Accessibility](/accessibility).

- Keyboard focus MUST be **trapped within the modal** while it is open — Tab and Shift+Tab cycle only through the dialog's focusable elements, focus moves into the dialog on open, and returns to the triggering element on close (WAI-ARIA APG). Background controls MUST be inert to the keyboard and to assistive technology.
- The background SHOULD remain **visually present and readable** — dimmed or scrimmed for focus, not blanked out. A user answering "delete this invoice?" should still be able to see *which* invoice. Do not hide the context the mode is asking about.
- Modals SHOULD stay **small and focused** on the single decision or task (Material, Apple HIG). A modal that grows into a full secondary application is a sign the interaction wanted a page or a nonmodal panel — reconsider against §3-1.
- The dialog MUST be correctly announced: `role="dialog"` with `aria-modal="true"` and a programmatic label (`aria-labelledby`/`aria-label`), per the ARIA pattern, so its purpose and boundary are clear to assistive technology.

::: tip Contain the focus, not the understanding
Focus trapping is a mechanism for correctness — it keeps keyboard and screen-reader users from wandering into an inert background. It is not a licence to hide that background from the eye. Trap the *interaction*; keep the *information* visible.
:::

## 4. What "Modeless by Default" Requires, Per Interaction

Before an interaction that introduces a mode is called finished, it MUST satisfy all of the following. This is the checklist the practices above add up to — the bar the [Quality Gate](/quality-gate) holds a mode to:

| Requirement | The question it answers |
| ----------- | ----------------------- |
| **Justified case** | Does this modal fit one of the three cases — irreversible confirmation, single submission unit, physically-exclusive interaction? (§3-1) |
| **Recorded trade-off** | Is the reason for the modal written in the PR or an ADR? (§3-1) |
| **URL state** | Is the place addressable, shareable, and reload-survivable via the URL? (§3-2) |
| **Multiple exits** | Do Escape *and* a background click both close it? (§3-3) |
| **Preserved input** | Does closing keep the user's in-progress input rather than discarding it? (§3-3) |
| **Focus trapped** | Is keyboard/AT focus contained in the modal and returned on close? (§3-4) |
| **Readable background** | Is the context behind the modal still visible? (§3-4) |
| **Announced correctly** | Does the dialog carry `role`, `aria-modal`, and a label? (§3-4) |

An interaction that works but fails any row above is not finished — it has introduced a mode without earning it, or built a mode that traps the person inside it.

## 5. Related Guidelines

- [Design Guidelines](/design-guidelines) — the umbrella this policy sits under.
- [Interaction Design](/interaction-design) — the broader interaction thread this page sharpens to a single decision.
- [Accessibility](/accessibility) — the focus, dismissal, and announcement obligations a mode must still meet when it exists (§3-3, §3-4).
- [Quality Gate](/quality-gate) — where the per-interaction checklist in §4 is held.

## 6. References

Named, published practice this policy is grounded in — each a documented source an SME can adopt directly.

**Modelessness**

- Jef Raskin — *The Humane Interface: New Directions for Designing Interactive Systems* (2000) — modes as a principal cause of user error; the case for a modeless interface — <https://en.wikipedia.org/wiki/The_Humane_Interface>
- Larry Tesler — "Don't mode me in" / NOMODES — a career-long campaign against modal interfaces — <https://www.nomodes.com/>

**Modal-dialog usability**

- Nielsen Norman Group — Modal & Nonmodal Dialogs: When (& When Not) to Use Them — <https://www.nngroup.com/articles/modal-nonmodal-dialog/>
- Nielsen Norman Group — 10 Usability Heuristics for User Interface Design (heuristic 3, *User control and freedom*) — <https://www.nngroup.com/articles/ten-usability-heuristics/>

**Platform dialog guidance**

- Apple — Human Interface Guidelines: Modality — <https://developer.apple.com/design/human-interface-guidelines/modality>
- Google — Material Design 3: Dialogs — <https://m3.material.io/components/dialogs/guidelines>

**Accessibility**

- W3C WAI-ARIA Authoring Practices Guide — Dialog (Modal) Pattern — <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>
