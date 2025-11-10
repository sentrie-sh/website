---
title: "@sentrie/string"
description: String manipulation utilities
---

The `@sentrie/string` module provides comprehensive string manipulation utilities.

## Usage

````text
use { trim, toLowerCase, toUpperCase, replace, split, substring } from @sentrie/string
```

## Functions

### Trimming Functions

#### `trim(str: string): string`

Removes leading and trailing whitespace from a string.

**Example:**

```text
use { trim } from @sentrie/string
let trimmed = string.trim("  hello  ")  // "hello"
````

#### `trimLeft(str: string): string`

Removes leading whitespace from a string.

**Example:**

```text
use { trimLeft } from @sentrie/string
let trimmed = string.trimLeft("  hello  ")  // "hello  "
```

#### `trimRight(str: string): string`

Removes trailing whitespace from a string.

**Example:**

```text
use { trimRight } from @sentrie/string
let trimmed = string.trimRight("  hello  ")  // "  hello"
```

### Case Conversion

#### `toLowerCase(str: string): string`

Converts a string to lowercase.

**Example:**

```text
use { toLowerCase } from @sentrie/string
let lower = string.toLowerCase("Hello, World!")  // "hello, world!"
```

#### `toUpperCase(str: string): string`

Converts a string to uppercase.

**Example:**

```text
use { toUpperCase } from @sentrie/string
let upper = string.toUpperCase("Hello, World!")  // "HELLO, WORLD!"
```

### Replacement Functions

#### `replace(str: string, oldStr: string, newStr: string, n?: number): string`

Replaces occurrences of a substring in a string.

**Parameters:**

- `str` - The string to perform replacement on
- `oldStr` - The substring to replace
- `newStr` - The replacement substring
- `n` - Optional number of replacements to make. If negative or omitted, replaces all occurrences.

**Returns:** The string with replacements made

**Example:**

```text
use { replace } from @sentrie/string
let result = string.replace("hello world hello", "hello", "hi", 1)  // "hi world hello"
```

#### `replaceAll(str: string, oldStr: string, newStr: string): string`

Replaces all occurrences of a substring in a string.

**Example:**

```text
use { replaceAll } from @sentrie/string
let result = string.replaceAll("hello world hello", "hello", "hi")  // "hi world hi"
```

### Splitting Functions

#### `split(str: string, sep: string): string[]`

Splits a string into an array of substrings using a separator.

**Example:**

```text
use { split } from @sentrie/string
let parts = string.split("hello,world,test", ",")  // ["hello", "world", "test"]
```

### Substring Functions

#### `substring(str: string, start: number, end?: number): string`

Extracts a substring from a string.

**Parameters:**

- `str` - The string to extract from
- `start` - The starting index (inclusive)
- `end` - Optional ending index (exclusive). If omitted, extracts to the end of the string.

**Example:**

```text
use { substring } from @sentrie/string
let sub = string.substring("Hello, World!", 0, 5)  // "Hello"
```

#### `slice(str: string, start: number, end?: number): string`

Extracts a slice of a string. Similar to `substring`, but supports negative indices.

**Example:**

```text
use { slice } from @sentrie/string
let sliced = string.slice("Hello, World!", -6)  // "World!"
```

### Checking Functions

#### `startsWith(str: string, prefix: string): boolean`

Checks if a string starts with a specific prefix.

**Example:**

```text
use { startsWith } from @sentrie/string
let starts = string.startsWith("Hello, World!", "Hello")  // true
```

#### `endsWith(str: string, suffix: string): boolean`

Checks if a string ends with a specific suffix.

**Example:**

```text
use { endsWith } from @sentrie/string
let ends = string.endsWith("Hello, World!", "World!")  // true
```

#### `includes(str: string, substr: string): boolean`

Checks if a string includes a specific substring.

**Example:**

```text
use { includes } from @sentrie/string
let includes = string.includes("Hello, World!", "World")  // true
```

### Search Functions

#### `indexOf(str: string, substr: string, fromIndex?: number): number`

Finds the first index of a substring in a string.

**Parameters:**

- `str` - The string to search in
- `substr` - The substring to search for
- `fromIndex` - Optional starting index for the search. If omitted, searches from the beginning.

**Returns:** The index of the first occurrence, or `-1` if not found

**Example:**

```text
use { indexOf } from @sentrie/string
let idx = string.indexOf("Hello, World!", "World")  // 7
```

#### `lastIndexOf(str: string, substr: string, fromIndex?: number): number`

Finds the last index of a substring in a string.

**Parameters:**

- `str` - The string to search in
- `substr` - The substring to search for
- `fromIndex` - Optional starting index for the search (searches backwards). If omitted, searches from the end.

**Returns:** The index of the last occurrence, or `-1` if not found

**Example:**

```text
use { lastIndexOf } from @sentrie/string
let idx = string.lastIndexOf("Hello, World!", "o")  // 8
```

### Padding Functions

#### `padStart(str: string, length: number, padStr?: string): string`

Pads the start of a string to a specified length.

**Parameters:**

- `str` - The string to pad
- `length` - The target length for the padded string
- `padStr` - Optional padding string (default: space `" "`). If omitted, uses a space.

**Example:**

```text
use { padStart } from @sentrie/string
let padded = string.padStart("5", 3, "0")  // "005"
```

#### `padEnd(str: string, length: number, padStr?: string): string`

Pads the end of a string to a specified length.

**Example:**

```text
use { padEnd } from @sentrie/string
let padded = string.padEnd("5", 3, "0")  // "500"
```

### Other Functions

#### `repeat(str: string, count: number): string`

Repeats a string a specified number of times.

**Parameters:**

- `str` - The string to repeat
- `count` - The number of times to repeat (must be non-negative)

**Returns:** The repeated string

**Throws:** Error if count is negative

**Example:**

```text
use { repeat } from @sentrie/string
let repeated = string.repeat("ha", 3)  // "hahaha"
```

#### `charAt(str: string, index: number): string`

Gets the character at a specific index in a string.

**Parameters:**

- `str` - The string
- `index` - The character index

**Returns:** The character at the specified index, or empty string if index is out of bounds

**Example:**

```text
use { charAt } from @sentrie/string
let char = string.charAt("Hello", 0)  // "H"
```

#### `length(str: string): number`

Gets the length of a string.

**Parameters:**

- `str` - The string

**Returns:** The length of the string (number of characters)

**Example:**

```text
use { length } from @sentrie/string
let len = string.length("Hello")  // 5
```

## Complete Example

```text
namespace com/example/validation

policy mypolicy {
  use { trim, toLowerCase, startsWith, includes, split } from @sentrie/string
  fact email!: string
  fact username!: string

  rule validateEmail = default false {
    let trimmed = string.trim(email)
    let lower = string.toLowerCase(trimmed)
    let hasAt = string.includes(lower, "@")
    let hasDomain = string.includes(lower, ".")
    yield hasAt and hasDomain
  }

  rule validateUsername = default false {
    let trimmed = string.trim(username)
    let parts = string.split(trimmed, " ")
    yield string.length(trimmed) >= 3 and string.length(parts) == 1
  }

  export decision of validateEmail
  export decision of validateUsername
}
```
