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

You can convert between types using the `cast .. as` construct. The result is validated against the new type constraints before returning the result.

```text
let u: number = cast "50" as number
```

```text
let u: string = cast 50 as string
```

```text
let u: bool = cast "true" as bool
```

```text
let u: document = cast { "name": "John", "age": 30 } as document
```
