---
title: Security and Permissions
description: "Policy pack permissions (filesystem read, network, environment variables); what is enforced today and what is only declared."
---

Pack permissions are configured in the pack configuration file (`sentrie.pack.toml`) under a `[permissions]` section. Of the three permission keys, only `env` is enforced in this release. `fs_read` and `net` are parsed and validated, but nothing consults them: declaring them does not restrict what a pack or its TypeScript modules can read or reach.

:::caution
`fs_read` and `net` are not enforced yet. Do not rely on them as a sandbox. When a pack declares a non-empty `fs_read` or `net`, Sentrie prints a warning to stderr (see [Warnings](#warnings)) and carries on.
:::

## Syntax

In the pack configuration file (`sentrie.pack.toml`):

```toml
[permissions]
fs_read = ["path1", "path2"]
net     = ["https://host1.example.com", "https://host2.example.com"]
env     = ["VAR1", "VAR2"]
```

- **fs_read:** List of strings. Declared and validated, not enforced yet. It does not limit which files the pack can read.
- **net:** List of URIs (for example `https://api.example.com`). A value that is not a URI is rejected when the pack is loaded. Declared and validated, not enforced yet. It does not limit which hosts the pack can contact.
- **env:** List of environment variable names that are exposed to the pack. Only these names are visible through the `env` object in TypeScript modules; other environment variables are not. This is enforced.

## Configuration & Arguments

| Key | Type | Required | Enforced | Description |
| :--- | :--- | :------- | :------- | :---------- |
| `fs_read` | list of strings | No | No | Declared filesystem paths. Parsed and validated only; nothing restricts file access. |
| `net` | list of URIs | No | No | Declared network endpoints. Each entry must be a URI. Parsed and validated only; nothing restricts network access. |
| `env` | list of strings | No | Yes | Environment variable names exposed to the pack. Default: none. Only these names are visible; other env vars are hidden. |

## Warnings

When a pack declares a non-empty `fs_read` or `net` list, `sentrie validate`, `sentrie exec`, `sentrie serve` and `sentrie bench` print one line per list to stderr after loading the pack:

```text
warning: pack permission "fs_read" is declared but not enforced yet; it gates nothing in this release
warning: pack permission "net" is declared but not enforced yet; it gates nothing in this release
```

The warning never changes the exit status: the command still succeeds. Packs with no `[permissions]` section, empty lists, or only `env` print nothing.

## Default behavior

- **Environment:** If `env` is omitted or empty, no environment variables are exposed. TypeScript modules can see only the names listed in `env`.
- **Filesystem:** Not enforced through `fs_read`. Pack-supplied TypeScript cannot read outside the pack root, but that confinement does not come from `fs_read`: `use` / `require` of `@local/...` (and relative paths normalized to `@local`) reject `..` escapes and symlinks that leave the pack.
- **Network:** Not enforced through `net`. Declaring or omitting `net` does not change what a module can reach.

## Examples in Action

### Exposing environment variables

```toml
[permissions]
env = ["ORG_DSN", "REDIS_PASSWORD", "API_KEY"]
```

Only these variable names are visible to the pack; others are not exposed.

### Declared but not enforced

```toml
[permissions]
fs_read = ["."]
net     = ["https://api.example.com", "https://cdn.example.com"]
```

This pack loads and runs, and each command prints the two warnings above. The lists document intent for a future release; they restrict nothing today.

## Good to Know

- **Scope:** Permissions apply to the entire pack. All policies and TypeScript modules in the pack run with the same permissions. There is no per-policy or per-module permission granularity in this model.
- **Validation:** The pack schema rejects malformed permissions when the pack is loaded, for example a `net` entry that is not a URI.
- **Not a sandbox:** Until `fs_read` and `net` are enforced, treat packs as trusted code. Review third-party packs and their TypeScript modules before running them, and use OS-level controls (container, filesystem and network policy) to confine the process.
