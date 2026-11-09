---
title: Types and Values
description: "Built-in primitive and collection types, type declarations, indexing, cast, and validation."
---

Sentrie provides primitive types (`number`, `string`, `trinary`, `bool`, `document`) and collection types (`list[T]`, `dict[T]`, `record[T1,T2,...]`). User-defined [shapes](/reference/shapes) extend these. Types can be used in [let](/reference/let), [facts](/reference/facts), and shape fields. Types may carry [constraints](/reference/constraints) for runtime validation.

## Syntax

**Primitives:** `number` | `string` | `trinary` | `bool` | `document`

**Collections:** `list[T]` | `dict[T]` | `record[T1, T2, ...]`

**Cast:** `expr as type`

**Indexing:**  
- List/record: `expr[number]` (zero-based index).  
- Map: `expr[string]` or `expr.identifier` (key must be a string; dot form when the key is a [valid identifier](/reference/identifiers)).

## Configuration & Arguments

### Primitive types

| Type | Description | Notes |
| :--- | :---------- | :---- |
| `number` | 64-bit floating-point (float64). | All numeric literals and arithmetic use this. No separate integer type. |
| `string` | UTF-8 string. | Literals: double-quoted or backtick. |
| `trinary` | Three-valued logic: `true`, `false`, `unknown`. | Used for conditions and [boolean operations](/reference/boolean-operations). See [Trinary](/reference/trinary). |
| `bool` | Two-valued: `true`, `false`. | Subset of trinary; no `unknown` literal for bool, but expressions can produce trinary. |
| `document` | JSON-like object (string keys, arbitrary values). | Used for untyped or semi-structured data. |

### Number literals

A number literal is a run of digits, optionally followed by a fraction and an exponent:

```text
42          -- Integer
3.14        -- Decimal
1e5         -- 100000
1E5         -- Same as 1e5
1e+5        -- Same as 1e5
2.5e-3      -- 0.0025
```

An exponent is `e` or `E`, an optional `+` or `-`, and at least one digit. A literal with an exponent is a float. Exponent literals work everywhere a number literal does, including [constraint](/reference/constraints/) arguments:

```text
shape Reading {
  value: number @min(1e-3) @max(1.5E+3)
}
```

Malformed number literals are errors when the pack is loaded:

| Literal            | Error                                              |
| ------------------ | -------------------------------------------------- |
| `1e`, `1e+`, `1ex` | the exponent needs at least one digit              |
| `1.e5`             | a digit must follow the decimal point              |
| `1e400`            | value out of range (a number must fit in a 64-bit float) |

Because `e` right after a number always starts an exponent, separate a number from a following word with a space.

### Collection types

| Type | Description | Index type | Notes |
| :--- | :---------- | :--------- | :---- |
| `list[T]` | Ordered sequence of values of type `T`. | `number` (zero-based). | Index out of range is an error or undefined behavior per implementation. |
| `dict[T]` | Key-value map; keys are strings, values are type `T`. | `string` or `.key` (identifier). | Keys must be strings. Dot access: `map.key` when key is a [valid identifier](/reference/identifiers). |
| `record[T1,T2,...]` | Fixed-length tuple with typed positions. | `number` (zero-based position). | Length and types are fixed at type declaration. |

### Cast

The postfix cast `expr as type` converts the value of `expr` to the given type. The result is validated against the type and any [constraints](/reference/constraints) on that type. If conversion or validation fails, evaluation errors; it never yields an unchecked value. `as` binds to the expression on its left, so write `(a + b) as number` to cast a sum. Supported conversions include string↔number, number↔string, bool↔string, and literal document to `document`.

**Returns:** N/A for type declarations. For a cast: the value after conversion and validation; failure is an evaluation error.

## Indexing and access

- **List:** `listExpr[indexExpr]`. `indexExpr` must be a number (or evaluate to a number). Zero-based. Bounds behavior is implementation-defined (error or undefined).
- **Record:** `recordExpr[indexExpr]`. Same as list; index is the position (0, 1, 2, …).
- **Map:** `mapExpr[keyExpr]` or `mapExpr.key`. Key must be a string. Dot form is equivalent to bracket form when the key is a [valid identifier](/reference/identifiers) (e.g. `m.one` ≈ `m["one"]`).

## Where types are used

- **Facts:** Fact type is a shape, primitive, or collection (e.g. `fact user: User`, `fact id: string`).
- **Let:** Optional type annotation: `let x: number = 5`. When present, value is validated at runtime.
- **Shape fields:** Each field has a type (primitive, collection, or shape).
- **Constraints:** Types can be constrained (e.g. `number @min(0) @max(100)`). See [Constraints](/reference/constraints).

## Examples in Action

### Primitives and collections

```text
let u: number = 50
let s: string = "hello"
let b: bool = true
let arr: list[number] = [1, 2, 3]
let m: dict[number] = { "one": 1, "two": 2 }
let r: record[string, number, bool] = ["one", 1, true]
```

### Indexing

```text
let first: number = arr[0]
let one: number = m["one"]
let oneAlt: number = m.one
```

### Cast

```text
let x: number = "50" as number
let y: string = 50 as string
let z: bool = "true" as bool
let doc: document = { "name": "John", "age": 30 } as document
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Type annotation on let:** Optional. When omitted, the value is not validated against a type. When present, the value is validated (and constraints apply); failure aborts evaluation.
- **Map keys:** Must be strings. Access with `[index]`: numeric index for list/record, string key for map. Dot access for maps only when the key is a [valid identifier](/reference/identifiers).
- **Division by zero:** Aborts evaluation. [Constraint](/reference/constraints) failure also aborts evaluation.
- **Cast:** Validates against the target type and any constraints; failure aborts evaluation. Not all type combinations may be supported; see implementation for allowed conversions.

## Collection Types

Collections allow you to work with groups of related values:

| Type                  | Description                                 |
| --------------------- | ------------------------------------------- |
| `list[T]`             | Lists of type `T`                           |
| `dict[T]`              | Maps with `string` keys and type `T` values |
| `record[T1, T2, ...]` | Tuples with specific types                  |

### Declaring a Collection Type

```text
let u: list[number] = [1, 2, 3]
```

```text
let u: dict[number] = { "one": 1, "two": 2, "three": 3 }
```

Every element of a collection is checked against its element type. A value typed `dict[number]` rejects `{"a": 1, "b": "two"}` with an error naming the key, `value for key "b" is not valid`. When several values fail, the first failing key in sorted order is reported. In an `is` check the mismatch gives `false`: `{"b": "two"} is dict[number]` is `false`.

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

You can access collection elements using the `[index]` syntax. The index must be a `string` for maps and a `number` for lists and records.

```text
let u: list[number] = [1, 2, 3]
let first: number = u[0]
```

```text
let u: dict[number] = { "one": 1, "two": 2, "three": 3 }
let first: number = u["one"]
```

For maps, you can also access elements using the `.` syntax.

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
let u: bool = "true" as bool
```

```text
let u: document = { "name": "John", "age": 30 } as document
```
