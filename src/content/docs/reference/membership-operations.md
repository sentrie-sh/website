---
title: Membership Operations
description: "Containment operators: in and contains (list, map, string)."
---

When you need to check whether a value appears in a list, a key exists in a map, or a substring appears in a string, you use `in` or `contains`. Both return a boolean. `needle in haystack` and `haystack contains needle` are equivalent—pick the one that reads better in your policy.

Here is the basic syntax:

```text
needle in haystack
haystack contains needle
```

**in:** Left = needle, right = haystack. True if haystack contains needle. **contains:** Left = haystack, right = needle. Same result; argument order reversed.

## Configuration & Arguments

You can test containment with these operators:

| Operator | Left | Right | What it does |
| :------- | :--- | :---- | :----------- |
| `in` | needle | haystack | True if haystack (string, list, or map) contains needle. |
| `contains` | haystack | needle | Same as above; argument order reversed. |

**String:** Both sides strings. True if needle is a non-empty substring of haystack.

**List:** Haystack is a list; needle is any value. True if any element equals needle (by `==`).

**Map:** Haystack is a map. If needle is a string, true if that key exists. If needle is a map, true if haystack has all keys from needle with the same values.

**Returns:** bool. Invalid or unsupported types yield false (or key-mismatch for map subset). No trinary.

---

## Examples in Action

### Checking substring and list membership

You want to see if a role string is in a list of roles, or if a substring appears in a longer string.

```sentrie
let in_str: bool = "foo" in "xfoobar"
let has_role: bool = "admin" in user.roles
let has_guest: bool = roles contains "guest"
```

### Checking map key presence and subset

You need to know if a key exists on a map, or if one map is a “subset” of another (all keys present with matching values).

```sentrie
let sub: bool = "admin" in roles
let key_exists: bool = "plan" in subscription
let subset: bool = {"a": 1, "b": 2} contains subscription
```

---

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** For strings, needle must be non-empty for a true result; empty needle → false. For lists, element-wise equality; no deep comparison beyond `equals`. For maps, needle string checks key presence; needle map requires every key in needle to exist in haystack with the same value; extra keys in haystack are allowed.
- **Edge case:** Type mismatch (e.g. haystack not string/list/map, or needle wrong type for map) → false. Empty list or empty string haystack → false. For regex matching on strings, use [matches](/reference/boolean-operations) in Boolean Operations.
