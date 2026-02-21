---
title: Trinary Values
description: "Three-valued logic: true, false, unknown; truthiness and Kleene tables."
---


Sentrie uses trinary logic: `true`, `false`, and `unknown`. Unknown represents indeterminate truth (e.g. undefined field access). Logical operators follow Kleene's three-valued logic.

## Syntax

Literals: `true` | `false` | `unknown`

Logical: `and` | `or` | `xor` | `not` | `!`

**Returns:** Trinary. For `when` and conditionals: only `true` is truthy; `false` and `unknown` are not.

## Concepts

Truthiness: only `true` is truthy. `false` and `unknown` are non-truthy (e.g. for `when`, ternary, Elvis).

## Examples

### Basic Usage

```sentrie
let a = true and unknown   -- unknown
let b = false or unknown  -- unknown
let c = not unknown       -- unknown
```

### Kleene AND

| AND | true | false | unknown |
| --- | --- | --- | --- |
| true | true | false | unknown |
| false | false | false | false |
| unknown | unknown | false | unknown |

### Kleene OR

| OR | true | false | unknown |
| --- | --- | --- | --- |
| true | true | true | true |
| false | true | false | unknown |
| unknown | true | unknown | unknown |

### NOT

| Input | Output |
| --- | --- |
| true | false |
| false | true |
| unknown | unknown |

## Behavior & Constraints

- Undefined field access yields unknown; operations on unknown propagate unknown per Kleene tables.
- Rule `when` and ternary/Elvis use truthiness: only `true` is truthy.

## Constraints & Edge Cases

- `unknown` in a `when` causes the rule to use its default (or `unknown` outcome). `not unknown` is `unknown`.
