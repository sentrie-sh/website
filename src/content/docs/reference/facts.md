---
title: Facts
description: Facts are input data declarations that provide external values to policy evaluation.
---

Facts are named input values that can be injected into policy evaluation. They serve as the primary mechanism for providing external data to policies, enabling them to make decisions based on runtime information.

:::note[Note]
Facts live in the **facts** section of a policy: after optional [metadata](/reference/policy-metadata/) and before any `use`. Comments may appear anywhere. See [Policies](/reference/policies/) for full ordering.
:::

## Fact Declaration

### Basic Syntax

```sentrie
-- Required fact (default behavior)
fact <name>: <type> ('as' <exposed_name>)?

-- Optional fact (can have default)
fact <name>?: <type> ('as' <exposed_name>)? ('default' <default_value>)?
```

:::note[Note]
- The `exposed_name` (via `as`) is the name that will be used to reference the fact when the policy is evaluated
- If no `as` clause is provided, the fact name itself is used as the exposed name
- Caller-supplied facts and omitted defaults are both stored under that **alias**. For `fact userRole: string as role default "guest"`, inject `role` (or omit it and the default binds as `role`) — not `userRole`.
- The `default` clause is only allowed for optional facts (marked with `?`)
- Facts are **required by default** - use `?` to make them optional
- Facts can use nullable types with `T?` when explicit `null` is allowed
:::

### Required vs Optional Facts

```sentrie
-- Required fact (must be provided during execution, default behavior)
fact user: User as user

-- Optional fact (can be omitted, marked with ?)
fact context?: Context as context default { "key": "value" }
```

:::note[Important]
- **Facts are required by default** - If no modifier is specified, the fact must be provided during execution
- **Use `?` to mark facts as optional** - Optional facts can be omitted
- **Use `T?` to allow null values** - Bare `T` remains non-null by default
- **Required facts cannot have default values** - Only optional facts can have defaults
- **Facts before uses:** If a policy has both `fact` and `use` statements, every `fact` must appear before the first `use`. A policy may have **uses with no facts** (skip the facts block).

:::

## Fact Types and Constraints

### Primitive Types

```sentrie
-- Required facts (must be provided)
fact userId: string as id
fact isActive: bool as active

-- Optional facts with defaults
fact score?: number as points default 0
fact price?: number as cost default 0.0
fact name?: string as userName default "anonymous"
```

### Collection Types

```sentrie
-- Required collection facts
fact permissions: list[string] as userPermissions

-- Optional collection facts with defaults
fact metadata?: dict[string] as userMetadata default {}
fact coordinates?: record[number, number] as location default [ 0.0, 0.0 ]
```

### Shape Types

```sentrie
shape User {
  id: string
  role: string
  permissions: list[string]
}

-- Required shape fact
fact user: User as currentUser

-- Optional shape fact with default
fact user?: User as currentUser default { "id": "", "role": "guest", "permissions": [] }
```

## Fact Modifiers

### Required Facts (Default)

Facts are **required by default**. They must be provided during policy execution, and they cannot have default values.

```sentrie
-- Required fact - must be provided during evaluation
fact user: User as user

-- This will cause an error: required facts cannot have defaults
-- fact user: User as user default { "id": "", "role": "guest" }  -- Error!
```

### Optional Facts (`?`)

Use the `?` operator to mark a fact as optional. Optional facts can be omitted during execution, and they can have default values.

```sentrie
-- Optional fact - can be omitted during evaluation
fact context?: Context as context

-- Optional fact with default value
fact context?: Context as context default { "key": "value" }

-- If not provided, the default value will be used (if specified)
-- If no default is provided and the fact is omitted, it simply won't be available
```

:::warning[Important]
- `T?` allows explicit `null` values for facts
- Legacy `!` syntax is not supported
- Only **optional facts** (`?`) can have default values
:::

## Default Values

### Literal Defaults

Default values can only be used with **optional facts** (marked with `?`).

```sentrie
-- String defaults (optional facts)
fact name?: string as userName default "anonymous"

-- Numeric defaults (optional facts)
fact count?: number as itemCount default 0
fact rate?: number as interestRate default 0.05

-- Boolean defaults (optional facts)
fact enabled?: bool as isEnabled default true

-- Collection defaults (optional facts)
fact tags?: list[string] as itemTags default []
fact config?: dict[string] as settings default {}
```

:::warning[Error]
Required facts cannot have default values. This will cause a compilation error:

```sentrie
-- This will cause an error
fact name: string as userName default "anonymous"  -- Error: required fact cannot have default
```
:::

### Shape Defaults

```sentrie
shape Product {
  id: string
  name: string
  price: number
}

-- Optional fact with shape default
fact product?: Product as currentProduct default {
  "id": "",
  "name": "Unknown",
  "price": 0.0
}
```

## Fact Injection

### During Policy Import

```sentrie
-- Import policy with fact injection
rule authResult = import decision of canAccess
  from com/example/auth/userAccess
  with user as { "id": "123", "role": "admin", "permissions": ["read", "write"] }
```

### Multiple Fact Injection

```sentrie
-- Inject multiple facts
rule result = import decision of processOrder
  from com/example/orders/orderProcessing
  with user as currentUser
  with order as orderData
  with context as requestContext
```

## Type Safety

### Runtime Validation

```sentrie
-- Type validation: This will cause a type error
fact user?: User as user default { "id": 123 }  -- Error: string expected, got number

-- Correct usage
fact user?: User as user default { "id": "123" }

-- Null validation depends on type nullability
fact user: User as user   -- null is invalid
fact user: User? as user  -- null is valid
```

## Best Practices

### Use Descriptive Names

```sentrie
-- Good: Clear, descriptive fact names
fact currentUser?: User as user default { "id": "", "role": "guest" }
fact orderData?: Order as order default { "id": "", "items": [] }

-- Avoid: Generic or unclear names
fact data?: User as d default { "id": "", "role": "guest" }
```

### Provide Sensible Defaults

```sentrie
-- Good: Meaningful default values for optional facts
fact user?: User as user default { "id": "anonymous", "role": "guest", "permissions": [] }

-- Avoid: Confusing or invalid defaults
fact user?: User as user default { "id": "", "role": "invalid", "permissions": null }  -- invalid because permissions is list[string]
```

### Use Required Facts Appropriately

```sentrie
-- Good: Use required facts for data that must always be provided
fact userId: string as id  -- Must be provided, no default allowed

-- Good: Use optional facts with defaults for data that has sensible fallbacks
fact context?: Context as ctx default { "environment": "production" }

-- Avoid: Making everything required when defaults would be appropriate
fact userId: string as id  -- If this often has a default, consider making it optional
fact userId?: string as id default "anonymous"  -- Better if default makes sense
```
