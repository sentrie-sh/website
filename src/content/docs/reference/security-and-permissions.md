---
title: Security and Permissions
description: "Policy pack permissions: filesystem, network, environment."
---


Permissions define what a policy pack can access: filesystem (read), network hosts, and environment variables. They are set in `sentrie.pack.toml` under `[permissions]`. Default is pack-root filesystem only; no network; no env.

## Syntax

```text
[permissions]
fs_read = ["/path1", "/path2"]
net     = ["host1.com", "host2.com"]
env     = ["VAR1", "VAR2"]
```

## Parameters

| Key | Type | Description |
| :--- | :--- | :--- |
| `fs_read` | list[string] | Paths (or prefixes) that the pack can read. Default: pack root. |
| `net` | list[string] | Hosts (or patterns) allowed for network access. Default: none. |
| `env` | list[string] | Environment variable names exposed to the pack. Default: none. |

**Returns:** N/A (configuration). Violations (e.g. reading outside fs_read) cause runtime failure.

## Examples

### Basic Usage

```toml
[permissions]
fs_read = ["."]
```

### Advanced Usage

```toml
[permissions]
fs_read = ["/etc/passwd"]
net     = ["example.com"]
env     = ["ORG_DSN", "REDIS_PASSWORD"]
```

## Behavior & Constraints

- By default: filesystem access is limited to the policy pack root; no network; no environment variables.
- Explicit entries grant access only to listed paths/hosts/vars. Modules run with the same permissions as the pack.

## Constraints & Edge Cases

- Invalid or missing paths/hosts may be rejected at load or runtime. Restrict permissions to the minimum required.
