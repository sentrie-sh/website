---
title: Policy Design Best Practices
description: Practical guidance for naming, structuring, and composing Sentrie policies.
---

This page collects practical advice for designing policies that stay readable and maintainable as your system grows.

## Namespaces, policies, and rules

- **Use namespaces for domains**: e.g. `com/example/auth`, `com/example/billing`. Keep related policies in the same namespace.
- **Name policies after subjects**: e.g. `userAccess`, `documentAccess`, `pricing`, `orders`.
- **Name rules after decisions**: e.g. `allow`, `canRead`, `calculatePrice`, `isAdmin`.

This makes CLI and HTTP targets (`namespace/policy/rule`) self-explanatory.

See: [Namespaces](/reference/namespaces), [Policies](/reference/policies), [Rules](/reference/rules)

## Designing facts

- **Model real inputs**: Facts should mirror the data your callers already have (e.g. `user`, `request`, `resource`, `context`).
- **Prefer shapes over `document`**: Use shapes and field modifiers (`!`, `?`, `!?`) to describe required vs optional data precisely. It improves validation and error messages. See [Shapes](/reference/shapes).
- **Use optional facts sparingly**: Make a fact optional (`fact name?`) only when callers truly may omit it. Provide a `default` where it simplifies callers.

See: [Facts](/reference/facts)

## When to compose vs inline

Sentrie’s export/import model lets you share rules across policies.

- **Extract shared logic**: Put cross-cutting checks (e.g. “is admin”, “is active user”) into a dedicated policy and export just those rules.
- **Import rather than duplicate**: Use `import decision of ... from ... with ...` instead of copying conditions into every policy. See [Policy Composition](/language-concepts/policy-composition) and [Exporting & Importing Rules](/reference/exporting-and-importing-rules).
- **Avoid deeply nested imports**: Prefer a small number of well-known base policies over long chains of imports that are hard to follow.

## Using constraints and shapes effectively

- **Capture validation in types**: Move repeated checks (UUIDs, email addresses, ranges) into constrained shapes like `shape ID string @uuid()` or `shape Percent number @min(0) @max(100)`.
- **Constrain collections at the element type**: e.g. `list[Permission]` where `Permission` is a constrained string shape.
- **Fail early**: Let constraint failures abort evaluation rather than encoding “invalid input” conditions in rules.

See: [Constraints](/reference/constraints), [Types and Values](/reference/types-and-values)

## Integrating TypeScript modules

- **Keep policies declarative**: Use TypeScript for low-level helpers (parsing, normalization, complex calculations), and keep decision logic in Sentrie.
- **Use modules consistently**: Group helpers into a small set of modules (e.g. `utils/time.ts`, `auth/claims.ts`) and import them with clear aliases.
- **Prefer built-ins when available**: Use `@sentrie/*` modules first before adding custom equivalents. See [Using TypeScript](/reference/using-typescript) and the [TypeScript modules reference](/reference/typescript_modules).

## Testing and versioning

- **Test policies like code**: Use `sentrie exec` and `sentrie validate` in CI to catch regressions when policies change. See [Testing Policies](/guides/testing-policies).
- **Version packs**: Use the `version` field in `sentrie.pack.toml` to manage releases of your policy pack and coordinate with callers. See [`sentrie.pack.toml`](/structure-of-a-policy-pack/packfile).
- **Document contracts**: In comments near policies, describe what facts are required and what decisions mean so consumers can rely on them.

