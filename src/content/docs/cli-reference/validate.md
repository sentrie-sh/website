---
title: "sentrie validate"
description: "Validate pack structure, syntax, and types without executing policies."
---

When you want to catch policy and pack errors before running or deploying (e.g. in CI or before a release), you use `sentrie validate`. It loads the pack and checks structure, syntax, types, and references without executing any rules—so you get fast feedback and no side effects.

Here is the basic syntax:

```bash
sentrie validate <TARGET> [ --pack-location <PATH> ] [ --facts <JSON> ]
```

**TARGET** is required (`namespace/policy` or `namespace/policy/rule`). **--pack-location** and **--facts** are optional; facts are used for type-checking when provided.

## Configuration & Arguments

You can point validation at a specific policy and pack using the following options:

| Argument | Type | Required | What it does |
| :------- | :--- | :------- | :----------- |
| TARGET | string | Yes | `namespace/policy` or `namespace/policy/rule`. Namespace and policy must exist; rule is optional (used for context). |
| `--pack-location` | path | No | Directory containing the policy pack. Default: `./`. |
| `--facts` | JSON string | No | Facts for type checking. Validates that fact types and required/optional match declarations. Default: `{}`. |

**Returns:** Exit 0 if validation succeeds; non-zero with error messages if pack loading, parsing, type checking, or executor creation fails. No decision output; validation only.

---

## Examples in Action

### Validating a policy in the current directory

You have just edited a policy and want to confirm it loads and type-checks before committing.

```bash
sentrie validate com/example/user_management/user_access
```

### Validating from a specific pack path

Your pack lives in a different directory (e.g. a monorepo subfolder).

```bash
sentrie validate com/example/auth/access_control --pack-location ./policy-pack
```

### Type-checking facts against policy declarations

You want to ensure that the fact shapes and required/optional flags match the JSON you plan to send at runtime.

```bash
sentrie validate com/example/user_management/user_access \
  --facts '{"user":{"role":"admin","status":"active"}}'
```

---

## Good to Know

Before you rely on this in CI, keep a few boundaries in mind:

- **Constraint:** Validation checks pack file structure, policy parsing and syntax, namespace/policy/rule references, type annotations and shape constraints, and executor creation (including TypeScript module loading). It does not execute rules. When `--facts` is provided, it validates that fact types and required/optional match declarations and that values satisfy shapes. Errors are printed to stderr; no table or JSON decision output.
- **Edge case:** Invalid or missing TARGET (unknown namespace/policy) → error. Pack load failure, parse error, type error, or reference error → non-zero exit. `--facts` must be valid JSON; invalid JSON → error. Unlike `exec`, validate does not run policies or produce decision output; use [sentrie exec](/cli-reference/exec) for execution.
