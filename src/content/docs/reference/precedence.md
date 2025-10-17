---
title: Precedence
description: Operator precedence determines the order of operations in expressions.
---

Operator precedence defines which operations are performed first when multiple operators appear in an expression. Higher precedence operations are evaluated before lower precedence ones.

## Precedence Table (highest to lowest)

| Precedence | Operators                                         | Description                                                 |
| ---------- | ------------------------------------------------- | ----------------------------------------------------------- |
| 1          | `()`, `[]`, `.`                                   | Primary expressions (literals, identifiers, function calls) |
| 2          | `not`, `!`, `+`, `-`                              | Unary operators                                             |
| 3          | `*`, `/`, `%`                                     | Multiplicative arithmetic                                   |
| 4          | `+`, `-`                                          | Additive arithmetic                                         |
| 5          | `<`, `<=`, `>`, `>=`, `in`, `matches`, `contains` | Comparison operators                                        |
| 6          | `==`, `!=`, `is`, `is not`                        | Equality operators                                          |
| 7          | `and`                                             | Logical AND                                                 |
| 8          | `xor`                                             | Logical XOR                                                 |
| 9          | `or`                                              | Logical OR                                                  |
| 10         | `? :`                                             | Ternary conditional                                         |

## Examples

### Arithmetic Precedence

```sentrie
let result: number = 2 + 3 * 4         -- Result: 14 (not 20)
let calculation: number = 10 / 2 + 3 -- Result: 8.0 (not 1.25)
```

### Comparison vs Arithmetic

```sentrie
let is_valid: bool = 5 + 3 > 7     -- Result: true
let check: bool = 10 * 2 == 20     -- Result: true
```

### Logical Precedence

```sentrie
let complex: bool = true and false or true  -- Result: true
let mixed: bool = 5 > 3 and 2 < 4           -- Result: true
```

### Ternary Precedence

```sentrie
let value: number = 5 > 3 ? 10 : 20                       -- Result: 10
let nested: string = true ? (false ? "A" : "B") : "C"  -- Result: "B"
```

## Using Parentheses

### Override Precedence

```sentrie
-- Without parentheses (follows precedence)
let result1: number = 2 + 3 * 4        -- Result: 14

-- With parentheses (override precedence)
let result2: number = (2 + 3) * 4      -- Result: 20
```

### Complex Expressions

```sentrie
-- Clear grouping for readability
let access: bool = (user.age >= 18 and user.verified) or
                  (user.role == "admin" and user.active)

-- Mixed operations
let calculation: number = (10 + 5) * (3 - 1) / 2  -- Result: 15.0

-- Same precedence is evaluated from left to right
let calculation: number = (10 + 5) * (5 - 2) / 2  -- Result: 22.5 (15 * 3 / 2)

```

## Best Practices

### Use Parentheses for Clarity

```sentrie
-- Good: Clear intent
let result: bool = (a and b) or (c and d)

-- Avoid: Relying on precedence knowledge
let result: bool = a and b or c and d
```

### Group Related Operations

```sentrie
-- Good: Logical grouping
let price: number = (base_price + tax) * discount_rate

-- Good: Comparison grouping
let valid: bool = (age >= 18) and (income > 50000)
```

### Break Complex Expressions

```sentrie
-- Good: Step-by-step calculation
let temp1: number = base_price + tax
let temp2: number = temp1 * discount_rate
let final_price: number = temp2 - shipping

-- Avoid: One complex expression
let final_price: number = (base_price + tax) * discount_rate - shipping
```
