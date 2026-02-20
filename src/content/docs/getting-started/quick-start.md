---
title: Quick Start
description: Install Sentrie and run your first policy evaluation.
---

Install the Sentrie binary and evaluate a policy from the command line. This page covers installation and a minimal run (no policy pack layout).

## Syntax

Install (macOS, Linux, WSL2):

```bash
curl -fsSL https://sentrie.sh/install.sh | bash
```

Install (Windows):

```bash
irm https://sentrie.sh/install.ps1 | iex
```

Specific version (script): append version to the install script (e.g. `bash -s v0.1.0` for Unix; set `$v="0.1.0"` for Windows).

Verify:

```bash
sentrie --version
```

## Parameters

| Step | Required | Description |
| :--- | :--- | :--- |
| Policy pack path | Yes | Directory containing `*.sentrie` and optional pack manifest. |
| Target | Yes | `namespace/policy` or `namespace/policy/rule`. |
| Facts | Depends | JSON object of fact names to values; required if the policy declares required facts. |

**Returns:** Exit code 0 on success; non-zero on evaluation or CLI error. Decision output is printed to stdout.

## Examples

### Basic Usage

Create a minimal pack and run one rule:

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

Evaluate (from the pack directory):

```bash
sentrie exec com/example/app/access/allow --facts '{"user": {"role": "user", "status": "active"}}'
```

### Advanced Usage

Evaluate all exported rules in a policy and pass multiple facts:

```bash
sentrie exec com/example/app/access --facts '{"user": {"role": "admin", "status": "active"}}'
```

Facts JSON keys must match the fact names (or aliases) declared in the policy. Required facts must be present.

## Behavior & Constraints

- **Single binary**: No extra runtime; the executable is self-contained.
- **Platforms**: macOS (arm64, x64), Linux (x64, arm64), Windows (x64, arm64).
- **Facts**: Required facts must be provided; otherwise evaluation fails. Optional facts may be omitted if they have defaults.
- **Target**: Use `namespace/policy` to evaluate all exported rules; use `namespace/policy/rule` for a single rule.

## Constraints & Edge Cases

- Missing required fact → evaluation error.
- Invalid JSON in `--facts` → CLI error.
- Invalid target path (unknown namespace/policy/rule) → error.
- At least one rule must be exported from a policy to be executable via `sentrie exec`.
