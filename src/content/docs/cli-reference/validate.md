---
title: "sentrie validate"
description: "Validate pack structure, syntax, and types without executing policies."
---

When you want to catch policy and pack errors before running or deploying (e.g. in CI or before a release), you use `sentrie validate`. It loads the pack and checks structure, syntax, names, types, and references without executing any rules, so you get fast feedback and no side effects.

Here is the basic syntax:

```bash
sentrie validate [ --pack-location <PATH> ] [ --capabilities <FILE> ]
```

`validate` checks the whole pack. It takes no target and no facts.

:::caution[Breaking change]
`sentrie validate` no longer accepts a `namespace/policy` or `namespace/policy/rule` target, and the `--facts` flag is removed. Earlier releases accepted both and ignored them: the whole pack was always validated, and no facts were ever checked. A command such as `sentrie validate com/example/auth/access` now fails with `validate takes no arguments`, and `--facts` fails with `flag '--facts' is not defined for command 'validate'`. Delete the target and the flag from your scripts and CI jobs. To check facts against a policy, run [sentrie exec](/cli-reference/exec) with those facts.
:::

## Configuration & Arguments

You can point validation at a specific pack using the following options:

| Argument | Type | Required | What it does |
| :------- | :--- | :------- | :----------- |
| `--pack-location` | path | No | Directory containing the policy pack. Default: `./`. |
| `--capabilities` | path | No | Capabilities file limiting the builtins and modules the pack may use. Default: allow everything. |

**Returns:** Exit 0 if validation succeeds; non-zero with an error message on stderr if pack loading, parsing, or any static check fails. No decision output; validation only.

---

## Examples in Action

### Validating the pack in the current directory

You have just edited a policy and want to confirm the whole pack loads and passes its static checks before committing.

```bash
sentrie validate
```

### Validating from a specific pack path

Your pack lives in a different directory (e.g. a monorepo subfolder).

```bash
sentrie validate --pack-location ./policy-pack
```

### A rule that refers to itself

This pack is rejected, because `r` is defined in terms of itself and could never finish evaluating:

```sentrie
namespace com/example/auth

policy access {
  rule r = r

  export decision of r
}
```

```text
Error: validation error: rule 'com/example/auth/access/r' references itself at a.sentrie:4:12-13: infinite recursion: com/example/auth/access/r -> com/example/auth/access/r: index error
```

### An undefined identifier

The typo `usr` names nothing in scope, so `validate` reports it with its position, before any request reaches the rule:

```sentrie
namespace com/example/auth

shape User {
  role: string
  status: string
}

policy access {
  fact user: User

  rule allow = default false {
    yield user.role == "admin" and usr.status == "active"
  }

  export decision of allow
}
```

```text
Error: validation error: identifier 'usr' not found at a.sentrie:12:36-39: it is not a parameter, let, fact, data, rule or derive in scope: index error
```

Fixing the typo to `user.status` makes the same pack pass.

---

## Good to Know

Before you rely on this in CI, keep a few boundaries in mind:

- **Constraint:** Validation checks pack file structure, policy parsing and syntax, namespace/policy/rule references, type annotations and shape constraints, and executor creation (including TypeScript module loading). It does not execute rules and does not take facts. Errors are printed to stderr; no table or JSON decision output.
- **Edge case:** An unreadable pack, a parse error, or a failed static check gives a non-zero exit, and validation stops at the first failing check. A stray positional argument, such as a leftover `namespace/policy` target, is an error rather than being ignored. Unlike `exec`, validate does not run policies or produce decision output; use [sentrie exec](/cli-reference/exec) for execution.
- **Constraint:** Validation checks every constraint's arguments: their number, their kinds, and arguments that can never work, such as a pattern that does not compile or `@multiple_of(0)`. See [Constraint Arguments](/reference/constraints#constraint-arguments).
- **Constraint:** Validation detects reference cycles between the rules and lets of a policy, whatever expression the reference sits in: operators, calls, index access, casts, transforms, list and map literals (keys as well as values), lambda bodies and import `with` values. A cycle fails with `infinite recursion: a -> b -> a`, the error `exec` would otherwise hit on the first evaluation. A rule or `let` that refers directly to itself (`rule r = r`) fails the same way, including when the reference sits in a block, a `when` condition or a `default` value. A reference to the rule's own name inside a lambda body is not reported, and neither is one inside an attach expression.
- **Constraint:** Validation checks that every shape a type names exists and is visible from where it is written: in facts, `let`s, casts (`as`), `is` checks, shape fields and aliases, derive and lambda parameter and return types, and element types inside `list`, `dict` and `record`. A missing shape, or one another namespace does not export, is reported at its position, even in a `let` no rule uses. Shapes named inside a derive resolve in the derive's scope, and a shape's fields resolve where the shape is declared.
- **Constraint:** Validation reports an identifier that names nothing in scope, wherever an expression is evaluated: rule bodies, `when` conditions, `default` values, `let`s, fact defaults, contributions, attachments and import `with` values. The error carries a hint when the name is a `use` alias used as a value (call its functions as `utils.<function>(...)`), a name imported from a module and called without its alias, or a builtin used as a value (call it as `count(...)`). Names bound anywhere in the same policy by a lambda parameter or a block `let` are never reported, because the runtime resolves `let`s and rules in the context that reads them.
- **Edge case:** Validation does not check the types of literal expressions yet. A rule such as `let z = 1 + true` passes `validate` and fails when `exec` evaluates it (static type checks of literals are planned as a follow-up).
