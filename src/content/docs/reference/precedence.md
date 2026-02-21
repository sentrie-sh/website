---
title: Precedence
description: Operator precedence (highest to lowest) for expressions.
---


Operators are evaluated in order of precedence (highest first). Same precedence is left-to-right unless stated otherwise. Use parentheses to override.

## Syntax

Expressions combine operators; precedence determines binding. Ternary `? :` is right-associative.

## Reference

| Precedence | Operators | Description |
| :--- | :--- | :--- |
| 1 | `()`, `[]`, `.` | Primary (literals, identifiers, calls, indexing) |
| 2 | `not`, `!`, unary `+`, `-` | Unary |
| 3 | `*`, `/`, `%` | Multiplicative |
| 4 | `+`, `-` | Additive |
| 5 | `<`, `<=`, `>`, `>=`, `in`, `matches`, `contains` | Comparison |
| 6 | `==`, `!=`, `is`, `is not` | Equality |
| 7 | `and` | Logical AND |
| 8 | `xor` | Logical XOR |
| 9 | `or` | Logical OR |
| 10 | `? :` | Ternary conditional |

**Returns:** N/A (ordering rule). Result type is that of the top-level expression.

## Examples

### Basic Usage

```sentrie
let result: number = 2 + 3 * 4         -- 14
let valid: bool = 5 + 3 > 7            -- true
let complex: bool = true and false or true  -- true
```

### Advanced Usage

```sentrie
let value: number = 5 > 3 ? 10 : 20   -- 10
let nested: string = true ? (false ? "A" : "B") : "C"  -- "B"
```

## Behavior & Constraints

- Parentheses override precedence. Same level: left to right except ternary (right-associative).

## Constraints & Edge Cases

- Use parentheses when in doubt to make intent explicit.
