# [Feature Name]

[A short, conversational paragraph explaining what this is and the exact problem it solves. Write as if you are explaining it to a colleague. Focus on the "why"—e.g., "When you need to guarantee the exact structure of an incoming payload before evaluating it, use Shapes."]

Here is the basic syntax:

```typescript
// The formal definition or type signature
```

## Configuration & Arguments

[A brief, friendly sentence setting up the table, e.g., "You can customize the behavior using the following parameters:"]

| Argument    | Type   | Required | What it does                                  |
| :---------- | :----- | :------- | :-------------------------------------------- |
| `paramName` | `Type` | Yes/No   | A plain-English explanation of this argument. |

**Returns:** `ReturnType` — [Explain what the developer gets back in plain English, e.g., "A validated object, or it aborts the evaluation if constraints fail."]

---

## Examples in Action

### [Scenario 1: e.g., Validating a standard user profile]

[One to two sentences explaining the real-world context of this example. Why would a developer actually write this?]

```typescript
// Clean, copy-pasteable code using realistic variable names
// like userAge or billingAddress instead of foo and bar.
```

### [Scenario 2: e.g., Handling complex nested objects]

[Context for the advanced use case. What edge case or complexity does this solve?]

```typescript
// Advanced example code showing composition or error handling.
```

---

## Good to Know

Before you implement this, keep a few boundaries in mind to ensure predictable execution:

- **[Constraint]:** [e.g., "Sentrie evaluates these strictly. If an incoming payload includes keys not defined in your Shape, the evaluation will fail."]
- **[Performance tip]:** [e.g., "If you are validating deeply nested JSON, keep your recursion depth under X for optimal performance."]
- **[Edge case]:** [e.g., "Null values are only accepted if you explicitly use the `.nullable()` modifier."]
