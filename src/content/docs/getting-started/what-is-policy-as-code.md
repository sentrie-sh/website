---
title: What is Policy as Code?
description: Understanding Policy as Code concepts
---

Policy as Code is a practice of managing and automating policies using code. Instead of manually configuring policies through user interfaces or configuration files, you write policies as code that can be versioned, tested and deployed like any other software.

In contrast to general purpose programming languages, the Sentrie policy language is purpose-built for managing and automating policies. It is designed to be both human-readable and machine-optimized. Policies written in the Sentrie policy language are **declarative descriptions** of rules and their outcomes. This enables policy designers to focus on the business rules and their outcomes instead of the implementation details.

## Benefits of Policy as Code

- **Version Control**: Policies can be versioned and tracked in an environment agnostic version control system.
- **Auditability**: Complete history of policy changes.
- **Automation**: Policies can be applied and enforced without having to worry about implementation details.
- **Testing**: Policies can be unit tested and validated.
- **Collaboration**: Teams can review and collaborate on policy changes.
- **Consistency**: Ensures consistent policy application across environments.
- **Separation of Concerns**: Policies can be written by policy engineers and applied by operations engineers.

## How Sentrie Implements Policy as Code

Sentrie allows you to write policies using a domain-specific language (DSL) that is:

- **Declarative**: You describe what should be true, not how to check it.
- **Composable**: Policies and Rules can be built from smaller, reusable components.
- **Testable**: Policies can be validated against test data.
- **Performant**: Sentrie optimizes the evaluation of data and rules for performance.

## Example Policy

```sentrie
// user-management.sentrie
namespace com/example/user_management

shape User {
  role: string @in("admin", "user")
  status: string @in("active", "inactive")
}

policy access_control {
  fact user!: User

  rule admin_access = user.role == "admin"

  -- a rule body can be a block as well. This is useful for complex logic.
  rule user_access = {
    let role = user.role
    let status = user.status

    -- blocks MUST yield a value
    yield role == "user" and status == "active"
  }

  export decision of admin_access
  export decision of user_access
}

```

Run the policy:

```bash
sentrie exec com/example/user_management/access_control
  --facts '{"user": {"role": "admin", "status": "active"}}'
```

This policy defines access control rules that can be evaluated against user data to determine permissions.
