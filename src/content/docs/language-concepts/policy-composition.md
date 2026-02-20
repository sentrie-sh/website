---
title: Policy Composition
description: "How exporting and importing rules work: syntax, attachments, sandboxing, and namespace resolution."
---


Policies export rules so they can be executed via CLI/API or imported by other policies. Importing a rule runs it in isolation with only the facts you supply via `with` clauses. This page describes how export and import work.

## Syntax

**Export:**
```text
export decision of ruleName
export decision of ruleName
  attach name as expression
  attach name2 as expression2
```

**Import:**
```text
rule localName = import decision of ruleName
  from namespace/policy
  with targetFact as expression
  with targetFact2 as expression2
```

## Parameters

| Element | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ruleName` | identifier | Yes | Rule being exported or imported; must be exported in the target policy. |
| `namespace/policy` | path | Yes | Fully qualified namespace and policy (e.g. `com/example/auth/userAccess`). Same-namespace: policy name only. |
| `with fact as expr` | clause | Yes for each required fact | Maps current policy expression to target policy fact name (alias). |
| `attach name as expr` | clause | No | Evaluated when rule is executed; attached to decision for importers. |

**Returns:** Exported rule’s decision (trinary or value). If attachments exist, import returns an object with the decision and attachment fields (e.g. `authResult.role`).

## Examples

### Basic Usage

```sentrie
namespace com/example/auth

policy userAccess {
  fact user: User as currentUser

  rule isAdmin = default false when user.role is defined {
    yield user.role == "admin" or user.role == "super_admin"
  }

  export decision of isAdmin
}
```

```sentrie
namespace com/example/resources

policy documentAccess {
  fact user: User as currentUser
  fact document: Document as currentDocument

  rule hasAdminAccess = import decision of isAdmin
    from com/example/auth/userAccess
    with currentUser as user

  rule canRead = default false {
    yield hasAdminAccess or document.owner == user.id
  }

  export decision of canRead
}
```

### Advanced Usage

Export with attachments; import and use them:

```sentrie
export decision of isAdmin
  attach role as user.role
  attach permissions as user.permissions
```

```sentrie
rule authResult = import decision of isAdmin
  from com/example/auth/userAccess
  with currentUser as user

rule canRead = default false {
  let userRole = authResult.role
  let userPerms = authResult.permissions
  yield authResult and userRole == "admin"
}
```

Same-namespace import (policy name only):

```sentrie
namespace com/example/auth

policy resources {
  rule admin = import decision of isAdmin
    from userAccess
    with u as user
}
```

## Behavior & Constraints

- **Export:** A policy must export at least one rule. Only exported rules are executable via CLI/API and importable. Rules in the same policy can reference each other without export.
- **Import:** The imported rule runs in a sandbox: it sees only the facts provided by `with` clauses. It cannot access the calling policy’s other facts or context. Facts are type-checked against the target policy.
- **Attachments:** Evaluated at rule execution; any expression allowed. Import side accesses via dot notation on the imported rule’s result.
- **Recursion:** Circular imports (A imports B, B imports A) are prevented and will fail.
- **Namespace:** Use full `namespace/policy` or, in the same namespace, policy name only. Fact names in `with` must match the target policy’s fact alias.

## Constraints & Edge Cases

- Rule not found: ensure the rule is exported and the namespace/policy path and rule name are correct (case-sensitive).
- Fact not found: use the target policy’s fact alias in `with`, not the original name.
- Type mismatch: the expression in `with` must evaluate to the type expected by the target policy’s fact.
- Missing attachments: check with `is defined` if an attachment may be absent before accessing it.
