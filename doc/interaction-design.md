# Interaction Design

This is the standard OSBR holds interaction design to, and the consistency
companion to the [Design Guidelines](/design-guidelines): **the interactive
behaviour of a component — how it loads, fails, empties, succeeds, and responds
to the keyboard — is defined once, before the second screen is built, and reused
everywhere.** A user should learn the product a single time. When they have
learned what a loading state looks like, what an error says and where, what an
empty list offers, and which key dismisses a thing, that knowledge MUST carry to
every other screen unchanged. Any screen that behaves differently forces the
user to re-learn, and re-learning is a tax the design levied instead of paying
itself.

We do not invent our own interaction conventions per screen. We stand on named,
published practice — the Nielsen Norman Group's *consistency and standards*
heuristic, the major design systems (Google Material, IBM Carbon, Shopify
Polaris, Atlassian) that codify component states, and the W3C WAI-ARIA Authoring
Practices for keyboard interaction — and apply them as a single shared standard
rather than a per-screen decision. This page is the consistency companion to [UI
That Requires No Manual](/self-explanatory-ui) (that page makes *one* screen
explain itself; this page makes *every* screen explain itself *the same way*),
to [Modeless Design](/modeless-design) (a consistent exit gesture only helps if
it is the same gesture everywhere), and to [Accessibility](/accessibility)
(keyboard and focus consistency is where these standards meet).

Interaction design is where OSBR's values become something the user can feel.
**Be Nice**: define the standard early and write down every deliberate
exception, so the next builder inherits the convention instead of guessing at
it. **Be Kind**: the payoff is literal — the user learns the product *once, not
once per screen*; it is unkind to make someone who mastered one screen feel lost
on the next because the same button now sits elsewhere, the same error now
speaks differently, or the same key now does nothing. **Be Strong**: refuse to
let the second screen freelance its own loading spinner because a shared one was
not ready yet.

## How to read this policy

* **Requirement levels** follow RFC 2119, as elsewhere in the [Design
  Guidelines](/design-guidelines). **MUST** / **MUST NOT** are absolute.
  **SHOULD** / **SHOULD NOT** state a strong default overridable only with a
  documented reason. **MAY** marks a free choice.
