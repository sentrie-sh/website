---
title: Trinary Values
description: Trinary values are a type of value that can be true, false, or unknown.
---

Sentrie uses **trinary logic** (also known as three-valued logic), which extends traditional boolean logic with a third value: `unknown`. This is essential for handling cases where information may be incomplete or unavailable.

### Trinary Values

Sentrie supports three trinary values:

- **`true`** - The condition is definitely true
- **`false`** - The condition is definitely false
- **`unknown`** - The condition's truth value cannot be determined

### Kleene Truth Tables

Sentrie implements **Kleene's three-valued logic**, which provides a consistent way to handle `unknown` values in logical operations.

#### Logical AND (`and`)

The `and` operator follows Kleene's AND truth table:

| **AND**     | **true**  | **false** | **unknown** |
| ----------- | --------- | --------- | ----------- |
| **true**    | `true`    | `false`   | `unknown`   |
| **false**   | `false`   | `false`   | `false`     |
| **unknown** | `unknown` | `false`   | `unknown`   |

**Key behaviors:**

- `true and x` = `x` (true is the identity element)
- `false and x` = `false` (false dominates)
- `unknown and true` = `unknown` (cannot determine if both are true)
- `unknown and false` = `false` (false dominates)
- `unknown and unknown` = `unknown` (cannot determine)

#### Logical OR (`or`)

The `or` operator follows Kleene's OR truth table:

| **OR**      | **true** | **false** | **unknown** |
| ----------- | -------- | --------- | ----------- |
| **true**    | `true`   | `true`    | `true`      |
| **false**   | `true`   | `false`   | `unknown`   |
| **unknown** | `true`   | `unknown` | `unknown`   |

**Key behaviors:**

- `true or x` = `true` (true dominates)
- `false or x` = `x` (false is the identity element)
- `unknown or true` = `true` (true dominates)
- `unknown or false` = `unknown` (cannot determine if either is true)
- `unknown or unknown` = `unknown` (cannot determine)

#### Logical NOT (`not` or `!`)

The `not` operator follows this truth table:

| **Input**   | **Output** |
| ----------- | ---------- |
| **true**    | `false`    |
| **false**   | `true`     |
| **unknown** | `unknown`  |

**Key behavior:**

- `not unknown` = `unknown` (cannot determine the opposite of unknown)

### Trinary Logic Examples

#### Basic Trinary Operations

```sentrie
-- Unknown from undefined field access
let value = user.nonexistent.field
let result = value == "test"  -- unknown (operation on unknown)

-- AND with unknown
let a = true
let b = unknown
let result1 = a and b  -- unknown

let c = false
let d = unknown
let result2 = c and d  -- false (false dominates)

-- OR with unknown
let e = true
let f = unknown
let result3 = e or f  -- true (true dominates)

let g = false
let h = unknown
let result4 = g or h  -- unknown
```

#### Practical Use Cases

```sentrie
shape User {
  name!: string
  email?: string
  age?: number
}

fact user: User

-- Check if user has email (handles unknown gracefully)
let has_email: trinary = user.email is defined and user.email is not empty
-- Result: true if email exists and is not empty
--         false if email is defined but empty
--         unknown if email is not defined

-- Age verification with unknown handling
let can_vote: trinary = user.age is defined ? (user.age >= 18) : unknown
-- Result: true if age >= 18
--         false if age < 18
--         unknown if age is not defined

-- Complex logic with unknown propagation
let is_verified: trinary = user.email is defined and
                          user.email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
-- Result: true if email is defined and valid
--         false if email is defined but invalid
--         unknown if email is not defined
```

#### Handling Unknown in Rules

```sentrie
shape Account {
  username!: string
  email?: string
  verified: bool
}

fact account: Account

-- Rule that handles unknown gracefully
rule can_access = default false when account.email is defined {
  let email_valid = account.email matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  yield account.verified and email_valid
}

-- If email is not defined, the 'when' clause prevents evaluation
-- If email is defined, the rule evaluates normally
```

#### Unknown Propagation

```sentrie
-- Unknown propagates through operations
let a = user.nonexistent.field  -- undefined
let b = a + 1                   -- undefined (operation on undefined)
let c = b > 10                  -- undefined (comparison with undefined)
let d = c and true              -- unknown (AND with undefined)
let e = d or false              -- unknown (OR with unknown)
```

## Non-Trinary Value Interpretation

Sentrie can work with various data types, and when a value that isn't explicitly `true`, `false`, or `unknown` is used in a context that requires a `trinary` value, the system infers the `trinary` value based on the following rules:

- `null` / `undefined` → `unknown`
- Numeric primitives (`int`, `float`, `uint`, etc.) evaluate to `false` when zero, `true` otherwise.
- `string` values are checked for textual keywords first (see table below), otherwise `true` when they are non-empty.
- Structs, channels, functions, and any other non-`nil` value evaluate to `true`

### String coercion

Before falling back to the "non-empty string" rule, strings are normalized to lowercase and matched against the following keywords:

| Input                                                        | Result    |
| ------------------------------------------------------------ | --------- |
| `"true"`, `"1"`, `"t"`                                       | `true`    |
| `"false"`, `"0"`, `"f"`                                      | `false`   |
| `"unknown"`, `"-1"`, `"n"`, `"nil"`, `"null"`, `"undefined"` | `unknown` |
| Any other non-empty string                                   | `true`    |
| Empty string (`""`)                                          | `false`   |

### Collections

For collections like `lists`, `maps`, `slices`, and `arrays`, truthiness depends on whether they contain elements. Empty collections are `false`; non-empty collections are `true`.

## Trinary vs Boolean

Sentrie does not distinguish between trinary and boolean values:

- `true` (bool) → `true` (trinary)
- `false` (bool) → `false` (trinary)

:::note
A `bool` value is a special case of a `trinary` value which can never be `unknown`.
:::

## Best Practices for Trinary Logic

1. **Check for definedness before operations:**

```sentrie
-- Good: Check if value is defined first
let result = user.email is defined ? str.length(user.email) > 0 : false

-- Avoid: Operations on potentially undefined values
let result = str.length(user.email) > 0  -- unknown if email is undefined
```

2. **Use `is defined` to handle unknown:**

```sentrie
-- Explicitly handle unknown cases
let can_proceed = user.age is defined and user.age >= 18
```

3. **Understand unknown propagation:**

```sentrie
-- Unknown propagates through all operations
let value = user.missing.field  -- unknown
let result = value + 1           -- unknown
let comparison = result > 10     -- unknown
```

4. **Use default values in rules:**

```sentrie
-- Provide defaults for unknown cases
rule can_access = default false when user.role is defined {
  yield user.role == "admin"
}
-- Returns false if role is not defined (unknown case)
```
