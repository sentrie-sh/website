---
title: Built-in TypeScript Modules
description: "Reference for built-in @sentrie/* modules: import syntax and module list."
---


Built-in modules provide functions for hashing, encoding, time, JSON, regex, and more. Import with `use { ... } from @sentrie/module`; no quotes. For custom modules see [Writing custom TypeScript modules](/extensibility/writing-custom-typescript-modules).

## Syntax

```text
use { fn1, fn2 } from @sentrie/module [ as alias ]
```

### Example policy

```sentrie
namespace com/example/mypolicy

policy mypolicy {
  fact data!: string
  fact timestamp!: number

  use { now } from @sentrie/time
  use { sha256 } from @sentrie/hash
  use { parse } from @sentrie/js as json
  use { isValid } from @sentrie/json as jsonUtil

  rule processData = default false {
    let hash = sha256(data)
    let currentTime = now()
    let jsonData = json.parse(data)
    let ok = jsonUtil.isValid(data)
    yield hash != "" and currentTime > timestamp and ok
  }

  export decision of processData
}
```

Built-in modules: `@sentrie/module` (no quotes). Default alias is the last path segment (e.g. `time` for `@sentrie/time`).

## Configuration & Arguments

| Element | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fn1`, `fn2` | identifiers | Yes | Exported function names from the module. |
| `@sentrie/module` | path | Yes | Module name (e.g. `@sentrie/hash`, `@sentrie/time`). |
| `as alias` | identifier | No | Name used in policy (e.g. `alias.fn1()`). |

**Returns:** N/A (import). Function return types are per module; see linked pages.

## Examples in Action

- `list_includes`, `list_sort`, `list_unique`, `list_chunk`
- `map_keys`, `map_values`, `map_get`, `map_merge`

#### [JavaScript Globals](./sentrie/js)

Access to JavaScript globals (Math, String, Number, Date, JSON, Array) as individual functions.

**Key Functions:**

- **Math**: `round`, `floor`, `ceil`, `max`, `min`, `abs`, `sqrt`, `pow`, `sin`, `cos`, `tan`, etc.
- **String**: `length`, `fromCharCode`
- **Number**: `isNaN`, `parseInt`, `parseFloat`, `isFinite`, `isInteger`
- **Date**: `now`, `dateParse`, `UTC`
- **JSON**: `parse`, `stringify`
- **Array**: `isArray`, `from`, `of`

#### [JSON](./sentrie/json)

JSON validation utility.

**Key Functions:**

- `isValid` - Validates if a string is valid JSON

### Cryptography & Security

#### [Hash](./sentrie/hash)

Comprehensive hash functions including MD5, SHA-1, SHA-256, SHA-512, and HMAC.

**Key Functions:**

- `md5`, `sha1`, `sha256`, `sha512`, `hmac`

**Security Note:** MD5 and SHA-1 are cryptographically broken. Use SHA-256 or SHA-512 for secure hashing.

#### [Crypto](./sentrie/crypto)

Basic cryptographic utilities including SHA-256 hashing.

**Key Functions:**

- `sha256`

#### [JWT](./sentrie/jwt)

JSON Web Token decoding and verification utilities. **Note:** This module only decodes and verifies tokens; it does NOT create/generate tokens.

**Key Functions:**

- `decode`, `verify`, `getPayload`, `getHeader`

**Supported Algorithms:** HS256, HS384, HS512

### Encoding & Decoding

#### [Encoding](./sentrie/encoding)

Various encoding and decoding utilities. Supports Base64, Hex, and URL encoding/decoding operations.

**Key Functions:**

- `base64Encode`, `base64Decode`, `base64UrlEncode`, `base64UrlDecode`
- `hexEncode`, `hexDecode`
- `urlEncode`, `urlDecode`

### Network & Internet

#### [Net](./sentrie/net)

Network and IP address utilities for network-based policies. Supports both IPv4 and IPv6 addresses and CIDR notation.

**Key Functions:**

- `cidrContains`, `cidrIntersects`, `cidrIsValid`, `cidrExpand`, `cidrMerge`
- `parseIP`, `isIPv4`, `isIPv6`, `isPrivate`, `isPublic`, `isLoopback`

#### [URL](./sentrie/url)

URL parsing and manipulation utilities. **Note:** URL encoding/decoding is provided by the encoding module.

**Key Functions:**

- `parse`, `join`, `getHost`, `getPath`, `getQuery`, `isValid`

### Date & Time

#### [Time](./sentrie/time)

Date and time manipulation utilities. All timestamps are Unix timestamps (seconds since epoch).

**Key Functions:**

- `now`, `parse`, `format`, `addDuration`, `subtractDuration`
- `isBefore`, `isAfter`, `isBetween`

**Constants:**

- `RFC3339`, `RFC3339Nano`, `RFC1123`, `RFC1123Z`, `RFC822`, `RFC822Z`

### JavaScript Globals

#### [JavaScript Globals](./sentrie/js)

Access to JavaScript globals (Math, String, Number, Date, JSON, Array) as individual functions. This module provides direct access to standard JavaScript functions.

**Key Functions:**

- **Math**: `round`, `floor`, `ceil`, `max`, `min`, `abs`, `sqrt`, `pow`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`, `exp`, `log`, `log10`, `log2`, `random`
- **String**: `length`, `fromCharCode`
- **Number**: `isNaN`, `parseInt`, `parseFloat`, `isFinite`, `isInteger`
- **Date**: `now`, `dateParse`, `UTC`
- **JSON**: `parse`, `stringify`
- **Array**: `isArray`, `from`, `of`

