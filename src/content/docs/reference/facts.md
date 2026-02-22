---
title: Facts
description: "Fact declaration syntax (required/optional, type, alias, default) and binding at evaluation."
---

Facts are named, typed inputs to a [policy](/reference/policies). They are declared at the top of the policy (before [let](/reference/let), [use](/reference/functions), and [rules](/reference/rules)). Each fact has a name, a type (shape or primitive), an optional alias used in the policy body, and—only for optional facts—an optional default expression. Required facts must be supplied at evaluation time or evaluation fails. Facts are non-nullable when supplied: null is not allowed as a fact value.

## Syntax

```text
fact name : type [ as alias ] [ default expr ]    -- required
fact name? : type [ as alias ] [ default expr ]  -- optional
```

- **name / name?:** Identifier. Trailing `?` makes the fact optional; otherwise it is required.
- **type:** Any type: primitive (`number`, `string`, `trinary`, `bool`, `document`), collection (`list[T]`, `map[T]`, `record[...]`), or a [shape](/reference/shapes). The supplied value is validated against this type (and any constraints) at evaluation.
- **as alias:** Optional. Identifier used in the policy body to refer to this fact. If omitted, the body uses `name`.
- **default expr:** Optional. Allowed only for **optional** facts (`name?`). Used when the fact is omitted from the input. The expression is evaluated in the policy context (e.g. can reference other facts or policy-level let if order allows).

## Configuration & Arguments

| Part | Type | Required | Description |
| :--- | :--- | :------- | :---------- |
| `name` | identifier | Yes | Declaration name. Used in `with` bindings when another policy [imports](/language-concepts/policy-composition) this policy: the binding key must match the **alias** (or name if no `as`). |
| `name?` | - | No | `?` makes the fact optional. Optional facts may be omitted from the input; if omitted, `default expr` is used if present. |
| `type` | type ref | Yes | Type of the fact value. Can be a shape, primitive, or collection. Validation (and [constraints](/reference/constraints)) runs when the fact is bound. |
| `as alias` | identifier | No | Name used in the policy body. If absent, body uses `name`. Import `with` must use the alias (or name if no alias). |
| `default expr` | expression | No | Only for optional facts. Evaluated when the fact is omitted. Type should match the fact type (and constraints). |

**Returns:** N/A (declaration). At evaluation time, the fact name (or alias) is bound to the provided value (or default). The policy body refers to the fact by alias or name.

## Required vs optional

- **Required (`fact name : type`):** The evaluator must receive a value for this fact. If it is missing, evaluation fails (e.g. `ErrRequiredFact`). The value must not be null and must conform to the declared type and constraints.
- **Optional (`fact name? : type`):** The evaluator may omit this fact. If omitted, the fact is bound to `default expr` if present; otherwise the behavior is tooling-defined (e.g. undefined or a type-specific default). If supplied, the value must be non-null and conform to the type and constraints.

## Import binding (policy composition)

When another policy imports a decision from this policy (e.g. `import decision of RuleName from "ns" with ...`), the `with` clause binds values to the **target policy’s facts**. The key in `with` must be the **alias** of the fact (or the fact name if no `as` was used). The value must match the fact’s type and constraints.

## Examples in Action

### Required fact with alias

```sentrie
fact user: User as currentUser
```

In the policy body, use `currentUser`. When importing this policy’s decision, bind with the key `currentUser` (e.g. `with currentUser = someValue`).

### Optional fact with default

```sentrie
fact context?: Context as ctx default {}
```

If the caller omits `ctx`, it is bound to `{}`. If provided, it must be non-null and of type `Context`.

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
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Facts must be declared before rules; only facts or comments may precede fact declarations. Required facts must be supplied at evaluation or evaluation fails. Optional facts may be omitted; if supplied they must be non-null. Null is not allowed for any fact. Default is used when an optional fact is omitted.
- **Import:** When using [policy composition](/language-concepts/policy-composition), the fact name in the `with` clause must match the **alias** (or name if no `as`) in the target policy. The type of the supplied value must match the fact type (and constraints) or evaluation fails.
- **Order:** Fact declarations may reference only prior facts in their `default expr` (if the implementation allows it); typically defaults are literals or simple expressions.
