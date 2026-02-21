---
title: "sentrie exec"
description: "Execute a policy or rule with facts; output decisions to stdout."
---

`exec` loads a policy pack, runs the given rule(s) with the supplied facts, and prints decision output. Use it to test policies locally or in scripts.

## Syntax

```bash
sentrie exec <TARGET> [ --pack-location <PATH> ] [ --facts <JSON> ] [ --fact-file <PATH> ] [ --output (table|json) ]
```

- **TARGET:** `namespace/policy` or `namespace/policy/rule`. Required.
- **--pack-location:** Pack root directory. Default: current directory.
- **--facts:** JSON object of fact names to values. Merged with `--fact-file`; CLI overrides file.
- **--fact-file:** Path to JSON file with a top-level object of facts.
- **--output:** `table` (default) or `json`.

## Options

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| TARGET | string | Yes | `namespace/policy` (all exported rules) or `namespace/policy/rule` (single rule). Slashes separate namespace, policy, and optional rule. |
| `--pack-location` | path | No | Directory containing the policy pack. Default: `./`. |
| `--facts` | JSON string | No | Inline facts. Keys match policy fact names or aliases. Overrides same keys from `--fact-file`. |
| `--fact-file` | path | No | Path to JSON file; top-level object gives facts. Loaded first; `--facts` overrides. |
| `--output` | enum | No | `table` or `json`. Default: `table`. |

**Returns:** Exit 0 on success; non-zero on error. Output to stdout: table (human-readable) or JSON array of decision objects (namespace, policyName, ruleName, decision.state, decision.value, attachments).

## Examples

### Basic Usage

Execute a single rule with inline facts:

```bash
sentrie exec com/example/user_management/user_access/allow_user --facts '{"user":{"role":"user","status":"active"}}'
```

Execute all exported rules in a policy:

```bash
sentrie exec com/example/user_management/user_access --facts '{"user":{"role":"admin","status":"active"}}'
```

### Advanced Usage

Facts from file with command-line overrides; JSON output:

```bash
sentrie exec com/example/user_management/user_access \
  --fact-file ./base-facts.json \
  --facts '{"user":{"role":"admin"}}' \
  --output json
```

Custom pack path and JSON output for piping:

```bash
sentrie exec com/example/auth/access/allow --pack-location ./policy-pack --facts '{"user":{"role":"admin"}}' --output json
```

## Behavior & Constraints

- **Facts:** Required facts must be present (in `--facts` and/or `--fact-file`). Optional facts may be omitted if they have defaults. Keys must match fact names or aliases; types must satisfy declared shapes.
- **Merge order:** Facts from `--fact-file` are loaded first; `--facts` overrides conflicting keys.
- **Output:** Table format lists namespace, policy, rules (match and value), values, and attachments. JSON format is an array of objects with namespace, policyName, ruleName, decision (state, value), attachments.
- **Decision states:** `TRUE`, `FALSE`, or `UNKNOWN` (e.g. when `when` is false and no default).

## Constraints & Edge Cases

- Invalid or missing TARGET (unknown namespace/policy/rule) → error; rule must be exported.
- Missing required fact → evaluation error.
- Invalid JSON in `--facts` or in `--fact-file` → error.
- `--fact-file` path must exist and be readable.
- Pack directory must contain loadable `*.sentrie` (and optional `sentrie.pack.toml`). Policy/parse errors → error.
- For full HTTP API behavior, see [Running as a Service](/deployment-operations/running-as-service).
