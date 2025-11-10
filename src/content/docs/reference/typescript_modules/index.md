---
title: Built-in TypeScript Modules
description: Complete reference for all built-in TypeScript modules in Sentrie.
---

Sentrie provides a comprehensive set of built-in TypeScript modules for common operations. These modules are available under the `@sentrie/*` namespace and can be imported using the `use` statement in your policies.

## Quick Start

Import and use built-in modules in your policies:

```text
namespace com/example/mypolicy

policy mypolicy {
  use { now } from @sentrie/time
  use { sha256 } from @sentrie/hash
  use { parse, format } from @sentrie/json

  fact data!: string
  fact timestamp!: number

  rule processData = default false {
    let hash = sha256(data)
    let currentTime = now()
    let jsonData = json.parse(data)
    yield hash != "" and currentTime > timestamp
  }

  export decision of processData
}
```

## Module Categories

### Data Manipulation

#### [Collection](./sentrie/collection)

List and map manipulation utilities. Functions are prefixed with `list_` for array operations and `map_` for object operations.

**Key Functions:**

- `list_includes`, `list_sort`, `list_unique`, `list_chunk`
- `map_keys`, `map_values`, `map_get`, `map_merge`

#### [String](./sentrie/string)

Comprehensive string manipulation utilities including trimming, case conversion, substring extraction, and more.

**Key Functions:**

- `trim`, `toLowerCase`, `toUpperCase`
- `replace`, `split`, `substring`, `startsWith`, `endsWith`

#### [JSON](./sentrie/json)

JSON marshaling and unmarshaling utilities, including validation.

**Key Functions:**

- `marshal`, `unmarshal`, `isValid`

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

### Mathematics

#### [Math](./sentrie/math)

Mathematical constants and functions. Similar to JavaScript's Math object, but with additional functions.

**Key Functions:**

- `abs`, `ceil`, `floor`, `round`, `max`, `min`
- `sqrt`, `pow`, `exp`, `log`, `log10`, `log2`
- `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`
- `sinh`, `cosh`, `tanh`, `random`

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

| Module                                      | Description                                         | Category           |
| ------------------------------------------- | --------------------------------------------------- | ------------------ |
| [@sentrie/collection](./sentrie/collection) | List and map manipulation utilities                 | Data Manipulation  |
| [@sentrie/crypto](./sentrie/crypto)         | Cryptographic functions (SHA-256)                   | Cryptography       |
| [@sentrie/encoding](./sentrie/encoding)     | Base64, Hex, and URL encoding/decoding              | Encoding           |
| [@sentrie/hash](./sentrie/hash)             | Hash functions (MD5, SHA-1, SHA-256, SHA-512, HMAC) | Cryptography       |
| [@sentrie/json](./sentrie/json)             | JSON marshaling and unmarshaling                    | Data Manipulation  |
| [@sentrie/jwt](./sentrie/jwt)               | JSON Web Token decoding and verification            | Security           |
| [@sentrie/math](./sentrie/math)             | Mathematical constants and functions                | Mathematics        |
| [@sentrie/net](./sentrie/net)               | Network and IP address utilities                    | Network            |
| [@sentrie/regex](./sentrie/regex)           | Regular expression pattern matching                 | Pattern Matching   |
| [@sentrie/semver](./sentrie/semver)         | Semantic version comparison and validation          | Version Management |
| [@sentrie/string](./sentrie/string)         | String manipulation utilities                       | Data Manipulation  |
| [@sentrie/time](./sentrie/time)             | Date and time manipulation                          | Date & Time        |
| [@sentrie/url](./sentrie/url)               | URL parsing and manipulation                        | Network            |
| [@sentrie/uuid](./sentrie/uuid)             | UUID generation (v4, v6, v7)                        | Identifiers        |

## Common Use Cases

### Authentication & Authorization

```text
namespace com/example/auth

policy authentication {
  use { sha256, hmac } from @sentrie/hash
  use { decode, verify } from @sentrie/jwt
  use { base64Decode } from @sentrie/encoding

  fact token!: string
  fact secretKey!: string
  fact passwordInput!: string
  fact expectedHash!: string

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
  use { match } from @sentrie/regex
  use { trim, toLowerCase, includes } from @sentrie/string
  use { isValid } from @sentrie/json

  fact email!: string
  fact jsonData!: string

  rule validateEmail = default false {
    let emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    let trimmed = str.trim(email)
    yield regex.match(emailPattern, trimmed)
  }

  rule validateJson = default false {
    yield json.isValid(jsonData)
  }

  export decision of validateEmail
  export decision of validateJson
}
```

### Network Access Control

```text
namespace com/example/network

policy network {
  use { cidrContains, isPrivate, parseIP } from @sentrie/net
  use { getHost, isValid } from @sentrie/url

  fact clientIp!: string
  fact allowedCidr!: string
  fact requestUrl!: string

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
  use { now, isBefore, addDuration, format } from @sentrie/time

  fact tokenExpiry!: number
  fact sessionStart!: number

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
-- Default alias is "time" (last part of @sentrie/time)
-- Use as: time.now()
```

## Best Practices

1. **Use appropriate modules** - Choose the right module for your use case (e.g., use `@sentrie/hash` for secure hashing instead of `@sentrie/crypto`)

2. **Security considerations** - Use SHA-256 or SHA-512 for secure hashing. Avoid MD5 and SHA-1 for security-sensitive operations.

3. **Performance** - Regex patterns are compiled and cached, so repeated use of the same pattern is efficient.

4. **Type safety** - All modules provide full TypeScript type definitions for better error detection and IntelliSense support.

5. **Error handling** - Most functions throw errors on invalid input. Always validate inputs before calling module functions.

6. **Module organization** - Use aliases when importing multiple functions from the same module to keep code readable.

## See Also

- [Using TypeScript](/reference/using-typescript) - Complete guide to using TypeScript in Sentrie
- [Policy Pack Structure](/structure-of-a-policy-pack/overview) - Learn about organizing your policy pack
- [Policy Language Reference](/reference) - Complete reference for the Sentrie policy language
