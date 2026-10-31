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
| `set[T]`              | Distinct values of type `T`, in sorted order |
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

```text
let u: set[string] = ["read", "write"]
```

## Sets

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

### Ordering

A set is always written out as an array in **sorted order**, so a decision does not depend on the order of the input. Values sort by kind first (`null`, booleans, numbers, strings, lists, dicts) and then by value. `1` and `1.0` are the same element.

### Duplicates

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

### Which values become sets

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

### Checking for a set type

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

### Sets of decisions

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
