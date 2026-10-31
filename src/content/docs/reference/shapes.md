---
title: Shapes
description: Shapes are a way to define type aliases and data models in sentrie.
---

Shapes are Sentrie's primary mechanism for defining custom data models and type aliases. They provide a powerful way to create reusable, validated types that can be composed together to build complex data models.

Shapes help in providing clear contracts for data, thus providing a built in validation layer for data that flows through your policies.

## What are Shapes?

Shapes serve two main purposes in Sentrie:

- **Data Models**: Define structured objects with named fields and constraints
- **Type Aliases**: Create custom names for existing types with additional constraints

## Defining Shapes

### Type Aliases

Shapes can be used to create type aliases for built-in types with additional constraints:

```sentrie
shape ID string @uuid()
shape Email string @email()
shape Username string @minlength(3) @maxlength(20) @alphanumeric()
shape UserAge number @min(13) @max(120)
```

This creates constrained types that can be used throughout your policies:

```sentrie
let id: ID = "123e4567-e89b-12d3-a456-426614174000" -- Valid
let email: Email = "alice@example.com"              -- Valid
let username: Username = "alice123"                 -- Valid
let age: UserAge = 25                               -- Valid
let invalid_username: Username = "ab"               -- Validation error: too short
```

### Simple Data Models

The most common use of shapes is to define structured data models:

```sentrie
shape User {
  name: string
  age: number
  email: string
}
```

This creates a `User` shape with three fields. You can then use this shape to create and validate user data:

```sentrie
let user: User = {
  name: "Alice",
  age: 28,
  email: "alice@example.com"
}
```

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
}

-- Valid: nullable required field present as null
let p2: Person = {
  name: "Bob",
  age: 30,
  middle_name: null
}

-- Valid: optional nullable field omitted
let p3: Person = {
  name: "Charlie",
  age: 32,
}

-- Invalid: required non-null field cannot be null
let bad1: Person = {
  name: null,
  age: 22
}

-- Invalid: required field cannot be absent
let bad2: Person = {
  age: 22
}
```

Migration note:

- `field!: T` -> `field: T`
- `field!?: T` / `field?!: T` -> `field?: T?`
- if old `field: T` relied on nullable behavior, write `field: T?`

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

## Shape Composition

Shapes can be composed from other shapes using the `with` keyword, allowing you to build complex data models.

### Basic Composition

```sentrie
shape User {
  name: string
  age: number
}

shape AdminUser with User {
  permissions: list[string]
  department: string
}
```

The `AdminUser` shape includes all fields from `User` and adds additional fields:

```sentrie
let admin: AdminUser = {
  name: "John",
  age: 30,
  permissions: ["read", "write", "delete"],
  department: "Engineering"
}
```

### Composition Rules

- **Composition**: Composed shapes include all fields from base shapes
- **No Circular Dependencies**: Shapes cannot reference themselves directly or indirectly
- **No Duplicate Fields**: Shapes cannot have duplicate fields directly or indirectly
- **Type Safety**: Values must match the exact shape they're assigned to
- **Data Model Requirement**: Shapes cannot be composed with alias shapes

```sentrie
-- This will cause a validation error
let user: User = {
  name: "John",
  age: 30,
  permissions: ["read", "write"]  -- User doesn't have permissions field
}
```

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
  phone?: string @regexp("^\\+?[1-9]\\d{1,14}$")
  address?: Address
}

shape User {
  name: string @minlength(2) @maxlength(100)
  age: number? @min(13) @max(120)
  contact: ContactInfo
  preferences?: dict[string]
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
  age: null,  -- Age is nullable
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
- A collection type: `list[T]`, `dict[T]` or `record[...]`
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
- A field of the shape names another shape that is not visible from where the check runs
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

- `dict[T]` is checked only for being a dictionary. The values are not checked against `T`, so `{"k": "s"} is dict[number]` is `true`.
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
// auth/auth.sentrie
namespace com/example/auth

shape User {
  id: string @uuid()
  username: string @minlength(3)
  email: string @email()
}

export shape User
```

### Importing Shapes

Other namespaces can import and use exported shapes by using the fully qualified name:

```sentrie
// billing/billing.sentrie
namespace com/example/billing

policy process_payment {
  -- Import the User shape using the fully qualified name from auth namespace
  shape User with com/example/auth/User {
    billing_address: string
  }

  let user: User = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    username: "alice",
    email: "alice@example.com",
    billing_address: "456 Oak Ave"
  }
}
```

### Policy Local Shapes

Shapes defined in a policy are only available within that policy and **take precedence** over namespace shapes:

```sentrie
// billing.sentrie
namespace com/example/billing

shape User {
  id: string @uuid()
  email: string @email()
}

policy process_payment_1 {
  -- Policy-local shape (most specific)
  shape User {
    id: string @uuid()
    billing_address: string
  }

  -- This resolves to the policy-local `User` shape
  let user: User = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    billing_address: "123 Main St"
  }

  ...
}

policy process_payment_2 {
  -- This resolves to the namespace `User` shape
  let user: User = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    billing_address: "123 Main St"
  }

  ...
}
```

## Best Practices

### Naming Conventions

- Use PascalCase for shape names: `UserProfile`, `PaymentInfo`
- Use descriptive names that clearly indicate the shape's purpose
- Avoid generic names like `Data` or `Info` unless they're truly generic

### Organization

- Group related shapes in the same namespace
- Export only shapes that need to be used by other namespaces
- Use composition to avoid duplicating common fields

### Best Practices

- Apply appropriate constraints to shape fields
- Use meaningful constraint messages for better error reporting
- Use alias shapes for better readability

```sentrie
shape Category string @one_of("electronics", "clothing", "books", "home")
shape Product {
  name: string @minlength(1) @maxlength(100) @not_empty()
  price: number @positive() @range(0.01, 999999.99)
  category: Category
  in_stock: bool
}
```
