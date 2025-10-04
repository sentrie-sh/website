---
title: Arithmetic Operations
description: Arithmetic operations provide mathematical calculations on numeric values in Sentrie.
---

Sentrie supports standard arithmetic operations for working with numeric values. These operations work with both integer and floating-point numbers.

## Basic Operations

### Addition (`+`)

```sentrie
let sum: int = 5 + 3        -- Result: 8
let total: float = 2.5 + 1.5  -- Result: 4.0
```

### Subtraction (`-`)

```sentrie
let difference: int = 10 - 7    -- Result: 3
let result: float = 5.5 - 2.5  -- Result: 3.0
```

### Multiplication (`*`)

```sentrie
let product: int = 4 * 6        -- Result: 24
let area: float = 3.75 * 2.0   -- Result: 7.5
```

### Division (`/`)

```sentrie
let quotient: float = 15 / 3    -- Result: 5.0
let precise: float = 7 / 2      -- Result: 3.5
```

### Modulo (`%`)

```sentrie
let remainder: int = 10 % 3    -- Result: 1
let even_check: int = 8 % 2    -- Result: 0
```

## Division and Precision

### Integer Division

```sentrie
let result: float = 8 / 3      -- Result: 2.6666666666666665
let whole: float = 10 / 2       -- Result: 5.0
```

Division always returns a floating-point result, even when dividing integers.

### Zero Division

```sentrie
-- This will cause an error
let invalid: float = 5 / 0     -- Error: division by zero
```

## Mixed Mode Arithmetic

### Integer and Float Operations

```sentrie
let mixed_add: float = 5 + 2.5     -- Result: 7.5
let mixed_multiply: float = 3 * 1.5 -- Result: 4.5
let int_result: float = 10 - 7.2   -- Result: 2.8
```

The integer is automatically converted to a float for the calculation.

## Practical Examples

### Shape Calculations

```sentrie
shape Rectangle {
  width!: float
  height!: float
}

fact rect: Rectangle

let area: float = rect.width * rect.height
let perimeter: float = 2 * (rect.width + rect.height)
let aspect_ratio: float = rect.width / rect.height
```

### Percentages and Discounts

```sentrie
let price: float = 100.0
let discount_percent: int = 15
let discount_amount: float = price * (discount_percent / 100.0)
let final_price: float = price - discount_amount
-- Result: 85.0
```

### Statistical Operations

```sentrie
let scores: list[int] = [85, 92, 78, 96]
let total: int = reduce scores from 0 as score, idx { yield score }
let average: float = total / count scores
-- Result: 87.75
```

## Best Practices

### Use Explicit Types

```sentrie
-- Good: Clear type intention
let precise_result: float = 7 / 3

-- Avoid: Type inference confusion
let result = 7 / 3
```

### Handle Division by Zero

```sentrie
let divisor: int = 0
let safe_result: float = divisor != 0 ? 10 / divisor : 0.0
```

### Use Parentheses for Clarity

```sentrie
-- Good: Clear precedence
let result: float = (2 + 3) * 4

-- Avoid: Relying on operator precedence
let result: float = 2 + 3 * 4
```
