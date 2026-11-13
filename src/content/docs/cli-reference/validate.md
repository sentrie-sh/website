---
title: "validate Command"
description: "Validate a policy pack and its structure."
---

# validate Command

The `validate` command validates a policy pack's structure, syntax, and type correctness without executing policies. This is useful for checking that your policies are correctly formatted and can be loaded before deployment.

## Syntax

```bash
sentrie validate <FQN> [OPTIONS]
```

## Description

The `validate` command performs comprehensive validation of a policy pack:

1. **Pack Loading**: Validates the pack file (`sentrie.pack.toml`) structure
2. **Program Loading**: Loads and parses all `.sentrie` policy files
3. **Index Validation**: Validates namespace, policy, and rule references
4. **Type Checking**: Validates type annotations and constraints
5. **Executor Creation**: Attempts to create an executor to verify the pack is executable

If validation succeeds, the command exits with code 0. If any validation fails, it exits with a non-zero code and displays error messages.

## Arguments

### `FQN` (required)

The Fully Qualified Name (FQN) that identifies the namespace and policy to validate. The rule component is optional but can be included for reference.

**Format:** `namespace/policy` or `namespace/policy/rule`

**Examples:**
- `user_management/user_access` - Validate the `user_access` policy
- `com/example/auth/access_control` - Validate a policy in a nested namespace
- `com/example/auth/access_control/check_permission` - Validate with rule reference (rule is not validated, only used for context)

## Options

### `--pack-location`

Specifies the directory containing the policy pack to validate.

```bash
sentrie validate user_management/user_access --pack-location ./my-policy-pack
```

**Default:** `./` (current directory)

**Examples:**
- `--pack-location ./policies` - Validate policies from `./policies` directory
- `--pack-location /path/to/policy-pack` - Validate policies from absolute path

### `--facts`

Provides facts as a JSON string for type checking. This helps validate that fact declarations match expected types.

```bash
sentrie validate user_management/user_access --facts '{"user":{"role":"admin","status":"active"}}'
```

**Default:** `{}` (empty object)

**Note:** The `--facts` flag is primarily used for type checking. The validation process will verify that:
- Fact types match their declarations
- Required facts are present
- Optional facts are correctly marked
- Shape constraints are satisfied

## Examples

### Validate a policy pack in the current directory

```bash
sentrie validate user_management/user_access
```

### Validate a policy pack from a specific location

```bash
sentrie validate com/example/auth/access_control \
  --pack-location ./policy-pack
```

### Validate with facts for type checking

```bash
sentrie validate user_management/user_access \
  --facts '{"user":{"role":"admin","status":"active"}}'
```

### Validate a nested namespace policy

```bash
sentrie validate com/example/billing/pricing \
  --pack-location ./policies
```

## What Gets Validated

The `validate` command checks:

### 1. Pack File Structure
- Validates `sentrie.pack.toml` exists and is correctly formatted
- Checks pack metadata (name, version, schema version)

### 2. Policy File Syntax
- Parses all `.sentrie` files in the pack
- Validates namespace declarations
- Checks policy and rule syntax
- Verifies shape definitions

### 3. Type System
- Validates type annotations on facts, variables, and expressions
- Checks shape field types and constraints
- Verifies constraint validations (min, max, length, etc.)

### 4. References
- Validates namespace, policy, and rule references
- Checks that imported rules exist
- Verifies exported shapes are accessible
- Validates rule imports and exports

### 5. Executor Creation
- Attempts to create a runtime executor
- Validates that all TypeScript modules can be loaded
- Checks that all dependencies are resolvable

## Exit Codes

- **0** - Validation succeeded
- **1** - Validation failed (with error messages)

## Error Messages

Common validation errors include:

- **Pack loading errors**: Invalid pack file structure or missing pack file
- **Syntax errors**: Invalid policy syntax or grammar violations
- **Type errors**: Type mismatches or invalid type annotations
- **Reference errors**: Missing namespaces, policies, or rules
- **Constraint violations**: Values that don't satisfy shape constraints
- **Module errors**: Missing or invalid TypeScript modules

## Use Cases

### Pre-deployment Validation

Validate policies before deploying to production:

```bash
sentrie validate com/example/auth/access_control \
  --pack-location ./policies
```

### CI/CD Integration

Use in CI/CD pipelines to catch errors early:

```bash
#!/bin/bash
if ! sentrie validate com/example/auth/access_control; then
  echo "Validation failed!"
  exit 1
fi
```

### Type Checking

Validate that facts match expected types:

```bash
sentrie validate user_management/user_access \
  --facts '{"user":{"role":"admin","status":"active"}}'
```

## Differences from `exec`

| Feature | `validate` | `exec` |
|---------|-----------|--------|
| Executes policies | ❌ No | ✅ Yes |
| Validates structure | ✅ Yes | ✅ Yes |
| Validates types | ✅ Yes | ✅ Yes |
| Shows results | ❌ No | ✅ Yes |
| Output format | Text errors | Table/JSON |
| Use case | Pre-deployment | Testing/Execution |

## See Also

- [CLI Reference](/cli-reference) - Complete CLI documentation
- [Policy Language Reference](/reference) - Learn about writing policies
- [Structure of a Policy Pack](/structure-of-a-policy-pack/overview) - Learn about pack structure
