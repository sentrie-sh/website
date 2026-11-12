---
title: "sentrie serve"
description: "Start the HTTP server for policy evaluation; load pack from a directory."
---

When you need to evaluate policies over HTTP (e.g. from a backend or API gateway), you run `sentrie serve`. It loads a policy pack from a directory and exposes a REST API so callers can POST facts and get decisions. Use it for local development or as the process behind a reverse proxy in production.

Here is the basic syntax:

```bash
sentrie serve [--pack-location <PATH>] [--http-port <INT>] [--http-listen <ADDR> ...]
```

All options are optional: pack directory defaults to the current directory, port to `7529`, and listen address to localhost (`--http-listen local`).

## Configuration & Arguments

You can customize where the pack is loaded from and how the server listens using the following options:

| Option            | Type     | Default     | Description                       |
| ----------------- | -------- | ----------- | --------------------------------- |
| `--http-port`     | int      | `7529`      | Port to listen on                 |
| `--pack-location` | string   | `./`        | Directory containing policy files |
| `--http-listen`   | []string | `["local"]` | Address(es) to listen on          |

**Returns:** Process runs until SIGINT/SIGTERM (graceful shutdown). Exit non-zero on startup failure (e.g. port in use, pack load or parse error). HTTP API base: `http://<listen>:<port>`; see [Running as a Service](/deployment-operations/running-as-service) for request/response format.

### --http-port

---

## Examples in Action

### Starting the server with defaults

You want to run the server on localhost with the current directory as the pack and default port.

```bash
sentrie serve
```

**Default**: `7529` (PLCY on a phone keypad)

**Examples**:

- `--http-port 8080` - Listen on port 8080
- `--http-port 3000` - Listen on port 3000

### --pack-location

Specifies the directory containing Sentrie policy files.

```bash
sentrie serve --pack-location /path/to/policies
```

**Default**: `./` (current directory)

**Examples**:

- `--pack-location ./policies` - Load policies from `./policies` directory
- `--pack-location /etc/sentrie/policies` - Load policies from `/etc/sentrie/policies`

**Requirements**:

- Directory must exist
- Directory must contain `.sentrie` policy files
- Optional `sentrie.pack.toml` file for pack metadata

### --http-listen

Specifies the network addresses to listen on.

```bash
sentrie serve --http-listen 0.0.0.0 --http-listen 127.0.0.1
```

**Default**: `["local"]` (localhost only)

**Examples**:

- `--http-listen local` - Listen on localhost only
- `--http-listen 0.0.0.0` - Listen on all interfaces
- `--http-listen 127.0.0.1` - Listen on localhost
- `--http-listen 192.168.1.100` - Listen on specific IP

**Predefined values**: `local`, `local4`, `local6`, `network`, `network4` and `network6` are shorthands for common addresses. A predefined value must be the only `--http-listen` value.

| Value      | Binds                                    |
| ---------- | ---------------------------------------- |
| `local`    | `localhost:<port>`                       |
| `local4`   | `127.0.0.1:<port>`                       |
| `local6`   | `[::1]:<port>` (IPv6 loopback)           |
| `network`  | all interfaces, IPv4 and IPv6            |
| `network4` | `0.0.0.0:<port>`                         |
| `network6` | `[::]:<port>`                            |

On dual-stack hosts, either wildcard (`0.0.0.0` or `[::]`) also accepts connections from the other address family, the same as `network`; `network4` and `network6` do not restrict the family.

```bash
# IPv6 loopback only; reachable at http://[::1]:8080
sentrie serve --http-listen local6 --http-port 8080 .
```

To listen on a literal IPv6 address, pass it without brackets (for example `--http-listen ::1`); Sentrie adds the brackets when it joins the address and port.

**Errors**: If a listen address cannot be bound (for example the port is already in use) or the port is invalid, `serve` exits non-zero with `invalid or unusable --http-listen/--http-port: <cause>`. An empty address, such as `--http-listen=`, is rejected the same way, with `invalid or unusable --http-listen/--http-port: listen address must not be empty; use network to listen on all interfaces`; it never binds every interface by accident.

> `local6` and `network6` previously produced a malformed `[[::1]]` and `[[::]]` address and failed to bind. They now work as documented. This is a bug fix, not a behaviour change for working setups.

**Security Note**: Listening on `0.0.0.0` makes the server accessible from any network interface. Use with caution in production environments.

## Environment Variables

The `serve` command respects these environment variables:

