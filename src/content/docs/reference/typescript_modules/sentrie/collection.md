---
title: "@sentrie/collection"
description: List and map manipulation utilities
---

The `@sentrie/collection` module provides utilities for both list/array and map/object manipulation and operations. Functions are prefixed with `list_` for list operations and `map_` for map operations.

## Usage

```text
use { list_includes, map_keys, map_get } from @sentrie/collection
```

## List Functions

### `list_includes(arr: any[], item: any): boolean`

Checks if an array includes a specific item. Uses deep equality comparison.

**Parameters:**

- `arr` - The array to search in
- `item` - The item to search for

**Returns:** `true` if the item is found in the array, `false` otherwise

**Example:**

```text
use { list_includes } from @sentrie/collection
let numbers = [1, 2, 3, 4, 5]
let hasThree = collection.list_includes(numbers, 3)  // true
```

### `list_indexOf(arr: any[], item: any): number`

Finds the first index of an item in an array. Uses deep equality comparison.

**Parameters:**

- `arr` - The array to search in
- `item` - The item to search for

**Returns:** The index of the first occurrence, or `-1` if not found

**Example:**

```text
use { list_indexOf } from @sentrie/collection
let numbers = [1, 2, 3, 4, 5]
let idx = collection.list_indexOf(numbers, 3)  // 2
```

### `list_lastIndexOf(arr: any[], item: any): number`

Finds the last index of an item in an array. Uses deep equality comparison.

**Parameters:**

- `arr` - The array to search in
- `item` - The item to search for

**Returns:** The index of the last occurrence, or `-1` if not found

### `list_sort(arr: any[]): any[]`

Sorts an array in ascending order. Sorts numbers numerically and strings lexicographically.

**Parameters:**

- `arr` - The array to sort

**Returns:** A new sorted array (original array is not modified)

**Throws:** Error if the input is not an array

**Example:**

```text
use { list_sort } from @sentrie/collection
let numbers = [3, 1, 4, 1, 5]
let sorted = collection.list_sort(numbers)  // [1, 1, 3, 4, 5]
```

### `list_unique(arr: any[]): any[]`

Removes duplicate values from an array. Uses equality comparison to detect duplicates.

**Parameters:**

- `arr` - The array to deduplicate

**Returns:** A new array with unique values (original array is not modified)

**Throws:** Error if the input is not an array

**Example:**

```text
use { list_unique } from @sentrie/collection
let numbers = [1, 2, 2, 3, 3, 3]
let unique = collection.list_unique(numbers)  // [1, 2, 3]
```

### `list_chunk(arr: any[], size: number): any[][]`

Splits an array into chunks of a specified size.

**Parameters:**

- `arr` - The array to chunk
- `size` - The size of each chunk (must be positive)

**Returns:** Array of chunks, where each chunk is an array of the specified size (except possibly the last)

**Throws:** Error if the input is not an array or size is not positive

**Example:**

```text
use { list_chunk } from @sentrie/collection
let numbers = [1, 2, 3, 4, 5, 6]
let chunks = collection.list_chunk(numbers, 2)  // [[1, 2], [3, 4], [5, 6]]
```

### `list_flatten(arr: any[]): any[]`

Flattens a nested array structure by one level or recursively.

**Parameters:**

- `arr` - The nested array to flatten

**Returns:** A new flattened array (original array is not modified)

**Throws:** Error if the input is not an array

**Example:**

```text
use { list_flatten } from @sentrie/collection
let nested = [[1, 2], [3, 4], [5, 6]]
let flat = collection.list_flatten(nested)  // [1, 2, 3, 4, 5, 6]
```

## Map Functions

### `map_keys(map: Record<string, any>): any[]`

Gets all keys from a map/object.

**Parameters:**

- `map` - The map/object to extract keys from

**Returns:** Array of all keys in the map

**Throws:** Error if the input is not a map

**Example:**

```text
use { map_keys } from @sentrie/collection
let user = {"name": "John", "age": 30, "role": "admin"}
let keys = collection.map_keys(user)  // ["name", "age", "role"]
```

### `map_values(map: Record<string, any>): any[]`

