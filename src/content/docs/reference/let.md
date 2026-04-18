---
title: Intermediate Values (let)
description: "let declaration syntax, scoping, immutability, and type validation."
---

`let` binds a name to an expression inside a block. It is used for intermediate values in a [policy](/reference/policies) or inside a [rule](/reference/rules) body. The binding is scoped to the block, is immutable (no reassignment), and cannot be exported. Only [rules](/reference/rules) can be exported. If a type annotation is present, the value is validated at runtime (including [constraints](/reference/constraints)); validation failure aborts evaluation.

## Syntax

```text
let name = expr
let name : type = expr
```

- **name:** Identifier. Must be unique within the same block (inner blocks can shadow outer names).
- **type:** Optional. Any type reference (primitive, collection, or [shape](/reference/shapes)), optionally with [constraints](/reference/constraints). When present, the value of `expr` is validated against this type at runtime.
- **expr:** Any expression. Evaluated once; the result is bound to `name`.

## Configuration & Arguments

| Part | Type | Required | Description |
| :--- | :--- | :------- | :---------- |
| `name` | identifier | Yes | Variable name. Visible in the rest of the block (and inner blocks unless shadowed). |
| `type` | type ref | No | If present, the assigned value is validated against this type and any constraints. Failure aborts evaluation. |
| `expr` | expression | Yes | Initial value. Evaluated once at the point of the `let`. |

**Returns:** N/A (binding). The name evaluates to the bound value wherever it is used in scope.

## Scoping

- **Policy-level let:** Declared in the policy block (after [facts](/reference/facts), alongside [use](/reference/functions)). Visible to all [rules](/reference/rules) in that policy. Not visible in other policies.
- **Rule-level let:** Declared inside a rule body (before the `yield`). Visible only within that rule body. Policy-level let is also visible inside the rule unless shadowed.
- **Shadowing:** A `let` in an inner block (e.g. inside a rule) can reuse the same name as an outer binding; the inner name shadows the outer one in the inner scope.

## Immutability and export

- **Immutability:** There is no syntax to reassign a `let` binding. The name always refers to the value computed at the `let` site.
- **Export:** Only rules can be exported. `let` bindings cannot be exported; they are for intermediate computation only.

## Examples in Action

### Untyped and typed let

```sentrie
let adminRoles = ["admin", "super_admin"]
let totalPrice = item.price * quantity
let count: number = 10
```

Without a type, the value is not validated against a type. With a type, the value must conform (and satisfy constraints if any).

### Typed let with constraints

```sentrie
let count: number @min(0) @max(100) = 50
```

If `50` were outside `[0, 100]`, evaluation would abort.

### Policy-level let used in rules

```sentrie
policy P {
  fact user: User
  let roles = ["admin", "editor"]
  rule allow = default false { yield user.role in roles }
  export decision of allow
}
```

`roles` is visible in the rule body.

### Let inside a rule body

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
let scores: dict[number] = {"alice": 95, "bob": 87}

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
  fact data: string as inputData

  use { sha256, now } from @sentrie/hash as hash
  use { parse } from @sentrie/json as json

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

## Using Let with `reduce`

`let` declarations can use the `reduce` builtin with a list, an initial accumulator, and a reducer lambda:

```sentrie
namespace com/example/aggregation

policy calculations {
  fact numbers: list[number] as values

  rule calculateSum = default 0 {
    let sum: number = reduce(values, 0, (acc, num, idx) => {
      yield acc + num
    })

    yield sum
  }

  rule calculateMax = default 0 {
    let max: number = reduce(values, values[0], (acc, num, idx) => {
      yield num > acc ? num : acc
    })

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
  yield basePrice * (1 - discount)
}
```

`base` and `discount` are visible only until the `yield`.

```sentrie
-- Good: Explicit types make code clearer
let count: number = 10
let items: list[string] = ["item1", "item2"]
let config: map[string]any = {"key": "value"}
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Scope:** Let is scoped to the immediate block. Policy-level let is visible to all rules in the policy. Rule-level let is visible only in that rule body. Same name in an inner block shadows the outer binding.
- **Immutability:** Let bindings cannot be reassigned. The name always refers to the initial value.
- **Export:** Only rules can be exported. Let cannot be exported.
- **Type annotation:** Optional. If present, the value is validated at runtime against the type and any constraints; constraint or type failure aborts evaluation.
- **Shadowing:** Inner blocks can declare the same name as an outer let; the inner name shadows the outer in the inner scope.
