---
title: "@sentrie/time"
description: Date and time manipulation
---

The `@sentrie/time` module provides date and time manipulation utilities. All timestamps are Unix timestamps (seconds since epoch).

## Usage

```text
use { now, parse, format, addDuration, subtractDuration } from @sentrie/time
```

## Constants

- **`RFC3339`** - RFC3339 date format: `"2006-01-02T15:04:05Z07:00"`
- **`RFC3339Nano`** - RFC3339Nano date format: `"2006-01-02T15:04:05.999999999Z07:00"`
- **`RFC1123`** - RFC1123 date format: `"Mon, 02 Jan 2006 15:04:05 MST"`
- **`RFC1123Z`** - RFC1123Z date format: `"Mon, 02 Jan 2006 15:04:05 -0700"`
- **`RFC822`** - RFC822 date format: `"02 Jan 06 15:04 MST"`
- **`RFC822Z`** - RFC822Z date format: `"02 Jan 06 15:04 -0700"`

## Functions

### `now(): number`

Returns the current timestamp as a Unix timestamp. Within a single execution context, this returns the same value for consistency.

**Returns:** Unix timestamp (seconds since epoch) as a number

**Example:**

```text
use { now } from @sentrie/time
let currentTime = time.now()  // Current Unix timestamp
```

### `parse(str: string): number`

Parses a date string and returns a Unix timestamp. Supports RFC3339 and RFC3339Nano formats.

**Parameters:**

- `str` - The date string to parse (e.g., `"2006-01-02T15:04:05Z07:00"`)

**Returns:** Unix timestamp (seconds since epoch) as a number

**Throws:** Error if the date string cannot be parsed

**Example:**

```text
use { parse } from @sentrie/time
let timestamp = time.parse("2024-01-01T00:00:00Z")
```

### `format(timestamp: number, formatStr: string): string`

Formats a Unix timestamp as a string using the specified format. Format uses Go's time format reference time: `Mon Jan 2 15:04:05 MST 2006`.

**Parameters:**

- `timestamp` - Unix timestamp (seconds since epoch)
- `formatStr` - Format string (e.g., `"2006-01-02 15:04:05"`)

**Returns:** Formatted date string

**Example:**

```text
use { format, now } from @sentrie/time
let timestamp = time.now()
let formatted = time.format(timestamp, "2006-01-02 15:04:05")
```

### `isBefore(ts1: number, ts2: number): boolean`

Checks if the first timestamp is before the second timestamp.

**Parameters:**

- `ts1` - First Unix timestamp
- `ts2` - Second Unix timestamp

**Returns:** `true` if `ts1 < ts2`, `false` otherwise

**Example:**

```text
use { isBefore, now } from @sentrie/time
let now = time.now()
let past = now - 3600
let isBefore = time.isBefore(past, now)  // true
```

### `isAfter(ts1: number, ts2: number): boolean`

Checks if the first timestamp is after the second timestamp.

**Parameters:**

- `ts1` - First Unix timestamp
- `ts2` - Second Unix timestamp

**Returns:** `true` if `ts1 > ts2`, `false` otherwise

**Example:**

```text
use { isAfter, now } from @sentrie/time
let now = time.now()
let future = now + 3600
let isAfter = time.isAfter(future, now)  // true
```

### `isBetween(ts: number, start: number, end: number): boolean`

Checks if a timestamp is between two other timestamps (inclusive).

**Parameters:**

- `ts` - The timestamp to check
- `start` - Start timestamp (inclusive)
- `end` - End timestamp (inclusive)

**Returns:** `true` if `start <= ts <= end`, `false` otherwise

**Example:**

```text
use { isBetween, now } from @sentrie/time
let now = time.now()
let start = now - 3600
let end = now + 3600
let isBetween = time.isBetween(now, start, end)  // true
```

### `addDuration(timestamp: number, durationStr: string): number`

Adds a duration to a timestamp. Duration string format: `"1h30m"` (1 hour 30 minutes), `"2d"` (2 days), `"5s"` (5 seconds), etc.

**Parameters:**

- `timestamp` - Unix timestamp (seconds since epoch)
- `durationStr` - Duration string (e.g., `"1h"`, `"30m"`, `"2h30m"`, `"1d"`)

**Returns:** New Unix timestamp after adding the duration

**Throws:** Error if the duration string format is invalid

**Example:**

```text
use { addDuration, now } from @sentrie/time
let now = time.now()
let future = time.addDuration(now, "2h30m")  // 2 hours 30 minutes later
```

### `subtractDuration(timestamp: number, durationStr: string): number`

Subtracts a duration from a timestamp. Duration string format: `"1h30m"` (1 hour 30 minutes), `"2d"` (2 days), `"5s"` (5 seconds), etc.

**Parameters:**

- `timestamp` - Unix timestamp (seconds since epoch)
- `durationStr` - Duration string (e.g., `"1h"`, `"30m"`, `"2h30m"`, `"1d"`)

**Returns:** New Unix timestamp after subtracting the duration

**Throws:** Error if the duration string format is invalid

**Example:**

```text
use { subtractDuration, now } from @sentrie/time
let now = time.now()
let past = time.subtractDuration(now, "1h")  // 1 hour earlier
```

### `unix(timestamp: number): number`

Converts a Unix timestamp to a Unix timestamp (identity function for API consistency).

**Parameters:**

- `timestamp` - Unix timestamp (seconds since epoch)

**Returns:** The same Unix timestamp

## Duration Format

Duration strings support the following units:

- **`s`** - seconds
- **`m`** - minutes
- **`h`** - hours
- **`d`** - days

Examples:

- `"30s"` - 30 seconds
- `"5m"` - 5 minutes
- `"2h"` - 2 hours
- `"1d"` - 1 day
- `"2h30m"` - 2 hours 30 minutes
- `"1d5h30m"` - 1 day 5 hours 30 minutes

## Complete Example

```text
namespace com/example/access

policy mypolicy {
  use { now, isBefore, addDuration, format } from @sentrie/time
  fact tokenExpiry!: number

  rule checkTokenExpiry = default false {
    let currentTime = time.now()
    let isExpired = time.isBefore(tokenExpiry, currentTime)
    yield not isExpired
  }

  rule calculateExpiry = default false {
    let currentTime = time.now()
    let expiry = time.addDuration(currentTime, "24h")
    let formatted = time.format(expiry, "2006-01-02 15:04:05")
    yield expiry > currentTime
  }

  export decision of checkTokenExpiry
  export decision of calculateExpiry
}
```

## Format Reference

The `format` function uses Go's time format reference time: `Mon Jan 2 15:04:05 MST 2006`

Common format patterns:

- `"2006-01-02"` - Date: `2006-01-02`
- `"15:04:05"` - Time: `15:04:05`
- `"2006-01-02 15:04:05"` - Date and time: `2006-01-02 15:04:05`
- `"Mon, 02 Jan 2006 15:04:05 MST"` - RFC1123 format
