---
title: Facts
description: "Fact declaration syntax: required/optional, type, alias, default."
---

When you need to pass structured input into a policy (e.g. user, request, or config), you declare facts. Facts are named, typed inputs declared at the top of the policy. They are required by default; add `?` for optional. Only optional facts may have a default. Facts are non-nullable so evaluation stays predictable.

Here is the basic syntax:

```text
fact name : type [ as alias ] [ default expr ]   -- required
fact name? : type [ as alias ] [ default expr ]  -- optional
```

## Configuration & Arguments

You can customize each fact using these parts:

| Argument | Type | Required | What it does |
| :------- | :--- | :------- | :----------- |
| `name` | identifier | Yes | Declaration name. |
| `name?` | - | No | `?` makes the fact optional. |
| `type` | shape/primitive | Yes | Type of the fact value. |
| `as alias` | identifier | No | Name used in the policy body; default is `name`. |
| `default expr` | expression | No | Only for optional facts; used when the fact is omitted. |

**Returns:** N/A (declaration). At evaluation time, fact names (or aliases) are bound to the provided JSON input.

---

## Examples in Action

### Declaring a required user fact and an optional context

You need a user shape for every evaluation and an optional context that defaults when not supplied.

```sentrie
fact user: User as currentUser
fact context?: Context as ctx default {}
```

### Using primitive types and document with defaults

You have a string fact with an alias and an optional document fact for config.

```sentrie
fact userId: string as id
fact config?: document as settings default { "env": "production" }
```

---

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Facts must be declared before rules; only facts or comments may precede fact declarations. Required facts must be supplied at evaluation or evaluation fails. Optional facts may be omitted; if provided they must be non-null. Null is not allowed for any fact. Default is used when an optional fact is omitted.
- **Edge case:** Fact name in `with` for imports must match the **alias** (or name if no `as`) in the target policy. Type of the supplied value must match the fact type (and constraints) or evaluation fails.
