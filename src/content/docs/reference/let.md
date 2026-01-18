---
title: Intermediate Values
description: Let declarations are containers for intermediate values within blocks. They are scoped to their immediate block and cannot be exported.
---

`let` declarations allow you to create intermediate values within a policy or rule block. They are useful for breaking down complex expressions into more readable and maintainable code.

:::note[Important]

`let` declarations are:

- **Scoped to their immediate block** (`{}`)
- **Cannot be exported** - only rules can be exported
- **Immutable** - once declared, their value cannot be changed
- **Used for intermediate calculations** within a policy or rule block

:::

## Let Declaration Syntax

### Basic Syntax

```sentrie
let <name> = <expression>

-- With optional type annotation
let <name>: <type> = <expression>
```

### Simple Examples

```sentrie
-- Simple calculations
let isAdmin = user.role is "admin"
let totalPrice = item.price * quantity

-- With type annotations
let count: number = 10
let name: string = "example"
let isActive: bool = true

-- With type annotations and constraints
let count: number @min(0) @max(100) = 50
let name: string @minlength(3) @maxlength(20) = "example"

-- can be shapes as well
let user: User = { name: "John Doe", age: 30 }
```

## Block Scoping

`let` declarations are scoped to their immediate block (`{}`). This means:

- A `let` declaration inside a block is only accessible within that block
- A `let` declaration at the policy level is accessible throughout the policy
- A `let` declaration inside a rule's block is only accessible within that rule

### Policy-Level `let` Declarations

```sentrie
namespace com/example/auth

policy userAccess {
  fact user: User as currentUser

  -- Policy-level let declaration - accessible throughout the policy
  let adminRoles = ["admin", "super_admin"]

  rule canRead = default false {
    -- Can access adminRoles here
    yield user.role in adminRoles
  }

  rule canWrite = default false {
    -- Can also access adminRoles here
    yield user.role in adminRoles and user.verified
  }

  export decision of canRead
  export decision of canWrite
}
```

### Block-Level `let` Declarations

```sentrie
namespace com/example/billing

policy pricing {
  fact basePrice: number as price
  fact quantity: number as qty

  rule calculateTotal = default 0 {
    -- Block-level let declarations - only accessible within this rule
    let discount = 0.1
    let taxRate = 0.08
    let subtotal = price * qty
    let discountAmount = subtotal * discount
    let tax = (subtotal - discountAmount) * taxRate
    let total = subtotal - discountAmount + tax

    yield total
  }

  -- Cannot access discount, taxRate, subtotal, etc. here - they're scoped to the rule block

  export decision of calculateTotal
}
```

### Nested Block Scoping

```sentrie
namespace com/example/complex

policy example {
  fact user: User as currentUser

  -- Policy-level let
  let globalValue = 100

  rule complexRule = default false {
    -- Rule-level let
    let ruleValue = 50

    -- Can access both globalValue and ruleValue here
    let combined = globalValue + ruleValue

    yield combined > 0
  }

  -- Can access globalValue here, but not ruleValue or combined
  rule anotherRule = default false {
    yield globalValue > 0
  }

  export decision of complexRule
  export decision of anotherRule
}
```

## Cannot Be Exported

`let` declarations cannot be exported. Only rules can be exported from a policy. If you need to expose a value, you must wrap it in a rule and export that rule.

### Incorrect Usage

```sentrie
namespace com/example/incorrect

policy example {
  fact user: User as currentUser

  let isAdmin = user.role == "admin"

  -- Error: Cannot export let declarations
  -- export decision of isAdmin  -- This will cause an error
}
```

### Correct Usage

```sentrie
namespace com/example/correct

policy example {
  fact user: User as currentUser

  -- Use let for intermediate calculation
  let isAdmin = user.role == "admin"

  -- Wrap in a rule and export the rule
  rule userIsAdmin = default false {
    yield isAdmin
  }

  export decision of userIsAdmin
}
```

## Immutability

