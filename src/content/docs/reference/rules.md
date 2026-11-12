---
title: Rules
description: "Rule syntax, when/default/body evaluation, outcome type, and cross-references."
---

A rule defines a single named decision: an optional `when` guard, an optional `default` value when the guard is not truthy, and a body that must contain exactly one `yield`. If the `when` expression is truthy, the body is evaluated and its `yield` value is the rule’s outcome; otherwise the outcome is the `default` (or `unknown` if no default is given). Rules are the only construct that can be exported for execution or import.

## Syntax

```text
rule IDENT [ : type ] = [ default expr ] [ when expr ] { stmt* yield expr }

contribute IDENT [ when expr ] { stmt* yield expr }
```

- **IDENT:** Rule name (identifier). Must be unique within the [policy](/reference/policies). Used when exporting (`export decision of IDENT`) and when other rules in the same policy reference it.
- **type:** Optional. Declares the type of the rule's result, e.g. `rule score: number = ...`. Required before the rule can take [contributions](#contributing-to-a-rule).
- **default expr:** Optional. Evaluated only when `when` is not truthy; result becomes the rule outcome. If omitted and `when` is not truthy, outcome is `unknown`.
- **when expr:** Optional. Guard; must evaluate to a [trinary](/reference/trinary) or value treated as truthy/falsy. If omitted, treated as truthy (body always runs). If present and not truthy, body is skipped and `default` (or `unknown`) is used.
- **Body:** Block of statements ending with exactly one `yield expr`. When the body runs, it must reach that `yield`; the expression’s value is the rule outcome.

## Configuration & Arguments

