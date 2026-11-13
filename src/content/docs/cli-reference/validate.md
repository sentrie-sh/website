---
title: "validate Command"
description: "Validate a policy pack and its structure."
---

# validate Command

The `validate` command validates a policy pack's structure, syntax, names, types, and references without executing policies. This is useful for checking that your policies are correctly formatted and can be loaded before deployment.

## Syntax

```bash
sentrie validate [ --pack-location <PATH> ] [ --capabilities <FILE> ] [ --skip-engine-check ]
```

`validate` checks the whole pack. It takes no target and no facts.

:::caution[Breaking change]
`sentrie validate` no longer accepts a `namespace/policy` or `namespace/policy/rule` target, and the `--facts` flag is removed. Earlier releases accepted both and ignored them: the whole pack was always validated, and no facts were ever checked. A command such as `sentrie validate com/example/auth/access` now fails with `validate takes no arguments`, and `--facts` fails with `flag '--facts' is not defined for command 'validate'`. Delete the target and the flag from your scripts and CI jobs. To check facts against a policy, run [sentrie exec](/cli-reference/exec) with those facts.
:::

## Description

The `validate` command performs comprehensive validation of a policy pack:

1. **Pack Loading**: Validates the pack file (`sentrie.pack.toml`) structure
2. **Program Loading**: Loads and parses all `.sentrie` policy files
3. **Index Validation**: Validates namespace, policy, and rule references
4. **Type Checking**: Validates type annotations and constraints
5. **Executor Creation**: Attempts to create an executor to verify the pack is executable

If validation succeeds, the command exits with code 0. If any validation fails, it exits with a non-zero code and displays error messages.

## Options

### `--pack-location`

Specifies the directory containing the policy pack to validate.

```bash
sentrie validate --pack-location ./my-policy-pack
```

**Default:** `./` (current directory)

**Examples:**
- `--pack-location ./policies` - Validate policies from `./policies` directory
- `--pack-location /path/to/policy-pack` - Validate policies from absolute path

### `--capabilities`

Path to a capabilities file that limits the builtins and modules the pack may use.

```bash
sentrie validate --capabilities ./capabilities.json
```

**Default:** none, which allows everything.

### `--skip-engine-check`

Skips the check of the pack's `[engine]` version constraint against this binary.

```bash
sentrie validate --skip-engine-check
```

