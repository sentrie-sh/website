---
title: Writing your first Policy
description: "Minimal policy structure: namespace, policy, shape, facts, rules, exports."
---

When you need to define who can do what (or any decision your app will enforce), you describe it in a Sentrie policy: one namespace per file, shapes for your input data, and policies that declare facts, rules, and exports. This guide walks you through creating your first pack step by step. For full syntax, validation, and how multiple **`tag`** lines are indexed, see the [Policy metadata](/reference/policy-metadata/) reference.

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

A policy consists of (in this order; see [Policy metadata](/reference/policy-metadata/) and [Policies](/reference/policies/)):

- **Metadata** (optional): `title`, `description`, `version`, and one or more `tag` string literals for humans and tooling—they do not affect evaluation.
- **Facts**: Input data for the policy (before any `use` if you import modules).
- **Rules**: Individual decision logic.
- **Exports**: Rules that are exported to make them available for external evaluation.

## Create a Policy Pack

```sh
mkdir my-first-policy-pack
cd my-first-policy-pack
sentrie init my-first-policy-pack
```

## Define a Namespace

```diff lang=sentrie
// first-policy.sentrie
+ namespace com/example/user_management
```

:::note[Remember]
Every file MUST contain a namespace declaration and **MUST** be the first statement in the file.
:::

## Define a Policy

```diff lang=sentrie
// first-policy.sentrie
namespace com/example/user_management

+ policy user_access {
+   -- policy content goes here
+ }
```

## Define a Shape

:::note
Shapes are used to define data structures and aliases. More information about shapes can be found in the [Shapes](/reference/shapes/) reference.
:::

```diff lang=sentrie
// first-policy.sentrie
namespace com/example/user_management

+ shape User {
+   role: string
+   status: string
+ }

policy user_access {
  -- policy content goes here
}

```

## Optional policy metadata

You can document the policy for registries, search, and teammates with **metadata** lines at the **top** of the policy body (still inside `policy { ... }`). Values are plain string literals only; they are **not** used when rules run. You can repeat **`tag`** with different keys. See [Policy metadata](/reference/policy-metadata/) for ordering with `fact`, `use`, and the rest of the body.

```diff lang=sentrie
// first-policy.sentrie
namespace com/example/user_management

shape User {
  role: string
  status: string
}

policy user_access {
-  -- policy content goes here
+  title "User access"
+  description "Admin and active-user access for the user management example."
+  version "1.0.0"
+  tag "domain" = "user_management"
+  tag "tier" = "example"
+
+  -- facts and rules go below
}
```


## Add Facts

:::note
A fact is a named value that can be injected into policy evaluation at runtime. Every fact MUST have a shape / type annotation.
More information about facts can be found in the [Facts](/reference/facts/) reference.
:::

```diff lang=sentrie
// first-policy.sentrie
namespace com/example/user_management

shape User {
  role: string
  status: string
}

policy user_access {
  title "User access"
  description "Admin and active-user access for the user management example."
  version "1.0.0"
  tag "domain" = "user_management"
  tag "tier" = "example"

+  fact user: User as currentUser
+  fact context?: Context as ctx default {"environment": "production"}
}

```

:::note

- Facts are **required by default** - they must be provided during execution
- Use `?` to mark facts as **optional** - optional facts can be omitted
- Only **optional facts** (`?`) can have default values
- Facts are **always non-nullable** - null values are not allowed
  :::

## Add your first rule

```diff lang=sentrie
// first-policy.sentrie
namespace com/example/user_management

shape User {
  role: string
  status: string
}

policy user_access {
  title "User access"
  description "Admin and active-user access for the user management example."
  version "1.0.0"
  tag "domain" = "user_management"
  tag "tier" = "example"

  fact user: User as currentUser
  fact context?: Context as ctx default {"environment": "production"}

+  rule allow_admin = {
+    yield currentUser.role == "admin"
+  }

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

```diff lang=sentrie
// first-policy.sentrie
namespace com/example/user_management

shape User {
  role: string
  status: string
}

policy user_access {
  title "User access"
  description "Admin and active-user access for the user management example."
  version "1.0.0"
  tag "domain" = "user_management"
  tag "tier" = "example"

  fact user: User as currentUser
  fact context?: Context as ctx default {"environment": "production"}

  rule allow_admin = {
    yield currentUser.role == "admin"
  }

  rule allow_user = {
-    yield currentUser.role == "user" and currentUser.status == "active"
+    yield allow_admin or currentUser.role == "user" and currentUser.status == "active"
  }
}
```

:::note
Here, we are using the output of the `allow_admin` rule to create the `allow_user` rule. This rule grants access if the user is an admin or a user.
:::

## Export Rules

```diff lang=sentrie
// first-policy.sentrie
namespace com/example/user_management

shape User {
  role: string
  status: string
}

policy user_access {
  title "User access"
  description "Admin and active-user access for the user management example."
  version "1.0.0"
  tag "domain" = "user_management"
  tag "tier" = "example"

  fact user: User as currentUser
  fact context?: Context as ctx default {"environment": "production"}

  rule allow_admin = {
    yield currentUser.role == "admin"
  }

  rule allow_user = {
    yield allow_admin or currentUser.role == "user" and currentUser.status == "active"
  }

+  export decision of allow_admin
+  export decision of allow_user
}
```

:::note
Rules are exported to make them available for external evaluation. This includes evaluation by the Sentrie CLI or the HTTP API. A policy MUST contain at least one exported rule.
:::

## Complete Example

Here's a complete policy that checks user access:

```sentrie
namespace com/example/user_management

shape User {
  role!: string
  status!: string
}

policy user_access {
  title "User access"
  description "Admin and active-user access for the user management example."
  version "1.0.0"
  tag "domain" = "user_management"
  tag "tier" = "example"

  fact user: User as currentUser
  fact context?: Context as ctx default {"environment": "production"}

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
