---
title: Built-in Functions
description: Reference for Sentrie builtins—collections, list transforms, and helpers—available without TypeScript imports.
---

Sentrie provides a set of built-in functions that are always available without any imports. These functions are optimized for performance and are commonly used operations. For call syntax, TypeScript imports, and memoization, see [Using Functions](/reference/functions).

Some builtins take extra arguments that are **callables**—values you write inline, such as `(param) => { ... }` or `(param, index) => { ... }`, using `yield` for each step's result. That is the same idea as passing any other value; see [Lambdas](/reference/#lambdas) for callable syntax and arity rules.

## `count(value) => number`

Returns the number of elements in a collection or the length of a string.

The `count` function accepts a list, dict, or string and returns the number of elements or characters.

**Examples:**

- `count([1, 2, 3])` → `3`
- `count("hello")` → `5`
- `count({"a": 1, "b": 2})` → `2`

```sentrie
let items: list[string] = ["apple", "banana", "cherry"]
let itemCount = count(items)  -- Returns 3
```

## `merge(dict1, dict2) => dict[string]any`

Recursively merges two dict values into a new dict.

The `merge` function combines two dict values, with values from the second dict overwriting values from the first. **Nested dicts are merged recursively rather than being replaced entirely.**

**Examples:**

- `merge({"a": 1}, {"b": 2})` → `{"a": 1, "b": 2}`
- `merge({"a": {"x": 1}}, {"a": {"y": 2}})` → `{"a": {"x": 1, "y": 2}}`

```sentrie
let userData = {"name": "Alice", "age": 30}
let additionalData = {"age": 31, "role": "admin"}
let combined = merge(userData, additionalData)
-- Returns {"name": "Alice", "age": 31, "role": "admin"}
```

## `error(format, args...) => error`

Short-circuits execution and returns an error with a formatted message.

The `error` function immediately stops execution and returns an error. It supports format strings similar to `fmt.Printf` in Go. If only one argument is provided, it's treated as the error message directly.

**Examples:**

- `error("required value undefined")`
- `error("Invalid value: %v", value)`

```sentrie
let role = user.role is defined ? user.role : error("user role must be provided")
```

### `undefined` vs `error`

When the `error` function is called, it immediately stops the evaluation of the current policy and returns an error result. This mechanism is intended for situations where continuing evaluation no longer makes sense due to invalid, unexpected, or strictly disallowed conditions—such as missing required input, encountering data corruption, or detecting an explicit policy violation.

Deciding between returning `error` or `undefined` depends on intent:
- Use `error` when the policy must explicitly fail and the issue should be surfaced.
- Use `undefined` when a missing value or recoverable situation occurs that does not require global failure—so the policy can potentially continue or gracefully handle the absence.

In summary:  
- `undefined` means “no value available” but may allow further evaluation or fallback via `elvis` or `ternary` operators.  
- `error` signals a non-recoverable state where the policy cannot safely proceed and must abort immediately.

## `as_list(value) => list[any]`

Normalizes "one-or-many" inputs by wrapping non-list values in a single-element list.

The `as_list` function takes a single value and ensures it's a list. If the input is already a list, it returns it unchanged. If the input is not a list, it wraps it in a single-element list.

**Examples:**

- `as_list(42)` → `[42]`
- `as_list("hello")` → `["hello"]`
- `as_list([1, 2, 3])` → `[1, 2, 3]`

```sentrie
let single_value = 42
let as_list_value = as_list(single_value)  -- Returns [42]

let already_list = [1, 2, 3]
let unchanged = as_list(already_list)  -- Returns [1, 2, 3]
```

**Note:** If the input contains `undefined` values, the function returns `undefined`.

## `flatten(list, depth?) => list[any]`

Flattens nested lists to a controlled depth.

The `flatten` function takes a list and optionally a depth parameter, and flattens nested lists up to the specified depth. The default depth is 1 if not specified.

**Examples:**

- `flatten([[1, 2], [3, 4]])` → `[1, 2, 3, 4]` (default depth 1)
- `flatten([[1, 2], [3, 4]], 1)` → `[1, 2, 3, 4]`
- `flatten([[[1, 2]], [[3, 4]]], 2)` → `[1, 2, 3, 4]`
- `flatten([1, 2, 3], 0)` → `[1, 2, 3]` (no flattening)

```sentrie
let nested = [[1, 2], [3, 4], [5]]
let flattened = flatten(nested)  -- Returns [1, 2, 3, 4, 5]

let deeply_nested = [[[1, 2]], [[3, 4]]]
let flattened_deep = flatten(deeply_nested, 2)  -- Returns [1, 2, 3, 4]
```

**Note:** If the input contains `undefined` values, the function returns `undefined`.

## `flatten_deep(list) => list[any]`

Recursively flattens nested lists to arbitrary depth.

The `flatten_deep` function takes a list and recursively flattens all nested lists, regardless of nesting depth.

**Examples:**

- `flatten_deep([[1, 2], [3, [4, 5]]])` → `[1, 2, 3, 4, 5]`
- `flatten_deep([[[1]], [[2, 3]], [4]])` → `[1, 2, 3, 4]`

