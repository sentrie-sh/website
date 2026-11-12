---
title: Boolean Operations
description: "Logical (and, or, xor, not), comparison (==, !=, <, <=, >, >=), pattern (matches), and conditional (ternary, Elvis) operators."
---

Boolean operations combine conditions, compare values, and branch on truthiness. Logical and comparison operators use [trinary](/reference/trinary) semantics (true, false, unknown). The pattern operator `matches` works on strings and returns a boolean. The ternary (`? :`) operator chooses a value based on whether a condition is truthy; only `true` is truthy. The Elvis (`?:`) operator is different: it falls back to its default only when the left side is undefined or `null`.

## Syntax

**Logical (binary):** `and` | `or` | `xor`

**Negation (unary):** `not expr` | `! expr`

- **Trinary Logic**: Three-valued logic with `true`, `false`, and `unknown`
- **Conditional Operators**: Ternary (`? :`) and Elvis (`?:`) operators for conditional value selection
- **Logical Operations**: Boolean logic with `and`, `or`, `not`
- **Comparison Operations**: Equality, inequality, and ordering comparisons
- **Pattern Matching**: Regular expression matching
- **Collection builtins and membership**: List quantifiers (`any`, `all`), plus `in` and `contains`
- **State Checking**: Checking emptiness and definedness

**Comparison:** `==` | `!=` | `is` | `is not` | `<` | `<=` | `>` | `>=`

**Pattern:** `stringExpr matches patternExpr` (both operands strings; right is a regex pattern)

**Conditional:** `condition ? trueValue : falseValue` | `expr ?: default`

## Configuration & Arguments

