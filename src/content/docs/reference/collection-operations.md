---
title: Collection Operations
description: Collection operations provide powerful ways to transform, filter, and analyze collections in Sentrie.
---

Sentrie provides a comprehensive set of collection operations that allow you to manipulate and analyze lists and maps declaratively. These operations are essential for working with collections of data in policies.

## Overview

Collection operations in Sentrie are **only valid on collections** (lists and maps) and provide functional programming capabilities for data transformation. Each operation follows a consistent syntax pattern and returns new collections or values without modifying the original data.

## Filter Operation

The `filter` operation creates a new collection containing only elements that satisfy a given condition.

### Syntax

```sentrie
filter collection as element, index { yield expression }
```

The `yield` statement returns a `bool` value. Only elements for which the predicate is truthy are included in the result. The `index` parameter is optional.

### Basic Examples

```sentrie
let numbers: list[int] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

-- Filter even numbers
let evens: list[int] = filter numbers as num, idx {
  yield num % 2 == 0
}
-- Result: [2, 4, 6, 8, 10]

-- Filter numbers greater than 5
let large_numbers: list[int] = filter numbers as num, idx {
  yield num > 5
}
-- Result: [6, 7, 8, 9, 10]

-- Filter numbers at even indices
let even_indexed: list[int] = filter numbers as num, idx {
  yield idx % 2 == 0
}
-- Result: [1, 3, 5, 7, 9]
```

### Complex Filtering Conditions

```sentrie
let scores: list[int] = [85, 92, 78, 96, 85, 88, 91, 77, 94, 89]

-- Filter passing scores (>= 80)
let passing_scores: list[int] = filter scores as score, idx {
  yield score >= 80
}
-- Result: [85, 92, 96, 85, 88, 91, 94, 89]

-- Filter scores in top 20%
let top_scores: list[int] = filter scores as score, idx {
  yield score >= 90
}
-- Result: [92, 96, 91, 94]

-- Filter scores that are above average
let above_average: list[int] = filter scores as score, idx {
  -- Calculate average (simplified for example)
  yield score > 87
}
-- Result: [92, 96, 88, 91, 94, 89]
```

### Working with Shapes

```sentrie
shape Employee {
  name!: string
  department!: string
  salary!: float
  years_experience: int
}

let employees: list[Employee] = [
  { name: "Alice", department: "Engineering", salary: 95000.0, years_experience: 5 },
  { name: "Bob", department: "Marketing", salary: 75000.0, years_experience: 3 },
  { name: "Charlie", department: "Engineering", salary: 110000.0, years_experience: 8 },
  { name: "Diana", department: "Sales", salary: 65000.0, years_experience: 2 },
  { name: "Eve", department: "Engineering", salary: 85000.0, years_experience: 4 }
]

-- Filter by department
let engineers: list[Employee] = filter employees as emp, idx {
  yield emp.department == "Engineering"
}
-- Result: Alice, Charlie, Eve

-- Filter by salary
let high_earners: list[Employee] = filter employees as emp, idx {
  yield emp.salary >= 90000.0
}
-- Result: Alice, Charlie

-- Filter by experience
let experienced: list[Employee] = filter employees as emp, idx {
  yield emp.years_experience >= 5
}
-- Result: Alice, Charlie

-- Complex condition: Engineering with high salary
let senior_engineers: list[Employee] = filter employees as emp, idx {
  yield emp.department == "Engineering" and emp.salary >= 90000.0
}
-- Result: Alice, Charlie
```

### String Filtering

```sentrie
let words: list[string] = ["apple", "banana", "cherry", "date", "elderberry", "fig"]

-- Filter words starting with 'a'
let a_words: list[string] = filter words as word, idx {
  yield word.starts_with("a")
}
-- Result: ["apple"]

-- Filter words longer than 5 characters
let long_words: list[string] = filter words as word, idx {
  yield word.length() > 5
}
-- Result: ["banana", "cherry", "elderberry"]

-- Filter words containing 'e'
let e_words: list[string] = filter words as word, idx {
  yield word.has_substring("e")
}
-- Result: ["apple", "cherry", "elderberry"]
```

## Map Operation

The `map` operation applies a function to each element of a collection, creating a new collection with the transformed values.

### Syntax

```sentrie
map collection as element, index { yield expression }
```

The `yield` statement returns the new element value for the resulting collection. The `index` parameter is optional and represents the position of the element in the collection.

### Basic Examples

