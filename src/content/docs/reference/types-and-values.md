---
title: Types and Values
description: Sentrie has a comprehensive type system with primitive types, collections, and user-defined shapes.
---

Sentrie provides a robust type system that includes primitive types, collection types, and [user-defined shapes](/reference/shapes/). The type system is enhanced by a powerful [constraint system](/reference/constraints) that allows you to validate values against specific rules.

## Primitive Types

Sentrie supports five fundamental primitive types:

| Type       | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `number`   | Numeric values                                                  |
| `string`   | Text strings                                                    |
| `trinary`  | Trinary values (`true` / `false` / `unknown`)                   |
| `bool`     | Boolean values (`true` / `false`) - a special case of `trinary` |
| `document` | Arbitrary JSON-like objects                                     |

### Declaring a Primitive Type

```text
let u: number = 50
```

```text
let u: number = 50.5
```

```text
let u: string = "hello"
```

```text
let u: bool = true
```

```text
let u: document = { "name": "John", "age": 30 }
```

### Sets: which values become sets

Only a value bound to a **top-level** `set[T]` is converted to a set: a fact, a default, a `let`, a derive parameter or return value, or a lambda return value. A `set[T]` that is nested inside a list, a dict, a record or a shape field is checked (element type and no duplicates) but stays a plain list, so it keeps its input order in the output. The same goes for a shape that is declared as `set[T]` (`shape Roles set[string]`): it validates, but its value is not converted. The set builtins accept lists, so you can still use them on such a field:

```sentrie
namespace com/example/auth

policy nested {
  fact grants: Grants
  fact groups: list[set[string]]

  shape Grants {
    roles: set[string]
  }

  rule r = {
    yield {
      "roles": grants.roles,
      "groups": groups,
      "first_group": set(groups[0])
    }
  }
  export decision of r
}
```

With `{"grants": {"roles": ["b", "a"]}, "groups": [["z", "y"]]}` this yields `{"roles": ["b", "a"], "groups": [["z", "y"]], "first_group": ["y", "z"]}`.

### Sets: checking for a set type

`x is set[T]` is true when `x` is a list of `T` with no duplicates. `x` does not have to be a set already, so a list that is distinct conforms:

```sentrie
namespace com/example/auth

policy checks {
  rule r = {
    yield {
      "distinct": [1, 2] is set[number],
      "duplicate": [1, 1] is set[number],
      "wrong_type": ["a"] is set[number]
    }
  }
  export decision of r
}
```

This yields `{"distinct": true, "duplicate": false, "wrong_type": false}`. See [Shapes](/reference/shapes) for `is` checks in general.

### Sets: decisions in a set

An imported decision stored in an **untyped** set counts as its full `{state, value}` dict, not as its state. Declare the element type as `boolean` to store states instead:

```sentrie
namespace com/example/auth

policy source {
  fact admin: boolean

  rule isAdmin = default false { yield admin }

  export decision of isAdmin
}

policy report {
  fact admin: boolean

  rule viaImport = import decision isAdmin from com/example/auth/source with admin as admin

  -- An untyped set holds the decision as its {state, value} dict
  rule untyped = {
    yield {
      "count": count(set([viaImport, true])),
      "has_true": true in set([viaImport])
    }
  }

  -- A set[boolean] holds its state
  rule typed = {
    let states: set[boolean] = [viaImport, false]
    yield {
      "count": count(states),
      "has_true": true in states
    }
  }

  export decision of untyped
  export decision of typed
}
```

With `{"admin": true}`, `untyped` yields `{"count": 2, "has_true": false}` and `typed` yields `{"count": 2, "has_true": true}`. With `{"admin": false}`, `typed` fails with `duplicate set element false`, because the imported decision is `false` and so is the second element.

### Unions: when no member matches

If a value matches none of the members, the check fails and reports why. The error names the **closest member**: the first member, in source order, whose outer kind accepts the value (string, number, boolean, list, record, dict, document or a shape, read through shape aliases).

```text
let v: number @min(10) | string = 5
-- Error: invalid value for let declaration v: value 5 does not match number | string
--   at <location>: closest member number: constraint failed: 'min' ...
```

Here `5` is a number, so `number` is the closest member and its failed `@min` constraint is the reported reason. If no member's kind accepts the value, the error names the whole union instead:

```text
let v: string | number = true
-- Error: invalid value for let declaration v: value true is not string | number
--   at <location> - expected one of its members
```

If a member itself cannot be checked, such as a shape that does not exist or a constraint with invalid arguments, the check fails with that error rather than skipping the member. This holds for `is` and `is not` too, so a broken member can never make a check pass by accident. For example, `"abc" is string @minlength("x") | number` stops with a `constraint failed: 'minlength'` error instead of returning `false`. A member that matches still wins: `5 is string @minlength("x") | number` is `true`, because the number member matches and the broken string member is never reported.

### Unions: errors found before running

`sentrie validate` and `sentrie exec` report these when the pack is loaded:

