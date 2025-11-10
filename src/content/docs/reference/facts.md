---
title: Facts
description: Facts are input data declarations that provide external values to policy evaluation.
---

Facts are named input values that can be injected into policy evaluation. They serve as the primary mechanism for providing external data to policies, enabling them to make decisions based on runtime information.

:::note[Note]
If a policy uses facts, then they must be declared at the top of the policy. Facts declarations can only be preceded by other facts or comments.
:::

## Fact Declaration

### Basic Syntax

```sentrie
fact name: Type as exposedName default defaultValue
```

### Required vs Optional Facts

```sentrie
-- Required fact (must be provided during evaluation)
fact user!: User as user default { "id": "", "role": "guest" }

-- Optional fact (can be omitted)
fact context: Context as context default { "key": "value" }
```

## Fact Types and Constraints

### Primitive Types

```sentrie
fact userId: string as id default "anonymous"
fact isActive: bool as active default true
fact score: number as points default 0
fact price: number as cost default 0.0
```

### Collection Types

```sentrie
fact permissions: list[string] as userPermissions default []
fact metadata: map[string] as userMetadata default {}
fact coordinates: record[number, number] as location default [ 0.0, 0.0 ]
```

### Shape Types

```sentrie
shape User {
  id!: string
  role!: string
  permissions!: list[string]
}

fact user: User as currentUser default { "id": "", "role": "guest", "permissions": [] }
```

## Fact Modifiers

### Required Facts (`!`)

```sentrie
-- Required fact - must be provided during evaluation
fact user!: User as user default { "id": "", "role": "guest", "permissions": [] }

-- If not provided, evaluation will fail
-- Even though a default value can be provided, it is ignored for required facts
```

## Default Values

### Literal Defaults

```sentrie
-- String defaults
fact name: string as userName default "anonymous"

-- Numeric defaults
fact count: number as itemCount default 0
fact rate: number as interestRate default 0.05

-- Boolean defaults
fact enabled: bool as isEnabled default true

-- Collection defaults
fact tags: list[string] as itemTags default []
fact config: map[string] as settings default {}
```

### Shape Defaults

```sentrie
shape Product {
  id!: string
  name!: string
  price!: number
}

fact product: Product as currentProduct default {
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
-- This will cause a type error
fact user: User as user default { "id": 123 }  -- Error: string expected, got number

-- Correct usage
fact user: User as user default { "id": "123" }
```

## Best Practices

### Use Descriptive Names

```sentrie
-- Good: Clear, descriptive fact names
fact currentUser: User as user default { "id": "", "role": "guest" }
fact orderData: Order as order default { "id": "", "items": [] }

-- Avoid: Generic or unclear names
fact data: User as d default { "id": "", "role": "guest" }
```

### Provide Sensible Defaults

```sentrie
-- Good: Meaningful default values
fact user: User as user default { "id": "anonymous", "role": "guest", "permissions": [] }

-- Avoid: Confusing or invalid defaults
fact user: User as user default { "id": "", "role": "invalid", "permissions": null }
```

### Use Required Facts Sparingly

```sentrie
-- Good: Only mark truly required facts
fact user!: User as user  -- No default, must be provided

-- Avoid: Marking everything as required
fact user!: User as user default { "id": "", "role": "guest" }  -- Default ignored
```