| Variable            | Description                          | Default |
| ------------------- | ------------------------------------ | ------- |
| `SENTRIE_DEBUG`     | Enable debug logging                 | `false` |
| `SENTRIE_LOG_LEVEL` | Log level (DEBUG, INFO, WARN, ERROR) | `INFO`  |
| `SENTRIE_PORT`      | Default port                         | `7529`  |

## Examples

### Basic Usage

```bash
# Start server with defaults
sentrie serve

# Start server on custom port
sentrie serve --http-port 8080

# Start server with custom pack location
sentrie serve --pack-location ./my-policies
```

### Using a custom port and pack path

You are developing with policies in a separate folder and want the server on a different port.

```bash
sentrie serve --http-port 8080 --pack-location ./my-policies

# Production setup with environment variables
export SENTRIE_LOG_LEVEL=WARN
export SENTRIE_PORT=8080
sentrie serve --pack-location /etc/sentrie/policies --http-listen 0.0.0.0
```

### Binding to all interfaces for production-style access

You are running behind a reverse proxy or need the server reachable from other machines; you point it at a fixed pack path and listen on all interfaces.

```bash
sentrie serve --pack-location /etc/sentrie/policies --http-listen 0.0.0.0 --http-port 8080
```

### Listening on multiple addresses with debug logging

You want the server on specific IPs and more verbose logs for troubleshooting.

```bash
# Listen on multiple addresses with debug logging
sentrie serve --http-listen 127.0.0.1 --http-listen 192.168.1.100 --http-port 8080 --debug --log-level DEBUG
```

---

## Good to Know

Before you run this in production, keep a few boundaries in mind:

### Pack Loading

The server looks for the following files in the pack directory:

- **Policy Files**: `*.sentrie` - Sentrie policy files
- **Pack File**: `sentrie.pack.toml` - Pack metadata (optional)
- **JavaScript Modules**: `*.js` - JavaScript modules for `use` statements

### Error Handling

If the server encounters errors during startup:

- **Policy Parsing Errors**: Server will not start, errors are logged
- **Pack Loading Errors**: Server will not start, errors are logged
- **Port Binding Errors**: Server will not start, error is logged
- **Runtime Errors**: Server continues running, errors are logged

### Graceful Shutdown

The server supports graceful shutdown on these signals:

- **SIGINT** (Ctrl+C): Graceful shutdown
- **SIGTERM**: Graceful shutdown
- **SIGKILL**: Immediate shutdown

## HTTP API

Once started, the server provides a REST API at:

```
http://localhost:7529
```

### Decision Endpoint

**POST** `/decision/{namespace}/{policy}/{rule}`

Execute a specific rule with provided facts.

**Example**:

```bash
curl -X POST "http://localhost:7529/decision/com/example/auth/user/allow" \
  -H "Content-Type: application/json" \
  -d '{"user": {"role": "admin"}}'
```

