---
title: "serve Command"
description: "Start the Sentrie HTTP server to evaluate policies."
---

# serve Command

The `serve` command starts the Sentrie HTTP server to evaluate policies.

## Syntax

```bash
sentrie serve [OPTIONS]
```

## Description

The `serve` command starts an HTTP server that provides a REST API for evaluating Sentrie policies. The server loads policy files from a specified directory, creates an index of available policies and rules, and starts listening for HTTP requests.

## Options

| Option            | Type     | Default     | Description                       |
| ----------------- | -------- | ----------- | --------------------------------- |
| `--port`          | int      | `7529`      | Port to listen on                 |
| `--pack-location` | string   | `./`        | Directory containing policy files |
| `--listen`        | []string | `["local"]` | Address(es) to listen on          |

### --port

Specifies the port number for the HTTP server to listen on.

```bash
sentrie serve --port 8080
```

**Default**: `7529` (PLCY on a phone keypad)

**Examples**:

- `--port 8080` - Listen on port 8080
- `--port 3000` - Listen on port 3000

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

### --listen

Specifies the network addresses to listen on.

```bash
sentrie serve --listen 0.0.0.0 --listen 127.0.0.1
```

**Default**: `["local"]` (localhost only)

**Examples**:

- `--listen local` - Listen on localhost only
- `--listen 0.0.0.0` - Listen on all interfaces
- `--listen 127.0.0.1` - Listen on localhost
- `--listen 192.168.1.100` - Listen on specific IP

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
sentrie serve --port 8080

# Start server with custom pack location
sentrie serve --pack-location ./my-policies
```

### Production Configuration

```bash
# Production setup with environment variables
export SENTRIE_LOG_LEVEL=WARN
export SENTRIE_PORT=8080
sentrie serve --pack-location /etc/sentrie/policies --listen 0.0.0.0
```

### Development Setup

```bash
# Development setup with debug logging
sentrie serve --debug --log-level DEBUG --pack-location ./policies
```

### Multiple Listen Addresses

```bash
# Listen on multiple addresses
sentrie serve --listen 127.0.0.1 --listen 192.168.1.100 --port 8080
```

## Server Behavior

### Startup Process

1. **Load Pack**: Load policy pack from specified directory
2. **Parse Policies**: Parse all `.sentrie` files
3. **Validate Policies**: Check syntax and semantics
4. **Create Index**: Build index of policies and rules
5. **Start Server**: Begin listening for HTTP requests
6. **Log Status**: Log startup information and any errors

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

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Error: port 7529 is already in use
# Solution: Use a different port
sentrie serve --port 8080
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
sentrie serve --pack-location . --port 8080
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
  --listen 0.0.0.0 \
  --port 8080
```

### Development Setup

```bash
# Development setup
sentrie serve \
  --debug \
  --log-level DEBUG \
  --pack-location ./policies \
  --port 3000
```
