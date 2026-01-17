---
title: "CLI Reference"
description: "Complete reference for the Sentrie command-line interface."
---

# CLI Reference

This document provides comprehensive reference for the Sentrie command-line interface.

## Overview

Sentrie provides a command-line interface for running policy servers and managing policy packs. The CLI is built on top of the `cling` framework and provides a consistent, user-friendly experience.

## Global Options

All Sentrie commands support these global options:

| Option            | Description                              | Default |
| ----------------- | ---------------------------------------- | ------- |
| `--help`, `-h`    | Show help information                    | -       |
| `--version`, `-v` | Show version information                 | -       |
| `--debug`         | Enable debug logging                     | `false` |
| `--log-level`     | Set log level (DEBUG, INFO, WARN, ERROR) | `INFO`  |

## Commands

### `exec`

Execute a policy or rule from a policy pack.

See the [exec command documentation](./exec) for details.

### `init`

Initialize a new policy pack.

See the [init command documentation](./init) for details.

### `serve`

Start the Sentrie HTTP server to evaluate policies.

#### Syntax

```bash
sentrie serve [OPTIONS]
```

#### Options

| Option            | Type     | Default     | Description                       |
| ----------------- | -------- | ----------- | --------------------------------- |
| `--port`          | int      | `7529`      | Port to listen on                 |
| `--pack-location` | string   | `./`        | Directory containing policy files |
| `--listen`        | []string | `["local"]` | Address(es) to listen on          |

#### Examples

```bash
# Start server on default port
sentrie serve

# Start server on custom port
sentrie serve --port 8080

# Start server with custom pack location
sentrie serve --pack-location /path/to/policies

# Start server on specific addresses
sentrie serve --listen 0.0.0.0 --listen 127.0.0.1

# Start server with debug logging
sentrie serve --debug --log-level DEBUG
```

#### Environment Variables

The `serve` command respects these environment variables:

| Variable            | Description          | Default |
| ------------------- | -------------------- | ------- |
| `SENTRIE_DEBUG`     | Enable debug logging | `false` |
| `SENTRIE_LOG_LEVEL` | Log level            | `INFO`  |
| `SENTRIE_PORT`      | Default port         | `7529`  |

#### Server Behavior

When you start the server, it will:

1. Load the policy pack from the specified location
2. Parse and validate all `.sentrie` files
3. Create an index of policies and rules
4. Start the HTTP server on the specified port
5. Log startup information and any errors

#### Pack Loading

The server looks for policy files in the specified directory:

- **Policy files**: `*.sentrie` - Sentrie policy files
- **Pack file**: `sentrie.pack.toml` - Pack metadata (optional)
- **JavaScript modules**: `*.js` - JavaScript modules for `use` statements

#### Error Handling

If the server encounters errors during startup:

- **Policy parsing errors**: Server will not start, errors are logged
- **Pack loading errors**: Server will not start, errors are logged
- **Port binding errors**: Server will not start, error is logged
- **Runtime errors**: Server continues running, errors are logged

#### Graceful Shutdown

The server supports graceful shutdown:

- **SIGINT** (Ctrl+C): Graceful shutdown
- **SIGTERM**: Graceful shutdown
- **SIGKILL**: Immediate shutdown

### `validate`

Validate a policy pack's structure, syntax, and type correctness.

#### Syntax

```bash
sentrie validate <FQN> [OPTIONS]
```

#### Options

| Option            | Type   | Default | Description                       |
| ----------------- | ------ | ------- | --------------------------------- |
| `--pack-location` | string | `./`    | Directory containing policy files |
| `--facts`         | string | `{}`    | Facts for type checking           |

#### Examples

```bash
# Validate a policy pack
sentrie validate user_management/user_access

# Validate with facts for type checking
sentrie validate user_management/user_access --facts '{"user":{"role":"admin"}}'

# Validate from a specific location
sentrie validate com/example/auth/access_control --pack-location ./policies
```

See the [validate command documentation](./validate) for details.

## HTTP API

When the server is running, it provides a REST API for policy evaluation.

### Base URL

```
http://localhost:7529
```

### Endpoints

#### Decision Execution

**POST** `/decision/{target...}`

Execute a policy or rule. The `{target...}` path parameter contains the full path to the namespace, policy, and optionally the rule.

##### Path Format

- `/decision/{namespace}/{policy}/{rule}` - Execute a specific rule
- `/decision/{namespace}/{policy}` - Execute all exported rules in a policy

The path is resolved to extract:
- `namespace`: The namespace (all segments except the last two)
- `policy`: The policy name (second to last segment)
- `rule`: The rule name (last segment, optional)

##### Request Body

The request body must be a JSON object with a `facts` field:

```json
{
  "facts": {
    "user": {
      "id": "user123",
      "role": "admin"
    },
    "resource": {
      "id": "resource456",
      "owner": "user123"
    }
  }
}
```

##### Response

The response is a JSON object containing an array of decisions:

