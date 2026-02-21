---
title: Pattern Matching & Conditionals
description: How conditional selection (ternary, Elvis), pattern matching (matches), and state checks work in Sentrie.
---


Sentrie uses trinary logic (`true`, `false`, `unknown`) and provides the ternary and Elvis operators for conditional values, plus `matches` for regex and `is defined` / `is empty` for state checks. This page describes how these work.

## Syntax

**Ternary:** `condition ? trueValue : falseValue`

**Elvis:** `expression ?: defaultValue` (equivalent to `expression ? expression : defaultValue`)

**Pattern match:** `string matches pattern`

**Definedness:** `value is defined` | `value is not defined`

**Emptiness:** `value is empty` | `value is not empty`

## Reference

| Construct    | Left                | Right                 | Description                                                       |
| :----------- | :------------------ | :-------------------- | :---------------------------------------------------------------- |
| `? :`        | condition (trinary) | trueValue, falseValue | If condition is truthy, result is trueValue; else falseValue.     |
| `?:`         | expression          | defaultValue          | If expression is truthy, result is expression; else defaultValue. |
| `matches`    | string              | string (regex)        | True if string matches the regex pattern.                         |
| `is defined` | any                 | -                     | True if value is not undefined.                                   |
| `is empty`   | string/list/map     | -                     | True if empty (e.g. `""`, `[]`, `{}`).                            |

**Returns:** For ternary/Elvis: the selected value (any type). For `matches`, `is defined`, `is empty`: boolean (or trinary where applicable). Non-truthy for Elvis includes `false`, `null`, `undefined` (treated as unknown), `0`, `""`, empty collections.

## Examples

### Basic Usage

```sentrie
let status: string = age >= 18 ? "adult" : "minor"
let displayName: string = user.name ?: "Anonymous"
let valid: bool = email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
let hasPhone: bool = user.phone is defined
```

### Advanced Usage

```sentrie
let final_price: number = product.in_stock
  ? (product.category == "Electronics" ? product.price * 0.9 : product.price)
  : 0.0

let safeItems: list[string] = items ?: []
```

## Behavior & Constraints

- **Ternary:** Condition is evaluated first; only the chosen branch is evaluated. Nested ternaries are allowed; precedence is right-associative.
- **Elvis:** Shorthand for “use this value or default.” `null`/`undefined` are non-truthy (unknown in trinary), so the default is used.
- **matches:** Right-hand side is a string regex. Patterns are compiled and cached. Match is against the whole string unless the pattern allows partial match.
- **is defined:** Use for optional shape fields or values that may be undefined. Accessing undefined without checking can propagate unknown.
- **is empty:** Applies to strings, lists, and maps. Non-empty means at least one character or element.

## Constraints & Edge Cases

- Unknown (trinary) in a condition is not truthy; the false branch of ternary is used, and Elvis returns the default.
- Regex syntax is that of the engine (e.g. escaping in strings). Invalid regex causes error.
- `in` / `contains` for collections are documented in the reference; use with conditionals as needed.