| Operator             | Operands                         | What it does                                                                                                                   | Returns                 |
| :------------------- | :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| `and`                | expr, expr                       | Logical AND (Kleene). Short-circuits: if left is false, right is not evaluated.                                                | trinary                 |
| `or`                 | expr, expr                       | Logical OR (Kleene). Short-circuits: if left is true, right is not evaluated.                                                  | trinary                 |
| `xor`                | expr, expr                       | Logical XOR. True when exactly one operand is truthy.                                                                          | trinary                 |
| `not`, `!`           | expr                             | Logical NOT (unary). One operand; converted to trinary then negated (true↔false; unknown→unknown).                             | trinary                 |
| `==`, `is`           | expr, expr                       | Equality. Both sides must be comparable.                                                                                       | trinary                 |
| `!=`, `is not`       | expr, expr                       | Inequality.                                                                                                                    | trinary                 |
| `<`, `<=`, `>`, `>=` | expr, expr                       | Ordering. Both sides must be comparable (e.g. number, string).                                                                 | trinary                 |
| `matches`            | string, string                   | Left: value; right: regex pattern (Go [regexp](https://pkg.go.dev/regexp)). Invalid pattern → error.                           | boolean                 |
| `? :`                | condition, trueValue, falseValue | Ternary: if condition is truthy, result is trueValue; else falseValue. Only the chosen branch is evaluated. Right-associative. | type of chosen branch   |
| `?:`                 | expr, default                    | Elvis: if expr is undefined or `null`, result is default; otherwise result is expr, whatever its value (`false`, `0`, `""`, `unknown` and empty collections are kept). | type of expr or default |

**Returns:** Trinary for logical and comparison; boolean for `matches`; type of the chosen value for ternary and Elvis.

## Truthiness (for ternary)

Only `true` is truthy. The following are treated as non-truthy: `false`, `unknown`, `null`, `0`, `""`, and empty collections. So `cond ? a : b` yields `b` when `cond` is any of these.

Elvis does not use truthiness. `expr ?: default` yields `default` only when `expr` is undefined or `null`, so `false ?: true` is `false`, `0 ?: 9` is `0`, `"" ?: "x"` is `""` and `unknown ?: true` is `unknown`. To fall back on other values, test them explicitly, for example with a ternary.

## Short-circuit and evaluation order

- **and:** Left-to-right. If the left operand is false, the right is not evaluated.
- **or:** Left-to-right. If the left operand is true, the right is not evaluated.
- **? ::** Only the branch selected by the condition is evaluated. The condition is always evaluated first.

## Examples in Action

### Logical and comparison

```text
let a: boolean = true and false
let b: boolean = age >= 18
let c: boolean = not (user.role in allowed_roles)
```

### Ternary and Elvis

```sentrie
let d: string = age >= 18 ? "adult" : "minor"
let e: string = user.name ?: "Anonymous"
```

### Pattern matching (regex)

```text
let g: boolean = email matches `^[a-z]+@[a-z]+\\.com$`
```

Left and right must be strings. The right is interpreted as a Go regexp. Invalid pattern causes an evaluation error.

### Combining conditions

```text
let f: boolean = user.role == "admin" or (user.role == "user" and user.status == "active")
let h: boolean = not (role in ["guest"]) and status == "active"
```

## Good to Know

Before you wire these into policies, keep a few boundaries in mind:

#### Examples

```sentrie
-- If product.price is undefined or null, use 100 as the default (a price of 0 is kept)
let price: number = product.price ?: 100

-- If user.name is undefined or null, use "Anonymous" as the default (an empty string is kept)
let displayName: string = user.name ?: "Anonymous"

-- If items is undefined or null, use an empty list as the default (an empty list is kept)
let safeItems: list[string] = items ?: []
```

:::note[Note]
The Elvis operator checks definedness, not truthiness. Only an undefined or `null` left side selects the default; `false`, `0`, `""` and `unknown` are returned as they are.
:::

## Logical Operations

For details on trinary logic, see the [Kleene's three-valued logic](/reference/trinary#configuration--arguments) section.

## Comparison Operations

### Equality (`==` and `is`)

Both `==` and `is` operators check if two values are equal.

When the right-hand side of `is` is a shape or a type, such as `user is User`, it checks the value against that shape or type instead. See [Checking a Value Against a Shape](/reference/shapes#checking-a-value-against-a-shape).

#### Syntax

```sentrie
value1 == value2
value1 is value2
```

#### Basic Examples

```text
let age: number = 25
let is_adult: boolean = age == 18
-- Result: false

let name: string = "Alice"
let is_alice: boolean = name is "Alice"
-- Result: true

let score1: number = 85.5
let score2: number = 85.5
let scores_equal = score1 == score2
-- Result: true
```

Numbers are compared by exact value, whether they are integers or floats. `5 == 5.0` is `true`, and `9007199254740993 == 9007199254740992` is `false` even though both are beyond 2^53. The ordering operators (`<`, `<=`, `>`, `>=`) compare exactly in the same way. See [Comparing Numbers](/reference/arithmetic-operations#comparing-numbers).

### Inequality (`!=` and `is not`)

Both `!=` and `is not` operators check if two values are not equal.

#### Syntax

```sentrie
value1 != value2
value1 is not value2
```

#### Examples

```text
let age: number = 25
let is_minor: boolean = age != 18
-- Result: true

let status: string = "active"
let is_inactive = status is not "inactive"
-- Result: true

let score: number = 85.5
let is_perfect = score != 100.0
-- Result: true
```

### Greater Than (`>`)

The `>` operator checks if the left operand is greater than the right operand.

#### Syntax

```sentrie
value1 > value2
```

#### Examples

```text
let age: number = 25
let is_adult: boolean = age > 17
-- Result: true

let score: number = 85.5
let is_passing: boolean = score > 80.0
-- Result: true

let price: number = 99.99
let is_expensive: boolean = price > 50.0
-- Result: true
```

### Greater Than or Equal (`>=`)

The `>=` operator checks if the left operand is greater than or equal to the right operand.

#### Syntax

```sentrie
value1 >= value2
```

#### Examples

```text
let age: number = 18
let can_vote: boolean = age >= 18
-- Result: true

let score: number = 80.0
let is_passing: boolean = score >= 80.0
-- Result: true

let temperature: number = 32.0
let is_freezing: boolean = temperature >= 32.0
-- Result: true
```

### Less Than (`<`)

The `<` operator checks if the left operand is less than the right operand.

#### Syntax

```sentrie
value1 < value2
```

#### Examples

```text
let age: number = 16
let is_minor: boolean = age < 18
-- Result: true

let score: number = 75.0
let is_failing: boolean = score < 80.0
-- Result: true

let price: number = 25.0
let is_cheap: boolean = price < 50.0
-- Result: true
```

### Less Than or Equal (`<=`)

The `<=` operator checks if the left operand is less than or equal to the right operand.

#### Syntax

```sentrie
value1 <= value2
```

#### Examples

```text
let age: number = 18
let is_minor: boolean = age <= 17
-- Result: false

let score: number = 80.0
let is_passing: boolean = score <= 100.0
-- Result: true

let quantity: number = 10
let is_limited: boolean = quantity <= 10
-- Result: true
```

### Ordering Strings

The ordering operators `<`, `<=`, `>`, and `>=` also work on two strings. Strings are compared by byte order, which is the same as comparing their UTF-8 bytes one by one. The comparison is not locale-aware and does not fold case.

#### Examples

```text
let upper_first: boolean = "Z" < "a"
-- Result: true (uppercase letters sort before lowercase)

let by_prefix: boolean = "app" < "apple"
-- Result: true (a shorter string sorts before a longer one it prefixes)

let digits: boolean = "10" < "9"
-- Result: true (strings are not compared as numbers)

let same: boolean = "a" <= "a"
-- Result: true
```

Because the comparison is by byte order, ISO-8601 timestamps in the same format and time zone sort chronologically. This makes a time window check a plain string comparison:

```sentrie
namespace billing

policy invoices {
  fact created_at: string

  rule in_2024 = created_at >= "2024-01-01T00:00:00Z" and created_at < "2025-01-01T00:00:00Z"

  export decision of in_2024
}
```

With `created_at` set to `"2024-06-01T12:00:00Z"` the rule is `true`. With `"2023-12-31T23:59:59Z"` or `"2025-01-01T00:00:00Z"` it is `false`.

:::caution[Strings and numbers do not mix]
Both operands must be strings, or both must be numbers. Comparing a string with a number, such as `created_at < 5`, fails with `left operand is not a number`. Convert one side first, for example with `as number`, if you want a numeric comparison.
:::

If either operand is `undefined`, the comparison is `undefined`, as for numbers; a rule that yields it resolves to `unknown`.

## Pattern Matching Operations

### Regular Expression Matching (`matches`)

The `matches` operator checks if a string matches a regular expression pattern.

#### Syntax

```sentrie
string matches pattern
```

#### Examples

```text
let email: string = "user@example.com"
let is_valid_email: boolean = email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
-- Result: true

let phone: string = "+1234567890"
let is_valid_phone: boolean = phone matches "^\\+?[1-9]\\d{1,14}$"
-- Result: true

let username: string = "alice123"
let is_valid_username: boolean = username matches "^[a-zA-Z0-9_]{3,20}$"
-- Result: true
```

## Collection Operations

### Membership (`in` and `contains`)

Both `in` and `contains` operators check if a value exists in a collection.

`contains` checks if the left hand collection contains the right hand value. `in` checks if the left hand value is in the right hand collection.

For purposes of clarity, we will use the following terminology:

- `haystack` is the collection that is being searched
- `needle` is the value that is being searched for

#### Syntax

```sentrie
value in collection
collection contains value
```

#### Examples

```text
let numbers: list[number] = [1, 2, 3, 4, 5]
let has_three: boolean = 3 in numbers
-- Result: true

let colors: list[string] = ["red", "blue", "green"]
let has_red: boolean = "red" in colors
-- Result: true

let permissions: list[string] = ["read", "write", "delete"]
let can_read: boolean = "read" in permissions
-- Result: true
```

#### Working with Maps

For dicts, if the `needle` is a string, it will be used as the key to check if the key exists in the `haystack`. If the `needle` is another dict, then it will be used to check if the `needle` dict is a subset of the `haystack` dict.

```text
let user_permissions: dict[string] = {
  "read": true,
  "write": false,
  "delete": true,
  "admin": true
}

-- Check if the "read" permission is set
let has_read: boolean = "read" in user_permissions and user_permissions["read"] == true
-- Result: true

```

#### Negating `in`, `contains`, and `matches`

`in`, `contains`, and `matches` can be negated by prefixing the operator with `not`: `not in`, `not contains`, and `not matches`. Each form desugars to a unary `not` wrapping the positive infix, so `9 not in [1, 2, 3]` is the same tree as `not (9 in [1, 2, 3])`.

#### Syntax

```sentrie
value not in collection
collection not contains value
value not matches pattern
```

## State Checking Operations

### Emptiness Checking (`is empty` and `is not empty`)

These operations check if a value is empty or not empty.

#### Syntax

```sentrie
value is empty
value is not empty
```

#### Basic Examples

```text
let empty_string: string = ""
let is_empty: boolean = empty_string is empty
-- Result: true

let non_empty_string: string = "hello"
let is_not_empty: boolean = non_empty_string is not empty
-- Result: true

let empty_list: list[number] = []
let list_is_empty: boolean = empty_list is empty
-- Result: true

let non_empty_list: list[number] = [1, 2, 3]
let list_is_not_empty: boolean = non_empty_list is not empty
-- Result: true
```

#### Working with Shapes

```text
shape User {
  name: string
  email?: string
  phone?: string
}

let user: User = {
  name: "Alice",
  email: "alice@example.com"
}

-- Check if email is not empty
let has_email: boolean = user.email is defined and user.email is not empty
-- Result: true

-- Check if phone is empty
let phone_empty: boolean = user.phone is defined ? user.phone is empty : true
-- Result: true
```

### Definedness Checking (`is defined` and `is not defined`)

These operations check if a value is defined or not defined.

#### Syntax

```sentrie
value is defined
value is not defined
```

#### Basic Examples

```text
shape User {
  name: string
  email?: string
  phone?: string
}

let user: User = {
  name: "Alice",
  email: "alice@example.com"
}

-- Check if email is defined
let email_defined: boolean = user.email is defined
-- Result: true

-- Check if phone is not defined
let phone_not_defined: boolean = user.phone is not defined
-- Result: true

-- Safe access pattern
let display_email: string = user.email is defined ? user.email : "No email provided"
-- Result: "alice@example.com"
```

#### Complex Definedness Logic

```text
shape Order {
  id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  shipping_address?: string
}

let order: Order = {
  id: "12345",
  customer_name: "Alice",
  customer_email: "alice@example.com"
}

-- Check if customer has contact information
let has_contact: boolean = order.customer_email is defined or order.customer_phone is defined
-- Result: true

-- Check if order is complete
let is_complete: boolean = order.customer_name is not empty and
                       order.shipping_address is defined
-- Result: false

-- Get contact method
let contact_method: string = order.customer_email is defined ?
  "Email: " + order.customer_email :
  order.customer_phone is defined ?
  "Phone: " + order.customer_phone :
  "No contact information"
-- Result: "Email: alice@example.com"
```

## Complex Boolean Logic Examples

### Access Control System

```text
shape User {
  id: string
  username: string
  role: string
  age: number
  email?: string
  active: boolean
  permissions: list[string]
}

shape Resource {
  id: string
  name: string
  required_role: string
  min_age: number
  required_permissions: list[string]
}

let user: User = {
  id: "123",
  username: "alice",
  role: "admin",
  age: 25,
  email: "alice@example.com",
  active: true,
  permissions: ["read", "write", "delete", "admin"]
}

let resource: Resource = {
  id: "456",
  name: "Sensitive Data",
  required_role: "admin",
  min_age: 18,
  required_permissions: ["read", "admin"]
}

-- Complex access control logic
let can_access: boolean = user.active and
                      user.age >= resource.min_age and
                      (user.role == resource.required_role or
                       user.role == "superuser") and
                      all(resource.required_permissions, (perm) => {
                        yield perm in user.permissions
                      })
-- Result: true
```

### Data Validation System

```text
use {length} from @sentrie/js as str

shape RegistrationData {
  username: string
  email?: string
  password: string
  age: number
  terms_accepted: boolean
}

let registration: RegistrationData = {
  username: "alice123",
  email: "alice@example.com",
  password: "SecurePass123",
  age: 25,
  terms_accepted: true
}

-- Comprehensive validation
let is_valid_registration: boolean =
  registration.username is not empty and
  str.length(registration.username) >= 3 and
  str.length(registration.username) <= 20 and
  registration.username matches "^[a-zA-Z0-9_]+$" and
  registration.password is not empty and
  str.length(registration.password) >= 8 and
  registration.password matches ".*[A-Z].*" and
  registration.password matches ".*[0-9].*" and
  registration.age >= 13 and
  registration.age <= 120 and
  registration.terms_accepted and
  (
    registration.email is not defined or
    registration.email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  )
-- Result: true
```

## Best Practices

### Use Clear Variable Names

```text
-- Good
let is_valid_user: boolean = user.age >= 18 and user.email is defined

-- Avoid
let flag: boolean = user.age >= 18 and user.email is defined
```

### Combine Operations Readably

```text
-- Good: Clear grouping with parentheses
let can_access: boolean = (user.active and user.verified) or
                       (user.role == "admin" and user.age >= 18)

-- Avoid: Ambiguous precedence
let can_access: boolean = user.active and user.verified or user.role == "admin" and user.age >= 18
```

### Handle Edge Cases

```text
-- Check for empty values before operations
let is_valid: boolean = user.name is not empty and
                    str.length(user.name) >= 2 and
                    user.email is defined and
                    user.email is not empty
```

### Use Appropriate Operators

```text
-- Use 'is' for readability with null checks
let has_email: boolean = user.email is defined

-- Use '==' for value comparisons
let is_admin: boolean = user.role == "admin"

-- Use 'in' for collection membership
let can_read: boolean = "read" in user.permissions
```

### Boundary conditions

- **not / !:** Unary prefix; one operand. Converted to trinary then negated. `not unknown` yields `unknown`. You can write `not expr` or `! expr` (no space required after `!`).
- **Short-circuit:** `and` and `or` evaluate left-to-right; the right side may be skipped. The ternary evaluates only the chosen branch.
- **Comparison:** Both sides must be comparable; result is trinary. Equality with `unknown` yields `unknown`.
- **matches:** Left and right must be strings. Right is a [Go regexp](https://pkg.go.dev/regexp) pattern. Invalid pattern causes an evaluation error. For membership in collections or substring checks, use [in](/reference/membership-operations) or [contains](/reference/membership-operations).
