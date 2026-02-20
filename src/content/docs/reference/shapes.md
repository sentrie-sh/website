---
title: Shapes
description: "Shape syntax: data models, field modifiers, composition, and type aliases."
---


Shapes define structured data (fields) or type aliases (base type + constraints). They are used for facts and `let` bindings. Optional fields use `?`; required non-null use `!`. Composition uses `with Base`.

## Syntax

**Data model:**
```text
shape Name {
  field!: type
  field?: type
  field: type
}
```

**Alias:** `shape Name baseType @constraint`

**Composition:** `shape Child with Base { ... }`

## Parameters

| Modifier | Description |
| :--- | :--- |
| `!` | Required, non-null. |
| `?` | Optional; may be omitted. |
| none | Required, may be null. |
| `!?` | Optional; if present, non-null. |

**Returns:** N/A (type definition). Values are validated when assigned or passed as facts.

## Examples

### Basic Usage

```sentrie
shape User {
  name!: string
  age: number
  email?: string
}
```

### Advanced Usage

```sentrie
shape Base { id!: string }
shape Extended with Base { role!: string }
shape ID string @uuid()
```

## Behavior & Constraints

- Composed shape includes all fields of Base plus its own. Circular composition is not allowed.
- Optional fields: use `is defined` to check before use. Exported shapes are visible across namespaces.

## Constraints & Edge Cases

- Unexported shapes are namespace-local. Field order in literals does not affect type checking.
