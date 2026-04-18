---
title: Functions
description: "Function call syntax, TypeScript module import (use), aliasing, and memoization."
---

Functions in Sentrie are provided by TypeScript modules. There are no built-in global functions in the language; all callable functions come from modules imported with `use` inside a [policy](/reference/policies). Calls use the form `functionName(args...)` for functions imported without an alias, or `alias.functionName(args...)` when the module is imported with an alias.

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
    let hash = sha256(password)
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

### `as_list(value) => list[any]`

<details>
<summary>Normalizes "one-or-many" inputs by wrapping non-list values in a single-element list.</summary>

The `as_list` function takes a single value and ensures it's a list. If the input is already a list, it returns it unchanged. If the input is not a list, it wraps it in a single-element list.

**Examples:**

- `as_list(42)` → `[42]`
- `as_list("hello")` → `["hello"]`
- `as_list([1, 2, 3])` → `[1, 2, 3]`

```sentrie
let single_value = 42
let as_list_value = as_list(single_value)  -- Returns [42]

let already_list = [1, 2, 3]
let unchanged = as_list(already_list)  -- Returns [1, 2, 3]
```

**Note:** If the input contains `undefined` values, the function returns `undefined`.

</details>

### `flatten(list, depth?) => list[any]`

<details>
<summary>Flattens nested lists to a controlled depth.</summary>

The `flatten` function takes a list and optionally a depth parameter, and flattens nested lists up to the specified depth. The default depth is 1 if not specified.

**Examples:**

- `flatten([[1, 2], [3, 4]])` → `[1, 2, 3, 4]` (default depth 1)
- `flatten([[1, 2], [3, 4]], 1)` → `[1, 2, 3, 4]`
- `flatten([[[1, 2]], [[3, 4]]], 2)` → `[1, 2, 3, 4]`
- `flatten([1, 2, 3], 0)` → `[1, 2, 3]` (no flattening)

```sentrie
let nested = [[1, 2], [3, 4], [5]]
let flattened = flatten(nested)  -- Returns [1, 2, 3, 4, 5]

let deeply_nested = [[[1, 2]], [[3, 4]]]
let flattened_deep = flatten(deeply_nested, 2)  -- Returns [1, 2, 3, 4]
```

**Note:** If the input contains `undefined` values, the function returns `undefined`.

</details>

### `flatten_deep(list) => list[any]`

<details>
<summary>Recursively flattens nested lists to arbitrary depth.</summary>

The `flatten_deep` function takes a list and recursively flattens all nested lists, regardless of nesting depth.

**Examples:**

- `flatten_deep([[1, 2], [3, [4, 5]]])` → `[1, 2, 3, 4, 5]`
- `flatten_deep([[[1]], [[2, 3]], [4]])` → `[1, 2, 3, 4]`

```sentrie
let deeply_nested = [[1, [2, [3, 4]]], [5, 6]]
let fully_flattened = flatten_deep(deeply_nested)  -- Returns [1, 2, 3, 4, 5, 6]
```

**Note:** If the input contains `undefined` values, the function returns `undefined`.

</details>

### `normalise_list(value) => list[any]`

<details>
<summary>Normalizes messy list inputs with one level of nesting.</summary>

The `normalise_list` function first applies `as_list` to wrap non-list values, then flattens exactly one level of nesting. It errors if the input contains deeper than one level of nesting.

**Examples:**

- `normalise_list(42)` → `[42]` (wrapped, then no flattening needed)
- `normalise_list([1, 2, 3])` → `[1, 2, 3]` (already flat)
- `normalise_list([[1, 2], [3, 4]])` → `[1, 2, 3, 4]` (one level flattened)
- `normalise_list([[[1, 2]]])` → Error (deeper than one level)

```sentrie
let mixed_input = [[1, 2], 3, [4, 5]]
let normalized = normalise_list(mixed_input)  -- Returns [1, 2, 3, 4, 5]
```

**Note:** If the input contains `undefined` values, the function returns `undefined`.

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


## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Memoization:** Functions may be memoized per (function, arguments) when applicable; repeated calls with the same arguments may return a cached result. This is implementation-defined.
- **Scope:** `use` is per policy. The alias (or default) is used only in that policy. Other policies must declare their own `use` to call the same or other modules.
- **Errors:** Missing or wrong-type arguments, or runtime errors inside the function, can cause evaluation to abort. See [Built-in TypeScript modules](/reference/typescript_modules/) and [Writing custom TypeScript modules](/extensibility/writing-custom-typescript-modules) for function contracts and types.
- **Permissions:** Custom modules (e.g. `"./file.ts"`) are subject to [security and permissions](/reference/security-and-permissions) (e.g. filesystem read). Built-in modules run with the same permissions as the pack.
