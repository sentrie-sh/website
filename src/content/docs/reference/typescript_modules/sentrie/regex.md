---
title: "@sentrie/regex"
description: Regular expression pattern matching
---

The `@sentrie/regex` module provides regular expression pattern matching and manipulation utilities. All patterns are compiled and cached for performance.

## Usage

```text
use { match, find, findAll, replace, replaceAll, split } from @sentrie/regex
```

## Functions

### `match(pattern: string, str: string): boolean`

Tests if a string matches a regular expression pattern.

**Parameters:**

- `pattern` - The regular expression pattern to match
- `str` - The string to test

**Returns:** `true` if the string matches the pattern, `false` otherwise

**Throws:** Error if the pattern is invalid

**Example:**

```text
use { match } from @sentrie/regex
let matches = regex.match("^[a-z]+$", "hello")  // true
let noMatch = regex.match("^[0-9]+$", "hello")  // false
```

### `find(pattern: string, str: string): string | null`

Finds the first match of a pattern in a string.

**Parameters:**

- `pattern` - The regular expression pattern to search for
- `str` - The string to search in

**Returns:** The first match found, or `null` if no match

**Throws:** Error if the pattern is invalid

**Example:**

```text
use { find } from @sentrie/regex
let match = regex.find("[0-9]+", "abc123def")  // "123"
let noMatch = regex.find("[0-9]+", "abcdef")  // null
```

### `findAll(pattern: string, str: string): string[]`

Finds all matches of a pattern in a string.

**Parameters:**

- `pattern` - The regular expression pattern to search for
- `str` - The string to search in

**Returns:** Array of all matches found (empty array if none)

**Throws:** Error if the pattern is invalid

**Example:**

```text
use { findAll } from @sentrie/regex
let matches = regex.findAll("[0-9]+", "abc123def456ghi")  // ["123", "456"]
```

### `replace(pattern: string, str: string, replacement: string): string`

Replaces the first occurrence of a pattern in a string.

**Parameters:**

- `pattern` - The regular expression pattern to match
- `str` - The string to perform replacement on
- `replacement` - The replacement string

**Returns:** The string with the first match replaced

**Throws:** Error if the pattern is invalid

**Example:**

```text
use { replace } from @sentrie/regex
let result = regex.replace("[0-9]+", "abc123def", "XXX")  // "abcXXXdef"
```

### `replaceAll(pattern: string, str: string, replacement: string): string`

Replaces all occurrences of a pattern in a string.

**Parameters:**

- `pattern` - The regular expression pattern to match
- `str` - The string to perform replacement on
- `replacement` - The replacement string

**Returns:** The string with all matches replaced

**Throws:** Error if the pattern is invalid

**Example:**

```text
use { replaceAll } from @sentrie/regex
let result = regex.replaceAll("[0-9]+", "abc123def456", "XXX")  // "abcXXXdefXXX"
```

### `split(pattern: string, str: string): string[]`

Splits a string by a regular expression pattern.

**Parameters:**

- `pattern` - The regular expression pattern to split on
- `str` - The string to split

**Returns:** Array of substrings split by the pattern

**Throws:** Error if the pattern is invalid

**Example:**

```text
use { split } from @sentrie/regex
let parts = regex.split("\\s+", "hello   world  test")  // ["hello", "world", "test"]
```

## Complete Example

```text
namespace com/example/validation

policy mypolicy {
  use { match, find, replaceAll } from @sentrie/regex
  fact email!: string
  fact phoneNumber!: string

  rule validateEmail = default false {
    let emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    yield regex.match(emailPattern, email)
  }

  rule validatePhone = default false {
    let phonePattern = "^\\+?[1-9]\\d{1,14}$"
    yield regex.match(phonePattern, phoneNumber)
  }

  rule sanitizeInput = default false {
    let sanitized = regex.replaceAll("[^a-zA-Z0-9]", email, "")
    yield sanitized != ""
  }

  export decision of validateEmail
  export decision of validatePhone
  export decision of sanitizeInput
}
```

## Common Patterns

### Email Validation

```text
let emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
```

### Phone Number (E.164)

```text
let phonePattern = "^\\+?[1-9]\\d{1,14}$"
```

### URL Pattern

```text
let urlPattern = "^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/.*)?$"
```

### Alphanumeric with Underscores

```text
let alnumPattern = "^[a-zA-Z0-9_]+$"
```

## Performance Notes

- All patterns are compiled and cached for performance
- Repeated use of the same pattern in a single execution context will use the cached compiled pattern
- Patterns are automatically cleaned up after execution
