---
title: Boolean Operations
description: Logical (and, or, xor, not), comparison (==, !=, <, <=, >, >=), pattern (matches), and conditional operators.
---

When you need to combine conditions, compare values, or branch on truthiness, you use Sentrie’s logical, comparison, pattern, and conditional operators. They keep a consistent story: logical and comparison ops use [trinary](/reference/trinary) semantics (true, false, unknown), and the pattern operator `matches` works on strings only.

Here is the basic syntax:

**Logical (binary):** `and` | `or` | `xor`  

**Negation (unary):** `not expr` | `! expr`  

**Comparison:** `==` | `!=` | `is` | `is not` | `<` | `<=` | `>` | `>=`  

**Pattern:** `string matches pattern` (pattern is a regex string)  

**Conditional:** `condition ? trueValue : falseValue` | `expr ?: default`

## Configuration & Arguments

You can combine and compare values using these operators:

| Operator | What it does | Returns |
| :------- | :----------- | :------ |
| `and` | Logical AND (Kleene) | trinary |
| `or` | Logical OR (Kleene) | trinary |
| `xor` | Logical XOR | trinary |
| `not`, `!` | Logical NOT (unary). Single operand; converted to trinary then negated. | trinary |
| `==`, `is` | Equality | trinary |
| `!=`, `is not` | Inequality | trinary |
| `<`, `<=`, `>`, `>=` | Ordering | trinary |
| `matches` | String matches regex (left: string, right: pattern). Invalid regex → error. | bool |
| `? :` | Ternary: pick trueValue or falseValue by condition | type of chosen branch |
| `?:` | Elvis: use expression if truthy, else default | type |

**Returns:** Trinary or the selected value. For Elvis, non-truthy means `false`, `unknown`, `null`, `0`, `""`, or empty collection.

---

## Examples in Action

### Combining conditions and using a default value

You are building a rule that depends on role and age, and you want a readable label or a fallback when a field is missing.

```sentrie
let a: bool = true and false
let b: bool = age >= 18
let c: bool = not (user.role in allowed_roles)
let d: string = age >= 18 ? "adult" : "minor"
let e: string = user.name ?: "Anonymous"
```

### Checking role with regex and negated membership

You need to allow access for admins or active users, validate an email format, and exclude guests.

```sentrie
let f: bool = user.role == "admin" or (user.role == "user" and user.status == "active")
let g: bool = email matches `^[a-z]+@[a-z]+\\.com$`
let h: bool = not (role in ["guest"]) and status == "active"
```

---

## Good to Know

Before you wire these into policies, keep a few boundaries in mind:

- **not / !:** Unary prefix; one operand. It is converted to trinary then negated (true↔false; unknown stays unknown). `not unknown` yields `unknown`. You can write `not expr` or `! expr` (no space required after `!`).
- **Short-circuit:** `and` and `or` evaluate left-to-right; the right side may be skipped. The ternary evaluates only the chosen branch.
- **Comparison:** Both sides must be comparable; result is trinary. Equality with `unknown` yields `unknown`.
- **matches:** Left and right must be strings. The right side is interpreted as a [Go regexp](https://pkg.go.dev/regexp) pattern. Invalid pattern string causes an evaluation error. For membership in collections or substrings, use [in](/reference/membership-operations) or [contains](/reference/membership-operations).
