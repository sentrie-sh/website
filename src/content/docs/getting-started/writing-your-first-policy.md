---
title: Writing your first Policy
description: Learn how to write your first Sentrie policy
---

This guide will walk you through creating your first Sentrie policy step by step.

## Basic Policy Structure

A Sentrie policy consists of:

1. **Namespace**: A container for related policies
2. **Policy**: A named collection of rules
3. **Rules**: Individual decision logic
4. **Facts**: Input data for the policy

## Create a Policy Pack

```sh
mkdir my-first-policy-pack
cd my-first-policy-pack
sentrie init my-first-policy-pack
```

:::note
The name of the policy pack does not need to match the directory name.
:::

## Define a Namespace

```diff lang=sentrie
// first-policy.sentrie
+ namespace user_management
```

> Every file MUST contain a namespace declaration.

## Define a Shape

```diff lang=sentrie
// first-policy.sentrie
namespace user_management

+ shape User {
+   role: string
+   status: string
+ }

```

:::note
Shapes are used to define data structures. More information about shapes can be found in the [Types and Shapes](/reference/types-and-shapes/) reference.
:::

## Define a Policy

```diff lang=sentrie
// first-policy.sentrie
namespace user_management

shape User {
  role: string
  status: string
}

+ policy user_access {
+   -- policy content goes here
+ }
```

## Add Facts

:::note
A fact is a named value that can be injected into policy evaluation at runtime.
:::

```diff lang=sentrie
// first-policy.sentrie
namespace user_management

shape User {
  role: string
  status: string
}

policy user_access {
+  fact user!:User default {"role": "admin", "status": "active"}
}

```

:::note
A fact is optional by default. The `!` suffix indicates that the fact is required. If a required fact is not provided, the rule evaluation will result in an error.
:::

## Add your first rule

```diff lang=sentrie
// first-policy.sentrie
namespace user_management

shape User {
  role: string
  status: string
}

policy user_access {
  fact user!:User default {"role": "admin", "status": "active"}

+  rule allow_admin = {
+    yield user.role == "admin"
+  }
}
```

## Add your second rule

```diff lang=sentrie
// first-policy.sentrie
namespace user_management

shape User {
  role: string
  status: string
}

policy user_access {
  fact user!:User default {"role": "admin", "status": "active"}

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
namespace user_management

shape User {
  role: string
  status: string
}

policy user_access {
  fact user!:User default {"role": "admin", "status": "active"}

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
namespace user_management

shape User {
  role: string
  status: string
}

policy user_access {
  fact user!:User default {"role": "admin", "status": "active"}

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
namespace user_management

shape User {
  role: string
  status: string
}

policy user_access {

  fact user!:User default {"role": "admin", "status": "active"}

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