A request for a whole policy (`/decision/{namespace}/{policy}`) answers `200` when every rule evaluated and `207 Multi-Status` when any rule failed; each failed rule carries an `error` object and the others are still returned, in no guaranteed order. See [Serving Policies](/running-sentrie/serving-policies#when-a-rule-fails).

### Health Endpoints

**GET** `/health` is a liveness probe and always returns `200 OK`:

```bash
curl http://localhost:7529/health
```

```json
{"check_id":"DGCLX53IVFPHMGJKCA65FXONN5","status":"healthy","time":"2026-10-31T09:15:57Z"}
```

**GET** `/health/deep` is a readiness probe. It reports the status of the `index`, `executor`, `js_runtime` and `pack` components and an `errors` array, and returns `503 Service Unavailable` when any component is unhealthy (`200 OK` otherwise). Both endpoints are unauthenticated, like the rest of the API. See [Serving Policies](/running-sentrie/serving-policies#deep-health-check) for the full response format.

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Error: port 7529 is already in use
# Solution: Use a different port
sentrie serve --http-port 8080
```

#### Policy Not Found

```bash
# Error: Policy 'com/example/auth/user' not found
# Solution: Check namespace and policy names
# Make sure the policy file exists and is valid
```

#### Invalid Policy Syntax

```bash
# Error: Policy parsing failed
# Solution: Check the policy file syntax
# Use --debug for detailed error messages
```

#### Pack Loading Failed

```bash
# Error: Pack loading failed
# Solution: Check the pack directory exists
# Verify sentrie.pack.toml is valid
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
sentrie serve --debug --log-level DEBUG
```

This will show:

- Policy loading progress
- Detailed error messages
- Request/response logging
- Performance metrics

### Log Levels

| Level   | Description                    |
| ------- | ------------------------------ |
| `DEBUG` | Detailed debugging information |
| `INFO`  | General information messages   |
| `WARN`  | Warning messages               |
| `ERROR` | Error messages only            |

## Performance Considerations

### Memory Usage

The server uses memory for:

- Policy index
- JavaScript VM pools
- Call memoization cache
- Module bindings

### Concurrent Requests

The server handles concurrent requests efficiently:

- Each request gets its own execution context
- JavaScript VMs are pooled for reuse
- Policy evaluation is stateless

### Caching

The server includes several caching mechanisms:

- **Call Memoization**: Caches function call results
- **Module Bindings**: Caches JavaScript module bindings
- **Policy Index**: Caches parsed policy information

## Security Considerations

### Network Security

- **Localhost Only**: Default configuration only listens on localhost
- **Firewall**: Use firewall rules to restrict access
- **HTTPS**: Use a reverse proxy for HTTPS termination
- **Authentication**: Implement authentication at the application level

### File System Security

- **Read-Only**: Policy files should be read-only
- **Permissions**: Restrict access to policy directories
- **Validation**: Validate all input data

## Best Practices

### 1. Use Environment Variables

```bash
# production.sh
export SENTRIE_LOG_LEVEL=WARN
export SENTRIE_PORT=8080
sentrie serve --pack-location ./policies
```

### 2. Organize Policies

```
policies/
├── auth/
│   ├── user.sentrie
│   └── admin.sentrie
├── billing/
│   └── pricing.sentrie
└── sentrie.pack.toml
```

### 3. Monitor Performance

```bash
# Enable debug logging to monitor performance
sentrie serve --debug --log-level DEBUG
```

### 4. Handle Errors Gracefully

```bash
# Check exit codes
if ! sentrie serve; then
  echo "Failed to start server"
  exit 1
fi
```

### 5. Use Process Managers

For production deployments, use process managers like:

- **systemd** (Linux)
- **supervisor** (Cross-platform)
- **PM2** (Node.js ecosystem)
- **Docker** (Containerized deployments)

## Examples

### Complete Example

1. **Create a policy pack**:

```bash
mkdir my-policy-pack
cd my-policy-pack
```

2. **Create a policy file**:

```text
# auth.sentrie
namespace com/example/auth

policy user {
  rule allow = default false when user.role == "admin" {
    yield true
  }

  export decision of allow
}
```

3. **Create a pack file**:

```toml
# sentrie.pack.toml
schema_version = "0.1.0"
name = "my-policy-pack"
version = "1.0.0"
description = "My policy pack"

[engines]
sentrie = "0.1.0"
```

4. **Start the server**:

```bash
sentrie serve --pack-location . --http-port 8080
```

5. **Test the policy**:

```bash
curl -X POST "http://localhost:8080/decision/com/example/auth/user/allow" \
  -H "Content-Type: application/json" \
  -d '{"user": {"role": "admin"}}'
```

### Production Deployment

```bash
# Production setup
export SENTRIE_LOG_LEVEL=WARN
export SENTRIE_PORT=8080
sentrie serve \
  --pack-location /etc/sentrie/policies \
  --http-listen 0.0.0.0 \
  --http-port 8080
```

### Development Setup

```bash
# Development setup
sentrie serve \
  --debug \
  --log-level DEBUG \
  --pack-location ./policies \
  --http-port 3000
```

### Runtime behavior

- **Constraint:** Startup loads the pack from `--pack-location`, parses `*.sentrie`, validates, builds the index, then listens. Policy or pack errors prevent startup. SIGINT (Ctrl+C) and SIGTERM trigger graceful shutdown; SIGKILL does not. Environment variables `SENTRIE_DEBUG`, `SENTRIE_LOG_LEVEL`, `SENTRIE_PORT` can override when not set via flags. All output goes to stdout/stderr; no file logging by default.
- **Edge case:** Port already in use → startup fails; use another `--http-port`. Invalid or missing pack directory or pack load/parse failure → startup fails. Listening on `0.0.0.0` exposes the server on all interfaces; secure with firewall, reverse proxy, and/or auth. HTTPS and auth are not provided by `serve`; use a reverse proxy. Full HTTP API schema and deployment details: [Running as a Service](/deployment-operations/running-as-service).