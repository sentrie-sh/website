---
title: Writing your first Policy
description: Learn how to write your first Sentrie policy
---

This guide will walk you through creating your first Sentrie policy step by step. For full syntax, validation, and how multiple **`tag`** lines are indexed, see the [Policy metadata](/reference/policy-metadata/) reference.

## Basic Policy Structure

A Sentrie policy file consists of exactly one namespace and at least one policy:

- **Namespace**: A container for related policies.
- **Policy**: A named collection of rules.

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
- Facts can use nullable types (`T?`) when explicit `null` values are allowed
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
+    yield user.role == "admin"
+  }
}
```

## Add your second rule

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
    yield user.role == "admin"
  }

+  rule allow_user = {
+    yield user.role == "user" and user.status == "active"
+  }
}
```

## Composing Rules

Lets use the output of the `allow_admin` rule to update the `allow_user` rule.

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
    yield user.role == "admin"
  }

  rule allow_user = {
-    yield user.role == "user" and user.status == "active"
+    yield allow_admin or user.role == "user" and user.status == "active"
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
    yield user.role == "admin"
  }

  rule allow_user = {
    yield allow_admin or user.role == "user" and user.status == "active"
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
    yield user.role == "admin"
  }

  rule allow_user = {
    yield allow_admin or user.role == "user" and user.status == "active"
  }

  export decision of allow_admin
  export decision of allow_user
}
```

## Next Steps

Now that you've written your first policy, learn how to [run your policy](/getting-started/running-your-policy/) to see it in action.
