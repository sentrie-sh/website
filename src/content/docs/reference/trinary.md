---
title: Trinary Values
description: "Three-valued logic: true, false, unknown; truthiness and Kleene tables."
---

Sentrie uses three values for logic and conditions: `true`, `false`, and `unknown`. Unknown covers cases where the result is indeterminate (e.g. an undefined field). When you write `when` guards or use ternary/Elvis, only `true` is treated as truthy; logical operators follow Kleene’s three-valued logic so unknown propagates in predictable ways.

Here is the basic syntax:

Literals: `true` | `false` | `unknown`  

Logical: `and` | `or` | `xor` | `not` | `!`

## Configuration & Arguments

Truthiness and logical outcomes work like this:

- **Truthiness:** Only `true` is truthy. `false` and `unknown` are non-truthy (e.g. for `when`, ternary, Elvis).
- **NOT:** One operand; result is trinary.

| **Input** | Output |
| --- | --- |
| **true** | false |
| **false** | true |
| **unknown** | unknown |

**Kleene AND**

| **AND** | true | false | unknown |
| --- | --- | --- | --- |
| **true** | true | false | unknown |
| **false** | false | false | false |
| **unknown** | unknown | false | unknown |

**Kleene OR**

| **OR** | true | false | unknown |
| --- | --- | --- | --- |
| **true** | true | true | true |
| **false** | true | false | unknown |
| **unknown** | true | unknown | unknown |

**Returns:** Trinary. For `when` and conditionals, only `true` is truthy; `false` and `unknown` are not.

---

## Examples in Action

### Propagating unknown in expressions

You are chaining conditions and want to see how `unknown` behaves so your rules don’t accidentally allow or deny when data is missing.

```sentrie
let a = true and unknown   -- unknown
let b = false or unknown  -- unknown
let c = not unknown       -- unknown
```

### Using unknown in a rule when

You rely on a `when` guard; if the condition is unknown (e.g. optional field missing), the rule should fall back to its default instead of treating it as true.

In practice: `unknown` in a `when` causes the rule to use its default (or an `unknown` outcome). `not unknown` remains `unknown`.

---

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Undefined field access yields `unknown`; operations on `unknown` propagate according to the Kleene tables above. Rule `when` and ternary/Elvis use truthiness: only `true` is truthy.
- **Edge case:** If a `when` evaluates to `unknown`, the rule uses its default or returns `unknown`. `not unknown` is `unknown`.
