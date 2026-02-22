---
title: Types and Values
description: Exhaustive reference for built-in primitive and collection types, type declarations, indexing, cast, and validation.
---

Sentrie provides primitive types (`number`, `string`, `trinary`, `bool`, `document`) and collection types (`list[T]`, `map[T]`, `record[T1,T2,...]`). User-defined [shapes](/reference/shapes) extend these. Types can be used in [let](/reference/let), [facts](/reference/facts), and shape fields. Types may carry [constraints](/reference/constraints) for runtime validation.

## Syntax

**Primitives:** `number` | `string` | `trinary` | `bool` | `document`

**Collections:** `list[T]` | `map[T]` | `record[T1, T2, ...]`

**Cast:** `cast expr as type`

**Indexing:**  
- List/record: `expr[number]` (zero-based index).  
- Map: `expr[string]` or `expr.identifier` (key must be a string; dot form when the key is a valid identifier).

## Configuration & Arguments

### Primitive types

| Type | Description | Notes |
| :--- | :---------- | :---- |
| `number` | 64-bit floating-point (float64). | All numeric literals and arithmetic use this. No separate integer type. |
| `string` | UTF-8 string. | Literals: double-quoted or backtick. |
| `trinary` | Three-valued logic: `true`, `false`, `unknown`. | Used for conditions and [boolean operations](/reference/boolean-operations). See [Trinary](/reference/trinary). |
| `bool` | Two-valued: `true`, `false`. | Subset of trinary; no `unknown` literal for bool, but expressions can produce trinary. |
| `document` | JSON-like object (string keys, arbitrary values). | Used for untyped or semi-structured data. |

### Collection types

| Type | Description | Index type | Notes |
| :--- | :---------- | :--------- | :---- |
| `list[T]` | Ordered sequence of values of type `T`. | `number` (zero-based). | Index out of range is an error or undefined behavior per implementation. |
| `map[T]` | Key-value map; keys are strings, values are type `T`. | `string` or `.key` (identifier). | Keys must be strings. Dot access: `map.key` when key is a valid identifier. |
| `record[T1,T2,...]` | Fixed-length tuple with typed positions. | `number` (zero-based position). | Length and types are fixed at type declaration. |

### Cast

`cast expr as type` converts the value of `expr` to the given type. The result is validated against the type and any [constraints](/reference/constraints) on that type. If conversion or validation fails, evaluation aborts. Supported conversions include string↔number, number↔string, bool↔string, and literal document to `document`.

**Returns:** N/A for type declarations. For `cast`: the value after conversion and validation; failure aborts evaluation.

## Indexing and access

- **List:** `listExpr[indexExpr]`. `indexExpr` must be a number (or evaluate to a number). Zero-based. Bounds behavior is implementation-defined (error or undefined).
- **Record:** `recordExpr[indexExpr]`. Same as list; index is the position (0, 1, 2, …).
- **Map:** `mapExpr[keyExpr]` or `mapExpr.key`. Key must be a string. Dot form is equivalent to bracket form when the key is a valid identifier (e.g. `m.one` ≈ `m["one"]`).

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
let m: map[number] = { "one": 1, "two": 2 }
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
let x: number = cast "50" as number
let y: string = cast 50 as string
let z: bool = cast "true" as bool
let doc: document = cast { "name": "John", "age": 30 } as document
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Type annotation on let:** Optional. When omitted, the value is not validated against a type. When present, the value is validated (and constraints apply); failure aborts evaluation.
- **Map keys:** Must be strings. Access with `[index]`: numeric index for list/record, string key for map. Dot access for maps only when the key is a valid identifier.
- **Division by zero:** Aborts evaluation. [Constraint](/reference/constraints) failure also aborts evaluation.
- **Cast:** Validates against the target type and any constraints; failure aborts evaluation. Not all type combinations may be supported; see implementation for allowed conversions.