| Part | Type | Required | Description |
| :--- | :--- | :------- | :---------- |
| `: type` | type | No | Declared result type, checked against the body and the `default`. See [Declaring a rule's type](#declaring-a-rules-type). |
| `default expr` | expression | No | Fallback outcome when `when` is not truthy. Type can be any value (e.g. boolean, number, string). If omitted, non-truthy `when` yields `unknown`. |
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

### Rule yielding a value (not just boolean)

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

### What `default` covers

`default` replaces the outcome only when the `when` guard is not truthy. It does not replace a body that runs and yields an undefined value: the rule stays `unknown`, so a `default` never hides a problem in the body.

```sentrie
namespace docs/typed

policy P {
  fact user: document

  rule guarded = default false when user.active {
    yield user.missing
  }

  export decision of guarded
}
```

With `{"user": {"active": false}}` the guard is not truthy and the outcome is the `default`, `false`. With `{"user": {"active": true}}` the body runs, `user.missing` is undefined, and the outcome is `unknown`.

The `default` expression is evaluated only when it is used, and an error raised in it is the rule's error, like an error in the body. `default 1 / 0 when user.active` fails with `divide by zero` when `user.active` is not true. The error is reported as that rule's error; before, an error in a `default` expression was dropped and the rule reported `unknown`.

## Declaring a Rule's Type

A rule can declare the type of its result, written the same way as the type on a `let`:

```sentrie
rule score: number = default 0 when user.active {
  yield user.score
}
```

A declared type is checked against the rule's body and its `default`. With `user.score` set to `7` the rule above yields `7`; with `"high"` the evaluation fails with `value high is not a number`; and when `user.active` is false it falls back to the `default`, `0`. A value that is undefined, or a `when` that does not hold with no `default`, is not checked. Typed `let` declarations and derive and lambda return types treat undefined the same way; see [Intermediate Values](/reference/let#typed-let-and-undefined). Shape fields differ: an optional field holding undefined is treated as omitted, and a required one counts as missing; see [Shapes](/reference/shapes#field-modifiers-complex-shapes).

A declared type is optional for most rules, but a rule must declare one before other statements can [contribute](#contributing-to-a-rule) to it.

## Contributing to a Rule

Most rules compute their result in one place. Sometimes a result is easier to build from several independent conditions, such as a list of reasons for a denial. The `contribute` statement adds to a rule that was declared earlier in the same policy:

```text
contribute <rule> (when <expr>)? <block>
```

A `contribute` statement is a policy-level statement, like `rule` and `export`. It names a rule, has an optional `when` predicate, and has a block that must `yield` the value to add. A contribution can appear anywhere after the rule it names.

```sentrie
namespace com/example/access

policy checks {
  fact user: document as user

  rule deny: list[string] = []
  contribute deny when user.disabled { yield "user disabled" }
  contribute deny when user.region != "eu" { yield "region not allowed" }
  contribute deny { yield user.suspension_reason }

  export decision of deny
}
```

Executing `com/example/access/checks` with these facts:

```json
{ "user": { "disabled": true, "region": "us", "suspension_reason": "fraud" } }
```

yields `["user disabled", "region not allowed", "fraud"]` with the state `true`. With these facts:

```json
{ "user": { "disabled": false, "region": "eu" } }
```

no contribution applies, so the rule yields `[]` with the state `false`.

### Which contributions apply

A contribution is skipped, and adds nothing, when:

- its `when` predicate is not [truthy](/reference/trinary), or
- its body yields an undefined value. In the example above, the third contribution is skipped for the second set of facts because `user.suspension_reason` is not set.

`when` is optional. A contribution without one always applies unless its body yields an undefined value.

Every contribution is evaluated, even after an earlier one has applied. Contributions are applied in the order they are declared in the policy, so the same facts always produce the same combined value.

### How contributions combine

How the rule's own value and its contributions are combined depends on the declared type. A rule that takes contributions must be declared as `list[T]`, `boolean`, or `trinary`. The `?` suffix is allowed, as in `list[string]?`.

| Declared type | Result |
|---------------|--------|
| `list[T]` | The rule's own list, followed by the value of each contribution that applies, in declaration order. |
| `boolean` or `trinary` | The rule's own value combined with each contribution that applies using [`or`](/reference/trinary), following three-valued logic. For a `boolean` rule, a contribution that yields `unknown` is an error; a rule whose own `when` fails, which has no `default`, and which gets no `true` contribution reports `unknown`. |

Each contribution yields a single element for a `list[T]` rule, not a list. The element is checked against `T`.

#### Lists

A list rule starts from its own value when that value is a list. In every other case it starts from `[]`:

- the rule's `when` does not hold and the rule has no `default`,
- the rule's body yields an undefined value, or
- the rule's value is `null`, as in `rule tags: list[string]? = null`.

If the rule has a `default`, a `when` that does not hold starts the list from that `default`.

```sentrie
policy tags {
  fact user: document as user

  rule tags: list[string]? = null
  contribute tags when user.vip { yield "vip" }

  export decision of tags
}
```

With `{ "user": { "vip": false } }` this yields `[]`, and with `{ "user": { "vip": true } }` it yields `["vip"]`.

#### Booleans and trinary values

The rule below starts at `false` and becomes `true` when any contribution applies:

```sentrie
policy checks {
  fact user: document as user

  rule allow: boolean = false
  contribute allow when user.admin { yield true }
  contribute allow when user.role is "owner" { yield true }

  export decision of allow
}
```

With `{ "user": { "admin": false, "role": "member" } }` the rule is `false`. With `{ "user": { "admin": true, "role": "member" } }` or `{ "user": { "admin": false, "role": "owner" } }` it is `true`.

:::caution
If a boolean rule's own `when` does not hold and the rule has no `default`, its own value is `unknown`, and `unknown or false` is still `unknown`. Give the rule a starting value, such as `rule allow: boolean = false`, when you want `false` as the starting point.
:::

### Where contributions are visible

Contributions are combined inside the rule, before anything else reads it. Other rules that refer to the rule, [attachments](/reference/exporting-and-importing-rules#exporting-with-attachments), exports, and policies that [import its decision](/reference/exporting-and-importing-rules) all see the combined value:

```sentrie
namespace com/example/access

policy checks {
  fact user: document as user

  rule deny: list[string] = []
  contribute deny when user.disabled { yield "user disabled" }
  contribute deny when user.region != "eu" { yield "region not allowed" }

  rule allow: boolean = count(deny) == 0
  contribute allow when user.admin { yield true }

  export decision of allow
    attach reasons as deny
}
```

| Facts | `allow` | `reasons` attachment |
|-------|---------|----------------------|
| `{ "user": { "disabled": true, "region": "us" } }` | `false` | `["user disabled", "region not allowed"]` |
| `{ "user": { "disabled": true, "region": "us", "admin": true } }` | `true` | `["user disabled", "region not allowed"]` |
| `{ "user": { "disabled": false, "region": "eu" } }` | `true` | `[]` |

A contribution can read facts, `let` values, and other rules, whether they are declared before or after it.

### Errors

A contribution is checked when the pack is validated. These are reported as index errors, with the location of the contribution:

| Situation | Message (core text) |
|-----------|---------------------|
| The rule is not declared, or is declared after the contribution | `cannot contribute to unknown rule 'deny' ...: rules must be declared with 'rule' before they take contributions` |
| The rule declares no type | `the rule declares no type, but only a rule declared as list[T], boolean or trinary takes contributions` |
| The rule declares another type | `the rule declares type number, but only a rule declared as list[T], boolean or trinary takes contributions` |
| The rule imports its decision from another policy | `the rule imports its decision from another policy` |
| A literal yield has the wrong type | `contribution to rule 'deny' ... yields a number, but the rule takes string` |
| The `when` or the body reads the rule itself | `contribution to rule 'deny' ... reads the rule itself` |

A contribution that reads its own rule is rejected because the rule's value depends on the contribution. Use a separate rule if you need to inspect the combined result, as `allow` does with `count(deny)` above.

Values that are not literals are checked when the rule is evaluated. If a contribution's value does not match the element type, for example `value 5 is not a string`, or if a contribution or the declared type of the rule produces any other error, the rule fails with that error and no decision is returned for it: the rule reports an [error](#when-a-rule-fails) and an unknown decision. It never reports the rule's own value or a partly combined list.

:::note
`contribute` is a reserved keyword. It cannot be used as a rule, fact, policy, shape or let name, or as the first segment of a namespace, but it can be a field name, so `user.contribute` reads the document field called `contribute`.
:::

## When a Rule Fails

A rule can fail while it is evaluated, for example on a division by zero or a value that does not match a declared type. The failure belongs to that rule alone: its decision is `unknown`, its attachments are `null` (also when only an attachment failed), it carries an `error` object next to its output, and every other rule of the policy is still evaluated and reported.

Take this policy. `ratio` fails when `limit` is `0`, and `is_admin` does not depend on it:

```sentrie
namespace docs/checks

shape User {
  role: string
  limit: number
}

policy access {
  fact user: User

  rule is_admin = default false {
    yield user.role == "admin"
  }

  rule ratio = {
    let limit = user.limit
    yield 100 / limit
  }

  export decision of is_admin
  export decision of ratio
}
```

With the facts `{"user":{"role":"admin","limit":0}}`, the output for `ratio` is (the `trace` is left out):

```json
{
  "policy": "access",
  "namespace": "docs/checks",
  "rule": "ratio",
  "decision": { "state": "unknown", "value": "unknown" },
  "attachments": null,
  "error": {
    "title": "Evaluation Failed",
    "status": 500,
    "detail": "divide by zero"
  }
}
```

The output for `is_admin` is unchanged and has no `error` field.

| Field | Meaning |
| :---- | :------ |
| `title` | Always `Evaluation Failed`. |
| `status` | The HTTP status the failure maps to: `400` for an invalid invocation, `503` when the evaluation deadline passed, `500` otherwise. |
| `detail` | The error message. |

A rule whose whole value is a lambda is one kind of per-rule error. How the error is reported depends on how you run the policy: `sentrie exec` prints every rule and then exits `1` (see [Executing Policies](/running-sentrie/executing-policies#when-a-rule-fails)), and `sentrie serve` answers `207 Multi-Status` (see [Serving Policies](/running-sentrie/serving-policies#when-a-rule-fails)).

:::note
The order of the rules in the output, and of the errors in an error message that lists several, is not guaranteed and can differ between runs. Match results by their `rule` field, not by position.
:::

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Evaluation:** Semantics are `is_truthy(when) ? body_result : default`. Truthiness follows [trinary](/reference/trinary) semantics: only `true` is truthy.
- **Body:** Must contain exactly one `yield expr` when the body is evaluated. Only the chosen branch (body or default) is evaluated; the other is not.
- **Rules in same policy:** Can reference other rules by name (e.g. `yield isAdmin`). No import needed. Exported rules can be invoked from the CLI/API or [imported](/language-concepts/policy-composition) from other policies.
- **No default and non-truthy when:** If there is no `default` and `when` is not truthy, the outcome is `unknown`.
- **Recursion:** Rule evaluation is bounded by the language; unbounded recursion is not allowed.
- **Contributions:** A rule declared as `list[T]`, `boolean` or `trinary` can be added to with `contribute`. `contribute` is a reserved keyword. See [Contributing to a rule](#contributing-to-a-rule).
