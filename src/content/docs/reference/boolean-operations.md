---
title: Boolean Operations
description: "Logical (and, or, xor, not), comparison (==, !=, <, <=, >, >=), pattern (matches), and conditional (ternary, Elvis) operators."
---

Boolean operations combine conditions, compare values, and branch on truthiness. Logical and comparison operators use [trinary](/reference/trinary) semantics (true, false, unknown). The pattern operator `matches` works on strings and returns a boolean. The ternary (`? :`) and Elvis (`?:`) operators choose a value based on whether a condition is truthy; only `true` is truthy.

## Syntax

**Logical (binary):** `and` | `or` | `xor`

**Negation (unary):** `not expr` | `! expr`

**Comparison:** `==` | `!=` | `is` | `is not` | `<` | `<=` | `>` | `>=`

**Pattern:** `stringExpr matches patternExpr` (both operands strings; right is a regex pattern)

**Conditional:** `condition ? trueValue : falseValue` | `expr ?: default`

## Configuration & Arguments

| Operator             | Operands                         | What it does                                                                                                                   | Returns                 |
| :------------------- | :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| `and`                | expr, expr                       | Logical AND (Kleene). Short-circuits: if left is false, right is not evaluated.                                                | trinary                 |
| `or`                 | expr, expr                       | Logical OR (Kleene). Short-circuits: if left is true, right is not evaluated.                                                  | trinary                 |
| `xor`                | expr, expr                       | Logical XOR. True when exactly one operand is truthy.                                                                          | trinary                 |
| `not`, `!`           | expr                             | Logical NOT (unary). One operand; converted to trinary then negated (true↔false; unknown→unknown).                             | trinary                 |
| `==`, `is`           | expr, expr                       | Equality. Both sides must be comparable.                                                                                       | trinary                 |
| `!=`, `is not`       | expr, expr                       | Inequality.                                                                                                                    | trinary                 |
| `<`, `<=`, `>`, `>=` | expr, expr                       | Ordering. Both sides must be comparable (e.g. number, string).                                                                 | trinary                 |
| `matches`            | string, string                   | Left: value; right: regex pattern (Go [regexp](https://pkg.go.dev/regexp)). Invalid pattern → error.                           | bool                    |
| `? :`                | condition, trueValue, falseValue | Ternary: if condition is truthy, result is trueValue; else falseValue. Only the chosen branch is evaluated. Right-associative. | type of chosen branch   |
| `?:`                 | expr, default                    | Elvis: if expr is truthy, result is expr; else result is default. Non-truthy: false, unknown, null, 0, "", empty collection.   | type of expr or default |

**Returns:** Trinary for logical and comparison; bool for `matches`; type of the chosen value for ternary and Elvis.

## Truthiness (for ternary and Elvis)

Only `true` is truthy. The following are treated as non-truthy: `false`, `unknown`, `null`, `0`, `""`, and empty collections. So `expr ?: default` yields `default` when `expr` is any of these.

## Short-circuit and evaluation order

- **and:** Left-to-right. If the left operand is false, the right is not evaluated.
- **or:** Left-to-right. If the left operand is true, the right is not evaluated.
- **? ::** Only the branch selected by the condition is evaluated. The condition is always evaluated first.

## Examples in Action

### Logical and comparison

```sentrie
let a: bool = true and false
let b: bool = age >= 18
let c: bool = not (user.role in allowed_roles)
```

### Ternary and Elvis

```sentrie
let d: string = age >= 18 ? "adult" : "minor"
let e: string = user.name ?: "Anonymous"
```

### Pattern matching (regex)

```sentrie
let g: bool = email matches `^[a-z]+@[a-z]+\\.com$`
```

Left and right must be strings. The right is interpreted as a Go regexp. Invalid pattern causes an evaluation error.

### Combining conditions

```sentrie
let f: bool = user.role == "admin" or (user.role == "user" and user.status == "active")
let h: bool = not (role in ["guest"]) and status == "active"
```

## Good to Know

Before you wire these into policies, keep a few boundaries in mind:

- **not / !:** Unary prefix; one operand. Converted to trinary then negated. `not unknown` yields `unknown`. You can write `not expr` or `! expr` (no space required after `!`).
- **Short-circuit:** `and` and `or` evaluate left-to-right; the right side may be skipped. The ternary evaluates only the chosen branch.
- **Comparison:** Both sides must be comparable; result is trinary. Equality with `unknown` yields `unknown`.
- **matches:** Left and right must be strings. Right is a [Go regexp](https://pkg.go.dev/regexp) pattern. Invalid pattern causes an evaluation error. For membership in collections or substring checks, use [in](/reference/membership-operations) or [contains](/reference/membership-operations).
