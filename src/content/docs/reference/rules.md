---
title: Rules
description: Rules are a way to organize your rules and facts.
---

Rules form the core principle of policies in Sentrie. A policy is essentially a collection of rules and their outcome decisions that work together to make business decisions. Understanding how rules function is fundamental to building effective Sentrie policies.

## The Foundation of Policies

Since rules are the building blocks that define business logic, every Sentrie policy must contain at least one exported rule.

A rule must be exported to be executed by the runtime or to be imported and used in other policies. This export mechanism enables modular policy design where complex business logic can be broken down into reusable component rules.

## Rule Structure and Evaluation

Rules consist of three essential components:

- a **body** (required)
- a **default** (optional)
- a **when predicate** (optional)

The `when` predicate acts as a gatekeeper, determining whether the rule's `body` should be evaluated or if the `default` should be used instead.

When the `when` condition evaluates to [truthy](/reference/trinary), the rule's body is executed to produce the final decision. If the `when` condition is not [truthy](/reference/trinary), the rule falls back to its `default` value. A rule can have one of the three possible outcomes any rule can have: `TRUE`, `FALSE`, or `UNKNOWN`.

```typescript
is_truthy(when) ? body : default
```

:::note[Remember]
If no `default` is provided and `when` is not [truthy](/reference/trinary), the rule's outcome falls back to `unknown`.
:::

The syntax of a rule and of a contribution to it:

```text
rule IDENT [ : type ] = [ default expr ] [ when expr ] { stmt* yield expr }

contribute IDENT [ when expr ] { stmt* yield expr }
```

The optional `: type` declares the type of the rule's result, and is required before the rule can take [contributions](#contributing-to-a-rule). See [Declaring a rule's type](#declaring-a-rules-type).

### Example Rule

```sentrie
namespace com/example/auth

policy user {
  rule isAdmin = default false when user.role is defined {
    yield user.role is "admin" or user.role is "super_admin"
  }
  export decision of isAdmin attach role as user.role
}
```

:::note[Remember]

- `when` and `default` are optional
- `when` is `true` by default
- `default` is `unknown` by default
- If `when` is not [truthy](/reference/trinary) and no `default` is provided, the rule's outcome is `unknown`

:::

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

A declared type is checked against the rule's body and its `default`. With `user.score` set to `7` the rule above yields `7`; with `"high"` the evaluation fails with `value high is not a number`; and when `user.active` is false it falls back to the `default`, `0`. A value that is undefined, or a `when` that does not hold with no `default`, is not checked. Typed `let` declarations and derive and lambda return types treat undefined the same way; see [Intermediate Values](/reference/let#typed-let-and-undefined). Shape fields differ: an optional field holding undefined is treated as omitted, and a required one counts as missing; see [Shapes](/reference/shapes#field-optionality-and-nullability).

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

## Sharing Rules Across Policies

Rules can be exported as decisions, making them available for consumption in other policies. This enables powerful policy composition where complex business decisions can be built by combining simpler, focused rules. When exporting a rule as a decision, you can attach named data that callers can access and consume.

Exported rules can include named attachments that provide additional context or metadata about the decision. These attachment values must be proactively consumed by the calling policy, ensuring that important information isn't lost in the decision-making process.

### Example

```sentrie
// auth/auth.sentrie
namespace com/example/auth

policy base {
  fact user: User as u -- alias for the user fact

  rule isAdmin = default false when user.role is defined {
    yield user.role is "admin" or user.role is "super_admin"
  }
  export decision of isAdmin attach role as user.role
}
```

```sentrie
// user/user.sentrie
namespace com/example/user

policy user_access {
  fact user: User as user

  rule isAdmin = import decision of isAdmin from com/example/auth/base with u as user
}
```

## Importing and Sandboxing

Rules can be imported from other policies, but this process involves careful isolation to maintain policy boundaries. When importing a rule decision, you must inject the necessary facts that the imported rule needs to evaluate. Crucially, imported rules are evaluated in their own sandboxed environment, which means they cannot affect or modify the context of the calling policy.

This sandboxing only applies to rules imported from other policies. Rules within the same policy can reference each other directly without import restrictions, allowing for efficient internal policy organization while maintaining security boundaries between different policy modules.

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

## Practical Examples

Let's explore how these concepts work in practice through various rule patterns and scenarios.

### Basic Rule Patterns

The simplest rule pattern involves explicit boolean outcomes. Here's a rule that always allows login:

```sentrie
policy auth {
  rule allow_login = {
    yield true
  }
  export decision of allow_login
}
```

More sophisticated rules use the `when` predicate to conditionally evaluate expensive operations. Consider a feature flag rule that defaults to false for non-beta users, avoiding unnecessary computation:

```sentrie
policy feature {
  rule enable_feature = default false when user.is_beta == false {
    yield someExpensiveCheck()
  }
  export decision of enable_feature
}
```

When a rule's `when` condition is false and no `default` is provided, the outcome becomes UNKNOWN. This pattern is useful for gated functionality:

```sentrie
policy gated {
  rule gated_rule = when system.ready == false {
    yield true
  }
  export decision of gated_rule
}
```

Rules can also leverage truthiness evaluation for cleaner code. This session validation rule returns true if the session ID is non-empty:

```sentrie
policy auth {
  rule has_session = default false when true {
    yield session.id  // Truthy if non-empty string
  }
  export decision of has_session
}
```

### Policy Composition and Attachments

Rules become powerful when composed across policies. Here's how to export a decision with additional context through attachments:

```sentrie
// shapes.sentrie
namespace com/example/auth

shape Account {
  balance: number
}

shape Invoice {
  total: number
}
```

```sentrie
// billing.sentrie
namespace com/example/billing

policy billing {
  fact account: Account as account
  fact invoice: Invoice as invoice

  let reason = account.balance >= invoice.total ? "insufficient_funds" : "sufficient_funds"
  let balance = account.balance

  rule payment_ok = default false {
    yield reason
  }

  export decision of payment_ok
    attach reason as reason
    attach balance as balance
}
```

When importing this decision, you inject the necessary facts and receive the decision in a sandboxed environment:

```sentrie
policy shipping {
  fact account: Account as account
  fact invoice: Invoice as invoice

  rule payment_reason_consumed = import decision of payment_ok from com/example/billing
    with account as account
    with invoice as invoice

  export decision of payment_reason_consumed
    attach reason as payment_ok.reason   -- access the reason attachment
    attach balance as payment_ok.balance -- access the balance attachment
}
```

This pattern enables rich policy composition where decisions carry not just boolean outcomes but also contextual information that can inform downstream authorization logic.
