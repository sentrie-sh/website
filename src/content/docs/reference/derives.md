---
title: "Derives"
description: "Named pure functions (derives), purity rules, HOF callbacks, visibility, and export rules."
---

# Derives

A **derive** is a named, pure function attached to a namespace or to a policy. Derives are written as a `derive` binding whose value is a **lambda** (the same `=>` block syntax used for collection builtins).

Derives let you name reusable pure logic (predicates, mappers, small transforms) and call it from rules or from other derives. They are **not** a replacement for TypeScript modules: derive bodies must stay within Sentrie's pure subset and cannot call `use` modules.

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

Policy-level derives **cannot** be exported. `export derive NAME` is only valid at namespace scope; a policy body that tries to export a derive is rejected at parse time.

The right-hand side must be a lambda expression, for example:

```sentrie
derive double = (x: number): number => {
  let t = x * 2
  yield t + 1
}
```

Typed parameters, optional parameters (`?`), and return types use the same lambda syntax documented under [Lambdas](/reference#lambdas). Duplicate parameter names in the same list are rejected at parse time.

## Calling derives

### Unqualified name

`myDerive(arg1, arg2)` resolves **derive → builtin → TypeScript module** in that order. If a derive has the same name as a builtin, the derive wins (shadowing is allowed by design).

Inside a **rule** or other non-derive expression, an unqualified derive name is invoked with `(...)`.

Inside another **derive** body, a visible derive must also be invoked as `otherDerive(...)` — not referenced as a bare identifier — except when passed as a callback to certain higher-order builtins (see [Callbacks](#callbacks-for-higher-order-builtins) below).

### Qualified slash callee

`com/example/ns/myDerive(arg)` parses as a call whose target is the slash-separated path. This is distinct from binary division: `a / b` is division, while `com/example/ns/name(x)` is a call on the FQN-shaped callee.

Slash callees require at least three segments (for example `com/ex/helper`) so two-segment chains are not mistaken for division.

## Visibility and scope

### Namespace-scoped derives

Declared at namespace scope. Visible to policies and other derives in the same namespace according to the derive's bind-time snapshot (`DefineShort` / `DefineFQN`).

Cross-namespace access by slash FQN requires `export derive NAME` at namespace scope, same as shapes.

### Policy-scoped derives

Declared inside a policy body. Visible only within **that policy** — not to other policies in the same namespace, and not to namespace-scoped derives.

A rule in `com/ex/polB` cannot call `com/ex/polA/secret()` even when both policies share the namespace. Index validation and runtime both enforce this boundary.

Resolution order for an unqualified name in a policy prefers a **policy-local** derive over a namespace derive with the same name.

## Purity rules

Derive bodies are validated statically and enforced at runtime. A derive must be **deterministic within a single policy execution**.

### Allowed

- Parameters, `let` bindings in the derive body, and pure builtin calls from the whitelist below
- Calls to other **visible** derives (by name or slash FQN, subject to scope and export rules)
- Inline lambdas passed as arguments to pure builtins (for example `filter(items, (x) => { yield x > 0 })`)
- Single-parameter derives passed as callbacks to higher-order pure builtins (see below)

### Not allowed

- **TypeScript module calls** (`alias.fn(...)`) — including modules imported with `use`
- **Facts** — fact identifiers are not available inside a derive
- **Rules** — rules cannot be referenced or dispatched from inside a derive
- **Callable return values** — a derive cannot `yield` a lambda or other callable value
- **Non-whitelisted builtins** — builtins outside the pure set cannot be used from a derive

The `now()` builtin is explicitly allowed: it returns the policy execution start time (`createdAt`), not wall-clock time per call, so it stays deterministic for the run.

### Pure builtin whitelist

Derive bodies may call only these builtins (plus other visible derives):

`all`, `any`, `as_list`, `collect`, `count`, `distinct`, `error`, `filter`, `first`, `flatten`, `flatten_deep`, `merge`, `normalise_list`, `now`, `reduce`

Argument and return types are checked at invoke time; type mismatches include the **parameter name** in the error.

## Callbacks for higher-order builtins

Single-parameter derives may be passed **by identifier** as the callable argument to these pure builtins:

`any`, `all`, `filter`, `first`, `collect`, `distinct` (two-argument form with a key selector)

Example:

```sentrie
derive is_available = (item: number): trinary => {
  yield item > 0
}

policy inventory {
  let _seed = 0
  rule check = {
    yield any([1, 2, 3], is_available)
  }
  export decision of check
}
```

Multi-parameter derives used as callbacks must be wrapped in an inline lambda if the builtin's arity contract requires it. A derive with zero required parameters cannot be used as an iterator callback (`any` / `filter` expect arity 1 or 2).

## Exports

`export derive NAME` marks a **namespace-level** derive as exportable for cross-namespace slash-FQN references from rules (subject to the same visibility rules as exported shapes).

Policy-scoped derives are never exported; they are private to their policy.

## Examples

Namespace helper used from a policy rule:

```sentrie
namespace com/example/shop

derive above = (n: number, min: number): trinary => {
  yield n > min
}

policy pricing {
  let _seed = 0
  rule ok = { yield above(100, 50) }
  export decision of ok
}
```

Policy-local derive with slash FQN to a sibling in the same policy:

```sentrie
namespace com/example/shop

policy cart {
  let _seed = 0
  derive unit = () => { yield 1 }
  derive total = () => { yield com/example/shop/cart/unit() + 1 }
  rule gate = { yield total() == 2 }
  export decision of gate
}
```

## See also

- [Lambdas](/reference#lambdas) — parameter lists, optional parameters, return types, and arity for builtins
- [Built-in functions](/reference/built-in-functions) — collection helpers that accept lambdas or derive callbacks
- [Using TypeScript](/reference/using-typescript) — TypeScript modules in **rules** and `let` expressions (not inside derive bodies)
