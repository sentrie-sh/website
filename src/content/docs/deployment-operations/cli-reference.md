---
title: CLI Reference
description: "Sentrie CLI: exec, init, serve, validate. Syntax, options, and behavior."
---


The Sentrie CLI provides commands to execute policies, initialize packs, serve an HTTP API, and validate packs. All commands support `--help`, `--version`, `--debug`, `--log-level`.

## Syntax

```bash
sentrie exec <FQN> [OPTIONS]
sentrie init <pack-name>
sentrie serve [OPTIONS] [policy-pack]
sentrie validate <FQN> [OPTIONS]
```

## Parameters

| Command | Required | Description |
| :--- | :--- | :--- |
| `exec` FQN | Yes | `namespace/policy` or `namespace/policy/rule`. Execute rule(s) with facts. |
| `init` pack-name | Yes | Create a new policy pack in the current directory. |
| `serve` | No | Start HTTP server. Optional positional: pack directory. Default pack: `./`. |
| `validate` FQN | Yes | Validate pack structure and types. |

**exec options:** `--pack-location` (default `./`), `--facts` (JSON string), `--fact-file` (path), `--output` (`table` \| `json`).

**serve options:** `--port` (default `7529`), `--pack-location` (default `./`), `--listen` (default `["local"]`: `local` \| `all` \| IP list).

**validate options:** `--pack-location` (default `./`), `--facts` (JSON for type checking).

**Returns:** exec: exit 0 with decision output; non-zero on error. serve: runs until SIGINT/SIGTERM. validate: exit 0 if valid.

## Examples

### Basic Usage

```bash
sentrie exec com/example/auth/user/allow --facts '{"user":{"role":"admin"}}'
sentrie serve --port 8080
sentrie validate com/example/auth/user
```

### Advanced Usage

```bash
sentrie exec com/example/auth/user --fact-file ./facts.json --output json
sentrie serve --listen all --pack-location /path/to/pack
```

## Behavior & Constraints

- Global options: `--help`, `--version`, `--debug`, `--log-level` (DEBUG, INFO, WARN, ERROR). Facts for exec must be valid JSON; keys match policy fact names/aliases.
- serve: Loads pack from `--pack-location` or positional arg; policy/JS errors prevent startup. Graceful shutdown on SIGINT/SIGTERM.

## Constraints & Edge Cases

- Missing required fact for exec causes error. Invalid FQN or pack path causes error. Port in use: use another `--port`. See [Running as a Service](/deployment-operations/running-as-service) for HTTP API.
