---
title: Arithmetic Operations
description: "Arithmetic operators: +, -, *, /, %; types and edge cases."
---


Arithmetic operators operate on `number` (float64). All numeric operands are unified as `number`. Result type is `number`.

## Syntax

```text
expr + expr
expr - expr
expr * expr
expr / expr
expr % expr
```

Unary: `+ expr` | `- expr`

## Parameters

| Operator | Description | Result |
| :--- | :--- | :--- |
| `+` | Addition | number |
| `-` | Subtraction | number |
| `*` | Multiplication | number |
| `/` | Division | number |
| `%` | Modulo (remainder) | number |

**Returns:** `number`. Division by zero aborts evaluation.

## Examples

### Basic Usage

```sentrie
let sum: number = 5 + 3
let diff: number = 10 - 7
let prod: number = 4 * 6
let quot: number = 15 / 3
let rem: number = 10 % 3
```

### Advanced Usage

```sentrie
let area: number = rect.width * rect.height
let safe: number = divisor != 0 ? 10 / divisor : 0.0
```

## Behavior & Constraints

- All operands are `number`; mixed integer/float is allowed. Division is float (e.g. 7/2 = 3.5).
- Modulo: remainder after division; divisor zero aborts.

## Constraints & Edge Cases

- Division by zero aborts evaluation. Use a guard (e.g. ternary) to avoid.
