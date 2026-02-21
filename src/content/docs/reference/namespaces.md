---
title: Namespaces
description: Namespace syntax and rules for organizing policies and shapes.
---

When you need to group policies and shapes and control which shapes are visible where, you put them under a namespace. Each `*.sentrie` file has exactly one namespace, and it must be the first statement. The namespace is the visibility boundary: unexported shapes are visible only within the same namespace.

Here is the basic syntax:

```text
namespace fully/qualified/name
```

The name is slash-separated identifiers (e.g. `com/example/auth`, `mycompany/policies/security`).

## Configuration & Arguments

You declare a namespace with a single path:

| Argument | Type | Required | What it does |
| :------- | :--- | :------- | :----------- |
| FQN | identifier path | Yes | Slash-separated identifiers; forms the namespace for that file. |

**Returns:** N/A (declaration).

---

## Examples in Action

### Organizing policies by product or team

You want a clear hierarchy so policies for auth, billing, or privacy live under different path segments.

```text
namespace com/example/auth
namespace com/example/billing/v2
```

### Using a deep path for a specific feature

You are grouping policies for a narrow feature (e.g. GDPR) under a long path.

```text
namespace mycompany/policies/privacy/gdpr
```

---

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Only comments may appear before the namespace declaration. One namespace per file. Multiple root namespaces are allowed across a pack (in different files).
- **Edge case:** Namespace names must be valid identifiers. Child “namespaces” are not separate declarations; hierarchy is by naming convention (e.g. `a/b/c`). No leading or trailing slash.
