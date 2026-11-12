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

Language keywords are reserved and cannot be used as identifiers. Using them as names (for rules, facts, shapes, etc.) will result in parse errors. The exception is a field name: see [Keywords as field names](#keywords-as-field-names).

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

Do not use any of these as the name of a rule, fact, policy, shape or let binding. For example, avoid naming a rule `let` or a fact `default`. Prefer descriptive names such as `userRule`, `defaultDecision`, or `currentUser` instead.

## Keywords as field names

Real data often has keys such as `title`, `version`, `default` or `in`. Any keyword can be used as a field name in three places: the name after a `.`, a shape field name (required or optional), and the name after `attach`.

```sentrie
namespace docs/fields

shape Doc {
  title: string
  version: string
  default?: number
  in: boolean
}

policy p {
  fact d: Doc
  fact input: document
  fact obj: document

  let t = d.title
  let v = input.version
  let def = d.default
  let deep = obj.true.null

  rule reads = { yield t + "/" + v }

  export decision of reads
    attach version as d.version
    attach default as 5
}
```

With `d` = `{"title": "T", "version": "1.2", "in": true}`, `input` = `{"version": "9"}` and `obj` = `{"true": {"null": 1}}`, the rule `reads` yields `"T/9"` and the decision carries `"attachments": {"version": "1.2", "default": 5}`.

Things to know:

- The word after a `.` is always a field name, so `x.in`, `x.not`, `x.is` and `x.true.null` are field accesses. An operator keeps its meaning when it comes after the access: `x.is is defined` reads the field `is` and then tests it, `2 in [x.in]` is a membership test and `x.contains contains 7` is the `contains` operator applied to the field `contains`.
- A key that is not an identifier, such as `a-b`, still needs brackets: `d["a-b"]`.
- Shape fields are separated by whitespace or newlines, not commas.
- A bare dict literal key must still be quoted: `{title: 1}` is a parse error, `{"title": 1}` works.
- Rule, fact, policy, shape and let names still cannot be keywords. `rule let = ...` is a parse error.
- `sentrie fmt` keeps keyword field names as written.

## Where identifiers are used

- **Namespace FQN segments:** Each part of a fully qualified name (e.g. `com` / `example` / `auth`) must be a valid identifier.
- **Policy, rule, shape, fact, let names:** The name after the keyword must be a valid identifier (and not a keyword).
- **Aliases (e.g. `as alias`):** Must be valid identifiers.
- **Field names:** Shape field names, the name after a `.` and `attach` names may be any identifier or any keyword. See [Keywords as field names](#keywords-as-field-names).

## Good to Know

- Identifiers are ASCII-only: letters, digits, underscore. No Unicode letters in identifiers.
- If the lexer sees a keyword where an identifier is expected (e.g. a policy named `let`), it reports a parse error. Choose names that are not reserved. Field names are the exception.
