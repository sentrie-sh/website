---
title: "sentrie serve"
description: "Start the HTTP server for policy evaluation; load pack from a directory."
---

When you need to evaluate policies over HTTP (e.g. from a backend or API gateway), you run `sentrie serve`. It loads a policy pack from a directory and exposes a REST API so callers can POST facts and get decisions. Use it for local development or as the process behind a reverse proxy in production.

Here is the basic syntax:

```bash
sentrie serve [ --pack-location <PATH> ] [ --port <INT> ] [ --listen <ADDR> ... ]
```

All options are optional: pack directory defaults to the current directory, port to `7529`, and listen address to localhost.

## Configuration & Arguments

You can customize where the pack is loaded from and how the server listens using the following options:

| Argument | Type | Required | What it does |
| :------- | :--- | :------- | :----------- |
| `--pack-location` | path | No | Pack root (e.g. `*.sentrie`, optional `sentrie.pack.toml`, `*.js`). Default: `./`. |
| `--port` | int | No | Listen port. Default: `7529`. |
| `--listen` | string (repeatable) | No | Bind address: `local` (localhost), `0.0.0.0` (all interfaces), or specific IP. Default: `["local"]`. |

**Returns:** Process runs until SIGINT/SIGTERM (graceful shutdown). Exit non-zero on startup failure (e.g. port in use, pack load or parse error). HTTP API base: `http://<listen>:<port>`; see [Running as a Service](/deployment-operations/running-as-service) for request/response format.

---

## Examples in Action

### Starting the server with defaults

You want to run the server on localhost with the current directory as the pack and default port.

```bash
sentrie serve
```

### Using a custom port and pack path

You are developing with policies in a separate folder and want the server on a different port.

```bash
sentrie serve --port 8080 --pack-location ./my-policies
```

### Binding to all interfaces for production-style access

You are running behind a reverse proxy or need the server reachable from other machines; you point it at a fixed pack path and listen on all interfaces.

```bash
sentrie serve --pack-location /etc/sentrie/policies --listen 0.0.0.0 --port 8080
```

### Listening on multiple addresses with debug logging

You want the server on specific IPs and more verbose logs for troubleshooting.

```bash
sentrie serve --listen 127.0.0.1 --listen 192.168.1.100 --port 8080 --debug --log-level DEBUG
```

---

## Good to Know

Before you run this in production, keep a few boundaries in mind:

- **Constraint:** Startup loads the pack from `--pack-location`, parses `*.sentrie`, validates, builds the index, then listens. Policy or pack errors prevent startup. SIGINT (Ctrl+C) and SIGTERM trigger graceful shutdown; SIGKILL does not. Environment variables `SENTRIE_DEBUG`, `SENTRIE_LOG_LEVEL`, `SENTRIE_PORT` can override when not set via flags. All output goes to stdout/stderr; no file logging by default.
- **Edge case:** Port already in use → startup fails; use another `--port`. Invalid or missing pack directory or pack load/parse failure → startup fails. Listening on `0.0.0.0` exposes the server on all interfaces; secure with firewall, reverse proxy, and/or auth. HTTPS and auth are not provided by `serve`; use a reverse proxy. Full HTTP API schema and deployment details: [Running as a Service](/deployment-operations/running-as-service).
