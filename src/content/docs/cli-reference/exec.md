---
title: "exec Command"
description: "Execute a policy or rule with Sentrie."
---

# exec Command

The `exec` command executes a policy or rule from a policy pack. This is the primary way to test and run your policies locally.

## Syntax

```bash
sentrie exec <FQN> [ --pack-location <PATH> ] [ --facts <JSON> ] [ --fact-file <PATH> ] [ --output (table|json) ] [ --capabilities <PATH> ] [ --skip-engine-check ]
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

A lambda nested in a rule's value, an attachment or the trace is encoded as `{"kind":"callable"}` in JSON output and printed as `<callable>` in the table. A rule whose whole value is a lambda is that rule's error (`rule <path>: a rule's value cannot be a callable`): `exec` prints it and exits 1, also when you run the whole policy. Any other failure to encode `--output json` is reported as an error and exits non-zero. See [Lambdas in decision output](/reference#lambdas-in-decision-output).

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
      "state": "true",
      "value": true
    },
    "attachments": {}
  },
  {
    "namespace": "user_management",
    "policyName": "user_access",
    "ruleName": "allow_user",
    "decision": {
      "state": "true",
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

**Note:** Facts from `--fact-file` are loaded first, then facts from the `--facts` flag are merged over them. See [`--facts`](#--facts).

Keys are the declared fact names, not their `as` aliases: for `fact user: User as u`, pass `user`, not `u`. This changed from earlier versions, which keyed facts by alias.

### `--facts`

Provides facts directly as a JSON string.

```bash
sentrie exec user_management/user_access --facts '{"user":{"role":"admin","status":"active"}}'
```

**Default:** `{}` (empty object)

Keys are the facts' declared names, not their `as` aliases: for `fact user: User as u`, pass `user`, not `u`.

**Fact Merging:**
If both `--fact-file` and `--facts` are provided, the facts are **deep-merged**: objects are merged key by key, `--facts` wins on a conflict, and lists and other values are replaced whole. This allows you to use a base fact file and override specific values on the command line.

**Example:**
```bash
# facts.json contains: {"user": {"role": "user", "status": "active"}}
# Command line overrides the role; the other keys under user are kept
sentrie exec user_management/user_access \
  --fact-file ./facts.json \
  --facts '{"user":{"role":"admin"}}'
# Result: user.role = "admin", user.status = "active"
```

### `--capabilities`

Path to a [capabilities file](/reference/capabilities) that limits the builtins and `@sentrie/*` modules the pack may use.

```bash
sentrie exec user_management/user_access --capabilities ./capabilities.json
```

**Default:** none, which allows everything.

### `--skip-engine-check`

Skips the check of the pack's `[engine]` version constraint against this binary.

```bash
sentrie exec user_management/user_access --skip-engine-check
```

**Default:** `false`. See [`[engine]`](/structure-of-a-policy-pack/packfile#engine-optional).

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

### Merging a fact file and inline facts

Facts are merged deeply. With `base-facts.json`:

```json
{"user": {"id": "1", "role": "user"}, "level": 5}
```

this command keeps `user.id` and `level` from the file and takes `user.role` from the command line:

```bash
sentrie exec docs/facts/access --fact-file ./base-facts.json --facts '{"user":{"role":"admin"}}'
```

A list is not merged: `--facts '{"tags":["b"]}'` over a file with `"tags":["a"]` gives `["b"]`.

### Passing large integer IDs in facts

Integers that fit in 64 bits are read exactly, in `--facts` and in `--fact-file`, so a large ID keeps every digit. A number outside the float range, such as `1e400`, fails with `facts: number 1e400 is out of range` (`fact file: ...` for `--fact-file`). See [Large Integers in Facts](/reference/arithmetic-operations#large-integers-in-facts).

```bash
sentrie exec docs/ids/accounts/echo \
  --facts '{"id": 9007199254740993, "other": 9007199254740992}'
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

### Running under a capabilities file

You run packs you did not write and want to limit what they may call. Pass a [capabilities file](/reference/capabilities) that grants only the builtins and modules you allow:

```bash
sentrie exec com/example/auth/access/allow --capabilities ./capabilities.json \
  --facts '{"user":{"role":"admin"}}'
```

If the pack uses anything the file does not grant, nothing is evaluated and `exec` exits 1 with an error naming the source location:

```text
Error: policy.sentrie:16:11-16: builtin "count": not granted by the capabilities file
```

### Pipe JSON output to another tool

```bash
sentrie exec user_management/user_access \
  --facts '{"user":{"role":"admin"}}' \
  --output json | jq '.[0].decision.value'
```

## Decision States

The command output includes decision states. In JSON they are `true`, `false` or `unknown`; the table shows them as `True`, `False` or `Unknown`:

- **`true`** (✓ True) - The rule evaluated to true
- **`false`** (⨯ False) - The rule evaluated to false
- **`unknown`** (• Unknown) - The rule evaluated to unknown (e.g., when `when` condition is false and no default is provided)

## Error Handling

If the command encounters errors:

- **Invalid FQN**: Returns an error if the namespace, policy, or rule is not found
- **Invalid facts**: Returns an error if facts don't match expected types or shapes
- **Policy errors**: Returns an error if policy evaluation fails
- **File errors**: Returns an error if `--fact-file` cannot be read or parsed
- **Rule failures**: A rule that fails while the policy runs does not stop the others. All rules are printed (a failed rule has an `error` object in JSON and a line under `Errors:` in the table), then the command exits 1 with `Error: <n> of <m> rules failed`. The order of the rules in the output is not guaranteed. See [Executing Policies](/running-sentrie/executing-policies#when-a-rule-fails).
- **Wrongly typed facts**: A wrongly typed caller fact fails the run before any rule is evaluated. A wrongly typed `with` fact that an import passes to another policy fails with the same error (`imported policy ns/target: fact 'n': value x is not a number: invalid invocation`), with no per-rule output, and so does a required `with` fact the import leaves out (`imported policy ns/target: required fact not found: n`). Other failures inside the imported rule stay per-rule errors.
- **Engine mismatch**: The pack's `[engine]` version constraint is checked against the running binary before anything runs. A mismatch is an error ending `(use --skip-engine-check to load it anyway)`; a dev or unversioned build passes with a warning. See [`[engine]`](/structure-of-a-policy-pack/packfile#engine-optional).

## Output Destination

Results are written to **stdout**, and the `Error:` line goes to **stderr**, making it easy to:
- Pipe results to other commands
- Redirect to files
- Process programmatically (with JSON output)

## See Also

- [Executing Policies](/running-sentrie/executing-policies) - Detailed guide on executing policies
- [CLI Reference](/cli-reference) - Complete CLI documentation
- [Policy Language Reference](/reference) - Learn about writing policies
