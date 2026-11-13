---
title: Facts
description: "Fact declaration syntax (required/optional, type, alias, default) and binding at evaluation."
---

Facts are named, typed inputs to a [policy](/reference/policies). They are declared at the top of the policy (before [let](/reference/let), [use](/reference/functions), and [rules](/reference/rules)). Each fact has a name, a type (shape or primitive), an optional alias used in the policy body, and, only for optional facts, an optional default expression. Required facts must be supplied at evaluation time or evaluation fails. A fact of type `T` rejects `null`; declare the type as `T?` when an explicit `null` is a valid value.

:::caution[Breaking change: facts are supplied by their declared name]
A caller supplies a fact under the name written after `fact`, never under its `as` alias. For `fact user: User as u`, send `{"user": ...}`; `u` is only the local name used inside the policy. Before this change the alias was the key, so `{"u": ...}` worked and `{"user": ...}` failed. There is no fallback: a request that still sends the alias is rejected with `required fact not found: user`, and an optional fact sent under its alias is ignored and keeps its default. The same rule applies to `--facts`, `--fact-file`, the HTTP `facts` object and the `with` clause of an import. Rename the keys your callers send, or drop the `as` alias if you want the two names to match.
:::

:::note[Note]
Facts live in the **facts** section of a policy: after optional [metadata](/reference/policy-metadata/) and before any `use`. Comments may appear anywhere. See [Policies](/reference/policies/) for full ordering.
:::

## Syntax

```text
fact name : type [ as alias ] [ default expr ]    -- required
fact name? : type [ as alias ] [ default expr ]  -- optional
```

- **name / name?:** Identifier. Trailing `?` makes the fact optional; otherwise it is required.
- **type:** Any type: primitive (`number`, `string`, `trinary`, `boolean`, `document`), collection (`list[T]`, `dict[T]`, `record[...]`), a [union](/reference/types-and-values#union-types) (`string | number`), [`any`](/reference/types-and-values#the-any-type), or a [shape](/reference/shapes). The supplied value is validated against this type (and any constraints) at evaluation.
- **as alias:** Optional. Identifier used in the policy body to refer to this fact. If omitted, the body uses `name`. The alias is local to the policy: callers never use it.
- **default expr:** Optional. Allowed only for **optional** facts (`name?`). Used when the fact is omitted from the input. The expression is evaluated in the policy context (e.g. can reference other facts or policy-level let if order allows). A literal default of the wrong type is rejected when the pack is validated (see [Defaults are type-checked](#defaults-are-type-checked)).

## Configuration & Arguments

| Part | Type | Required | Description |
| :--- | :--- | :------- | :---------- |
| `name` | identifier | Yes | Declaration name. The key callers supply, including the `with` bindings of a policy that [imports](/language-concepts/policy-composition) this one. Two facts of one policy cannot share a name. |
| `name?` | - | No | `?` makes the fact optional. Optional facts may be omitted from the input; if omitted, `default expr` is used if present. |
| `type` | type ref | Yes | Type of the fact value. Can be a shape, primitive, or collection. Validation (and [constraints](/reference/constraints)) runs when the fact is bound. |
| `as alias` | identifier | No | Name used in the policy body. If absent, body uses `name`. Caller-supplied values and omitted defaults are both bound to the alias inside the policy, but the caller supplies them under the declared name: `fact userRole: string as role default "guest"` is supplied as `userRole`, not `role`, and read as `role` in the body. |
| `default expr` | expression | No | Only for optional facts. Evaluated when the fact is omitted. Type should match the fact type (and constraints). |

**Returns:** N/A (declaration). At evaluation time, the fact name (or alias) is bound to the provided value (or default). The policy body refers to the fact by alias or name.

## Required vs optional

- **Required (`fact name : type`):** The evaluator must receive a value for this fact under its declared name. If it is missing, evaluation fails with `required fact not found: <name>` (HTTP `400`). The value must conform to the declared type and constraints; `null` is accepted only when the type is nullable (`T?`).
- **Optional (`fact name? : type`):** The evaluator may omit this fact. If omitted, the fact is bound to `default expr` if present; otherwise the fact is undefined in the policy body (`x is defined` is `false`). If supplied, the value must conform to the type and constraints; `null` is accepted only when the type is nullable (`T?`).

## Import binding (policy composition)

When another policy imports a decision from this policy (e.g. `import decision of RuleName from "ns" with ...`), the `with` clause binds values to the **target policy’s facts**. The key in `with` must be the **declared name** of the fact, not its `as` alias. The value must match the fact’s type and constraints.

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

### Optional fact with default

```sentrie
fact context?: Context as ctx default {}
```

If the caller omits `context`, `ctx` is bound to `{}`. If provided, it must be of type `Context`, which rejects `null` because the type is not `Context?`.

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

### Primitive and document facts

```sentrie
fact userId: string as id
fact config?: document as settings default { "env": "production" }
```

### Multiple facts, mix of required and optional

```text
fact user: User as currentUser
fact request: Request as req
fact options?: Options as opts default {}

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

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Facts must be declared before rules; only facts or comments may precede fact declarations. Required facts must be supplied under their declared name or evaluation fails (`400`). A supplied fact of the wrong type also fails (`400`). Optional facts may be omitted. `null` is accepted only for a nullable type (`T?`). Default is used when an optional fact is omitted.
- **Import:** When using [policy composition](/language-concepts/policy-composition), the fact name in the `with` clause must match the **declared name** (not the `as` alias) in the target policy. The type of the supplied value must match the fact type (and constraints) or evaluation fails.
- **Order:** Fact declarations may reference only prior facts in their `default expr` (if the implementation allows it); typically defaults are literals or simple expressions.
- **Pack data:** Static reference data from the pack's `[data]` table is read with a `data` declaration in the same block as facts, not supplied per request. See [Pack Data](/reference/pack-data).
