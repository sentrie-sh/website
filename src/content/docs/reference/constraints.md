---
title: Constraints
description: Constraint syntax and validation for types (e.g. @min, @max, @email).
---

# Constraints

Constraints validate values at runtime using the `@` syntax on types. They apply to primitives, collection elements, and shape fields. Validation failure aborts evaluation.

## Syntax

```text
type @constraint1(args) @constraint2
```

Examples: `number @min(0) @max(100)`, `string @email`, `list[string @one_of("a","b")]`.

## Parameters

| Category | Constraints (examples) |
| :--- | :--- |
| Numeric | `@eq`, `@neq`, `@gt`, `@lt`, `@in`, `@not_in`, `@range(min,max)`, `@multiple_of`, `@even`, `@odd`, `@positive`, `@negative`, `@non_negative`, `@non_positive`, `@finite`, `@infinite`, `@nan` |
| String | `@length`, `@minlength`, `@maxlength`, `@regexp`, `@starts_with`, `@ends_with`, `@has_substring`, `@not_has_substring`, `@email`, `@url`, `@uuid`, `@alphanumeric`, `@alpha`, `@numeric`, `@lowercase`, `@uppercase`, `@trimmed`, `@not_empty`, `@one_of`, `@not_one_of` |
| List | `@not_empty` |

**Returns:** N/A. Constraint failure raises an error and aborts evaluation.

## Examples

### Basic Usage

```text
let u: number @min(0) @max(100) = 50
shape Permission string @one_of("read", "write", "delete")
```

### Advanced Usage

```text
let permissions: list[string @one_of("read", "write", "delete")] = ["read", "write"]
```

## Behavior & Constraints

- Constraints are checked at runtime when a value is assigned or cast to the constrained type.
- Order of application is defined by the runtime. All specified constraints must pass.

## Constraints & Edge Cases

- Failing constraint validation aborts evaluation immediately. Use shapes to reuse constrained types.
