---
title: Pattern Matching & Conditionals
description: How conditional selection (ternary, Elvis), pattern matching (matches), and state checks work in Sentrie.
---

Sentrie uses trinary logic (`true`, `false`, `unknown`) and provides the ternary and Elvis operators for conditional values, plus `matches` for regex and `is defined` / `is empty` for state checks. This page describes how these work.

## Syntax

**Ternary:** `condition ? trueValue : falseValue`

**Elvis:** `expression ?: defaultValue` (the default is used only when `expression` is undefined or `null`; it is not the same as `expression ? expression : defaultValue`)

**Pattern match:** `string matches pattern`

**Definedness:** `value is defined` | `value is not defined`

**Emptiness:** `value is empty` | `value is not empty`

## Configuration & Arguments

| Construct          | Left                | Right                 | Description                                                       |
| :----------------- | :------------------ | :-------------------- | :---------------------------------------------------------------- |
| `? :`              | condition (trinary) | trueValue, falseValue | If condition is truthy, result is trueValue; else falseValue.     |
| `?:`               | expression          | defaultValue          | If expression is undefined or `null`, result is defaultValue; else expression. |
| `matches`          | string              | string (regex)        | True if string matches the regex pattern.                         |
| `is [not] defined` | any                 | -                     | True if value is [not] undefined.                                 |
| `is [not] empty`   | string/list/map     | -                     | True if [not] empty (e.g. `""`, `[]`, `{}`).                      |

**Returns:** For ternary/Elvis: the selected value (any type). For `matches`, `is defined`, `is empty`: boolean (or trinary where applicable). Elvis falls back only for `null` and undefined; `false`, `0`, `""`, `unknown` and empty collections are returned unchanged (`false ?: true` is `false`, `0 ?: 9` is `0`, `unknown ?: true` is `unknown`).

## Examples in Action

### Typical use

```text
let status: string = age >= 18 ? "adult" : "minor"
let displayName: string = user.name ?: "Anonymous"
let valid: boolean = email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
let hasPhone: boolean = user.phone is defined
```

### Going further

```sentrie
let final_price: number = product.in_stock
  ? (product.category == "Electronics" ? product.price * 0.9 : product.price)
  : 0.0

let safeItems: list[string] = items ?: []
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Ternary:** Condition is evaluated first; only the chosen branch is evaluated. Nested ternaries are allowed; precedence is right-associative.
- **Elvis:** Shorthand for “use this value or default.” Only `null` and undefined select the default. Any other left side, including `false`, `0`, `""` and `unknown`, is returned as it is.
- **matches:** Right-hand side is a string regex. Patterns are compiled and cached. A pattern matches anywhere in the string (a substring match), so `"not-admin-suffix" matches "admin"` is true. Anchor the pattern for a whole-string check: `value matches "^admin$"`.
- **is defined:** Use for optional shape fields or values that may be undefined. Accessing undefined without checking can propagate unknown.
- **is empty:** Applies to strings, lists, and maps. Non-empty means at least one character or element.

- Unknown (trinary) in a ternary condition is not truthy, so the false branch is used. Elvis does not look at truthiness: `unknown ?: x` is `unknown`.
- Regex syntax is that of the engine (e.g. escaping in strings). Invalid regex causes error.
- `in` / `contains` for collections are documented in the reference; use with conditionals as needed.
