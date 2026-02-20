---
title: Collection Operations
description: "Quantifiers and transformers: any, all, filter, map, reduce, count, distinct."
---


Collection operations apply to lists and maps. They are declarative: they return new values or collections and do not mutate the input. Syntax uses a block with `yield`.

## Syntax

```text
any collection as element, index { yield trinary }
all collection as element, index { yield trinary }
filter collection as element, index { yield trinary }
map collection as element, index { yield expr }
reduce collection from initial as acc, element, index { yield expr }
count collection
distinct collection
```

Index parameter is optional in some forms. For maps, element is key-value or value depending on operation.

## Parameters

| Operation | Input | Output | Description |
| :--- | :--- | :--- | :--- |
| `any` | collection | bool/trinary | True if at least one element yields truthy. |
| `all` | collection | bool/trinary | True if all elements yield truthy. |
| `filter` | collection | same type | New collection of elements for which yield is truthy. |
| `map` | collection | list | New list of yield values. |
| `reduce` | collection, initial | type of initial | Fold: acc = initial, then acc = yield for each element. |
| `count` | collection | number | Number of elements. |
| `distinct` | collection | same type | New collection with duplicates removed. |

**Returns:** As in table. Empty collection: `any` false, `all` true, `count` 0. Reduce with empty collection returns initial.

## Examples

### Basic Usage

```sentrie
let has_even: bool = any numbers as num, idx { yield num % 2 == 0 }
let all_even: bool = all numbers as num, idx { yield num % 2 == 0 }
let evens: list[number] = filter numbers as num, idx { yield num % 2 == 0 }
let doubled: list[number] = map numbers as num, idx { yield num * 2 }
let sum: number = reduce numbers from 0 as acc, num, idx { yield acc + num }
let n: number = count numbers
let uniq: list[number] = distinct numbers
```

### Advanced Usage

```sentrie
let sum: number = reduce scores from 0 as acc, score, idx { yield acc + score }
let avg: number = sum / count scores
```

## Behavior & Constraints

- Only valid on collections (lists, maps). Original collection is not modified.
- Block must yield once per iteration. Type of yield must match (trinary for any/all/filter predicate; expr for map/reduce).

## Constraints & Edge Cases

- Empty collection: `any` → false, `all` → true, `filter`/`map`/`distinct` → empty, `count` → 0, `reduce` → initial.
- Reduce: first iteration uses initial as acc; subsequent use previous yield as acc.
