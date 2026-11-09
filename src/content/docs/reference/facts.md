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
- **type:** Any type: primitive (`number`, `string`, `trinary`, `bool`, `document`), collection (`list[T]`, `dict[T]`, `record[...]`), a [union](/reference/types-and-values#union-types) (`string | number`), [`any`](/reference/types-and-values#the-any-type), or a [shape](/reference/shapes). The supplied value is validated against this type (and any constraints) at evaluation.
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

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Facts must be declared before rules; only facts or comments may precede fact declarations. Required facts must be supplied at evaluation or evaluation fails. Optional facts may be omitted. `null` is accepted only for a nullable type (`T?`). Default is used when an optional fact is omitted.
- **Import:** When using [policy composition](/language-concepts/policy-composition), the fact name in the `with` clause must match the **alias** (or name if no `as`) in the target policy. The type of the supplied value must match the fact type (and constraints) or evaluation fails.
- **Order:** Fact declarations may reference only prior facts in their `default expr` (if the implementation allows it); typically defaults are literals or simple expressions.
