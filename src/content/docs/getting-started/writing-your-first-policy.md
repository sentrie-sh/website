---
title: Writing your first Policy
description: Learn how to write your first Sentrie policy
---

This guide will walk you through creating your first Sentrie policy step by step.

## Basic Policy Structure

A Sentrie policy file consists of exactly one namespace and at least one policy:

- **Namespace**: A container for related policies.
- **Policy**: A named collection of rules.

A policy consists of:

- **Rules**: Individual decision logic.
- **Facts**: Input data for the policy.
- **Exports**: Rules that are exported to make them available for external evaluation.

## Create a Policy Pack

```sh
mkdir my-first-policy-pack
cd example-policy-pack
sentrie init example-policy-pack
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
  fact user: User as currentUser

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
  fact user: User as currentUser

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
  fact user: User as currentUser

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

  fact user: User as currentUser

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
