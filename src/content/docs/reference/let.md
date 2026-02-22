---
title: Intermediate Values (let)
description: "let declaration syntax, scoping, immutability, and type validation."
---

`let` binds a name to an expression inside a block. It is used for intermediate values in a [policy](/reference/policies) or inside a [rule](/reference/rules) body. The binding is scoped to the block, is immutable (no reassignment), and cannot be exported. Only [rules](/reference/rules) can be exported. If a type annotation is present, the value is validated at runtime (including [constraints](/reference/constraints)); validation failure aborts evaluation.

## Syntax

```text
let name = expr
let name : type = expr
```

- **name:** Identifier. Must be unique within the same block (inner blocks can shadow outer names).
- **type:** Optional. Any type reference (primitive, collection, or [shape](/reference/shapes)), optionally with [constraints](/reference/constraints). When present, the value of `expr` is validated against this type at runtime.
- **expr:** Any expression. Evaluated once; the result is bound to `name`.

## Configuration & Arguments

| Part | Type | Required | Description |
| :--- | :--- | :------- | :---------- |
| `name` | identifier | Yes | Variable name. Visible in the rest of the block (and inner blocks unless shadowed). |
| `type` | type ref | No | If present, the assigned value is validated against this type and any constraints. Failure aborts evaluation. |
| `expr` | expression | Yes | Initial value. Evaluated once at the point of the `let`. |

**Returns:** N/A (binding). The name evaluates to the bound value wherever it is used in scope.

## Scoping

- **Policy-level let:** Declared in the policy block (after [facts](/reference/facts), alongside [use](/reference/functions)). Visible to all [rules](/reference/rules) in that policy. Not visible in other policies.
- **Rule-level let:** Declared inside a rule body (before the `yield`). Visible only within that rule body. Policy-level let is also visible inside the rule unless shadowed.
- **Shadowing:** A `let` in an inner block (e.g. inside a rule) can reuse the same name as an outer binding; the inner name shadows the outer one in the inner scope.

## Immutability and export

- **Immutability:** There is no syntax to reassign a `let` binding. The name always refers to the value computed at the `let` site.
- **Export:** Only rules can be exported. `let` bindings cannot be exported; they are for intermediate computation only.

## Examples in Action

### Untyped and typed let

```sentrie
let adminRoles = ["admin", "super_admin"]
let totalPrice = item.price * quantity
let count: number = 10
```

Without a type, the value is not validated against a type. With a type, the value must conform (and satisfy constraints if any).

### Typed let with constraints

```sentrie
let count: number @min(0) @max(100) = 50
```

If `50` were outside `[0, 100]`, evaluation would abort.

### Policy-level let used in rules

```sentrie
policy P {
  fact user: User
  let roles = ["admin", "editor"]
  rule allow = default false { yield user.role in roles }
  export decision of allow
}
```

`roles` is visible in the rule body.

### Let inside a rule body

```sentrie
rule getPrice = default 0 when product.price is defined {
  let base = product.price
  let discount = user.isPremium ? 0.1 : 0.05
  yield base * (1 - discount)
}
```

`base` and `discount` are visible only until the `yield`.

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Scope:** Let is scoped to the immediate block. Policy-level let is visible to all rules in the policy. Rule-level let is visible only in that rule body. Same name in an inner block shadows the outer binding.
- **Immutability:** Let bindings cannot be reassigned. The name always refers to the initial value.
- **Export:** Only rules can be exported. Let cannot be exported.
- **Type annotation:** Optional. If present, the value is validated at runtime against the type and any constraints; constraint or type failure aborts evaluation.
- **Shadowing:** Inner blocks can declare the same name as an outer let; the inner name shadows the outer in the inner scope.
