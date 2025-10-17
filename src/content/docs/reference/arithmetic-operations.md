---
title: Arithmetic Operations
description: Arithmetic operations provide mathematical calculations on numeric values in Sentrie.
---

Sentrie supports standard arithmetic operations for working with numeric values. All numeric operations work with the unified `number` type, which is backed by float64.

## Basic Operations

### Addition (`+`)

```sentrie
let sum: number = 5 + 3        -- Result: 8
let total: number = 2.5 + 1.5  -- Result: 4.0
```

### Subtraction (`-`)

```sentrie
let difference: number = 10 - 7    -- Result: 3
let result: number = 5.5 - 2.5     -- Result: 3.0
```

### Multiplication (`*`)

```sentrie
let product: number = 4 * 6     -- Result: 24
let area: number = 3.75 * 2.0   -- Result: 7.5
```

### Division (`/`)

```sentrie
let quotient: number = 15 / 3    -- Result: 5.0
let precise: number = 7 / 2      -- Result: 3.5
```

### Modulo (`%`)

```sentrie
let remainder: number = 10 % 3    -- Result: 1
let even_check: number = 8 % 2    -- Result: 0
```

## Division and Precision

### Integer Division

```sentrie
let result: number = 8 / 3       -- Result: 2.6666666666666665
let whole: number = 10 / 2       -- Result: 5.0
```

Division always returns a numeric result.

### Zero Division

```sentrie
-- This will cause an error
let invalid: number = 5 / 0     -- Error: division by zero
```

## Mixed Mode Arithmetic

### Mixed Numeric Operations

```sentrie
let mixed_add: number = 5 + 2.5      -- Result: 7.5
let mixed_multiply: number = 3 * 1.5 -- Result: 4.5
let result: number = 10 - 7.2        -- Result: 2.8
```

All numeric values are handled uniformly as the `number` type.

## Practical Examples

### Shape Calculations

```sentrie
shape Rectangle {
  width!: number
  height!: number
}

fact rect: Rectangle

let area: number = rect.width * rect.height
let perimeter: number = 2 * (rect.width + rect.height)
let aspect_ratio: number = rect.width / rect.height
```

### Percentages and Discounts

```sentrie
let price: number = 100.0
let discount_percent: number = 15
let discount_amount: number = price * (discount_percent / 100.0)
let final_price: number = price - discount_amount
-- Result: 85.0
```

### Statistical Operations

```sentrie
let scores: list[number] = [85, 92, 78, 96]
let total: number = reduce scores from 0 as score, idx { yield score }
let average: number = total / count scores
-- Result: 87.75
```

## Best Practices

### Use Explicit Types

```sentrie
-- Good: Clear type intention
let precise_result: number = 7 / 3

-- Avoid: Type inference confusion
let result = 7 / 3
```

### Handle Division by Zero

```sentrie
let divisor: number = 0
let safe_result: number = divisor != 0 ? 10 / divisor : 0.0
```

### Use Parentheses for Clarity

```sentrie
-- Good: Clear precedence
let result: number = (2 + 3) * 4

-- Avoid: Relying on operator precedence
let result: number = 2 + 3 * 4
```
