# HTML & CSS Style Guide

Per-language style guide for HTML and CSS. Shared rules: the
[Coding Style Guide](/style-guide). Requirement levels follow
RFC 2119; tags 🌎 / 🏠 are defined there.

[[TOC]]

## 1. Formatting 🌎

* HTML and CSS MUST be formatted with Prettier. Editors MUST format on save.
* Prettier's shared [`.prettierrc.json`](https://github.com/osbrjp/handbook/tree/main/templates)
  applies unchanged: Prettier formats `.html`, `.css`, `.scss`, and `.less` out
  of the box, so no extra config is needed.

*Note: Prettier is the single formatter across TypeScript, Markdown, HTML, and
CSS. Stylelint MAY be added for lint rules Prettier does not cover (e.g.
declaration order, disallowed units), but MUST NOT re-implement formatting.*

*Note: Prettier is mandated because its HTML formatter is the only stable one.
[Biome](https://biomejs.dev/) (CSS stable, HTML still experimental) and
[oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) (beta, ~30× faster) are
Prettier-compatible alternatives to revisit once their HTML support stabilizes.
A toolchain-wide switch MUST be an [**ADR**](/technical-glossary#adr-architecture-decision-record),
not a per-page choice.*

## 2. Semantic HTML 🌎

* Elements MUST be chosen for meaning, not appearance. Landmarks
  (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`) and
  controls (`<button>`, `<a>`, `<label>`) MUST be used over generic containers.
* A `<div>` or `<span>` MUST NOT be used where a semantic element exists.
* An action that navigates MUST be an `<a href>`; an action that mutates state
  MUST be a `<button>`.

❌ A styled `<div>` reimplements a button — no keyboard focus, no Enter/Space,
invisible to assistive tech:

```html
<div class="btn" onclick="save()">Save</div>
```

✅ The native element carries behavior and semantics for free:

```html
<button type="button" class="btn" onclick="save()">Save</button>
```

## 3. Accessibility 🏠

* Every `<img>` MUST carry an `alt` attribute; decorative images MUST use
  `alt=""`.
* Every form control MUST have an associated `<label>` (wrapping or `for`/`id`).
* Interactive elements MUST be reachable and operable by keyboard alone.
* Color MUST NOT be the sole carrier of meaning, and text MUST meet WCAG 2.2 AA
  contrast (4.5:1 for body text).
* ARIA MUST be a last resort: a native element MUST be preferred over a `<div>`
  plus `role` and re-implemented behavior.
* Non-essential motion (animation, transition, auto-scroll) MUST be disabled
  under `prefers-reduced-motion: reduce`.
* Where the design supports it, theming SHOULD honor `prefers-color-scheme` so
  the UI follows the user's light/dark setting.

❌ An icon-only control gives assistive tech nothing to announce:

```html
<button type="button">
  <svg><!-- trash icon --></svg>
</button>
```

✅ An accessible name is provided:

```html
<button type="button" aria-label="Delete item">
  <svg aria-hidden="true"><!-- trash icon --></svg>
</button>
```

*Rationale: stricter than mainstream, which treats accessibility as optional
polish. OSBR treats WCAG 2.2 AA as a baseline requirement, not an enhancement.*

## 4. Document Structure 🌎

* Every document MUST declare `<!doctype html>` and set `<html lang="…">`.
* The `<head>` MUST include `<meta charset="utf-8">` and
  `<meta name="viewport" content="width=device-width, initial-scale=1">` —
  without the viewport tag the responsive rules in §8 do not apply on mobile.
* There MUST be exactly one `<h1>` per page, and heading levels MUST NOT skip
  (`<h1>` → `<h2>` → `<h3>`, never `<h1>` → `<h3>`).
* Documents MUST be valid HTML: elements MUST be nested legally (no `<div>`
  inside `<p>`, no block-level content inside inline elements).
* Boolean attributes MUST be written bare (`disabled`, not `disabled="true"`).

## 5. Styling Separation 🏠

* Presentation MUST live in CSS. Inline `style` attributes MUST NOT be used
  except for a dynamic value a stylesheet cannot express (e.g. a computed
  `--progress` custom property).
* HTML MUST NOT carry presentational attributes (`width`, `align`, `bgcolor`);
  use CSS.
* JavaScript MUST NOT set styles directly; it MUST toggle classes or set custom
  properties instead.

❌ Presentation is hard-wired into markup and script:

```html
<p style="color: red; margin-top: 20px">Payment failed</p>
```

✅ State is a class; appearance is CSS:

```html
<p class="alert alert--error">Payment failed</p>
```

*Rationale: divergent from framework conventions (utility-class and inline-style
libraries) where style-in-markup is idiomatic. Separation keeps the cascade as
the single source of presentation. Utility-first frameworks (§9) are the
sanctioned exception.*

## 6. Selectors & Specificity 🏠

* Styling SHOULD be applied through classes. IDs and element (tag) selectors
  SHOULD NOT be used to apply styles; reserve IDs for anchors and `for`/`aria`
  references.
* `!important` MUST NOT be used in project code. It MAY appear only to override a
  third-party style that cannot be reached otherwise, with a comment naming the
  source.
* Selector nesting SHOULD stay at most two levels deep; deep descendant chains
  SHOULD NOT be used.

❌ High specificity and nesting that nothing can override cleanly:

```css
#sidebar ul li a.active {
  color: blue !important;
}
```

✅ A single flat class, specificity 0-1-0:

```css
.nav-link--active {
  color: blue;
}
```

*Rationale: a strong default, not an absolute. Flat, class-only selectors keep
specificity predictable and the cascade debuggable; deviate only with reason.*

## 7. Naming 🏠

* Class names SHOULD follow BEM: `block`, `block__element`,
  `block--modifier`. Names MUST be kebab-case.
* Class names SHOULD describe the component or its state, not its appearance:
  `.btn--primary`, not `.btn--blue`.

❌ Appearance-based names break the moment the design changes:

```html
<div class="box red-border big-text">…</div>
```

✅ Names describe role and state:

```html
<div class="alert alert--error alert--prominent">…</div>
```

*Rationale: BEM is one convention among several (also SMACSS, utility-first).
OSBR recommends BEM as the default so class names read the same across
repositories; a repo MAY choose another convention and apply it consistently.*

## 8. Layout, Units & Properties 🌎

* Layout MUST use Flexbox or Grid. Floats MUST NOT be used for layout, and
  absolute positioning MUST NOT be used to fake a normal-flow layout.
* Logical properties (`margin-inline`, `padding-block`, `inset`) SHOULD be
  preferred over physical ones (`margin-left`, `top`) so layouts adapt to
  writing direction.
* `rem` MUST be used for font sizes and `rem`/`%`/`fr`/viewport units for
  spacing and layout; fixed `px` MUST NOT be used for type. `px` MAY be used for
  borders and hairlines.
* Media queries SHOULD be authored mobile-first (`min-width`).

❌ Fixed pixel type ignores the user's font-size preference:

```css
.card__title {
  font-size: 18px;
}
```

✅ Type scales with the root font size:

```css
.card__title {
  font-size: 1.125rem;
}
```

## 9. Custom Properties & Frameworks 🏠

* Design tokens (color, spacing, type scale, radius) MUST be defined once as CSS
  custom properties on `:root` and referenced through `var()`. Raw hex colors
  and magic numbers MUST NOT be repeated across rules.
* When a utility-first framework (e.g. Tailwind) is adopted, its config MUST be
  the token source, and §5's inline-style rule is satisfied by utility classes;
  arbitrary-value escapes (`class="mt-[13px]"`) MUST NOT be used where a token
  exists.

❌ The same brand color is copied into every rule that needs it:

```css
.btn { background: #0055ff; }
.link { color: #0055ff; }
```

✅ One token, referenced everywhere:

```css
:root { --color-brand: #0055ff; }

.btn { background: var(--color-brand); }
.link { color: var(--color-brand); }
```

*Rationale: stricter than the platform, which imposes no token discipline.
Centralized tokens make theming and design-system changes a one-line edit.*

## 10. Performance 🌎

* `<img>` and `<video>` MUST carry intrinsic `width` and `height` (or
  `aspect-ratio` in CSS) so the browser reserves space and avoids layout shift
  (Cumulative Layout Shift, CLS).
* Below-the-fold images MUST use `loading="lazy"`; the Largest Contentful Paint
  (LCP) image MUST NOT be lazy-loaded.
* Scripts MUST use `defer` (or `type="module"`) so parsing is not blocked;
  render-blocking `<script>` in `<head>` MUST NOT be used.

❌ No dimensions and a render-blocking script — the layout jumps and paint stalls:

```html
<head>
  <script src="/app.js"></script>
</head>
<body>
  <img src="/hero.jpg" alt="Product" />
</body>
```

✅ Space is reserved and the script defers:

```html
<head>
  <script src="/app.js" defer></script>
</head>
<body>
  <img src="/hero.jpg" alt="Product" width="1200" height="600" />
</body>
```

## 11. Security 🌎

* Every `target="_blank"` link MUST set `rel="noopener noreferrer"` so the opened
  page cannot reach the opener via `window.opener`.
* HTML and comments MUST NOT contain secrets, credentials, or internal-only data
  — everything in markup ships to the client.

❌ The new tab can hijack the opener, and a token leaks in a comment:

```html
<!-- TODO: rotate before launch — api key sk_live_9f2a… -->
<a href="https://partner.example" target="_blank">Partner portal</a>
```

✅ The link is isolated and no secret is shipped:

```html
<a href="https://partner.example" target="_blank" rel="noopener noreferrer">
  Partner portal
</a>
```

## 12. Internationalization 🌎

Many OSBR projects ship in more than one language (typically English and
Japanese). Markup and CSS MUST support this from the start.

* The document `lang` (§4) MUST reflect the actual content language, and any
  inline run in another language MUST carry its own `lang` (e.g. an English term
  inside Japanese copy). Assistive tech and font selection depend on it.
* Fixed `px` heights and `width`s MUST NOT be used to size text containers:
  translated strings vary in length, and Japanese wraps differently. Let content
  size the box (§8 units).
* `font-family` MUST include a CJK fallback for any surface that renders
  Japanese; a Latin-only stack has no glyphs for Japanese text.
* Japanese line-breaking MUST NOT use `word-break: break-all` (it breaks mid-word
  arbitrarily). Use the defaults or `line-break: strict`, and `overflow-wrap`
  only where long unbroken strings must be forced.
* User-facing copy MUST live in text, not baked into images — text in images
  cannot be translated or read by assistive tech.

❌ A Latin-only font, a fixed-height box, and mid-character breaking mangle
Japanese:

```html
<p lang="ja" class="notice">お支払いが完了しました。</p>
```

```css
.notice {
  height: 20px;              /* clips when the translation is taller */
  font-family: Arial, sans-serif;   /* no Japanese glyphs */
  word-break: break-all;     /* breaks mid-word */
}
```

✅ Content-sized box, CJK fallback, and script-aware breaking:

```css
.notice {
  font-family: system-ui, "Noto Sans JP", "Hiragino Sans", "Yu Gothic",
    sans-serif;
  line-break: strict;
}
```

## References

* Prettier — <https://prettier.io/docs/en/options.html>
* HTML Living Standard (WHATWG) — <https://html.spec.whatwg.org/multipage/>
* MDN, HTML element reference — <https://developer.mozilla.org/en-US/docs/Web/HTML/Element>
* WCAG 2.2 — <https://www.w3.org/TR/WCAG22/>
* WAI-ARIA Authoring Practices — <https://www.w3.org/WAI/ARIA/apg/>
* Google HTML/CSS Style Guide — <https://google.github.io/styleguide/htmlcssguide.html>
* BEM Methodology — <https://getbem.com/>
* MDN, CSS logical properties — <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values>
* MDN, Using CSS custom properties — <https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties>
* MDN, `prefers-reduced-motion` — <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>
* MDN, `prefers-color-scheme` — <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme>
* web.dev, Optimize Cumulative Layout Shift — <https://web.dev/articles/optimize-cls>
* web.dev, Browser-level image lazy loading — <https://web.dev/articles/browser-level-image-lazy-loading>
* MDN, `rel="noopener"` — <https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener>
* MDN, HTML `lang` attribute — <https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang>
* W3C, Language declaration (i18n) — <https://www.w3.org/International/questions/qa-html-language-declarations>
* MDN, `line-break` — <https://developer.mozilla.org/en-US/docs/Web/CSS/line-break>
* W3C, Approaches to line breaking (CJK) — <https://www.w3.org/International/articles/typography/linebreak>
