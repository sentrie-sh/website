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
filter collection as element, index block_expression
```

The `yield` statement returns a `bool` value. Only elements for which the predicate is truthy are included in the result. The `index` parameter is optional.

### Basic Examples

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

-- Filter even numbers
let evens: list[number] = filter numbers as num, idx {
  yield num % 2 == 0
}
-- Result: [2, 4, 6, 8, 10]

-- Filter numbers greater than 5
let large_numbers: list[number] = filter numbers as num, idx {
  yield num > 5
}
-- Result: [6, 7, 8, 9, 10]

-- Filter numbers at even indices
let even_indexed: list[number] = filter numbers as num, idx {
  yield idx % 2 == 0
}
-- Result: [1, 3, 5, 7, 9]
```

### Complex Filtering Conditions

```sentrie
let scores: list[number] = [85, 92, 78, 96, 85, 88, 91, 77, 94, 89]

-- Filter passing scores (>= 80)
let passing_scores: list[number] = filter scores as score, idx {
  yield score >= 80
}
-- Result: [85, 92, 96, 85, 88, 91, 94, 89]

-- Filter scores in top 20%
let top_scores: list[number] = filter scores as score, idx {
  yield score >= 90
}
-- Result: [92, 96, 91, 94]

-- Filter scores that are above average
let above_average: list[number] = filter scores as score, idx {
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
  salary!: number
  years_experience: number
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

## First Operation

The `first` operation returns the first element in a collection that satisfies a given condition. Unlike `any` which returns a boolean, `first` returns the actual element value.

### Syntax

```sentrie
first collection as element, index block_expression
```

The `yield` statement returns a `bool` value. The operation returns the first element for which the predicate is truthy. If no element satisfies the condition, it returns `undefined`. The `index` parameter is optional.

### Basic Examples

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

-- Find first even number
let first_even: number = first numbers as num, idx {
  yield num % 2 == 0
}
-- Result: 2

-- Find first number greater than 5
let first_large: number = first numbers as num, idx {
  yield num > 5
}
-- Result: 6

-- Find first number at even index
let first_even_indexed: number = first numbers as num, idx {
  yield idx % 2 == 0
}
-- Result: 1 (first element at index 0)

-- Find first negative number (none exist)
let first_negative: number = first numbers as num, idx {
  yield num < 0
}
-- Result: undefined
```

### Working with Shapes

```sentrie
shape Employee {
  name!: string
  department!: string
  salary!: number
  years_experience: number
}

let employees: list[Employee] = [
  { name: "Alice", department: "Engineering", salary: 95000.0, years_experience: 5 },
  { name: "Bob", department: "Marketing", salary: 75000.0, years_experience: 3 },
  { name: "Charlie", department: "Engineering", salary: 110000.0, years_experience: 8 },
  { name: "Diana", department: "Sales", salary: 65000.0, years_experience: 2 },
  { name: "Eve", department: "Engineering", salary: 85000.0, years_experience: 4 }
]

-- Find first engineer
let first_engineer: Employee = first employees as emp, idx {
  yield emp.department == "Engineering"
}
-- Result: Alice

-- Find first high earner
let first_high_earner: Employee = first employees as emp, idx {
  yield emp.salary >= 90000.0
}
-- Result: Alice

-- Find first experienced employee
let first_experienced: Employee = first employees as emp, idx {
  yield emp.years_experience >= 5
}
-- Result: Alice

-- Find first sales person
let first_sales: Employee = first employees as emp, idx {
  yield emp.department == "Sales"
}
-- Result: Diana
```

### String Operations

```sentrie
let words: list[string] = ["apple", "banana", "cherry", "date", "elderberry", "fig"]

-- Find first word starting with 'a'
let first_a_word: string = first words as word, idx {
  yield word.starts_with("a")
}
-- Result: "apple"

-- Find first word longer than 5 characters
let first_long_word: string = first words as word, idx {
  yield word.length() > 5
}
-- Result: "banana"

-- Find first word containing 'e'
let first_e_word: string = first words as word, idx {
  yield word.has_substring("e")
}
-- Result: "apple"

-- Find first word starting with 'z' (none exist)
let first_z_word: string = first words as word, idx {
  yield word.starts_with("z")
}
-- Result: undefined
```

### Complex Conditions

