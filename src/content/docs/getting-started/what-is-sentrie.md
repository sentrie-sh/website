---
title: What is Sentrie?
description: What is Sentrie?
---

Sentrie is an open-source policy engine that lets you write business rules in a dedicated language. Instead of embedding policy logic in your application code, you define rules declaratively and let Sentrie evaluate them.

Sentrie promotes the use of **Policy as Code** to manage and automate policies. To understand why this is important, head over to the [What is Policy as Code?](/getting-started/what-is-policy-as-code/) page.

## How it Works

You write policies using Sentrie's domain-specific language, which is designed to be both human-readable and machine-optimized.

## Separation of Concerns

The platform separates business rules from your application code, making it easier to test, maintain and audit. This also helps in creating clear separation of concerns.

## Key Features

- **Declarative**: Express what should be true, not how to check it
- **Type-safe**: Catch errors at policy definition time
- **Fast**: Optimized evaluation with built-in caching
- **Composable**: Build complex policies from simpler rules
- **Extensible**: Use TypeScript modules for complex business logic

## Language Design Philosophy

Sentrie's language is simple and focused on expressing business rules clearly. It provides a complete runtime environment that makes policies portable and independent of your application's implementation language.

### Non-Turing Complete Design Choice

Sentrie is intentionally non-Turing complete as a design choice for policy evaluation. This limitation is actually a feature that ensures:

- **Safe execution** in production environments - no infinite loops or stack overflow
- **Predictable performance** characteristics
- **Clear auditability** of policy decisions - all computations are bounded and traceable
- **Focus on business logic** rather than arbitrary computation
- **Promote security** by preventing arbitrary code execution

This makes Sentrie well-suited for its intended purpose as a policy engine while maintaining the safety and predictability required for production policy evaluation.

### Handling Complex Policy Logic

Despite not being Turing complete, Sentrie can still handle complex policy logic. This is because the Sentrie language is designed for data evaluation rather than arbitrary computation.

The language contains a rich set of expressions and operators that can be used to express complex data transformations - with the option to use TypeScript modules for complex business logic.

```sentrie
-- Complex conditional logic
rule access = default false when user.role is defined {
  let hasPermission = user.role in ["admin", "manager"]
  let isActive = user.status == "active"
  let withinHours = currentTime.hour >= 9 and currentTime.hour <= 17

  yield hasPermission and isActive and withinHours
}

-- Collection operations
rule hasAdminUsers = default false {
  yield any users as user {
    yield user.roles contains "admin"
  }
}

-- Complex data transformations
rule calculateDiscount = default 0 {
  let basePrice = product.price
  let userDiscount = user.isPremium ? 0.15 : 0.05
  let bulkDiscount = product.quantity >= 10 ? 0.1 : 0
  let finalDiscount = userDiscount + bulkDiscount

  yield basePrice * finalDiscount
}
```