* **Named practice.** Where a rule adopts an industry practice, the practice is
  named inline and cited under [References](#references). We adopt the *criteria*
  of these design systems and right-size them for an SME — we do not adopt the
  scale or org behind their reference setups.

[[TOC]]

## 1. Goal

The goal is a product the user learns **once, not once per screen.** Every
interactive component behaves predictably: the same state looks the same, the
same action produces the same result, and the same key does the same thing, no
matter which screen it appears on. The user builds one mental model early and
spends it everywhere.

The root idea is the Nielsen Norman Group's fourth usability heuristic,
**consistency and standards**: "users should not have to wonder whether
different words, situations, or actions mean the same thing." A product that
answers that question differently on each screen makes the user carry a separate
rule for every page. A product that answers it once lets a habit formed on
screen one transfer, untouched, to screen fifty. This is why the standard must
be set **before the second screen** — the first screen alone establishes no
convention; the second is where consistency is either won or permanently lost,
because every later screen copies whichever way the divergence went.

## 2. Responsibility

Whoever builds the interactive layer owns its consistency with the rest of the
product — not just its correctness in isolation. Concretely, that person or pair
MUST:

- **Define the four interactive states** — loading, error, empty, success — as a
  shared, reusable standard **before the second screen** consumes them, not
  re-improvise them per screen (§3-1, §3-2).
- **Standardise keyboard interaction** so the same keys do the same things on
  every equivalent component, following the WAI-ARIA Authoring Practices for
  each pattern (§3-3).
- **Reuse the design system's components and tokens** rather than
  re-implementing a one-off variant of something that already exists (§3-4).
- **Record every deliberate deviation** in the design system's interaction notes
  — what differs, on which component, and why — so the exception is visible and
  auditable, never silent divergence (§3-4).

This is not a hand-off to a separate "design system" team who reconcile the
screens at the end. The person building the second screen is the person who
either upholds the convention or records the break, because those are the same
decision made at the same moment.

## 3. Practices

### 3-1. Define the four interactive states once, before the second screen

Every component that fetches, shows, or accepts data lives in four interactive
states, not one. The major design systems all treat these as first-class, named
things to be designed deliberately — not incidental moments. IBM Carbon
documents [empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/)
and [loading/skeleton states](https://carbondesignsystem.com/patterns/loading-pattern/)
as reusable patterns; Shopify Polaris ships a [Skeleton content set](https://polaris.shopify.com/components/feedback-indicators/skeleton-thumbnail)
and [empty-state guidance](https://polaris.shopify.com/patterns/empty-states);
Atlassian's Design System codifies [empty state](https://atlassian.design/patterns/empty-state)
and messaging patterns; Google Material specifies [loading indicators](https://m3.material.io/components/loading-indicator/guidelines)
and [progress indicators](https://m3.material.io/components/progress-indicators/guidelines).
The point OSBR takes from all four: **the states are components, defined once,
not decisions re-made on each screen.**

| State | What it must do, identically everywhere | Grounded in |
| ----- | --------------------------------------- | ----------- |
| **Loading** | Same indicator, same placement, same threshold for showing it — a shared skeleton or progress component, not a per-screen spinner | Material [loading](https://m3.material.io/components/loading-indicator/guidelines), Carbon [loading](https://carbondesignsystem.com/patterns/loading-pattern/), Polaris [skeleton](https://polaris.shopify.com/components/feedback-indicators/skeleton-thumbnail) |
| **Error** | Same tone, same structure (what happened + what to do), same placement relative to cause | Carbon / Atlassian messaging patterns; see [self-explanatory-ui §3-3](/self-explanatory-ui) |
| **Empty** | Same layout, same "here's the first action" shape, on every empty collection | Carbon [empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/), Polaris [empty states](https://polaris.shopify.com/patterns/empty-states), Atlassian [empty state](https://atlassian.design/patterns/empty-state) |
| **Success** | Same confirmation mechanism (toast, inline, banner) for the same class of action, everywhere | Material / Polaris feedback guidance |

- These four states MUST be defined as **shared components or documented
  patterns before the second screen is built.** The first screen sets no
  precedent alone; the second is the moment consistency is decided, so the
  standard must exist by then.
- A component's states MUST be **reused, not re-created.** A second list that
  invents its own empty state instead of using the shared one is a divergence
  even if it looks similar — "similar" is exactly what the user notices and
  mistrusts.
- **Skeleton screens are the default loading treatment** for content that has a
  known layout (Material, Carbon, Polaris all provide them): they preserve the
  page's shape and read as "arriving", where a bare spinner reads as "stuck". Use
  the shared skeleton, not a bespoke one.
- Each state's *content* still follows [UI That Requires No
  Manual](/self-explanatory-ui) — this page governs that the state exists, is
  shared, and is identical across screens; that page governs that its copy is in
  the user's words.

One screen can look however it looks — there is nothing yet to be consistent
*with*. The second screen is where the product either reuses the first screen's
behaviour or forks it. If the shared states are not defined by the time the
second screen is built, the fork happens by default, and every later screen
inherits the inconsistency. Define first, build second.

### 3-2. Same state, same signal — no per-screen dialects

Consistency and standards (NN/g heuristic 4) is violated not only by different
*words* but by the same situation *signalled differently*. A user who learns
that a green toast means "saved" should never meet a green inline banner meaning
the same thing two screens later, or a silent success a screen after that. The
signal for a state is part of the product's vocabulary, and a vocabulary with
synonyms is a vocabulary the user cannot trust.

- The **same class of outcome MUST use the same signal** across the product: all
  transient successes as toasts, or all as inline confirmations — pick one per
  class and hold it. Do not mix dialects for the same meaning.
- Loading MUST use a **consistent threshold and treatment**: if a delay under ~1
  second shows nothing on one screen, it shows nothing on all; skeletons for
  structured content, indeterminate progress for unknown-length waits,
  determinate progress when the total is known (Material [progress
  indicators](https://m3.material.io/components/progress-indicators/guidelines))
  — applied the same way everywhere.
- Error placement MUST be **consistent with its cause**: field errors at the
  field, form errors at the form, system errors in the shared system-message
  surface — the same rule on every screen, never a banner here and an inline
  message there for the same kind of error.
- Empty states for the same *kind* of collection SHOULD share one layout and one
  "first action" shape, so an empty list always reads the same way and always
  offers the way forward in the same place.

Every time the same meaning wears a different costume, the user has to stop and
check whether it really is the same meaning. That hesitation is the exact cost
heuristic 4 exists to remove. One signal per meaning, product-wide, is what lets
recognition replace re-checking.

### 3-3. Standardise keyboard interaction to the ARIA Authoring Practices

Keyboard behaviour is the most invisible place inconsistency hides and the most
punishing place to get it wrong — a keyboard or screen-reader user navigates
entirely by learned key conventions, so a component that binds keys its own way
strands them. The W3C **WAI-ARIA Authoring Practices Guide (APG)** publishes the
[keyboard interaction](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
contract for every common pattern — menu, dialog, tabs, combobox, listbox,
disclosure, and the rest. OSBR adopts the APG's keyboard model as the standard
rather than deciding key bindings per component; this is the interaction side of
[Accessibility](/accessibility).

- Each interactive pattern MUST implement the **keys the APG specifies for that
  pattern**, unchanged: `Tab`/`Shift+Tab` to move between widgets; arrow keys to
  move *within* a composite widget (menu, listbox, tab list, radio group);
  `Enter`/`Space` to activate; `Escape` to dismiss or cancel; `Home`/`End` where
  the pattern defines them. See the APG's
  [patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) index for the exact
  contract per component.
- The **same pattern MUST use the same keys everywhere.** Every menu in the
  product responds to arrow keys the same way; every dismissible surface
  responds to `Escape` (as [Modeless Design §3-3](/modeless-design) also
  requires). A user's keyboard habit, once formed, MUST transfer to every
  instance of that pattern.
- **Focus order MUST follow reading order**, and focus MUST be visible: a
  keyboard user has to see where they are. This is a baseline, not a per-screen
  judgement (WCAG 2.4.7 *Focus Visible*, 2.4.3 *Focus Order*).
- Roving `tabindex` or `aria-activedescendant` MUST be used for composite widgets
  so that `Tab` lands on the widget and arrow keys move within it, per the APG —
  never a flat tab stop on every child, which makes one component behave unlike
  every other of its kind.
- Custom controls MUST carry the **role, state, and properties** the APG names
  for the pattern they imitate (`role`, `aria-expanded`, `aria-selected`,
  `aria-modal`, etc.), so assistive technology announces them consistently.

The APG exists precisely so that every product's menu, dialog, and tab list
behave the same way — a user's keyboard knowledge is portable *between* products
because of it. Diverging inside a single product is worse than diverging between
products: it breaks the one place the user was entitled to assume consistency.
Adopt the published contract; do not author a private one.

### 3-4. Reuse the system, and record every deviation in the interaction notes

Consistency is not sustained by willpower on each screen — it is sustained by a
shared system that makes the consistent thing the easy thing, plus an honest
record of where reality had to depart from it. Every mature design system pairs
reusable components with documented usage; OSBR requires the same, including the
departures.

- Builders MUST **reuse the design system's existing component, state, and
  token** rather than re-implement a near-duplicate. A one-off variant of a
  component the system already provides is a divergence even when it is prettier
  — it splits the user's mental model and doubles the maintenance surface.
- When a screen genuinely **must deviate** — a novel interaction the system has
  no pattern for, a constraint the standard did not anticipate — the deviation
  MUST be **recorded in the design system's interaction notes**: which component,
  what differs from the standard, and why the standard did not serve. An
  unrecorded deviation is indistinguishable from a mistake and will be copied as
  if it were the convention.
- A recurring deviation is a **signal to update the standard**, not to keep
  forking. If the same exception appears three times, the standard is wrong or
  incomplete — promote the exception into the shared component so it stops being
  an exception.
- The interaction notes are the **single source of truth** for "how does this
  behave": a new builder reads them to inherit the conventions instead of
  reverse-engineering them from whichever screen they happened to open first.

Deviating is sometimes right — no standard anticipates everything. What is never
right is deviating *silently*, because the next person cannot tell your
considered exception from an accident, and they will propagate whichever they
find. Writing the deviation down is what keeps the standard a standard: the
exceptions stay countable, reviewable, and reversible.

## 4. What "Learn Once" Requires, Per Component

Before an interactive component is called finished, it MUST satisfy all of the
following. This is the checklist the practices above add up to, and the surface
the [Quality Gate](/quality-gate) holds interactive work to:

| Requirement | The question it answers |
| ----------- | ----------------------- |
| **States defined early** | Are loading, error, empty, and success defined as shared components *before the second screen*? (§3-1) |
| **States reused** | Does this component use the shared states, not a re-created near-duplicate? (§3-1) |
| **Skeleton loading** | Does structured content load via the shared skeleton, not a bespoke spinner? (§3-1) |
| **One signal per meaning** | Does the same class of outcome use the same signal everywhere in the product? (§3-2) |
| **Consistent error placement** | Is each kind of error shown in the same place relative to its cause on every screen? (§3-2) |
| **APG keyboard contract** | Does the component implement exactly the keys the WAI-ARIA APG specifies for its pattern? (§3-3) |
| **Same keys everywhere** | Does every instance of this pattern respond to the same keys? (§3-3) |
| **Visible, ordered focus** | Is focus visible and in reading order for keyboard users? (§3-3) |
| **System reuse** | Does it reuse the design system's component and tokens rather than a one-off variant? (§3-4) |
| **Deviation recorded** | If it departs from the standard, is the departure written in the interaction notes with its reason? (§3-4) |

A component that works in isolation but fails any row above is not finished — it
behaves correctly on its own screen while quietly teaching the user that this
product must be re-learned page by page.

## References

Named, published practice this policy is grounded in — each a documented source
an SME can adopt directly.

**Consistency as a principle**

- Nielsen Norman Group — 10 Usability Heuristics for User Interface Design (heuristic 4, *Consistency and standards*) — <https://www.nngroup.com/articles/ten-usability-heuristics/>
- Nielsen Norman Group — Maintain Consistency and Adhere to Standards (Usability Heuristic 4) — <https://www.nngroup.com/articles/consistency-and-standards/>

**Design systems: component states**

- Google — Material Design 3: Loading indicator — <https://m3.material.io/components/loading-indicator/guidelines>
- Google — Material Design 3: Progress indicators — <https://m3.material.io/components/progress-indicators/guidelines>
- IBM — Carbon Design System: Empty states pattern — <https://carbondesignsystem.com/patterns/empty-states-pattern/>
- IBM — Carbon Design System: Loading pattern (skeleton states) — <https://carbondesignsystem.com/patterns/loading-pattern/>
- Shopify — Polaris: Empty states pattern — <https://polaris.shopify.com/patterns/empty-states>
- Shopify — Polaris: Skeleton content — <https://polaris.shopify.com/components/feedback-indicators/skeleton-thumbnail>
- Atlassian — Design System: Empty state pattern — <https://atlassian.design/patterns/empty-state>

**Keyboard interaction**

- W3C WAI-ARIA Authoring Practices Guide — Developing a Keyboard Interface — <https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/>
- W3C WAI-ARIA Authoring Practices Guide — Patterns (per-component keyboard contracts) — <https://www.w3.org/WAI/ARIA/apg/patterns/>
- W3C — WCAG 2.1: 2.4.3 Focus Order & 2.4.7 Focus Visible — <https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html>

**Skeleton / loading patterns**

- Nielsen Norman Group — Skeleton Screens & Progress Indicators (system status, perceived performance) — <https://www.nngroup.com/articles/progress-indicators/>

**Related OSBR standards**

- [Design Guidelines](/design-guidelines) — the parent design policy this standard serves; RFC 2119 requirement levels.
- [UI That Requires No Manual](/self-explanatory-ui) — makes a single screen explain itself; this page makes every screen explain itself *the same way*, so the four states and their copy stay identical across the product.
- [Modeless Design](/modeless-design) — a consistent exit gesture (`Escape`, background click) only reduces load if it is the same gesture on every modal; this page is why "the same everywhere" is the rule.
- [Accessibility](/accessibility) — the keyboard, focus, and ARIA baseline §3-3 standardises across every instance of a pattern.
- [Quality Gate](/quality-gate) — the gate that holds interactive work to the §4 "learn once" checklist.