```sentrie
shape Product {
  id!: string
  name!: string
  price!: number
  category!: string
  in_stock: bool
}

let products: list[Product] = [
  { id: "1", name: "Laptop", price: 999.99, category: "Electronics", in_stock: true },
  { id: "2", name: "Mouse", price: 29.99, category: "Electronics", in_stock: false },
  { id: "3", name: "Book", price: 19.99, category: "Books", in_stock: true },
  { id: "4", name: "Keyboard", price: 79.99, category: "Electronics", in_stock: true },
  { id: "5", name: "Tablet", price: 599.99, category: "Electronics", in_stock: false }
]

-- Find first in-stock electronics under $100
let first_affordable_electronics: Product = first products as product, idx {
  yield product.category == "Electronics" and product.in_stock and product.price < 100.0
}
-- Result: Keyboard

-- Find first expensive product (over $500)
let first_expensive: Product = first products as product, idx {
  yield product.price > 500.0
}
-- Result: Laptop

-- Find first out-of-stock item
let first_out_of_stock: Product = first products as product, idx {
  yield not product.in_stock
}
-- Result: Mouse

-- Find first book
let first_book: Product = first products as product, idx {
  yield product.category == "Books"
}
-- Result: Book
```

### Practical Use Cases

```sentrie
shape User {
  name!: string
  email!: string
  verified: bool
  last_login: string
}

let users: list[User] = [
  { name: "Alice", email: "alice@example.com", verified: true, last_login: "2024-01-15" },
  { name: "Bob", email: "bob@example.com", verified: false, last_login: "2024-01-10" },
  { name: "Charlie", email: "charlie@example.com", verified: true, last_login: "2024-01-20" },
  { name: "Diana", email: "diana@example.com", verified: false, last_login: "2024-01-05" }
]

-- Find first verified user
let first_verified: User = first users as user, idx {
  yield user.verified
}
-- Result: Alice

-- Find first user with recent login (after 2024-01-12)
let first_recent_user: User = first users as user, idx {
  yield user.last_login > "2024-01-12"
}
-- Result: Alice

-- Find first unverified user
let first_unverified: User = first users as user, idx {
  yield not user.verified
}
-- Result: Bob

-- Find first user with specific email domain
let first_gmail_user: User = first users as user, idx {
  yield user.email.has_substring("@gmail.com")
}
-- Result: undefined (no Gmail users)
```

### Comparison with Other Operations

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

-- any: returns boolean
let has_even: bool = any numbers as num, idx {
  yield num % 2 == 0
}
-- Result: true

-- first: returns the actual value
let first_even: number = first numbers as num, idx {
  yield num % 2 == 0
}
-- Result: 2

-- filter: returns all matching elements
let all_even: list[number] = filter numbers as num, idx {
  yield num % 2 == 0
}
-- Result: [2, 4, 6, 8, 10]

-- Using first with undefined check
let first_large: number = first numbers as num, idx {
  yield num > 15
}
let has_large: bool = first_large is defined
-- Result: false (first_large is undefined)
```

## Map Operation

The `map` operation applies a function to each element of a collection, creating a new collection with the transformed values.

### Syntax

```sentrie
map collection as element, index block_expression
```

The `yield` statement returns the new element value for the resulting collection. The `index` parameter is optional and represents the position of the element in the collection.

### Basic Examples

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5]

-- Double each number
let doubled: list[number] = map numbers as num, idx {
  yield num * 2
}
-- Result: [2, 4, 6, 8, 10]

-- Square each number
let squared: list[number] = map numbers as num, idx {
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
  age: number
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
let birth_years: list[number] = map users as user, idx {
  yield 2024 - user.age
}
-- Result: [1999, 1994, 1989]
```

### Complex Transformations

```sentrie
shape Product {
  id!: string
  name!: string
  price!: number
  category!: string
}

let products: list[Product] = [
  { id: "1", name: "Laptop", price: 999.99, category: "Electronics" },
  { id: "2", name: "Book", price: 19.99, category: "Books" },
  { id: "3", name: "Mouse", price: 29.99, category: "Electronics" }
]

-- Apply discount and format prices
let discounted_products: list[string] = map products as product, idx {
  let discounted_price: number = product.price * 0.9  -- 10% discount
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
reduce collection from initialValue as accumulator, element, index block_expression
```

The `yield` statement evaluates the new `accumulator` value. The `index` parameter is optional.

### Basic Examples

```sentrie
let numbers: list[number] = [1, 2, 3, 4, 5]

-- Sum all numbers
let sum: number = reduce numbers from 0 as acc, num, idx {
  yield acc + num
}
-- Result: 15

-- Find the maximum number
let max: number = reduce numbers from numbers[0] as acc, num, idx {
  yield num > acc ? num : acc
}
-- Result: 5

-- Find the minimum number
let min: number = reduce numbers from numbers[0] as acc, num, idx {
  yield num < acc ? num : acc
}
-- Result: 1

-- Count elements
let count: number = reduce numbers from 0 as acc, num, idx {
  yield acc + 1
}
-- Result: 5
```

### String Operations