Gets all values from a map/object.

**Parameters:**

- `map` - The map/object to extract values from

**Returns:** Array of all values in the map

**Throws:** Error if the input is not a map

**Example:**

```text
use { map_values } from @sentrie/collection
let user = {"name": "John", "age": 30, "role": "admin"}
let values = collection.map_values(user)  // ["John", 30, "admin"]
```

### `map_entries(map: Record<string, any>): [any, any][]`

Gets all key-value pairs from a map/object as an array of `[key, value]` tuples.

**Parameters:**

- `map` - The map/object to extract entries from

**Returns:** Array of `[key, value]` pairs

**Throws:** Error if the input is not a map

**Example:**

```text
use { map_entries } from @sentrie/collection
let user = {"name": "John", "age": 30}
let entries = collection.map_entries(user)  // [["name", "John"], ["age", 30]]
```

### `map_has(map: Record<string, any>, key: any): boolean`

Checks if a map/object contains a specific key.

**Parameters:**

- `map` - The map/object to check
- `key` - The key to check for

**Returns:** `true` if the key exists in the map, `false` otherwise

**Example:**

```text
use { map_has } from @sentrie/collection
let user = {"name": "John", "age": 30}
let hasName = collection.map_has(user, "name")  // true
let hasEmail = collection.map_has(user, "email")  // false
```

### `map_get(map: Record<string, any>, key: any, defaultValue?: any): any`

Gets a value from a map/object by key, with an optional default value.

**Parameters:**

- `map` - The map/object to get the value from
- `key` - The key to look up
- `defaultValue` - Optional default value to return if the key is not found

**Returns:** The value associated with the key, or the default value if the key is not found (or `undefined` if no default provided)

**Example:**

```text
use { map_get } from @sentrie/collection
let user = {"name": "John", "age": 30}
let name = collection.map_get(user, "name")  // "John"
let email = collection.map_get(user, "email", "unknown")  // "unknown"
```

### `map_size(map: Record<string, any>): number`

Gets the number of key-value pairs in a map/object.

**Parameters:**

- `map` - The map/object to get the size of

**Returns:** The number of entries in the map

**Throws:** Error if the input is not a map

**Example:**

```text
use { map_size } from @sentrie/collection
let user = {"name": "John", "age": 30, "role": "admin"}
let size = collection.map_size(user)  // 3
```

### `map_isEmpty(map: Record<string, any>): boolean`

Checks if a map/object is empty (has no entries).

**Parameters:**

- `map` - The map/object to check

**Returns:** `true` if the map has no entries, `false` otherwise

**Throws:** Error if the input is not a map

**Example:**

```text
use { map_isEmpty } from @sentrie/collection
let empty = {}
let notEmpty = {"name": "John"}
let isEmpty1 = collection.map_isEmpty(empty)  // true
let isEmpty2 = collection.map_isEmpty(notEmpty)  // false
```

### `map_merge(map1: Record<string, any>, map2: Record<string, any>, ...maps: Record<string, any>[]): Record<string, any>`

Merges multiple maps/objects into a single map. Later maps override earlier maps if they have the same keys.

**Parameters:**

- `map1` - The first map/object
- `map2` - The second map/object
- `...maps` - Additional maps/objects to merge

**Returns:** A new merged map (original maps are not modified)

**Throws:** Error if any argument is not a map

**Example:**

```text
use { map_merge } from @sentrie/collection
let user1 = {"name": "John", "age": 30}
let user2 = {"age": 31, "role": "admin"}
let merged = collection.map_merge(user1, user2)  // {"name": "John", "age": 31, "role": "admin"}
```

## Complete Example

```text
namespace com/example/mypolicy

policy mypolicy {
  use { list_includes, list_sort, map_keys, map_get } from @sentrie/collection
  fact numbers!: list[number]
  fact user!: document

  rule myrule = default false {
    let sorted = collection.list_sort(numbers)
    let hasFive = collection.list_includes(sorted, 5)
    let userKeys = collection.map_keys(user)
    let userName = collection.map_get(user, "name", "Unknown")
    yield hasFive and userName != "Unknown"
  }

  export decision of myrule
}
```
