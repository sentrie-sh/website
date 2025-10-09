---
title: Namespaces
description: Namespaces are a way to organize your policies and shapes.
---

Namespaces are a way to organize your policies and shapes. These MUST be declared at the top of a `*.sentrie` file.

Namespaces form a natural hierarchy using the `/` delimiter.

A `namespace` is a container for related:

- policies
- shapes
- child namespaces

## Syntax

```text
// policy.sentrie
-- This is a namespace declaration
namespace fully/qualified/namespace/name
```

Where `FQN` (Fully Qualified Name) is a slash-separated identifier:

```text
namespace com/example/auth
namespace com/example/billing
namespace com/company/finance/reports
namespace mycompany/policies/security
namespace mycompany/policies/privacy/gdpr
```

In the above example, the namespace nesting looks like this:

```
com
|-- example
|   |-- auth
|   |-- billing
|-- company
|   |-- finance
|       |-- reports

mycompany
|-- policies
|   |-- security
|   |   |-- ...
|   |-- privacy
|   |   |-- gdpr
|   |   |-- ...
```

## Rules

- Namespaces must be declared at the top of the file (only comments can be placed before the namespace declaration)
- Only one namespace per file
- Namespace names must be valid identifiers
- Use slash-separated (`/`) hierarchical names for organization
- Multiple root namespaces are allowed in a policy pack
- Namespace forms the visibility boundary for unexported shapes

## Best Practices

- Use descriptive namespace names that reflect their purpose
- Group related policies and shapes in namespaces - refer to [Policies](/reference/policies/) and [Shapes](/reference/shapes/)
- Keep individual policies and shapes within a namespace focused on specific domains or features
- Consider using consistent naming patterns across your team
