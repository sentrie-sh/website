---
title: Constraints
description: "Constraint syntax and all constraints (e.g. @min, @max, @email) on number, string, list, and trinary types."
---

Constraints validate values at runtime using the `@` syntax on types. They apply to primitives, collection elements, and shape fields. Validation failure aborts evaluation.

## Syntax

```text
type @constraint1(args) @constraint2
```

Examples: `number @min(0) @max(100)`, `string @email`, `list[string @one_of("a","b")]`. Multiple constraints can be chained; all must pass. Constraint arguments use the same literal syntax as the language (numbers, strings, lists where applicable).

## When constraints are checked

Constraints are checked:

- When a value is **assigned** to a variable or field (e.g. `let x: number @min(0) = 50` or a shape field).
- When a value is **cast** to a constrained type (e.g. `cast 50 as number @min(0) @max(100)`).
- When **facts** are supplied and matched to shape types that have constraints.

If any constraint fails, evaluation aborts with an error. Order of application is defined by the runtime; all specified constraints must pass.

## Configuration & Arguments

### Numeric constraints (`number`)

| Constraint            | Arguments            | Description                                                                 |
| :-------------------- | :------------------- | :-------------------------------------------------------------------------- |
| `@min(value)`         | 1 (number)           | Value must be greater than or equal to the specified value.                 |
| `@max(value)`         | 1 (number)           | Value must be less than or equal to the specified value.                    |
| `@eq(value)`          | 1 (number)           | Value must equal the specified value.                                       |
| `@neq(value)`         | 1 (number)           | Value must not equal the specified value.                                   |
| `@gt(value)`          | 1 (number)           | Value must be greater than the specified value.                             |
| `@lt(value)`          | 1 (number)           | Value must be less than the specified value.                                |
| `@in(values...)`      | 1 (list) or variadic | Value must be in the specified list of numbers.                             |
| `@not_in(values...)`  | 1 (list) or variadic | Value must not be in the specified list of numbers.                         |
| `@range(min, max)`    | 2 (numbers)          | Value must be between min and max (inclusive).                              |
| `@multiple_of(value)` | 1 (number)           | Value must be a multiple of the specified value (divisor must not be zero). |
| `@even()`             | 0                    | Value must be even.                                                         |
| `@odd()`              | 0                    | Value must be odd.                                                          |
| `@positive()`         | 0                    | Value must be positive (> 0).                                               |
| `@negative()`         | 0                    | Value must be negative (< 0).                                               |
| `@non_negative()`     | 0                    | Value must be non-negative (≥ 0).                                           |
| `@non_positive()`     | 0                    | Value must be non-positive (≤ 0).                                           |

### Number-specific constraints (`number`)

Numbers are represented as float64, which can represent ±∞ and NaN. Sentrie **does not produce** these values: there is no infinity literal, and division by zero aborts evaluation. ±∞ and NaN can only appear when a value comes from a TypeScript function (e.g. JS `1/0` → `Infinity`) or from external input. Use these constraints to accept or reject such values:

| Constraint    | Arguments | Description                                                                   |
| :------------ | :-------- | :---------------------------------------------------------------------------- |
| `@finite()`   | 0         | Value must be finite (not ±∞ and not NaN). Use to reject TS/input infinities. |
| `@infinite()` | 0         | Value must be ±∞. Rare; only relevant when TS or input can supply infinity.   |
| `@nan()`      | 0         | Value must be NaN. Rare; only relevant when TS or input can supply NaN.       |

### String constraints (`string`)

