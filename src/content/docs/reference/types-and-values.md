---
title: Types and Values
description: Sentrie has a comprehensive type system with primitive types, collections, unions, an any type, and user-defined shapes.
---

Sentrie provides a robust type system that includes primitive types, collection types, [union types](#union-types), the [`any` type](#the-any-type), and [user-defined shapes](/reference/shapes/). The type system is enhanced by a powerful [constraint system](/reference/constraints) that allows you to validate values against specific rules.

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

```text
let u: record[string, number, bool] = ["one", 1, true]
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

## Union Types

A union type accepts a value that matches **any one** of its members. Join the members with `|`:

```sentrie
namespace com/example/types

policy unions {
  let id: string | number = "u-42"
  let ids: list[string | number] = [1, "two", 3]
  let name: string @minlength(1) | number @min(0) = "x"
  let maybe: string | number? = null

  rule values = {
    yield { "id": id, "ids": ids, "name": name, "maybe": maybe }
  }

  export decision of values
}
```

This yields `{"id": "u-42", "ids": [1, "two", 3], "name": "x", "maybe": null}`.

A union can be written wherever a type can: [facts](/reference/facts), `let` annotations, [shape](/reference/shapes) fields, [derive](/reference/derives) parameters and return types, `as` casts, `is` checks, and inside `list[...]`, `dict[...]` and `record[...]`.

### How `|` Binds

`|` binds looser than everything else in a type, so each member keeps its own `?` and constraints:

- `string | number?` is `string | (number?)`: the number member is nullable, the string member is not.
- `number @min(0) | string` constrains only the number member.
- `list[string | number]` is a list whose elements are each a string or a number.

There is no grouping syntax. A union that has a nullable member accepts `null`, whichever member carries the `?`.

### Null

A union accepts `null` only when one of its members does. With `string | number?`, `null` is valid. With `string | number`, `null` is not:

```sentrie
let a = null is string | number?  -- true
let b = null is string | number   -- false
```

### When No Member Matches

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

### Casts

`expr as T1 | T2` only **checks** the value against the union. It does not convert it, so `"50" as string | number` stays the string `"50"`.

### Errors Found Before Running

`sentrie validate` and `sentrie exec` report these when the pack is loaded:

- A `|` between two expressions, such as `let x = 1 | 2`: `unexpected '|': only '|>' is supported in an expression; '|' separates the members of a union type`.
- A union with a missing member, such as `string |`.
- `shape any`, and constraints on `any`.
- An `is` check with a union member that names a shape that is not visible, such as `x is string | Missing`. `sentrie validate` rejects it as `shape "Missing" is not visible here`.

An unknown shape in a union written elsewhere, such as `let x: string | Missing = 5`, is not found by `sentrie validate`. It fails when `exec` evaluates it, with `shape 'Missing' not found`, unless another member matches the value.

### Derive Parameters and Returns

```sentrie
namespace com/example/types

derive normalize = (v: string | number): string => {
  yield v is string ? v : v as string
}

policy ids {
  fact id: string | number

  rule key = { yield normalize(id) }
  export decision of key
}
```

With `{"id": 42}` the rule yields `"42"`, and with `{"id": "u-1"}` it yields `"u-1"`. With `{"id": false}` execution stops with `value false is not string | number`.

## The `any` Type

`any` accepts every value that is defined: strings, numbers, booleans, lists, dicts, documents, shapes and `null`.

```sentrie
let anything: any = [1, "a", { "k": true }]
let nothing: any = null
```

Use it for data whose structure you do not want to validate, such as a fact that is later narrowed with [`is`](/reference/shapes#checking-a-value-against-a-shape).

- `any` takes no constraints. `any @min(1)` is rejected when the pack is loaded.
- `any` does not accept an undefined value, like every other type: undefined means there is no value. An optional fact that was not provided is not `any`, so `m is any` is `false` for it.
- `any` is not a keyword. The `any(list, predicate)` quantifier and identifiers named `any` keep working.
- A shape cannot be named `any`. `shape any { ... }` fails with `cannot declare a shape named "any": it is the built-in top type`.
- On the right of `is`, a bare `any` is always this type. To compare a value to a variable named `any`, use `==`.
- As a member of a union, `any` makes the union accept every defined value, so `string | any` is the same as `any`.

## Converting Types

You can convert between types with a **cast expression**: `expr as Type`. The result is validated against the new type constraints before it is returned.

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
let u: bool = "true" as bool
```

```text
let u: document = { "name": "John", "age": 30 } as document
```