```sentrie
let deeply_nested = [[1, [2, [3, 4]]], [5, 6]]
let fully_flattened = flatten_deep(deeply_nested)  -- Returns [1, 2, 3, 4, 5, 6]
```

**Note:** If the input contains `undefined` values, the function returns `undefined`.

## `normalise_list(value) => list[any]`

Normalizes messy list inputs with one level of nesting.

The `normalise_list` function first applies `as_list` to wrap non-list values, then flattens exactly one level of nesting. It errors if the input contains deeper than one level of nesting.

**Examples:**

- `normalise_list(42)` → `[42]` (wrapped, then no flattening needed)
- `normalise_list([1, 2, 3])` → `[1, 2, 3]` (already flat)
- `normalise_list([[1, 2], [3, 4]])` → `[1, 2, 3, 4]` (one level flattened)
- `normalise_list([[[1, 2]]])` → Error (deeper than one level)

```sentrie
let mixed_input = [[1, 2], 3, [4, 5]]
let normalized = normalise_list(mixed_input)  -- Returns [1, 2, 3, 4, 5]
```

**Note:** If the input contains `undefined` values, the function returns `undefined`.

## List builtins

Builtins `any`, `all`, `filter`, `first`, `collect`, `reduce`, and `distinct` work on **lists**. They take a list as the first argument (except `reduce`, which also takes an initial accumulator, and `distinct`, which can take an optional second argument that is a callable).

- For `any`, `all`, `filter`, and `first`, the callable argument uses **arity 1 or 2** (element, optional index) and should yield a **trinary/boolean** interpretation for truthiness.
- `collect` uses arity 1 or 2; each yield is the next element of the result list.
- `reduce` uses a callable with **arity 2 or 3** (`accumulator`, `element`, optional `index`).
- `distinct` with one argument deduplicates by **scalar identity** of elements. With two arguments, the second is a callable that produces a key; the key must be a supported scalar kind (`string`, `number`, `boolean`, `trinary`, `null`, or `undefined`).

These operations return **new lists** (or scalars for `any`, `all`, `reduce`, `first`) and do not mutate the input.

The **`dict[T]`** type describes JSON-like objects with string keys and values of type `T`. List transforms use the **`collect(...)`** builtin; `dict[...]` is only for types.

### `any(list, predicate)`

Returns whether **at least one** element satisfies the predicate.

```sentrie
any(list, (element) => { yield expression })
any(list, (element, index) => { yield expression })
```

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5]
let has_even: bool = any(numbers, (num, idx) => {
  yield num % 2 == 0
})

let scores: list[number] = [85, 92, 78, 96, 85]
let has_perfect_score: bool = any(scores, (score) => {
  yield score == 100
})

shape User {
  name: string
  age: number
  role: string
}

let users: list[User] = [
  { name: "Alice", age: 25, role: "admin" },
  { name: "Bob", age: 30, role: "user" }
]

let has_admin: bool = any(users, (user) => {
  yield user.role == "admin"
})
```

### `all(list, predicate)`

Returns whether **every** element satisfies the predicate.

```sentrie
all(list, (element) => { yield expression })
all(list, (element, index) => { yield expression })
```

```sentrie
let numbers: list[number] = [2, 4, 6, 8, 10]
let all_even: bool = all(numbers, (num) => {
  yield num % 2 == 0
})

let scores: list[number] = [85, 92, 78, 96, 85]
let all_passing: bool = all(scores, (score) => {
  yield score >= 80
})
```

### `filter(list, predicate)`

Returns a new list of elements for which the predicate is **truthy**.

```sentrie
filter(list, (element) => { yield expression })
filter(list, (element, index) => { yield expression })
```

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

let evens: list[number] = filter(numbers, (num) => {
  yield num % 2 == 0
})

let even_indexed: list[number] = filter(numbers, (num, idx) => {
  yield idx % 2 == 0
})

shape Employee {
  name: string
  department: string
  salary: number
}

let employees: list[Employee] = [
  { name: "Alice", department: "Engineering", salary: 95000.0 },
  { name: "Bob", department: "Marketing", salary: 75000.0 }
]

let engineers: list[Employee] = filter(employees, (emp) => {
  yield emp.department == "Engineering"
})
```

### `first(list, predicate)`

Returns the **first** element that satisfies the predicate, or **`undefined`** if none match.

```sentrie
first(list, (element) => { yield expression })
first(list, (element, index) => { yield expression })
```

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

let first_even: number = first(numbers, (num) => {
  yield num % 2 == 0
})

