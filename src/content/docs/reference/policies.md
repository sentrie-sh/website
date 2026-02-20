---
title: Policies
description: "Policy syntax and allowed statements: facts, rules, let, use, export."
---


A policy is a named block inside a namespace. It contains facts (inputs), rules (decisions), optional `let` bindings and `use` statements, and at least one `export decision of` rule.

## Syntax

```text
policy IDENT {
  fact ...
  let ...
  use ...
  rule ...
  export decision of IDENT [ attach ... ]
}
```

## Parameters

| Statement | Required | Description |
| :--- | :--- | :--- |
| `fact` | No | Inputs; must appear before rules if present. |
| `let` | No | Intermediate values; scoped to block. |
| `use` | No | Import TypeScript functions. |
| `rule` | Yes (≥1) | Decision logic. |
| `export decision of` | Yes (≥1) | Exposes a rule for execution or import. |

**Returns:** N/A (container). Evaluation returns the exported rule decision(s).

## Examples

### Basic Usage

```sentrie
namespace com/example/auth

policy userAccess {
  fact user: User as currentUser
  rule allow = default false { yield user.role == "admin" }
  export decision of allow
}
```

### Advanced Usage

```sentrie
policy userAccess {
  use { sha256 } from @sentrie/hash
  fact user: User as currentUser
  fact context?: Context as ctx default {}
  let adminRoles = ["admin", "super_admin"]
  rule canRead = default false when user.role is defined {
    yield user.role in adminRoles
  }
  export decision of canRead
}
```

## Behavior & Constraints

- Facts must be declared before rules (only facts or comments may precede facts).
- At least one rule must be exported for the policy to be executable or importable.
- Rules in the same policy may reference each other without import.

## Constraints & Edge Cases

- Policy name is an identifier. Same namespace may contain multiple policies.
- Exported rule names are the target for CLI/API and for `import decision of` from other policies.
