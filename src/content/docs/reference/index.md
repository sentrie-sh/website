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
- [Lambdas](#lambdas) - Callable syntax (`=>`) for passing functions as values to builtins
- [Derives](/reference/derives) - Named pure functions (`derive`) and export rules
- [Primitives, Collections, Shapes, and Aliases](#primitives-collections-shapes-and-aliases)
- [Literals](#literals)
- [Operators](#operators)
- [Control Flow](#control-flow)
- [Function chaining](/reference/function-chaining) - Pipeline operator (`|>`), desugaring, precedence, and memoization
- [TypeScript Modules](#typescript-modules)
- [Facts and Variables](#facts-and-variables)
- [Exports and Imports](#exports-and-imports)
- [Exporting and Importing Rules](/reference/exporting-and-importing-rules) - Complete guide to rule exports and imports

## Program Structure

A Sentrie program consists of:

1. **Namespace declaration** (required)
2. **Top-level declarations** (policies, shapes, derives, exports)
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

derive helper = (x: number) => {
  yield x + 1
}

export shape User -- export shapes to allow visibility to other namespaces
export derive helper
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
- **derives**: `derive IDENT = LAMBDA`
- **shape exports**: `export shape IDENT`
- **derive exports**: `export derive IDENT`

### Rules

- Namespaces must be declared at the top of the file (only comments can be placed before the namespace declaration)
- Only one namespace per file
- Namespace names must be valid identifiers
- Use slash-separated (`/`) hierarchical names for organization
- Multiple root namespaces are allowed in a policy pack
- Namespace forms the visibility boundary for unexported shapes

## Policies

Policies are containers for rules, facts, and other declarations. See [Policy metadata](/reference/policy-metadata/) for `title`, `description`, `version`, and `tag`, and for the required **metadata → facts → uses → body** ordering.

### Syntax

```text
policy IDENT {
  policyStatement*
}
```

### Policy Statements

A policy can contain (in grouped order; comments anywhere):

- **Metadata** (optional): `title`, `description`, `version`, `tag "key" = "value"`
- **Facts**: `fact IDENT ('?'?) : primitive/shape ('as' IDENT)? ('default' expr)?`
- **Use statements**: `use { function1, function2 } from source as alias`
- **Rules**: `rule IDENT = ...`
- **Shapes**: `shape IDENT { ... }` (policy-local; body section)
- **Variables**: `let IDENT : primitive/shape = expr`
- **Exports**: `export decision of IDENT`
- **Comments**: `-- comment`

### Example

```text
namespace com/example/auth

policy user {
  fact user: User as currentUser
  fact context?: Context as ctx default {"environment": "production"}

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
11. **Pipeline**: `|>` (lowest precedence)

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

-- Pipeline calls
value |> len
value |> str.trim |> len

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

## Lambdas

A **lambda** is an expression that evaluates to a **callable** value: a function with a fixed parameter list and a block body. Lambdas are how you pass predicates and mapping steps to builtins such as `filter`, `collect`, `reduce`, and `distinct` (with a key function).

### Syntax

```sentrie
( parameterList ) => block
```

- **`parameterList`** is a comma-separated list of identifiers, or empty.
- **`=>`** is the fat arrow (followed by a `{` block body).
- **`block`** is a normal block expression: statements and a **`yield`** that produces the result for each invocation.

### Forms

```sentrie
-- No parameters (arity 0)
() => {
  yield 1
}

-- One parameter
(x) => {
  yield x * 2
}

-- Two parameters (common for list index)
(item, idx) => {
  yield item + idx
}
```

Parameter names must be **identifiers**. **Duplicate** parameter names in the same list are rejected at parse time.

:::note[Grouped expressions vs lambdas]

After `(`, the parser decides between a **parenthesized expression** and a **lambda** by looking for a lambda signature: identifiers (and commas) up to `) =>`. If that pattern does not match, the `(` is treated as grouping for an inner expression.

:::

### Callables and builtins

A lambda’s value is a **callable**. You pass it to builtins that expect a function, for example:

```sentrie
let nums: list[number] = [1, 2, 3]
let doubled: list[number] = collect(nums, (n) => {
  yield n * 2
})

let sum: number = reduce(nums, 0, (acc, n) => {
  yield acc + n
})
```

Single-parameter **derives** can also be passed by name to `any`, `all`, `filter`, `first`, `collect`, and the two-argument `distinct` form — see [Derives](/reference/derives#callbacks-for-higher-order-builtins).

Which builtin you use determines how many parameters the lambda should take (its **arity**), for example:

- **`any`**, **`all`**, **`filter`**, **`first`**, **`collect`**: arity **1** (element only) or **2** (element and index).
- **`reduce`**: arity **2** (accumulator, element) or **3** (accumulator, element, index).
- **`distinct`**, two-argument form: arity **1** or **2** for the key function.

If arity does not match what the builtin expects, evaluation fails with an error.

For builtin names, signatures, and more examples, see [Built-in Functions](/reference/built-in-functions).

### Lexical environment

Lambdas **capture** the surrounding execution context: names visible where the lambda is written remain visible when the callable runs (for example `user`, `let` bindings in the same block, and facts). In the current language version, that capture uses the **parent execution context by reference**, so later changes to captured bindings can affect a lambda that runs afterward.

### Boundaries

Callable values are **not** ordinary JSON-like data. They cannot be passed through every runtime boundary that expects plain data (for example some module or interop paths that materialize `[]any` or JSON). Prefer keeping lambdas and callables inside policy evaluation; if you need to pass data out, convert to plain values first.

### Typed parameters and return types

You can annotate lambda parameters and the return value:

```sentrie
(a: number, b?: string): number => {
  yield a + (count(b) as number)
}
```

Optional parameters use `?` after the name (for example `b?`). A required parameter cannot follow an optional one; that ordering is rejected at parse time.

## Derives

**Derives** are named pure functions at namespace or policy scope. They reuse lambda syntax and are documented in the dedicated [Derives](/reference/derives) page (calling rules, FQN slash callees, builtin whitelist, and exports).

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
- `dict[T]` - Dicts with string keys and primitive T values
- `record[T1, T2, ...]` - Tuples with specific primitives

### Shape Definitions

Shapes define structured data with fields and constraints.

**Field Contract Matrix:**

- `field: T` - required, non-null
- `field?: T` - optional, if present non-null
- `field: T?` - required, nullable
- `field?: T?` - optional, nullable

```text
shape User {
  id: string
  name: string
  email?: string
  middle_name: string?
  nickname?: string?
  roles: list[string]
  metadata: document
}

shape Product {
  id: string
  name: string
  price: number
  tags?: list[string]
  dimensions: record[number, number, number]  -- width, height, depth
}
```

### Shape Composition

Shapes can be composed from other shapes using the `with` keyword:

```text
shape BaseUser {
  id: string
  name: string
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
let scores: dict[number @min(0) @max(100)] = {"alice": 95, "bob": 87}
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

-- Dicts
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

### Elvis operator (`?:`)

```text
a ?: b
```

If `a` is **`null`** or **`undefined`**, the expression evaluates to **`b`** (and `b` is evaluated). For any other value of `a` (including `0`, `""`, or `false`), the result is **`a`** and **`b` is not evaluated**. This matches common “default for missing” patterns for facts and optional parameters.

### Arithmetic Operators

```text
+           -- Addition
-           -- Subtraction
*           -- Multiplication
/           -- Division
%           -- Modulo
```

### Pipeline Operator

```text
|>          -- Pipe left expression into callable target on the right
```

For complete rules and examples, see [Function chaining](/reference/function-chaining).

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

### Collection builtins

These builtins operate on lists. Predicate and mapping steps use inline lambdas: `(param) => { ... }` or `(param, index) => { ... }`.

```text
any(list, predicate)       -- True if any element satisfies the predicate
all(list, predicate)       -- True if every element satisfies the predicate
filter(list, predicate)    -- New list of elements where the predicate is truthy
first(list, predicate)     -- First matching element, or undefined
collect(list, fn)          -- New list from mapping each element
distinct(list)             -- Unique elements (by scalar identity)
distinct(list, keyFn)      -- Unique elements by a scalar key from each item
reduce(list, initial, fn)  -- Left fold with an accumulator
count(value)               -- Length of list, dict, or string
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

`use` semantics do not change with pipelines: imported names are not injected into local scope, and module-qualified calls remain the canonical form.

### Built-in Modules

Built-in modules are prefixed with `@sentrie/`:

```text
namespace com/example/auth

policy mypolicy {
  fact data: string

  use { now } from @sentrie/time as time
  use { sha256 } from @sentrie/hash
  use { parse, format } from @sentrie/json as json

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
  fact user: User

  use { calculateAge, validateEmail } from "./utils.ts" as utils

  rule validateUser = default false {
    yield utils.calculateAge(user.birthDate) >= 18
      and utils.validateEmail(user.email)
  }

  export decision of validateUser
}
```

**Note:** All relative paths are normalized to `@local` paths internally. The `@local` prefix indicates paths relative to the pack root. For example, `@local/user/id` evaluates to `$PACKROOT/user/id.ts`.

### Available Built-in Modules

- `@sentrie/collection` - List and dict (object) manipulation utilities
- `@sentrie/crypto` - Cryptographic functions (SHA-256)
- `@sentrie/encoding` - Base64, Hex, and URL encoding/decoding
- `@sentrie/hash` - Hash functions (MD5, SHA-1, SHA-256, SHA-512, HMAC)
- `@sentrie/js` - JavaScript globals (Math, String, Number, Date, JSON, Array)
- `@sentrie/json` - JSON validation utility
- `@sentrie/jwt` - JSON Web Token decoding and verification
- `@sentrie/net` - Network and IP address utilities
- `@sentrie/regex` - Regular expression pattern matching
- `@sentrie/semver` - Semantic version comparison and validation
- `@sentrie/time` - Date and time manipulation
- `@sentrie/url` - URL parsing and manipulation
- `@sentrie/uuid` - UUID generation (v4, v6, v7)

See the [Built-in TypeScript Modules](/reference/typescript_modules/) documentation for detailed information on each module.

## Facts and Variables

### Facts

Facts are named values that can be injected into policy evaluation:

```text
-- Required facts (must be provided)
fact userId: string as id
fact user: User as currentUser

-- Optional facts (can be omitted, marked with ?)
fact maxRetries?: number as limit default 3
fact apiKey?: string as key default ""
fact config?: document as settings default {}
fact context?: Context as ctx default {"role": "guest"}
```

Facts can have:

- **Annotation**: `: primitive/shape` - primitive or shape annotation
- **Optional modifier**: `?` - marks fact as optional (defaults are only allowed for optional facts)
- **Alias**: `as alias` - name used in the policy
- **Default value**: `default expr` - value if not provided (only for optional facts)

:::note[Important]

- Facts are **required by default** - must be provided during execution
- Use `?` to mark facts as **optional** - can be omitted
- Facts can also use nullable types with `T?` when explicit `null` is valid
- Only **optional facts** (`?`) can have default values
  :::

### Variables

Variables are local to a policy or rule:

```text
let maxRetries = 3
let adminRoles = ["admin", "super_admin"]
let userAge = user.birthDate ? calculateAge(user.birthDate) : 0
let numbers: list[number] = [1, 2, 3]
let scores: dict[number @min(0) @max(100)] = {"alice": 95}
```

Variables can have:

- **Annotation**: `: primitive/shape` (optional) - primitive or shape annotation
- **Initial value**: `= expr` (required)

:::note[Important]

- `let` declarations are **scoped to their immediate block** (`{}`)
- `let` declarations **cannot be exported** - only rules can be exported
- `let` declarations are **immutable** - once declared, their value cannot be changed
  :::

:::note
Read more on let declarations [here](/reference/let).
:::

### `reduce`

Variables can be computed with the `reduce` builtin and a reducer lambda:

```text
let numbers: list[number] = [1, 2, 3, 4, 5]

let sum: number = reduce(numbers, 0, (acc, num, idx) => {
  yield acc + num
})

let max: number = reduce(numbers, numbers[0], (acc, num, idx) => {
  yield num > acc ? num : acc
})
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
  attach the_dict as {"key": "value"}
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
-- Required facts (must be provided)
fact maxLoginAttempts: number as limit

-- Optional facts with defaults
fact sessionTimeout?: number as timeout default 3600
fact retryCount?: number as retries default 3
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
  id: string
  name: string
  role: string
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
  fact user: User as currentUser

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
  fact basePrice: number as price
  fact discountRate?: number as rate default 0.1
  fact user: User as currentUser

  use { max, min } from @sentrie/js as math

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
- [Let Declarations](/reference/let) - Detailed information about let declarations
- [Shapes](/reference/shapes) - Detailed information about shapes