```sentrie
let words: list[string] = ["Hello", "World", "Sentrie"]

-- Concatenate strings
let sentence: string = reduce words from "" as acc, word, idx {
  yield acc + (idx == 0 ? "" : " ") + word
}
-- Result: "Hello World Sentrie"

-- Find longest word
let longest: string = reduce words from words[0] as acc, word, idx {
  yield count(word) > count(acc) ? word : acc
}
-- Result: "Sentrie"

-- Count total characters
let total_chars: number = reduce words from 0 as acc, word, idx {
  yield acc + count(word)
}
-- Result: 16
```

### Complex Aggregations

```sentrie
shape Sale {
  product!: string
  quantity!: number
  price!: number
}

let sales: list[Sale] = [
  { product: "Laptop", quantity: 2, price: 999.99 },
  { product: "Mouse", quantity: 5, price: 29.99 },
  { product: "Keyboard", quantity: 3, price: 79.99 },
  { product: "Laptop", quantity: 1, price: 999.99 }
]

-- Calculate total revenue
let total_revenue: number = reduce sales from 0.0 as total_sale, sale, idx {
  yield total_sale + (sale.quantity * sale.price)
}
-- Result: 2 * 999.99 + 5 * 29.99 + 3 * 79.99 + 1 * 999.99 = 3399.89

-- Count total items sold
let total_items: number = reduce sales from 0 as total_sale, sale, idx {
  yield total_sale + sale.quantity
}
-- Result: 2 + 5 + 3 + 1 = 11

-- Find most expensive sale
let max_sale_value: number = reduce sales from 0.0 as sale, idx {
  let sale_value: number = sale.quantity * sale.price
  yield sale_value > sale_value ? sale_value : sale_value
}
-- Result: 1999.98 (2 * 999.99)
```

## Distinct Operation

The `distinct` operation removes duplicate elements from a collection, keeping only unique values.

### Syntax

```sentrie
distinct collection as left, right block_expression
```

The `yield` statement returns a `bool` value. If the predicate is truthy, the left and right values are considered the same and not included in the result.

### Basic Examples

```sentrie
let numbers: list[number] = [1, 2, 2, 3, 3, 3, 4, 5]

-- Remove duplicates (default behavior)
let unique_numbers: list[number] = distinct numbers as left, right {
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
  age: number
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
  price!: number
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
let numbers: list[number] = [1, 2, 3, 4, 5]
let total: number = count numbers
-- Result: 5

let empty_list: list[string] = []
let empty_count: number = count empty_list
-- Result: 0

let single_item: list[number] = [42]
let single_count: number = count single_item
-- Result: 1
```

### Counting with Conditions

```sentrie
let scores: list[number] = [85, 92, 78, 96, 85, 88]

-- Count passing scores (>= 80)
let passing_scores: list[number] = filter scores as score, idx {
  yield score >= 80
}
let passing_count: number = count passing_scores
-- Result: 5

-- Count failing scores (< 80)
let failing_scores: list[number] = filter scores as score, idx {
  yield score < 80
}
let failing_count: number = count failing_scores
-- Result: 1

-- Count scores in different ranges
let excellent_scores: list[number] = filter scores as score, idx {
  yield score >= 90
}
let excellent_count: number = count excellent_scores
-- Result: 2

let good_scores: list[number] = filter scores as score, idx {
  yield score >= 80 and score < 90
}
let good_count: number = count good_scores
-- Result: 3
```

### Counting Shape Properties

```sentrie
shape User {
  name!: string
  age: number
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
let total_users: number = count users
-- Result: 5

-- Count active users
let active_users_list: list[User] = filter users as user, idx {
  yield user.active
}
let active_users: number = count active_users_list
-- Result: 3

-- Count users by department
let engineering_users: list[User] = filter users as user, idx {
  yield user.department == "Engineering"
}
let engineering_count: number = count engineering_users
-- Result: 3

let marketing_users: list[User] = filter users as user, idx {
  yield user.department == "Marketing"
}
let marketing_count: number = count marketing_users
-- Result: 2

-- Count adult users
let adult_users: list[User] = filter users as user, idx {
  yield user.age >= 18
}
let adult_count: number = count adult_users
-- Result: 3
```

## Chaining Operations

Collection operations can be chained together to create complex data transformations:

```sentrie
shape Employee {
  name!: string
  age: number
  department!: string
  salary!: number
  years_experience: number
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

let total_salary: number = reduce experienced_employees from 0.0 as emp, idx {
  yield emp.salary
}

let avg_salary: number = total_salary / count experienced_employees
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
let adult_count: number = count adult_users

-- Use distinct for deduplication
let unique_names: list[string] = distinct names as left, right {
  yield left == right
}
```

### Handle Edge Cases

```sentrie
-- Check for empty collections
let safe_count: number = count users
let has_users: bool = safe_count > 0

-- Handle optional fields safely
let emails: list[string] = map filter users as user, idx {
  yield user.email is defined
} as user, idx {
  yield user.email
}
```
