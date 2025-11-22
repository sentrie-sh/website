---
title: Using Functions
description: How to call and use functions in Sentrie, including built-in functions and TypeScript module functions.
---

Functions are a fundamental part of Sentrie that allow you to perform operations, transform data, and extend functionality. Sentrie supports two types of functions: built-in functions that are always available, and TypeScript module functions that you import using the `use` statement.

Functions in Sentrie enable you to:

- Perform common operations using built-in reusable utilities
- Extend functionality by importing functions from TypeScript modules
- Optimize performance with function **memoization**

## Function Call Syntax

### Basic Syntax

Functions are called using the standard function call syntax with parentheses:

```sentrie
let name = functionName(argument1, argument2, ...)
```

### Module Functions

Functions imported from TypeScript modules are called using the module alias followed by a dot:

```sentrie
namespace com/example/auth

policy mypolicy {
  use { sha256, now } from @sentrie/hash as hash
  use { parse } from @sentrie/json as json

  fact data: string

  rule processData = default false {
    let hashValue = hash.sha256(data)
    let currentTime = hash.now()
    let parsed = json.parse(data)
    yield hashValue != "" and currentTime > 0
  }

  export decision of processData
}
```

:::note
If no alias is specified, the default alias is the last part of the module path:

```sentrie
use { sha256 } from @sentrie/hash
-- Default alias is "hash", so you call: hash.sha256(data)
```

:::

## TypeScript Module Functions

Sentrie allows you to import and use functions from TypeScript modules, including built-in `@sentrie/*` modules and your own local TypeScript files. This provides extensive functionality for cryptography, data manipulation, time operations, and more.

### Importing Functions

Functions are imported using the `use` statement:

```sentrie
use { function1, function2 } from @sentrie/module as alias
```

### Built-in Modules

Sentrie provides comprehensive built-in TypeScript modules under the `@sentrie/*` namespace:

```sentrie
namespace com/example/crypto

policy security {
  use { sha256, md5 } from @sentrie/hash
  use { now, parse } from @sentrie/time as time
  use { isValid } from @sentrie/json as json

  fact password: string
  fact timestamp: number

  rule validatePassword = default false {
    let hash = sha256(password)
    let currentTime = time.now()
    yield hash != "" and currentTime > timestamp
  }

  export decision of validatePassword
}
```

### Local TypeScript Modules

You can also import functions from your own TypeScript files:

```sentrie
namespace com/example/utils

policy processing {
  use { calculateAge, validateEmail } from "./utils.ts" as utils

  fact user: User

  rule validateUser = default false {
    yield utils.calculateAge(user.birthDate) >= 18
      and utils.validateEmail(user.email)
  }

  export decision of validateUser
}
```

For detailed information about available TypeScript modules and their functions, see [Using TypeScript](/reference/using-typescript) and [Built-in TypeScript Modules](/reference/typescript_modules).

## Function Memoization

Function memoization allows you to cache the results of function calls to improve performance for expensive operations. Memoization is particularly useful for functions that perform heavy computations or external calls.

### Syntax

Memoization is enabled by appending `!` to a function call:

```sentrie
functionName(args...)!        -- Default TTL (5 minutes)
functionName(args...)!300     -- Custom TTL in seconds
```

### Default TTL

When you omit the TTL value, memoization uses a default time-to-live of **5 minutes** (300 seconds):

```sentrie
let result = expensiveFunction(data)!  -- Cached for 5 minutes
```

### Custom TTL

You can specify a custom TTL in seconds:

```sentrie
let result = expensiveFunction(data)!60   -- Cached for 60 seconds
let result = expensiveFunction(data)!3600  -- Cached for 1 hour
```

### Memoization Behavior

- **TypeScript Module Functions**: Memoization is fully supported and provides performance benefits for expensive operations
- **Built-in Functions**: While the syntax is supported, built-in functions are not actually memoized as they are already optimized and fast enough that caching provides minimal benefit

### Example

