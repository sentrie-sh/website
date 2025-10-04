---
title: Policies
description: Policies are the core organizational unit in Sentrie, containing rules, facts, and business logic.
---

Policies are the fundamental building blocks of Sentrie policy packs. They encapsulate business rules, define input data structures, and export decision outcomes that can be consumed by applications or other policies.

## Policy Structure

### Basic Requirements

- **Namespace**: Every policy must belong to a namespace
- **Export**: Must export at least one decision (rule outcome)
- **Rules**: Must declare one or more rules for decision logic

### Core Components

- **Facts**: Input data declarations with types and defaults
- **Variables**: Intermediate calculations using `let` statements
- **Rules**: Decision logic with conditions and outcomes
- **Extendible**: External TypeScript functions via `use` statements
- **Exports**: Rule outcomes for external consumption

## Policy Declaration

### Basic Syntax

```sentrie
namespace com/example/domain

policy policyName {
  // Policy body
}
```

### Complete Example

```sentrie
// user-access.sentrie
namespace com/example/auth

shape User {
  id!: string
  role!: string
  permissions!: list[string]
}

shape Resource {
  id!: string
  type!: string
  owner!: string
}

policy userAccess {
  use { verifySignature, isBusinessHours } from "./auth-utils.ts" as auth

  fact user!: User as user default { "id": "", "role": "guest", "permissions": [] }
  fact resource!: Resource as resource default { "id": "", "type": "document", "owner": "" }

  let isResourceOwner = user.id == resource.owner
  let hasValidSignature = auth.verifySignature(user.id, resource.id)
  let isWithinBusinessHours = auth.isBusinessHours()

  rule canRead = default false when (resource.type == "document") {
    yield isResourceOwner and hasValidSignature
  }

  rule canWrite = default false when (resource.type == "document") {
    yield isResourceOwner and hasValidSignature and isWithinBusinessHours
  }

  rule canAccess = canRead or canWrite

  export decision of canAccess
}
```

## Policy Components

### Use Statements

```sentrie
-- Import TypeScript functions
use { function1, function2 } from "./utils.ts" as utils
use { validateEmail } from "./validation.ts" as validators
```

### Fact Declarations

```sentrie
-- Required facts with defaults
fact user!: User as user default { "id": "", "role": "guest" }
fact resource!: Resource as resource default { "id": "", "type": "document" }

-- Optional facts
fact context: Context as context default { "key": "value" }
```

:::note
Read more on facts [here](/reference/facts).
:::

### Variable Declarations

```sentrie
-- Simple calculations
let isAdmin = user.role == "admin"
let totalPrice = item.price * quantity

-- Complex logic
let canAccess = user.active and
                (user.role == "admin" or user.permissions contains "read")
```

### Rule Declarations

```sentrie
-- Basic rule
rule canRead = default false {
  yield user.role == "admin"
}

-- Conditional rule
rule canWrite = default false when (user.active) {
  yield user.role == "admin" and user.verified
}

-- Composite rule
rule canAccess = canRead or canWrite
```

:::note
Read more on rules [here](/reference/rules).
:::

### Export Rule outcomes

```sentrie
-- Export rule outcome
export decision of canAccess

-- Export multiple outcomes
export decision of canRead
export decision of canWrite

-- Export with attachments
export decision of canAccess
  attach reason as "Access granted"
  attach level as user.role
export decision of canRead
  attach permissions as user.permissions
  attach timestamp as currentTime()
```

### Import Rule outcomes of other policies

```sentrie
-- Import rule from another policy
rule externalRule = import decision of ruleName
  from com/example/other/policy
  with factName as expr

-- Example
rule userPermission = import decision of canAccess
  from com/example/auth/userAccess
  with user as currentUser

-- Accessing attachments from imported rules
rule authResult = import decision of canAccess
  from com/example/auth/userAccess
  with user as currentUser
let accessReason = authResult.reason         -- Access the 'reason' attachment
let accessLevel = authResult.level           -- Access the 'level' attachment
let userPermissions = authResult.permissions -- Access the 'permissions' attachment
```

## Rule Attachments

Rule attachments allow you to include additional metadata with exported rule outcomes. This metadata can be accessed when the rule is imported by other policies.

### Exporting with Decision Attachments

```sentrie
-- Basic attachment syntax
export decision of ruleName (attach name as expression)*

-- Examples
export decision of canAccess
  attach reason as "Access granted"

export decision of canRead
  attach permissions as user.permissions
  attach timestamp as currentTime()

export decision of canWrite
  attach level as user.role
  attach department as user.department
```

### Importing and Accessing Decision Attachments

```sentrie
-- Import rule with attachments
rule importedRule = import decision of ruleName
  from com/example/policy
  with factName as expr

-- Access attachments using field accessor
let attachmentValue = importedRule.attachmentName

-- Example
rule authResult = import decision of canAccess
  from com/example/auth/userAccess
  with user as currentUser
let accessReason = authResult.reason        -- Access the 'reason' attachment
let accessLevel = authResult.level          -- Access the 'level' attachment
let userPermissions = authResult.permissions -- Access the 'permissions' attachment
```

