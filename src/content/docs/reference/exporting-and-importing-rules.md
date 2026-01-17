---
title: "Exporting and Importing Rules"
description: "Learn how to export rules from policies and import them into other policies for code reuse and composition."
---

# Exporting and Importing Rules

Sentrie allows you to export rules from one policy and import them into another, enabling code reuse and policy composition. This guide covers how to export rules, import them, and work with attachments.

## Why Export and Import?

Exporting and importing rules enables:

- **Code Reuse**: Share common authorization logic across multiple policies
- **Policy Composition**: Build complex policies from simpler, focused rules
- **Separation of Concerns**: Keep policies focused on specific domains
- **Maintainability**: Update shared logic in one place

## Exporting Rules

### Basic Export

To make a rule available for import or execution, use the `export decision of` statement:

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

**Key Points:**
- A policy must export at least one rule
- Only exported rules can be imported by other policies or executed via the CLI/API
- Rules within the same policy can reference each other without export

### Exporting with Attachments

Attachments provide additional metadata alongside the decision:

```sentrie
namespace com/example/auth

policy userAccess {
  fact user: User as currentUser

  rule isAdmin = default false when user.role is defined {
    yield user.role == "admin" or user.role == "super_admin"
  }

  export decision of isAdmin
    attach role as user.role
    attach permissions as user.permissions
}
```

Attachments are evaluated when the rule is executed and can contain any expression.

## Importing Rules

### Basic Import

Import a rule from another policy using the `import decision` syntax:

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

### Understanding `with` Clauses

The `with` clause maps facts from your current policy to facts expected by the imported policy:

```sentrie
rule importedRule = import decision of ruleName
  from namespace/policy
  with factNameInTargetPolicy as expressionInCurrentPolicy
```

**Important:**
- The fact name (`factNameInTargetPolicy`) must match a fact declared in the target policy
- The expression (`expressionInCurrentPolicy`) is evaluated in the current policy's context
- Only facts that exist in the target policy need to be provided (optional facts can be omitted)
- Facts are evaluated in the current context and passed to the imported rule

### Accessing Attachments

When you import a rule with attachments, access them using dot notation:

```sentrie
namespace com/example/resources

policy documentAccess {
  fact user: User as currentUser

  rule authResult = import decision of isAdmin
    from com/example/auth/userAccess
    with currentUser as user

  rule canRead = default false {
    let userRole = authResult.role           -- Access the 'role' attachment
    let userPerms = authResult.permissions    -- Access the 'permissions' attachment
    yield authResult and userRole == "admin"
  }

  export decision of canRead
}
```

## Sandboxing and Isolation

Imported rules are executed in a **sandboxed environment**:

- **Isolated Execution**: The imported rule runs with only the facts you provide via `with` clauses
- **No Side Effects**: The imported rule cannot access or modify the calling policy's context
- **Type Safety**: Facts are validated against the target policy's type requirements
- **Recursion Protection**: Sentrie prevents infinite recursion in rule imports

**Example:**

```sentrie
-- Policy A
namespace com/example/auth
policy auth {
  fact user: User as u
  rule check = default false { yield u.role == "admin" }
  export decision of check
}

-- Policy B
namespace com/example/resources
policy resources {
  fact user: User as currentUser
  fact resource: Resource as r

  -- Import runs in isolation - it only sees 'u', not 'currentUser' or 'r'
  rule isAuthorized = import decision of check
    from com/example/auth/auth
    with u as currentUser

  -- 'r' is not accessible to the imported rule
  rule canAccess = default false {
    yield isAuthorized and r.owner == currentUser.id
  }

  export decision of canAccess
}
```

## Common Patterns

### Pattern 1: Authorization Base Policy

Create a base authorization policy that other policies import:

```sentrie
-- auth.sentrie
namespace com/example/auth

policy base {
  fact user: User as u

  rule isAdmin = default false when u.role is defined {
    yield u.role == "admin"
  }

  rule isUser = default false when u.role is defined {
    yield u.role == "user" and u.status == "active"
  }

  export decision of isAdmin
  export decision of isUser
}
```

```sentrie
-- resources.sentrie
namespace com/example/resources

policy documents {
  fact user: User as currentUser
  fact document: Document as doc

  rule admin = import decision of isAdmin
    from com/example/auth/base
    with u as currentUser

  rule user = import decision of isUser
    from com/example/auth/base
    with u as currentUser

  rule canRead = default false {
    yield admin or (user and doc.owner == currentUser.id)
  }

  export decision of canRead
}
```

### Pattern 2: Rich Context with Attachments

Export decisions with contextual information:

```sentrie
namespace com/example/billing

policy pricing {
  fact user: User as u
  fact product: Product as p

  rule calculatePrice = default 0 {
    let basePrice = p.price
    let discount = u.isPremium ? 0.1 : 0.05
    let finalPrice = basePrice * (1 - discount)
    yield finalPrice
  }

  export decision of calculatePrice
    attach basePrice as p.price
    attach discount as (u.isPremium ? 0.1 : 0.05)
    attach finalPrice as (p.price * (1 - (u.isPremium ? 0.1 : 0.05)))
}
```

```sentrie
namespace com/example/orders

policy orderProcessing {
  fact user: User as u
  fact product: Product as p

  rule priceInfo = import decision of calculatePrice
    from com/example/billing/pricing
    with u as u
    with p as p

  rule canPurchase = default false {
    let price = priceInfo
    let discount = priceInfo.discount
    yield price > 0 and u.balance >= price
  }

  export decision of canPurchase
}
```

### Pattern 3: Conditional Fact Injection

Provide different facts based on context:

```sentrie
namespace com/example/auth

policy conditional {
  fact user: User as u
  fact context?: Context as ctx default {}

  rule checkAccess = default false {
    yield u.role == "admin" or ctx.environment == "development"
  }

  export decision of checkAccess
}
```

```sentrie
namespace com/example/app

policy app {
  fact user: User as currentUser
  fact env: string as environment

  rule access = import decision of checkAccess
    from com/example/auth/conditional
    with u as currentUser
    with ctx as {"environment": environment}

  export decision of access
}
```

## Namespace Resolution

When importing, you can use:

1. **Full FQN**: `com/example/auth/userAccess` - explicit namespace and policy
2. **Relative to current namespace**: If the policy is in the same namespace, you can use just the policy name

```sentrie
-- Both are in com/example/auth namespace
namespace com/example/auth

policy userAccess {
  -- ...
  export decision of isAdmin
}

policy resources {
  -- Can use just policy name when in same namespace
  rule admin = import decision of isAdmin
    from userAccess
    with u as user
}
```

## Best Practices

### 1. Export Only What's Needed

```sentrie
-- Good: Export only the rules that should be reusable
policy auth {
  rule isAdmin = default false { /* ... */ }
  rule internalHelper = default false { /* ... */ }  -- Not exported

  export decision of isAdmin
}

-- Avoid: Exporting everything
export decision of isAdmin
export decision of internalHelper  -- Shouldn't be exported
```

### 2. Use Descriptive Attachment Names

```sentrie
-- Good: Clear, descriptive names
export decision of canAccess
  attach accessLevel as user.role
  attach accessReason as "User has admin role"

-- Avoid: Generic names
export decision of canAccess
  attach data as user.role
  attach info as "User has admin role"
```

### 3. Document Fact Requirements

```sentrie
-- Document what facts are required
policy auth {
  -- Requires: user (User) - the user to check
  fact user: User as u

  rule isAdmin = default false {
    yield u.role == "admin"
  }

  export decision of isAdmin
}
```

### 4. Handle Missing Attachments

```sentrie
rule authResult = import decision of canAccess
  from com/example/auth/userAccess
  with u as user

rule canProceed = default false {
  let reason = authResult.reason is defined ? authResult.reason : "Unknown"
  yield authResult and reason != ""
}
```

### 5. Avoid Circular Dependencies

```sentrie
-- Policy A imports from Policy B
-- Policy B imports from Policy A
-- This creates a circular dependency and will fail
```

## Troubleshooting

### Rule Not Found

**Error**: `Rule 'ruleName' not found in policy 'namespace/policy'`

**Solutions:**
- Verify the rule is exported in the target policy
- Check the namespace and policy names are correct
- Ensure the rule name matches exactly (case-sensitive)

### Fact Not Found

**Error**: `Fact 'factName' not found in policy 'namespace/policy'`

**Solutions:**
- Verify the fact name in the `with` clause matches the target policy's fact alias
- Check that the fact is declared in the target policy
- Remember: use the fact's alias, not its original name

### Type Mismatch

**Error**: `Type mismatch for fact 'factName'`

**Solutions:**
- Ensure the expression in the `with` clause evaluates to the correct type
- Verify the target policy's fact type matches what you're providing
- Check shape definitions match between policies

## See Also

- [Rules](/reference/rules) - Learn about rule syntax and evaluation
- [Policies](/reference/policies) - Understand policy structure
- [Facts](/reference/facts) - Learn about fact declarations
- [Namespaces](/reference/namespaces) - Understand namespace organization