**Constants:**

- `E`, `PI`, `LN2`, `LN10`, `LOG2E`, `LOG10E`, `SQRT2`, `SQRT1_2`, `MAX_VALUE`, `MIN_VALUE`

### Pattern Matching

#### [Regex](./sentrie/regex)

Regular expression pattern matching and manipulation utilities. All patterns are compiled and cached for performance.

**Key Functions:**

- `match`, `find`, `findAll`, `replace`, `replaceAll`, `split`

### Version Management

#### [Semver](./sentrie/semver)

Semantic version comparison and validation utilities. Supports the "v" prefix (e.g., `"v1.2.3"` is equivalent to `"1.2.3"`).

**Key Functions:**

- `compare`, `isValid`, `satisfies`, `stripPrefix`
- `major`, `minor`, `patch`, `prerelease`, `metadata`

### Identifiers

#### [UUID](./sentrie/uuid)

Functions for generating UUIDs (Universally Unique Identifiers).

**Key Functions:**

- `v4()` - Random UUID (version 4)
- `v6()` - Time-ordered UUID (version 6)
- `v7()` - Time-ordered UUID with Unix timestamp (version 7)

## Complete Module List

| Module                                      | Description                                                  | Category           |
| ------------------------------------------- | ------------------------------------------------------------ | ------------------ |
| [@sentrie/collection](./sentrie/collection) | List and map manipulation utilities                          | Data Manipulation  |
| [@sentrie/crypto](./sentrie/crypto)         | Cryptographic functions (SHA-256)                            | Cryptography       |
| [@sentrie/encoding](./sentrie/encoding)     | Base64, Hex, and URL encoding/decoding                       | Encoding           |
| [@sentrie/hash](./sentrie/hash)             | Hash functions (MD5, SHA-1, SHA-256, SHA-512, HMAC)          | Cryptography       |
| [@sentrie/js](./sentrie/js)                 | JavaScript globals (Math, String, Number, Date, JSON, Array) | JavaScript Globals |
| [@sentrie/json](./sentrie/json)             | JSON validation utility                                      | Data Manipulation  |
| [@sentrie/jwt](./sentrie/jwt)               | JSON Web Token decoding and verification                     | Security           |
| [@sentrie/net](./sentrie/net)               | Network and IP address utilities                             | Network            |
| [@sentrie/regex](./sentrie/regex)           | Regular expression pattern matching                          | Pattern Matching   |
| [@sentrie/semver](./sentrie/semver)         | Semantic version comparison and validation                   | Version Management |
| [@sentrie/time](./sentrie/time)             | Date and time manipulation                                   | Date & Time        |
| [@sentrie/url](./sentrie/url)               | URL parsing and manipulation                                 | Network            |
| [@sentrie/uuid](./sentrie/uuid)             | UUID generation (v4, v6, v7)                                 | Identifiers        |