`let` declarations are **immutable** - once a value is assigned to a `let` declaration, it cannot be changed or reassigned within the same scope.

### Single Assignment

Each `let` declaration can only be assigned once. Attempting to reassign a `let` declaration will result in an error:

```sentrie
namespace com/example/immutability

policy example {
  fact count: number as initialCount

  -- First assignment is valid
  let total = initialCount

  -- Error: Cannot reassign let declaration
  -- let total = total + 10  -- This will cause an error

  rule calculateTotal = default 0 {
    -- Create a new let declaration with a different name
    let updatedTotal = total + 10

    yield updatedTotal
  }

  export decision of calculateTotal
}
```

### Creating New Values

If you need to compute a new value based on an existing `let` declaration, create a new `let` declaration:

```sentrie
namespace com/example/calculations

policy pricing {
  fact basePrice: number as price

  -- Initial calculation
  let subtotal = price * 1.0

  rule calculateTotal = default 0 {
    -- Create new let declarations for subsequent calculations
    let withTax = subtotal * 1.08
    let withDiscount = withTax * 0.9
    let finalPrice = withDiscount

    yield finalPrice
  }

  export decision of calculateTotal
}
```

### Benefits of Immutability

Immutability provides several benefits:

- **Predictability**: Once assigned, a `let` declaration's value never changes, making code easier to reason about
- **Safety**: Prevents accidental reassignment that could lead to bugs
- **Clarity**: Makes it clear that intermediate values are computed once and used throughout the block

```sentrie
namespace com/example/benefits

policy example {
  fact user: User as currentUser

  -- Immutable value - guaranteed to be the same throughout the policy
  let isAdmin = user.role == "admin"

  rule canRead = default false {
    -- isAdmin is guaranteed to be the same value here
    yield isAdmin
  }

  rule canWrite = default false {
    -- isAdmin is guaranteed to be the same value here too
    yield isAdmin and user.verified
  }

  export decision of canRead
  export decision of canWrite
}
```

## Type Annotations

Type annotations can be used with `let` declarations to help with type safety and readability.

### Without Type Annotation

```sentrie
-- Type is inferred from the expression
let count = 10        -- inferred as number
let name = "John Doe" -- inferred as string
let isActive = true   -- inferred as bool
let items = [1, 2, 3] -- inferred as list[number]
```

### With Type Annotation

```sentrie
-- Explicit type annotations
let count: number = 10
let name: string = "example"
let isActive: bool = true
let items: list[number] = [1, 2, 3]
let scores: map[number] = {"alice": 95, "bob": 87}

let invalid: number = "10" -- This will cause a type error
```

### Type Annotations with Constraints

```sentrie
-- Type annotations with constraints
let age: number @min(0) @max(150) = 25
let score: number @min(0) @max(100) = 85
let tags: list[string] @maxlength(10) = ["tag1", "tag2"]
```

:::note
While type annotations are optional, they are recommended for better readability and to catch type errors early. For reference, see [Types and Values](/reference/types-and-values) and [Shapes](/reference/shapes) for more information.
:::

## Using Let in Complex Expressions

`let` declarations are particularly useful for breaking down complex expressions:

### Without Let (Hard to Read)

```sentrie
rule complexCalculation = default 0 {
  yield (user.age * 0.5 + user.experience * 0.3 + user.education * 0.2) *
        (user.isPremium ? 1.2 : 1.0) *
        (user.location == "US" ? 1.1 : 1.0)
}
```

### With Let (More Readable)

```sentrie
rule complexCalculation = default 0 {
  let baseScore = user.age * 0.5 + user.experience * 0.3 + user.education * 0.2
  let premiumMultiplier = user.isPremium ? 1.2 : 1.0
  let locationMultiplier = user.location == "US" ? 1.1 : 1.0
  let finalScore = baseScore * premiumMultiplier * locationMultiplier

  yield finalScore
}
```

## Using Let with TypeScript Functions

`let` declarations work well with TypeScript functions imported via `use` statements:

