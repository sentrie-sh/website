---
title: "Policy Language Reference"
description: "Complete reference for the Sentrie policy language syntax and features."
---

This is the complete reference for the Sentrie policy language. It covers all language features, syntax, and semantics.

## Table of Contents

- [Program Structure](#program-structure)
- [Namespaces](#namespaces)
- [Policies](#policies)
- [Rules](#rules)
- [Expressions](#expressions)
- [Primitives, Collections, Shapes, and Aliases](#primitives-collections-shapes-and-aliases)
- [Literals](#literals)
- [Operators](#operators)
- [Control Flow](#control-flow)
- [TypeScript Modules](#typescript-modules)
- [Facts and Variables](#facts-and-variables)
- [Exports and Imports](#exports-and-imports)

## Program Structure

A Sentrie program consists of:

1. **Namespace declaration** (required)
2. **Top-level declarations** (policies, shapes)
3. **Comments** (anywhere)

```text
namespace com/example/myapp

-- This is a comment
policy auth {
  -- policy content
}

shape User {
  -- shape definition
}

export shape User -- export shapes to allow visibility to other namespaces
```

## Namespaces

Namespaces organize your policies and shapes hierarchically and prevent naming conflicts.

### Syntax

```text
namespace FQN
```

Where `FQN` (Fully Qualified Name) is a slash-separated identifier:

```text
namespace com/example/auth
namespace com/example/billing/v2
namespace mycompany/policies/security
```

### Namespace statements

A namespace can contain:

- **policies**: `policy IDENT { ... }`
- **shapes**: `shape IDENT { ... }`
- **shape exports**: `export shape IDENT`

### Rules

- Namespaces must be declared at the top of the file (only comments can be placed before the namespace declaration)
- Only one namespace per file
- Namespace names must be valid identifiers
- Use slash-separated (`/`) hierarchical names for organization
- Multiple root namespaces are allowed in a policy pack
- Namespace forms the visibility boundary for unexported shapes

## Policies

Policies are containers for rules, facts, and other declarations.

### Syntax

```text
policy IDENT {
  policyStatement*
}
```

### Policy Statements

A policy can contain:

- **Rules**: `rule IDENT = ...`
- **Facts**: `fact IDENT : primitive/shape as IDENT default expr`
- **Shapes**: `shape IDENT { ... }`
- **Variables**: `let IDENT : primitive/shape = expr`
- **Use statements**: `use { function1, function2 } from source as alias`
- **Exports**: `export decision of IDENT`
- **Comments**: `-- comment`

### Example

```text
namespace com/example/auth

policy user {
  fact user: User as user default {"role": "admin", "status": "active"}

  let adminRoles = ["admin", "super_admin"]

  rule canLogin = default false when user.role is defined {
    yield user.role in adminRoles
  }

  export decision of canLogin
}
```

## Rules

Rules are the core of Sentrie policies. They define what decisions to make based on input data.

### Syntax

```text
rule IDENT = (default expr)? (when expr)? blockExpr
```

### Components

1. **Name**: `rule IDENT`
2. **Default** (optional): `default expr` - value when `when` is false or rule body doesn't yield
3. **When** (optional): `when expr` - condition that must be true
4. **Body**: `blockExpr` - block expression that must contain a `yield` statement

### Examples

```text
-- Simple rule
rule allow = default false {
  yield true
}

-- Rule with condition
rule canEdit = default false when user.role == "admin" {
  yield true
}

-- Rule with default value
rule getPrice = default 0 when product.price is defined {
  yield product.price
}

-- Rule with complex body
rule calculateDiscount = default 0 {
  let basePrice = product.price
  let discount = user.isPremium ? 0.1 : 0.05
  let finalPrice = basePrice * (1 - discount)
  yield finalPrice
}
```

## Expressions

Sentrie has a rich expression language with multiple operator types and precedence levels.

### Precedence (highest to lowest)

1. **Primary expressions**: literals, identifiers, function calls
2. **Unary operators**: `not`, `!`
3. **Arithmetic**: `*`, `/`, `%`
4. **Arithmetic**: `+`, `-`
5. **Comparison**: `<`, `<=`, `>`, `>=`
6. **Equality**: `==`, `!=`
7. **Logical AND**: `and`
8. **Logical XOR**: `xor`
9. **Logical OR**: `or`
10. **Ternary**: `? :`

### Primary Expressions

```text
-- Literals
42
3.14
"hello"
true
false
unknown
null
[1, 2, 3]
{"key": "value"}

-- Identifiers
user
product.name
config.maxRetries

-- Function calls
time.now()
hash.sha256("data")
json.parse("{}")

-- Index access
users[0]
config["maxRetries"]

-- Field access
user.name
product.price

-- Parentheses
(1 + 2) * 3
```

### Ternary Expressions

```text
condition ? trueValue : falseValue

-- Examples
user.role == "admin" ? "full_access" : "limited_access"
age >= 18 ? "adult" : "minor"
```

### Block Expressions

```text
{
  let variable = expression
  -- other statements
  yield result
}
```

## Primitives, Collections, Shapes, and Aliases

Sentrie provides primitives, collections, shapes, and aliases for defining data structures.

### Primitives

- `number` - Numeric values (backed by float64)
- `string` - Text strings
- `trinary` - Trinary values (true/false/unknown)
  - `bool` - Boolean values (true/false) - a special case of `trinary`
- `document` - JSON-like objects

### Collections

- `list[T]` - Lists of primitive T
- `map[T]` - Maps with string keys and primitive T values
- `record[T1, T2, ...]` - Tuples with specific primitives

### Shape Definitions

Shapes define structured data with fields and constraints.

**Field Modifiers:**

- `!` - Non-nullable (required field)
- `?` - Optional field
- No modifier - Default field (required by default)

```text
shape User {
  id!: string           -- Required field (non-nullable)
  name!: string         -- Required field (non-nullable)
  email?: string        -- Optional field
  age?: number          -- Optional field
  roles: list[string]   -- Required field (default)
  metadata: document    -- Required field (default)
}

shape Product {
  id!: string
  name!: string
  price!: number
  tags?: list[string]
  dimensions: record[number, number, number]  -- width, height, depth
}
```

### Shape Composition

Shapes can be composed from other shapes using the `with` keyword:

```text
shape BaseUser {
  id!: string
  name!: string
}

shape AdminUser with BaseUser {
  permissions: list[string]
  lastLogin?: string
}
```

The composed shape includes all fields from the base shape plus any additional fields defined in the composed shape.

### Constraints

Constraints can be applied to primitives, collections, and shape fields:

```text
shape User {
  name: string @length(1, 100)
  age: number @min(0) @max(150)
  email: string @email
  tags: list[string] @maxlength(10)
}

let numbers: list[number] = [1, 2, 3]
let scores: map[number @min(0) @max(100)] = {"alice": 95, "bob": 87}
```

### Aliases

You can create aliases using shapes:

```text
shape Positive100 number @min(0) @max(100)

let score: Positive100 = 50
```

## Literals

### String Literals

```text
"hello world"
"escaped \"quotes\""
"line 1\nline 2"
```

### Numeric Literals

```text
42          -- Number
-42         -- Negative number
3.14        -- Float
-3.14       -- Negative float
1e5         -- Scientific notation
1.5e-3      -- Scientific notation with negative exponent
```

### Boolean and Trinary Literals

```text
true        -- Boolean true
false       -- Boolean false
unknown     -- Trinary unknown (neither true nor false)
```

### Collection Literals

```text
-- Lists
[1, 2, 3]
["hello", "world"]
[true, false, unknown]

-- Maps
{"name": "Alice", "age": 30}
{"key1": "value1", "key2": 42}

-- Records
["one", 1, true]  -- record[string, number, boolean]

-- Empty collections
[]
{}
```

### Null Literal

```text
null        -- Null value
```

## Operators

### Arithmetic Operators

```text
+           -- Addition
-           -- Subtraction
*           -- Multiplication
/           -- Division
%           -- Modulo
```

### Comparison Operators

```text
==          -- Equality
!=          -- Inequality
<           -- Less than
<=          -- Less than or equal
>           -- Greater than
>=          -- Greater than or equal
```

### Logical Operators

```text
and         -- Logical AND
or          -- Logical OR
xor         -- Logical XOR
not         -- Logical NOT
!           -- Logical NOT (alternative)
```

### Collection Operators

```text
in          -- Membership
not in      -- Non-membership
contains    -- Contains
not contains -- Does not contain
matches     -- Pattern matching
not matches -- Pattern non-matching
```

### Shape Checking Operators

```text
is defined  -- Check if defined
is not defined -- Check if not defined
is empty    -- Check if empty
is not empty -- Check if not empty
is          -- Shape checking
```

### Quantifier Operators

```text
any         -- Any element satisfies condition
all         -- All elements satisfy condition
filter      -- Filter elements
map         -- Transform elements
distinct    -- Remove duplicates
reduce      -- Reduce collection to single value
count       -- Count elements
```

### Casting

```text
cast        -- Casting between primitives
```

Example:

```text
let y = "99"
let x: number = cast y as number
```

## TypeScript Modules

Sentrie supports importing functions from TypeScript modules, including built-in `@sentrie/*` modules and local TypeScript files.

### Use Statement

The `use` statement allows you to import functions from TypeScript modules:

```text
use { function1, function2 } from @sentrie/module as alias
```

**Note:** Built-in `@sentrie/*` modules do not use quotes. Local TypeScript files use quotes for relative paths.

The `as` clause is optional. If omitted, the default alias is the last part of the module path (e.g., `time` for `@sentrie/time`).

### Built-in Modules

Built-in modules are prefixed with `@sentrie/`:

```text
namespace com/example/auth

policy mypolicy {
  use { now } from @sentrie/time as time
  use { sha256 } from @sentrie/hash
  use { parse, format } from @sentrie/json as json

  fact data!: string

  rule processData = default false {
    let timestamp = time.now()
    let hash = sha256(data)
    let parsed = json.parse(data)
    yield hash != "" and timestamp > 0
  }

  export decision of processData
}
```

### Local TypeScript Files

You can import TypeScript files from your policy pack using relative paths:

```text
namespace com/example/auth

policy mypolicy {
  use { calculateAge, validateEmail } from "./utils.ts" as utils

  fact user!: User

  rule validateUser = default false {
    yield utils.calculateAge(user.birthDate) >= 18
      and utils.validateEmail(user.email)
  }

  export decision of validateUser
}
```

**Note:** All relative paths are normalized to `@local` paths internally. The `@local` prefix indicates paths relative to the pack root. For example, `@local/user/id` evaluates to `$PACKROOT/user/id.ts`.

### Available Built-in Modules

- `@sentrie/collection` - List and map manipulation utilities
- `@sentrie/crypto` - Cryptographic functions (SHA-256)
- `@sentrie/encoding` - Base64, Hex, and URL encoding/decoding
- `@sentrie/hash` - Hash functions (MD5, SHA-1, SHA-256, SHA-512, HMAC)
- `@sentrie/json` - JSON marshaling and unmarshaling
- `@sentrie/jwt` - JSON Web Token decoding and verification
- `@sentrie/math` - Mathematical constants and functions
- `@sentrie/net` - Network and IP address utilities
- `@sentrie/regex` - Regular expression pattern matching
- `@sentrie/semver` - Semantic version comparison and validation
- `@sentrie/string` - String manipulation utilities
- `@sentrie/time` - Date and time manipulation
- `@sentrie/url` - URL parsing and manipulation
- `@sentrie/uuid` - UUID generation (v4, v6, v7)

See the [Built-in TypeScript Modules](/reference/typescript_modules/) documentation for detailed information on each module.

## Facts and Variables

### Facts

Facts are named values that can be injected into policy evaluation:

```text
fact maxRetries: number as limit default 3
fact apiKey: string as key default ""
fact config: document as settings default {}
fact user: User as user default {"role": "guest"}
```

Facts can have:

- **Annotation**: `: primitive/shape` - primitive or shape annotation
- **Alias**: `as alias` - name used in the policy
- **Default value**: `default expr` - value if not provided

### Variables

Variables are local to a policy or rule:

```text
let maxRetries = 3
let adminRoles = ["admin", "super_admin"]
let userAge = user.birthDate ? calculateAge(user.birthDate) : 0
let numbers: list[number] = [1, 2, 3]
let scores: map[number @min(0) @max(100)] = {"alice": 95}
```

Variables can have:

- **Annotation**: `: primitive/shape` (optional) - primitive or shape annotation
- **Initial value**: `= expr` (required)

### Reduce Expressions

Variables can be computed using `reduce` expressions:

```text
let numbers: list[number] = [1, 2, 3, 4, 5]

let sum: number = reduce numbers from 0 as acc, num, idx {
  yield acc + num
}

let max: number = reduce numbers from numbers[0] as acc, num, idx {
  yield num > acc ? num : acc
}
```

## Exports and Imports

### Exports

Export rules to make them available for external evaluation:

```text
export decision of ruleName
export decision of ruleName
  attach attachmentName as expression
  attach anotherAttachment as anotherExpression
```

Exports can include attachments that provide additional data:

```text
export decision of allow_admin
  attach the_float as (10 + 5) * (5 - 2) / 2
  attach the_number as 8 / 6
  attach the_list as [1, 2, 3]
  attach the_map as {"key": "value"}
  attach the_string as "hello"
  attach the_bool as true
  attach the_null as null
```

### Imports

Import rules from other policies:

```text
rule importedRule = import decision ruleName from com/example/other/policy
rule importedRule = import decision ruleName from com/example/other/policy with param as value
```

## Comments

Comments start with `--` and continue to the end of the line:

```text
-- This is a comment
rule allow = default false {  -- Inline comment
  yield true
}
```

## Error Handling

Sentrie provides comprehensive error handling and validation:

### Validation Errors

```text
-- This will cause a validation error
rule invalid = default false {
  yield "string" + 42  -- Cannot add string and number
}
```

### Constraint Violations

```text
-- This will cause a constraint violation
rule invalid = default false {
  let age: number @min(0) @max(150) = -5  -- Age constraint violation
  yield age > 0
}
```

### Undefined Values

Accessing non-existent fields returns `undefined` rather than causing an error:

```text
rule example = default false {
  let value = user.nonexistent.field  -- Returns undefined
  yield value  -- undefined
}
```

Any operation on `undefined` will also yield `undefined`:

```text
rule example = default false {
  let value = user.nonexistent.field  -- undefined
  let result = value + 1              -- undefined (operation on undefined)
  let comparison = value == "test"     -- undefined (operation on undefined)
  yield result                         -- undefined
}
```

Use the `is defined` operator to check if a value is defined before using it:

```text
rule example = default false when user.nonexistent.field is defined {
  yield user.nonexistent.field
}
```

## Best Practices

### 1. Use Clear Names

```text
-- Good
rule canUserEditPost = default false when user.role == "admin" {
  yield true
}

-- Bad
rule x = default false when a == "b" {
  yield true
}
```

### 2. Organize by Namespace

```text
namespace com/example/auth
namespace com/example/billing
namespace com/example/analytics
```

### 3. Use Facts for Configuration

```text
fact maxLoginAttempts: number as limit default 3
fact sessionTimeout: number as timeout default 3600
```

### 4. Validate Inputs

```text
rule validateUser = default false when user is defined {
  yield user.id is defined and user.id != ""
}
```

### 5. Use Shapes for Validation

```text
shape User {
  id!: string
  name!: string
  role!: string
}

rule processUser = default false when user is User {
  yield user.role in ["admin", "user"]
}
```

### 6. Leverage TypeScript Modules

```text
-- Use built-in modules for common operations
use { sha256 } from @sentrie/hash
use { now } from @sentrie/time as time
use { parse } from @sentrie/json as json
```

## Examples

### Simple Authorization

```text
namespace com/example/auth

policy user {
  fact user: User as user default {"role": "guest"}

  rule isAdmin = default false when user.role == "admin" {
    yield true
  }

  rule canAccess = default false when user.role in ["admin", "user"] {
    yield true
  }

  export decision of isAdmin
  export decision of canAccess
}
```

### Resource-Based Access Control

```text
namespace com/example/resources

policy document {
  fact user: User as user
  fact document: Document as document

  rule canRead = default false when user.role == "admin" or document.owner == user.id {
    yield true
  }

  rule canWrite = default false when user.role == "admin" or document.owner == user.id {
    yield true
  }

  rule canDelete = default false when user.role == "admin" {
    yield true
  }

  export decision of canRead
  export decision of canWrite
  export decision of canDelete
}
```

### Complex Business Logic with TypeScript

```text
namespace com/example/billing

policy pricing {
  fact basePrice: number as price default 0
  fact discountRate: number as rate default 0.1
  fact user: User as user

  use { max, min } from @sentrie/math as math

  rule calculatePrice = default 0 {
    let base = price
    let discount = user.isPremium ? rate : rate * 0.5
    let tax = base * 0.08
    let total = base * (1 - discount) + tax
    let finalPrice = math.max(0, math.min(total, 10000))

    yield finalPrice
  }

  export decision of calculatePrice
}
```

## See Also

- [Using TypeScript](/reference/using-typescript) - Complete guide to using TypeScript in Sentrie
- [Built-in TypeScript Modules](/reference/typescript_modules/) - Reference for all built-in modules
- [Policies](/reference/policies) - Detailed information about policies
- [Rules](/reference/rules) - Detailed information about rules
- [Facts](/reference/facts) - Detailed information about facts
- [Shapes](/reference/shapes) - Detailed information about shapes