```sentrie
let numbers: list[int] = [1, 2, 3, 4, 5]

-- Double each number
let doubled: list[int] = map numbers as num, idx {
  yield num * 2
}
-- Result: [2, 4, 6, 8, 10]

-- Square each number
let squared: list[int] = map numbers as num, idx {
  yield num * num
}
-- Result: [1, 4, 9, 16, 25]

-- Convert numbers to strings
let strings: list[string] = map numbers as num, idx {
  yield num.toString()
}
-- Result: ["1", "2", "3", "4", "5"]
```

### Using Index Parameter

```sentrie
let fruits: list[string] = ["apple", "banana", "cherry"]

-- Add index to each fruit name
let indexed_fruits: list[string] = map fruits as fruit, idx {
  yield (idx + 1).toString() + ". " + fruit
}
-- Result: ["1. apple", "2. banana", "3. cherry"]

-- Create pairs of index and value
let pairs: list[string] = map fruits as fruit, idx {
  yield "(" + idx.toString() + ", " + fruit + ")"
}
-- Result: ["(0, apple)", "(1, banana)", "(2, cherry)"]
```

### Working with Shapes

```sentrie
shape User {
  name!: string
  age: int
  email?: string
}

let users: list[User] = [
  { name: "Alice", age: 25, email: "alice@example.com" },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 35, email: "charlie@example.com" }
]

-- Extract names
let names: list[string] = map users as user, idx {
  yield user.name
}
-- Result: ["Alice", "Bob", "Charlie"]

-- Create user summaries
let summaries: list[string] = map users as user, idx {
  let email_text: string = user.email is defined ? " (" + user.email + ")" : " (no email)"
  yield user.name + ", age " + user.age.toString() + email_text
}
-- Result: ["Alice, age 25 (alice@example.com)", "Bob, age 30 (no email)", "Charlie, age 35 (charlie@example.com)"]

-- Calculate birth years (assuming current year is 2024)
let birth_years: list[int] = map users as user, idx {
  yield 2024 - user.age
}
-- Result: [1999, 1994, 1989]
```

### Complex Transformations

```sentrie
shape Product {
  id!: string
  name!: string
  price!: float
  category!: string
}

let products: list[Product] = [
  { id: "1", name: "Laptop", price: 999.99, category: "Electronics" },
  { id: "2", name: "Book", price: 19.99, category: "Books" },
  { id: "3", name: "Mouse", price: 29.99, category: "Electronics" }
]

-- Apply discount and format prices
let discounted_products: list[string] = map products as product, idx {
  let discounted_price: float = product.price * 0.9  -- 10% discount
  yield product.name + " - $" + discounted_price.toString() + " (was $" + product.price.toString() + ")"
}
-- Result: ["Laptop - $899.991 (was $999.99)", "Book - $17.991 (was $19.99)", "Mouse - $26.991 (was $29.99)"]

-- Create product codes
let product_codes: list[string] = map products as product, idx {
  let category_code: string = product.category == "Electronics" ? "E" : "B"
  yield category_code + (idx + 1).toString() + "-" + product.id
}
-- Result: ["E1-1", "B2-2", "E3-3"]
```

## Reduce Operation

The `reduce` operation combines all elements of a collection into a single value using an accumulator function.

### Syntax

```sentrie
reduce collection from initialValue as element, index { yield expression }
```

The `yield` statement returns the new accumulator value. The `index` parameter is optional.

### Basic Examples

```sentrie
let numbers: list[int] = [1, 2, 3, 4, 5]

-- Sum all numbers
let sum: int = reduce numbers from 0 as num, idx {
  yield num + num
}
-- Result: 15

-- Find the maximum number
let max: int = reduce numbers from numbers[0] as num, idx {
  yield num > num ? num : num
}
-- Result: 5

-- Find the minimum number
let min: int = reduce numbers from numbers[0] as num, idx {
  yield num < num ? num : num
}
-- Result: 1

-- Count elements
let count: int = reduce numbers from 0 as num, idx {
  yield idx + 1
}
-- Result: 5
```

### String Operations

```sentrie
let words: list[string] = ["Hello", "World", "Sentrie"]

-- Concatenate strings
let sentence: string = reduce words from "" as word, idx {
  yield word + (idx == 0 ? "" : " ") + word
}
-- Result: "Hello World Sentrie"

-- Find longest word
let longest: string = reduce words from words[0] as word, idx {
  yield word.length() > word.length() ? word : word
}
-- Result: "Sentrie"

-- Count total characters
let total_chars: int = reduce words from 0 as word, idx {
  yield word.length()
}
-- Result: 16
```

### Complex Aggregations

