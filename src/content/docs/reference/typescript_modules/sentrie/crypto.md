---
title: "@sentrie/crypto"
description: Cryptographic functions
---

The `@sentrie/crypto` module provides basic cryptographic utilities. For additional hash algorithms, see the `@sentrie/hash` module.

## Usage

```text
use { sha256 } from "@sentrie/crypto"
```

## Functions

### `sha256(str: string): string`

Computes the SHA-256 hash of a string. This function uses a streaming hash implementation.

**Parameters:**

- `str` - The string to hash

**Returns:** SHA-256 hash as a hexadecimal string

**Note:** For consistent hashing, consider using the `@sentrie/hash` module's `sha256` function instead.

**Example:**

```text
namespace com/example/auth

policy mypolicy {
  use { sha256 } from "@sentrie/crypto"

  fact passwordInput!: string
  fact expectedHash!: string

  rule verifyPassword = default false {
    let hash = sha256(passwordInput)
    yield hash == expectedHash
  }

  export decision of verifyPassword
}
```

## See Also

- [@sentrie/hash](./@sentrie/hash) - For additional hash algorithms (MD5, SHA-1, SHA-512, HMAC)
