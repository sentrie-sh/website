---
title: "sentrie validate"
description: "Validate pack structure, syntax, and types without executing policies."
---

`validate` loads a policy pack and checks pack file, policy syntax, types, and references. It does not run policies. Use it in CI or before deployment to catch errors early.

## Syntax

```bash
sentrie validate <TARGET> [ --pack-location <PATH> ] [ --facts <JSON> ]
```

- **TARGET:** `namespace/policy` or `namespace/policy/rule`. Required. Identifies the policy (and optionally rule) to validate in context.
- **--pack-location:** Pack root directory. Default: `./`.
- **--facts:** Optional JSON object for type-checking facts against declarations.

## Options

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| TARGET | string | Yes | `namespace/policy` or `namespace/policy/rule`. Namespace and policy must exist; rule is optional (used for context). |
| `--pack-location` | path | No | Directory containing the policy pack. Default: `./`. |
| `--facts` | JSON string | No | Facts for type checking. Validates that fact types and required/optional match declarations. Default: `{}`. |

**Returns:** Exit 0 if validation succeeds; non-zero with error messages if pack loading, parsing, type checking, or executor creation fails. No decision output; validation only.

## Examples

### Basic Usage

Validate a policy in the current directory:

```bash
sentrie validate com/example/user_management/user_access
```

Validate from a specific pack path:

```bash
sentrie validate com/example/auth/access_control --pack-location ./policy-pack
```

### Advanced Usage

Validate with facts for type checking:

```bash
sentrie validate com/example/user_management/user_access \
  --facts '{"user":{"role":"admin","status":"active"}}'
```

## Behavior & Constraints

- **Checks performed:** Pack file structure (`sentrie.pack.toml`), policy file parsing and syntax, namespace/policy/rule references, type annotations and shape constraints, and executor creation (including TypeScript module loading). Does not execute rules.
- **Facts:** When `--facts` is provided, validates that fact types and required/optional match policy declarations and that values satisfy shapes.
- **Output:** Errors printed to stderr; no table or JSON decision output.

## Constraints & Edge Cases

- Invalid or missing TARGET (unknown namespace/policy) → error.
- Pack load failure, parse error, type error, or reference error → non-zero exit; fix pack and re-run.
- `--facts` must be valid JSON; invalid JSON → error.
- Differs from `exec`: validate does not run policies or produce decision output; use `exec` for execution and results. See [sentrie exec](/cli-reference/exec) for execution.
