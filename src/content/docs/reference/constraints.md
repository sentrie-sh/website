---
title: Constraints
description: "Constraint syntax and all constraints (e.g. @min, @max, @email) on number, string, list, and trinary types."
---

Constraints validate values at runtime using the `@` syntax on types. They apply to primitives, collection elements, and shape fields. Validation failure aborts evaluation.

## Syntax

```text
type @constraint1(args) @constraint2
```

Examples: `number @min(0) @max(100)`, `string @email`, `list[string @one_of("a","b")]`. Multiple constraints can be chained; all must pass. Constraint arguments are literals: numbers, strings and trinary values. A number argument can be negative (see [Negative arguments](#negative-arguments)).

A number argument to a constraint can use [exponent notation](/reference/types-and-values/#number-literals):

```text
let rate: number @min(1e-3) @max(1.5E+3) = 0.5
```

## When constraints are checked

Constraints are checked:

- When a value is **assigned** to a variable or field (e.g. `let x: number @min(0) = 50` or a shape field).
- When a value is **cast** to a constrained type (e.g. `50 as number @min(0) @max(100)`).
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
| `@in(values...)`      | 1+ (numbers)         | Value must equal one of the listed numbers. Write each number as its own argument: `@in(1, 2, 3)`. |
| `@not_in(values...)`  | 1+ (numbers)         | Value must equal none of the listed numbers: `@not_in(1, 2, 3)`.           |
| `@range(min, max)`    | 2 (numbers)          | Value must be between min and max (inclusive).                              |
| `@multiple_of(value)` | 1 (number)           | Value must be a multiple of the specified value (divisor must not be zero). Negative values count: `-4` is a multiple of `2`, `-3.5` is not. |
| `@even()`             | 0                    | Value must be even.                                                         |
| `@odd()`              | 0                    | Value must be odd.                                                          |
| `@positive()`         | 0                    | Value must be positive (> 0).                                               |
| `@negative()`         | 0                    | Value must be negative (< 0).                                               |
| `@non_negative()`     | 0                    | Value must be non-negative (≥ 0).                                           |
| `@non_positive()`     | 0                    | Value must be non-positive (≤ 0).                                           |

Numeric constraints compare exact values. For integers that fit in 64 bits, `@eq`, `@neq`, `@gt`, `@lt`, `@in`, `@not_in` and `@range` do not round, and `@multiple_of`, `@even` and `@odd` use integer arithmetic, so they stay correct beyond 2^53 (`9007199254740992`):

```sentrie
shape AccountId number @min(0) @multiple_of(2)
shape Cap number @max(9007199254740993)

-- 9007199254740994 passes @multiple_of(2), 9007199254740993 fails it
-- 9007199254740993 passes @max(9007199254740993), 9007199254740994 fails it
```

See [Integers and floats](/reference/types-and-values#integers-and-floats).

### Number-specific constraints (`number`)

A `number` can be an exact integer or a float; floats can represent ±∞ and NaN. Sentrie **does not produce** these values: there is no infinity literal, and division by zero aborts evaluation. ±∞ and NaN can only appear when a value comes from a TypeScript function (e.g. JS `1/0` → `Infinity`) or from external input. Use these constraints to accept or reject such values:

| Constraint    | Arguments | Description                                                                   |
| :------------ | :-------- | :---------------------------------------------------------------------------- |
| `@finite()`   | 0         | Value must be finite (not ±∞ and not NaN). Use to reject TS/input infinities. |
| `@infinite()` | 0         | Value must be ±∞. Rare; only relevant when TS or input can supply infinity.   |
| `@nan()`      | 0         | Value must be NaN. Rare; only relevant when TS or input can supply NaN.       |

### String constraints (`string`)

| Constraint                      | Arguments    | Description                                                                                      |
| :------------------------------ | :----------- | :----------------------------------------------------------------------------------------------- |
| `@length(value)`                | 1 (number)   | String length must equal the specified value. Length counts Unicode code points, not bytes.      |
| `@minlength(value)`             | 1 (number)   | String length must be at least the specified value (in code points).                             |
| `@maxlength(value)`             | 1 (number)   | String length must be at most the specified value (in code points).                              |
| `@regexp(pattern)`              | 1 (string)   | String must match the specified regular expression (Go regexp). Invalid pattern causes an error. |
| `@starts_with(substring)`       | 1 (string)   | String must start with the specified substring.                                                  |
| `@ends_with(substring)`         | 1 (string)   | String must end with the specified substring.                                                    |
| `@has_substring(substring)`     | 1 (string)   | String must contain the specified substring.                                                     |
| `@not_has_substring(substring)` | 1 (string)   | String must not contain the specified substring.                                                 |
| `@email()`                      | 0            | String must be a valid email address (pattern-based).                                            |
| `@url(schemes...)`              | 0+ (strings) | String must be a URL with a scheme and a host. With no arguments the scheme must be `http` or `https`; with arguments it must be one of the listed schemes. See [URLs](#urls). |
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
| `@in(values...)`                | 1+ (strings) | String must equal one of the listed strings: `@in("a", "b")`. Same meaning as `@one_of`.         |
| `@not_in(values...)`            | 1+ (strings) | String must equal none of the listed strings. Same meaning as `@not_one_of`.                     |

### Membership: `@in` and `@not_in`

`@in` and `@not_in` take each allowed value as its own argument, on numbers and on strings:

```sentrie
namespace docs/constraints

policy membership {
  fact port: number @in(80, 443, 8080)
  fact role: string @in("admin", "user")
  fact retries: number @not_in(0, 13)

  rule allowed = true
  export decision of allowed
}
```

With facts `{"port": 443, "role": "admin", "retries": 3}` the rule yields `true`. `port: 22` fails `@in`, `role: "guest"` fails `@in`, and `retries: 13` fails `@not_in`.

**Breaking change:** a list is no longer the form for membership. `@in([1, 2, 3])` and `@not_in([1, 2, 3])` are now an invalid argument, and `sentrie validate` and `sentrie exec` report it before anything is evaluated:

```text
invalid argument to constraint 'in': in constraint takes each value as its own argument, as in @in(1, 2), not a list
```

Packs that wrote `@in([1, 2, 3])` must drop the brackets: `@in(1, 2, 3)`.

### Negative arguments

A number argument can be negative. The minus sign is part of the literal, so it works for every numeric constraint:

```sentrie
namespace docs/constraints

policy temperature {
  fact celsius: number @min(-40) @max(-1)
  fact delta: number @range(-10, 10)
  fact offset: number @in(-1, 0, 1)

  rule below_zero = true
  export decision of below_zero
}
```

With facts `{"celsius": -5, "delta": -10, "offset": -1}` the rule yields `true`; `celsius: 0` fails `@max(-1)`. The minus applies to number literals only: `@min(-x)`, `@min(-"a")` and `@min(-(1))` are rejected with `a minus in a constraint argument must be followed by a number literal`, and the error points at the offending token.

### URLs

`@url` parses the string as a URL. The scheme and the host are both required; ports, IP addresses and `localhost` are fine, and so are paths, queries and userinfo:

```sentrie
namespace docs/constraints

policy endpoints {
  fact homepage: string @url()
  fact mirror: string @url("ftp", "ssh")

  rule valid = true
  export decision of valid
}
```

With facts `{"homepage": "http://localhost:8080/status", "mirror": "ssh://10.0.0.5:22"}` the rule yields `true`.

- With no arguments (`@url()`), only `http` and `https` pass.
- Scheme arguments **replace** that default set. `@url("ftp")` accepts only `ftp`, not `http`; to accept the web schemes as well, list them: `@url("http", "https", "ftp")`. Schemes compare case-insensitively.
- `localhost:8080` (it parses as scheme `localhost`), `/path` and `http://` fail because there is no scheme or no host. A scheme argument that is not valid scheme syntax, such as `@url("ftp://")`, is an invalid argument and is reported when the pack is validated.

### String length

`@length`, `@minlength` and `@maxlength` count Unicode code points, not bytes, so `"é"` has length 1. They do not count grapheme clusters: a letter written as a base character plus a combining accent counts as two, and so does an emoji sequence built from several code points.

```sentrie
namespace docs/constraints

policy names {
  fact code: string @length(2)

  rule ok = true
  export decision of ok
}
```

`{"code": "éa"}` passes; `{"code": "é"}` fails with `string length 1 is not equal to 2`.

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

### Constraint Arguments

Constraint arguments are literals, and they are checked when the pack is loaded, not when a value first reaches them. Sentrie checks:

- the number of arguments each constraint takes;
- the kind of each argument, for example a number for `@min` and a string for `@regexp`;
- arguments that can never work, such as a pattern that does not compile, `@multiple_of(0)`, or a `@range` whose minimum is above its maximum.

The check covers every place a type can be written: facts, `let`s, shape fields and aliases, derive and lambda parameter and return types, casts, `is` checks, and element types inside `list`, `dict` and `record`. `sentrie validate` reports a broken argument at the constraint's position, and `sentrie exec` fails with the same error before it evaluates anything:

```text
let v: string @regexp("[") = "a"
```

```text
invalid argument to constraint 'regexp': invalid regexp pattern: error parsing regexp: missing closing ]: `[`
```

At runtime, a constraint's arguments are also checked before the value's kind. A broken argument is an error for every value, so `x is not string @regexp("[")` fails instead of quietly returning `true` for a value that is not a string.

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

When converting with a postfix cast (`expr as type`), the result is validated against the target type and **all constraints** on that type. If validation fails, evaluation errors; it does not yield an unchecked value.

```text
let u: number @min(0) @max(100) = "50" as number
```

```text
let u: string @email = "user@example.com" as string
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
- A constraint name after `@` can be any word, including words that are keywords in the language; the name must still be one of the constraints listed above.
- Numeric constraints compare exact values. Integers that fit in 64 bits use integer arithmetic (including `@even`, `@odd` and `@multiple_of`); floats use float64 comparisons, and `@multiple_of` uses a small epsilon for floating-point remainder checks.
- **Infinity and NaN:** The language has no infinity or NaN literal, and division by zero aborts (it does not produce `±∞`). So `@infinite()` and `@nan()` only apply when a number comes from TypeScript or external input (e.g. a JS function returning `Infinity`).
- String `@regexp` uses Go’s [regexp](https://pkg.go.dev/regexp) semantics. An invalid pattern is rejected when the pack is loaded (see [Constraint Arguments](#constraint-arguments)).
- Map types currently have no built-in constraints; only list and element types (e.g. `list[T]` with constrained `T`) are covered above.
