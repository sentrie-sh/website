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

When the `when` condition evaluates to [truthy](./#non-boolean-value-interpretation), the rule's body is executed to produce the final decision. If the `when` condition is not [truthy](./#non-boolean-value-interpretation), the rule falls back to its `default` value. A rule can have one of the three possible outcomes any rule can have: `TRUE`, `FALSE`, or `UNKNOWN`.

```typescript
when ? body : default
```

:::note[Remember]
If no `default` is provided and `when` is not [truthy](./#non-boolean-value-interpretation), the rule's outcome falls back to `unknown`.
:::

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
- If `when` is not [truthy](./#non-boolean-value-interpretation) and no `default` is provided, the rule's outcome is `unknown`

:::

## Sharing Rules Across Policies

Rules can be exported as decisions, making them available for consumption in other policies. This enables powerful policy composition where complex business decisions can be built by combining simpler, focused rules. When exporting a rule as a decision, you can attach named data that callers can access and consume.

Exported rules can include named attachments that provide additional context or metadata about the decision. These attachment values must be proactively consumed by the calling policy, ensuring that important information isn't lost in the decision-making process.

### Example

```sentrie
// auth/auth.sentrie
namespace com/example/auth

policy base {
  fact user!:User as u -- alias for the user fact

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
  fact user!:User as user

  rule isAdmin = import decision of isAdmin from com/example/auth/base with u as user
}
```

## Importing and Sandboxing

Rules can be imported from other policies, but this process involves careful isolation to maintain policy boundaries. When importing a rule decision, you must inject the necessary facts that the imported rule needs to evaluate. Crucially, imported rules are evaluated in their own sandboxed environment, which means they cannot affect or modify the context of the calling policy.

This sandboxing only applies to rules imported from other policies. Rules within the same policy can reference each other directly without import restrictions, allowing for efficient internal policy organization while maintaining security boundaries between different policy modules.

## Non-Boolean Value Interpretation

Sentrie rules can work with various data types, and when a rule's body or default doesn't explicitly return `true`, `false`, or `unknown`, the system infers the `true` or `false` outcome based on the value's truthiness.

This follows the following intuitive rules:

- nil and undefined values are considered false
- boolean values are used as-is
- strings are true if they have content (length > 0)
- numbers are true if they're non-zero

For collections like slices, arrays, and maps, truthiness depends on whether they contain elements:

- Pointers and interfaces are true if they're not nil
- struct values are considered true if they represent a non-nil struct instance
- Any other value defaults to true.

Example (expressed in TypeScript-like pseudocode):

```typescript
function isTruthy(value: any): boolean {
  // nil and undefined values are considered false
  if (value === null || value === undefined) return false;

  // boolean values are used as-is
  if (typeof value === "boolean") return value;

  // strings are true if they have content (length > 0)
  if (typeof value === "string") return value.length > 0;

  // numbers are true if they're non-zero
  if (typeof value === "number") return value !== 0;

  // slices, arrays, and maps are true if they contain elements
  if (Array.isArray(value)) return value.length > 0;

  // maps and sets are true if they contain elements
  if (value instanceof Map || value instanceof Set) return value.size > 0;

  // non-nil struct-like object are true
  if (typeof value === "object") return true;

  // default to true
  return true; // default
}
```

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
  balance!: number
}

shape Invoice {
  total!: number
}
```

```sentrie
// billing.sentrie
namespace com/example/billing

policy billing {
  fact account!: Account as account
  fact invoice!: Invoice as invoice

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
  fact account!: Account as account
  fact invoice!: Invoice as invoice

  rule payment_reason_consumed = import decision of payment_ok from com/example/billing
    with account as account
    with invoice as invoice

  export decision of payment_reason_consumed
    attach reason as payment_ok.reason   -- access the reason attachment
    attach balance as payment_ok.balance -- access the balance attachment
}
```

This pattern enables rich policy composition where decisions carry not just boolean outcomes but also contextual information that can inform downstream authorization logic.
