---
title: Boolean Operations
description: Boolean operations provide powerful ways to evaluate conditions, compare values, and make decisions in Sentrie.
---

Sentrie provides a comprehensive set of boolean operations that allow you to evaluate conditions, compare values, and make logical decisions in your policies. These operations are essential for creating conditional logic and data validation.

## Overview

Boolean operations in Sentrie include:

- **Ternary Operations**: Conditional value selection
- **Logical Operations**: Boolean logic with `and`, `or`, `not`
- **Comparison Operations**: Equality, inequality, and ordering comparisons
- **Pattern Matching**: Regular expression matching
- **Collection Operations**: Testing collections with `any`, `all`, `in`, `contains`
- **State Checking**: Checking emptiness and definedness

## Ternary Operations

### Ternary Operator (`? :`)

The ternary operator allows you to conditionally select between two values based on a boolean condition.

#### Syntax

```sentrie
condition ? trueValue : falseValue
```

#### Examples

```sentrie
let age: int = 25
let status: string = age >= 18 ? "adult" : "minor"
-- Result: "adult"

let score: int = 85
let grade: string = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F"
-- Result: "B"

let user_role: string = "admin"
let can_access: bool = user_role == "admin" ? true : false
-- Result: true
```

#### Complex Ternary Logic

```sentrie
shape Product {
  name!: string
  price!: float
  category!: string
  in_stock: bool
}

fact product: Product

-- Complex pricing logic
let final_price: float = product.in_stock ?
  (product.category == "Electronics" ? product.price * 0.9 : product.price) :
  0.0
-- Result: 899.991 (10% discount for electronics)

-- Status message
let status_message: string = product.in_stock ?
  "Available for $" + product.price.toString() :
  "Out of stock"
-- Result: "Available for $999.99"
```

## Logical Operations

### Logical AND (`and`)

The `and` operator returns `true` only when both operands are truthy.

#### Syntax

```sentrie
condition1 and condition2
```

#### Basic Examples

```sentrie
let age: int = 25
let has_license: bool = true
let can_drive: bool = age >= 18 and has_license
-- Result: true

let score: int = 85
let attendance: float = 0.95
let passes_course: bool = score >= 80 and attendance >= 0.9
-- Result: true

let username: string = "alice"
let password: string = "secret123"
let is_valid_login: bool = username.length() >= 3 and password.length() >= 8
-- Result: true
```

### Logical OR (`or`)

The `or` operator returns `true` when at least one operand is truthy.

#### Syntax

```sentrie
condition1 or condition2
```

#### Basic Examples

```sentrie
let user_role: string = "user"
let is_admin: bool = user_role == "admin" or user_role == "superuser"
-- Result: false

let age: int = 16
let has_parental_consent: bool = true
let can_register: bool = age >= 18 or has_parental_consent
-- Result: true

let payment_method: string = "credit_card"
let is_valid_payment: bool = payment_method == "credit_card" or
                             payment_method == "paypal" or
                             payment_method == "bank_transfer"
-- Result: true
```

### Logical NOT (`not` or `!`)

The `not` operator (or `!`) returns the opposite boolean value.

#### Syntax

```sentrie
not condition
!condition
```

#### Examples

```sentrie
let is_weekend: bool = false
let is_weekday: bool = not is_weekend
-- Result: true

let user_banned: bool = false
let user_active: bool = !user_banned
-- Result: true

let empty_string: string = ""
let has_content: bool = not (empty_string is empty)
-- Result: false
```

```sentrie
shape Account {
  username!: string
  locked: bool
  suspended: bool
  email_verified: bool
}

fact account: Account

-- Account is usable
let account_usable: bool = not account.locked and not account.suspended
-- Result: true

-- Needs verification
let needs_verification: bool = not account.email_verified
-- Result: false
```

## Comparison Operations

### Equality (`==` and `is`)

Both `==` and `is` operators check if two values are equal.

#### Syntax

```sentrie
value1 == value2
value1 is value2
```

#### Basic Examples

```sentrie
let age: int = 25
let is_adult: bool = age == 18
-- Result: false

let name: string = "Alice"
let is_alice: bool = name is "Alice"
-- Result: true

let score1: float = 85.5
let score2: float = 85.5
let scores_equal: bool = score1 == score2
-- Result: true
```

### Inequality (`!=` and `is not`)

Both `!=` and `is not` operators check if two values are not equal.

#### Syntax

```sentrie
value1 != value2
value1 is not value2
```

#### Examples

```sentrie
let age: int = 25
let is_minor: bool = age != 18
-- Result: true

let status: string = "active"
let is_inactive: bool = status is not "inactive"
-- Result: true

let score: float = 85.5
let is_perfect: bool = score != 100.0
-- Result: true
```

### Greater Than (`>`)

The `>` operator checks if the left operand is greater than the right operand.

#### Syntax

```sentrie
value1 > value2
```

#### Examples

