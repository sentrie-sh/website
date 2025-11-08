---
title: "@sentrie/json"
description: JSON marshaling and unmarshaling
---

The `@sentrie/json` module provides JSON marshaling (encoding) and unmarshaling (decoding) utilities. Functions take exactly one argument as specified.

## Usage

```text
use { marshal, unmarshal, isValid } from "@sentrie/json" as json
```

## Functions

### `marshal(value: any): string`

Marshals (encodes) a JavaScript value to a JSON string.

**Parameters:**

- `value` - The value to marshal (any JavaScript type: object, array, string, number, boolean, null)

**Returns:** The JSON string representation of the value

**Throws:** Error if the value cannot be marshaled (e.g., circular references)

**Example:**

```text
use { marshal } from "@sentrie/json" as json

let obj = {"name": "John", "age": 30}
let jsonStr = json.marshal(obj)  // '{"name":"John","age":30}'
```

### `unmarshal(str: string): any`

Unmarshals (decodes) a JSON string to a JavaScript value.

**Parameters:**

- `str` - The JSON string to unmarshal

**Returns:** The decoded value (object, array, string, number, boolean, or null)

**Throws:** Error if the JSON string is invalid or cannot be parsed

**Example:**

```text
use { unmarshal } from "@sentrie/json" as json

let jsonStr = '{"name":"John","age":30}'
let obj = json.unmarshal(jsonStr)  // {"name": "John", "age": 30}
```

### `isValid(str: string): boolean`

Validates whether a string is valid JSON.

**Parameters:**

- `str` - The JSON string to validate

**Returns:** `true` if the string is valid JSON, `false` otherwise

**Example:**

```text
use { isValid } from "@sentrie/json" as json

let valid = json.isValid('{"name":"John"}')  // true
let invalid = json.isValid('{"name":"John"}')  // false (missing closing brace in example)
```

## Complete Example

```text
namespace com/example/mypolicy

policy mypolicy {
  use { marshal, unmarshal, isValid } from "@sentrie/json" as json

  fact data!: document
  fact jsonString!: string

  rule processJson = default false {
    let jsonStr = json.marshal(data)
    let isValid = json.isValid(jsonString)
    let parsed = json.unmarshal(jsonString)
    yield isValid and parsed != null
  }

  export decision of processJson
}
```

## Common Use Cases

1. **Serializing data** - Convert Sentrie data structures to JSON strings for external APIs
2. **Deserializing data** - Parse JSON strings from external sources into Sentrie data structures
3. **Validating JSON** - Check if a string contains valid JSON before parsing
