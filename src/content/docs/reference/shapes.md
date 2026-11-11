---
title: Shapes
description: "Shape syntax (data models, field modifiers, composition, type aliases, export) and validation."
---

Shapes define structured data (field-based models) or type aliases (a base type plus optional [constraints](/reference/constraints)). They are used as the type of [facts](/reference/facts), [let](/reference/let) bindings, and nested fields. Shape values are validated at runtime when assigned or passed as input.

## Syntax

### Data model (complex shape)

A shape with a body of named, typed fields:

```text
shape Name {
  fieldName: type
  fieldName?: type
  fieldName: type?
  fieldName?: type?
}
```

Each field has a name, an optional `?` suffix on the name, a colon, and a type (any [type or shape](/reference/types-and-values)). A `?` on the name makes the field optional; a `?` after the type makes its value nullable.

A shape is **closed** by default: a value that carries a field the body does not declare is rejected. To accept undeclared fields, end the body with the open-shape marker `...` (see [Closed and Open Shapes](#closed-and-open-shapes)):

```text
shape Name {
  fieldName: type
  ...
}
```

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
  field: type
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

Every field in a shape body has two independent properties: whether the field is **required** (must be present in the value) and whether it is **nullable** (may be `null` when present). A `?` on the field name controls presence; a `?` after the type controls nullability.

| Form         | Required? | Nullable? | Meaning |
| :----------- | :-------- | :-------- | :------ |
| `field: T`   | Yes       | No        | Field must be present and must not be `null`. |
| `field?: T`  | No        | No        | Field may be omitted; if present, value must not be `null`. |
| `field: T?`  | Yes       | Yes       | Field must be present; value may be `null`. |
| `field?: T?` | No        | Yes       | Field may be omitted; if present, value may be `null`. |

- **Required:** If the field is missing from the value at runtime, validation fails.
- **Nullable:** If the field is present and its value is `null`, validation fails unless the type is nullable (`T?`).
- **Legacy `!`:** The `!` field modifier has been removed. Write `field!: T` as `field: T`, and `field!?: T` or `field?!: T` as `field?: T`. If an old bare `field: T` relied on being nullable, write `field: T?`.

Field type can be any type reference: primitives (`number`, `string`, `trinary`, `bool`, `document`), collections (`list[T]`, `dict[T]`, `record[...]`), or another shape. Constraints on the type are validated when the value is assigned or when the value is supplied as a fact.

### Closed and open shapes

:::caution[Breaking change]
Shapes are closed by default. Before, a value could carry fields its shape did not declare and they passed through unchecked. A pack that relied on this, for example by passing a whole upstream JSON object to a shape that names only some of its fields, now fails the shape check. In a typed `let`, a derive argument or a fact it is an evaluation error; for a fact served by `sentrie serve` it is a request error. Declare the extra fields, or end the shape body with `...` to keep the old behaviour for that shape.
:::

A value checked against a closed shape must not carry a field the shape does not declare. The fields a shape takes in through `with` count as declared. A key holding `undefined` counts as absent, so it is not an undeclared field: with a `payload` fact that has no `role`, `{ "name": "Alice", "age": 28, "role": payload.role } is User` is `true`.

```sentrie
namespace com/example/users

shape User {
  name: string
  age: number
}

policy access {
  rule r = {
    let u: User = { "name": "Alice", "age": 28, "role": "admin" }
    yield u.name
  }

  export decision of r
}
```

`sentrie validate` accepts this pack and running `r` fails:

```text
invalid value for let declaration u: field role is not declared in shape com/example/users/User at <file>:10:19-66 - the shape is closed; end its body with '...' to allow undeclared fields
```

The same holds at every depth. A shape reached through a field, a `list[...]`, a `dict[...]` or a `record[...]` is closed on its own, and the error says which field it came from. With a `User` that has an optional `address?: Address` field, a fact `{"name": "A", "age": 28, "address": {"city": "x", "zip": "1"}}` fails with:

```text
field 'address' is not valid: field zip is not declared in shape com/example/users/Address at <file>:15:3-18 - the shape is closed; end its body with '...' to allow undeclared fields
```

Declared fields are checked first, so a missing or wrongly typed field is reported before an undeclared one. When several fields are undeclared, the first in sorted order is reported, so the message is the same on every run.

#### Opting out with `...`

End the shape body with `...` to accept fields the shape does not declare. The declared fields are still checked as usual; only the undeclared ones are let through.

```sentrie
namespace com/example/users

shape User {
  name: string
  age: number
  email?: string
  ... -- keep any other keys the upstream sends
}

policy access {
  fact user: User

  rule adult = default false {
    yield user.age >= 18
  }

  export decision of adult
}
```

With `{"user": {"name": "A", "age": 28, "role": "admin"}}` as the facts, `adult` is `true`. Without the `...` line the same input fails with `field role is not declared in shape com/example/users/User ...`.

Rules for the marker:

- `...` must be the last entry in the body. A field after it is a parse error: `the open-shape marker '...' at <span> must be the last entry in the shape body`.
- A comment may follow it, as above.
- It applies to the shape that writes it, not to the shapes nested inside. Making `Envelope` open does not open the `Address` that one of its fields names; that shape is closed unless it has its own `...`.

#### Openness and `with`

Openness is not inherited through `with`. A child is closed unless its own body ends with `...`, whether or not its base is open:

```sentrie
namespace com/example/users

shape Base {
  id: string
  ...
}

shape Child with Base {
  role: string
}

shape OpenChild with Base {
  role: string
  ...
}
```

With `{"id": "1", "role": "a", "x": 1}`, a `Child` fails with `field x is not declared in shape com/example/users/Child ...` while an `OpenChild` is accepted. The reverse also holds: an open child of a closed base is open.

#### Duplicate fields

Declaring the same field twice in one shape body is a parse error that names both declarations, so `sentrie validate` rejects the pack:

```sentrie
namespace com/example/users

shape User {
  name: string
  name: number
}
```

```text
parsing error at <file>:5:3-15: duplicate shape field 'name': first declared at <file>:4:3-15
```

Earlier, the second declaration silently replaced the first.

#### Duplicate keys in a dict literal

A dict literal is not a shape, and a repeated key in one is not an error. The last value wins and nothing is reported:

```sentrie
namespace com/example/users

policy keys {
  rule r = {
    let m = { "k": 1, "k": 2 }
    yield m.k
  }

  export decision of r
}
```

`r` yields `2`.

#### Values of a `dict[T]`

Every value of a `dict[T]` is checked against `T`, including its constraints, and the error names the key. With `fact scores: dict[number @min(0) @max(100)]`, `{"a": 50, "b": 150}` fails with `value for key "b" is not valid ... constraint failed: 'max'`, and `{"a": 50, "b": "x"}` fails with `value for key "b" is not valid ... value x is not a number`. When `T` is a shape, each value is checked against the closed shape like any other.

### Composition rules

| Aspect | Rule |
| :----- | :--- |
| Base shape | Exactly one `with BaseName`. The base must be a complex shape (or a type-alias shape that the implementation treats as a structural base where applicable). |
| Visibility | Base must be in the same namespace or exported from another namespace. Cross-namespace base requires the base shape to be declared with `export shape BaseName` in its file. |
| Duplicate fields | A child cannot declare a field with the same name as a field in the base. |
| Openness | Not inherited. Each shape is closed unless its own body ends with `...`; see [Closed and Open Shapes](#closed-and-open-shapes). |
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
- **Nested types:** A shape field’s type can be another shape or `list[ShapeName]`, `dict[ShapeName]`, etc.
- **Policy composition:** Imported policies can bind facts using shapes defined in another namespace if those shapes are exported.

## Examples in Action

### Data model with all modifier variants

```sentrie
shape User {
  name: string
  age: number?
  email?: string?
  phone?: string
}
```

- `name` must be present and non-null.
- `age` must be present but may be null.
- `email` may be omitted; if present, may be null.
- `phone` may be omitted; if present, must not be null.

### Checking optional fields in rules

Optional or nullable fields should be checked before use. Use `is defined` to test presence (and often combine with a null check if the field is nullable).

```sentrie
shape Item { name: string; price?: number }

rule showPrice = default "n/a" when item.price is defined {
  yield item.price as string
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
shape Base { id: string }
shape Extended with Base { role: string }
```

A value of type `Extended` must have both `id` and `role`, and both must be non-null (neither type is nullable).

### Composition with exported base (cross-namespace)

Exported shapes from another file can be used as composition bases. See [Exporting Shapes](#exporting-shapes) and [Policy composition](/language-concepts/policy-composition).

#### Field Optionality and Nullability

Sentrie models field contracts on two independent axes:

- `field?` controls **presence** (whether the field may be absent)
- `T?` controls **value nullability** (whether the present value may be `null`)

The canonical shape field matrix is:

- `field: T` -> required, non-null
- `field?: T` -> optional, if present non-null
- `field: T?` -> required, nullable
- `field?: T?` -> optional, nullable

```sentrie
shape Person {
  name: string
  age: number
  gender?: string
  middle_name: string?
  nickname?: string?
}
```

Examples:

```sentrie
-- Valid: required fields are present and non-null
let p1: Person = {
  name: "Alice",
  age: 25,
  middle_name: "Jane"
}

-- Valid: nullable required field present as null
let p2: Person = {
  name: "Bob",
  age: 30,
  middle_name: null
}

-- Valid: optional fields omitted
let p3: Person = {
  name: "Charlie",
  age: 32,
  middle_name: null
}

-- Invalid: required non-null field cannot be null
let bad1: Person = {
  name: null,
  age: 22,
  middle_name: null
}

-- Invalid: required field cannot be absent
let bad2: Person = {
  age: 22,
  middle_name: null
}
```

:::note[Checking Optional Fields]
You can check if optional fields are defined using the `is defined` operator:

```sentrie
let user: User = {
  name: "Alice",
  age: 25,
  email: "alice@example.com"
}

-- You can also use this in boolean expressions
let has_phone: bool = user.phone is defined
let contact_info: string = user.phone is defined ? user.phone : "No phone available"
let display_gender: string = user.gender ?: "unknown"

-- Check if optional fields exist using ternary operator
let phone_message: string = user.phone is defined ? "Phone: " + user.phone : "No phone number provided"
```

:::

### Composition rules

- **Composition**: Composed shapes include all fields from base shapes
- **No Circular Dependencies**: Shapes cannot reference themselves directly or indirectly
- **No Duplicate Fields**: Shapes cannot have duplicate fields directly or indirectly
- **Type Safety**: Values must match the exact shape they're assigned to
- **Data Model Requirement**: Shapes cannot be composed with alias shapes

A value with a field the shape does not declare is rejected; see [Closed and Open Shapes](#closed-and-open-shapes).

## Applying Constraints

Shape properties can have constraints applied to them, providing runtime validation:

```sentrie
shape User {
  name: string @minlength(2) @maxlength(50) @not_empty()
  age: number @min(0) @max(150)
  email: string @email() @not_empty()
  score: number @range(0.0, 100.0)
}
```

When creating instances of this shape, all constraints are validated:

```sentrie
let user: User = {
  name: "Alice",           -- Valid: meets length requirements
  age: 25,                 -- Valid: within range
  email: "alice@test.com", -- Valid: proper email format
  score: 85.5              -- Valid: within range
}

-- This would fail validation
let invalid_user: User = {
  name: "A",               -- Too short
  age: -5,                 -- Below minimum
  email: "invalid-email",  -- Not a valid email
  score: 150.0             -- Above maximum
}
```

## Nested Data Models

Shapes excel at modeling complex, nested data models with proper nullability handling:

```sentrie
shape Address {
  street: string @not_empty()
  city: string @not_empty()
  state: string @length(2) @uppercase()
  zip: string @regexp("^[0-9]{5}(-[0-9]{4})?$")
}

shape ContactInfo {
  email: string @email()
  phone?: string @regexp("^\\+?[1-9]\\d{1,14}$")  -- Optional phone
  address?: Address  -- Optional address
}

shape User {
  name: string @minlength(2) @maxlength(100)
  age: number? @min(13) @max(120)  -- Can be null if unknown
  contact: ContactInfo
  preferences?: dict[string]  -- Optional preferences
}
```

Usage examples showing different nullability scenarios:

```sentrie
-- Complete user with all fields
let user1: User = {
  name: "John Doe",
  age: 30,
  contact: {
    email: "john@example.com",
    phone: "+1234567890",
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345"
    }
  },
  preferences: {
    "theme": "dark",
    "notifications": "enabled"
  }
}

-- User with minimal required fields (optional fields omitted)
let user2: User = {
  name: "Jane Smith",
  age: null,  -- Age unknown
  contact: {
    email: "jane@example.com"
    -- phone and address are optional, so omitted
  }
  -- preferences are optional, so omitted
}

-- User with some optional fields
let user3: User = {
  name: "Bob Wilson",
  age: 25,
  contact: {
    email: "bob@example.com",
    phone: "+1987654321"
    -- address omitted (optional)
  },
  preferences: {
    "theme": "light"
  }
}
```

## Union and `any` Fields

A field, or the whole shape, can be a [union](/reference/types-and-values#union-types) or [`any`](/reference/types-and-values#the-any-type). `?` and constraints bind to the member they follow:

```sentrie
namespace com/example/orders

shape Address {
  city: string
  zip: string | number
}

shape Order {
  id: string | number
  note?: string | number?
  ship: Address | list[Address]
  extra: any
}

shape Scalar string | number?

policy intake {
  fact payload: any

  rule check = default false when payload is Order {
    yield true
  }

  export decision of check
}
```

`check` is `true` for `{"id": "o1", "ship": {"city": "Oslo", "zip": "0150"}, "extra": null}` and for `{"id": 7, "note": null, "ship": [{"city": "Oslo", "zip": 150}], "extra": [1, 2]}`. It is `false` when `id` is `true`, when `zip` is `true`, or when `extra` is missing: a required `any` field must be present, although its value can be anything, `null` included.

A shape cannot be named `any`.

## Checking a Value Against a Shape

The `is` operator checks whether a value conforms to a shape or type. The result is `true` when the value validates against it and `false` when it does not. A value that does not conform is never an error, so a policy can branch on the shape of its input.

```sentrie
value is T
value is not T
```

`T` can be any of:

- A primitive type: `string`, `number`, `boolean`, `trinary` or `document`
- A collection type: `list[T]`, `dict[T]`, `set[T]` or `record[...]`
- A shape name, either bare (`User`) or qualified (`com/example/auth/User`)
- A union of any of these, such as `string | number` or `Purchase | Click` (see [Union Types](/reference/types-and-values#union-types))
- `any`, which every defined value conforms to

Any of these can be followed by `?` to accept `null`, and by constraints such as `@minlength(3)`. In a union, `?` and constraints apply to the member they follow:

```sentrie
namespace com/example/orders

shape Order {
  id: string
  total: number
}

shape Email string @email()

policy checkout {
  fact payload: document

  rule results = {
    let a = payload is Order
    let b = "alice@example.com" is Email
    let c = [1, "x"] is list[number]
    let d = "hello" is string@minlength(3)
    let e = null is string?
    let f = null is string
    yield { "a": a, "b": b, "c": c, "d": d, "e": e, "f": f }
  }

  export decision of results
}
```

With `{"id": "o1", "total": 50}` as `payload`, `a` is `true`, `b` is `true`, `c` is `false`, `d` is `true`, `e` is `true` and `f` is `false`.

### Checking Against a Union

Use a union to branch on which of several types a value has:

```sentrie
namespace com/example/orders

policy kinds {
  fact payload: any

  rule results = {
    let a = payload.id is string | number
    let b = payload.id is string ? "string" : "number"
    let c = payload.note is string | number?
    yield { "a": a, "b": b, "c": c }
  }

  export decision of results
}
```

With `{"id": "o1"}` as `payload`, the result is `{"a": true, "b": "string", "c": false}`. With `{"id": 7, "note": null}` it is `{"a": true, "b": "number", "c": true}`. `c` is `false` in the first case because `note` is undefined, and `is` is `false` for an undefined value whatever the type.

Write `x is any` to test whether a value is defined at all. It is `true` for everything except an undefined value, `null` included.

### Results

| Value | `value is T` |
| --- | --- |
| Conforms to `T` | `true` |
| Does not conform to `T` | `false` |
| Undefined | `false` |
| `null`, and `T` is nullable (`T?`) | `true` |
| `null`, and `T` is not nullable | `false` |
| `null`, and `T` is `any` or a union with a nullable member | `true` |
| Defined, and `T` is `any` | `true` |

`is not` is the negation of each row.

The check fails with an error, rather than returning `false`, only when the check itself cannot be made:

- A constraint is given invalid arguments, such as `@minlength("x")` (constraint arguments must be literals)
- A field of the shape names another shape that is not visible from where the shape is declared (see [Where a Shape's Fields Resolve](#where-a-shapes-fields-resolve))
- A member of a union cannot be checked, for example `"abc" is string @minlength("x") | number`. A member that matches wins, so `5 is string @minlength("x") | number` is `true`

When the right-hand side of `is` names a shape that is not visible, as in `x is A | Missing`, the pack fails validation (`sentrie validate`) before any rule runs.

### Shape or Value

The same syntax is also equality: `name is "Alice"` compares two values. When the right-hand side is a bare name, Sentrie decides what it means when the pack is validated. A bare `any` is the exception: it is always the type, so use `==` to compare against a value named `any`.

- If the name is a shape, `is` checks the value against that shape.
- If the name is a value in scope, such as a `let` or a fact, `is` compares for equality.
- If the name is both, or neither, validation fails. Rename one of them, or use `==` to compare values.

A shape that is unknown, or that belongs to another namespace and is not exported, is reported the same way when the pack is validated.

Because this is settled at validation time, adding a shape or a `let` can never silently turn one kind of check into the other, and a misspelt shape name is reported before any rule runs.

Inside a `derive`, shape names resolve in the derive's own scope, not the caller's.

### Nullable Types and the Ternary Operator

`?` also starts the ternary operator, so `is` has to tell the two apart. In `x is T`, a `?` right after the type is the ternary operator when the next token can start an expression (`x is string ? "a" : "b"`). Otherwise it marks the type nullable (`x is string?`).

Two further cases:

- After a type keyword, a `?` before `{` is also nullable, so `when x is string? { ... }` works.
- After a shape name, which could also be a value, `? {` stays a ternary: `x is y ? {...} : {...}`.

So a nullable shape in front of a rule body needs parentheses, `when (x is User?) { ... }`. Or leave the `?` off: a non-null value that conforms to `User?` also conforms to `User`.

### Gating a Rule on a Shape

Use `is` in a `when` clause so that a rule only runs for input of the right shape:

```sentrie
namespace com/example/events

shape Purchase {
  kind: string
  amount: number @min(0)
  currency: string @length(3)
}

policy classify {
  fact event: document

  rule big = default false when event is Purchase {
    yield event.amount >= 1000
  }

  export decision of big
}
```

If `event` is not a valid `Purchase`, the rule falls back to its default of `false`. It does not raise an error, and `event.amount` is never read.

### Heterogeneous Input

When a fact can arrive in more than one form, check each form in turn:

```sentrie
shape Click {
  kind: string
  x: number
  y: number
}

policy classify {
  ...

  rule label = default "other" {
    yield event is Purchase ? "purchase" : (event is Click ? "click" : "other")
  }
}
```

This extends the `classify` policy above, next to the `Purchase` shape. A purchase with a negative `amount` fails the `Purchase` check, so it is labeled `"other"` rather than raising an error.

### Limits

- Inside a `derive`, `is` resolves shapes in the derive's scope, but casts, typed parameters and return types in a derive still validate against the caller's policy.

## Shape Management

### Local Availability

Shapes are automatically available within their defining namespace:

```sentrie
namespace com/example/users

shape User {
  name: string
  age: number
}

policy example {
  -- User shape is available here
  let user: User = { name: "Alice", age: 25 }
}
```

### Exporting Shapes

To make shapes available to other namespaces, use the `export` keyword:

```sentrie
namespace com/example/auth

shape Base { id: string }
export shape Base

policy P {
  -- ...
}
```

In another file in a different namespace, a shape can extend `Base` by referencing the exported name (see [Policy composition](/language-concepts/policy-composition) and namespace resolution). The base shape must be exported for cross-namespace composition.

### Where a Shape's Fields Resolve

The shapes named in a shape's fields and alias resolve where the shape is declared, not where a value is checked against it. An exported shape therefore checks its fields against its own namespace's shapes from any caller, and a caller that declares a shape with the same name does not change the check:

```sentrie
namespace com/example/catalog

shape Price {
  amount: number
}

shape Item {
  sku: string
  price: Price
}

export shape Item
```

```sentrie
namespace com/example/shop

shape Price {
  cents: number
}

policy cart {
  fact line: document as line
  rule ok = { yield line is com/example/catalog/Item }
  export decision of ok
}
```

`price` is checked against `com/example/catalog`'s `Price`, so `{"sku": "a", "price": {"amount": 1}}` gives `true` and `{"sku": "a", "price": {"cents": 1}}` gives `false`.

The same holds for:

- A field a shape takes in through `with`: it resolves in the shape that declared it.
- A namespace shape whose field names a shape declared only inside a policy: the field's shape is not visible from the namespace, so checking a value against it fails with an error naming the missing shape, even when the check runs in that policy. Declare the field's shape in the namespace instead.
- A policy-local shape: its fields resolve in its policy, so they can name that policy's shapes.

### Shape literals and field order

When constructing a value (e.g. in a let or as input), field order in the literal does not affect type checking. All required fields must be present, all constraints must hold, and, unless the shape ends with `...`, no field the shape does not declare may appear.

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Validation timing:** Shape (and constraint) validation runs when a value is assigned to a variable or field of that shape, or when facts are bound. Failure aborts evaluation.
- **Optional fields:** Use `is defined` (and null checks if the field is nullable) before using an optional or nullable field in expressions. Accessing a missing optional field yields `unknown` in expressions; the shape validator only checks that required fields are present and non-nullable fields are non-null when present.
- **Closed by default:** A value with a field the shape does not declare fails the shape check; end the shape body with `...` to allow it. Openness is not inherited through `with`. See [Closed and Open Shapes](#closed-and-open-shapes).
- **Composition:** The composed shape effectively has all base fields plus its own. Circular composition (A with B, B with A, or longer cycles) is not allowed. Duplicate field names between base and child, or within one shape body, are not allowed.
- **Export:** Only shapes declared in the same file can be exported with `export shape Name`. Exported shapes are visible to other namespaces for use as types or as base shapes in composition. Unexported shapes are namespace-local.
- **Field order:** The order of fields in a shape literal does not affect type checking; only presence and types (and constraints) matter.
- **Naming:** Shape names and field names are [identifiers](/reference/identifiers). The same namespace can contain multiple shapes; policies in that namespace can reference any shape in the same namespace or any exported shape from another namespace (per import/resolution rules).
