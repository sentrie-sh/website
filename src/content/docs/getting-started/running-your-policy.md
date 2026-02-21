---
title: Running your first Policy
description: "Evaluate policies with sentrie exec: target, facts JSON, and output format."
---

When you want to run a policy from the command line (e.g. to test a rule or script a one-off check), you use `sentrie exec`. You give it a target (which policy and optionally which rule) and a JSON object of facts; the CLI prints the decision output and exit code.

Here is the basic syntax:

```bash
sentrie exec TARGET [ --facts JSON ] [ --pack-location PATH ]
```

**TARGET** is `namespace/policy` (all exported rules) or `namespace/policy/rule` (single rule). Run from the pack directory or pass `--pack-location`. **Facts** are a JSON object whose keys match fact names (or aliases); required facts must be present.

## Configuration & Arguments

You can control what gets run and where the pack lives using these options:

| Argument | Required | What it does |
| :------- | :------- | :----------- |
| Target | Yes | `namespace/policy` or `namespace/policy/rule`. Slashes match namespace and policy/rule identifiers. |
| Facts | Depends | JSON object. Required if the policy declares required facts. Keys match fact names (or aliases). |
| Pack path | No | Default: current directory. Use `--pack-location PATH` to point at a different pack root. |

**Returns:** Exit code 0 on success; non-zero on evaluation or CLI error. Rule names and decision values are printed to stdout (namespace, policy, rules, values, optional attachments).

---

## Examples in Action

### Evaluating a single rule with inline facts

You have a policy that exports `allow_user` and requires a `user` fact. You want to see the decision for one concrete user.

```bash
sentrie exec com/example/user_management/user_access/allow_user --facts '{"user": {"role": "user", "status": "active"}}'
```

Example stdout:

```text
Namespace: com/example/user_management
Policy:    user_access

Rules:
  ✓ allow_user: ✓ True

Values:
  ✓ allow_user: true
```

### Evaluating every exported rule in a policy

You want to run all exported rules in one go (e.g. for debugging or auditing). Omit the rule name from the target.

```bash
sentrie exec com/example/user_management/user_access --facts '{"user": {"role": "admin", "status": "active"}}'
```

Example stdout:

```text
Namespace: com/example/user_management
Policy:    user_access

Rules:
  ✓ allow_admin: ✓ True
  ✓ allow_user: ✓ True

Values:
  ✓ allow_admin: true
  ✓ allow_user: true
```

### Using a specific pack directory

Your policy pack lives outside the current directory; you want to point `exec` at it explicitly.

```bash
sentrie exec com/example/user_management/user_access --pack-location /path/to/my-pack --facts '{"user": {"role": "user", "status": "active"}}'
```

---

## Good to Know

Before you rely on this in scripts or CI, keep a few boundaries in mind:

- **Constraint:** Target must be `namespace/policy` or `namespace/policy/rule`; namespace and policy/rule must exist and the rule must be exported. Facts JSON keys must match fact names (or aliases); types must satisfy the declared shapes. If `--pack-location` is omitted, the current directory is the pack root (must contain `*.sentrie` and optionally `sentrie.pack.toml`).
- **Edge case:** Missing required fact → evaluation error; optional fact may be omitted if it has a default. Invalid or malformed JSON in `--facts` → CLI error. Invalid target (unknown namespace, policy, or rule) → error. At least one rule must be exported from the policy to be executable via `sentrie exec`.
