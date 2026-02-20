---
title: Built-in TypeScript Modules
description: "Reference for built-in @sentrie/* modules: import syntax and module list."
---


Built-in modules provide functions for hashing, encoding, time, JSON, regex, and more. Import with `use { ... } from @sentrie/module`; no quotes. For custom modules see [Writing custom TypeScript modules](/extensibility/writing-custom-typescript-modules).

## Syntax

```text
use { fn1, fn2 } from @sentrie/module [ as alias ]
```

Built-in modules: `@sentrie/module` (no quotes). Default alias is the last path segment (e.g. `time` for `@sentrie/time`).

## Parameters

| Element | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fn1`, `fn2` | identifiers | Yes | Exported function names from the module. |
| `@sentrie/module` | path | Yes | Module name (e.g. `@sentrie/hash`, `@sentrie/time`). |
| `as alias` | identifier | No | Name used in policy (e.g. `alias.fn1()`). |

**Returns:** N/A (import). Function return types are per module; see linked pages.

## Examples

### Basic Usage

```text
use { now } from @sentrie/time
use { sha256 } from @sentrie/hash
use { isValid } from @sentrie/json as jsonUtil
```

### Advanced Usage

```text
use { now } from @sentrie/time
use { sha256 } from @sentrie/hash
use { parse } from @sentrie/js as json
let t = time.now()
let h = sha256(data)
let ok = jsonUtil.isValid(data)
```

## Module List

| Module | Description |
| :--- | :--- |
| [@sentrie/collection](/reference/typescript_modules/sentrie/collection) | List/map utilities (`list_*`, `map_*`) |
| [@sentrie/crypto](/reference/typescript_modules/sentrie/crypto) | SHA-256 |
| [@sentrie/encoding](/reference/typescript_modules/sentrie/encoding) | Base64, hex, URL encode/decode |
| [@sentrie/hash](/reference/typescript_modules/sentrie/hash) | MD5, SHA-1, SHA-256, SHA-512, HMAC |
| [@sentrie/js](/reference/typescript_modules/sentrie/js) | Math, String, Number, Date, JSON, Array globals |
| [@sentrie/json](/reference/typescript_modules/sentrie/json) | `isValid` (JSON validation) |
| [@sentrie/jwt](/reference/typescript_modules/sentrie/jwt) | Decode/verify JWT (HS256/384/512) |
| [@sentrie/net](/reference/typescript_modules/sentrie/net) | CIDR, parseIP, isPrivate, etc. |
| [@sentrie/regex](/reference/typescript_modules/sentrie/regex) | match, find, replace, split |
| [@sentrie/semver](/reference/typescript_modules/sentrie/semver) | compare, isValid, satisfies, major/minor/patch |
| [@sentrie/time](/reference/typescript_modules/sentrie/time) | now, parse, format, addDuration, isBefore, etc. |
| [@sentrie/url](/reference/typescript_modules/sentrie/url) | parse, join, getHost, getPath, getQuery, isValid |
| [@sentrie/uuid](/reference/typescript_modules/sentrie/uuid) | v4, v6, v7 |

## Behavior & Constraints

- Only the listed functions can be imported. Paths are resolved at load time. Invalid function names or modules cause errors.

## Constraints & Edge Cases

- Built-in `@sentrie/*` modules do not use quotes. Local files use quoted paths (e.g. `"./utils.ts"`). JWT module only decodes/verifies; it does not create tokens. Prefer SHA-256/SHA-512 over MD5/SHA-1 for security.
