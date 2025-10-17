---
title: "Policy Language Reference"
description: "Complete reference for the Sentrie policy language syntax and features."
---

# Policy Language Reference

This is the complete reference for the Sentrie policy language. It covers all language features, syntax, and semantics.

## Table of Contents

- [Program Structure](#program-structure)
- [Namespaces](#namespaces)
- [Policies](#policies)
- [Rules](#rules)
- [Expressions](#expressions)
- [Types and Shapes](#types-and-shapes)
- [Literals](#literals)
- [Operators](#operators)
- [Control Flow](#control-flow)
- [Functions and Modules](#functions-and-modules)
- [Facts and Variables](#facts-and-variables)
- [Exports and Imports](#exports-and-imports)

## Program Structure

A Sentrie program consists of:

1. **Namespace declaration** (required)
2. **Top-level declarations** (policies, shapes, exports)
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
```

## Namespaces

Namespaces organize your policies hierarchically and prevent naming conflicts.

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

### Rules

- Namespaces must be declared at the top of the file
- Only one namespace per file
- Namespace names must be valid identifiers
- Use slash-separated hierarchical names for organization

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
- **Facts**: `fact IDENT : type as IDENT default expr`
- **Shapes**: `shape IDENT { ... }`
- **Variables**: `let IDENT = expr`
- **Use statements**: `use IDENT from source as IDENT`
- **Exports**: `export decision of IDENT`
- **Comments**: `-- comment`

### Example

```text
policy user {
  fact maxLoginAttempts: number as limit default 3

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
rule IDENT = (default expr)? (when expr)? (blockExpr | ruleImportClause)
```

### Components

1. **Name**: `rule IDENT`
2. **Default** (optional): `default expr` - value when `when` is false
3. **When** (optional): `when expr` - condition that must be true
4. **Body**: `blockExpr` or `ruleImportClause`

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
uuid()
crypto.hash("data")
base64.encode("string")

-- Index access
users[0]
config["maxRetries"]

-- Field access
user.name
product.price

-- Parentheses
(1 + 2) * 3
```

## Types and Shapes

Sentrie has a comprehensive type system with primitive types, collections, and user-defined shapes.

### Primitive Types

- `number` - Numeric values (backed by float64)
- `string` - Text strings
- `bool` - Boolean values (true/false)
- `document` - JSON-like objects

### Collection Types

- `list[T]` - Lists of type T
- `map[T]` - Maps with string keys and type T values
- `record[T1, T2, ...]` - Tuples with specific types

### Shape Definitions

Shapes define structured data types with fields and constraints.

```text
shape User {
  id!: string           -- Required field
  name!: string         -- Required field
  email?: string        -- Optional field
  age?: number          -- Optional field
  roles: list[string]   -- List field
  metadata: document    -- Document field
}

shape Product {
  id!: string
  name!: string
  price!: number
  tags?: list[string]
  dimensions: record[number, number, number]  -- width, height, depth
}
```

### Shape Inheritance

Shapes can inherit from other shapes:

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

### Type Constraints

Types can have constraints applied:

```text
shape User {
  name: string @length(1, 100)
  age: number @min(0) @max(150)
  email: string @email
  tags: list[string] @maxlength(10)
}
```

## Literals

### String Literals

```text
"hello world"
"escaped \"quotes\""
"line 1\nline 2"

-- Heredoc strings
<<<EOF
This is a multi-line
string that can contain
"quotes" and 'apostrophes'
EOF
```

### Numeric Literals

```text
42          -- Number
-42         -- Negative number
3.14        -- Number
-3.14       -- Negative number
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

### Type Checking Operators

```text
is defined  -- Check if defined
is not defined -- Check if not defined
is empty    -- Check if empty
is not empty -- Check if not empty
is          -- Type checking
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

## Control Flow

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

### Conditional Rules

```text
rule result = default defaultValue when condition {
  yield trueValue
}
```

## Functions and Modules

### Built-in Functions

```text
uuid()                    -- Generate UUID
crypto.hash(data)         -- Hash data
crypto.verify(data, sig)  -- Verify signature
base64.encode(data)       -- Base64 encode
base64.decode(data)       -- Base64 decode
```

### JavaScript Modules

```text
use uuid, crypto from "uuid" as uuidLib
use { hash, verify } from "crypto-js" as cryptoLib

rule generateId = default "" {
  yield uuidLib.uuid()
}
```

### Module Sources

```text
-- String path
use func from "./utils.js" as utils

-- Package reference
use func from "@company/utils" as utils
```

## Facts and Variables

### Facts

Facts are named values that can be injected into policy evaluation:

```text
fact maxRetries: number as limit default 3
fact apiKey: string as key default ""
fact config: document as settings default {}
```

### Variables

Variables are local to a policy or rule:

```text
let maxRetries = 3
let adminRoles = ["admin", "super_admin"]
let userAge = user.birthDate ? calculateAge(user.birthDate) : 0
```

## Exports and Imports

### Exports

Export rules to make them available for external evaluation:

```text
export decision of ruleName
export decision of ruleName attach attachmentName as expression
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

### Type Errors

```text
-- This will cause a type error
rule invalid = default false {
  yield "string" + 42  -- Cannot add string and number
}
```

### Validation Errors

```text
-- This will cause a validation error
rule invalid = default false {
  yield user.age < 0  -- Age constraint violation
}
```

### Runtime Errors

```text
-- This will cause a runtime error
rule invalid = default false {
  yield user.nonexistent.field  -- Field does not exist
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

### 5. Use Shapes for Type Safety

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

## Examples

### Simple Authorization

```text
namespace com/example/auth

policy user {
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

### Complex Business Logic

```text
namespace com/example/billing

policy pricing {
  fact basePrice: number as price default 0
  fact discountRate: number as rate default 0.1

  rule calculatePrice = default 0 {
    let base = price
    let discount = user.isPremium ? rate : rate * 0.5
    let tax = base * 0.08
    let total = base * (1 - discount) + tax

    yield total
  }

  export decision of calculatePrice
}
```
