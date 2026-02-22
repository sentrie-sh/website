---
title: Arithmetic Operations
description: "Arithmetic operators (+, -, *, /, %), unary +/-, operand types, and edge cases including division by zero."
---

Arithmetic operators operate on `number` (float64). All numeric operands are treated as `number`; there is no separate integer type. The result of every arithmetic operation is `number`. Division by zero and modulo by zero abort evaluation with an error.

## Syntax

**Binary:** `expr + expr` | `expr - expr` | `expr * expr` | `expr / expr` | `expr % expr`

**Unary:** `+ expr` | `- expr`

## Configuration & Arguments

| Operator | Description | Operands | Result | Edge case |
| :------- | :---------- | :------- | :----- | :-------- |
| `+` | Addition | number, number | number | — |
| `-` | Subtraction | number, number | number | — |
| `*` | Multiplication | number, number | number | — |
| `/` | Division | number, number | number | Divisor zero → error; evaluation aborts. |
| `%` | Modulo (remainder) | number, number | number | Divisor zero → error; evaluation aborts. |
| unary `+` | Unary plus | number | number | — |
| unary `-` | Unary minus (negation) | number | number | — |

**Returns:** `number`. Division or modulo by zero aborts evaluation.

## Operand types and conversion

All operands are interpreted as `number`. Mixed integer/float literals are allowed; they are unified as float64. Division is floating-point (e.g. `7 / 2` is `3.5`). Modulo uses the remainder after division; the exact behavior for negative operands follows the implementation (typically Go’s `math.Mod` or similar).

## Examples in Action

### Basic arithmetic

```sentrie
let sum: number = 5 + 3
let diff: number = 10 - 7
let prod: number = 4 * 6
let quot: number = 15 / 3
let rem: number = 10 % 3
```

### Division and float result

```sentrie
let half: number = 7 / 2   -- 3.5
```

### Unary minus

```sentrie
let neg: number = -x
let pos: number = +y
```

### Guarding against division by zero

```sentrie
let safe: number = divisor != 0 ? 10 / divisor : 0.0
```

### Using arithmetic in expressions

```sentrie
let area: number = rect.width * rect.height
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Operands:** All operands are `number` (float64). Mixed integer/float literals are allowed; there is no separate integer type.
- **Division:** Result is float (e.g. 7/2 = 3.5). Division by zero aborts evaluation. Use a guard (e.g. ternary or `when`) to avoid dividing by zero.
- **Modulo:** Remainder after division. Divisor zero aborts evaluation. Behavior for negative numbers is implementation-defined (e.g. Go’s `math.Mod`).
