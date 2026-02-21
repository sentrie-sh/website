---
title: Intermediate Values (let)
description: let declaration syntax, scoping, and immutability.
---


`let` binds a name to an expression inside a block. It is scoped to that block, immutable, and cannot be exported. Used for intermediate calculations in policies and rules.

## Syntax

```text
let name = expr
let name : type = expr
```

## Concepts

| Part | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | identifier | Yes | Variable name. |
| `type` | type | No | Optional annotation; validates assignment. |
| `expr` | expression | Yes | Initial value. |

**Returns:** N/A (binding). The name evaluates to the bound value in scope.

## Examples

### Basic Usage

```sentrie
let adminRoles = ["admin", "super_admin"]
let totalPrice = item.price * quantity
let count: number = 10
```

### Advanced Usage

```sentrie
let count: number @min(0) @max(100) = 50
```

Block scope: `let` inside a rule body is only visible in that body; policy-level `let` is visible to all rules in the policy.

## Behavior & Constraints

- Scoped to the immediate block (`{}`). Policy-level: visible to all rules in the policy.
- Immutable: cannot be reassigned.
- Cannot be exported; only rules can be exported.
- Type annotation is optional; if present, value is validated at runtime.

## Constraints & Edge Cases

- Same name in inner block shadows outer. Constraint validation failure aborts evaluation.
