---
title: "@sentrie/hash"
description: Hash functions
---

The `@sentrie/hash` module provides various cryptographic hash functions. All hash functions return hexadecimal-encoded strings.

## Usage

```text
use { md5, sha256, sha512, hmac } from @sentrie/hash
```

## Functions

### `md5(str: string): string`

Computes the MD5 hash of a string.

**Parameters:**

- `str` - The string to hash

**Returns:** MD5 hash as a hexadecimal string (32 characters)

**Warning:** MD5 is cryptographically broken and should not be used for security purposes. Use `sha256` or `sha512` for secure hashing.

**Example:**

```text
use { md5 } from @sentrie/hash
let hash = hash.md5("Hello, World!")  // "65a8e27d8879283831b664bd8b7f0ad4"
```

### `sha1(str: string): string`

Computes the SHA-1 hash of a string.

**Parameters:**

- `str` - The string to hash

**Returns:** SHA-1 hash as a hexadecimal string (40 characters)

**Warning:** SHA-1 is cryptographically broken and should not be used for security purposes. Use `sha256` or `sha512` for secure hashing.

**Example:**

```text
use { sha1 } from @sentrie/hash
let hash = hash.sha1("Hello, World!")
```

### `sha256(str: string): string`

Computes the SHA-256 hash of a string.

**Parameters:**

- `str` - The string to hash

**Returns:** SHA-256 hash as a hexadecimal string (64 characters)

**Example:**

```text
use { sha256 } from @sentrie/hash
let hash = hash.sha256("Hello, World!")
```

### `sha512(str: string): string`

Computes the SHA-512 hash of a string.

**Parameters:**

- `str` - The string to hash

**Returns:** SHA-512 hash as a hexadecimal string (128 characters)

**Example:**

```text
use { sha512 } from @sentrie/hash
let hash = hash.sha512("Hello, World!")
```

### `hmac(algorithm: string, data: string, key: string): string`

Computes HMAC (Hash-based Message Authentication Code) for data using a secret key.

**Parameters:**

- `algorithm` - Hash algorithm to use: `"md5"`, `"sha1"`, `"sha256"`, `"sha384"`, or `"sha512"`
- `data` - The data to authenticate
- `key` - The secret key for HMAC computation

**Returns:** HMAC as a hexadecimal string

**Throws:** Error if the algorithm is unsupported

**Note:** Recommended algorithms: `"sha256"` or `"sha512"` for security.

**Example:**

```text
use { hmac } from @sentrie/hash
let mac = hash.hmac("sha256", "Hello, World!", "secret-key")
```

## Complete Example

```text
namespace com/example/auth

policy mypolicy {
  use { sha256, hmac } from @sentrie/hash
  fact passwordInput!: string
  fact expectedHash!: string
  fact secretKey!: string
  fact message!: string
  fact expectedMac!: string

  rule verifyPassword = default false {
    let hash = hash.sha256(passwordInput)
    yield hash == expectedHash
  }

  rule verifyMessage = default false {
    let mac = hash.hmac("sha256", message, secretKey)
    yield mac == expectedMac
  }

  export decision of verifyPassword
  export decision of verifyMessage
}
```

## Security Recommendations

1. **Use SHA-256 or SHA-512** for secure hashing instead of MD5 or SHA-1
2. **Use HMAC** for message authentication with a secret key
3. **Store hashed passwords** using SHA-256 or SHA-512 with proper salt (consider using HMAC with a secret key)
