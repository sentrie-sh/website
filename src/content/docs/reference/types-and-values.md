---
title: Types and Values
description: "Built-in primitive and collection types, type declarations, indexing, cast, and validation."
---

Sentrie provides primitive types (`number`, `string`, `trinary`, `bool`, `document`) and collection types (`list[T]`, `dict[T]`, `set[T]`, `record[T1,T2,...]`). User-defined [shapes](/reference/shapes) extend these. Types can be used in [let](/reference/let), [facts](/reference/facts), and shape fields. Types may carry [constraints](/reference/constraints) for runtime validation.

## Syntax

**Primitives:** `number` | `string` | `trinary` | `bool` | `document`

**Collections:** `list[T]` | `dict[T]` | `set[T]` | `record[T1, T2, ...]`

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
| `set[T]` | Distinct values of type `T`, always written out in sorted order. | Not indexable. | No literal syntax; see [Sets](#sets). Works with `in`, `contains` and `count`. |
| `record[T1,T2,...]` | Fixed-length tuple with typed positions. | `number` (zero-based position). | Length and types are fixed at type declaration. |

### Sets

A `set[T]` is a collection of **distinct** values of type `T`. Use it for membership questions such as roles, scopes and groups, where you care whether a value is present and not where it sits in a list.

Sets have no literal syntax and no operators. You write a list and let a `set[T]` type, the `set` builtin or a cast turn it into a set, then combine sets with `union`, `intersection`, `difference`, `is_subset` and `is_superset` (see [Set builtins](/reference/built-in-functions#set-builtins)). The `in` and `contains` operators and `count` work on a set as they do on a list.

A set can hold `null`, booleans, numbers, strings, and lists or dicts of those. It cannot hold `unknown`.

```sentrie
namespace com/example/auth

policy access {
  fact roles: set[string]

  rule is_admin = { yield "admin" in roles }
  rule role_list = { yield roles }

  export decision of is_admin
  export decision of role_list
}
```

With `{"roles": ["viewer", "admin"]}`, `is_admin` yields `true` and `role_list` yields `["admin", "viewer"]`.


#### Ordering

A set is always written out as an array in **sorted order**, so a decision does not depend on the order of the input. Values sort by kind first (`null`, booleans, numbers, strings, lists, dicts) and then by value. `1` and `1.0` are the same element.


#### Duplicates

A list that is bound to a `set[T]` is **validated, never silently cleaned up**: a duplicate is an error, which catches bad input at the boundary instead of hiding it. Using the `access` policy above, `{"roles": ["admin", "admin"]}` fails with `duplicate set element admin`. A typed `let` behaves the same way:

```sentrie
let admins: set[string] = ["root", "ops", "root"]
-- Error: duplicate set element root
```

When you do want duplicates dropped, say so explicitly with the `set` builtin or an `as set[T]` cast. Both remove duplicates and sort the result:

```sentrie
namespace com/example/auth

policy convert {
  rule r = {
    let a = set([3, 1, 3, 2])
    let b = [3, 1, 3, 2] as set[number]
    yield {"set": a, "cast": b}
  }
  export decision of r
}
```

This yields `{"set": [1, 2, 3], "cast": [1, 2, 3]}`.

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

### Sets: which values become sets

Only a value bound to a **top-level** `set[T]` is converted to a set: a fact, a default, a `let`, a derive parameter or return value, or a lambda return value. A `set[T]` that is nested inside a list, a dict, a record or a shape field is checked (element type and no duplicates) but stays a plain list, so it keeps its input order in the output. The same goes for a shape that is declared as `set[T]` (`shape Roles set[string]`): it validates, but its value is not converted. The set builtins accept lists, so you can still use them on such a field:

```sentrie
namespace com/example/auth

policy nested {
  fact grants: Grants
  fact groups: list[set[string]]

  shape Grants {
    roles: set[string]
  }

  rule r = {
    yield {
      "roles": grants.roles,
      "groups": groups,
      "first_group": set(groups[0])
    }
  }
  export decision of r
}
```

With `{"grants": {"roles": ["b", "a"]}, "groups": [["z", "y"]]}` this yields `{"roles": ["b", "a"], "groups": [["z", "y"]], "first_group": ["y", "z"]}`.

### Sets: checking for a set type

`x is set[T]` is true when `x` is a list of `T` with no duplicates. `x` does not have to be a set already, so a list that is distinct conforms:

```sentrie
namespace com/example/auth

policy checks {
  rule r = {
    yield {
      "distinct": [1, 2] is set[number],
      "duplicate": [1, 1] is set[number],
      "wrong_type": ["a"] is set[number]
    }
  }
  export decision of r
}
```

This yields `{"distinct": true, "duplicate": false, "wrong_type": false}`. See [Shapes](/reference/shapes) for `is` checks in general.

### Sets: decisions in a set

An imported decision stored in an **untyped** set counts as its full `{state, value}` dict, not as its state. Declare the element type as `boolean` to store states instead:

```sentrie
namespace com/example/auth

policy source {
  fact admin: boolean

  rule isAdmin = default false { yield admin }

  export decision of isAdmin
}

policy report {
  fact admin: boolean

  rule viaImport = import decision isAdmin from com/example/auth/source with admin as admin

  -- An untyped set holds the decision as its {state, value} dict
  rule untyped = {
    yield {
      "count": count(set([viaImport, true])),
      "has_true": true in set([viaImport])
    }
  }

  -- A set[boolean] holds its state
  rule typed = {
    let states: set[boolean] = [viaImport, false]
    yield {
      "count": count(states),
      "has_true": true in states
    }
  }

  export decision of untyped
  export decision of typed
}
```

With `{"admin": true}`, `untyped` yields `{"count": 2, "has_true": false}` and `typed` yields `{"count": 2, "has_true": true}`. With `{"admin": false}`, `typed` fails with `duplicate set element false`, because the imported decision is `false` and so is the second element.

## Collection Types

Collections allow you to work with groups of related values:

| Type                  | Description                                 |
| --------------------- | ------------------------------------------- |
| `list[T]`             | Lists of type `T`                           |
| `dict[T]`              | Maps with `string` keys and type `T` values |
| `set[T]`               | Distinct values of type `T`, in sorted order |
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

```text
let u: set[string] = ["read", "write"]
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
