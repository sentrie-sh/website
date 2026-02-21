---
title: Writing your first Policy
description: "Minimal policy structure: namespace, policy, shape, facts, rules, exports."
---

When you need to define who can do what (or any decision your app will enforce), you describe it in a Sentrie policy: one namespace per file, shapes for your input data, and policies that declare facts, rules, and exports. This page walks through the minimal structure and a few typical scenarios.

Here is the basic syntax:

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

The file must start with exactly one `namespace`. One or more `shape` and `policy` blocks follow. Each policy must have at least one `rule` and at least one `export decision of`.

## Configuration & Arguments

You can structure a policy using these elements:

| Argument | Required | What it does |
| :------- | :------- | :----------- |
| Namespace | Yes | Single `namespace SLUG` per file; first statement. Slash-separated (e.g. `com/example/app`). |
| Shape | No | Data model for facts. Required fields: `field!`; optional: `field?`. |
| Policy | No | Named block containing facts, rules, and exports. |
| Fact | No | Input to the policy. Required by default; `?` makes optional. Only optional facts may have `default`. Non-nullable. |
| Rule | Yes (≥1) | Block that yields a decision. May reference other rules in the same policy. |
| Export | Yes (≥1) | `export decision of ruleName` makes the rule callable via CLI/API and importable. |

**Returns:** N/A (authoring). At runtime, evaluation returns the exported rule decision(s) (e.g. boolean).

---

## Examples in Action

### Defining a minimal policy with one rule

You want a single allow/deny decision based on a user shape (e.g. role). You need one namespace, one shape, one rule, and one export.

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

You want to reuse one rule inside another (e.g. “admin or active user”) and expose both outcomes so the CLI or API can call either.

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

### Using an optional fact with a default

You have a fact that is optional (e.g. context) and you want a default when the caller doesn’t supply it.

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

---

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** One namespace per file; namespace must be the first statement. Facts are declared before rules. Required facts must be provided at evaluation time; optional facts may be omitted or use defaults. At least one rule must be exported for the policy to be executable.
- **Constraint:** Only exported rules are available to `sentrie exec` and the HTTP API. Rules in the same policy may reference each other by name (e.g. `yield allow_admin or ...`).
- **Edge case:** Namespace slug uses slashes (e.g. `com/example/app`); no leading or trailing slash. Shape: `field!: type` for required, `field?: type` for optional. Fact without `?` is required; missing required fact at evaluation → error. Optional fact (`?`) may have `default expr`. Rule body must yield a value; you can declare `default false` or `default true`.