### Practical Use Cases

```sentrie
-- Export with debugging information
export decision of canAccess attach debugInfo as "User verified" attach timestamp as currentTime()

-- Export with business context
export decision of canApprove attach approverLevel as user.role attach approvalLimit as user.maxAmount

-- Export with audit trail
export decision of canDelete attach auditReason as "Data retention policy" attach retentionDate as item.createdDate
```

## Best Practices for Attachments

### Use Descriptive Names

```sentrie
-- Good: Clear, descriptive attachment names
export decision of canAccess attach accessReason as "User has admin role" attach accessLevel as user.role

-- Avoid: Generic or unclear names
export decision of canAccess attach info as "ok" attach data as user.role
```

### Keep Attachments Relevant

```sentrie
-- Good: Only include necessary metadata
export decision of canApprove attach approverLevel as user.role attach approvalLimit as user.maxAmount

-- Avoid: Including unnecessary or sensitive data
export decision of canApprove attach approverLevel as user.role attach userPassword as user.password
```

### Use Consistent Naming Conventions

```sentrie
-- Good: Consistent naming pattern
export decision of canRead
  attach readReason as "User has read permission"
  attach readLevel as user.role

export decision of canWrite
  attach writeReason as "User has write permission"
  attach writeLevel as user.role

-- Good: Use meaningful prefixes
export decision of canAccess
  attach accessReason as "Access granted"
  attach accessLevel as user.role
```

### Handle Missing Attachments Gracefully

```sentrie
-- Check if attachment exists before accessing
rule authResult = import decision of canAccess
  from com/example/auth/userAccess
  with user as currentUser

let reason = authResult.reason is defined ? authResult.reason : "No reason provided"
let level = authResult.level is defined ? authResult.level : "unknown"
```

### Use Attachments for Debugging

```sentrie
-- Include debugging information in development
export decision of canAccess attach debugInfo as "User verified: " + user.id attach timestamp as currentTime()

-- In production, you might remove or simplify debug attachments
export decision of canAccess attach timestamp as currentTime()
```

### Document Attachment Usage

```sentrie
-- Document what attachments are available
policy userAccess {
  -- Exports canAccess with attachments:
  -- - reason: Human-readable explanation
  -- - level: User's access level
  -- - timestamp: When decision was made
  export decision of canAccess
    attach reason as "Access granted"
    attach level as user.role
    attach timestamp as currentTime()
}
```

### Avoid Overusing Attachments

```sentrie
-- Good: Focused, essential attachments
export decision of canAccess
  attach reason as "Access granted"
  attach level as user.role

-- Avoid: Too many attachments that clutter the interface
export decision of canAccess
  attach reason as "Access granted"
  attach level as user.role
  attach timestamp as currentTime()
  attach debugInfo as "User verified"
  attach sessionId as user.sessionId
  attach requestId as request.id
```

### Use Proper Alignment

```sentrie
-- Good: Align attachments for readability
export decision of canAccess
  attach reason as "Access granted"
  attach level as user.role
  attach timestamp as currentTime()

-- Good: Align import statements for readability
rule authResult = import decision of canAccess
  from com/example/auth/userAccess
  with user as currentUser

-- Avoid: Single line when it becomes too long
export decision of canAccess attach reason as "Access granted" attach level as user.role attach timestamp as currentTime() attach debugInfo as "User verified"
```

## Policy Interactions

### Rule Composition

```sentrie
-- Combine multiple rules

let isBusinessHours = ...

rule canRead = ...
rule canWrite = ...
rule complexAccess = { yield canRead and canWrite and isBusinessHours }

-- Conditional composition
rule conditionalAccess = { yield user.role == "admin" ? canAccess : canRead }
```

### Cross-Policy Dependencies

```sentrie
-- Import from another policy
rule authResult = import decision of authenticate
  from com/example/auth/login
  with user as currentUser

-- Use imported result
rule canProceed = authResult and user.verified
```

## Best Practices

### Clear Naming

```sentrie
-- Good: Descriptive policy and rule names
policy userAccessControl {
  rule canReadDocument = default false { /* ... */ }
  rule canWriteDocument = default false { /* ... */ }
}

-- Avoid: Generic names
policy policy1 {
  rule rule1 = default false { /* ... */ }
}
```

### Logical Organization

```sentrie
-- Group related rules
policy documentAccess {
  rule canRead = default false { /* read logic */ }
  rule canWrite = default false { /* write logic */ }
  rule canDelete = default false { /* delete logic */ }

  rule canAccess = canRead or canWrite or canDelete
}
```

### Error Handling

```sentrie
-- Provide sensible defaults
rule canAccess = default false when (user is defined and resource is defined) {
  yield user.active and user.verified
}
```

### Documentation

```sentrie
-- Document complex logic
policy complexBusinessLogic {
  -- This rule implements the company's access control policy
  -- Users must be active, verified, and have appropriate role
  rule canAccess = default false {
    yield user.active and user.verified and user.role in ["admin", "manager"]
  }
}
```
