---
title: Functions
description: Exhaustive reference for function call syntax, TypeScript module import (use), aliasing, and memoization.
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
use { calculateAge, validateEmail } from "./utils.ts" as utils
yield utils.calculateAge(user.birthDate) >= 18 and utils.validateEmail(user.email)
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Memoization:** Functions may be memoized per (function, arguments) when applicable; repeated calls with the same arguments may return a cached result. This is implementation-defined.
- **Scope:** `use` is per policy. The alias (or default) is used only in that policy. Other policies must declare their own `use` to call the same or other modules.
- **Errors:** Missing or wrong-type arguments, or runtime errors inside the function, can cause evaluation to abort. See [Built-in TypeScript modules](/reference/typescript_modules/) and [Writing custom TypeScript modules](/extensibility/writing-custom-typescript-modules) for function contracts and types.
- **Permissions:** Custom modules (e.g. `"./file.ts"`) are subject to [security and permissions](/reference/security-and-permissions) (e.g. filesystem read). Built-in modules run with the same permissions as the pack.
