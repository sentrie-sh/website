---
title: Identifiers
description: "What counts as a valid identifier: syntax rule, allowed characters, and reserved keywords."
---

Identifiers are names used for namespaces, policies, rules, facts, let bindings, shape and field names, aliases, and for map dot access keys. The lexer recognizes a **valid identifier** by a single rule.

## Syntax

An identifier is a token that:

1. **Starts with** a letter (`a`–`z`, `A`–`Z`) or an underscore (`_`).
2. **Continues with** zero or more of: letters (`a`–`z`, `A`–`Z`), digits (`0`–`9`), or underscores (`_`).

So: only ASCII letters, digits, and underscores. No spaces, hyphens, or other characters. The first character must not be a digit.

## Examples

| Valid   | Invalid (reason)         |
| :------ | :----------------------- |
| `x`     | `2x` (starts with digit) |
| `name`  | `my-name` (hyphen)       |
| `_priv` | `my name` (space)        |
| `a1`    | `a.b` (dot)              |
| `com`   |                          |

## Reserved keywords

Language keywords are reserved and cannot be used as identifiers. Using them as names (for rules, facts, shapes, etc.) will result in parse errors.

### Core keywords

| Keyword | Notes |
| :------ | :---- |
| `namespace` | Namespace declaration. |
| `policy` | Policy declaration. |
| `shape` | Shape declaration. |
| `fact` | Fact declaration. |
| `rule` | Rule declaration. |
| `export` | Exporting decisions or shapes. |
| `use` | Importing TypeScript modules. |
| `let` | Intermediate values. |
| `when` | Rule guard. |
| `default` | Default value for rules. |
| `yield` | Value returned from a rule body. |

### Literals and logical operators

| Keyword | Notes |
| :------ | :---- |
| `true` | Boolean literal. |
| `false` | Boolean literal. |
| `unknown` | Trinary literal. |
| `and` | Logical AND. |
| `or` | Logical OR. |
| `xor` | Logical XOR. |
| `not` | Logical NOT. |
| `in` | Membership operator. |
| `is` / `is not` | Type and existence checks. |

### Built-in types

| Keyword | Notes |
| :------ | :---- |
| `string` | String type. |
| `number` | Numeric type. |
| `bool` | Boolean type. |
| `trinary` | Three-valued logic type. |
| `document` | Unstructured JSON-like value. |
| `list` | List collection type. |
| `map` | Map collection type. |

Do not use any of these as identifiers. For example, avoid naming a rule `let` or a fact `default`. Prefer descriptive names such as `userRule`, `defaultDecision`, or `currentUser` instead.

## Where identifiers are used

- **Namespace FQN segments:** Each part of a fully qualified name (e.g. `com` / `example` / `auth`) must be a valid identifier.
- **Policy, rule, shape, fact, let names:** The name after the keyword must be a valid identifier (and not a keyword).
- **Shape field names, aliases (e.g. `as alias`), map dot access:** Must be valid identifiers when used in source. Map keys at runtime are strings; dot access in source (e.g. `map.key`) requires `key` to be a valid identifier.

## Good to Know

- Identifiers are ASCII-only: letters, digits, underscore. No Unicode letters in identifiers.
- If the lexer sees a keyword where an identifier is expected (e.g. a policy named `let`), it reports a parse error. Choose names that are not reserved.
