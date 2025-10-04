---
title: Types and Constraints
description: Sentrie has a comprehensive type system with primitive types, collections, and user-defined shapes. Types can have constraints applied to them.
---

Sentrie provides a robust type system that includes primitive types, collection types, and [user-defined shapes](/reference/shapes/). The type system is enhanced by a powerful constraint system that allows you to validate values against specific rules.

## Primitive Types

Sentrie supports five fundamental primitive types:

| Type       | Description                 |
| ---------- | --------------------------- |
| `int`      | Integer numbers             |
| `float`    | Floating-point numbers      |
| `string`   | Text strings                |
| `bool`     | Boolean values (true/false) |
| `document` | Arbitrary JSON-like objects |

### Declaring a Primitive Type

```text
let u: int = 50
```

```text
let u: float = 50.5
```

```text
let u: string = "hello"
```

```text
let u: bool = true
```

```text
let u: document = { "name": "John", "age": 30 }
```

## Collection Types

Collections allow you to work with groups of related values:

| Type                  | Description                                 |
| --------------------- | ------------------------------------------- |
| `list[T]`             | Lists of type `T`                           |
| `map[T]`              | Maps with `string` keys and type `T` values |
| `record[T1, T2, ...]` | Tuples with specific types                  |

### Declaring a Collection Type

```text
let u: list[int] = [1, 2, 3]
```

```text
let u: map[int] = { "one": 1, "two": 2, "three": 3 }
```

```text
let u: record[string, int, bool] = ["one", 1, true]
```

:::caution
Map keys must be strings.
:::

:::note
The type is optional for `let` statements. The type will be inferred from the value.
However, it is recommended to declare the type for better readability and to avoid surprises where the type is not what you expect.
:::

## Constraints

Constraints provide a way to validate values against specific rules. They are applied using the `@` syntax and are intrinsically tied to the type of the field they validate.

### Basic Usage

```text
let u: int @min(0) @max(100) = 50
```

:::note
Constraints validate values at runtime. If a value doesn't meet the constraint requirements, validation will fail:

```text
let u: int @min(0) @max(100) = 101  -- This will fail validation
```

:::

### Collection Constraints

You can apply constraints to elements within collections:

```text
let permissions: list[string @one_of("read", "write", "delete")] = ["read", "write"]
```

For better readability, consider using [shapes](/reference/shapes):

```text
shape Permission string @one_of("read", "write", "delete")

let permissions: list[Permission] = ["read", "write"]
```

## Available Constraints

### Numeric Constraints (`int` and `float`)

| Constraint            | Description                                     |
| --------------------- | ----------------------------------------------- |
| `@eq(value)`          | Value must equal the specified value            |
| `@neq(value)`         | Value must not equal the specified value        |
| `@gt(value)`          | Value must be greater than the specified value  |
| `@lt(value)`          | Value must be less than the specified value     |
| `@in(values...)`      | Value must be in the specified list             |
| `@not_in(values...)`  | Value must not be in the specified list         |
| `@range(min, max)`    | Value must be between min and max (inclusive)   |
| `@multiple_of(value)` | Value must be a multiple of the specified value |
| `@even()`             | Value must be even                              |
| `@odd()`              | Value must be odd                               |
| `@positive()`         | Value must be positive                          |
| `@negative()`         | Value must be negative                          |
| `@non_negative()`     | Value must be non-negative (≥ 0)                |
| `@non_positive()`     | Value must be non-positive (≤ 0)                |

### Float-Specific Constraints

| Constraint    | Description            |
| ------------- | ---------------------- |
| `@finite()`   | Value must be finite   |
| `@infinite()` | Value must be infinite |
| `@nan()`      | Value must be NaN      |

### String Constraints

| Constraint                      | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| `@length(value)`                | String must be exactly the specified length         |
| `@minlength(value)`             | String must be at least the specified length        |
| `@maxlength(value)`             | String must be at most the specified length         |
| `@regexp(pattern)`              | String must match the specified regular expression  |
| `@starts_with(substring)`       | String must start with the specified substring      |
| `@ends_with(substring)`         | String must end with the specified substring        |
| `@has_substring(substring)`     | String must contain the specified substring         |
| `@not_has_substring(substring)` | String must not contain the specified substring     |
| `@email()`                      | String must be a valid email address                |
| `@url()`                        | String must be a valid URL                          |
| `@uuid()`                       | String must be a valid UUID                         |
| `@alphanumeric()`               | String must contain only alphanumeric characters    |
| `@alpha()`                      | String must contain only letter characters          |
| `@numeric()`                    | String must contain only numeric characters         |
| `@lowercase()`                  | String must be lowercase                            |
| `@uppercase()`                  | String must be uppercase                            |
| `@trimmed()`                    | String must not have leading or trailing whitespace |
| `@not_empty()`                  | String must not be empty                            |
| `@one_of(values...)`            | String must be one of the specified values          |
| `@not_one_of(values...)`        | String must not be one of the specified values      |

### List Constraints

| Constraint     | Description            |
| -------------- | ---------------------- |
| `@not_empty()` | List must not be empty |