```sentrie
namespace com/example/utils

policy processing {
  use { sha256, now } from @sentrie/hash as hash
  use { parse } from @sentrie/json as json

  fact data: string as inputData

  rule processData = default false {
    let timestamp = hash.now()
    let hashValue = hash.sha256(inputData)
    let parsedData = json.parse(inputData)
    let isValid = hashValue != "" and parsedData.aField is defined

    yield isValid
  }

  export decision of processData
}
```

## Using Let with Reduce Expressions

`let` declarations can be used with `reduce` expressions for aggregations:

```sentrie
namespace com/example/aggregation

policy calculations {
  fact numbers: list[number] as values

  rule calculateSum = default 0 {
    let sum: number = reduce values from 0 as acc, num, idx {
      yield acc + num
    }

    yield sum
  }

  rule calculateMax = default 0 {
    let max: number = reduce values from values[0] as acc, num, idx {
      yield num > acc ? num : acc
    }

    yield max
  }

  export decision of calculateSum
  export decision of calculateMax
}
```

## Best Practices

### Use Descriptive Names

```sentrie
-- Good: Clear, descriptive names
let isResourceOwner = user.id == resource.owner
let hasValidSignature = auth.verifySignature(user.id, resource.id)
let isWithinBusinessHours = auth.isBusinessHours()

-- Avoid: Generic or unclear names
let x = user.id == resource.owner
let y = auth.verifySignature(user.id, resource.id)
```

### Break Down Complex Expressions

```sentrie
-- Good: Break down complex logic
rule calculatePrice = default 0 {
  let basePrice = product.price
  let discount = user.isPremium ? 0.1 : 0.05
  let tax = basePrice * 0.08
  let finalPrice = basePrice * (1 - discount) + tax

  yield finalPrice
}

-- Avoid: One-line complex expression
rule calculatePrice = default 0 {
  yield product.price * (1 - (user.isPremium ? 0.1 : 0.05)) + product.price * 0.08
}
```

### Use Type Annotations for Clarity

```sentrie
-- Good: Explicit types make code clearer
let count: number = 10
let items: list[string] = ["item1", "item2"]
let config: map[string] = {"key": "value"}

-- Acceptable: Type inference works, but explicit types are clearer
let count = 10
let items = ["item1", "item2"]
```

### Keep Let Declarations Close to Usage

```sentrie
-- Good: Let declarations close to where they're used
rule calculateTotal = default 0 {
  let subtotal = price * quantity
  let tax = subtotal * 0.08
  let total = subtotal + tax

  yield total
}

-- Avoid: Policy-level lets that are only used in one rule
policy example {
  let subtotal = price * quantity  -- Only used in one rule below

  rule calculateTotal = default 0 {
    let tax = subtotal * 0.08
    let total = subtotal + tax
    yield total
  }
}
```

## Common Patterns

### Conditional Values

```sentrie
rule processUser = default false {
  let userRole = user.role is defined ? user.role : "guest"
  let accessLevel = userRole == "admin" ? "full" : "limited"

  yield accessLevel == "full"
}
```

### Intermediate Calculations

```sentrie
rule calculateDiscount = default 0 {
  let basePrice = product.price
  let quantityDiscount = quantity > 10 ? 0.1 : 0.0
  let memberDiscount = user.isMember ? 0.15 : 0.0
  let totalDiscount = quantityDiscount + memberDiscount
  let finalPrice = basePrice * (1 - totalDiscount)

  yield finalPrice
}
```

### Data Transformation

```sentrie
rule transformData = default false {
  let normalizedName = user.name.lower()
  let sanitizedEmail = user.email.trim()
  let formattedRole = user.role.upper()

  yield normalizedName != "" and sanitizedEmail != ""
}
```

## See Also

- [Policies](/reference/policies) - Learn about policies and their structure
- [Rules](/reference/rules) - Learn about rules and how they work
- [Facts](/reference/facts) - Learn about facts and input data declarations
- [Expressions](/reference/index#expressions) - Learn about expressions and operators
