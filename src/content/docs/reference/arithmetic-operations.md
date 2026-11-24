---
title: Arithmetic Operations
description: "Arithmetic operators (+, -, *, /, %), unary +/-, operand types, string concatenation with +, and edge cases including division by zero."
---

Arithmetic operators operate on `number`. A `number` holds either an **exact integer** (a whole number that fits in a signed 64-bit integer, from `-9223372036854775808` to `9223372036854775807`) or a **float** (a 64-bit floating-point number). You never declare which one you want: whole numbers you write, or receive in facts, stay exact integers, and anything with a fractional part or an exponent is a float. The result of every arithmetic operation is `number`. Division by zero and modulo by zero abort evaluation with an error.

## Syntax

**Binary:** `expr + expr` | `expr - expr` | `expr * expr` | `expr / expr` | `expr % expr`

**Unary:** `+ expr` | `- expr`

## Configuration & Arguments

| Operator | Description | Operands | Result | Edge case |
| :------- | :---------- | :------- | :----- | :-------- |
| `+` | Addition, or string concatenation | number, number (or a string with a scalar) | number (or string) | Integer overflow → error. See [String concatenation](#string-concatenation). |
| `-` | Subtraction | number, number | number | Integer overflow → error. |
| `*` | Multiplication | number, number | number | Integer overflow → error. |
| `/` | Division | number, number | number | Divisor zero → error; evaluation aborts. Integer with integer is an integer only when exact, otherwise a float. |
| `%` | Modulo (remainder) | number, number | number | Divisor zero → error; evaluation aborts. The result takes the sign of the left operand. |
| unary `+` | Unary plus | number | number | None |
| unary `-` | Unary minus (negation) | number | number | Negating `-9223372036854775808` overflows → error. |

**Returns:** `number`. Division or modulo by zero aborts evaluation.

## Operand types and conversion

All operands are interpreted as `number`. Integers are exact: they keep every digit from the literal or the JSON fact, through arithmetic and comparison, to the output. In particular they are not rounded at 2^53 (`9007199254740992`), where a float can no longer tell neighbouring integers apart.

```sentrie
let id: number = 9007199254740993    -- Stays 9007199254740993
let next: number = id + 1            -- Result: 9007199254740994
```

The rules are:

- **Integer with integer** is exact. If the result does not fit in 64 bits, evaluation stops with an [overflow error](#overflow).
- **Integer with float** is calculated as a float. The integer is converted to the nearest float first, so digits beyond 2^53 can be lost. Whole results print without a fractional part, so `2 + 1.5 + 0.5` prints as `4`.
- **Equality and ordering are exact** across both forms. [Comparing numbers](#comparing-numbers) covers the details.
- An integer literal too large for 64 bits, such as `18446744073709551616`, is read as a float.
- A JSON fact written as `5.0` or `1e3` is a float, even though its value is whole.

### String concatenation

`+` is also the string-joining operator. When either operand is a `string`, the other operand is turned into text and the two are joined, in either order. The rules follow JavaScript for scalars:

```sentrie
"a" + 1          -- "a1"
1 + "a"          -- "1a"
"a" + 1.0        -- "a1"      (a whole float prints without a fractional part)
"a" + 1.5        -- "a1.5"
"a" + true       -- "atrue"
"a" + null       -- "anull"
```

Numbers print the way JavaScript's `Number.prototype.toString` prints them, so large and small floats switch to an exponent only at the same points JavaScript does:

```sentrie
"a" + 1e20       -- "a100000000000000000000"
"a" + 1e21       -- "a1e+21"
"a" + 0.000001   -- "a0.000001"
"a" + 1e-7       -- "a1e-7"
```

Two cases behave differently:

- **A list or dict beside a string is an error.** `"a" + [1, 2]` stops evaluation with `+ cannot join a string with a list` (and `... with a dict` for a dict). Join the elements yourself instead of relying on `+`.
- **Undefined or unknown beside a string gives unknown**, in either order. `"a" + x` is `unknown` when `x` is undefined (for example a missing optional fact or a missing dict key) or `unknown`. Without a string in the expression, undefined still propagates as undefined: `1 + x` is undefined.

**Breaking change (v0.0.5):** a list or dict joined to a string used to produce text; it is now an error. Packs that relied on that must convert the value first.

### Division

Dividing two integers gives an integer only when the division is exact (`10 / 2` is `5`). Otherwise the result is a float, so `7 / 2` is `3.5`, never `3`. There is no separate integer-division operator and nothing is ever rounded down.

### Modulo

The remainder is truncated: it takes the sign of the left operand, so `-7 % 3` is `-1`, not `2`. Modulo by zero is an error, like division by zero.

### Overflow

Integer arithmetic never wraps around and never silently turns into a float. When the exact result of `+`, `-`, `*`, `/` or unary `-` on integers does not fit in a signed 64-bit integer, evaluation stops with an error:

```sentrie
let max: number = 9223372036854775807
let too_big: number = max + 1        -- Error: integer overflow: 9223372036854775807 + 1
let doubled: number = max * 2        -- Error: integer overflow: 9223372036854775807 * 2
```

Write the smallest integer either as `-9223372036854775808` or as `-9223372036854775807 - 1`. Negating it, or dividing it by `-1`, overflows because `9223372036854775808` has no 64-bit form.

To get past the 64-bit range on purpose, make one operand a float:

```sentrie
let beyond: number = 9223372036854775807 + 1.0   -- Result: a float, printed as 9223372036854776000
```

Float arithmetic follows the usual 64-bit float rules, with one limit at the edge: a result that overflows the float range (for example `1e308 * 10`) cannot be written as JSON, so `sentrie exec --output json` fails with an encoding error instead of printing a value.

### Comparing numbers

`==`, `!=`, `<`, `<=`, `>` and `>=` compare the exact values of both numbers, whichever form they have. Neither side is rounded first.

```sentrie
5 == 5.0                                -- true: an integer and a float with the same value are equal
2 < 2.5                                 -- true
9007199254740993 == 9007199254740992    -- false: one apart, and still told apart
9007199254740993 > 9007199254740992     -- true
```

This matters for identifiers such as account or order IDs: two IDs one apart never compare equal, even beyond 2^53. A float cannot do this, so a comparison involving a float uses the float's own value: `9007199254740993 == 9007199254740993.0` is `false`, because the float literal is the nearby representable value `9007199254740992`.

### Large integers in facts

JSON facts keep their digits too. `sentrie exec`, [`--fact-file`](/cli-reference/exec) and the [HTTP API](/running-sentrie/serving-policies) all read an integer that fits in 64 bits as an exact integer:

```bash
sentrie exec docs/ids/accounts/echo \
  --facts '{"id": 9007199254740993, "other": 9007199254740992}'
# Values:
#   echo: 9007199254740993
```

With those facts, a rule that yields `id == other` is `false`, `id > other` is `true` and `id + 1` is `9007199254740994`. Output prints the digits in full, with no exponent.

A JSON number written outside the float range, such as `1e400`, is rejected with the error `facts: number 1e400 is out of range` (from `--fact-file` the message starts with `fact file:`), and the HTTP API answers `400`.

Integers beyond 2^53 can be compared, added and printed, but they cannot be passed into a [TypeScript module](/reference/using-typescript#numbers-passed-to-typescript-modules).

## Examples in Action

### Basic arithmetic

```sentrie
let sum: number = 5 + 3
let diff: number = 10 - 7
let prod: number = 4 * 6
let quot: number = 15 / 3   -- 5
let rem: number = 10 % 3    -- 1
let negative: number = -7 % 3   -- -1
```

### Division and float result

```sentrie
let half: number = 7 / 2   -- 3.5
let whole: number = 10 / 2   -- 5 (exact integer)
let third: number = 8 / 3    -- 2.6666666666666665
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

- **Operands:** Apart from [string concatenation](#string-concatenation), all operands are `number`, which is an exact 64-bit integer or a float. An operation on an integer and a float is a float operation.
- **Division:** Two integers divide to an integer only when exact (`10 / 2` is `5`); otherwise the result is a float (`7 / 2` is `3.5`). Division by zero aborts evaluation. Use a guard (e.g. ternary or `when`) to avoid dividing by zero.
- **Modulo:** Truncated remainder, taking the sign of the left operand (`-7 % 3` is `-1`). Divisor zero aborts evaluation.
- **Overflow:** An integer result outside the signed 64-bit range is an error, never a wrap-around.

### Statistical Operations

```sentrie
let scores: list[number] = [85, 92, 78, 96]
let total: number = reduce(scores, 0, (acc, score) => { yield acc + score })
let average: number = total / count scores
-- Result: 87.75
```

### Percentages and discounts

```sentrie
let price: number = 100.0
let discount_percent: number = 15
let discount_amount: number = price * (discount_percent / 100.0)
let final_price: number = price - discount_amount
-- Result: 85
```

### Aspect ratio

```sentrie
let aspect_ratio: number = rect.width / rect.height
-- With width 4 and height 3: 1.3333333333333333
```

## Best Practices

### Use Explicit Types

```sentrie
-- Good: Clear type intention
let precise_result: number = 7 / 3

-- Avoid: Type inference confusion
let result = 7 / 3
```

### Handle Division by Zero

```sentrie
let divisor: number = 0
let safe_result: number = divisor != 0 ? 10 / divisor : 0.0
```

### Use Parentheses for Clarity

```sentrie
-- Good: Clear precedence
let result: number = (2 + 3) * 4

-- Avoid: Relying on operator precedence
let result: number = 2 + 3 * 4
```
