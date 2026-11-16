---
title: Types and Values
description: "Built-in primitive and collection types, unions, the any type, type declarations, indexing, cast, and validation."
---

Sentrie provides primitive types (`number`, `string`, `trinary`, `boolean`, `document`) and collection types (`list[T]`, `dict[T]`, `set[T]`, `record[T1,T2,...]`), [union types](#union-types) and the [`any` type](#the-any-type). User-defined [shapes](/reference/shapes) extend these. Types can be used in [let](/reference/let), [facts](/reference/facts), and shape fields. Types may carry [constraints](/reference/constraints) for runtime validation.

## Syntax

**Primitives:** `number` | `string` | `trinary` | `boolean` | `document`

**Collections:** `list[T]` | `dict[T]` | `set[T]` | `record[T1, T2, ...]`

**Unions:** `T1 | T2 | ...`

**Top type:** `any`

**Cast:** `expr as type`

**Indexing:**  
- List/record: `expr[number]` (zero-based index).  
- Map: `expr[string]` or `expr.identifier` (key must be a string; dot form when the key is a [valid identifier](/reference/identifiers)).

## Configuration & Arguments

### Primitive types

:::caution[Breaking change: `bool`, `int` and `float` are not types]
The only type names for numbers and truth values are `number`, `boolean` and `trinary`. `bool`, `int` and `float` are not aliases: using any of them where a type is expected is a parse error with a hint, for example `unknown type "bool": did you mean "boolean"?` (`number` for `int` and `float`). Replace `let ok: bool = ...` with `boolean`, and `int` or `float` with `number`.

The three words are still ordinary identifiers, so `let int = 5` or a field named `bool` keeps working. A shape cannot be named `bool`, `int` or `float` (parse error), because it could never be referenced as a type.

A `number` already holds either an exact integer or a float (see [Integers and floats](#integers-and-floats)), so there is nothing to choose between.
:::

| Type | Description | Notes |
| :--- | :---------- | :---- |
| `number` | Numeric values: exact 64-bit integers and 64-bit floats. | Whole numbers that fit in a signed 64-bit integer stay exact; see [Integers and floats](#integers-and-floats). |
| `string` | UTF-8 string. | Literals: double-quoted or backtick. |
| `trinary` | Three-valued logic: `true`, `false`, `unknown`. Accepts all three. | Used for conditions and [boolean operations](/reference/boolean-operations). See [Trinary](/reference/trinary). |
| `boolean` | Strictly `true` or `false`. | Behaves like a `trinary` that rejects `unknown`: a value that is `unknown` fails the check with `value 'unknown' is not a boolean ... use trinary to allow unknown`. Use `trinary` when `unknown` is a valid answer. |
| `document` | JSON-like object (string keys, arbitrary values). | Used for untyped or semi-structured data. |

### Number literals

A number literal is a run of digits, optionally followed by a fraction and an exponent:

```text
42          -- Integer (exact)
9007199254740993  -- Integers keep every digit up to 9223372036854775807
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

### Integers and floats

A `number` is either an **exact integer** or a **float**:

- A whole number that fits in a signed 64-bit integer (`-9223372036854775808` to `9223372036854775807`) is an exact integer. It keeps every digit through literals, JSON facts, arithmetic, comparison and output, including values above 2^53 (`9007199254740992`).
- A number with a fractional part or an exponent is a 64-bit float.
- An integer literal too large for 64 bits is read as a float.

```text
let id: number = 9007199254740993
let same: boolean = id == 9007199254740992    -- false: one apart, and still told apart
let equal: boolean = 5 == 5.0                 -- true: equal values compare equal in either form
```

Arithmetic on two integers is exact, and a result that does not fit in 64 bits is an overflow error. Dividing two integers gives an integer only when the division is exact (`15 / 3` is `5`, `7 / 2` is `3.5`). An operation that mixes an integer and a float is a float operation. See [Arithmetic Operations](/reference/arithmetic-operations) for the full rules.

The [numeric constraints](/reference/constraints#numeric-constraints-number) compare exactly as well, so `@max`, `@range`, `@multiple_of`, `@even` and `@odd` give the right answer for large IDs.

An integer beyond `Number.MAX_SAFE_INTEGER` (2^53-1) cannot be passed to a [TypeScript module](/reference/using-typescript#numbers-passed-to-typescript-modules): doing so is an error.

### Collection types

| Type | Description | Index type | Notes |
| :--- | :---------- | :--------- | :---- |
| `list[T]` | Ordered sequence of values of type `T`. | `number` (zero-based). | Index out of range is undefined. A non-integer index is an error; see [Indexing and access](#indexing-and-access). |
| `dict[T]` | Key-value map; keys are strings, values are type `T`. | `string` or `.key` (identifier). | Keys must be strings. Dot access: `map.key` when key is a [valid identifier or a keyword](/reference/identifiers#keywords-as-field-names). |
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

### Union types

A union type accepts a value that matches **any one** of its members. Join the members with `|`:

```sentrie
namespace com/example/types

policy unions {
  let id: string | number = "u-42"
  let ids: list[string | number] = [1, "two", 3]
  let name: string @minlength(1) | number @min(0) = "x"
  let maybe: string | number? = null

  rule values = {
    yield { "id": id, "ids": ids, "name": name, "maybe": maybe }
  }

  export decision of values
}
```

This yields `{"id": "u-42", "ids": [1, "two", 3], "name": "x", "maybe": null}`.

A union can be written wherever a type can: [facts](/reference/facts), `let` annotations, [shape](/reference/shapes) fields, [derive](/reference/derives) parameters and return types, `as` casts, `is` checks, and inside `list[...]`, `dict[...]` and `record[...]`.

#### How `|` binds

`|` binds looser than everything else in a type, so each member keeps its own `?` and constraints:

- `string | number?` is `string | (number?)`: the number member is nullable, the string member is not.
- `number @min(0) | string` constrains only the number member.
- `list[string | number]` is a list whose elements are each a string or a number.

There is no grouping syntax. A union that has a nullable member accepts `null`, whichever member carries the `?`.

#### Null

A union accepts `null` only when one of its members does. With `string | number?`, `null` is valid. With `string | number`, `null` is not:

```sentrie
let a = null is string | number?  -- true
let b = null is string | number   -- false
```

#### Casts

`expr as T1 | T2` only **checks** the value against the union. It does not convert it, so `"50" as string | number` stays the string `"50"`.

#### Derive parameters and returns

```sentrie
namespace com/example/types

derive normalize = (v: string | number): string => {
  yield v is string ? v : v as string
}

policy ids {
  fact id: string | number

  rule key = { yield normalize(id) }
  export decision of key
}
```

With `{"id": 42}` the rule yields `"42"`, and with `{"id": "u-1"}` it yields `"u-1"`. With `{"id": false}` execution stops with `value false is not string | number`.

### The `any` type

`any` accepts every value that is defined: strings, numbers, booleans, lists, dicts, documents, shapes and `null`.

```sentrie
let anything: any = [1, "a", { "k": true }]
let nothing: any = null
```

Use it for data whose structure you do not want to validate, such as a fact that is later narrowed with [`is`](/reference/shapes#checking-a-value-against-a-shape).

- `any` takes no constraints. `any @min(1)` is rejected when the pack is loaded.
- `any` does not accept an undefined value, like every other type: undefined means there is no value. An optional fact that was not provided is not `any`, so `m is any` is `false` for it.
- `any` is not a keyword. The `any(list, predicate)` quantifier and identifiers named `any` keep working.
- A shape cannot be named `any`. `shape any { ... }` fails with `cannot declare a shape named "any": it is the built-in top type`.
- On the right of `is`, a bare `any` is always this type. To compare a value to a variable named `any`, use `==`.
- As a member of a union, `any` makes the union accept every defined value, so `string | any` is the same as `any`.

### Cast

The postfix cast `expr as type` converts the value of `expr` to the given type. The result is validated against the type and any [constraints](/reference/constraints) on that type. If conversion or validation fails, evaluation errors; it never yields an unchecked value. `as` binds to the expression on its left, so write `(a + b) as number` to cast a sum. Casting `unknown` to `boolean` is an error. Supported conversions include string↔number, number↔string, boolean↔string, and literal document to `document`.

**Returns:** N/A for type declarations. For a cast: the value after conversion and validation; failure is an evaluation error.

## Indexing and access

- **List:** `listExpr[indexExpr]`. Zero-based. The index must be an integer, or a float with a whole value such as `2.0`.
  - An index past either end of the list (including a negative one) is **undefined**, not an error.
  - An undefined index (for example `xs[x.missing]`) gives undefined.
  - Any other index is an **error**: `list index must be an integer, got <kind or value>`. That covers a string, bool, null, list or dict, and a fractional number such as `1.7` or `NaN`. `[10, 20, 30]["foo"]` and `[10, 20, 30][1.7]` stop evaluation; they no longer return `10` and `20`.
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
let b: boolean = true
let arr: list[number] = [1, 2, 3]
let m: dict[number] = { "one": 1, "two": 2 }
let r: record[string, number, boolean] = ["one", 1, true]
```

### Indexing

```text
let first: number = arr[0]
let one: number = m["one"]
let oneAlt: number = m.one
```

### Index errors

```text
let xs: list[number] = [10, 20, 30]
let ok: number = xs[2.0]        -- 30
let none: number = xs[5]        -- undefined (out of range)
let bad = xs["foo"]             -- Error: list index must be an integer, got string
let frac = xs[1.7]              -- Error: list index must be an integer, got 1.7
```

**Breaking change (v0.0.5):** packs that indexed a list with a string, a bool, null or a fractional number now fail at evaluation. An undefined index used to read element zero and now gives undefined. Fix the index (cast with `as number` and round it yourself if it is fractional) before upgrading.

### Cast

```text
let x: number = "50" as number
let y: string = 50 as string
let z: boolean = "true" as boolean
let doc: document = { "name": "John", "age": 30 } as document
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Type annotation on let:** Optional. When omitted, the value is not validated against a type. When present, the value is validated (and constraints apply); failure aborts evaluation.
- **Map keys:** Must be strings. Access with `[index]`: integer index for list/record, string key for map. A missing map key is undefined, as before; a string or fractional list index is an error. Dot access for maps only when the key is a [valid identifier or a keyword](/reference/identifiers#keywords-as-field-names).
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

### Unions: when no member matches

If a value matches none of the members, the check fails and reports why. The error names the **closest member**: the first member, in source order, whose outer kind accepts the value (string, number, boolean, list, record, dict, document or a shape, read through shape aliases).

```text
let v: number @min(10) | string = 5
-- Error: invalid value for let declaration v: value 5 does not match number | string
--   at <location>: closest member number: constraint failed: 'min' ...
```

Here `5` is a number, so `number` is the closest member and its failed `@min` constraint is the reported reason. If no member's kind accepts the value, the error names the whole union instead:

```text
let v: string | number = true
-- Error: invalid value for let declaration v: value true is not string | number
--   at <location> - expected one of its members
```

If a member itself cannot be checked, such as a shape that does not exist or a constraint with invalid arguments, the check fails with that error rather than skipping the member. This holds for `is` and `is not` too, so a broken member can never make a check pass by accident. For example, `"abc" is string @minlength("x") | number` stops with a `constraint failed: 'minlength'` error instead of returning `false`. A member that matches still wins: `5 is string @minlength("x") | number` is `true`, because the number member matches and the broken string member is never reported.

### Unions: errors found before running

`sentrie validate` and `sentrie exec` report these when the pack is loaded:

- A `|` between two expressions, such as `let x = 1 | 2`: `unexpected '|': only '|>' is supported in an expression; '|' separates the members of a union type`.
- A union with a missing member, such as `string |`.
- `shape any`, and constraints on `any`.
- An `is` check with a union member that names a shape that is not visible, such as `x is string | Missing`. `sentrie validate` rejects it as `shape "Missing" is not visible here`.

An unknown shape in a union written elsewhere, such as `let x: string | Missing = 5`, is not found by `sentrie validate`. It fails when `exec` evaluates it, with `shape 'Missing' not found`, unless another member matches the value.

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

A `dict[T]` entry that holds an undefined value counts as absent, because undefined is not a value. `{ "a": payload.missing, "b": 2 } is dict[number]` is `true`, and a typed `let`, a lambda parameter or return, or a shape field of type `dict[number]` accepts such a dict. An entry with a real value of the wrong type still fails, so `{ "a": payload.missing, "b": "two" } is dict[number]` is `false`. The entry is not removed from the value: the dict keeps the key, and JSON output writes it as `null`, for example `{"a":null,"b":2}`. A `list[T]` element holding undefined still fails the check.

```sentrie
namespace docs/dictundef

policy P {
  fact payload: document

  rule entryIsAbsent = {
    let scores = { "a": payload.missing, "b": 2 }
    yield scores is dict[number]
  }

  rule wrongValue = {
    let scores = { "a": payload.missing, "b": "two" }
    yield scores is dict[number]
  }

  rule typedLet = {
    let scores: dict[number] = { "a": payload.missing, "b": 2 }
    yield scores
  }

  export decision of entryIsAbsent
  export decision of wrongValue
  export decision of typedLet
}
```

With `{"payload": {}}`, `entryIsAbsent` is `true`, `wrongValue` is `false`, and `typedLet` is `{"a": null, "b": 2}`.

The check includes the constraints on `T`: with `dict[number @min(0) @max(100)]`, `{"a": 50, "b": 150}` fails with `value for key "b" is not valid`, followed by the failed constraint. When `T` is a [shape](/reference/shapes#closed-and-open-shapes), each value is checked against it, so a value with a field the shape does not declare is rejected too, with the key named.

A dict literal with a repeated key is not an error: the last value wins and nothing is reported (`{ "k": 1, "k": 2 }` has `k` equal to `2`).

```text
let u: record[string, number, boolean] = ["one", 1, true]
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
let u: boolean = "true" as boolean
```

```text
let u: document = { "name": "John", "age": 30 } as document
```