```sentrie
shape Sale {
  product!: string
  quantity!: int
  price!: float
}

let sales: list[Sale] = [
  { product: "Laptop", quantity: 2, price: 999.99 },
  { product: "Mouse", quantity: 5, price: 29.99 },
  { product: "Keyboard", quantity: 3, price: 79.99 },
  { product: "Laptop", quantity: 1, price: 999.99 }
]

-- Calculate total revenue
let total_revenue: float = reduce sales from 0.0 as sale, idx {
  yield sale.quantity * sale.price
}
-- Result: 2 * 999.99 + 5 * 29.99 + 3 * 79.99 + 1 * 999.99 = 3399.89

-- Count total items sold
let total_items: int = reduce sales from 0 as sale, idx {
  yield sale.quantity
}
-- Result: 2 + 5 + 3 + 1 = 11

-- Find most expensive sale
let max_sale_value: float = reduce sales from 0.0 as sale, idx {
  let sale_value: float = sale.quantity * sale.price
  yield sale_value > sale_value ? sale_value : sale_value
}
-- Result: 1999.98 (2 * 999.99)
```

## Distinct Operation

The `distinct` operation removes duplicate elements from a collection, keeping only unique values.

### Syntax

```sentrie
distinct collection as left, right { yield expression }
```

The `yield` statement returns a `bool` value. If the predicate is truthy, the left and right values are considered the same and not included in the result.

### Basic Examples

```sentrie
let numbers: list[int] = [1, 2, 2, 3, 3, 3, 4, 5]

-- Remove duplicates (default behavior)
let unique_numbers: list[int] = distinct numbers as left, right {
  yield left == right
}
-- Result: [1, 2, 3, 4, 5]

let colors: list[string] = ["red", "blue", "green", "red", "yellow", "blue"]

-- Remove duplicate colors
let unique_colors: list[string] = distinct colors as left, right {
  yield left == right
}
-- Result: ["red", "blue", "green", "yellow"]
```

### Custom Equality Logic

```sentrie
shape Person {
  name!: string
  age: int
}

let people: list[Person] = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Alice", age: 25 },  -- Duplicate
  { name: "Charlie", age: 35 },
  { name: "Bob", age: 30 }     -- Duplicate
]

-- Remove duplicates based on name
let unique_by_name: list[Person] = distinct people as left, right {
  yield left.name == right.name
}
-- Result: Alice, Bob, Charlie

-- Remove duplicates based on age
let unique_by_age: list[Person] = distinct people as left, right {
  yield left.age == right.age
}
-- Result: Alice (25), Bob (30), Charlie (35)
```

### Complex Deduplication

```sentrie
shape Product {
  id!: string
  name!: string
  price!: float
  category!: string
}

let products: list[Product] = [
  { id: "1", name: "Laptop", price: 999.99, category: "Electronics" },
  { id: "2", name: "Mouse", price: 29.99, category: "Electronics" },
  { id: "1", name: "Laptop", price: 999.99, category: "Electronics" },  -- Duplicate
  { id: "3", name: "Book", price: 19.99, category: "Books" },
  { id: "4", name: "Laptop", price: 1099.99, category: "Electronics" }  -- Different price
]

-- Remove duplicates by ID
let unique_by_id: list[Product] = distinct products as left, right {
  yield left.id == right.id
}
-- Result: Removes the duplicate laptop with same ID

-- Remove duplicates by name and category
let unique_by_name_category: list[Product] = distinct products as left, right {
  yield left.name == right.name and left.category == right.category
}
-- Result: Keeps both laptops (different prices) but removes exact duplicates
```

## Count Operation

The `count` operation returns the number of elements in a collection.

### Syntax

```sentrie
count collection
```

### Basic Examples

```sentrie
let numbers: list[int] = [1, 2, 3, 4, 5]
let total: int = count numbers
-- Result: 5

let empty_list: list[string] = []
let empty_count: int = count empty_list
-- Result: 0

let single_item: list[int] = [42]
let single_count: int = count single_item
-- Result: 1
```

### Counting with Conditions

```sentrie
let scores: list[int] = [85, 92, 78, 96, 85, 88]

-- Count passing scores (>= 80)
let passing_scores: list[int] = filter scores as score, idx {
  yield score >= 80
}
let passing_count: int = count passing_scores
-- Result: 5

-- Count failing scores (< 80)
let failing_scores: list[int] = filter scores as score, idx {
  yield score < 80
}
let failing_count: int = count failing_scores
-- Result: 1

-- Count scores in different ranges
let excellent_scores: list[int] = filter scores as score, idx {
  yield score >= 90
}
let excellent_count: int = count excellent_scores
-- Result: 2

let good_scores: list[int] = filter scores as score, idx {
  yield score >= 80 and score < 90
}
let good_count: int = count good_scores
-- Result: 3
```

