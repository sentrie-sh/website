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

Language keywords are reserved and cannot be used as identifiers. Examples: `let`, `rule`, `policy`, `namespace`, `fact`, `shape`, `export`, `use`, `when`, `default`, `true`, `false`, `unknown`, `and`, `or`, `xor`, `not`, `in`, `is`, `cast`, `yield`, and type names like `string`, `number`, `list`, `map`. So you cannot name a rule `let` or a variable `when`. Use a name that is not a keyword (e.g. `myLet`, `defaultValue`).

## Where identifiers are used

- **Namespace FQN segments:** Each part of a fully qualified name (e.g. `com` / `example` / `auth`) must be a valid identifier.
- **Policy, rule, shape, fact, let names:** The name after the keyword must be a valid identifier (and not a keyword).
- **Shape field names, aliases (e.g. `as alias`), map dot access:** Must be valid identifiers when used in source. Map keys at runtime are strings; dot access in source (e.g. `map.key`) requires `key` to be a valid identifier.

## Good to Know

- Identifiers are ASCII-only: letters, digits, underscore. No Unicode letters in identifiers.
- If the lexer sees a keyword where an identifier is expected (e.g. a policy named `let`), it reports a parse error. Choose names that are not reserved.
