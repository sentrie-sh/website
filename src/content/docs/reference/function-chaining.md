---
title: Function chaining
description: Chain calls with the `|>` pipeline operator—readable top-to-bottom flows, with rules for targets, desugaring, precedence, and memoization.
---

When nested function calls pile up, it gets harder to see the data flow. You can always expand `g(f(x))` into separate `let` bindings, but that adds noise when the intermediate names are not the point.

**Function chaining** in Sentrie uses the pipeline operator (`|>`) so the computation reads top-to-bottom: each step takes the value from the line above and passes it into the next call.

### Nested calls

```sentrie
let slug = str.replaceAll(str.toLower(str.trim(input)), " ", "-")
```

### Intermediate values

```sentrie
let t1 = str.trim(input)
let t2 = str.toLower(t1)
let slug = str.replaceAll(t2, " ", "-")
```

### Pipeline

```sentrie
let slug = input
  |> str.trim()
  |> str.toLower()
  |> str.replaceAll(" ", "-")
```

::::note
When a pipeline call target has **no** `#` placeholders, the parser inserts `lhs` as the **first positional** argument on the right.
::::

The pipeline example above is the same as this nested-call shape (parentheses show the order of application):

```sentrie
let slug = str.replaceAll(
  str.toLower(
    str.trim(input),
  ),
  " ",
  "-",
)
```

## Desugaring Rules

The parser lowers pipeline syntax to ordinary calls:

```text
lhs |> ident()          => ident(lhs)
lhs |> alias.fn()       => alias.fn(lhs)
lhs |> ident(a, b)      => ident(lhs, a, b)
lhs |> alias.fn(a, b)   => alias.fn(lhs, a, b)
lhs |> fn(a, #, b)      => fn(a, lhs, b)
```

Pipelines are parser sugar only. They do not introduce new runtime call semantics.

## Placeholder (`#`) for Non-First Arguments

Use `#` inside a pipeline call target when the piped value should go somewhere other than argument 0.

```sentrie
let replaceChar = "..."
let out = replaceChar |> str.replace(input, #, "$$")
```

This lowers to:

```sentrie
let out = str.replace(input, replaceChar, "$$")
```

When `#` is present in the RHS argument list, the parser does not auto-prepend the piped value as argument 0.

### Multiple placeholders

All `#` placeholders in the same RHS call bind to the same piped value:

```sentrie
x |> f(#, #)
```

Lowers to:

```sentrie
f(x, x)
```

### Style

- Prefer straight chaining for sequential flow: `x |> g() |> f()`.
- Use `#` for non-first argument placement when needed.
- Avoid readability regressions like `x |> f(g(#))` when `x |> g() |> f()` expresses the same logic more clearly.
- `%` remains modulo in Sentrie and is unrelated to pipeline placeholders.

## Supported Targets

The right-hand side of a pipeline must be:

- A call expression whose callee is an identifier, for example `value |> count()`
- A call expression whose callee is a module-qualified field access, for example `value |> str.trim()`
- A call expression with explicit arguments, for example `value |> str.replaceAll(" ", "-")`

## Rejected Targets

The right-hand side is rejected when its callable root is not an identifier or module-qualified field access.

Examples of rejected forms:

```sentrie
value |> (a + b)
value |> foo ? bar : baz
value |> foo[0]
value |> foo().bar
```

## Precedence and Associativity

`|>` has the lowest precedence and associates left-to-right.

```sentrie
value |> str.trim() |> count()
```

This lowers to:

```sentrie
count(str.trim(value))
```

For full operator ordering, see [Operator Precedence](/reference/precedence).

## Memoization

Pipeline targets support the same memoization suffixes as ordinary calls:

```sentrie
value |> count()!30
value |> str.trim()!10
value |> str.replaceAll(" ", "-")!60
```

- `!` enables memoization with default TTL.
- `!<seconds>` enables memoization with an explicit TTL in seconds.
- Supported on call targets (including identifier and module-qualified callees).

## Parse-time vs Resolution-time

`value |> trim` is rejected at parse time because pipeline RHS targets must be explicit calls (for example `trim()`).

Name resolution rules remain unchanged.

## `use` Behavior Is Unchanged

Pipelines do not inject imported symbols into local scope. `use` continues to bind module aliases.

```sentrie
use { trim } from @sentrie/string as str

-- Valid: module-qualified access through alias
let a = value |> str.trim()

-- Rejected at parse time (RHS must be an explicit call)
let b = value |> trim
```

## See Also

- [Using Functions](/reference/functions)
- [Operator Precedence](/reference/precedence)
- [Policy Language Reference](/reference/)
