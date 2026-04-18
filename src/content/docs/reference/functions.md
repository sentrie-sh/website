---
title: Using Functions
description: How to call functions in Sentrie, import TypeScript modules, and use function memoization.
---

Functions are a fundamental part of Sentrie that allow you to perform operations, transform data, and extend functionality. Sentrie supports **built-in functions** (see [Built-in Functions](/reference/built-in-functions)) that are always available without imports, and **TypeScript module functions** that you import using the `use` statement.

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
  fact data: string

  use { sha256, now } from @sentrie/hash as hash
  use { parse } from @sentrie/json as json

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
  fact password: string
  fact timestamp: number

  use { sha256, md5 } from @sentrie/hash
  use { now, parse } from @sentrie/time as time
  use { isValid } from @sentrie/json as json

  rule validatePassword = default false {
    let hash = hash.sha256(password)
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
  fact user: User

  use { calculateAge, validateEmail } from "./utils.ts" as utils

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
  fact data: string

  use { sha256 } from @sentrie/hash
  use { complexCalculation } from "./heavy-compute.ts" as compute

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

## Function chaining (`|>`)

The pipeline operator `|>` passes the left value into the next function call, allowing clear, top-to-bottom transformation chains:

```sentrie
let slug = input
  |> str.trim()
  |> str.toLower()
  |> str.replaceAll(" ", "-")
```

Use `#` in the right-hand call to put the piped value anywhere in the argument list. See [Function chaining](/reference/function-chaining) for all details.

## Using Functions in Rules and Let Declarations

Functions can be used anywhere expressions are allowed, including in `let` declarations and rule bodies:

```sentrie
namespace com/example/complex

policy example {
  fact userData: map[string]any
  fact items: list[string]

  use { sha256 } from @sentrie/hash
  use { now } from @sentrie/time as time

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

Sentrie provides builtins such as `count`, `merge`, and list helpers (`any`, `all`, `filter`, `first`, `collect`, `reduce`, `distinct`). For names, signatures, and examples, see [Built-in Functions](/reference/built-in-functions).

## See Also

- [Built-in Functions](/reference/built-in-functions) - Reference for list helpers, `count`, `merge`, and related builtins
- [Using TypeScript](/reference/using-typescript) - Learn how to import and use TypeScript modules
- [Built-in TypeScript Modules](/reference/typescript_modules) - Complete reference for all built-in modules
- [Intermediate Values](/reference/let) - Learn about `let` declarations where functions are commonly used
- [Rules](/reference/rules) - Learn how to use functions in rule bodies
