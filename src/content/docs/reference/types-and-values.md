---
title: Types and Values
description: Sentrie has a comprehensive type system with primitive types, collections, and user-defined shapes.
---

Sentrie provides a robust type system that includes primitive types, collection types, and [user-defined shapes](/reference/shapes/). The type system is enhanced by a powerful [constraint system](/reference/constraints) that allows you to validate values against specific rules.

## Primitive Types

Sentrie supports five fundamental primitive types:

| Type       | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `number`   | Numeric values: exact integers and floats                       |
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

### Integers and Floats

A `number` is either an **exact integer** or a **float**:

- A whole number that fits in a signed 64-bit integer (`-9223372036854775808` to `9223372036854775807`) is an exact integer. It keeps every digit through literals, JSON facts, arithmetic, comparison and output, including values above 2^53 (`9007199254740992`).
- A number with a fractional part or an exponent is a 64-bit float.
- An integer literal too large for 64 bits is read as a float.

```text
let id: number = 9007199254740993
let same: boolean = id == 9007199254740992    -- false: one apart, and still told apart
let equal: boolean = 5 == 5.0                 -- true: equal values compare equal in either form
```

Arithmetic on two integers is exact, and a result that does not fit in 64 bits is an overflow error. Dividing two integers gives an integer only when the division is exact (`15 / 3` is `5`, `7 / 2` is `3.5`). An operation that mixes an integer and a float is a float operation. See [Arithmetic Operations](/reference/arithmetic-operations) for the full rules.

The [numeric constraints](/reference/constraints#numeric-constraints-number) compare exactly as well, so `@max`, `@range`, `@multiple_of`, `@even` and `@odd` give the right answer for large IDs.

An integer beyond `Number.MAX_SAFE_INTEGER` (2^53-1) cannot be passed to a [TypeScript module](/reference/using-typescript#numbers-passed-to-typescript-modules): doing so is an error.

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
