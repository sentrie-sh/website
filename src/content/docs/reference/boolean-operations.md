---
title: Boolean Operations
description: Logical (and, or, xor, not) and comparison (==, !=, <, <=, >, >=) operators.
---

# Boolean Operations

Logical and comparison operators produce trinary or bool results. Operands are trinary; comparisons and logical ops follow [trinary](/reference/trinary) semantics.

## Syntax

**Logical:** `and` | `or` | `xor` | `not` | `!`

**Comparison:** `==` | `!=` | `is` | `is not` | `<` | `<=` | `>` | `>=`

**Conditional:** `condition ? trueValue : falseValue` | `expr ?: default`

## Parameters

| Operator | Description | Returns |
| :--- | :--- | :--- |
| `and` | Logical AND (Kleene) | trinary |
| `or` | Logical OR (Kleene) | trinary |
| `xor` | Logical XOR | trinary |
| `not`, `!` | Logical NOT | trinary |
| `==`, `is` | Equality | trinary |
| `!=`, `is not` | Inequality | trinary |
| `<`, `<=`, `>`, `>=` | Ordering | trinary |
| `? :` | Ternary | type of chosen branch |
| `?:` | Elvis (default if not truthy) | type |

**Returns:** Trinary or the selected value. Non-truthy for Elvis: false, unknown, null, 0, "", empty collection.

## Examples

### Basic Usage

```sentrie
let a: bool = true and false
let b: bool = age >= 18
let c: string = age >= 18 ? "adult" : "minor"
let d: string = user.name ?: "Anonymous"
```

### Advanced Usage

```sentrie
let e: bool = user.role == "admin" or (user.role == "user" and user.status == "active")
```

## Behavior & Constraints

- Short-circuit: `and`/`or` evaluate left-to-right; right side may be skipped. Ternary evaluates only the chosen branch.
- Comparison: both sides must be comparable; result is trinary.

## Constraints & Edge Cases

- `unknown` in logical ops propagates per Kleene. Equality with `unknown` yields `unknown`.
