---
title: Precedence
description: "Operator precedence (highest to lowest), associativity, and use of parentheses."
---

Operators are evaluated in order of precedence: higher precedence binds first. When two operators have the same precedence, they are usually evaluated left-to-right; the ternary operator `? :` is right-associative. Parentheses `( ... )` override precedence and explicitly group subexpressions.

## Syntax

| Precedence | Operators                                         | Description                                                  |
| ---------- | ------------------------------------------------- | ------------------------------------------------------------ |
| 1          | `()`, `[]`, `.`                                   | Primary expressions (literals, identifiers, function calls) |
| 2          | `not`, `!`, `+`, `-`                              | Unary operators                                              |
| 3          | `*`, `/`, `%`                                     | Multiplicative arithmetic                                    |
| 4          | `+`, `-`                                          | Additive arithmetic                                          |
| 5          | `<`, `<=`, `>`, `>=`, `in`, `matches`, `contains` | Comparison operators                                         |
| 6          | `==`, `!=`, `is`, `is not`                        | Equality operators                                           |
| 7          | `and`                                             | Logical AND                                                  |
| 8          | `xor`                                             | Logical XOR                                                  |
| 9          | `or`                                              | Logical OR                                                   |
| 10         | `? :`                                             | Ternary conditional                                          |
| 11         | `|>`                                              | Pipeline operator (lowest precedence)                        |

## Configuration & Arguments (precedence table)

| Level | Precedence | Operators | Description |
| :---- | :--------- | :-------- | :---------- |
| 1 | Highest | `( )`, `[ ]`, `.` | Primary: function call `f(...)`, indexing `e[i]`, member access `e.f`. Literals and identifiers are atoms. |
| 2 | | `not`, `!`, unary `+`, unary `-` | Unary: logical not, unary plus/minus. |
| 3 | | `*`, `/`, `%` | Multiplicative. |
| 4 | | `+`, `-` | Additive (binary). |
| 5 | | `<`, `<=`, `>`, `>=`, `in`, `matches`, `contains` | Comparison and containment. |
| 6 | | `==`, `!=`, `is`, `is not` | Equality. |
| 7 | | `and` | Logical AND. |
| 8 | | `xor` | Logical XOR. |
| 9 | | `or` | Logical OR. |
| 10 | | `? :` | Ternary conditional. **Right-associative.** |
| 11 | Lowest | `|>` | Pipeline: left operand is piped into the next call. **Left-associative.** |

**Returns:** N/A (ordering rule). The result type is the type of the top-level expression after all operators are applied.

## Associativity

- **Left-to-right:** Same-precedence operators (e.g. `+` and `-`, `*` and `/`, `and`, `or`, `xor`) group from the left unless overridden by parentheses. Example: `a - b - c` is `(a - b) - c`.
- **Right-associative:** The ternary `? :` groups from the right. Example: `a ? b : c ? d : e` is `a ? b : (c ? d : e)`.

## Parentheses

Parentheses override precedence. Any subexpression can be wrapped in `( ... )` to force that subexpression to be evaluated first. Use parentheses when the intended grouping is not obvious.

## Examples in Action

### Precedence in arithmetic

```sentrie
let result: number = 2 + 3 * 4         -- 14 (multiplication before addition)
let valid: bool = 5 + 3 > 7            -- true (arithmetic before comparison)
```

### Logical precedence

```sentrie
let complex: bool = true and false or true   -- true (and before or; (true and false) or true)
```

### Ternary right-associativity

```sentrie
let value: number = 5 > 3 ? 10 : 20                    -- 10
let nested: string = true ? (false ? "A" : "B") : "C" -- "B"
```

Without parentheses, `a ? b : c ? d : e` is parsed as `a ? b : (c ? d : e)`.

### Using parentheses to clarify

```sentrie
let safe: bool = (user.role == "admin") and (age >= 18)
let sum: number = (a + b) * (c + d)
```

### Pipeline Precedence and Associativity

The pipeline operator has the lowest precedence and associates from left to right.

```sentrie
let a = value |> len |> math.abs
-- Equivalent to: math.abs(len(value))

let b = a + b |> len
-- Equivalent to: len(a + b)

let c = cond ? x : y |> len
-- Equivalent to: len(cond ? x : y)
```

For pipeline syntax, valid targets, and memoization, see [Function chaining](/reference/function-chaining).

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Parentheses:** Override precedence and associativity. Use them when in doubt to make intent explicit.
- **Same level:** Left to right except for ternary (`? :`), which is right-associative.
- **Primary:** Function calls, indexing, and dot access have the highest precedence so that `a.f()`, `a[i]`, and `a.b` are grouped as expected.
