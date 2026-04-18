---
title: Quick Start
description: Install Sentrie and run your first policy evaluation.
---

When you need to run policy checks from the command line or script a one-off evaluation, you install the Sentrie binary and use `sentrie exec` with a target and facts. This page gets you from zero to a first run.

Here is the basic syntax:

Install (macOS, Linux, WSL2):

```bash
curl -fsSL https://sentrie.sh/install.sh | bash
```

Install (Windows):

```bash
irm https://sentrie.sh/install.ps1 | iex
```

Verify and run a policy:

```bash
sentrie --version
sentrie exec <namespace/policy> [or namespace/policy/rule] [ --facts '<JSON>' ]
```

For a specific version, append it to the install script (e.g. `bash -s v0.1.0` on Unix; set `$v="0.1.0"` on Windows).

## Configuration & Arguments

You control what gets evaluated using the pack directory, target, and facts:

| Argument | Required | What it does |
| :------- | :------- | :------------ |
| Policy pack path | No | Directory containing your `*.sentrie` files (and optional pack manifest). Default: current directory. |
| Target | Yes | `namespace/policy` runs all exported rules; `namespace/policy/rule` runs a single rule. |
| Facts | Depends | JSON object of fact names to values. Required if the policy declares required facts. |

**Returns:** Exit code 0 on success; non-zero on evaluation or CLI error. Decision output is printed to stdout.

---

## Examples in Action

### Running a single rule with inline facts

You have a policy that expects a `user` fact and exports a rule `allow`. You want to see the decision for one concrete user.

```bash
mkdir my-pack && cd my-pack
sentrie init my-pack
```

Add a policy file (e.g. `policy.sentrie`):

```sentrie
namespace com/example/app

shape User {
  role!: string
  status!: string
}

policy access {
  fact user: User as u

  rule allow = default false {
    yield u.role == "admin" or (u.role == "user" and u.status == "active")
  }

  export decision of allow
}
```

From the pack directory, run the rule with facts:

```bash
sentrie exec com/example/app/access/allow --facts '{"user": {"role": "user", "status": "active"}}'
```

### Evaluating every exported rule in a policy

You want to see the outcome of all exported rules in one policy (e.g. for debugging or auditing). Omit the rule name from the target.

```bash
sentrie exec com/example/app/access --facts '{"user": {"role": "admin", "status": "active"}}'
```

Facts JSON keys must match the fact names (or aliases) declared in the policy. Required facts must be present.

---

## Good to Know

Before you rely on this in scripts or CI, keep a few boundaries in mind:

- **Single binary:** No extra runtime; the executable is self-contained. Supported platforms: macOS (arm64, x64), Linux (x64, arm64), Windows (x64, arm64).
- **Facts:** Required facts must be provided; otherwise evaluation fails. Optional facts may be omitted if they have defaults.
- **Target:** Use `namespace/policy` to evaluate all exported rules; use `namespace/policy/rule` for a single rule. Invalid or missing target (unknown namespace/policy/rule) causes an error.
- **Edge case:** Missing required fact → evaluation error. Invalid JSON in `--facts` → CLI error. At least one rule must be exported from a policy to be executable via `sentrie exec`.
