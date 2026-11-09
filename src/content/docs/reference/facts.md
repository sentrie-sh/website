---
title: Facts
description: "Fact declaration syntax (required/optional, type, alias, default) and binding at evaluation."
---

Facts are named, typed inputs to a [policy](/reference/policies). They are declared at the top of the policy (before [let](/reference/let), [use](/reference/functions), and [rules](/reference/rules)). Each fact has a name, a type (shape or primitive), an optional alias used in the policy body, and, only for optional facts, an optional default expression. Required facts must be supplied at evaluation time or evaluation fails. A fact of type `T` rejects `null`; declare the type as `T?` when an explicit `null` is a valid value.

:::note[Note]
Facts live in the **facts** section of a policy: after optional [metadata](/reference/policy-metadata/) and before any `use`. Comments may appear anywhere. See [Policies](/reference/policies/) for full ordering.
:::

## Syntax

```text
fact name : type [ as alias ] [ default expr ]    -- required
fact name? : type [ as alias ] [ default expr ]  -- optional
```

- **name / name?:** Identifier. Trailing `?` makes the fact optional; otherwise it is required.
- **type:** Any type: primitive (`number`, `string`, `trinary`, `bool`, `document`), collection (`list[T]`, `dict[T]`, `record[...]`), or a [shape](/reference/shapes). The supplied value is validated against this type (and any constraints) at evaluation.
- **as alias:** Optional. Identifier used in the policy body to refer to this fact. If omitted, the body uses `name`.
- **default expr:** Optional. Allowed only for **optional** facts (`name?`). Used when the fact is omitted from the input. The expression is evaluated in the policy context (e.g. can reference other facts or policy-level let if order allows).

## Configuration & Arguments

| Part | Type | Required | Description |
| :--- | :--- | :------- | :---------- |
| `name` | identifier | Yes | Declaration name. Used in `with` bindings when another policy [imports](/language-concepts/policy-composition) this policy: the binding key must match the **alias** (or name if no `as`). |
| `name?` | - | No | `?` makes the fact optional. Optional facts may be omitted from the input; if omitted, `default expr` is used if present. |
| `type` | type ref | Yes | Type of the fact value. Can be a shape, primitive, or collection. Validation (and [constraints](/reference/constraints)) runs when the fact is bound. |
| `as alias` | identifier | No | Name used in the policy body. If absent, body uses `name`. Caller-supplied values and omitted defaults are both bound under the alias, so `fact userRole: string as role default "guest"` is supplied as `role`, not `userRole`. Import `with` must use the alias (or name if no alias). |
| `default expr` | expression | No | Only for optional facts. Evaluated when the fact is omitted. Type should match the fact type (and constraints). |

**Returns:** N/A (declaration). At evaluation time, the fact name (or alias) is bound to the provided value (or default). The policy body refers to the fact by alias or name.

## Required vs optional

- **Required (`fact name : type`):** The evaluator must receive a value for this fact. If it is missing, evaluation fails (e.g. `ErrRequiredFact`). The value must conform to the declared type and constraints; `null` is accepted only when the type is nullable (`T?`).
- **Optional (`fact name? : type`):** The evaluator may omit this fact. If omitted, the fact is bound to `default expr` if present; otherwise the behavior is tooling-defined (e.g. undefined or a type-specific default). If supplied, the value must conform to the type and constraints; `null` is accepted only when the type is nullable (`T?`).

## Import binding (policy composition)

When another policy imports a decision from this policy (e.g. `import decision of RuleName from "ns" with ...`), the `with` clause binds values to the **target policy’s facts**. The key in `with` must be the **alias** of the fact (or the fact name if no `as` was used). The value must match the fact’s type and constraints.

## Examples in Action

### Required fact with alias

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
```

In the policy body, use `currentUser`. When importing this policy’s decision, bind with the key `currentUser` (e.g. `with currentUser = someValue`).

### Optional fact with default

```sentrie
fact context?: Context as ctx default {}
```

If the caller omits `ctx`, it is bound to `{}`. If provided, it must be of type `Context`, which rejects `null` because the type is not `Context?`.

### Primitive and document facts

```sentrie
fact userId: string as id
fact config?: document as settings default { "env": "production" }
```

### Multiple facts, mix of required and optional

```sentrie
fact user: User as currentUser
fact request: Request as req
fact options?: Options as opts default {}

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

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Facts must be declared before rules; only facts or comments may precede fact declarations. Required facts must be supplied at evaluation or evaluation fails. Optional facts may be omitted. `null` is accepted only for a nullable type (`T?`). Default is used when an optional fact is omitted.
- **Import:** When using [policy composition](/language-concepts/policy-composition), the fact name in the `with` clause must match the **alias** (or name if no `as`) in the target policy. The type of the supplied value must match the fact type (and constraints) or evaluation fails.
- **Order:** Fact declarations may reference only prior facts in their `default expr` (if the implementation allows it); typically defaults are literals or simple expressions.
- **Pack data:** Static reference data from the pack's `[data]` table is read with a `data` declaration in the same block as facts, not supplied per request. See [Pack Data](#pack-data).
