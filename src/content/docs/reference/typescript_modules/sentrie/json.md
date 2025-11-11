---
title: "@sentrie/json"
description: JSON validation utility
---

The `@sentrie/json` module provides JSON validation utilities. For JSON parsing and stringification, use the `@sentrie/js` module.

## Usage

```text
use { isValid } from @sentrie/json
```

## Functions

### `isValid(str: string): boolean`

Validates whether a string is valid JSON.

**Parameters:**

- `str` - The JSON string to validate

**Returns:** `true` if the string is valid JSON, `false` otherwise

**Example:**

```text
use { isValid } from @sentrie/json

let jsonStr = '{"name": "John", "age": 30}'
let isValid = json.isValid(jsonStr)  // true

let invalidStr = '{"name": "John", "age":}'
let isInvalid = json.isValid(invalidStr)  // false
```

## JSON Parsing and Stringification

For JSON parsing and stringification, use the `@sentrie/js` module:

```text
use { parse, stringify } from "@sentrie/js" as json

let obj = json.parse('{"name": "John", "age": 30}')
let str = json.stringify({"name": "John", "age": 30})
```

See the [@sentrie/js](/reference/typescript_modules/@sentrie/js) documentation for more information.

## Complete Example

```text
namespace com/example/mypolicy

policy mypolicy {
  use { isValid } from @sentrie/json as jsonUtil
  use { parse, stringify } from "@sentrie/js" as json

  fact data!: string

  rule processData = default false {
    let isValid = jsonUtil.isValid(data)
    if isValid {
      let parsed = json.parse(data)
      let serialized = json.stringify(parsed)
      yield serialized != ""
    } else {
      yield false
    }
  }

  export decision of processData
}
```

