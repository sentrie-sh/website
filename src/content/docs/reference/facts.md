---
title: Facts
description: "Fact declaration syntax: required/optional, type, alias, default."
---


Facts are named inputs to a policy. They are declared at the top of the policy (after comments and other facts). Required by default; use `?` for optional. Only optional facts may have a default. Facts are non-nullable.

## Syntax

```text
fact name : type [ as alias ] [ default expr ]   -- required
fact name? : type [ as alias ] [ default expr ]  -- optional
```

## Reference

| Part           | Type            | Required | Description                                         |
| :------------- | :-------------- | :------- | :-------------------------------------------------- |
| `name`         | identifier      | Yes      | Declaration name.                                   |
| `name?`        | -               | No       | `?` makes the fact optional.                        |
| `type`         | shape/primitive | Yes      | Type of the fact value.                             |
| `as alias`     | identifier      | No       | Name used in the policy body; default is `name`.    |
| `default expr` | expression      | No       | Only for optional facts; used when fact is omitted. |

**Returns:** N/A (declaration). At evaluation time, fact names (or aliases) are bound to the provided JSON input.

## Examples

### Basic Usage

```sentrie
fact user: User as currentUser
fact context?: Context as ctx default {}
```

### Advanced Usage

```sentrie
fact userId: string as id
fact config?: document as settings default { "env": "production" }
```

## Behavior & Constraints

- Facts must be declared before rules; only facts or comments may precede fact declarations.
- Required facts must be supplied at evaluation or evaluation fails.
- Optional facts may be omitted; if provided they must be non-null. Default is used when omitted.
- Null is not allowed for any fact.

## Constraints & Edge Cases

- Fact name in `with` for imports must match the **alias** (or name if no `as`) in the target policy.
- Type of the supplied value must match the fact type (and constraints) or evaluation fails.
