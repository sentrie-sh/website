---
title: "sentrie exec"
description: "Execute a policy or rule with facts; output decisions to stdout."
---

When you want to run a policy from the command line (to test a rule, debug a decision, or script a one-off check), you use `sentrie exec`. It loads a policy pack, runs the rule(s) you specify with the facts you supply, and prints the decision output. Perfect for local development and CI.

Here is the basic syntax:

```bash
sentrie exec <TARGET> [ --pack-location <PATH> ] [ --facts <JSON> ] [ --fact-file <PATH> ] [ --output (table|json) ]
```

**TARGET** is required: `namespace/policy` or `namespace/policy/rule`. The rest are optional: pack directory, inline facts, fact file, and output format.

## Configuration & Arguments

You can customize the run using the following options:

| Argument | Type | Required | What it does |
| :------- | :--- | :------- | :----------- |
| TARGET | string | Yes | `namespace/policy` (all exported rules) or `namespace/policy/rule` (single rule). Slashes separate namespace, policy, and optional rule. |
| `--pack-location` | path | No | Directory containing the policy pack. Default: `./`. |
| `--facts` | JSON string | No | Inline facts. Keys match policy fact names or aliases. Overrides same keys from `--fact-file`. |
| `--fact-file` | path | No | Path to JSON file; top-level object gives facts. Loaded first; `--facts` overrides. |
| `--output` | enum | No | `table` or `json`. Default: `table`. |

**Returns:** Exit 0 on success; non-zero on error. Output goes to stdout: table (human-readable) or JSON array of decision objects (namespace, policyName, ruleName, decision.state, decision.value, attachments). The `Error:` line goes to stderr. When a rule of a policy fails, `exec` still prints every rule (a failed rule has an `error` object in JSON and a line under `Errors:` in the table) and then exits 1 with `Error: <n> of <m> rules failed`.

---

## Examples in Action

### Running a single rule or all rules with inline facts

You are testing one rule or the whole policy and your facts are small enough to pass on the command line.

```bash
sentrie exec com/example/user_management/user_access/allow_user --facts '{"user":{"role":"user","status":"active"}}'
```

```bash
sentrie exec com/example/user_management/user_access --facts '{"user":{"role":"admin","status":"active"}}'
```

### Overriding a fact file from the command line and getting JSON

You have a base fact file but want to override a few keys (e.g. role) for a quick test and pipe the result to another tool.

```bash
sentrie exec com/example/user_management/user_access \
  --fact-file ./base-facts.json \
  --facts '{"user":{"role":"admin"}}' \
  --output json
```

### Running from a different pack directory and piping JSON

Your policy pack lives in another directory and you want JSON output for scripting.

```bash
sentrie exec com/example/auth/access/allow --pack-location ./policy-pack --facts '{"user":{"role":"admin"}}' --output json
```

### Passing large integer IDs in facts

Integers that fit in 64 bits are read exactly, in `--facts` and in `--fact-file`, so a large ID keeps every digit.

```bash
sentrie exec docs/ids/accounts/echo \
  --facts '{"id": 9007199254740993, "other": 9007199254740992}'
```

---

## Good to Know

Before you rely on this in scripts or CI, keep a few boundaries in mind:

- **Constraint:** Required facts must be present (in `--facts` and/or `--fact-file`). Optional facts may be omitted if they have defaults. Keys must match fact names or aliases; types must satisfy declared shapes. Facts from `--fact-file` are loaded first; `--facts` overrides conflicting keys. Table output lists namespace, policy, rules, values, attachments; JSON is an array of decision objects. Decision states are `true`, `false` or `unknown` in JSON, shown as `True`, `False` or `Unknown` in the table.
- **Edge case:** Invalid or missing TARGET (unknown namespace/policy/rule) → error; rule must be exported. Missing required fact → evaluation error. A rule that fails while the policy runs does not stop the others: all rules are printed, then the command exits 1 with `<n> of <m> rules failed` (see [Executing Policies](/running-sentrie/executing-policies#when-a-rule-fails)). The order of the rules in the output is not guaranteed. Invalid JSON in `--facts` or `--fact-file` → error. `--fact-file` path must exist and be readable. Pack directory must contain loadable `*.sentrie`. For the full HTTP API, see [Running as a Service](/deployment-operations/running-as-service).
- **Large integers:** Integers that fit in 64 bits are read exactly, so a large ID keeps every digit. A number outside the float range, such as `1e400`, fails with `facts: number 1e400 is out of range` (`fact file: ...` for `--fact-file`). See [Large Integers in Facts](/reference/arithmetic-operations#large-integers-in-facts).
