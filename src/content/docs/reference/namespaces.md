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

Where `FQN` (Fully Qualified Name) is one or more [identifiers](/reference/identifiers) separated by forward slashes, with no leading or trailing slash. The first segment must be an identifier, not a keyword; later segments may be identifiers or keywords (see [Keyword segments](#keyword-segments)):

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

## Keyword segments

The first segment of a namespace name must be an identifier, not a keyword. Later segments may be identifiers or keywords, so `namespace constraints/in` and `namespace text/string` are valid.

A keyword segment works everywhere the namespace is named: `import decision ok from text/string/p`, a shape base (`shape T with text/string/Item`), and any type position (`fact i: text/string/Item`, `x as text/string/Item`). In expressions, a derive call such as `text/string/f(x)` and a check such as `x is text/string/Item` work too.

The exception is a keyword that can start an expression: `not`, `true`, `false`, `unknown`, `null` and `transform`. After a `/` in an expression these keep their usual meaning, so `a/not b` is `a / (not b)` and `a/true` divides by `true`. A namespace with one of these as a segment can still be declared, imported from and used in types, but a slash path through it cannot call its derives or name its shapes in an `is` check.

### Keyword as a later segment

```text
namespace constraints/in
namespace text/string
```

## Rules

- Namespaces must be declared at the top of the file (only comments can be placed before the namespace declaration; those comments do not drop later declarations)
- Only one namespace per file (a second `namespace` statement is an error)
- Namespace names must be valid [identifiers](/reference/identifiers); the first segment cannot be a keyword, later segments may be
- Use slash-separated (`/`) hierarchical names for organization
- Multiple root namespaces are allowed in a policy pack
- Namespace forms the visibility boundary for unexported shapes
- Exported shapes from another namespace may be used as a [composition](/reference/shapes#shape-composition) base, written with the qualified name, such as `shape B with com/base/A`. An unqualified `with A` never finds another namespace's export

## Best Practices

- Use descriptive namespace names that reflect their purpose
- Group related policies and shapes in namespaces - refer to [Policies](/reference/policies/) and [Shapes](/reference/shapes/)
- Keep individual policies and shapes within a namespace focused on specific domains or features
- Consider using consistent naming patterns across your team