**Default:** `false`. See [`[engine]`](/structure-of-a-policy-pack/packfile#engine-optional).

## Examples

### Validate a policy pack in the current directory

`validate` checks the whole pack, so it takes no target.

```bash
sentrie validate
```

### Validate a policy pack from a specific location

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

## What Gets Validated

The `validate` command checks:

### 1. Pack File Structure
- Validates `sentrie.pack.toml` exists and is correctly formatted
- Checks pack metadata (name, version, schema version)
- Checks the pack's `[engine]` version constraint against the running binary. A mismatch is an error. Pass `--skip-engine-check` to skip it. See [`[engine]`](/structure-of-a-policy-pack/packfile#engine-optional)

### 2. Policy File Syntax
- Parses all `.sentrie` files in the pack
- Validates namespace declarations
- Checks policy and rule syntax
- Verifies shape definitions

### 3. Type System
- Validates type annotations on facts, variables, and expressions
- Checks shape field types and constraints
- Verifies constraint validations (min, max, length, etc.)
- Checks that every shape a type names exists and is visible from where it is written: in facts, `let`s, casts (`as`), `is` checks, shape fields and aliases, derive and lambda parameter and return types, and element types inside `list`, `dict` and `record`. A missing shape, or one another namespace does not export, is reported at its position, even in a `let` no rule uses. Shapes named inside a derive resolve in the derive's scope, and a shape's fields resolve where the shape is declared.
- Checks every constraint's arguments: their number, their kinds, and arguments that can never work, such as a pattern that does not compile or `@multiple_of(0)`. See [Constraint Arguments](/reference/constraints#constraint-arguments)

### 4. References
- Validates namespace, policy, and rule references
- Checks that imported rules exist
- Verifies exported shapes are accessible
- Validates rule imports and exports
- Detects reference cycles between the rules and lets of a policy, whatever expression the reference sits in: operators, calls, index access, casts, transforms, list and map literals (keys as well as values), lambda bodies and import `with` values. A cycle fails with `infinite recursion: a -> b -> a`, the error `exec` would otherwise hit on the first evaluation. A rule or `let` that refers directly to itself (`rule r = r`) fails the same way, including when the reference sits in a block, a `when` condition or a `default` value. An attach expression that reads the rule it is attached to (`export decision of r attach note as r`) is reported too, because `exec` fails on it the same way; attaching another rule is fine. A reference to the rule's own name inside a lambda body is not reported
- Reports an identifier that names nothing in scope, wherever an expression is evaluated: rule bodies, `when` conditions, `default` values, `let`s, fact defaults, contributions, attachments and import `with` values. The error carries a hint when the name is a `use` alias used as a value (call its functions as `utils.<function>(...)`), a name imported from a module and called without its alias, or a builtin used as a value (call it as `count(...)`). Names bound anywhere in the same policy by a lambda parameter or a block `let` are never reported, because the runtime resolves `let`s and rules in the context that reads them

### 5. Executor Creation
- Attempts to create a runtime executor
- Validates that all TypeScript modules can be loaded
- Checks that all dependencies are resolvable

## Exit Codes

- **0** - Validation succeeded
- **1** - Validation failed (with error messages)

Validation exits non-zero on any failed static check and stops at the first one. A stray positional argument, such as a leftover `namespace/policy` target, is an error rather than being ignored.

## Error Messages

Common validation errors include:

- **Pack loading errors**: Invalid pack file structure or missing pack file
- **Syntax errors**: Invalid policy syntax or grammar violations
- **Type errors**: Type mismatches or invalid type annotations
- **Reference errors**: Missing namespaces, policies, or rules
- **Constraint violations**: Values that don't satisfy shape constraints
- **Module errors**: Missing or invalid TypeScript modules
- **Arguments**: `validate takes no arguments`, `flag '--facts' is not defined for command 'validate'`, and `validate: unknown flag "-x": flags take two dashes, as in --pack-location`. Only words that start with two dashes are flags.

### Edge case: literals are not type-checked yet

Validation does not check the types of literal expressions yet. A rule such as `let z = 1 + true` passes `validate` and fails when `exec` evaluates it (static type checks of literals are planned as a follow-up).

## Use Cases

### Pre-deployment Validation

Validate policies before deploying to production:

```bash
sentrie validate --pack-location ./policies
```

### CI/CD Integration

Use in CI/CD pipelines to catch errors early:

```bash
#!/bin/bash
if ! sentrie validate --pack-location ./policy-pack; then
  echo "Validation failed!"
  exit 1
fi
```

`validate` always checks the whole pack and takes no target and no facts. Earlier releases accepted a `namespace/policy` target and a `--facts` flag and ignored both; they are now errors, so remove them from existing CI jobs. Among other things it fails the build on a rule that refers to itself (`rule r = r`) and on an identifier that names nothing in scope, such as a typo in a fact name.

### Checking facts

`validate` does not check facts. To exercise a policy against representative facts, run [sentrie exec](/cli-reference/exec) with `--fact-file`:

```bash
sentrie exec user_management/user_access --fact-file ./facts.json
```

## Differences from `exec`

| Feature | `validate` | `exec` |
|---------|-----------|--------|
| Executes policies | ❌ No | ✅ Yes |
| Validates structure | ✅ Yes | ✅ Yes |
| Validates types | ✅ Yes | ✅ Yes |
| Takes facts | ❌ No | ✅ Yes |
| Shows results | ❌ No | ✅ Yes |
| Output format | Text errors | Table/JSON |
| Use case | Pre-deployment | Testing/Execution |

## See Also

- [CLI Reference](/cli-reference) - Complete CLI documentation
- [Policy Language Reference](/reference) - Learn about writing policies
- [Structure of a Policy Pack](/structure-of-a-policy-pack/overview) - Learn about pack structure
