---
title: Policies
description: "Policy syntax and allowed statements: facts, rules, let, use, export."
---

When you need to define a named set of inputs (facts), decision logic (rules), and optional helpers (`let`, `use`), you put them in a policy. A policy is a named block inside a namespace. It must have at least one rule and at least one `export decision of` so the policy can be run from the CLI or HTTP API.

Here is the basic syntax:

```text
policy IDENT {
  fact ...
  let ...
  use ...
  rule ...
  export decision of IDENT [ attach ... ]
}
```

## Configuration & Arguments

You can structure a policy using these statements:

| Argument | Required | What it does |
| :------- | :------- | :----------- |
| `fact` | No | Inputs; must appear before rules if present. |
| `let` | No | Intermediate values; scoped to the block. |
| `use` | No | Import TypeScript functions. |
| `rule` | Yes (≥1) | Decision logic. |
| `export decision of` | Yes (≥1) | Exposes a rule for execution or import. |

**Returns:** N/A (container). Evaluation returns the exported rule decision(s).

---

## Examples in Action

### Defining a simple allow/deny policy

You have one fact (e.g. user) and one rule that yields true or false; you export that rule so `sentrie exec` or the API can call it.

```sentrie
namespace com/example/auth

policy userAccess {
  fact user: User as currentUser
  rule allow = default false { yield user.role == "admin" }
  export decision of allow
}
```

### Using TypeScript modules, optional facts, and let

You need a hash function, an optional context fact with a default, and a list of roles used in the rule.

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

---

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Facts must be declared before rules (only facts or comments may precede facts). At least one rule must be exported for the policy to be executable or importable. Rules in the same policy may reference each other without import.
- **Edge case:** Policy name is an identifier. The same namespace may contain multiple policies. Exported rule names are the target for the CLI/API and for `import decision of` from other policies.