| Constraint                      | Arguments    | Description                                                                                      |
| :------------------------------ | :----------- | :----------------------------------------------------------------------------------------------- |
| `@length(value)`                | 1 (number)   | String length must equal the specified value.                                                    |
| `@minlength(value)`             | 1 (number)   | String length must be at least the specified value.                                              |
| `@maxlength(value)`             | 1 (number)   | String length must be at most the specified value.                                               |
| `@regexp(pattern)`              | 1 (string)   | String must match the specified regular expression (Go regexp). Invalid pattern causes an error. |
| `@starts_with(substring)`       | 1 (string)   | String must start with the specified substring.                                                  |
| `@ends_with(substring)`         | 1 (string)   | String must end with the specified substring.                                                    |
| `@has_substring(substring)`     | 1 (string)   | String must contain the specified substring.                                                     |
| `@not_has_substring(substring)` | 1 (string)   | String must not contain the specified substring.                                                 |
| `@email()`                      | 0            | String must be a valid email address (pattern-based).                                            |
| `@url()`                        | 0            | String must be a valid URL (pattern-based).                                                      |
| `@uuid()`                       | 0            | String must be a valid UUID.                                                                     |
| `@alphanumeric()`               | 0            | String must contain only alphanumeric characters (letters and digits).                           |
| `@alpha()`                      | 0            | String must contain only letter characters.                                                      |
| `@numeric()`                    | 0            | String must be parseable as a numeric value.                                                     |
| `@lowercase()`                  | 0            | String must be lowercase.                                                                        |
| `@uppercase()`                  | 0            | String must be uppercase.                                                                        |
| `@trimmed()`                    | 0            | String must not have leading or trailing whitespace.                                             |
| `@not_empty()`                  | 0            | String must not be empty.                                                                        |
| `@one_of(values...)`            | 1+ (strings) | String must be one of the specified values.                                                      |
| `@not_one_of(values...)`        | 1+ (strings) | String must not be one of the specified values.                                                  |

### List constraints (`list[...]`)

| Constraint     | Arguments | Description             |
| :------------- | :-------- | :---------------------- |
| `@not_empty()` | 0         | List must not be empty. |

### Trinary constraints (`trinary` / `bool`)

| Constraint       | Arguments   | Description                                                             |
| :--------------- | :---------- | :---------------------------------------------------------------------- |
| `@not_unknown()` | 0           | Value must not be `unknown` (i.e. must be `true` or `false`).           |
| `@eq(value)`     | 1 (trinary) | Value must equal the specified trinary (`true`, `false`, or `unknown`). |
| `@neq(value)`    | 1 (trinary) | Value must not equal the specified trinary.                             |
| `@is_true()`     | 0           | Value must be `true`.                                                   |
| `@is_false()`    | 0           | Value must be `false`.                                                  |

**Returns:** N/A. Constraint failure raises an error and aborts evaluation.

## Collection constraints (element-level)

Constraints can be applied to the **element type** of a list so that each element is validated:

```text
list[string @one_of("read", "write", "delete")]
list[number @min(0) @max(100)]
```

For readability and reuse, define a [shape](/reference/shapes) and use it as the element type:

```text
shape Permission string @one_of("read", "write", "delete")
let permissions: list[Permission] = ["read", "write"]
```

## Type conversion with constraints

When converting with `cast expr as type`, the result is validated against the target type and **all constraints** on that type. If validation fails, evaluation aborts.

```text
let u: number @min(0) @max(100) = cast "50" as number
```

```text
let u: string @email = cast "user@example.com" as string
```

Casting to a constrained type is equivalent to assigning the cast result to a variable of that type; the same constraint rules apply.

## Examples in Action

### Typical use

```text
let u: number @min(0) @max(100) = 50
shape Permission string @one_of("read", "write", "delete")
```

Validation runs at assignment. For example, `let u: number @min(0) @max(100) = 101` would fail.

### Collection and shapes

```text
let permissions: list[string @one_of("read", "write", "delete")] = ["read", "write"]
```

Using a shape for the element type:

```text
shape Positive100 number @min(0) @max(100)
let y = 50
let c: Positive100 = y
```

Here `y` is validated against `Positive100` (and thus `@min(0) @max(100)`) before assignment to `c`.

### Trinary constraints

```text
let flag: trinary @is_true = true
let known: trinary @not_unknown = some_expression
```

## Good to Know

Before you implement this, keep a few boundaries in mind:

- Constraints are checked at runtime when a value is assigned or cast to the constrained type (and when facts are matched to constrained shape types).
- Order of application is defined by the runtime. All specified constraints must pass; failure aborts evaluation immediately.
- Use shapes to reuse constrained types (e.g. `shape ID string @uuid()`) and to name element types in collections.
- Numeric constraints use float64; `@even` and `@odd` use modulo. `@multiple_of` uses a small epsilon for floating-point remainder checks.
- **Infinity and NaN:** The language has no infinity or NaN literal, and division by zero aborts (it does not produce `±∞`). So `@infinite()` and `@nan()` only apply when a number comes from TypeScript or external input (e.g. a JS function returning `Infinity`).
- String `@regexp` uses Go’s [regexp](https://pkg.go.dev/regexp) semantics. Invalid pattern strings cause an evaluation error.
- Map types currently have no built-in constraints; only list and element types (e.g. `list[T]` with constrained `T`) are covered above.
