---
title: "Derives"
description: "Named pure functions (derives), resolution order with builtins, and export rules."
---

# Derives

A **derive** is a named, pure function attached to a namespace or to a policy. Derives are written as a `derive` binding whose value is a **lambda** (the same `=>` block syntax used for collection builtins).

## Syntax

At namespace scope (alongside policies and shapes):

```text
derive NAME = LAMBDA
export derive NAME
```

Inside a policy body (after metadata, `fact`, and `use`—the same phase as `let`, `rule`, and `shape`):

```text
derive NAME = LAMBDA
```

The right-hand side must be a lambda expression, for example:

```text
derive double = (x: number): number => {
  let t = x * 2
  yield t + 1
}
```

## Calling derives

- **Unqualified name**: `myDerive(arg1, arg2)` resolves **derive → builtin → TypeScript module** in that order. If a derive has the same name as a builtin, the derive wins (shadowing is allowed by design).
- **Qualified slash callee**: `com/example/ns/myDerive(arg)` parses as a call whose target is the slash-separated path. This is distinct from binary division: `a / b` is division, while `com/example/ns/name(x)` is a call on the FQN-shaped callee.

## Purity and builtins

Derive bodies may call only a **fixed whitelist** of builtins (plus other derives and TypeScript modules you `use`). Builtins that are not on the whitelist cannot be used from a derive because they cannot guarantee deterministic output within a single policy execution. The `now()` builtin is explicitly allowed: it returns the policy execution start time (`createdAt`), not wall-clock time per call, so it stays deterministic for the run.

## Exports

`export derive NAME` marks a namespace-level derive as exportable for cross-namespace references when policy rules call it by fully qualified name (subject to the same visibility rules as other exports).

## See also

- [Lambdas](/reference#lambdas) — parameter lists, optional parameters, and return types
- [Built-in functions](/reference/built-in-functions) — collection helpers that accept lambdas
- [Using TypeScript](/reference/using-typescript) — `use` modules from derives
