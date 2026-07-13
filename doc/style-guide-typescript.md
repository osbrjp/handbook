---
title: "TypeScript Style Guide"
section: "Guideline"
parent: "style-guide"
nav_label: "TypeScript"
sort: 62
visibility: internal
---

# TypeScript Style Guide

Per-language style guide for TypeScript. Shared rules: the
[Coding Style Guide](/style-guide). Requirement levels follow
RFC 2119; tags 🌎 / 🏠 are defined there.

[[TOC]]

## 1. Formatting 🌎

* Code MUST be formatted with Prettier. Editors MUST format on save.

*Note: Prettier is used by Google's `gts`. [Biome](https://biomejs.dev/) is a
rising 2026 alternative; Prettier remains the default.*

## 2. Type Safety 🌎

* `tsconfig` MUST enable `strict`. Implicit `any` MUST NOT be used.
* `type` aliases and discriminated unions SHOULD be preferred over `class`
  hierarchies (§5).
* A [**Brand Type**](/technical-glossary#brand-type) MUST be used to give
  [**Nominal Typing**](/technical-glossary#nominal-typing) where two structurally
  identical types must not be interchangeable (e.g. `UserId` vs `OrderId`).

## 3. Immutability 🏠

* Variables MUST be declared `const`. `let` MAY be used only where reassignment
  is required. `var` MUST NOT be used.
* Data types MUST be deeply `readonly` (`readonly` members, `ReadonlyArray<T>`,
  `Readonly<T>`, `as const` for literals). A mutable type MUST be used only where
  in-place mutation is intended.
* Function parameters MUST NOT be mutated; spread SHOULD be preferred over
  `Object.assign`.
* Immutability MUST be enforced by
  [`eslint-plugin-functional`](https://github.com/eslint-functional/eslint-plugin-functional).

*Rationale: `const` prevents rebinding only, not content mutation. Deep
`readonly` is stricter than Google/Airbnb.*

## 4. Total Types 🏠

* Project code MUST NOT use `undefined` in its own types.
* Domain and application types MUST NOT signal absence with `undefined` or a bare
  `null` — use [**Option (Maybe)**](/technical-glossary#option-maybe). Optional
  properties (`x?: T`) and `T | undefined` unions MUST NOT mean "maybe absent."
* Functions MUST return `T` or `Option<T>`, never `T | undefined`.
* `null` MAY appear at the boundary (DB rows, JSON, the DOM, `Map.get`,
  third-party APIs). It MUST be converted to `Option<T>` in the adapter before
  entering the pure core.
* `tsconfig` MUST enable `strictNullChecks` and `noUncheckedIndexedAccess`.

❌ "Maybe absent" leaks out of the function as `undefined`:

```ts
function findUser(id: UserId): User | undefined {
  return users.get(id); // callers must remember to check
}
```

✅ Absence is explicit in the type:

```ts
import { type Option, some, none } from "./option";

function findUser(id: UserId): Option<User> {
  const user = users.get(id);
  return user === undefined ? none : some(user);
}
```

*Rationale: `null` is a defined value and the DB-native representation of
absence; `undefined` is accidental "not set." Divergent from Google, which
treats `undefined` as normal; not a language-wide ban.*

## 5. Classes 🏠

* `class` MUST NOT be used in project code; prefer functions, plain data, and
  closures.
* Classes MAY be used where a framework or library requires them.

❌ State and behavior bundled in a class:

```ts
class Rectangle {
  constructor(private readonly w: number, private readonly h: number) {}
  area(): number {
    return this.w * this.h;
  }
}
```

✅ Plain data plus a function:

```ts
type Rectangle = { readonly w: number; readonly h: number };

const area = (r: Rectangle): number => r.w * r.h;
```

*Rationale: divergent from mainstream — classes are first-class in TypeScript;
Google discourages only static-only namespacing classes.*

## 6. Error Handling 🏠

* Failures MUST be modeled as a
  [**Result (Either)**](/technical-glossary#result-either):

  ```ts
  type Result<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E[] };
  ```

* The `Result` union SHOULD be hand-rolled (KISS / YAGNI).
  [`neverthrow`](https://github.com/supermacro/neverthrow) MAY be adopted only
  where its combinators (`map` / `andThen` / `mapErr` / `ResultAsync`) are needed
  at scale.
* IO / `fetch` / DB calls MUST be wrapped at the boundary and return a `Result`;
  the pure core MUST stay free of `try`/`catch`.

❌ Failure is thrown, and a caller can ignore it:

```ts
async function loadUser(id: UserId): Promise<User> {
  const res = await fetch(`/users/${id}`);
  if (!res.ok) throw new Error("request failed");
  return res.json();
}
```

✅ Failure is returned as a `Result` the caller must handle:

```ts
async function loadUser(id: UserId): Promise<Result<User, string>> {
  try {
    const res = await fetch(`/users/${id}`);
    if (!res.ok) return { ok: false, error: ["request failed"] };
    return { ok: true, value: await res.json() };
  } catch {
    return { ok: false, error: ["network error"] };
  }
}
```

*Rationale: divergent from Google's TS guide, which prefers throwing exceptions.*

## References

* Google TypeScript Style Guide — <https://google.github.io/styleguide/tsguide.html>
* TypeScript Handbook, Classes — <https://www.typescriptlang.org/docs/handbook/2/classes.html>
* `tsconfig` `strict` reference — <https://www.typescriptlang.org/tsconfig/strict.html>
* Airbnb JavaScript Style Guide — <https://github.com/airbnb/javascript>
* Google `gts` — <https://github.com/google/gts>
* `eslint-plugin-functional` — <https://github.com/eslint-functional/eslint-plugin-functional>
* Biome — <https://biomejs.dev/>
