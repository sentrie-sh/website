---
title: "Executing Policies"
description: "How to execute policies with Sentrie."
---

The `sentrie exec` command allows you to execute policies and rules from a policy pack. This is the primary way to test and run your policies locally.

## Basic Usage

```bash
sentrie exec <FQN> [flags]
```

The command takes a **Fully Qualified Name (FQN)** as its primary argument, which identifies the namespace, policy, and optionally the rule to execute.

## Understanding FQN (Fully Qualified Name)

An FQN follows the format: `namespace/policy/rule`

- **Namespace**: The namespace where the policy is defined (e.g., `user_management`, `com/example/auth`)
- **Policy**: The name of the policy to execute
- **Rule**: (Optional) The specific rule to execute. If omitted, all exported rules in the policy are executed

**Examples:**

- `user_management/user_access` - Execute all exported rules in the `user_access` policy
- `user_management/user_access/allow_user` - Execute only the `allow_user` rule
- `com/example/auth/access_control/check_permission` - Execute a specific rule in a nested namespace

## Providing Facts

Facts are the input data that your policies use to make decisions. You can provide facts in two ways:

### Using the `--facts` Flag

Provide facts directly as a JSON string:

```bash
sentrie exec user_management/user_access --facts '{"user": {"role": "admin", "status": "active"}}'
```

### Using the `--fact-file` Flag

Load facts from a JSON file:

```bash
sentrie exec user_management/user_access --fact-file ./facts.json
```

**Fact Merging:** If you provide both `--facts` and `--fact-file`, the facts from the `--facts` flag will override any conflicting keys from the file. This allows you to use a base fact file and override specific values on the command line.

**Example:**

```bash
# facts.json contains: {"user": {"role": "user", "status": "active"}}
# Command line overrides the role
sentrie exec user_management/user_access --fact-file ./facts.json --facts '{"user": {"role": "admin"}}'
# Result: user.role = "admin", user.status = "active"
```

### Output Formats

The `--output` flag controls how the results are displayed:

### Table Format (Default)

```bash
sentrie exec user_management/user_access --output table
```

**Example Output:**

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

The table format shows:

- **Namespace**: The namespace of the executed policy
- **Policy**: The policy name
- **Rules**: Each rule with its decision (✓ True, ⨯ False, or • Unknown)
- **Values**: The boolean values of each rule's decision
- **Attachments**: Any additional data attached to exported decisions (if present)

### JSON Format

```bash
sentrie exec user_management/user_access --output json
```

**Example Output:**

```json
[
  {
    "namespace": "user_management",
    "policyName": "user_access",
    "ruleName": "allow_admin",
    "decision": true,
    "attachments": {}
  },
  {
    "namespace": "user_management",
    "policyName": "user_access",
    "ruleName": "allow_user",
    "decision": true,
    "attachments": {
      "reason": "User has admin role"
    }
  }
]
```

The JSON format is useful for programmatic consumption or integration with other tools.

## Specifying the Policy Pack

By default, `sentrie exec` looks for a policy pack in the current directory (`.`). You can specify a different location using the `--pack-location` flag:

```bash
sentrie exec user_management/user_access --pack-location ./my-policy-pack
```

## Complete Example

Here's a complete example that demonstrates all features:

```bash
# Execute a specific rule with facts from a file, output as JSON
sentrie exec com/example/auth/access_control/check_permission \
  --pack-location ./policy-pack \
  --fact-file ./user-facts.json \
  --output json
```

## Using Default Fact Values

If your policy defines default values for facts using the `default` keyword, you can execute the policy without providing any facts:

```bash
sentrie exec user_management/user_access
```

The policy will use its default fact values for execution.

## Output Destination

All output is written to **stdout**, making it easy to pipe results to other commands or redirect to files:

```bash
# Save output to a file
sentrie exec user_management/user_access --output json > results.json

# Pipe to another tool
sentrie exec user_management/user_access --output json | jq '.[0].decision'
```
