---
title: Policy Language Reference
description: Exhaustive dictionary of Sentrie language syntax, types, operators, and constructs.
---

This section is a strict reference for the Sentrie policy language. Every page is intended to be exhaustive: full syntax variants, all options and arguments in tables, when and where each feature applies, edge cases, and multiple examples. For conceptual overviews and “how it works,” see [Language Concepts](/language-concepts/type-system-shapes).

## Program structure

A program consists of one [namespace](/reference/namespaces) per file (the first statement), followed by top-level [policies](/reference/policies) and [shapes](/reference/shapes). Policies contain facts, let, use, rules, and exports. Shapes can be exported for use in other namespaces.

```text
namespace FQN
policy IDENT { fact ... let ... use ... rule ... export decision of IDENT }
shape IDENT { ... } | shape IDENT baseType @constraint
export shape IDENT
```

## Reference Pages

### Core

- **[Namespaces](/reference/namespaces):** One namespace per file, FQN syntax, placement, visibility of shapes and policies, cross-namespace reference.
- **[Policies](/reference/policies):** Policy block, statement order (facts, let, use, rules, export), evaluation.
- **[Rules](/reference/rules):** Rule syntax, when/default/body, outcome type, truthiness, cross-references.
- **[Facts](/reference/facts):** Required/optional facts, type, alias, default, binding at evaluation, import binding.
- **[Intermediate values (let)](/reference/let):** let syntax, scoping, immutability, type validation.

### Types

- **[Types and values](/reference/types-and-values):** Primitives, collections, indexing, cast, validation.
- **[Constraints](/reference/constraints):** Constraint syntax, full tables per type (number, string, list, trinary), when checked, collection and cast behavior.
- **[Trinary](/reference/trinary):** true/false/unknown, truthiness, Kleene AND/OR/NOT, use in when and conditionals.
- **[Shapes](/reference/shapes):** Data models, field modifiers (required/optional, nullable), composition, type aliases, export.

### Operations

- **[Arithmetic](/reference/arithmetic-operations):** +, -, *, /, %, unary +/-, types, division by zero.
- **[Boolean](/reference/boolean-operations):** and, or, xor, not, comparison, matches, ternary, Elvis.
- **[Collection operations](/reference/collection-operations):** any, all, filter, map, reduce, count, distinct.
- **[Functions](/reference/functions):** Function calls, use (import), aliasing, memoization.
- **[Precedence](/reference/precedence):** Operator precedence table, associativity, parentheses.
- **[Membership](/reference/membership-operations):** in, contains (list, map, string).

### Other

- **[Security and permissions](/reference/security-and-permissions):** Pack permissions (fs_read, net, env), defaults, configuration.

### TypeScript

- **[Built-in TypeScript modules](/reference/typescript_modules/):** Overview and per-module reference.

### Composition and extensibility

- **[Policy composition](/language-concepts/policy-composition):** Export/import of rules and facts.
- **[Writing custom TypeScript modules](/extensibility/writing-custom-typescript-modules):** Custom modules and use.

## Good to Know

- One namespace per file; namespace must be the first statement (comments allowed before).
- Policies must export at least one rule to be executable or importable.
- Each reference page lists syntax, configuration/arguments, examples, and edge cases; use them as the single source of truth for the language.
