---
title: Functions
description: Function call syntax and TypeScript module usage; memoization.
---


Functions are called with `name(args...)` or `alias.name(args...)` for imported modules. Sentrie has no built-in global functions; all functions come from TypeScript modules imported with `use`.

## Syntax

```text
functionName(arg1, arg2, ...)
alias.functionName(arg1, arg2, ...)
```

Import: `use { fn1, fn2 } from source [ as alias ]`

## Parameters

| Element | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `source` | `@sentrie/module` or `"./file.ts"` | Yes | Built-in (no quotes) or relative path (quotes). |
| `as alias` | identifier | No | Default alias is last path segment (e.g. `hash` for `@sentrie/hash`). |
| args | expressions | Per function | Typed by the module; see [TypeScript modules](/reference/typescript_modules/). |

**Returns:** Per function; see module docs. Invalid args or runtime errors abort evaluation.

## Examples

### Basic Usage

```sentrie
use { sha256 } from @sentrie/hash
use { now } from @sentrie/time as time
let h = sha256(data)
let t = time.now()
```

### Advanced Usage

```sentrie
use { calculateAge, validateEmail } from "./utils.ts" as utils
yield utils.calculateAge(user.birthDate) >= 18 and utils.validateEmail(user.email)
```

## Behavior & Constraints

- Functions are memoized per (function, args) when applicable; repeated calls with same args may return cached result.
- Module scope: `use` is per policy; alias is used in that policy only.

## Constraints & Edge Cases

- Missing or wrong-type arguments can cause runtime errors. See [Built-in TypeScript modules](/reference/typescript_modules/) and [Writing custom TypeScript modules](/extensibility/writing-custom-typescript-modules) for contracts.
