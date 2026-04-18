---
title: Using Functions
description: How to call functions in Sentrie, import TypeScript modules, and use function memoization.
---

Functions are a fundamental part of Sentrie that allow you to perform operations, transform data, and extend functionality. Sentrie supports **built-in functions** (see [Built-in Functions](/reference/built-in-functions)) that are always available without imports, and **TypeScript module functions** that you import using the `use` statement.

## Syntax

**Call (direct):** `functionName(arg1, arg2, ...)`

**Call (via alias):** `alias.functionName(arg1, arg2, ...)`

**Import:** `use { fn1, fn2, ... } from source [ as alias ]`

- **source:** Either a built-in module reference (e.g. `@sentrie/hash`, no quotes) or a relative path string (e.g. `"./utils.ts"`, in quotes).
- **as alias:** Optional. Identifier used as the namespace for the imported functions. If omitted, the default alias is typically the last path segment of the source (e.g. `hash` for `@sentrie/hash`).

## Configuration & Arguments

| Element | Type | Required | Description |
| :------ | :--- | :------- | :---------- |
| `source` | `@sentrie/module` or `"./path.ts"` | Yes | Built-in: `@sentrie/name` (no quotes). Relative: quoted string path from the policy file (or pack root). |
| `as alias` | identifier | No | Namespace for the imported functions. Omitted: default alias is last segment of source (e.g. `hash` for `@sentrie/hash`). |
| Function args | expressions | Per function | Typed and documented per module. See [Built-in TypeScript modules](/reference/typescript_modules/) and [Writing custom TypeScript modules](/extensibility/writing-custom-typescript-modules). |

**Returns:** Per function; see the module’s documentation. Invalid arguments or runtime errors in the function abort evaluation.

## Where use is allowed

`use` is a policy-level statement. It must appear inside a [policy](/reference/policies) block, after [facts](/reference/facts) and before or alongside [let](/reference/let) and [rules](/reference/rules), per the policy statement order. The imported functions are visible to all rules and let bindings in that policy. They are not visible in other policies unless those policies declare their own `use`.

## Resolution of source

- **Built-in:** `@sentrie/name` refers to a built-in module (e.g. `@sentrie/hash`, `@sentrie/time`). The runtime resolves these to the provided implementations.
- **Relative:** A string path (e.g. `"./utils.ts"`) is resolved relative to the policy file or the pack root, per tooling. Only paths that the [permissions](/reference/security-and-permissions) allow can be loaded.

### Example

```sentrie
policy mypolicy {
  fact data: string

  use { sha256, now } from @sentrie/hash as hash
  use { parse } from @sentrie/js as json

  rule processData = default false {
    let hashValue = hash.sha256(data)
    let currentTime = hash.now()
    let parsed = json.parse(data)
    yield hashValue != "" and currentTime > 0 and parsed is defined
  }
}
```

## Examples in Action

### Import and call (no alias, default alias)

```sentrie
use { sha256 } from @sentrie/hash
let h = sha256(data)
```

### Import with alias

```sentrie
use { now } from @sentrie/time as time
let t = time.now()
```

### Multiple functions and custom module

```sentrie
namespace com/example/crypto

policy security {
  fact password: string
  fact timestamp: number

  use { sha256, md5 } from @sentrie/hash
  use { now } from @sentrie/time as time

  rule validatePassword = default false {
    let hash = hash.sha256(password)
    let currentTime = time.now()
    yield hash != "" and currentTime > timestamp
  }

  export decision of validatePassword
}
```

### Local TypeScript modules

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

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Memoization:** Functions may be memoized per (function, arguments) when applicable; repeated calls with the same arguments may return a cached result. This is implementation-defined.
- **Scope:** `use` is per policy. The alias (or default) is used only in that policy. Other policies must declare their own `use` to call the same or other modules.
- **Errors:** Missing or wrong-type arguments, or runtime errors inside the function, can cause evaluation to abort. See [Built-in TypeScript modules](/reference/typescript_modules/) and [Writing custom TypeScript modules](/extensibility/writing-custom-typescript-modules) for function contracts and types.
- **Permissions:** Custom modules (e.g. `"./file.ts"`) are subject to [security and permissions](/reference/security-and-permissions) (e.g. filesystem read). Built-in modules run with the same permissions as the pack.
