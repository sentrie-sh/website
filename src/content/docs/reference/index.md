---
title: Policy Language Reference
description: Exhaustive dictionary of Sentrie language syntax and features.
---


This section is a strict reference for the Sentrie policy language: syntax, types, operators, and constructs. For conceptual overviews, see [Language Concepts](/language-concepts/type-system-shapes).

## Syntax

A program is one namespace per file, then top-level policies and shapes:

```text
namespace FQN
policy IDENT { ... }
shape IDENT { ... }
export shape IDENT
```

## Reference Pages

**Core:** [Namespaces](/reference/namespaces) · [Policies](/reference/policies) · [Rules](/reference/rules) · [Facts](/reference/facts) · [Intermediate values (let)](/reference/let)

**Types:** [Types and values](/reference/types-and-values) · [Constraints](/reference/constraints) · [Trinary](/reference/trinary) · [Shapes](/reference/shapes)

**Operations:** [Arithmetic](/reference/arithmetic-operations) · [Boolean](/reference/boolean-operations) · [Collection operations](/reference/collection-operations) · [Functions](/reference/functions) · [Precedence](/reference/precedence)

**Other:** [Security and permissions](/reference/security-and-permissions)

**TypeScript:** [Built-in TypeScript modules](/reference/typescript_modules/) (overview and per-module pages)

**Composition:** [Policy composition](/language-concepts/policy-composition) (export/import) · [Writing custom TypeScript modules](/extensibility/writing-custom-typescript-modules)

## Good to Know

Before you implement this, keep a few boundaries in mind:

- One namespace per file; namespace must be the first statement (comments allowed before).
- Policies must export at least one rule to be executable or importable.
- All inputs and outputs in the reference are explicitly typed; edge cases are listed on each feature page.
