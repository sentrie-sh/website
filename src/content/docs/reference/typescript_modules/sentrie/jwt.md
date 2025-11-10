---
title: "@sentrie/jwt"
description: JSON Web Token utilities
---

The `@sentrie/jwt` module provides JSON Web Token decoding and verification utilities. **Note:** This module only decodes and verifies tokens; it does NOT create/generate tokens.

## Usage

```text
use { decode, verify, getPayload, getHeader } from @sentrie/jwt
```

## Functions

### `decode(token: string, secret?: string): Record<string, any>`

Decodes a JWT token and optionally verifies its signature.

**Parameters:**

- `token` - The JWT token string to decode
- `secret` - Optional secret key for signature verification. If provided, verifies the token signature.

**Returns:** The decoded payload as an object

**Throws:** Error if the token format is invalid, signature verification fails, or the algorithm is unsupported

**Supported algorithms:** HS256, HS384, HS512

**Example:**

```text
use { decode } from @sentrie/jwt
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
let payload = jwt.decode(token, "secret-key")
```

### `verify(token: string, secret: string, algorithm?: string): boolean`

Verifies a JWT token's signature.

**Parameters:**

- `token` - The JWT token string to verify
- `secret` - The secret key used for signature verification
- `algorithm` - Optional algorithm name (default: `"HS256"`). Supported: HS256, HS384, HS512

**Returns:** `true` if the signature is valid, `false` otherwise

**Example:**

```text
use { verify } from @sentrie/jwt
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
let isValid = jwt.verify(token, "secret-key", "HS256")
```

### `getPayload(token: string): Record<string, any>`

Extracts the payload from a JWT token without verification.

**Warning:** This does NOT verify the signature - use `decode()` with a secret for verification.

**Parameters:**

- `token` - The JWT token string

**Returns:** The decoded payload as an object

**Throws:** Error if the token format is invalid

**Example:**

```text
use { getPayload } from @sentrie/jwt
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
let payload = jwt.getPayload(token)  // No verification - use with caution!
```

### `getHeader(token: string): Record<string, any>`

Extracts the header from a JWT token without verification.

**Parameters:**

- `token` - The JWT token string

**Returns:** The decoded header as an object

**Throws:** Error if the token format is invalid

**Example:**

```text
use { getHeader } from @sentrie/jwt
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
let header = jwt.getHeader(token)
```

## Complete Example

```text
namespace com/example/auth

policy mypolicy {
  use { decode, verify } from @sentrie/jwt
  fact token!: string
  fact secretKey!: string

  rule verifyToken = default false {
    let isValid = jwt.verify(token, secretKey)
    yield isValid
  }

  rule decodeToken = default false {
    let payload = jwt.decode(token, secretKey)
    let userId = payload["userId"]
    let exp = payload["exp"]
    yield userId != null and exp > time.now()
  }

  export decision of verifyToken
  export decision of decodeToken
}
```

## Security Best Practices

1. **Always verify signatures** - Use `verify()` or `decode()` with a secret key before trusting token data
2. **Check expiration** - Verify the `exp` claim in the payload
3. **Validate claims** - Check required claims (e.g., `iss`, `aud`, `sub`) before using the token
4. **Never use `getPayload()` alone** - Always verify signatures using `verify()` or `decode()` with a secret

## Supported Algorithms

- **HS256** - HMAC with SHA-256 (default)
- **HS384** - HMAC with SHA-384
- **HS512** - HMAC with SHA-512

## Token Structure

A JWT token consists of three parts separated by dots (`.`):

```
header.payload.signature
```

- **Header** - Contains metadata about the token (algorithm, type)
- **Payload** - Contains the claims (data)
- **Signature** - Used to verify the token hasn't been tampered with
