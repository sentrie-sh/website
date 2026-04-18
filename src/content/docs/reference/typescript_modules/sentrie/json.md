---
title: "@sentrie/json"
description: JSON validation. For parse/stringify use @sentrie/js.
---


Provides `isValid` to check if a string is valid JSON. For parsing and stringifying use [@sentrie/js](/reference/typescript_modules/sentrie/js).

## Syntax

```text
use { isValid } from @sentrie/json [ as alias ]
alias.isValid(str)
```

## Configuration & Arguments

| Name  | Type   | Required | Description                 |
| :---- | :----- | :------- | :-------------------------- |
| `str` | string | Yes      | String to validate as JSON. |

**Returns:** `boolean` - true if the string is valid JSON, false otherwise.

## Examples in Action

### Typical use

```text
use { isValid } from @sentrie/json as jsonUtil
let ok = jsonUtil.isValid('{"name": "John", "age": 30}')
let bad = jsonUtil.isValid('{"name": "John", "age":}')
```

### Going further

```text
use { isValid } from @sentrie/json as jsonUtil
use { parse, stringify } from @sentrie/js as json

let obj = json.parse('{"name": "John", "age": 30}')
let str = json.stringify({"name": "John", "age": 30})
```

See the [@sentrie/js](/reference/typescript_modules/sentrie/js) documentation for more information.

## Complete Example

```text
namespace com/example/mypolicy

policy mypolicy {
  fact data!: string

  use { isValid } from @sentrie/json as jsonUtil
  use { parse, stringify } from @sentrie/js as json

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

## Good to Know

Before you implement this, keep a few boundaries in mind:

- Only validates syntax; does not parse. Use `@sentrie/js` for `parse` and `stringify`.


- Empty string is not valid JSON. Invalid UTF-8 or malformed structure returns false.
