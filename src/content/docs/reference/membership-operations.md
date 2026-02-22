---
title: Membership Operations
description: "Exhaustive reference for containment operators (in, contains) for list, map, and string; semantics and edge cases."
---

The `in` and `contains` operators test containment: whether a value appears in a list, a key exists in a map, a substring appears in a string, or (for maps) one map is a “subset” of another. Both return a boolean. `needle in haystack` and `haystack contains needle` are equivalent; only the argument order differs.

## Syntax

```text
needle in haystack
haystack contains needle
```

- **in:** Left operand = needle (the value to find), right operand = haystack (the container).
- **contains:** Left operand = haystack, right operand = needle. Same result as `in` with arguments swapped.

## Configuration & Arguments

| Operator | Left | Right | Result |
| :------- | :--- | :---- | :----- |
| `in` | needle | haystack | true if haystack contains needle; otherwise false. |
| `contains` | haystack | needle | Same as above; argument order reversed. |

**Returns:** bool. Not trinary. Type mismatch or unsupported combination yields false (or key-mismatch for map-subset case).

## Semantics by type

### String

- **Haystack:** string. **Needle:** string.
- **Result:** true if needle is a **non-empty** substring of haystack; false if needle is empty, or not a substring, or types are wrong.

### List

- **Haystack:** list. **Needle:** any value.
- **Result:** true if any element of the list is equal to needle (by `==`). Element-wise equality; no deep structural comparison beyond the language’s equality. Empty list → false.

### Map — key presence

- **Haystack:** map. **Needle:** string.
- **Result:** true if the map has a key equal to needle; false otherwise. Only key presence is checked; the value is irrelevant.

### Map — subset

- **Haystack:** map. **Needle:** map.
- **Result:** true if every key in needle exists in haystack and the corresponding values are equal (by `==`). Extra keys in haystack are allowed. If any key in needle is missing from haystack or any value differs, result is false.

## Examples in Action

### Substring and list membership

```sentrie
let in_str: bool = "foo" in "xfoobar"
let has_role: bool = "admin" in user.roles
let has_guest: bool = roles contains "guest"
```

### Map key presence and subset

```sentrie
let key_exists: bool = "plan" in subscription
let subset: bool = {"a": 1, "b": 2} contains subscription
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Strings:** Needle must be non-empty for a true result; empty needle → false. Empty string haystack → false (unless needle is also empty; then typically false by “non-empty substring” rule).
- **Lists:** Element-wise equality; no deep comparison beyond the language’s `==`. Empty list → false.
- **Maps (key):** Needle string checks key presence only. Map keys are strings.
- **Maps (subset):** Needle map: every key in needle must exist in haystack with the same value; extra keys in haystack are allowed. Type mismatch (e.g. haystack not a map, or needle not string/map) → false.
- **Regex:** For pattern matching on strings, use [matches](/reference/boolean-operations) in Boolean Operations.
