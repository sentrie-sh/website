---
title: "@sentrie/js"
description: JavaScript globals exposed as individual functions
---

The `@sentrie/js` module provides access to JavaScript globals (Math, String, Number, Date, JSON, Array) as individual functions. This allows you to use standard JavaScript functions directly in your policies.

## Usage

```text
use { round, floor, ceil } from @sentrie/js as math
use { length, fromCharCode } from @sentrie/js as str
use { parse, stringify } from @sentrie/js as json
```

## Math Functions

### Basic Operations

#### `round(x: number): number`

Returns the value of a number rounded to the nearest integer.

**Example:**

```text
use { round } from @sentrie/js as math
let value = math.round(4.5)  // 5
```

#### `floor(x: number): number`

Returns the largest integer less than or equal to a number.

**Example:**

```text
use { floor } from @sentrie/js as math
let value = math.floor(4.7)  // 4
```

#### `ceil(x: number): number`

Returns the smallest integer greater than or equal to a number.

**Example:**

```text
use { ceil } from @sentrie/js as math
let value = math.ceil(4.3)  // 5
```

#### `max(...values: number[]): number`

Returns the maximum value from a list of numbers.

**Example:**

```text
use { max } from @sentrie/js as math
let value = math.max(1, 5, 3, 9, 2)  // 9
```

#### `min(...values: number[]): number`

Returns the minimum value from a list of numbers.

**Example:**

```text
use { min } from @sentrie/js as math
let value = math.min(1, 5, 3, 9, 2)  // 1
```

#### `abs(x: number): number`

Returns the absolute value of a number.

**Example:**

```text
use { abs } from @sentrie/js as math
let value = math.abs(-5)  // 5
```

### Exponential and Logarithmic Functions

#### `sqrt(x: number): number`

Returns the square root of a number.

**Example:**

```text
use { sqrt } from @sentrie/js as math
let value = math.sqrt(16)  // 4
```

#### `pow(base: number, exponent: number): number`

Returns the value of base raised to the power of exponent.

**Example:**

```text
use { pow } from @sentrie/js as math
let value = math.pow(2, 3)  // 8
```

#### `exp(x: number): number`

Returns e raised to the power of x (eˣ).

**Example:**

```text
use { exp } from @sentrie/js as math
let value = math.exp(1)  // ≈ 2.718
```

#### `log(x: number): number`

Returns the natural logarithm (base e) of a number.

**Example:**

```text
use { log, E } from @sentrie/js as math
let value = math.log(math.E)  // 1
```

#### `log10(x: number): number`

Returns the base-10 logarithm of a number.

**Example:**

```text
use { log10 } from @sentrie/js as math
let value = math.log10(100)  // 2
```

#### `log2(x: number): number`

Returns the base-2 logarithm of a number.

**Example:**

```text
use { log2 } from @sentrie/js as math
let value = math.log2(8)  // 3
```

### Trigonometric Functions

All trigonometric functions work with angles in radians.

#### `sin(x: number): number`

Returns the sine of an angle in radians.

**Example:**

```text
use { sin, PI } from @sentrie/js as math
let value = math.sin(math.PI / 2)  // 1
```

#### `cos(x: number): number`

Returns the cosine of an angle in radians.

**Example:**

```text
use { cos } from @sentrie/js as math
let value = math.cos(0)  // 1
```

#### `tan(x: number): number`

Returns the tangent of an angle in radians.

**Example:**

```text
use { tan, PI } from @sentrie/js as math
let value = math.tan(math.PI / 4)  // ≈ 1
```

#### `asin(x: number): number`

Returns the arcsine (inverse sine) of a number in radians.

**Example:**

```text
use { asin } from @sentrie/js as math
let value = math.asin(1)  // ≈ 1.5708 (π/2)
```

#### `acos(x: number): number`

Returns the arccosine (inverse cosine) of a number in radians.

**Example:**

```text
use { acos } from @sentrie/js as math
let value = math.acos(1)  // 0
```

#### `atan(x: number): number`

Returns the arctangent (inverse tangent) of a number in radians.

**Example:**

```text
use { atan } from @sentrie/js as math
let value = math.atan(1)  // ≈ 0.7854 (π/4)
```

#### `atan2(y: number, x: number): number`

Returns the arctangent of the quotient of its arguments.

**Example:**

```text
use { atan2, PI } from @sentrie/js as math
let value = math.atan2(1, 0)  // ≈ 1.5708 (π/2)
```

### Hyperbolic Functions

#### `sinh(x: number): number`

Returns the hyperbolic sine of a number.

#### `cosh(x: number): number`

Returns the hyperbolic cosine of a number.

#### `tanh(x: number): number`

Returns the hyperbolic tangent of a number.

### Random Number Generation

#### `random(): number`

Returns a random number between 0 (inclusive) and 1 (exclusive).

**Example:**

```text
use { random } from @sentrie/js as math
let value = math.random()  // 0.0 to 1.0
```

## Math Constants