### Counting Shape Properties

```sentrie
shape User {
  name!: string
  age: int
  department!: string
  active: bool
}

let users: list[User] = [
  { name: "Alice", age: 25, department: "Engineering", active: true },
  { name: "Bob", age: 17, department: "Engineering", active: false },
  { name: "Charlie", age: 30, department: "Marketing", active: true },
  { name: "Diana", age: 28, department: "Engineering", active: true },
  { name: "Eve", age: 16, department: "Marketing", active: false }
]

-- Count total users
let total_users: int = count users
-- Result: 5

-- Count active users
let active_users_list: list[User] = filter users as user, idx {
  yield user.active
}
let active_users: int = count active_users_list
-- Result: 3

-- Count users by department
let engineering_users: list[User] = filter users as user, idx {
  yield user.department == "Engineering"
}
let engineering_count: int = count engineering_users
-- Result: 3

let marketing_users: list[User] = filter users as user, idx {
  yield user.department == "Marketing"
}
let marketing_count: int = count marketing_users
-- Result: 2

-- Count adult users
let adult_users: list[User] = filter users as user, idx {
  yield user.age >= 18
}
let adult_count: int = count adult_users
-- Result: 3
```

## Chaining Operations

Collection operations can be chained together to create complex data transformations:

```sentrie
shape Employee {
  name!: string
  age: int
  department!: string
  salary!: float
  years_experience: int
}

let employees: list[Employee] = [
  { name: "Alice", age: 25, department: "Engineering", salary: 95000.0, years_experience: 5 },
  { name: "Bob", age: 17, department: "Engineering", salary: 75000.0, years_experience: 3 },
  { name: "Charlie", age: 30, department: "Marketing", salary: 110000.0, years_experience: 8 },
  { name: "Diana", age: 28, department: "Engineering", salary: 85000.0, years_experience: 4 },
  { name: "Eve", age: 16, department: "Marketing", salary: 65000.0, years_experience: 2 }
]

-- Get names of adult engineers with high salary
let senior_engineers: list[string] = map filter filter employees as emp, idx {
  yield emp.age >= 18
} as emp, idx {
  yield emp.department == "Engineering"
} as emp, idx {
  yield emp.salary >= 90000.0
} as emp, idx {
  yield emp.name
}
-- Result: ["Alice"]

-- Calculate average salary of experienced employees
let experienced_employees: list[Employee] = filter employees as emp, idx {
  yield emp.years_experience >= 5
}

let total_salary: float = reduce experienced_employees from 0.0 as emp, idx {
  yield emp.salary
}

let avg_salary: float = total_salary / count experienced_employees
-- Result: (95000.0 + 110000.0) / 2 = 102500.0

-- Get unique departments
let departments: list[string] = map employees as emp, idx {
  yield emp.department
}

let unique_departments: list[string] = distinct departments as left, right {
  yield left == right
}
-- Result: ["Engineering", "Marketing"]
```

## Performance Considerations

- **Lazy Evaluation**: Collection operations are evaluated lazily when possible
- **Memory Efficiency**: Operations create new collections rather than modifying existing ones
- **Optimization**: The Sentrie runtime optimizes common operation patterns
- **Index Access**: The `index` parameter is available for use when necessary

## Best Practices

### Use Meaningful Variable Names

```sentrie
-- Good
let adult_users: list[User] = filter users as user, idx {
  yield user.age >= 18
}

-- Avoid
let filtered: list[User] = filter users as user, idx {
  yield user.age >= 18
}
```

### Chain Operations Readably

```sentrie
-- Good: Each operation on its own line
let result: list[string] = map filter filter users as user, idx {
  yield user.age >= 18
} as user, idx {
  yield user.department == "Engineering"
} as user, idx {
  yield user.name
}

-- Avoid: All operations on one line
let result: list[string] = map filter filter users as user, idx { yield user.age >= 18 } as user, idx { yield user.department == "Engineering" } as user, idx { yield user.name }
```

### Use Appropriate Operations

```sentrie
-- Use count with filter instead of reduce for counting
let adult_users: list[User] = filter users as user, idx {
  yield user.age >= 18
}
let adult_count: int = count adult_users

-- Use distinct for deduplication
let unique_names: list[string] = distinct names as left, right {
  yield left == right
}
```

### Handle Edge Cases

```sentrie
-- Check for empty collections
let safe_count: int = count users
let has_users: bool = safe_count > 0

-- Handle optional fields safely
let emails: list[string] = map filter users as user, idx {
  yield user.email is defined
} as user, idx {
  yield user.email
}
```
