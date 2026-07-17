---
title: "Python Style Guide"
section: "Guideline"
parent: "style-guide"
nav_label: "Python"
sort: 64
visibility: internal
---

# Python Style Guide

Per-language style guide for Python. Shared rules: the
[Coding Style Guide](/style-guide). Requirement levels follow
RFC 2119; tags 🌎 / 🏠 are defined there.

[[TOC]]

## 1. Formatting 🌎

* Code MUST be formatted and linted with [Ruff](https://docs.astral.sh/ruff/)
  (Black-compatible). Editors MUST format on save.
* Code MUST follow [PEP 8](https://peps.python.org/pep-0008/).

*Note: Ruff replaces Flake8 + Black + isort in one tool; a project MAY run Black
directly instead.*

## 2. Type Hints 🏠

* Function signatures MUST carry type hints.
* Type hints MUST be enforced by [mypy](https://mypy.readthedocs.io/) or pyright
  in CI.

*Rationale: stricter than PEP 484, which says hints will never be mandatory; the
language does not check them at runtime.*

## 3. Functional Style 🏠

* Plain functions, frozen `dataclasses` (a
  [**Value Object**](/technical-glossary#value-object)), and immutable data MUST
  be preferred over stateful classes.
* The pure core MUST be free of
  [**Side Effect**](/technical-glossary#side-effect)s.
* Comprehensions and generator expressions SHOULD be preferred over manual
  accumulation loops where they stay readable.

*Rationale: stricter than mainstream Python, which treats classes and
object-oriented style as the default structuring tool.*

## 4. Error Handling 🏠

* Expected failures SHOULD be modeled as return values where it aids clarity.
* `raise` MUST be reserved for programmer bugs and broken invariants; exceptions
  MUST be caught at the boundary.
* Bare `except:` MUST NOT be used; catch specific exceptions and chain with
  `raise X from Y` (PEP 8).

❌ An expected "not found" flows through an exception, caught blindly:

```python
def find_user(users: dict[str, User], uid: str) -> User:
    try:
        return users[uid]
    except:            # bare except hides real bugs
        return None    # absence smuggled back through the type
```

✅ Expected absence is a return value; `raise` is kept for real bugs:

```python
def find_user(users: dict[str, User], uid: str) -> User | None:
    return users.get(uid)
```

*Rationale: divergent from Python's EAFP idiom, where exceptions are the standard
error-handling mechanism.*

## References

* PEP 8 — <https://peps.python.org/pep-0008/>
* PEP 484 (Type Hints) — <https://peps.python.org/pep-0484/>
* Google Python Style Guide — <https://google.github.io/styleguide/pyguide.html>
* Python tutorial, Errors and Exceptions — <https://docs.python.org/3/tutorial/errors.html>
* Ruff — <https://docs.astral.sh/ruff/>
