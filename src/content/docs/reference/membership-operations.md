---
title: Membership Operations
description: "Containment operators: in and contains (list, map, string)."
---


`in` and `contains` test whether a value is contained in a collection or string. Both return a boolean. `needle in haystack` and `haystack contains needle` are equivalent; use whichever reads more naturally.

## Syntax

```text
needle in haystack
haystack contains needle
```

- **in:** Left = needle, right = haystack. True if haystack contains needle.
- **contains:** Left = haystack, right = needle. True if haystack contains needle.

## Reference

| Operator | Left | Right | Description |
| :--- | :--- | :--- | :--- |
| `in` | needle | haystack | True if haystack (string, list, or map) contains needle. |
| `contains` | haystack | needle | Same as above; argument order reversed. |

**String:** Haystack and needle are strings. True if needle is a non-empty substring of haystack.

**List:** Haystack is a list; needle is any value. True if any element equals needle (by `==`).

**Map:** Haystack is a map. If needle is a string, true if that key exists. If needle is a map, true if haystack has all keys from needle and the corresponding values are equal.

**Returns:** bool. No trinary; invalid or unsupported types yield false (or key-mismatch for map subset).

## Examples

### Basic Usage

```sentrie
let in_str: bool = "foo" in "xfoobar"
let has_role: bool = "admin" in user.roles
let has_guest: bool = roles contains "guest"
```

### Advanced Usage

```sentrie
let sub: bool = "admin" in roles
let key_exists: bool = "plan" in subscription
let subset: bool = {"a": 1, "b": 2} contains subscription
```

## Behavior & Constraints

- **String:** Needle must be non-empty string for a true result; empty needle → false. Substring is contiguous.
- **List:** Element-wise equality; no deep comparison of nested structures beyond `equals`.
- **Map (key):** Needle string checks key presence only.
- **Map (subset):** Needle map: every key in needle must exist in haystack with the same value; extra keys in haystack are allowed.

## Constraints & Edge Cases

- Type mismatch (e.g. needle not string/list/map when haystack is map, or haystack not string/list/map) → false.
- For regex matching on strings, use [matches](/reference/boolean-operations) in Boolean Operations.
- Empty list or empty string haystack → false. For string containment, needle must be non-empty.