let first_negative: number = first(numbers, (num) => {
  yield num < 0
})
-- Result: undefined
```

### `collect(list, fn)`

Applies a callable to each element and returns a new list.

```sentrie
collect(list, (element) => { yield expression })
collect(list, (element, index) => { yield expression })
```

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5]

let doubled: list[number] = collect(numbers, (num) => {
  yield num * 2
}) -- [2, 4, 6, 8, 10]

let fruits: list[string] = ["apple", "banana", "cherry"]
let indexed_fruits: list[string] = collect(fruits, (fruit, idx) => {
  yield (idx + 1).toString() + ". " + fruit
})

shape User {
  name: string
  age: number
}

let users: list[User] = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 }
]

let names: list[string] = collect(users, (user) => {
  yield user.name
})

let scores: dict[number] = {"alice": 95, "bob": 87}
let doubled2: list[number] = collect([1, 2, 3], (n) => { yield n * 2 })
```

### `reduce(list, initial, reducer)`

Folds a list with an **initial accumulator** and a **reducer** callable. Each `yield` produces the accumulator for the next step.

```sentrie
reduce(list, initial, (accumulator, element) => { yield expression })
reduce(list, initial, (accumulator, element, index) => { yield expression })
```

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5]

let sum: number = reduce(numbers, 0, (acc, num, idx) => {
  yield acc + num
})

let max: number = reduce(numbers, numbers[0], (acc, num) => {
  yield num > acc ? num : acc
})

let words: list[string] = ["Hello", "World", "Sentrie"]
let sentence: string = reduce(words, "", (acc, word, idx) => {
  yield acc + (idx == 0 ? "" : " ") + word
})

shape Sale {
  product: string
  quantity: number
  price: number
}

let sales: list[Sale] = [
  { product: "Laptop", quantity: 2, price: 999.99 },
  { product: "Mouse", quantity: 5, price: 29.99 }
]

let total_revenue: number = reduce(sales, 0.0, (acc, sale) => {
  yield acc + (sale.quantity * sale.price)
})

let max_line_total: number = reduce(sales, 0.0, (acc, sale) => {
  let line: number = sale.quantity * sale.price
  yield line > acc ? line : acc
})
```

### `distinct(list)` / `distinct(list, keyFn)`

**One argument:** removes duplicates using a stable scalar fingerprint of each element.

```sentrie
distinct(list)
```

```sentrie
let numbers: list[number] = [1, 2, 2, 3, 3, 3, 4, 5]
let unique_numbers: list[number] = distinct(numbers) -- [1, 2, 3, 4, 5]
```

**Two arguments:** the second is a callable that yields the key; the key must evaluate to a supported scalar.

```sentrie
distinct(list, (element) => { yield keyExpression })
distinct(list, (element, index) => { yield keyExpression })
```

```sentrie
shape Person {
  name: string
  age: number
}

let people: list[Person] = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Alice", age: 25 }
]

let unique_by_name: list[Person] = distinct(people, (p) => {
  yield p.name
})
```

### Chaining list builtins

Nest builtins for multi-step transforms. Intermediate `let` bindings often read more clearly than deep nesting.

```sentrie
shape Employee {
  name: string
  age: number
  department: string
  salary: number
  years_experience: number
}

let employees: list[Employee] = [
  { name: "Alice", age: 25, department: "Engineering", salary: 95000.0, years_experience: 5 },
  { name: "Bob", age: 17, department: "Engineering", salary: 75000.0, years_experience: 3 },
  { name: "Charlie", age: 30, department: "Marketing", salary: 110000.0, years_experience: 8 }
]

let adults: list[Employee] = filter(employees, (emp) => {
  yield emp.age >= 18
})

let engineers: list[Employee] = filter(adults, (emp) => {
  yield emp.department == "Engineering"
})

let senior_engineers: list[string] = collect(
  filter(engineers, (emp) => {
    yield emp.salary >= 90000.0
  }),
  (emp) => {
    yield emp.name
  }
)

let experienced: list[Employee] = filter(employees, (emp) => {
  yield emp.years_experience >= 5
})

let total_salary: number = reduce(experienced, 0.0, (acc, emp) => {
  yield acc + emp.salary
})

let avg_salary: number = total_salary / count(experienced)

let departments: list[string] = collect(employees, (emp) => {
  yield emp.department
})

let unique_departments: list[string] = distinct(departments)
```

Prefer **`count(filter(...))`** when you only need a count, instead of folding with `reduce`. Use **`distinct`** (one or two arguments) instead of manual duplicate tracking when possible.

```sentrie
let result: list[string] = collect(
  filter(
    filter(users, (user) => {
      yield user.age >= 18
    }),
    (user) => {
      yield user.department == "Engineering"
    }
  ),
  (user) => {
    yield user.name
  }
)
```

```sentrie
let emails: list[string] = collect(
  filter(users, (user) => {
    yield user.email is defined
  }),
  (user) => {
    yield user.email
  }
)
```

:::note
Built-in functions are fast and lightweight. While they support memoization syntax (see [Function Memoization](/reference/functions#function-memoization)), they are not actually memoized as caching would provide minimal benefit for these operations.
:::

## See Also

- [Using Functions](/reference/functions) - Call syntax, TypeScript imports, and memoization
- [Lambdas](/reference/#lambdas) - Callable values (inline lambdas) and arity when passing them to builtins
- [Intermediate Values](/reference/let) - Using builtins inside `let` bindings
- [Rules](/reference/rules) - Using builtins in rule bodies
