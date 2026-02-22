---
title: Namespaces
description: "Namespace syntax, placement rules, visibility of shapes and policies, and cross-file behavior."
---

Namespaces group [policies](/reference/policies) and [shapes](/reference/shapes) and define visibility boundaries. Each `*.sentrie` file has exactly one namespace declaration. The namespace must be the first statement in the file (only comments may appear before it). Unexported shapes are visible only within the same namespace; exported shapes can be referenced from other namespaces.

## Syntax

```text
namespace fully/qualified/name
```

The name is a **fully qualified name (FQN)**: one or more identifiers separated by forward slashes (e.g. `com/example/auth`, `mycompany/policies/security`, `app/v1`). No leading or trailing slash. Each segment must be a valid identifier.

## Configuration & Arguments

| Element | Type | Required | Description |
| :------ | :--- | :------- | :---------- |
| FQN | identifier path | Yes | Slash-separated identifiers. Forms the namespace for every declaration (policies, shapes) in this file. |

**Returns:** N/A (declaration). The namespace does not produce a value; it attaches a scope to the declarations that follow.

## Placement and ordering rules

- **First statement:** The namespace declaration must be the first statement in the file. Only comments (line or block) may appear before it.
- **One per file:** Exactly one namespace per `*.sentrie` file. Multiple files in a pack may declare different namespaces; the pack can therefore contain multiple root namespaces.
- **No nesting syntax:** The language does not have separate “nested” namespace blocks. Hierarchy is by naming convention: e.g. `a/b/c` is a single FQN; there is no separate declaration for `a` or `a/b`.

## Visibility and cross-namespace reference

- **Policies and shapes** declared in a file belong to that file’s namespace. They are visible by simple name within the same namespace (same file or other files in the same pack that share the same namespace, if the tooling supports multiple files per namespace).
- **Exported shapes:** A shape can be exported with `export shape Name`. Exported shapes are visible to other namespaces for use as types (e.g. fact types, [composition](/reference/shapes) base). See [Policy composition](/language-concepts/policy-composition) and [Shapes](/reference/shapes) for how other namespaces refer to them.
- **Exported rules:** Rules are exported via `export decision of RuleName` inside a policy. Other namespaces can import and call those decisions; the namespace and policy identify the source.

## Examples in Action

### Single-segment and multi-segment namespaces

```text
namespace auth
namespace com/example/auth
namespace mycompany/policies/billing/v2
```

### Comments before namespace (allowed)

```text
// This file defines the auth policies.
namespace com/example/auth

policy allow { ... }
```

### Multiple namespaces in a pack (different files)

File `auth.sentrie`:

```text
namespace com/example/auth
policy P { ... }
```

File `billing.sentrie`:

```text
namespace com/example/billing
policy Q { ... }
```

The pack contains two namespaces. Import and resolution rules determine how one namespace references policies or exported shapes in another.

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Only comments may appear before the namespace declaration. One namespace per file. Multiple root namespaces are allowed across the pack (in different files).
- **Naming:** Each segment of the FQN must be a valid identifier. No leading or trailing slash. Child “namespaces” (e.g. `a` vs `a/b`) are not separate language constructs; hierarchy is by convention in the FQN string.
- **Resolution:** When another namespace references an exported shape or imports a decision, the full namespace path (and policy name, for rules) is used by the runtime/tooling to resolve the target. See [Policy composition](/language-concepts/policy-composition) for import syntax and behavior.
- **Files and namespaces:** The relationship between physical files and namespace FQNs is tooling-dependent; typically one file per namespace, but the reference does not forbid multiple files sharing the same namespace if the tooling supports it.
