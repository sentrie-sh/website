---
title: Rules
description: "Rule syntax, when/default/body evaluation, outcome type, and cross-references."
---

A rule defines a single named decision: an optional `when` guard, an optional `default` value when the guard is not truthy, and a body that must contain exactly one `yield`. If the `when` expression is truthy, the body is evaluated and its `yield` value is the rule’s outcome; otherwise the outcome is the `default` (or `unknown` if no default is given). Rules are the only construct that can be exported for execution or import.

## Syntax

```text
rule IDENT = [ default expr ] [ when expr ] { stmt* yield expr }
```

- **IDENT:** Rule name (identifier). Must be unique within the [policy](/reference/policies). Used when exporting (`export decision of IDENT`) and when other rules in the same policy reference it.
- **default expr:** Optional. Evaluated only when `when` is not truthy; result becomes the rule outcome. If omitted and `when` is not truthy, outcome is `unknown`.
- **when expr:** Optional. Guard; must evaluate to a [trinary](/reference/trinary) or value treated as truthy/falsy. If omitted, treated as truthy (body always runs). If present and not truthy, body is skipped and `default` (or `unknown`) is used.
- **Body:** Block of statements ending with exactly one `yield expr`. When the body runs, it must reach that `yield`; the expression’s value is the rule outcome.

## Configuration & Arguments

| Part | Type | Required | Description |
| :--- | :--- | :------- | :---------- |
| `default expr` | expression | No | Fallback outcome when `when` is not truthy. Type can be any value (e.g. bool, number, string). If omitted, non-truthy `when` yields `unknown`. |
| `when expr` | expression (trinary/truthy) | No | Guard. Evaluated first. Only if [truthy](/reference/trinary) (i.e. `true` in trinary semantics) is the body evaluated. Default when omitted: treated as true. |
| body | block | Yes | Statements (e.g. `let`) followed by exactly one `yield expr`. Only the chosen branch (body or default) is evaluated; the other is not. |

**Returns:** When the body runs: the value of `yield expr`. When the guard is not truthy: the value of `default expr`, or `unknown` if there is no default. The rule’s result type is therefore the type of the yielded expression or the default expression (or trinary when outcome is `unknown`).

## Evaluation semantics

1. **Evaluate `when`** (if present). If absent, proceed as if truthy.
2. **Truthiness:** Only `true` is truthy. `false` and `unknown` are non-truthy. So `when user.role is defined` is truthy only when the expression evaluates to `true`.
3. **If truthy:** Evaluate the body. The body must contain exactly one `yield expr`; that expression’s value is the rule outcome. Any `let` or other statements in the body are evaluated in order before the `yield`.
4. **If not truthy:** Do not evaluate the body. The outcome is `default expr` if present, otherwise `unknown`.

## Examples in Action

### Rule with default only (no when)

```sentrie
rule allow = default false { yield true }
```

Guard is effectively true; body runs and yields `true`.

### Rule with when and default

```sentrie
rule isAdmin = default false when user.role is defined {
  yield user.role == "admin"
}
```

If `user.role` is not defined (or expression is false/unknown), outcome is `false`. Otherwise outcome is the result of `user.role == "admin"`.

### Rule yielding a value (not just bool)

```sentrie
rule getPrice = default 0 when product.price is defined {
  let base = product.price
  let discount = user.isPremium ? 0.1 : 0.05
  yield base * (1 - discount)
}
```

Outcome type is number. Default `0` is used when `product.price` is not defined or when the guard is otherwise non-truthy.

### Rule referencing another rule in the same policy

```sentrie
rule isAdmin = default false when user.role is defined { yield user.role == "admin" }
rule canEdit = default false { yield isAdmin }
export decision of canEdit
```

`canEdit`’s body evaluates `isAdmin`, which runs with the same facts. So the outcome of `canEdit` is the outcome of `isAdmin` in this example.

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Evaluation:** Semantics are `is_truthy(when) ? body_result : default`. Truthiness follows [trinary](/reference/trinary) semantics: only `true` is truthy.
- **Body:** Must contain exactly one `yield expr` when the body is evaluated. Only the chosen branch (body or default) is evaluated; the other is not.
- **Rules in same policy:** Can reference other rules by name (e.g. `yield isAdmin`). No import needed. Exported rules can be invoked from the CLI/API or [imported](/language-concepts/policy-composition) from other policies.
- **No default and non-truthy when:** If there is no `default` and `when` is not truthy, the outcome is `unknown`.
- **Recursion:** Rule evaluation is bounded by the language; unbounded recursion is not allowed.
