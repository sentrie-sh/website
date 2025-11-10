---
title: "@sentrie/uuid"
description: UUID generation
---

The `@sentrie/uuid` module provides functions for generating UUIDs (Universally Unique Identifiers).

## Usage

```text
use { v4, v6, v7 } from @sentrie/uuid
```

## Functions

### `v4(): string`

Generates a version 4 UUID (random UUID). Version 4 UUIDs are randomly generated and provide strong uniqueness guarantees.

**Returns:** A UUID string in standard format (e.g., `"550e8400-e29b-41d4-a716-446655440000"`)

**Example:**

```text
use { v4 } from @sentrie/uuid
let uuid = uuid.v4()  // "550e8400-e29b-41d4-a716-446655440000"
```

### `v6(): string`

Generates a version 6 UUID (time-ordered UUID). Version 6 UUIDs are time-ordered and provide better database indexing performance.

**Returns:** A UUID string in standard format (e.g., `"1b21dd213814000-8000-6000-0000-000000000000"`)

**Throws:** Error if UUID generation fails

**Example:**

```text
use { v6 } from @sentrie/uuid
let uuid = uuid.v6()  // Time-ordered UUID
```

### `v7(): string`

Generates a version 7 UUID (time-ordered UUID with Unix timestamp). Version 7 UUIDs are time-ordered and include a Unix timestamp for better sorting.

**Returns:** A UUID string in standard format (e.g., `"017f22e2-79b0-7cc3-8000-383fb6ef7b1a"`)

**Throws:** Error if UUID generation fails

**Example:**

```text
use { v7 } from @sentrie/uuid
let uuid = uuid.v7()  // Time-ordered UUID with Unix timestamp
```

## UUID Versions

### Version 4 (Random)

- **Use case:** General purpose, when you need strong uniqueness guarantees
- **Characteristics:** Randomly generated, no ordering
- **Performance:** Good for general use, but not optimal for database indexing

### Version 6 (Time-Ordered)

- **Use case:** When you need time-ordered UUIDs for better database performance
- **Characteristics:** Time-ordered, better for database indexing
- **Performance:** Better for database primary keys due to time ordering

### Version 7 (Time-Ordered with Unix Timestamp)

- **Use case:** When you need time-ordered UUIDs with Unix timestamp for sorting
- **Characteristics:** Time-ordered with Unix timestamp, best for sorting
- **Performance:** Best for database indexing and sorting operations

## Complete Example

```text
namespace com/example/resources

policy mypolicy {
  use { v4, v7 } from @sentrie/uuid
  fact resourceType!: string

  rule createResource = default false {
    let id = uuid.v4()
    let timeOrderedId = uuid.v7()
    yield id != "" and timeOrderedId != ""
  }

  export decision of createResource
}
```

## When to Use Each Version

### Use Version 4 (v4) when:

- You need general-purpose unique identifiers
- Ordering doesn't matter
- You want maximum randomness

### Use Version 6 (v6) when:

- You need time-ordered UUIDs
- Database indexing performance is important
- You want UUIDs that are roughly ordered by creation time

### Use Version 7 (v7) when:

- You need time-ordered UUIDs with Unix timestamp
- Sorting by creation time is important
- You want the best database indexing performance
- You need to extract timestamp information from the UUID

## UUID Format

All UUID versions follow the standard format:

```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Where each `x` is a hexadecimal digit (0-9, a-f).

## Security Considerations

- UUIDs are not cryptographically secure random numbers
- For security-sensitive applications, use proper cryptographic random number generators
- UUIDs are designed for uniqueness, not security
- Version 4 UUIDs provide good randomness but are not suitable for cryptographic purposes
