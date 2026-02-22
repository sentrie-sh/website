---
title: Policies
description: "Policy syntax, statement order (facts, let, use, rules, export), and evaluation behavior."
---

A policy is a named block inside a [namespace](/reference/namespaces) that groups [facts](/reference/facts), optional [let](/reference/let) bindings, optional [use](/reference/functions) imports, [rules](/reference/rules), and one or more `export decision of` declarations. It defines the inputs and decision logic that the CLI or HTTP API can execute. To be runnable or importable, a policy must have at least one rule and at least one exported decision.

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

- **IDENT:** Policy name (identifier). Must be unique within the namespace (or follow tooling rules for overloads, if any).
- **Body:** Statements in a fixed order (see Configuration & Arguments). Facts first (if any), then let, use, rules, and finally export declarations.

## Configuration & Arguments

| Statement | Required | Order | Description |
| :-------- | :------- | :---- | :---------- |
| `fact` | No | First | Declare input facts. All fact declarations must appear before any `let`, `use`, or `rule`. Only facts (and comments) may precede facts. |
| `let` | No | After facts | Intermediate values. Scoped to the policy block; visible to all rules in the policy. |
| `use` | No | After let | Import TypeScript modules (e.g. `use { sha256 } from @sentrie/hash`). See [Functions](/reference/functions). |
| `rule` | Yes (≥1) | After use | Decision logic. At least one rule must be declared. |
| `export decision of` | Yes (≥1) | After rules | Expose a rule for execution (CLI/API) or for [import](/language-concepts/policy-composition) from other policies. The identifier after `of` must be the name of a rule in the same policy. |

**Returns:** N/A (container). Evaluation returns the result of the invoked rule (the one targeted by the CLI, API, or import). The policy itself does not “return” a value; the exported rule does.

## Statement order and constraints

- **Facts first:** If the policy has any `fact` declarations, they must come first. Only comments may appear before the first fact. No `let`, `use`, or `rule` may appear before a fact when facts exist.
- **Let and use:** After all facts, any `let` and `use` statements. Order between multiple `let` or multiple `use` is significant only where one binding references another (e.g. a later `let` may refer to an earlier `let` or to a fact).
- **Rules:** All rules follow. Rules can reference facts (by name or alias), policy-level `let` bindings, and other rules in the same policy by name. They cannot reference rules in other policies without import.
- **Export:** Each `export decision of RuleName` exposes that rule. The same rule may be exported once. The CLI and API select which exported rule to run (e.g. by name). For `import decision of` from another policy, the binding (e.g. `with` facts) uses the rule name as the target.

## Examples in Action

### Minimal policy (one fact, one rule, one export)

```sentrie
namespace com/example/auth

policy userAccess {
  fact user: User as currentUser
  rule allow = default false { yield currentUser.role == "admin" }
  export decision of allow
}
```

### Multiple facts, optional fact with default, let, and use

```sentrie
policy userAccess {
  use { sha256 } from @sentrie/hash
  fact user: User as currentUser
  fact context?: Context as ctx default {}
  let adminRoles = ["admin", "super_admin"]
  rule canRead = default false when currentUser.role is defined {
    yield currentUser.role in adminRoles
  }
  rule canWrite = default false when currentUser.role is defined {
    yield currentUser.role == "admin"
  }
  export decision of canRead
  export decision of canWrite
}
```

### Rules referencing other rules

Rules in the same policy can call each other by name (no import needed):

```sentrie
policy P {
  fact user: User
  rule isAdmin = default false { yield user.role == "admin" }
  rule canEdit = default false { yield isAdmin }
  export decision of canEdit
}
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Facts must be declared before rules; only facts or comments may precede fact declarations. At least one rule must be exported for the policy to be executable or importable. Rules in the same policy may reference each other by name without import.
- **Policy name:** The policy name is an identifier. The same namespace may contain multiple policies. Each has its own facts, let, use, and rules.
- **Export target:** Exported rule names are the targets for the CLI/API and for `import decision of` from other policies. When importing, the binding (e.g. `with` clause) uses the rule name as defined in the target policy (and fact names/aliases as in that policy).
- **Evaluation:** When a decision is requested, the runtime evaluates the chosen rule (with facts bound). Only that rule’s body or default is run; other rules are not evaluated unless the chosen rule references them.
