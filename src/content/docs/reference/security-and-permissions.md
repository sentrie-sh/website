---
title: Security and Permissions
description: "Exhaustive reference for policy pack permissions (filesystem read, network, environment variables); configuration and defaults."
---

Permissions define what a policy pack can access at runtime: which filesystem paths can be read, which network hosts can be contacted, and which environment variable names are exposed to the pack. They are configured in the pack configuration file (e.g. `sentrie.pack.toml`) under a `[permissions]` section. Default behavior is restrictive: typically only the pack root is readable; no network access; no environment variables. Explicit entries grant access only to the listed paths, hosts, and variable names.

## Syntax

In the pack configuration file (e.g. `sentrie.pack.toml`):

```text
[permissions]
fs_read = ["path1", "path2", ...]
net     = ["host1", "host2", ...]
env     = ["VAR1", "VAR2", ...]
```

- **fs_read:** List of paths (or path prefixes) that the pack is allowed to read. Paths can be absolute or relative to the pack root, per tooling.
- **net:** List of hosts (or patterns) allowed for outbound network access. Format is tooling-dependent (e.g. hostname, host:port, or pattern).
- **env:** List of environment variable names that are exposed to the pack. Only these names are visible; other environment variables are not.

## Configuration & Arguments

| Key | Type | Required | Description |
| :--- | :--- | :------- | :---------- |
| `fs_read` | list of strings | No | Paths (or prefixes) the pack can read. Default: typically pack root only (e.g. `["."]` or the pack directory). Paths outside this set cause a runtime error if access is attempted. |
| `net` | list of strings | No | Hosts (or patterns) allowed for network access. Default: none. Attempts to contact hosts not in the list (or not matching a pattern) fail at runtime. |
| `env` | list of strings | No | Environment variable names exposed to the pack. Default: none. Only these names are visible; other env vars are hidden. |

**Returns:** N/A (configuration). Violations (e.g. reading a file outside `fs_read`, contacting a host not in `net`, or reading an env var not in `env`) cause runtime failure or denial.

## Default behavior

- **Filesystem:** If `fs_read` is omitted or empty, the default is typically the pack root only. The pack can read files under that root (e.g. `.sentrie` files, local TypeScript modules). Reading outside the allowed set fails.
- **Network:** If `net` is omitted or empty, no network access is granted. TypeScript modules or built-ins that perform network I/O will fail unless the required host is listed.
- **Environment:** If `env` is omitted or empty, no environment variables are exposed. The pack cannot read `process.env` (or equivalent) except for the names explicitly listed.

## Examples in Action

### Minimal (pack root only)

```toml
[permissions]
fs_read = ["."]
```

### Explicit paths and network

```toml
[permissions]
fs_read = [".", "/etc/app/config"]
net     = ["api.example.com", "cdn.example.com"]
```

### Exposing environment variables

```toml
[permissions]
fs_read = ["."]
env     = ["ORG_DSN", "REDIS_PASSWORD", "API_KEY"]
```

Only these variable names are visible to the pack; others are not exposed.

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Default:** Filesystem access is typically limited to the policy pack root; no network; no environment variables. Explicit entries grant access only to the listed paths, hosts, and variable names.
- **Scope:** Permissions apply to the entire pack. All policies and TypeScript modules in the pack run with the same permissions. There is no per-policy or per-module permission granularity in this model.
- **Validation:** Invalid or unsupported paths/hosts/names may be rejected at load time or at first use. Restrict permissions to the minimum required for the pack to function.
- **Security:** Do not grant broader filesystem, network, or env access than necessary. Use explicit allowlists rather than wildcards unless the tooling documents safe patterns.
