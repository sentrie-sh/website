---
title: Collection Operations
description: "Exhaustive reference for quantifiers and transformers (any, all, filter, map, reduce, count, distinct); syntax, parameters, and edge cases."
---

Collection operations apply to lists and maps. They are declarative: they return new values or new collections and do not mutate the input. Syntax uses a block with a single `yield` per iteration. The collection is iterated in order (list order or map iteration order); for `reduce`, an initial value is combined with each element via the yielded expression.

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

- **element, index:** Loop variables. For lists, element is the item and index is the position (0-based). For maps, element and index semantics are implementation-defined (e.g. key-value pair or value and key). The index parameter may be optional in some forms.
- **acc, element, index:** For `reduce`, `acc` is the accumulator (initial value on first iteration, then the previous `yield` result), `element` is the current element, and `index` is the position/key as above.

## Configuration & Arguments

| Operation  | Input               | Output          | Description                                                                                                                                             |
| :--------- | :------------------ | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `any`      | collection          | bool/trinary    | true if at least one element yields a truthy value. Short-circuits: iteration stops at first truthy. Empty collection → false.                          |
| `all`      | collection          | bool/trinary    | true if every element yields a truthy value. Short-circuits: iteration stops at first falsy. Empty collection → true.                                   |
| `filter`   | collection          | same type       | New collection containing only elements for which the block yields truthy.                                                                              |
| `map`      | collection          | list            | New list whose elements are the yielded values (one per element). Type of each yield can be any type.                                                   |
| `reduce`   | collection, initial | type of initial | Fold: start with `acc = initial`; for each element, set `acc` to the yielded expression. Final `acc` is the result. Empty collection → returns initial. |
| `count`    | collection          | number          | Number of elements in the collection. Empty → 0.                                                                                                        |
| `distinct` | collection          | same type       | New collection with duplicate elements removed. Equality for deduplication is by the language’s `==`.                                                   |

**Returns:** As in the table. For `any`/`all`, the result is the trinary/boolean produced by the predicate. For `filter`/`map`/`distinct`, the result is a new collection (or list for `map`). For `reduce`, the result is the final accumulator. For `count`, the result is a number.

## Block and yield rules

- **any, all, filter:** The block must yield a value that is interpreted as truthy or falsy (trinary/boolean). One yield per iteration. The block is evaluated once per element.
- **map:** The block must yield an expression per iteration. The type of the yielded value can be any type; the result is a list of those values.
- **reduce:** The block must yield an expression that becomes the next accumulator. First iteration: `acc` is `initial`. Subsequent iterations: `acc` is the previous yield. The final yield (after the last element) is the result of `reduce`.

## Empty collection behavior

| Operation  | Empty collection result |
| :--------- | :---------------------- |
| `any`      | false                   |
| `all`      | true                    |
| `filter`   | empty collection        |
| `map`      | empty list              |
| `reduce`   | initial (unchanged)     |
| `count`    | 0                       |
| `distinct` | empty collection        |

## Examples in Action

### any, all, filter, map, reduce, count, distinct

```sentrie
let has_even: bool = any numbers as num, idx { yield num % 2 == 0 }
let all_even: bool = all numbers as num, idx { yield num % 2 == 0 }
let evens: list[number] = filter numbers as num, idx { yield num % 2 == 0 }
let doubled: list[number] = map numbers as num, idx { yield num * 2 }
let sum: number = reduce numbers from 0 as acc, num, idx { yield acc + num }
let n: number = count numbers
let uniq: list[number] = distinct numbers
```

### reduce with initial and multiple uses

```sentrie
let sum: number = reduce scores from 0 as acc, score, idx { yield acc + score }
let avg: number = sum / count scores
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Applicability:** Only valid on collections (lists, maps). The original collection is not modified.
- **Block:** Must yield once per iteration. For `any`/`all`/`filter` the yield is a predicate (trinary/boolean); for `map`/`reduce` the yield is an expression that becomes the new value or accumulator.
- **Empty collection:** `any` → false, `all` → true, `filter`/`map`/`distinct` → empty result, `count` → 0, `reduce` → initial.
- **Reduce:** First iteration uses `initial` as `acc`; each subsequent iteration uses the previous `yield` result as `acc`.
