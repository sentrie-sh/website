---
title: "exec Command"
description: "Execute a policy or rule with Sentrie."
---

# exec Command

The `exec` command executes a policy or rule from a policy pack. This is the primary way to test and run your policies locally.

## Syntax

```bash
sentrie exec <FQN> [OPTIONS]
```

## Description

The `exec` command loads a policy pack, executes a specific rule or all exported rules in a policy, and displays the results. You can provide facts (input data) via command-line flags or from a JSON file.

## Arguments

### `FQN` (required)

The Fully Qualified Name (FQN) that identifies the namespace, policy, and optionally the rule to execute.

**Format:** `namespace/policy/rule` or `namespace/policy`

- **`namespace/policy`** - Execute all exported rules in the policy
- **`namespace/policy/rule`** - Execute only the specific rule

**Examples:**
- `user_management/user_access` - Execute all exported rules in the `user_access` policy
- `user_management/user_access/allow_user` - Execute only the `allow_user` rule
- `com/example/auth/access_control/check_permission` - Execute a specific rule in a nested namespace

## Options

### `--pack-location`

Specifies the directory containing the policy pack to load.

```bash
sentrie exec user_management/user_access --pack-location ./my-policy-pack
```

**Default:** `./` (current directory)

**Examples:**
- `--pack-location ./policies` - Load policies from `./policies` directory
- `--pack-location /path/to/policy-pack` - Load policies from absolute path

### `--output`

Specifies the output format for the results.

```bash
sentrie exec user_management/user_access --output json
```

**Default:** `table`

**Valid values:**
- `table` - Human-readable table format (default)
- `json` - JSON format for programmatic consumption

**Table Format Example:**
```
Namespace: user_management
Policy:    user_access

Rules:
  ✓ allow_admin: ✓ True
  ✓ allow_user: ✓ True

Values:
  ✓ allow_admin: true
  ✓ allow_user: true

Attachments:
  ✓ allow_user:
     reason: User has admin role
```

**JSON Format Example:**
```json
[
  {
    "namespace": "user_management",
    "policyName": "user_access",
    "ruleName": "allow_admin",
    "decision": {
      "state": "TRUE",
      "value": true
    },
    "attachments": {}
  },
  {
    "namespace": "user_management",
    "policyName": "user_access",
    "ruleName": "allow_user",
    "decision": {
      "state": "TRUE",
      "value": true
    },
    "attachments": {
      "reason": "User has admin role"
    }
  }
]
```

### `--fact-file`

Specifies a JSON file containing facts to use for policy execution.

```bash
sentrie exec user_management/user_access --fact-file ./facts.json
```

**Default:** (empty - no file)

**File Format:**
The file must contain valid JSON with a top-level object:

```json
{
  "user": {
    "role": "admin",
    "status": "active"
  },
  "context": {
    "environment": "production"
  }
}
```

**Note:** Facts from `--fact-file` are loaded first, then facts from `--facts` flag override any conflicting keys.

### `--facts`

Provides facts directly as a JSON string.

```bash
sentrie exec user_management/user_access --facts '{"user":{"role":"admin","status":"active"}}'
```

**Default:** `{}` (empty object)

**Fact Merging:**
If both `--fact-file` and `--facts` are provided, the facts from `--facts` will override any conflicting keys from the file. This allows you to use a base fact file and override specific values on the command line.

**Example:**
```bash
# facts.json contains: {"user": {"role": "user", "status": "active"}}
# Command line overrides the role
sentrie exec user_management/user_access \
  --fact-file ./facts.json \
  --facts '{"user":{"role":"admin"}}'
# Result: user.role = "admin", user.status = "active"
```

## Examples

### Execute a specific rule with inline facts

```bash
sentrie exec user_management/user_access/allow_user \
  --facts '{"user":{"role":"admin","status":"active"}}'
```

### Execute all exported rules in a policy

```bash
sentrie exec user_management/user_access \
  --facts '{"user":{"role":"admin","status":"active"}}'
```

### Execute with facts from a file

```bash
sentrie exec user_management/user_access \
  --fact-file ./user-facts.json
```

### Execute with facts from file and override specific values

```bash
sentrie exec user_management/user_access \
  --fact-file ./base-facts.json \
  --facts '{"user":{"role":"admin"}}'
```

### Execute and output as JSON

```bash
sentrie exec user_management/user_access \
  --facts '{"user":{"role":"admin"}}' \
  --output json
```

### Execute from a different pack location

```bash
sentrie exec com/example/auth/access_control/check_permission \
  --pack-location ./policy-pack \
  --fact-file ./user-facts.json \
  --output json
```

### Pipe JSON output to another tool

```bash
sentrie exec user_management/user_access \
  --facts '{"user":{"role":"admin"}}' \
  --output json | jq '.[0].decision.value'
```

## Decision States

The command output includes decision states:

- **`TRUE`** (✓ True) - The rule evaluated to true
- **`FALSE`** (⨯ False) - The rule evaluated to false
- **`UNKNOWN`** (• Unknown) - The rule evaluated to unknown (e.g., when `when` condition is false and no default is provided)

## Error Handling

If the command encounters errors:

- **Invalid FQN**: Returns an error if the namespace, policy, or rule is not found
- **Invalid facts**: Returns an error if facts don't match expected types or shapes
- **Policy errors**: Returns an error if policy evaluation fails
- **File errors**: Returns an error if `--fact-file` cannot be read or parsed

## Output Destination

All output is written to **stdout**, making it easy to:
- Pipe results to other commands
- Redirect to files
- Process programmatically (with JSON output)

## See Also

- [Executing Policies](/running-sentrie/executing-policies) - Detailed guide on executing policies
- [CLI Reference](/cli-reference) - Complete CLI documentation
- [Policy Language Reference](/reference) - Learn about writing policies
