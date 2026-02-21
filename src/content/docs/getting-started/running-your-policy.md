---
title: Running your first Policy
description: "Evaluate policies with sentrie exec: target, facts JSON, and output format."
---

Use `sentrie exec` to evaluate one or all exported rules in a policy. You supply a target (`namespace/policy` or `namespace/policy/rule`) and a JSON object of facts. The CLI returns rule results and exit code.

## Syntax

```bash
sentrie exec TARGET [ --facts JSON ] [ --pack-location PATH ]
```

- **TARGET:** `namespace/policy` (all exported rules) or `namespace/policy/rule` (single rule). Run from pack directory or use `--pack-location PATH`.
- **Facts:** JSON object. Keys are fact names (or aliases). Required facts must be present; optional facts may be omitted if they have defaults.

## Options

| Concept | Required | Description |
| :--- | :--- | :--- |
| Target | Yes | `namespace/policy` or `namespace/policy/rule`. Slashes match namespace and policy/rule identifiers. |
| Facts | Depends | JSON object. Required if the policy declares required facts. Keys match fact names (or aliases). |
| Pack path | No | Default: current directory. Use `--pack-location PATH` to point at a different pack root. |

**Returns:** Exit code 0 on success; non-zero on evaluation or CLI error. Rule names and decision values are printed to stdout. Output includes namespace, policy, rules (match and value), and optional attachments.

## Examples

### Evaluate a single rule

Policy has namespace `com/example/user_management`, policy `user_access`, exported rule `allow_user`. Required fact: `user` (shape `User` with `role`, `status`).

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

### Evaluate all exported rules in a policy

Omit the rule name to run every exported rule:

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

```bash
sentrie exec com/example/user_management/user_access --pack-location /path/to/my-pack --facts '{"user": {"role": "user", "status": "active"}}'
```

## Behavior & Constraints

- **Target format:** `namespace/policy` or `namespace/policy/rule`. Namespace and policy/rule must exist; rule must be exported.
- **Facts JSON:** Keys must match fact names (or aliases) in the policy. Types must satisfy the declared shapes. Required facts missing → evaluation error.
- **Working directory:** If `--pack-location` is omitted, the current directory is used as the pack root (must contain `*.sentrie` and optionally `sentrie.pack.toml`).
- **Exit code:** 0 on success; non-zero on parse error, missing fact, or evaluation failure.

## Constraints & Edge Cases

- Missing required fact → evaluation error; optional fact may be omitted if it has a default.
- Invalid or malformed JSON in `--facts` → CLI error.
- Invalid target (unknown namespace, policy, or rule) → error.
- Rule name in target must be an exported rule; otherwise target is invalid.
- At least one rule must be exported from the policy to be executable via `sentrie exec`.
