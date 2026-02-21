---
title: Writing your first Policy
description: "Minimal policy structure: namespace, policy, shape, facts, rules, exports."
---

A Sentrie policy file contains one namespace and one or more policies. Each policy declares facts (inputs), rules (decision logic), and exports (rules exposed for evaluation). This page gives the minimal structure and a complete example.

## Syntax

```text
namespace SLUG

shape ShapeName { field!: type  field?: type }

policy IDENT {
  fact name: Type [ as alias ]
  fact name?: Type [ as alias ] [ default expr ]
  rule ruleName = [ default (true|false) ] [ when condition ] { yield expr }
  export decision of ruleName
}
```

- File must start with exactly one `namespace`. One or more `shape` and `policy` blocks follow.
- Policy must have at least one `rule` and at least one `export decision of`.

## Concepts

| Concept   | Required | Description                                                                                                         |
| :-------- | :------- | :------------------------------------------------------------------------------------------------------------------ |
| Namespace | Yes      | Single `namespace SLUG` per file; first statement. Slash-separated (e.g. `com/example/app`).                        |
| Shape     | No       | Data model for facts. Required/optional fields: `field!`, `field?`.                                                 |
| Policy    | Yes      | Named block containing facts, rules, and exports.                                                                   |
| Fact      | No       | Input to the policy. Required by default; `?` makes optional. Only optional facts may have `default`. Non-nullable. |
| Rule      | Yes (≥1) | Block that yields a decision. May reference other rules in the same policy.                                         |
| Export    | Yes (≥1) | `export decision of ruleName` makes the rule callable via CLI/API and importable.                                   |

## Examples

### Minimal policy (one rule)

```sentrie
namespace com/example/user_management

shape User {
  role!: string
  status!: string
}

policy user_access {
  fact user: User as currentUser

  rule allow_admin = default false {
    yield currentUser.role == "admin"
  }

  export decision of allow_admin
}
```

### Composing rules and exporting multiple rules

```sentrie
namespace com/example/user_management

shape User {
  role!: string
  status!: string
}

policy user_access {
  fact user: User as currentUser

  rule allow_admin = default false {
    yield currentUser.role == "admin"
  }

  rule allow_user = default false {
    yield allow_admin or (currentUser.role == "user" and currentUser.status == "active")
  }

  export decision of allow_admin
  export decision of allow_user
}
```

### Optional fact with default

```sentrie
policy user_access {
  fact user: User as currentUser
  fact context?: document as ctx default {"environment": "production"}

  rule allow = default false {
    yield currentUser.role == "admin"
  }
  export decision of allow
}
```

## Behavior & Constraints

- **File structure:** One namespace per file; namespace must be the first statement. Shapes and policies follow.
- **Facts:** Declared before rules. Required facts must be provided at evaluation time; optional facts may be omitted or have defaults.
- **Rules:** May reference other rules in the same policy by name (e.g. `yield allow_admin or ...`). At least one rule must be exported for the policy to be executable.
- **Exports:** Only exported rules are available to `sentrie exec` and the HTTP API. A policy must export at least one rule.

## Constraints & Edge Cases

- Namespace slug uses slashes (e.g. `com/example/app`). No leading/trailing slash.
- Shape field required: `field!: type`. Optional: `field?: type`.
- Fact without `?` is required; missing required fact at evaluation → error.
- Optional fact (`?`) may have `default expr`; if omitted at evaluation, default is used.
- Rule body must yield a value (e.g. `yield expr`). Default when omitted: `default false` or `default true` as declared.
