---
title: "Golang Style Guide"
section: "Guideline"
nav_label: "Golang"
sort: 63
visibility: internal
---

Per-language style guide for Go. Shared rules: the
[Coding Style Guide](/style-guide). Requirement levels follow
RFC 2119; tags 🌎 / 🏠 are defined there.

[[TOC]]

## 1. Formatting 🌎

* Code MUST be formatted with `gofmt`. A `gofmt` diff MUST block review.
* Code MUST follow [Effective Go](https://go.dev/doc/effective_go) and
  [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments).

## 2. Error Handling 🌎

* Functions MUST return `error`; callers MUST handle it at the call site:

  ```go
  v, err := doThing()
  if err != nil {
      return fmt.Errorf("doThing: %w", err)
  }
  ```

* Errors MUST be wrapped with `%w` to add context. Errors MUST NOT be discarded
  with `_`.
* `panic` MUST NOT be used for normal error handling.
* `panic` MAY be used for unrecoverable bugs or program init, but MUST NOT cross
  a package boundary — convert it to an `error` first.

❌ `panic` used for an expected failure crashes the caller:

```go
func mustLoad(id string) User {
    u, err := db.Load(id)
    if err != nil {
        panic(err)
    }
    return u
}
```

✅ The failure is returned as an `error` the caller must handle:

```go
func load(id string) (User, error) {
    u, err := db.Load(id)
    if err != nil {
        return User{}, fmt.Errorf("load %s: %w", id, err)
    }
    return u, nil
}
```

*Rationale: errors-as-values is mandated by Go (Go Code Review Comments, Uber,
Effective Go). Go's `error` return is the idiomatic
[**Result (Either)**](/technical-glossary#result-either).*

## 3. Mutation 🌎 *(scoped)*

* Mutable global state MUST be avoided; use dependency injection.
* Slices and maps MUST be copied at API boundaries to avoid aliasing.

*Note: Go idiom permits local mutation; the constraint is on globals and
boundary aliasing.*

## 4. Interfaces 🌎

* Interfaces SHOULD be small and defined by the consumer. An interface with a
  single implementation MUST NOT be exported.

*Note: Go idiom is "accept interfaces, return structs" with consumer-defined
interfaces (Go Code Review Comments, Effective Go).*

## References

* Go Code Review Comments — <https://go.dev/wiki/CodeReviewComments>
* Effective Go — <https://go.dev/doc/effective_go>
* Go: Defer, Panic, and Recover — <https://go.dev/blog/defer-panic-and-recover>
* Go Wiki: PanicAndRecover — <https://go.dev/wiki/PanicAndRecover>
* Uber Go Style Guide — <https://github.com/uber-go/guide/blob/master/style.md>
