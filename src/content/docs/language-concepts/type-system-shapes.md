---
title: Type System & Shapes Overview
description: "How types, shapes, and constraints work in Sentrie: structure, validation, and composition."
---


The type system defines values (primitives, collections, documents) and structured data (shapes). Constraints validate values at runtime. Understanding how types and shapes work is required to define facts and rules correctly.

## Syntax

**Primitives:** `number` | `string` | `trinary` | `bool` | `document`

**Collections:** `list[T]` | `map[T]` | `record[T1, T2, ...]`

**Shape (data model):**

```text
shape Name {
  field!: type
  field?: type
  field: type
}
```

**Shape (alias):** `shape Name baseType @constraint1 @constraint2`

**Composition:** `shape Child with Base { ... }`

**Constraints:** Applied with `@` on types (e.g. `number @min(0) @max(100)`).

## Concepts

| Concept     | Required | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| Field `!`   | No       | Required non-null; field must be present and not null. |
| Field `?`   | No       | Optional; field may be omitted.                        |
| No marker   | -        | Required but may be null.                              |
| `with Base` | No       | Shape inherits all fields of Base plus its own.        |

**Returns:** N/A (type system). Constraint validation fails at runtime if a value does not meet the type or constraints; evaluation aborts.

## Examples

### Basic Usage

```sentrie
shape User {
  name!: string
  age: number
  email?: string
}

let u: User = { name: "Alice", age: 28 }
```

### Advanced Usage

```sentrie
shape Base { id!: string }
shape Extended with Base { role!: string }

let e: Extended = { id: "1", role: "admin" }
```

## Behavior & Constraints

- **Primitives:** `number` (float64), `string`, `trinary` (`true`/`false`/`unknown`), `bool` (subset of trinary), `document` (JSON-like).
- **Collections:** `list[T]` index by number; `map[T]` keys are strings (dot or `["key"]` access); `record[T1,T2,...]` fixed-length tuple.
- **Shapes:** Define contracts for facts and `let` bindings. Optional fields may be omitted; use `is defined` to check.
- **Constraints:** Validate at runtime. Failing constraint validation aborts evaluation immediately.
- **Cast:** `cast expr as Type` converts and validates against the target type (and its constraints).

## Constraints & Edge Cases

- Map keys must be strings.
- Type annotation on `let` is optional; if omitted, values are not validated against types.
- Circular shape composition is not allowed.
- Exported shapes are visible across namespaces; unexported shapes are namespace-local.
