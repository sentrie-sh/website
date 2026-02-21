---
title: Intermediate Values (let)
description: let declaration syntax, scoping, and immutability.
---


When you need to reuse a value or expression inside a policy or rule without repeating it, you use `let`. It binds a name to an expression inside a block, is scoped to that block, and is immutable. It cannot be exported—only used for intermediate calculations.

Here is the basic syntax:

```text
let name = expr
let name : type = expr
```

## Configuration & Arguments

| Part | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | identifier | Yes | Variable name. |
| `type` | type | No | Optional annotation; validates assignment. |
| `expr` | expression | Yes | Initial value. |

**Returns:** N/A (binding). The name evaluates to the bound value in scope.

## Examples in Action

### Binding a single intermediate value

```sentrie
let adminRoles = ["admin", "super_admin"]
let totalPrice = item.price * quantity
let count: number = 10
```

### Chaining let for readability

```sentrie
let count: number @min(0) @max(100) = 50
```

Block scope: `let` inside a rule body is only visible in that body; policy-level `let` is visible to all rules in the policy.

## Good to Know

Before you implement this, keep a few boundaries in mind:

- Scoped to the immediate block (`{}`). Policy-level: visible to all rules in the policy.
- Immutable: cannot be reassigned.
- Cannot be exported; only rules can be exported.
- Type annotation is optional; if present, value is validated at runtime.


- Same name in inner block shadows outer. Constraint validation failure aborts evaluation.
