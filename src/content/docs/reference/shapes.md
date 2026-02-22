---
title: Shapes
description: Exhaustive reference for shape syntax: data models, field modifiers (required/optional, nullable), composition with base shapes, type aliases, export, and validation.
---

Shapes define structured data (field-based models) or type aliases (a base type plus optional [constraints](/reference/constraints)). They are used as the type of [facts](/reference/facts), [let](/reference/let) bindings, and nested fields. Shape values are validated at runtime when assigned or passed as input.

## Syntax

### Data model (complex shape)

A shape with a body of named, typed fields:

```text
shape Name {
  fieldName!: type
  fieldName?: type
  fieldName: type
  fieldName!?: type
}
```

Each field has a name, an optional modifier suffix (`!`, `?`, or both in either order), a colon, and a type (any [type or shape](/reference/types-and-values)).

### Type alias (simple shape)

A shape that is an alias for a single type, optionally with constraints:

```text
shape Name baseType
shape Name baseType @constraint1 @constraint2
```

Examples: `shape ID string @uuid()`, `shape Score number @min(0) @max(100)`.

### Composition (extending a base shape)

A complex shape can extend exactly one other shape with `with BaseName` before the opening `{`. The base shape must be in scope (same namespace or [exported](/reference/namespaces) from another namespace).

```text
shape Child with Base {
  field!: type
}
```

The child shape’s effective fields are the union of the base’s fields and the child’s own fields. Duplicate field names between base and child are not allowed.

### Exporting a shape

To make a shape visible to other namespaces (for use in [policy composition](/language-concepts/policy-composition) or as a fact type), declare:

```text
export shape ShapeName
```

Only shapes declared in the same file (same namespace) can be exported. The shape name is the identifier used in the same file; other namespaces refer to it by the exported name.

## Configuration & Arguments

### Field modifiers (complex shapes)

Every field in a shape body has two logical properties: whether the field is **required** (must be present in the value) and whether it is **nullable** (may be `null` when present). Modifiers are written as suffixes on the field name.

| Modifier   | Required? | Nullable? | Meaning |
| :--------- | :-------- | :-------- | :------ |
| (none)     | Yes       | Yes       | Field must be present; value may be `null`. |
| `!`        | Yes       | No        | Field must be present and must not be `null`. |
| `?`        | No        | Yes       | Field may be omitted; if present, value may be `null`. |
| `!?` or `?!` | No     | No        | Field may be omitted; if present, value must not be `null`. |

- **Required:** If the field is missing from the value at runtime, validation fails.
- **Nullable:** If the field is present and its value is `null`, validation fails when the field is non-nullable (`!` or `!?`/`?!`).

Field type can be any type reference: primitives (`number`, `string`, `trinary`, `bool`, `document`), collections (`list[T]`, `map[T]`, `record[...]`), or another shape. Constraints on the type are validated when the value is assigned or when the value is supplied as a fact.

### Composition rules

| Aspect | Rule |
| :----- | :--- |
| Base shape | Exactly one `with BaseName`. The base must be a complex shape (or a type-alias shape that the implementation treats as a structural base where applicable). |
| Visibility | Base must be in the same namespace or exported from another namespace. Cross-namespace base requires the base shape to be declared with `export shape BaseName` in its file. |
| Duplicate fields | A child cannot declare a field with the same name as a field in the base. |
| Circular composition | Not allowed (e.g. A with B, B with A). |

### Type alias (simple shape) rules

| Aspect | Rule |
| :----- | :--- |
| Base type | Any single type: primitive, collection, or shape. |
| Constraints | Optional; use the same [constraint](/reference/constraints) syntax as on types (e.g. `@min(0)`, `@uuid()`). |
| Use | The shape name can be used anywhere a type is expected (facts, let, other shape fields, collections). |

**Returns:** N/A (type definition). Values are validated when assigned to a variable or field of that shape, or when passed as facts. Validation failure aborts evaluation.

## Where shapes can be used

- **Facts:** A fact’s type can be a shape (e.g. `fact user: User`). The supplied JSON is validated against the shape’s fields and constraints.
- **Let bindings:** A let can be typed with a shape (e.g. `let u: User = someExpr`). The expression result is validated against the shape.
- **Nested types:** A shape field’s type can be another shape or `list[ShapeName]`, `map[ShapeName]`, etc.
- **Policy composition:** Imported policies can bind facts using shapes defined in another namespace if those shapes are exported.

## Examples in Action

### Data model with all modifier variants

```sentrie
shape User {
  name!: string
  age: number
  email?: string
  phone!?: string
}
```

- `name` must be present and non-null.
- `age` must be present but may be null.
- `email` may be omitted; if present, may be null.
- `phone` may be omitted; if present, must not be null.

### Checking optional fields in rules

Optional or nullable fields should be checked before use. Use `is defined` to test presence (and often combine with a null check if the field is nullable).

```sentrie
shape Item { name!: string; price?: number }

rule showPrice = default "n/a" when item.price is defined {
  yield cast item.price as string
}
```

### Type aliases with constraints

```sentrie
shape ID string @uuid()
shape Permission string @one_of("read", "write", "delete")
shape Percent number @min(0) @max(100)
```

Use them in facts or let:

```sentrie
fact userId: ID as id
let p: Percent = 50
```

### Composition

```sentrie
shape Base { id!: string }
shape Extended with Base { role!: string }
```

A value of type `Extended` must have both `id` and `role`, and both must be non-null (given `!`).

### Composition with exported base (cross-namespace)

In file `auth.sentrie`:

```sentrie
namespace com/example/auth

shape Base { id!: string }
export shape Base

policy P { ... }
```

In another file in a different namespace, a shape can extend `Base` by referencing the exported name (see [Policy composition](/language-concepts/policy-composition) and namespace resolution). The base shape must be exported for cross-namespace composition.

### Shape literals and field order

When constructing a value (e.g. in a let or as input), field order in the literal does not affect type checking. All required fields must be present and all constraints must hold.

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Validation timing:** Shape (and constraint) validation runs when a value is assigned to a variable or field of that shape, or when facts are bound. Failure aborts evaluation.
- **Optional fields:** Use `is defined` (and null checks if the field is nullable) before using an optional or nullable field in expressions. Accessing a missing optional field yields `unknown` in expressions; the shape validator only checks that required fields are present and non-nullable fields are non-null when present.
- **Composition:** The composed shape effectively has all base fields plus its own. Circular composition (A with B, B with A, or longer cycles) is not allowed. Duplicate field names between base and child are not allowed.
- **Export:** Only shapes declared in the same file can be exported with `export shape Name`. Exported shapes are visible to other namespaces for use as types or as base shapes in composition. Unexported shapes are namespace-local.
- **Field order:** The order of fields in a shape literal does not affect type checking; only presence and types (and constraints) matter.
- **Naming:** Shape names and field names are identifiers. The same namespace can contain multiple shapes; policies in that namespace can reference any shape in the same namespace or any exported shape from another namespace (per import/resolution rules).