- A `|` between two expressions, such as `let x = 1 | 2`: `unexpected '|': only '|>' is supported in an expression; '|' separates the members of a union type`.
- A union with a missing member, such as `string |`.
- `shape any`, and constraints on `any`.
- An `is` check with a union member that names a shape that is not visible, such as `x is string | Missing`. `sentrie validate` rejects it as `shape "Missing" is not visible here`.

An unknown shape in a union written elsewhere, such as `let x: string | Missing = 5`, is not found by `sentrie validate`. It fails when `exec` evaluates it, with `shape 'Missing' not found`, unless another member matches the value.

## Collection Types

Collections allow you to work with groups of related values:

| Type                  | Description                                 |
| --------------------- | ------------------------------------------- |
| `list[T]`             | Lists of type `T`                           |
| `dict[T]`             | Maps with `string` keys and type `T` values |
| `record[T1, T2, ...]` | Tuples with specific types                  |

### Declaring a Collection Type

```text
let u: list[number] = [1, 2, 3]
```

```text
let u: dict[number] = { "one": 1, "two": 2, "three": 3 }
```

Every element of a collection is checked against its element type. A value typed `dict[number]` rejects `{"a": 1, "b": "two"}` with an error naming the key, `value for key "b" is not valid`. When several values fail, the first failing key in sorted order is reported. In an `is` check the mismatch gives `false`: `{"b": "two"} is dict[number]` is `false`.

A `dict[T]` entry that holds an undefined value counts as absent, because undefined is not a value. `{ "a": payload.missing, "b": 2 } is dict[number]` is `true`, and a typed `let`, a lambda parameter or return, or a shape field of type `dict[number]` accepts such a dict. An entry with a real value of the wrong type still fails, so `{ "a": payload.missing, "b": "two" } is dict[number]` is `false`. The entry is not removed from the value: the dict keeps the key, and JSON output writes it as `null`, for example `{"a":null,"b":2}`. A `list[T]` element holding undefined still fails the check.

```sentrie
namespace docs/dictundef

policy P {
  fact payload: document

  rule entryIsAbsent = {
    let scores = { "a": payload.missing, "b": 2 }
    yield scores is dict[number]
  }

  rule wrongValue = {
    let scores = { "a": payload.missing, "b": "two" }
    yield scores is dict[number]
  }

  rule typedLet = {
    let scores: dict[number] = { "a": payload.missing, "b": 2 }
    yield scores
  }

  export decision of entryIsAbsent
  export decision of wrongValue
  export decision of typedLet
}
```

With `{"payload": {}}`, `entryIsAbsent` is `true`, `wrongValue` is `false`, and `typedLet` is `{"a": null, "b": 2}`.

The check includes the constraints on `T`: with `dict[number @min(0) @max(100)]`, `{"a": 50, "b": 150}` fails with `value for key "b" is not valid`, followed by the failed constraint. When `T` is a [shape](/reference/shapes#closed-and-open-shapes), each value is checked against it, so a value with a field the shape does not declare is rejected too, with the key named.

A dict literal with a repeated key is not an error: the last value wins and nothing is reported (`{ "k": 1, "k": 2 }` has `k` equal to `2`).

```text
let u: record[string, number, boolean] = ["one", 1, true]
```

```text
let u: set[string] = ["read", "write"]
```

## Nullable Types

Sentrie supports type-level nullability with a `?` suffix on type references.

- `string?` -> value may be `null` or a string
- `list[string]?` -> list itself may be `null`
- `dict[string?]` -> dict values may be `null`
- `Person?` -> shape value may be `null`

```text
let middleName: string? = null
let tags: list[string]? = null
let attrs: dict[string?] = {"nickname": null}
```

`T?` means **nullable value**. This is different from optional bindings (for example, `field?` in shapes/facts), which control whether a key may be absent.

:::caution
Map keys must be strings.
:::

:::note
The type is optional for `let` statements. When undeclared, the value is not validated against any type constraints.
However, it is recommended to declare the type for better readability and to avoid surprises where the type is not what you expect.
:::

### Accessing Collection Elements

You can access collection elements using the `[index]` syntax. The index must be a `string` for dicts and a `number` for lists and records.

```text
let u: list[number] = [1, 2, 3]
let first: number = u[0]
```

```text
let u: dict[number] = { "one": 1, "two": 2, "three": 3 }
let first: number = u["one"]
```

For dicts, you can also access elements using the `.` syntax.

```text
let u: dict[number] = { "one": 1, "two": 2, "three": 3 }
let first: number = u.one
```

## Converting Types

You can convert between types with a **cast expression**: `expr as Type`. The result is validated against the target type and its constraints before it is returned. A failed conversion or constraint check is an **error** (with a trace node), not a silent zero value.

The `as` operator binds to the expression on its left, similar to unary operators in other languages. It does **not** apply to a whole arithmetic expression unless you add parentheses:

```text
-- `as` applies to `b`, not to `a + b`
let x = a + b as number
-- same as: a + (b as number)

-- convert the summed value instead
let y = (a + b) as number
```

```text
let u: number = "50" as number
```

```text
let u: string = 50 as string
```

```text
let u: boolean = "true" as boolean
```

```text
let u: document = { "name": "John", "age": 30 } as document
```