## Common Use Cases

### Authentication & Authorization

```text
namespace com/example/auth

policy authentication {
  fact token!: string
  fact secretKey!: string
  fact passwordInput!: string
  fact expectedHash!: string

  use { sha256, hmac } from @sentrie/hash
  use { decode, verify } from @sentrie/jwt
  use { base64Decode } from @sentrie/encoding

  rule verifyToken = default false {
    let isValid = jwt.verify(token, secretKey)
    yield isValid
  }

  rule verifyPassword = default false {
    let hash = hash.sha256(passwordInput)
    yield hash == expectedHash
  }

  export decision of verifyToken
  export decision of verifyPassword
}
```

### Data Validation

```text
namespace com/example/validation

policy validation {
  fact email!: string
  fact jsonData!: string

  use { match } from @sentrie/regex
  use { length } from @sentrie/js as str
  use { isValid } from @sentrie/json as jsonUtil

  rule validateEmail = default false {
    let emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    let emailLength = str.length(email)
    yield regex.match(emailPattern, email) and emailLength > 0
  }

  rule validateJson = default false {
    yield jsonUtil.isValid(jsonData)
  }

  export decision of validateEmail
  export decision of validateJson
}
```

### Network Access Control

```text
namespace com/example/network

policy network {
  fact clientIp!: string
  fact allowedCidr!: string
  fact requestUrl!: string

  use { cidrContains, isPrivate, parseIP } from @sentrie/net
  use { getHost, isValid } from @sentrie/url

  rule checkAccess = default false {
    let ip = net.parseIP(clientIp)
    let isAllowed = net.cidrContains(allowedCidr, clientIp)
    let isNotPrivate = not net.isPrivate(clientIp)
    yield ip != null and isAllowed and isNotPrivate
  }

  rule validateUrl = default false {
    let isValidUrl = url.isValid(requestUrl)
    let host = url.getHost(requestUrl)
    yield isValidUrl and host != ""
  }

  export decision of checkAccess
  export decision of validateUrl
}
```

### Time-Based Policies

```text
namespace com/example/time

policy time {
  fact tokenExpiry!: number
  fact sessionStart!: number

  use { now, isBefore, addDuration, format } from @sentrie/time

  rule checkTokenExpiry = default false {
    let currentTime = time.now()
    let isExpired = time.isBefore(tokenExpiry, currentTime)
    yield not isExpired
  }

  rule checkSessionTimeout = default false {
    let currentTime = time.now()
    let sessionTimeout = time.addDuration(sessionStart, "1h")
    let isExpired = time.isBefore(sessionTimeout, currentTime)
    yield not isExpired
  }

  export decision of checkTokenExpiry
  export decision of checkSessionTimeout
}
```

## Import Syntax

All modules use the same import syntax:

```text
use { function1, function2 } from @sentrie/module
```

:::note
Built-in `@sentrie/*` modules do not use quotes. Local TypeScript files use quotes for relative paths.
:::

You can optionally use an alias:

```text
use { function1, function2 } from @sentrie/module
```

If no alias is specified, the default alias is the last part of the module path.

## Module Aliasing

When importing from a module, the default alias is the last part of the module path:

```text
use { now } from @sentrie/time
use { sha256 } from @sentrie/hash
use { isValid } from @sentrie/json as jsonUtil
```

### Going further

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

## Good to Know

Before you implement this, keep a few boundaries in mind:

- Only the listed functions can be imported. Paths are resolved at load time. Invalid function names or modules cause errors.


- Built-in `@sentrie/*` modules do not use quotes. Local files use quoted paths (e.g. `"./utils.ts"`). JWT module only decodes/verifies; it does not create tokens. Prefer SHA-256/SHA-512 over MD5/SHA-1 for security.
