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
  |> str.trim
  |> str.toLower
  |> str.replaceAll(" ", "-")
```

::::note
The parser desugars `lhs |> rhs(...)` by inserting `lhs` as the **first positional** argument of the call on the right. Any further arguments are exactly what you write after the callee, for example `|> str.replaceAll(" ", "-")`.
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
lhs |> ident            => ident(lhs)
lhs |> alias.fn         => alias.fn(lhs)
lhs |> ident(a, b)      => ident(lhs, a, b)
lhs |> alias.fn(a, b)   => alias.fn(lhs, a, b)
```

Pipelines are parser sugar only. They do not introduce new runtime call semantics.

## Supported Targets

The right-hand side of a pipeline must be one of:

- An identifier, for example `value |> count`
- A module-qualified field access, for example `value |> str.trim`
- A call expression whose callee is one of the above forms, for example `value |> str.replaceAll(" ", "-")`

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
value |> str.trim |> count
```

This lowers to:

```sentrie
count(str.trim(value))
```

For full operator ordering, see [Operator Precedence](/reference/precedence).

## Memoization

Pipeline targets support the same memoization suffixes as ordinary calls:

```sentrie
value |> count!30
value |> str.trim!10
value |> str.replaceAll(" ", "-")!60
```

- `!` enables memoization with default TTL.
- `!<seconds>` enables memoization with an explicit TTL in seconds.
- Supported on identifier targets, module-qualified field-access targets, and call targets.

## Parse-time vs Resolution-time

`value |> trim` is valid syntax because `trim` is an identifier target form. Parse-time acceptance does not imply runtime resolution success.

Name resolution rules remain unchanged.

## `use` Behavior Is Unchanged

Pipelines do not inject imported symbols into local scope. `use` continues to bind module aliases.

```sentrie
use { trim } from @sentrie/string as str

-- Valid: module-qualified access through alias
let a = value |> str.trim

-- Parses, but does not become resolvable because of `use`
let b = value |> trim
```

## See Also

- [Using Functions](/reference/functions)
- [Operator Precedence](/reference/precedence)
- [Policy Language Reference](/reference/)