- **`E`** - Euler's number (e ≈ 2.718281828459045)
- **`PI`** - Pi (π ≈ 3.141592653589793)
- **`LN2`** - Natural logarithm of 2 (ln(2) ≈ 0.6931471805599453)
- **`LN10`** - Natural logarithm of 10 (ln(10) ≈ 2.302585092994046)
- **`LOG2E`** - Base-2 logarithm of e (log₂(e) ≈ 1.4426950408889634)
- **`LOG10E`** - Base-10 logarithm of e (log₁₀(e) ≈ 0.4342944819032518)
- **`SQRT2`** - Square root of 2 (√2 ≈ 1.4142135623730951)
- **`SQRT1_2`** - Square root of 0.5 (1/√2 ≈ 0.7071067811865476)
- **`MAX_VALUE`** - Maximum finite value representable as a number
- **`MIN_VALUE`** - Smallest positive non-zero value representable as a number

## String Functions

#### `length(str: string): number`

Returns the length of a string.

**Example:**

```text
use { length } from @sentrie/js as str
let len = str.length("hello")  // 5
```

#### `fromCharCode(...codes: number[]): string`

Returns a string created from the specified sequence of UTF-16 code units.

**Example:**

```text
use { fromCharCode } from @sentrie/js as str
let str = str.fromCharCode(72, 101, 108, 108, 111)  // "Hello"
```

## Number Functions

#### `isNaN(value: any): boolean`

Determines whether a value is NaN (Not-a-Number).

**Example:**

```text
use { isNaN } from @sentrie/js as num
let result = num.isNaN(NaN)  // true
```

#### `parseInt(str: string, radix?: number): number`

Parses a string and returns an integer.

**Example:**

```text
use { parseInt } from @sentrie/js as num
let value = num.parseInt("123")  // 123
```

#### `parseFloat(str: string): number`

Parses a string and returns a floating point number.

**Example:**

```text
use { parseFloat } from @sentrie/js as num
let value = num.parseFloat("123.45")  // 123.45
```

#### `isFinite(value: any): boolean`

Determines whether a value is a finite number.

**Example:**

```text
use { isFinite } from @sentrie/js as num
let result = num.isFinite(123)  // true
```

#### `isInteger(value: any): boolean`

Determines whether a value is an integer.

**Example:**

```text
use { isInteger } from @sentrie/js as num
let result = num.isInteger(123)  // true
```

## Date Functions

#### `now(): number`

Returns the number of milliseconds elapsed since January 1, 1970 UTC.

**Example:**

```text
use { now } from @sentrie/js as date
let timestamp = date.now()  // 1234567890123
```

#### `dateParse(dateString: string): number`

Parses a date string and returns the number of milliseconds since January 1, 1970 UTC.

**Example:**

```text
use { dateParse } from @sentrie/js as date
let timestamp = date.dateParse("2023-01-01")  // 1672531200000
```

#### `UTC(year: number, month: number, ...): number`

Returns the number of milliseconds in a Date object since January 1, 1970 UTC.

**Example:**

```text
use { UTC } from @sentrie/js as date
let timestamp = date.UTC(2023, 0, 1)  // 1672531200000
```

## JSON Functions

#### `parse(text: string): any`

Parses a JSON string and returns the corresponding value.

**Example:**

```text
use { parse } from @sentrie/js as json
let obj = json.parse('{"name": "John", "age": 30}')
```

#### `stringify(value: any): string`

Converts a value to a JSON string.

**Example:**

```text
use { stringify } from @sentrie/js as json
let str = json.stringify({"name": "John", "age": 30})  // '{"name":"John","age":30}'
```

## Array Functions

#### `isArray(value: any): boolean`

Determines whether a value is an array.

**Example:**

```text
use { isArray } from @sentrie/js as arr
let result = arr.isArray([1, 2, 3])  // true
```

#### `from(arrayLike: any): any[]`

Creates a new array from an array-like or iterable object.

**Example:**

```text
use { from } from @sentrie/js as arr
let newArray = arr.from("hello")  // ["h", "e", "l", "l", "o"]
```

#### `of(...elements: any[]): any[]`

Creates a new array with the given elements.

**Example:**

```text
use { of } from @sentrie/js as arr
let newArray = arr.of(1, 2, 3)  // [1, 2, 3]
```

## Complete Example

```text
namespace com/example/mypolicy

policy mypolicy {
  fact price!: number
  fact data!: string

  use { round, floor, ceil, max, min } from @sentrie/js as math
  use { length, fromCharCode } from @sentrie/js as str
  use { parse, stringify } from @sentrie/js as json
  use { isValid } from @sentrie/json as jsonUtil

  rule processData = default false {
    let roundedPrice = math.round(price)
    let strLength = str.length(data)
    let parsed = json.parse(data)
    let isValid = jsonUtil.isValid(data)
    let maxPrice = math.max(price, 100)
    yield roundedPrice > 0 and strLength > 0 and isValid
  }

  export decision of processData
}
```
