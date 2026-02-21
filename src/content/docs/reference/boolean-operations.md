---
title: Boolean Operations
description: Logical (and, or, xor, not), comparison (==, !=, <, <=, >, >=), pattern (matches), and conditional operators.
---

Logical, comparison, and pattern operators produce trinary or bool results. Operands are trinary for logical/comparison; [trinary](/reference/trinary) semantics apply. Pattern operator `matches` is string-only.

## Syntax

**Logical (binary):** `and` | `or` | `xor`

**Negation (unary):** `not expr` | `! expr` — one operand; result is trinary NOT.

**Comparison:** `==` | `!=` | `is` | `is not` | `<` | `<=` | `>` | `>=`

**Pattern:** `string matches pattern` (pattern is a regex string)

**Conditional:** `condition ? trueValue : falseValue` | `expr ?: default`

## Reference

| Operator             | Description                                                                 | Returns               |
| :------------------- | :-------------------------------------------------------------------------- | :-------------------- |
| `and`                | Logical AND (Kleene)                                                        | trinary               |
| `or`                 | Logical OR (Kleene)                                                         | trinary               |
| `xor`                | Logical XOR                                                                 | trinary               |
| `not`, `!`           | Logical NOT (unary). Single operand; converted to trinary then negated.     | trinary               |
| `==`, `is`           | Equality                                                                    | trinary               |
| `!=`, `is not`       | Inequality                                                                  | trinary               |
| `<`, `<=`, `>`, `>=` | Ordering                                                                    | trinary               |
| `matches`            | String matches regex (left: string, right: pattern). Invalid regex → error. | bool                  |
| `? :`                | Ternary                                                                     | type of chosen branch |
| `?:`                 | Elvis (default if not truthy)                                               | type                  |

**Returns:** Trinary or the selected value. Non-truthy for Elvis: `false`, `unknown`, `null`, `0`, `""`, `empty collection`.

## Examples

### Basic Usage

```sentrie
let a: bool = true and false
let b: bool = age >= 18
let c: bool = not (user.role in allowed_roles)
let d: string = age >= 18 ? "adult" : "minor"
let e: string = user.name ?: "Anonymous"
```

### Advanced Usage

```sentrie
let f: bool = user.role == "admin" or (user.role == "user" and user.status == "active")
let g: bool = email matches `^[a-z]+@[a-z]+\\.com$`
let h: bool = not (role in ["guest"]) and status == "active"
```

## Behavior & Constraints

- **not / !:** Unary prefix; one operand. Operand is converted to trinary ([trinary](/reference/trinary)) then negated (true↔false, unknown stays unknown).
- Short-circuit: `and`/`or` evaluate left-to-right; right side may be skipped. Ternary evaluates only the chosen branch.
- Comparison: both sides must be comparable; result is trinary.
- **matches:** Left and right must be strings. Right is interpreted as a [Go regexp](https://pkg.go.dev/regexp) pattern. Invalid pattern string causes an evaluation error.

## Constraints & Edge Cases

- **not / !:** `not unknown` yields `unknown`. Use `not expr` or `! expr`; no space required after `!`.
- `unknown` in logical ops propagates per Kleene. Equality with `unknown` yields `unknown`.
- **matches:** Non-string operands or invalid regex → error. For membership in collections or substrings, use [in](/reference/membership-operations) or [contains](/reference/membership-operations).
