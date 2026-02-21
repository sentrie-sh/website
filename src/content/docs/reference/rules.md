---
title: Rules
description: Rule syntax, evaluation (when/default/body), and outcome (trinary or value).
---


When you need to define a single decision (e.g. allow/deny or a computed value) that can depend on a condition and a fallback, you write a rule. A rule has an optional `when` guard, an optional `default`, and a body that must contain `yield`. If `when` is truthy the body is evaluated; otherwise the `default` (or `unknown`) is used.

Here is the basic syntax:

## Syntax

```text
rule IDENT = [ default expr ] [ when expr ] { stmt* yield expr }
```

## Configuration & Arguments

| Part | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `default expr` | expression | No | Used when `when` is not truthy; default is `unknown` if omitted. |
| `when expr` | trinary | No | Guard; if not truthy, rule outcome is `default`. Default when omitted is true. |
| body | block | Yes | Must contain exactly one `yield expr`. |

**Returns:** The `yield` expression value when body runs, else `default` (or `unknown`). Type is trinary or any value type.

## Examples in Action

### Defining a single rule with a default

```sentrie
rule allow = default false { yield true }
rule isAdmin = default false when user.role is defined { yield user.role == "admin" }
```

### Using when and TypeScript in a rule

```sentrie
rule getPrice = default 0 when product.price is defined {
  let base = product.price
  let discount = user.isPremium ? 0.1 : 0.05
  yield base * (1 - discount)
}
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- Evaluation: `is_truthy(when) ? body_result : default`. Truthy follows [trinary](/reference/trinary) semantics.
- Body must yield exactly once when evaluated. Only the chosen branch (body or default) is evaluated.
- Rules in the same policy can reference other rules by name. Exported rules can be imported elsewhere.


- If no `default` and `when` is not truthy, outcome is `unknown`.
- Recursion in rule evaluation is bounded by the language (no unbounded recursion).
