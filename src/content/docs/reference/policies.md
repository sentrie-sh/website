---
title: Policies
description: "Policy syntax, statement order (facts, let, use, rules, export), and evaluation behavior."
---

A policy is a named block inside a [namespace](/reference/namespaces) that groups [facts](/reference/facts), optional [let](/reference/let) bindings, optional [use](/reference/functions) imports, [rules](/reference/rules), and one or more `export decision of` declarations. It defines the inputs and decision logic that the CLI or HTTP API can execute. To be runnable or importable, a policy must have at least one rule and at least one exported decision.

## Syntax

### Basic Requirements

- **Namespace**: Every policy must belong to a namespace
- **Rules**: Must declare one or more rules for decision logic
- **Export**: Must export at least one decision (rule outcome)

### Core Components

Statements inside a policy follow a **fixed grouped order** (comments may appear anywhere): optional **metadata** → optional **facts** → optional **uses** → **body** (`let`, `rule`, `export`, policy-local `shape`, …). See [Policy metadata](/reference/policy-metadata/) for `title`, `description`, `version`, and `tag`.

- **Metadata** (optional): `title`, `description`, `version`, `tag` — static strings for docs and tooling
- **Facts**: Input data with `fact` statements (**all facts before any `use`**)
- **Use**: External TypeScript functions via `use` statements (after facts, if any)
- **Variables**: Intermediate calculations using `let` statements
- **Rules**: Decision logic with conditions and outcomes with `rule` statements
- **Exports**: Rule outcomes for external consumption with `export` statements

## Policy body ordering (required)

Ignoring comments, statements inside a policy must follow this **grouped** order:

1. **Metadata block** (optional): any of `title`, `description`, `version`, `tag*`, grouped together at the top.
2. **Facts block** (optional): `fact*` — all facts before any `use`.
3. **Uses block** (optional): `use*`.
4. **Body**: `rule`, `export` (rule export), `let`, `shape`, etc.

**Comments** may appear anywhere and do **not** break these groups. **Metadata** may be separated only by comments and still count as one contiguous metadata block.

**Shapes** in a policy are **body** statements. Putting `shape` (or any body statement) before the header sections is invalid if you still need `fact` / `use` / metadata after it.

## Declaring Policies

### Basic Syntax

```sentrie
namespace com/example/domain

policy policyName {
  // Policy body
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
  title "User access control"
  description "Read/write access for documents based on ownership and auth signals"
  version "1.0.0"
  tag "domain" = "authz"
  tag "cloud" = "aws"

  fact user: User as currentUser
  fact resource: Resource as currentResource
  fact context?: Context as ctx default { "environment": "production" }

  use { verifySignature, isBusinessHours } from "./auth-utils.ts" as auth

  let isResourceOwner = currentUser.id == currentResource.owner
  let hasValidSignature = auth.verifySignature(currentUser.id, currentResource.id)
  let isWithinBusinessHours = auth.isBusinessHours()

  rule canRead = default false when (currentResource.type == "document") {
    yield isResourceOwner and hasValidSignature
  }

  rule canWrite = default false when (currentResource.type == "document") {
    yield isResourceOwner and hasValidSignature and isWithinBusinessHours
  }

  rule canAccess = canRead or canWrite

  export decision of canAccess
}
```

### Multiple facts, optional fact with default, let, and use

```sentrie
policy userAccess {
  fact user: User as currentUser
  fact context?: Context as ctx default {}
  use { sha256 } from @sentrie/hash
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
