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

## Parameters

| Function | Parameters | Required | Description                                        |
| :------- | :--------- | :------- | :------------------------------------------------- |
| `v4()`   | none       | -        | Random UUID (version 4).                           |
| `v6()`   | none       | -        | Time-ordered UUID (version 6).                     |
| `v7()`   | none       | -        | Time-ordered UUID with Unix timestamp (version 7). |

**Returns:** `string` - UUID in form `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. Throws on generation failure.

## Examples

### Basic Usage

```text
use { v4, v7 } from @sentrie/uuid
let id = uuid.v4()
let timeId = uuid.v7()
```

### Advanced Usage

```text
use { v4, v7 } from @sentrie/uuid
rule createResource = default false {
  let id = uuid.v4()
  let timeOrderedId = uuid.v7()
  yield id != "" and timeOrderedId != ""
}
```

## Behavior & Constraints

- v4: random; no ordering. v6/v7: time-ordered for better DB indexing/sorting. v7 includes Unix timestamp.

## Constraints & Edge Cases

- UUIDs are not cryptographically secure; use proper CSPRNG for security-sensitive randomness. Generation failure throws.
