---
title: What is Policy as Code?
description: Understanding Policy as Code concepts
---

Policy as Code is a practice of managing and automating policies using code. Instead of manually configuring policies through user interfaces or configuration files, you write policies as code that can be versioned, tested, and deployed like any other software.

## Benefits of Policy as Code

- **Version Control**: Policies are can be versioned and tracked in a version control system.
- **Automation**: Policies can be automatically applied and enforced.
- **Testing**: Policies can be unit tested and validated.
- **Collaboration**: Teams can review and collaborate on policy changes.
- **Consistency**: Ensures consistent policy application across environments.
- **Auditability**: Complete history of policy changes.

## How Sentrie Implements Policy as Code

Sentrie allows you to write policies using a domain-specific language (DSL) that is:

- **Declarative**: You describe what should be true, not how to check it.
- **Composable**: Policies and Rules can be built from smaller, reusable components.
- **Testable**: Policies can be validated against test data.
- **Performant**: Optimized for fast evaluation.

## Example Policy

```sentrie
// user-management.sentrie
namespace user_management

shape User {
  role: string @in("admin", "user")
  status: string @in("active", "inactive")
}

policy access_control {
  fact user: User

  rule admin_access {
    user.role == "admin"
  }

  rule user_access {
    user.role == "user" && user.status == "active"
  }

  export decision of admin_access
  export decision of user_access
}

```

Run the policy:

```bash
sentrie exec user-management/access_control
  --facts '{"user": {"role": "admin", "status": "active"}}'
```

This policy defines access control rules that can be evaluated against user data to determine permissions.
