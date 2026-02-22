---
title: Trinary Values
description: "Exhaustive reference for three-valued logic (true, false, unknown), truthiness, Kleene AND/OR/NOT tables, and use in when, ternary, and Elvis."
---

Sentrie uses three values for logic and conditions: `true`, `false`, and `unknown`. `unknown` represents an indeterminate result (e.g. an optional field that is not present, or a comparison involving `unknown`). [Rule](/reference/rules) `when` guards, the [ternary](/reference/boolean-operations) operator (`? :`), and the Elvis operator (`?:`) use **truthiness**: only `true` is truthy; `false` and `unknown` are non-truthy. Logical operators (`and`, `or`, `xor`, `not`/`!`) follow **Kleene** three-valued logic so `unknown` propagates in defined ways.

## Syntax

**Literals:** `true` | `false` | `unknown`

**Logical operators (binary):** `and` | `or` | `xor`

**Logical negation (unary):** `not expr` | `! expr`

## Configuration & Arguments

### Truthiness

Used by `when`, ternary (`? :`), and Elvis (`?:`):

| Value     | Truthy? |
| :-------- | :------ |
| `true`    | Yes     |
| `false`   | No      |
| `unknown` | No      |

So a rule with `when cond` runs its body only if `cond` evaluates to `true`; if `cond` is `false` or `unknown`, the rule uses its default (or `unknown`).

### NOT (unary)

One operand. The operand is interpreted as trinary; the result is trinary.

| Input     | Output   |
| :-------- | :------- |
| `true`    | `false`  |
| `false`   | `true`   |
| `unknown` | `unknown` |

### Kleene AND (binary)

| AND       | true    | false   | unknown |
| :-------- | :------ | :------ | :------ |
| **true**  | true    | false   | unknown |
| **false** | false   | false   | false   |
| **unknown** | unknown | false | unknown |

### Kleene OR (binary)

| OR        | true    | false   | unknown |
| :-------- | :------ | :------ | :------ |
| **true**  | true    | true    | true    |
| **false** | true    | false   | unknown |
| **unknown** | true  | unknown | unknown |

### XOR (binary)

XOR is defined so that exactly one of the two operands is truthy for the result to be true. When either operand is `unknown`, the result is typically `unknown` (implementation-defined). See the runtime for the exact table.

**Returns:** Trinary. For `when` and conditionals, only `true` is truthy.

## When unknown arises

- **Optional or missing field:** Accessing a field that is not present (e.g. on an optional shape field) may yield `unknown` or a type-specific default depending on context.
- **Comparisons:** Equality or ordering with `unknown` often yields `unknown` (e.g. `unknown == true` → `unknown`).
- **Logical propagation:** As in the Kleene tables, `and`/`or`/`not` propagate `unknown` instead of treating it as true or false.

## Examples in Action

### Propagating unknown

```sentrie
let a = true and unknown   -- unknown
let b = false or unknown   -- unknown
let c = not unknown        -- unknown
```

### When guard and unknown

If a `when` expression evaluates to `unknown` (e.g. optional field missing), the rule does not run its body; it uses its default or returns `unknown`:

```sentrie
rule allow = default false when user.role is defined {
  yield user.role == "admin"
}
```

Here `user.role is defined` is false or unknown when the field is missing; the outcome is then `default false` (or `unknown` if no default).

### Trinary constraints

For runtime validation of trinary values (e.g. require `true` or forbid `unknown`), use [Constraints](/reference/constraints): trinary supports `@not_unknown()`, `@eq`, `@neq`, `@is_true()`, and `@is_false()`.

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Undefined or missing field access can yield `unknown`. Operations on `unknown` propagate according to the Kleene tables. Rule `when` and ternary/Elvis use truthiness: only `true` is truthy.
- **Edge case:** If a `when` evaluates to `unknown`, the rule uses its default or returns `unknown`. `not unknown` is `unknown`, so it is still non-truthy.
- **Trinary constraints:** See [Constraints](/reference/constraints) for `@not_unknown()`, `@eq`, `@neq`, `@is_true()`, `@is_false()` on trinary/bool types.
