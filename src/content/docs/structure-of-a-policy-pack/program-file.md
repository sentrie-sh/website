---
title: "*.sentrie"
description: "The program file is a file that contains the policy and shape definitions."
---

The `*.sentrie` files contain the core policy definitions and shape definitions written in the Sentrie language. These files form the heart of your policy system, defining rules, shapes, and other constructs that control business logic and data validation.

## Program Structure

A program file consists of:

- **Namespace declaration** (required)
- **Top-level declarations** (policies, shapes, shape exports)
  - **Shape declaration** (optional)
  - **Shape export** (optional)
  - **Policy declaration** (required)
- **Comments** (anywhere)

A program file can contain:

- Only one namespace.
- Multiple policy declarations.
- Multiple shape declarations.
- Multiple shape exports.

```hcl
namespace com/example/myapp

-- This is a comment
-- For multiline comments,
-- each
-- line must start with "--"
--

shape User {
  -- shape definition
}

shape Invoice {
  -- shape definition
}

-- export shapes to allow visibility to other namespaces
export shape User
export shape Invoice

policy auth {
  -- policy content
}

policy user {
  -- policy content
}

policy billing {
  -- policy content
}
```

### Policy structure

A `policy` statement is a container for related:

- facts
- variables
- rule declarations
- decision imports
- decision exports
- `use` declarations
- shape declarations

```hcl
namespace com/example/myauth

shape User {
  -- shape definition
}

policy auth {
  use { calculateAge } from "./utils.ts" as utils
  use { hash } from @sentrie/crypto -- will alias to crypto by default

  fact user!: User
  fact passwordInput!: string
  fact userAge!: number

  let isPasswordValid = crypto.md5(passwordInput) == user.passwordHash
  let calculatedUserAge = utils.calculateAge(user.birthDate)

  rule myrule = default false {
    yield
      isPasswordValid
      and
      userAge == calculatedUserAge
  }

  -- export the decision of this rule so that it can be used by other policies and the runtime can execute it
  export decision of myrule
}

```

## File Organization

**Flexible placement:**

- Can be located anywhere within the policy pack directory - or sub directories
- No required directory structure or naming conventions - organization is defined by namespaces
- Organize files based on your team's preferences and project needs
- Group related policies together for better maintainability

**Best practices:**

- Use descriptive policy names that reflect their purpose
- Group related policies in namespaces - refer to [Namespaces](/reference/namespaces/)
- Keep individual policies focused on specific domains or features
- Consider using consistent naming patterns across your team

## Declaration Types

**Policy declarations:**

- Business logic for different resources
- Conditional policies based on user attributes
- Time-based or context-aware rules

**Shape definitions:**

- Data validation schemas and shapes
- Input/output type definitions
- Structure validation for API requests

**Namespace declarations:**

- Logical grouping of related policies and shapes
- Hierarchical organization of rules
- Scoping and isolation of policy logic
- Import/export management

## Language Features

**Declarative syntax:**

- Clean, readable policy definitions
- Focus on **what**, not _how_ - business rules, not implementation details
- Easy to review and audit
- Natural language-like expressions (`user.role is "admin"`)

**Integration capabilities:**

- Reference TypeScript modules for complex logic
- Call external functions and APIs (using `use` statements)
- Access runtime data and context
