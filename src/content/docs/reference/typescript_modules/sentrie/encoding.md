---
title: "@sentrie/encoding"
description: Encoding and decoding utilities
---

The `@sentrie/encoding` module provides various encoding and decoding utilities. Supports Base64, Hex, and URL encoding/decoding operations.

## Usage

```text
use { base64Encode, base64Decode, hexEncode, urlEncode } from "@sentrie/encoding" as encoding
```

## Functions

### Base64 Encoding

#### `base64Encode(str: string): string`

Encodes a string using standard Base64 encoding.

**Parameters:**

- `str` - The string to encode

**Returns:** Base64-encoded string

**Example:**

```text
use { base64Encode } from "@sentrie/encoding" as encoding

let encoded = encoding.base64Encode("Hello, World!")  // "SGVsbG8sIFdvcmxkIQ=="
```

#### `base64Decode(str: string): string`

Decodes a Base64-encoded string.

**Parameters:**

- `str` - The Base64-encoded string to decode

**Returns:** Decoded string

**Throws:** Error if the input is not valid Base64

**Example:**

```text
use { base64Decode } from "@sentrie/encoding" as encoding

let decoded = encoding.base64Decode("SGVsbG8sIFdvcmxkIQ==")  // "Hello, World!"
```

### URL-Safe Base64 Encoding

#### `base64UrlEncode(str: string): string`

Encodes a string using URL-safe Base64 encoding. Uses `-` and `_` instead of `+` and `/`, and omits padding.

**Parameters:**

- `str` - The string to encode

**Returns:** URL-safe Base64-encoded string

**Example:**

```text
use { base64UrlEncode } from "@sentrie/encoding" as encoding

let encoded = encoding.base64UrlEncode("Hello, World!")
```

#### `base64UrlDecode(str: string): string`

Decodes a URL-safe Base64-encoded string.

**Parameters:**

- `str` - The URL-safe Base64-encoded string to decode

**Returns:** Decoded string

**Throws:** Error if the input is not valid URL-safe Base64

### Hex Encoding

#### `hexEncode(str: string): string`

Encodes a string to hexadecimal representation.

**Parameters:**

- `str` - The string to encode

**Returns:** Hexadecimal-encoded string (e.g., `"48656c6c6f"`)

**Example:**

```text
use { hexEncode } from "@sentrie/encoding" as encoding

let encoded = encoding.hexEncode("Hello")  // "48656c6c6f"
```

#### `hexDecode(str: string): string`

Decodes a hexadecimal string.

**Parameters:**

- `str` - The hexadecimal string to decode (e.g., `"48656c6c6f"`)

**Returns:** Decoded string

**Throws:** Error if the input is not valid hexadecimal

**Example:**

```text
use { hexDecode } from "@sentrie/encoding" as encoding

let decoded = encoding.hexDecode("48656c6c6f")  // "Hello"
```

### URL Encoding

#### `urlEncode(str: string): string`

URL-encodes a string using percent encoding (query string encoding). Encodes special characters as `%XX` hexadecimal sequences.

**Parameters:**

- `str` - The string to encode

**Returns:** URL-encoded string

**Example:**

```text
use { urlEncode } from "@sentrie/encoding" as encoding

let encoded = encoding.urlEncode("Hello, World!")  // "Hello%2C%20World%21"
```

#### `urlDecode(str: string): string`

Decodes a URL-encoded string.

**Parameters:**

- `str` - The URL-encoded string to decode

**Returns:** Decoded string

**Throws:** Error if the input contains invalid encoding sequences

**Example:**

```text
use { urlDecode } from "@sentrie/encoding" as encoding

let decoded = encoding.urlDecode("Hello%2C%20World%21")  // "Hello, World!"
```

## Complete Example

```text
namespace com/example/mypolicy

policy mypolicy {
  use { base64Encode, base64Decode, urlEncode, urlDecode } from "@sentrie/encoding" as encoding

  fact data!: string

  rule encodeData = default false {
    let encoded = encoding.base64Encode(data)
    let decoded = encoding.base64Decode(encoded)
    let urlEncoded = encoding.urlEncode(data)
    yield decoded == data
  }

  export decision of encodeData
}
```