```sentrie
let age: int = 25
let is_adult: bool = age > 17
-- Result: true

let score: float = 85.5
let is_passing: bool = score > 80.0
-- Result: true

let price: float = 99.99
let is_expensive: bool = price > 50.0
-- Result: true
```

### Greater Than or Equal (`>=`)

The `>=` operator checks if the left operand is greater than or equal to the right operand.

#### Syntax

```sentrie
value1 >= value2
```

#### Examples

```sentrie
let age: int = 18
let can_vote: bool = age >= 18
-- Result: true

let score: float = 80.0
let is_passing: bool = score >= 80.0
-- Result: true

let temperature: float = 32.0
let is_freezing: bool = temperature >= 32.0
-- Result: true
```

### Less Than (`<`)

The `<` operator checks if the left operand is less than the right operand.

#### Syntax

```sentrie
value1 < value2
```

#### Examples

```sentrie
let age: int = 16
let is_minor: bool = age < 18
-- Result: true

let score: float = 75.0
let is_failing: bool = score < 80.0
-- Result: true

let price: float = 25.0
let is_cheap: bool = price < 50.0
-- Result: true
```

### Less Than or Equal (`<=`)

The `<=` operator checks if the left operand is less than or equal to the right operand.

#### Syntax

```sentrie
value1 <= value2
```

#### Examples

```sentrie
let age: int = 18
let is_minor: bool = age <= 17
-- Result: false

let score: float = 80.0
let is_passing: bool = score <= 100.0
-- Result: true

let quantity: int = 10
let is_limited: bool = quantity <= 10
-- Result: true
```

## Pattern Matching Operations

### Regular Expression Matching (`matches`)

The `matches` operator checks if a string matches a regular expression pattern.

#### Syntax

```sentrie
string matches pattern
```

#### Examples

```sentrie
let email: string = "user@example.com"
let is_valid_email: bool = email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
-- Result: true

let phone: string = "+1234567890"
let is_valid_phone: bool = phone matches "^\\+?[1-9]\\d{1,14}$"
-- Result: true

let username: string = "alice123"
let is_valid_username: bool = username matches "^[a-zA-Z0-9_]{3,20}$"
-- Result: true
```

## Collection Operations

### Any (`any`)

The `any` operation checks if at least one element in a collection satisfies a condition.

#### Syntax

```sentrie
any collection as element, index { yield expression }
```

#### Examples

```sentrie
let numbers: list[int] = [1, 2, 3, 4, 5]
let has_even: bool = any numbers as num, idx {
  yield num % 2 == 0
}
-- Result: true

let scores: list[int] = [85, 92, 78, 96, 85]
let has_perfect_score: bool = any scores as score, idx {
  yield score == 100
}
-- Result: false

let words: list[string] = ["apple", "banana", "cherry"]
let has_long_word: bool = any words as word, idx {
  yield word.length() > 5
}
-- Result: true
```

#### Working with Shapes

```sentrie
shape User {
  name!: string
  age: int
  role!: string
}

let users: list[User] = [
  { name: "Alice", age: 25, role: "admin" },
  { name: "Bob", age: 30, role: "user" },
  { name: "Charlie", age: 35, role: "moderator" }
]

-- Check if any user is admin
let has_admin: bool = any users as user, idx {
  yield user.role == "admin"
}
-- Result: true

-- Check if any user is underage
let has_minor: bool = any users as user, idx {
  yield user.age < 18
}
-- Result: false

-- Check if any user has long name
let has_long_name: bool = any users as user, idx {
  yield user.name.length() > 10
}
-- Result: false
```

### All (`all`)

The `all` operation checks if all elements in a collection satisfy a condition.

#### Syntax

```sentrie
all collection as element, index { yield expression }
```

#### Examples

```sentrie
let numbers: list[int] = [2, 4, 6, 8, 10]
let all_even: bool = all numbers as num, idx {
  yield num % 2 == 0
}
-- Result: true

let scores: list[int] = [85, 92, 78, 96, 85]
let all_passing: bool = all scores as score, idx {
  yield score >= 80
}
-- Result: false

let words: list[string] = ["apple", "banana", "cherry"]
let all_short: bool = all words as word, idx {
  yield word.length() <= 6
}
-- Result: true
```

#### Working with Shapes

```sentrie
shape Product {
  name!: string
  price!: float
  in_stock: bool
}

let products: list[Product] = [
  { name: "Laptop", price: 999.99, in_stock: true },
  { name: "Mouse", price: 29.99, in_stock: true },
  { name: "Keyboard", price: 79.99, in_stock: true }
]

-- Check if all products are in stock
let all_in_stock: bool = all products as product, idx {
  yield product.in_stock
}
-- Result: true

-- Check if all products are expensive
let all_expensive: bool = all products as product, idx {
  yield product.price > 50.0
}
-- Result: true

-- Check if all products have short names
let all_short_names: bool = all products as product, idx {
  yield product.name.length() <= 10
}
-- Result: true
```

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

