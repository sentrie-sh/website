---
title: "@sentrie/math"
description: Mathematical constants and functions
---

The `@sentrie/math` module provides mathematical constants and functions. Similar to JavaScript's Math object, but with additional functions.

## Usage

```text
use { PI, E, sin, cos, sqrt, pow } from "@sentrie/math" as math
```

## Constants

- **`E`** - Euler's number (e ≈ 2.718281828459045)
- **`PI`** - Pi (π ≈ 3.141592653589793)
- **`LN2`** - Natural logarithm of 2 (ln(2) ≈ 0.6931471805599453)
- **`LN10`** - Natural logarithm of 10 (ln(10) ≈ 2.302585092994046)
- **`LOG2E`** - Base-2 logarithm of e (log₂(e) ≈ 1.4426950408889634)
- **`LOG10E`** - Base-10 logarithm of e (log₁₀(e) ≈ 0.4342944819032518)
- **`SQRT2`** - Square root of 2 (√2 ≈ 1.4142135623730951)
- **`SQRT1_2`** - Square root of 0.5 (1/√2 ≈ 0.7071067811865476)
- **`MAX_VALUE`** - Maximum finite value representable as a float64 (1.7976931348623157e+308)
- **`MIN_VALUE`** - Smallest positive non-zero value representable as a float64 (5e-324)

## Basic Functions

### `abs(x: number): number`

Returns the absolute value of a number.

**Example:**

```text
use { abs } from "@sentrie/math" as math

let value = math.abs(-5)  // 5
```

### `ceil(x: number): number`

Returns the smallest integer greater than or equal to a number (ceiling).

**Example:**

```text
use { ceil } from "@sentrie/math" as math

let value = math.ceil(4.3)  // 5
```

### `floor(x: number): number`

Returns the largest integer less than or equal to a number (floor).

**Example:**

```text
use { floor } from "@sentrie/math" as math

let value = math.floor(4.7)  // 4
```

### `round(x: number): number`

Returns the value of a number rounded to the nearest integer.

**Example:**

```text
use { round } from "@sentrie/math" as math

let value = math.round(4.5)  // 5
```

### `max(...values: number[]): number`

Returns the maximum value from a list of numbers.

**Throws:** Error if no arguments are provided

**Example:**

```text
use { max } from "@sentrie/math" as math

let value = math.max(1, 5, 3, 9, 2)  // 9
```

### `min(...values: number[]): number`

Returns the minimum value from a list of numbers.

**Throws:** Error if no arguments are provided

**Example:**

```text
use { min } from "@sentrie/math" as math

let value = math.min(1, 5, 3, 9, 2)  // 1
```

## Exponential and Logarithmic Functions

### `sqrt(x: number): number`

Returns the square root of a number.

**Throws:** Error if x is negative

**Example:**

```text
use { sqrt } from "@sentrie/math" as math

let value = math.sqrt(16)  // 4
```

### `pow(base: number, exponent: number): number`

Returns the value of base raised to the power of exponent.

**Example:**

```text
use { pow } from "@sentrie/math" as math

let value = math.pow(2, 3)  // 8
```

### `exp(x: number): number`

Returns e raised to the power of x (eˣ).

**Example:**

```text
use { exp } from "@sentrie/math" as math

let value = math.exp(1)  // ≈ 2.718
```

### `log(x: number): number`

Returns the natural logarithm (base e) of a number.

**Throws:** Error if x is non-positive

**Example:**

```text
use { log } from "@sentrie/math" as math

let value = math.log(math.E)  // 1
```

### `log10(x: number): number`

Returns the base-10 logarithm of a number.

**Throws:** Error if x is non-positive

**Example:**

```text
use { log10 } from "@sentrie/math" as math

let value = math.log10(100)  // 2
```

### `log2(x: number): number`

Returns the base-2 logarithm of a number.

**Throws:** Error if x is non-positive

**Example:**

```text
use { log2 } from "@sentrie/math" as math

let value = math.log2(8)  // 3
```

## Trigonometric Functions

All trigonometric functions work with angles in radians.

### `sin(x: number): number`

Returns the sine of an angle in radians.

**Example:**

```text
use { sin, PI } from "@sentrie/math" as math

let value = math.sin(math.PI / 2)  // 1
```

### `cos(x: number): number`

Returns the cosine of an angle in radians.

**Example:**

```text
use { cos, PI } from "@sentrie/math" as math

let value = math.cos(0)  // 1
```

### `tan(x: number): number`

Returns the tangent of an angle in radians.

**Example:**

```text
use { tan, PI } from "@sentrie/math" as math

let value = math.tan(math.PI / 4)  // ≈ 1
```

### `asin(x: number): number`

Returns the arcsine (inverse sine) of a number in radians.

**Throws:** Error if x is not between -1 and 1

**Example:**

```text
use { asin } from "@sentrie/math" as math

let value = math.asin(1)  // π/2
```

### `acos(x: number): number`

Returns the arccosine (inverse cosine) of a number in radians.

**Throws:** Error if x is not between -1 and 1

**Example:**

```text
use { acos } from "@sentrie/math" as math

let value = math.acos(0)  // π/2
```

### `atan(x: number): number`

Returns the arctangent (inverse tangent) of a number in radians.

**Example:**

```text
use { atan } from "@sentrie/math" as math

let value = math.atan(1)  // π/4
```

### `atan2(y: number, x: number): number`

Returns the arctangent of the quotient of its arguments. This is useful for converting rectangular coordinates to polar coordinates.

**Example:**

```text
use { atan2 } from "@sentrie/math" as math

let angle = math.atan2(1, 1)  // π/4
```

## Hyperbolic Functions

### `sinh(x: number): number`

Returns the hyperbolic sine of a number.

### `cosh(x: number): number`

Returns the hyperbolic cosine of a number.

### `tanh(x: number): number`

Returns the hyperbolic tangent of a number.

## Random Numbers

### `random(): number`

Returns a pseudo-random number between 0 (inclusive) and 1 (exclusive). Similar to JavaScript's Math.random().

**Example:**

```text
use { random } from "@sentrie/math" as math

let value = math.random()  // 0.0 <= value < 1.0
```

## Complete Example

```text
namespace com/example/mypolicy

policy mypolicy {
  use { PI, sqrt, pow, sin, cos, random } from "@sentrie/math" as math

  fact radius!: number
  fact angle!: number

  rule calculateArea = default false {
    let area = math.PI * math.pow(radius, 2)
    yield area > 0
  }

  rule calculateCoordinates = default false {
    let x = radius * math.cos(angle)
    let y = radius * math.sin(angle)
    let distance = math.sqrt(math.pow(x, 2) + math.pow(y, 2))
    yield distance == radius
  }

  export decision of calculateArea
  export decision of calculateCoordinates
}
```
