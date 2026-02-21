---
title: "sentrie serve"
description: "Start the HTTP server for policy evaluation; load pack from a directory."
---

`serve` starts an HTTP server that loads a policy pack and exposes a REST API for evaluating policies. Use it for local development or as the process behind a reverse proxy in production.

## Syntax

```bash
sentrie serve [ --pack-location <PATH> ] [ --port <INT> ] [ --listen <ADDR> ... ]
```

- **--pack-location:** Directory containing the policy pack. Default: `./`.
- **--port:** Port to listen on. Default: `7529`.
- **--listen:** Address(es) to bind (e.g. `local`, `0.0.0.0`, `127.0.0.1`). Default: `["local"]`. May be repeated.

## Options

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `--pack-location` | path | No | Pack root (e.g. `*.sentrie`, optional `sentrie.pack.toml`, `*.js`). Default: `./`. |
| `--port` | int | No | Listen port. Default: `7529`. |
| `--listen` | string (repeatable) | No | Bind address: `local` (localhost), `0.0.0.0` (all interfaces), or specific IP. Default: `["local"]`. |

**Returns:** Process runs until SIGINT/SIGTERM (graceful shutdown). Exit non-zero on startup failure (e.g. port in use, pack load or parse error). HTTP API base: `http://<listen>:<port>`; see [Running as a Service](/deployment-operations/running-as-service) for request/response format.

## Examples

### Basic Usage

Start with defaults (current directory, port 7529, localhost only):

```bash
sentrie serve
```

Custom port and pack path:

```bash
sentrie serve --port 8080 --pack-location ./my-policies
```

### Advanced Usage

Listen on all interfaces and set pack path (e.g. production-style):

```bash
sentrie serve --pack-location /etc/sentrie/policies --listen 0.0.0.0 --port 8080
```

Multiple listen addresses and debug logging:

```bash
sentrie serve --listen 127.0.0.1 --listen 192.168.1.100 --port 8080 --debug --log-level DEBUG
```

## Behavior & Constraints

- **Startup:** Loads pack from `--pack-location`, parses `*.sentrie`, validates, builds index, then listens. Policy or pack errors prevent startup.
- **Shutdown:** SIGINT (Ctrl+C) and SIGTERM trigger graceful shutdown; SIGKILL does not.
- **Environment:** `SENTRIE_DEBUG`, `SENTRIE_LOG_LEVEL`, `SENTRIE_PORT` can override debug, log level, and port when not set via flags.
- **Output:** All output to stdout/stderr; no file logging by default.

## Constraints & Edge Cases

- Port already in use → startup fails; choose another `--port`.
- Invalid or missing pack directory, or pack load/parse failure → startup fails; fix pack or path.
- Listening on `0.0.0.0` exposes the server on all interfaces; secure with firewall, reverse proxy, and/or auth. HTTPS and auth are not provided by `serve`; use a reverse proxy.
- Full HTTP API schema, error codes, and deployment details: [Running as a Service](/deployment-operations/running-as-service).
