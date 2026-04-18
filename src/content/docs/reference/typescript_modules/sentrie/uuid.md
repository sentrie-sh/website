---
title: "@sentrie/uuid"
description: UUID generation (v4, v6, v7).
---


Generates UUIDs. v4: random; v6/v7: time-ordered. Use when you need unique identifiers or time-ordered IDs for indexing.

## Syntax

```text
use { v4, v6, v7 } from @sentrie/uuid [ as alias ]
alias.v4()
alias.v6()
alias.v7()
```

## Configuration & Arguments

| Function | Parameters | Required | Description                                        |
| :------- | :--------- | :------- | :------------------------------------------------- |
| `v4()`   | none       | -        | Random UUID (version 4).                           |
| `v6()`   | none       | -        | Time-ordered UUID (version 6).                     |
| `v7()`   | none       | -        | Time-ordered UUID with Unix timestamp (version 7). |

**Returns:** `string` - UUID in form `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. Throws on generation failure.

## Examples in Action

### Typical use

```text
use { v4, v7 } from @sentrie/uuid
let id = uuid.v4()
let timeId = uuid.v7()
```

### Going further

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
  fact resourceType!: string

  use { v4, v7 } from @sentrie/uuid

  rule createResource = default false {
    let id = uuid.v4()
    let timeOrderedId = uuid.v7()
    yield id != "" and timeOrderedId != ""
  }

  export decision of createResource
}
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- v4: random; no ordering. v6/v7: time-ordered for better DB indexing/sorting. v7 includes Unix timestamp.


- UUIDs are not cryptographically secure; use proper CSPRNG for security-sensitive randomness. Generation failure throws.
