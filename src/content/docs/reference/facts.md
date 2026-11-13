---
title: Facts
description: Facts are input data declarations that provide external values to policy evaluation.
---

Facts are named input values that can be injected into policy evaluation. They serve as the primary mechanism for providing external data to policies, enabling them to make decisions based on runtime information.

:::caution[Breaking change: facts are supplied by their declared name]
A caller supplies a fact under the name written after `fact`, never under its `as` alias. For `fact user: User as u`, send `{"user": ...}`; `u` is only the local name used inside the policy. Before this change the alias was the key, so `{"u": ...}` worked and `{"user": ...}` failed. There is no fallback: a request that still sends the alias is rejected with `required fact not found: user`, and an optional fact sent under its alias is ignored and keeps its default. The same rule applies to `--facts`, `--fact-file`, the HTTP `facts` object and the `with` clause of an import. Rename the keys your callers send, or drop the `as` alias if you want the two names to match.
:::

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
- The `exposed_name` (via `as`) is the local name used inside the policy to refer to the fact. Callers never use it
- If no `as` clause is provided, the fact name itself is used as the exposed name
- Callers supply a fact under its declared name, and the policy reads it under the alias. For `fact userRole: string as role default "guest"`, the caller sends `userRole` and the policy body reads `role`. An omitted default binds to the alias too
- Two facts of one policy cannot share a name
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

Static reference data from the pack's `[data]` table is declared with `data` statements rather than supplied per request. See [Pack data](/reference/pack-data).

## Fact Types and Constraints

### Primitive Types

```sentrie
namespace example/facts

policy primitives {
  -- Required facts (must be provided)
  fact userId: string as id
  fact isActive: boolean as active

  -- Optional facts with defaults
  fact score?: number as points default 0
  fact price?: number as cost default 0.0
  fact name?: string as userName default "anonymous"

  rule ok: boolean = active
  export decision of ok
}
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

In the policy body, use `currentUser`. Callers supply the fact as `user`, and an importing policy binds it with the key `user` (e.g. `with user as someValue`).

### Union and `any` Types

A fact can accept more than one type with a [union](/reference/types-and-values#union-types), or any value with [`any`](/reference/types-and-values#the-any-type):

```sentrie
namespace com/example/facts

policy inputs {
  fact id: string | number
  fact nick: string | number?
  fact meta?: any default {}

  rule summary = {
    yield { "id": id, "nick": nick, "meta": meta }
  }

  export decision of summary
}
```

- `{"id": "u1", "nick": null}` yields `{"id": "u1", "nick": null, "meta": {}}`. `nick` accepts `null` because its number member is nullable.
- `{"id": 5, "nick": "n", "meta": [1]}` yields `{"id": 5, "nick": "n", "meta": [1]}`.
- `{"id": null, "nick": 1}` is rejected with `fact 'id' cannot be null`, because neither member of `string | number` accepts `null`.
- `{"id": true, "nick": 1}` is rejected with `value true is not string | number`.

A fact typed `any` accepts `null` as well as every other value. It still has to be provided unless it is optional (`fact meta?: any`).

## Fact Modifiers

### Required Facts (Default)

Facts are **required by default**. They must be provided during policy execution under their declared name, and they cannot have default values. If one is missing, evaluation fails with `required fact not found: <name>` (HTTP `400`).

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
-- If no default is provided and the fact is omitted, it is undefined in the policy body (`x is defined` is `false`)
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
fact enabled?: boolean as isEnabled default true

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

### Defaults are type-checked

A literal default is checked against the fact's type when the pack is loaded, so `sentrie validate`, `exec`, `bench` and `serve` all reject it before any request runs:

```sentrie
namespace docs/bad

policy limits {
  fact limit?: number default "ten"

  rule ok = limit
  export decision of ok
}
```

```text
Error: default value of fact 'limit' at a.sentrie:4:31-36 is a string, but the fact is declared number: index error
```

`default null` on a fact whose type does not accept `null` is rejected the same way (`cannot have a null default: its type number does not accept null`). Declare the type as `number?` if `null` is intended. Only literal defaults are checked this way: a default that is computed, such as `["x"][0]`, is checked when it is evaluated and a wrong type is then a `500`, because the policy is at fault, not the caller.

## Fact Injection

### During Policy Import

```sentrie
-- Import policy with fact injection
rule authResult = import decision of canAccess
  from com/example/auth/userAccess
  with user as { "id": "123", "role": "admin", "permissions": ["read", "write"] }
```

The key in `with` must be the **declared name** of the target policy's fact, not its `as` alias. The value must match the fact's type and constraints.

A wrongly typed `with` value, a `null` for a fact that does not accept `null`, or a required fact with no `with` clause fails the **whole request** with a `400` problem document and no decisions, exactly like a wrongly typed or missing fact sent by the caller. This holds for a whole-policy request, for a request naming one rule, for `sentrie exec`, and for imports that reach the target through another import. The message names the imported policy, because the caller did not supply that fact:

```text
imported policy com/example/imp/target: fact 'n': value x is not a number: invalid invocation
imported policy com/example/imp/target: required fact not found: n
```

If two importing rules hit different `with` fact errors, the error reported is the one of the rule declared first in the policy, so the same request always gets the same message.

Any other failure inside the imported rule (an evaluation error, or the imported policy's own default failing its type) stays the importing rule's error: in a whole-policy request it appears as that rule's entry in the `207` response (see [Serving Policies](/running-sentrie/serving-policies#when-a-rule-fails)), while a request naming that one rule gets a problem document with the rule's status.

```sentrie
namespace com/example/imp

policy target {
  fact n?: number
  rule double = { yield n * 2 }
  export decision of double
}

policy caller {
  fact raw: string
  rule fine = { yield true }
  rule viaImport = import decision double from com/example/imp/target with n as raw
  export decision of fine
  export decision of viaImport
}
```

With `{"raw": "x"}`, a request for `caller` (or for `caller/viaImport`) returns `400`, even though `fine` would succeed on its own.

### Multiple Fact Injection

```sentrie
-- Inject multiple facts
rule result = import decision of processOrder
  from com/example/orders/orderProcessing
  with user as currentUser
  with order as orderData
  with context as requestContext
```

### Supplying facts

```sentrie
namespace docs/facts

shape User {
  id: string
  role: string
}

policy access {
  fact user: User as u
  fact level?: number as lv default 1
  fact note?: string

  rule is_admin = default false { yield u.role == "admin" }
  rule lvl = lv + 1
  rule has_note = note is defined

  export decision of is_admin
  export decision of lvl
  export decision of has_note
}
```

The caller sends `user` and `level`, the declared names:

```bash
sentrie exec docs/facts/access --facts '{"user":{"id":"1","role":"admin"}}'
```

`is_admin` is `true`, `lvl` is `2` (the default `1` plus one) and `has_note` is `false`, because `note` is optional with no default and is undefined when omitted. Sending the alias instead, `{"u": {...}}`, fails with `required fact not found: user: invalid invocation`. A fact of the wrong type, such as `"level": "x"`, fails with `fact 'level': value x is not a number: invalid invocation`. Over HTTP both are `400` problem documents; see [Serving Policies](/running-sentrie/serving-policies#error-responses).

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