```sentrie
namespace com/example/processing

policy dataProcessing {
  use { sha256 } from @sentrie/hash
  use { complexCalculation } from "./heavy-compute.ts" as compute

  fact data: string

  rule processData = default false {
    -- Memoize expensive computation for 10 minutes
    let hash = sha256(data)!600
    let result = compute.complexCalculation(data)!600

    yield hash != "" and result > 0
  }

  export decision of processData
}
```

:::tip
Use memoization for functions that:

- Perform expensive computations
- Make external API calls (if supported)
- Process large amounts of data
- Are called multiple times with the same arguments

Avoid memoization for functions that:

- Are already very fast (like built-in functions)
- Need to return fresh data on every call
- Have side effects that must execute each time
  :::

## Using Functions in Rules and Let Declarations

Functions can be used anywhere expressions are allowed, including in `let` declarations and rule bodies:

```sentrie
namespace com/example/complex

policy example {
  use { sha256 } from @sentrie/hash
  use { now } from @sentrie/time as time

  fact userData: map[string]any
  fact items: list[string]

  -- Policy-level let with function calls
  let itemCount = count(items)
  let timestamp = time.now()

  rule processUser = default false {
    -- Rule-level let with function calls
    let hash = sha256(userData.id)
    let merged = merge(userData, {"processed": true})

    yield hash != "" and itemCount > 0
  }

  export decision of processUser
}
```

## Built-in Functions

Sentrie provides a set of built-in functions that are always available without any imports. These functions are optimized for performance and are commonly used operations.

### `count(value) => number`

<details>
<summary>Returns the number of elements in a collection or the length of a string.</summary>

The `count` function accepts a list, map, or string and returns the number of elements or characters.

**Examples:**

- `count([1, 2, 3])` → `3`
- `count("hello")` → `5`
- `count({"a": 1, "b": 2})` → `2`

```sentrie
let items: list[string] = ["apple", "banana", "cherry"]
let itemCount = count(items)  -- Returns 3
```

</details>

### `merge(map1, map2) => map[string]any`

<details>
<summary>Recursively merges two maps into a new map.</summary>

The `merge` function combines two maps, with values from the second map overwriting values from the first map. Nested maps are merged recursively rather than being replaced entirely.

**Examples:**

- `merge({"a": 1}, {"b": 2})` → `{"a": 1, "b": 2}`
- `merge({"a": {"x": 1}}, {"a": {"y": 2}})` → `{"a": {"x": 1, "y": 2}}`

```sentrie
let userData = {"name": "Alice", "age": 30}
let additionalData = {"age": 31, "role": "admin"}
let combined = merge(userData, additionalData)
-- Returns {"name": "Alice", "age": 31, "role": "admin"}
```

</details>

### `error(format, args...) => error`

<details>
<summary>Short-circuits execution and returns an error with a formatted message.</summary>

The `error` function immediately stops execution and returns an error. It supports format strings similar to `fmt.Printf` in Go. If only one argument is provided, it's treated as the error message directly.

**Examples:**

- `error("Access denied")`
- `error("Invalid value: %v", value)`
- `error("User %s not found", username)`

```sentrie
rule validateAccess = default false when user.role is defined {
  if user.role != "admin" {
    error("Access denied: user must be admin")
  }
  yield true
}
```

</details>

:::note
Built-in functions are fast and lightweight. While they support memoization syntax (see [Function Memoization](#function-memoization)), they are not actually memoized as caching would provide minimal benefit for these operations.
:::

## See Also

- [Using TypeScript](/reference/using-typescript) - Learn how to import and use TypeScript modules
- [Built-in TypeScript Modules](/reference/typescript_modules) - Complete reference for all built-in modules
- [Intermediate Values](/reference/let) - Learn about `let` declarations where functions are commonly used
- [Rules](/reference/rules) - Learn how to use functions in rule bodies
- [Collection Operations](/reference/collection-operations) - Learn about collection-specific operations
