---
title: Constraints
description: Constraints provide a way to validate values against specific rules in Sentrie.
---

Constraints provide a way to validate values against specific rules. They are applied using the `@` syntax and are intrinsically tied to the type of the field they validate.

## Basic Usage

```text
let u: number @min(0) @max(100) = 50
```

:::note
In the example above, `number @min(0) @max(100)` forms the type of the variable `u`. Constraints validate values at runtime. If a value doesn't meet the constraint requirements, validation will fail:

```text
let u: number @min(0) @max(100) = 101  -- This will fail validation
```

:::

A number argument to a constraint can be negative (see [Negative arguments](#negative-arguments)) and can use [exponent notation](/reference/types-and-values/#number-literals):

```text
let rate: number @min(1e-3) @max(1.5E+3) = 0.5
```

A constraint name after `@` can be any word, including words that are keywords in the language; the name must still be one of the constraints listed below.

## Collection Constraints

You can apply constraints to elements within collections:

```text
let permissions: list[string @one_of("read", "write", "delete")] = ["read", "write"]
```

For better readability, consider using [shapes](/reference/shapes):

```text
shape Permission string @one_of("read", "write", "delete")

let permissions: list[Permission] = ["read", "write"]
```

:::tip
Use contraints for runtime validation of data.

```sentrie
shape Positive100 number @min(0) @max(100)
let y = 50
let c:Positive100 = y
```

In the above example, the value of `y` is validated against the constraints before being assigned to `c`.
:::

## Available Constraints

### Numeric Constraints (`number`)

| Constraint            | Description                                     |
| --------------------- | ----------------------------------------------- |
| `@eq(value)`          | Value must equal the specified value            |
| `@neq(value)`         | Value must not equal the specified value        |
| `@gt(value)`          | Value must be greater than the specified value  |
| `@lt(value)`          | Value must be less than the specified value     |
| `@in(values...)`      | Value must equal one of the listed numbers; write each number as its own argument: `@in(1, 2, 3)` |
| `@not_in(values...)`  | Value must equal none of the listed numbers: `@not_in(1, 2, 3)` |
| `@range(min, max)`    | Value must be between min and max (inclusive)   |
| `@multiple_of(value)` | Value must be a multiple of the specified value (the divisor must not be zero). Negative values count: `-4` is a multiple of `2`, `-3.5` is not |
| `@even()`             | Value must be even                              |
| `@odd()`              | Value must be odd                               |
| `@positive()`         | Value must be positive                          |
| `@negative()`         | Value must be negative                          |
| `@non_negative()`     | Value must be non-negative (≥ 0)                |
| `@non_positive()`     | Value must be non-positive (≤ 0)                |

Numeric constraints compare exact values. For integers that fit in 64 bits, `@eq`, `@neq`, `@gt`, `@lt`, `@in`, `@not_in` and `@range` do not round, and `@multiple_of`, `@even` and `@odd` use integer arithmetic, so they stay correct beyond 2^53 (`9007199254740992`):

```text
shape AccountId number @min(0) @multiple_of(2)
shape Cap number @max(9007199254740993)

-- 9007199254740994 passes @multiple_of(2), 9007199254740993 fails it
-- 9007199254740993 passes @max(9007199254740993), 9007199254740994 fails it
```

See [Integers and floats](/reference/types-and-values#integers-and-floats).

### Number-Specific Constraints

| Constraint    | Description            |
| ------------- | ---------------------- |
| `@finite()`   | Value must be finite   |
| `@infinite()` | Value must be infinite |
| `@nan()`      | Value must be NaN      |

A `number` can be an exact integer or a float; floats can represent ±∞ and NaN. Sentrie does not produce these values: there is no infinity literal, and division by zero aborts evaluation. ±∞ and NaN can only appear when a value comes from a TypeScript function (for example JS `1/0` gives `Infinity`) or from external input. Floats use float64 comparisons, and `@multiple_of` uses a small epsilon for floating-point remainder checks.

### String Constraints

| Constraint                      | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| `@length(value)`                | String must be exactly the specified length, counted in Unicode code points, not bytes |
| `@minlength(value)`             | String must be at least the specified length (in code points) |
| `@maxlength(value)`             | String must be at most the specified length (in code points) |
| `@regexp(pattern)`              | String must match the specified regular expression ([RE2 syntax](https://github.com/google/re2/wiki/Syntax)). An invalid pattern is rejected when the pack is loaded |
| `@starts_with(substring)`       | String must start with the specified substring      |
| `@ends_with(substring)`         | String must end with the specified substring        |
| `@has_substring(substring)`     | String must contain the specified substring         |
| `@not_has_substring(substring)` | String must not contain the specified substring     |
| `@email()`                      | String must be a valid email address                |
| `@url(schemes...)`              | String must be a URL with a scheme and a host. With no arguments the scheme must be `http` or `https`; with arguments it must be one of the listed schemes. See [URLs](#urls) |
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
| `@in(values...)`                | String must equal one of the listed strings: `@in("a", "b")`. Same meaning as `@one_of` |
| `@not_in(values...)`            | String must equal none of the listed strings. Same meaning as `@not_one_of` |

`@regexp` patterns use [RE2 syntax](https://github.com/google/re2/wiki/Syntax), which has no backreferences or lookaround.

### List Constraints

| Constraint     | Description            |
| -------------- | ---------------------- |
| `@not_empty()` | List must not be empty |

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
- Schemes without a host, such as `mailto:` and `urn:`, never pass `@url`, even when listed as arguments (`@url("mailto")` still rejects `mailto:a@b.c`), because a host is required.
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

## Type Conversion with Constraints

When converting between types with a postfix cast expression (`expr as Type`), the result is validated against the target type and its constraints before it is returned. If validation fails, evaluation errors - it does not yield an unchecked value.

```text
let u: number = "50" as number
```

```text
let u: string = 50 as string
```

```text
let u: boolean = "true" as boolean
```

```text
let u: document = { "name": "John", "age": 30 } as document
```
