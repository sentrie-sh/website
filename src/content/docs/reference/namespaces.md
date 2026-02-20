---
title: Namespaces
description: Namespace syntax and rules for organizing policies and shapes.
---

# Namespaces

Namespaces group policies and shapes and form the visibility boundary for unexported shapes. Each `*.sentrie` file has exactly one namespace and it must be the first statement.

## Syntax

```text
namespace fully/qualified/name
```

FQN is slash-separated identifiers (e.g. `com/example/auth`, `mycompany/policies/security`).

## Parameters

| Element | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| FQN | identifier path | Yes | Slash-separated; valid identifiers only. |

**Returns:** N/A (declaration).

## Examples

### Basic Usage

```text
namespace com/example/auth
namespace com/example/billing/v2
```

### Advanced Usage

```text
namespace mycompany/policies/privacy/gdpr
```

## Behavior & Constraints

- Only comments may appear before the namespace declaration.
- One namespace per file.
- Namespace forms the visibility boundary: unexported shapes are visible only within the same namespace.
- Multiple root namespaces are allowed across a policy pack (different files).

## Constraints & Edge Cases

- Namespace names must be valid identifiers.
- Child “namespaces” are not separate declarations; hierarchy is by naming convention (e.g. `a/b/c`).
