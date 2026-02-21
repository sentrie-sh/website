---
title: Types and Values
description: Built-in primitive and collection types and type declarations.
---


Sentrie provides primitive types (`number`, `string`, `trinary`, `bool`, `document`) and collection types (`list[T]`, `map[T]`, `record[T1,T2,...]`). User-defined shapes extend these. Types can be used in `let`, `fact`, and shape fields.

## Syntax

**Primitives:** `number` | `string` | `trinary` | `bool` | `document`

**Collections:** `list[T]` | `map[T]` | `record[T1, T2, ...]`

**Cast:** `cast expr as type`

List index: `expr[number]`. Map index: `expr[string]` or `expr.key`.

## Reference

| Type | Description |
| :--- | :--- |
| `number` | float64. |
| `string` | UTF-8 string. |
| `trinary` | `true` \| `false` \| `unknown`. |
| `bool` | `true` \| `false` (subset of trinary). |
| `document` | JSON-like object. |
| `list[T]` | Ordered list of T; index by number. |
| `map[T]` | String keys, T values; keys must be strings. |
| `record[T1,T2,...]` | Fixed-length tuple. |

**Returns:** N/A for types. `cast` returns the value after validation against the target type (and constraints); fails if invalid.

## Examples

### Basic Usage

```text
let u: number = 50
let s: string = "hello"
let b: bool = true
let arr: list[number] = [1, 2, 3]
let m: map[number] = { "one": 1, "two": 2 }
let r: record[string, number, bool] = ["one", 1, true]
```

### Advanced Usage

```text
let first: number = arr[0]
let one: number = m["one"]
let oneAlt: number = m.one
let x: number = cast "50" as number
```

## Behavior & Constraints

- Type annotation on `let` is optional; when omitted, value is not validated against a type.
- Map keys must be strings. Division by zero aborts evaluation. Constraint failure aborts evaluation.

## Constraints & Edge Cases

- Map keys must be strings. Access with `[index]`: number for list/record, string for map.
- `cast` validates against the target type and any constraints; failure aborts evaluation.
