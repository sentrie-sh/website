---
title: "@sentrie/url"
description: URL parsing and manipulation
---

The `@sentrie/url` module provides URL parsing and manipulation utilities. **Note:** URL encoding/decoding is provided by the `@sentrie/encoding` module.

## Usage

```text
use { parse, join, getHost, getPath, getQuery, isValid } from "@sentrie/url" as url
```

## Types

### `ParsedURL`

Represents a parsed URL with its components.

```typescript
interface ParsedURL {
  scheme: string; // URL scheme (e.g., "http", "https", "ftp")
  host: string; // URL host (e.g., "example.com:8080")
  path: string; // URL path (e.g., "/path/to/resource")
  query: string; // URL query string without the leading "?" (e.g., "key=value&foo=bar")
  fragment: string; // URL fragment without the leading "#" (e.g., "section1")
  user: string; // URL user info (e.g., "user:password")
}
```

## Functions

### `parse(urlStr: string): ParsedURL`

Parses a URL string into its components.

**Parameters:**

- `urlStr` - The URL string to parse

**Returns:** A `ParsedURL` object containing the URL components

**Throws:** Error if the URL string is invalid

**Example:**

```text
use { parse } from "@sentrie/url" as url

let parsed = url.parse("https://example.com:8080/path/to/resource?key=value#section")
// {
//   scheme: "https",
//   host: "example.com:8080",
//   path: "/path/to/resource",
//   query: "key=value",
//   fragment: "section",
//   user: ""
// }
```

### `join(...parts: string[]): string`

Joins multiple URL parts into a single URL. Resolves relative paths against the base URL.

**Parameters:**

- `parts` - Variable number of URL part strings to join

**Returns:** The joined URL string

**Throws:** Error if any part is invalid

**Example:**

```text
use { join } from "@sentrie/url" as url

let joined = url.join("https://example.com", "path", "to", "resource")  // "https://example.com/path/to/resource"
```

### `getHost(url: string): string`

Extracts the host component from a URL.

**Parameters:**

- `url` - The URL string (can be full URL or just host)

**Returns:** The host component of the URL

**Throws:** Error if the URL is invalid

**Example:**

```text
use { getHost } from "@sentrie/url" as url

let host = url.getHost("https://example.com:8080/path")  // "example.com:8080"
```

### `getPath(url: string): string`

Extracts the path component from a URL.

**Parameters:**

- `url` - The URL string

**Returns:** The path component of the URL (e.g., `"/path/to/resource"`)

**Throws:** Error if the URL is invalid

**Example:**

```text
use { getPath } from "@sentrie/url" as url

let path = url.getPath("https://example.com/path/to/resource")  // "/path/to/resource"
```

### `getQuery(url: string): string`

Extracts the query string component from a URL.

**Parameters:**

- `url` - The URL string

**Returns:** The query string without the leading `"?"` (e.g., `"key=value"`)

**Throws:** Error if the URL is invalid

**Example:**

```text
use { getQuery } from "@sentrie/url" as url

let query = url.getQuery("https://example.com/path?key=value&foo=bar")  // "key=value&foo=bar"
```

### `isValid(urlStr: string): boolean`

Validates whether a string is a valid URL. Basic validation checks for scheme and host presence (or leading `"/"` for relative URLs).

**Parameters:**

- `urlStr` - The URL string to validate

**Returns:** `true` if the URL appears valid, `false` otherwise

**Example:**

```text
use { isValid } from "@sentrie/url" as url

let valid = url.isValid("https://example.com")  // true
let invalid = url.isValid("not-a-url")  // false
```

## Complete Example

```text
namespace com/example/validation

policy mypolicy {
  use { parse, getHost, getPath, isValid } from "@sentrie/url" as url

  fact requestUrl!: string

  rule validateUrl = default false {
    let isValid = url.isValid(requestUrl)
    yield isValid
  }

  rule checkAllowedHost = default false {
    let host = url.getHost(requestUrl)
    let allowedHosts = ["example.com", "api.example.com"]
    yield host in allowedHosts
  }

  rule checkPath = default false {
    let path = url.getPath(requestUrl)
    let allowedPaths = ["/api", "/public"]
    yield url.startsWith(path, "/api") or url.startsWith(path, "/public")
  }

  export decision of validateUrl
  export decision of checkAllowedHost
  export decision of checkPath
}
```

## See Also

- [@sentrie/encoding](./@sentrie/encoding) - For URL encoding/decoding operations

## Notes

- URL encoding/decoding (percent encoding) is provided by the `@sentrie/encoding` module
- Relative URLs (starting with `"/"`) are supported
- The `parse` function provides comprehensive URL parsing with all components
- The `join` function properly resolves relative paths against base URLs
