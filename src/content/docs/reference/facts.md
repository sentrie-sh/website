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

## Pack Data

Facts arrive with each request. **Pack data** is the other kind of input: static reference data that ships with the pack, such as a role table or an allowlist. A pack lists its data files in the `[data]` table of [`sentrie.pack.toml`](/structure-of-a-policy-pack/packfile/#data-optional). Each file is read once, when the pack is loaded.

```toml
[data]
roles = "data/roles.json"
allowlist = "data/allowlist.json"
```

```json
{
  "admin": ["read", "write", "delete"],
  "editor": ["read", "write"],
  "viewer": ["read"]
}
```

A policy reads an entry with a `data` declaration in the same block as its facts:

```sentrie
data <name> (':' <type>)? ('as' <exposed_name>)?
```

```sentrie
namespace com/example/access

shape RoleTable dict[list[string]]

policy permissions {
  fact role: string
  fact action: string

  data roles: RoleTable
  data allowlist as allowed_ips

  rule granted = action in roles[role]
  rule listed = "10.0.0.1" in allowed_ips

  export decision of granted
  export decision of listed
}
```

With `role` set to `"admin"` and `action` set to `"delete"`, `granted` is `true`. With `role` set to `"viewer"` it is `false`. The rule `listed` is `true`.

:::note[Note]
- `<name>` must be an entry in the pack's `[data]` table
- The optional type is checked against the loaded value. Without one, the value is used as it was read
- `as` renames the value inside the policy, the same as it does for a fact. Without `as`, the entry name is used
- A `data` declaration shares the policy's name space. It cannot reuse the name of a fact, a `let`, a rule or a `use` alias in the same policy; use `as` to pick another name
- A `data` declaration can sit anywhere in the policy header, among the `fact` or `use` statements, but before the policy body. Only `fact` must come before every `use`
- `data` is only special at the start of a policy statement. It still works as an ordinary name elsewhere, for example `fact data: dict[any]` or `data.n`
:::

### Typed Pack Data

A typed declaration is checked once, when the executor is built. `sentrie validate`, `sentrie exec` and `sentrie serve` all fail before any request is evaluated, so a mismatch never surfaces in the middle of a decision.

```sentrie
namespace com/example/access

policy permissions {
  data roles: list[string]

  rule ok = true
  export decision of ok
}
```

Here `roles` is a JSON object, so the pack is rejected:

```text
Error: pack data "roles" in policy com/example/access/permissions does not match its declared type: value map[admin:[read write delete] editor:[read write] viewer:[read]] is not an array at access.sentrie:4:3-27 - expected array
```

### Pack Data is Read-Only

Policies cannot change pack data. The value is shared by every evaluation, and a TypeScript module that receives it gets a copy, so a module cannot change what the policy sees.

### Pack Data in Derives

A `data` alias cannot be used inside the body of a [derive](/reference/derives/). Pass the value in as an argument instead:

```sentrie
namespace com/example/access

policy permissions {
  fact role: string
  fact action: string
  data roles

  let table = roles

  derive allows = (t: dict[any], r: string, a: string) => {
    yield a in t[r]
  }

  rule granted = allows(table, role, action)
  export decision of granted
}
```

With `role` set to `"editor"` and `action` set to `"write"`, `granted` is `true`. With `role` set to `"viewer"` and the same action, it is `false`.

Reading `roles` directly inside the derive is rejected:

```sentrie
namespace com/example/access

policy permissions {
  fact role: string
  data roles

  let admin = "admin"

  derive can = (r: string) => {
    yield r in roles[admin]
  }

  rule granted = can(role)
  export decision of granted
}
```

```text
Error: validation error: derive com/example/access/permissions/can: pack data is not available inside a derive ("roles"); pass it as an argument
```

### Pack Data Errors

These are rejected before any request is evaluated:

```text
Error: validation error: data "teams" at access.sentrie:4:3-13: no such entry in the pack's [data] table: index error
Error: validation error: data "allowlist" at access.sentrie:10:3-32: the pack declares no [data] table: index error
```

The first means the policy names an entry that `[data]` does not list. The second means the pack has no `[data]` table at all. Declaring a `data` name that a fact, `let`, rule or `use` alias already holds is a `conflict` error. A `data` declaration that comes after a rule, `let` or `export` is rejected with `'data' must appear before rules, exports, lets, and shapes`.

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
