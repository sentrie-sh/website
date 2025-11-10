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

#### Field Nullability and Optionality

Shapes support different field requirements using special markers:

- **Required fields** (default): Field must be present and can be null
- **Required non-null fields** (`!`): Field must be present and cannot be null
- **Optional fields** (`?`): Field may be omitted entirely

```sentrie
shape User {
  name!: string           -- Required, cannot be null
  age: number                -- Required, can be null
  email?: string          -- Optional, can be omitted
  phone!?: string         -- Optional, but if present cannot be null
}
```

Examples of valid and invalid usage:

```sentrie
-- Valid: all required fields present, optional field omitted
let user1: User = {
  name: "Alice",
  age: 25
}

-- Valid: all fields present, including optional
let user2: User = {
  name: "Bob",
  age: 30,
  email: "bob@example.com"
}

-- Valid: required field can be null
let user3: User = {
  name: "Charlie",
  age: null
}

-- Invalid: required non-null field is null
let user4: User = {
  name: null,  -- Error: name cannot be null
  age: 25
}

-- Invalid: required field is missing
let user5: User = {
  age: 25  -- Error: name is required
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
  street!: string @not_empty()
  city!: string @not_empty()
  state!: string @length(2) @uppercase()
  zip!: string @regexp("^[0-9]{5}(-[0-9]{4})?$")
}

shape ContactInfo {
  email!: string @email()
  phone?: string @regexp("^\\+?[1-9]\\d{1,14}$")  -- Optional phone
  address?: Address  -- Optional address
}

shape User {
  name!: string @minlength(2) @maxlength(100)
  age: number @min(13) @max(120)  -- Can be null if unknown
  contact!: ContactInfo
  preferences?: map[string]  -- Optional preferences
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
  id!: string @uuid()
  email!: string @email()
}

policy process_payment_1 {
  -- Policy-local shape (most specific)
  shape User {
    id!: string @uuid()
    billing_address!: string
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
  name!: string @minlength(1) @maxlength(100) @not_empty()
  price!: number @positive() @range(0.01, 999999.99)
  category!: Category
  in_stock: bool
}
```