```sentrie
let numbers: list[int] = [1, 2, 3, 4, 5]
let has_three: bool = 3 in numbers
-- Result: true

let colors: list[string] = ["red", "blue", "green"]
let has_red: bool = "red" in colors
-- Result: true

let permissions: list[string] = ["read", "write", "delete"]
let can_read: bool = "read" in permissions
-- Result: true
```

#### Working with Maps

For maps, if the `needle` is a string, it will be used as the key to check if the key exists in the `haystack`. if the `needle` is another map, then it will be used to check if the `needle` map is a subset of the `haystack` map.

```sentrie
let user_permissions: map[string] = map[string]{
  "read": true,
  "write": false,
  "delete": true,
  "admin": true
}

-- Check if the "read" permission is set
let has_read: bool = "read" in user_permissions and user_permissions["read"] == true
-- Result: true

```

#### Negating `in` and `contains`

`in` and `contains` can be negated by prefixing the operator with `not`, such as `not contains` and `not in`. This is equivalent to wrapping the expression in a unary `not` but results in a more readable form.

#### Syntax

```sentrie
value not in collection
collection not contains value
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

```sentrie
let empty_string: string = ""
let is_empty: bool = empty_string is empty
-- Result: true

let non_empty_string: string = "hello"
let is_not_empty: bool = non_empty_string is not empty
-- Result: true

let empty_list: list[int] = []
let list_is_empty: bool = empty_list is empty
-- Result: true

let non_empty_list: list[int] = [1, 2, 3]
let list_is_not_empty: bool = non_empty_list is not empty
-- Result: true
```

#### Working with Shapes

```sentrie
shape User {
  name!: string
  email?: string
  phone?: string
}

let user: User = {
  name: "Alice",
  email: "alice@example.com"
}

-- Check if email is not empty
let has_email: bool = user.email is defined and user.email is not empty
-- Result: true

-- Check if phone is empty
let phone_empty: bool = user.phone is defined ? user.phone is empty : true
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

```sentrie
shape User {
  name!: string
  email?: string
  phone?: string
}

let user: User = {
  name: "Alice",
  email: "alice@example.com"
}

-- Check if email is defined
let email_defined: bool = user.email is defined
-- Result: true

-- Check if phone is not defined
let phone_not_defined: bool = user.phone is not defined
-- Result: true

-- Safe access pattern
let display_email: string = user.email is defined ? user.email : "No email provided"
-- Result: "alice@example.com"
```

#### Complex Definedness Logic

```sentrie
shape Order {
  id!: string
  customer_name!: string
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
let has_contact: bool = order.customer_email is defined or order.customer_phone is defined
-- Result: true

-- Check if order is complete
let is_complete: bool = order.customer_name is not empty and
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

```sentrie
shape User {
  id!: string
  username!: string
  role!: string
  age: int
  email?: string
  active: bool
  permissions: list[string]
}

shape Resource {
  id!: string
  name!: string
  required_role: string
  min_age: int
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
let can_access: bool = user.active and
                      user.age >= resource.min_age and
                      (user.role == resource.required_role or
                       user.role == "superuser") and
                      all resource.required_permissions as perm, idx {
                        yield perm in user.permissions
                      }
-- Result: true
```

### Data Validation System

```sentrie
shape RegistrationData {
  username!: string
  email?: string
  password!: string
  age: int
  terms_accepted: bool
}

let registration: RegistrationData = {
  username: "alice123",
  email: "alice@example.com",
  password: "SecurePass123",
  age: 25,
  terms_accepted: true
}

-- Comprehensive validation
let is_valid_registration: bool =
  registration.username is not empty and
  registration.username.length() >= 3 and
  registration.username.length() <= 20 and
  registration.username matches "^[a-zA-Z0-9_]+$" and
  registration.password is not empty and
  registration.password.length() >= 8 and
  registration.password matches ".*[A-Z].*" and
  registration.password matches ".*[0-9].*" and
  registration.age >= 13 and
  registration.age <= 120 and
  registration.terms_accepted and
  (registration.email is not defined or
   registration.email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
-- Result: true
```

## Best Practices

### Use Clear Variable Names

```sentrie
-- Good
let is_valid_user: bool = user.age >= 18 and user.email is defined

-- Avoid
let flag: bool = user.age >= 18 and user.email is defined
```

### Combine Operations Readably

```sentrie
-- Good: Clear grouping with parentheses
let can_access: bool = (user.active and user.verified) or
                       (user.role == "admin" and user.age >= 18)

-- Avoid: Ambiguous precedence
let can_access: bool = user.active and user.verified or user.role == "admin" and user.age >= 18
```

### Handle Edge Cases

```sentrie
-- Check for empty values before operations
let is_valid: bool = user.name is not empty and
                    user.name.length() >= 2 and
                    user.email is defined and
                    user.email is not empty
```

### Use Appropriate Operators

```sentrie
-- Use 'is' for readability with null checks
let has_email: bool = user.email is defined

-- Use '==' for value comparisons
let is_admin: bool = user.role == "admin"

-- Use 'in' for collection membership
let can_read: bool = "read" in user.permissions
```