```json
{
  "decisions": [
    {
      "policy": "user",
      "namespace": "com/example/auth",
      "rule": "isAdmin",
      "decision": {
        "state": "TRUE",
        "value": true
      },
      "attachments": {
        "role": "admin"
      },
      "trace": { ... }
    }
  ],
  "error": ""
}
```

##### Query Parameters

Query parameters are parsed as run configuration (currently parsed but not used in execution).

##### Error Responses

Errors are returned using RFC 9457 Problem Details format with `Content-Type: application/problem+json`:

**400 Bad Request**
```json
{
  "type": "https://sentrie.sh/problems/400",
  "title": "Invalid JSON",
  "status": 400,
  "detail": "The request body could not be parsed as valid JSON",
  "instance": "request-id-12345"
}
```

**404 Not Found**
```json
{
  "type": "https://sentrie.sh/problems/404",
  "title": "Invalid Path",
  "status": 404,
  "detail": "Policy 'com/example/auth/user' not found",
  "instance": "request-id-12345"
}
```

**405 Method Not Allowed**
```json
{
  "type": "https://sentrie.sh/problems/405",
  "title": "Method Not Allowed",
  "status": 405,
  "detail": "Only POST requests are supported for this endpoint",
  "instance": "request-id-12345"
}
```

### Example Requests

#### Simple Authorization

```bash
curl -X POST "http://localhost:7529/decision/com/example/auth/user/allow" \
  -H "Content-Type: application/json" \
  -d '{
    "facts": {
      "user": {"id": "user123", "role": "admin"}
    }
  }'
```

#### Resource Access Control

```bash
curl -X POST "http://localhost:7529/decision/com/example/resources/document/canRead" \
  -H "Content-Type: application/json" \
  -d '{
    "facts": {
      "user": {"id": "user123", "role": "user"},
      "document": {"id": "doc456", "owner": "user123"}
    }
  }'
```

#### Complex Policy with Attachments

```bash
curl -X POST "http://localhost:7529/decision/com/example/billing/pricing/calculatePrice" \
  -H "Content-Type: application/json" \
  -d '{
    "facts": {
      "user": {"id": "user123", "isPremium": true},
      "product": {"id": "prod789", "price": 100.0}
    }
  }'
```

## Configuration

### Pack Configuration

Create a `sentrie.pack.toml` file in your pack directory:

```toml
schema_version = "0.1.0"
name = "my-policy-pack"
version = "1.0.0"
description = "My policy pack"
license = "MIT"
repository = "https://github.com/myorg/my-policy-pack"

[engines]
sentrie = "0.1.0"

[authors]
"John Doe" = "john@example.com"

[permissions]
fs_read = ["/etc/passwd"]
net = ["http://example.com"]

[metadata]
"custom" = "value"
```

### Environment Configuration

Set environment variables for configuration:

```bash
export SENTRIE_DEBUG=true
export SENTRIE_LOG_LEVEL=DEBUG
export SENTRIE_PORT=8080
sentrie serve
```

### Logging Configuration

Configure logging levels and output:

```bash
# Debug logging
sentrie serve --debug

# Custom log level
sentrie serve --log-level WARN

# Environment variable
export SENTRIE_LOG_LEVEL=ERROR
sentrie serve
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

### Performance Tuning

#### Memory Usage

The server uses memory for:

- Policy index
- JavaScript VM pools
- Call memoization cache
- Module bindings

Monitor memory usage and adjust cache sizes if needed.

#### Concurrent Requests

The server handles concurrent requests efficiently:

- Each request gets its own execution context
- JavaScript VMs are pooled for reuse
- Policy evaluation is stateless

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
  -d '{
    "facts": {
      "user": {"role": "admin"}
    }
  }'
```

### Production Deployment

For production deployment:

1. **Use a reverse proxy** (nginx, Apache)
2. **Enable HTTPS** with SSL certificates
3. **Set up monitoring** and logging
4. **Configure load balancing** for high availability
5. **Use environment variables** for configuration
6. **Set up health checks** for the API

### Docker Deployment

```dockerfile
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o sentrie .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/sentrie .
COPY --from=builder /app/policies ./policies
EXPOSE 7529
CMD ["./sentrie", "serve", "--pack-location", "./policies"]
```

## Best Practices

### 1. Use Descriptive Names

```bash
# Good
sentrie serve --pack-location ./production-policies

# Bad
sentrie serve --pack-location ./p
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

### 3. Use Environment Variables

```bash
# production.sh
export SENTRIE_LOG_LEVEL=WARN
export SENTRIE_PORT=8080
sentrie serve --pack-location ./policies
```

### 4. Monitor Performance

```bash
# Enable debug logging to monitor performance
sentrie serve --debug --log-level DEBUG
```

### 5. Handle Errors Gracefully

```bash
# Check exit codes
if ! sentrie serve; then
  echo "Failed to start server"
  exit 1
fi
```
