---
title: "Serving Policies"
description: "How to serve policies with Sentrie via HTTP API."
---

## Serving Policies

Policies can be served via an HTTP API using the `sentrie serve` command. This allows you to evaluate policies and rules over HTTP, making Sentrie policies accessible to other services and applications.

## Starting the Server

The `sentrie serve` command starts an HTTP server that exposes your policy pack for evaluation:

```bash
sentrie serve <policy-pack>
```

### Command Options

- `--http-port` (default: `7529`): Port number to listen on
- `--pack-location` (default: `./`): Directory containing the policy pack to serve
- `--http-listen` (default: `["local"]`): Address(es) to listen on. Can be specified multiple times. Accepts one of the predefined values below, or one or more comma-separated IP addresses or hostnames:
  - `local` - Listen on `localhost`
  - `local4` - Listen on the IPv4 loopback address (127.0.0.1)
  - `local6` - Listen on the IPv6 loopback address (`::1`)
  - `network` - Listen on all network interfaces, IPv4 and IPv6
  - `network4` - Listen on all IPv4 interfaces (0.0.0.0)
  - `network6` - Listen on all IPv6 interfaces (`::`)

  A predefined value must be the only `--http-listen` value.

### Examples

```bash
# Serve the current directory on default port
sentrie serve .

# Serve a specific pack on a custom port
sentrie serve --http-port 8080 /path/to/policy-pack

# Listen on all interfaces
sentrie serve --http-listen network --http-port 8080 .

# Listen on localhost only (the default)
sentrie serve --http-listen local --http-port 8080 .

# Listen on multiple interfaces
sentrie serve --http-listen 192.168.1.100,192.168.100.101 --http-port 8080 .
```

## API Endpoints

### Health Check

**GET** `/health`

A liveness probe. It answers `200 OK` whenever the server can handle a request, and does not inspect the pack, the index or the executor.

**Response:**

```json
{
  "check_id": "DGCLX53IVFPHMGJKCA65FXONN5",
  "status": "healthy",
  "time": "2026-10-31T09:15:57Z"
}
```

- `check_id`: A fresh random value on every call, so a caller can tell a live answer from a cached one.
- `status`: Always `healthy`.
- `time`: The server time in RFC 3339 format (UTC).

### Deep Health Check

**GET** `/health/deep`

A readiness probe. It checks the components the server depends on and reports a status for each one.

| Component    | What it reports                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `index`      | Whether the pack was validated and committed, any failure, and the number of namespaces, policies, programs, rules and shapes |
| `executor`   | Whether the executor was initialized                                                                                         |
| `js_runtime` | Whether the JavaScript registry was initialized and which built-in `@sentrie/*` modules are registered                       |
| `pack`       | The pack `name` and `version`, and whether the pack directory can still be read                                              |

The top-level `status` is `healthy` when every component is healthy and `unhealthy` otherwise. The HTTP status code follows it: `200 OK` when healthy, `503 Service Unavailable` when any component is unhealthy. Each unhealthy component also adds an entry to `errors`, which is an empty array when everything is healthy.

**Healthy response (200):**

```json
{
  "status": "healthy",
  "time": "2026-10-31T09:15:57Z",
  "components": {
    "index": {
      "status": "healthy",
      "validated": true,
      "committed": true,
      "validation_error": null,
      "commit_error": null,
      "statistics": {
        "namespaces": 1,
        "policies": 1,
        "programs": 1,
        "rules": 1,
        "shapes": 0
      }
    },
    "executor": {
      "status": "healthy",
      "initialized": true
    },
    "js_runtime": {
      "status": "healthy",
      "registry_initialized": true,
      "builtin_modules": {
        "registered": 15,
        "modules": ["@sentrie/collection", "@sentrie/crypto", "@sentrie/encoding", "@sentrie/hash", "@sentrie/js", "@sentrie/json", "@sentrie/jwt", "@sentrie/math", "@sentrie/net", "@sentrie/regex", "@sentrie/semver", "@sentrie/string", "@sentrie/time", "@sentrie/url", "@sentrie/uuid"]
      }
    },
    "pack": {
      "status": "healthy",
      "loaded": true,
      "name": "example-pack",
      "version": "1.2.3",
      "accessible": true
    }
  },
  "errors": []
}
```

**Unhealthy response (503):**

This is the response when the pack directory is removed while the server is running. The `index`, `executor` and `js_runtime` components are the same as above and are left out here.

```json
{
  "status": "unhealthy",
  "time": "2026-10-31T09:16:05Z",
  "components": {
    "pack": {
      "status": "unhealthy",
      "loaded": true,
      "name": "example-pack",
      "version": "1.2.3",
      "accessible": false,
      "error": "pack directory is not accessible"
    }
  },
  "errors": [
    {
      "component": "pack",
      "message": "pack directory is not accessible"
    }
  ]
}
```

Notes on both endpoints:

- Only `GET` (and `HEAD`) is accepted. Other methods return `405 Method Not Allowed`.
- Responses carry `Cache-Control: no-store`.
- Like the rest of the server, they are unauthenticated.
- When the index fails validation or commit, the response contains only a fixed message (`index validation failed` or `index commit failed`). The details are written to the server's debug log, and the response never includes a filesystem path.
- The checks read the server's live state. They never validate or commit the index themselves.

Because `/health` does not depend on the pack and `/health/deep` returns `503` when a component is unhealthy, they map onto container probes. For example, in Kubernetes:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 7529
readinessProbe:
  httpGet:
    path: /health/deep
    port: 7529
```

Start the server with `--http-listen network` (or `network4` for IPv4 only) so the probes can reach it from outside the container.

:::caution
The API has no authentication (see [sentrie-sh/sentrie#115](https://github.com/sentrie-sh/sentrie/issues/115)). Keep it behind a cluster-internal Service or a NetworkPolicy, and never expose it publicly.
:::

### Decision Evaluation

**POST** `/decision/{target...}`

Evaluates a policy or rule. The `{target...}` path parameter contains the full path to the namespace, policy, and optionally the rule.

**Path Format:**

- `/decision/{namespace}/{policy}/{rule}` - Evaluates a specific rule within a policy
- `/decision/{namespace}/{policy}` - Evaluates all exported rules within a policy

**Path Parameters:**

The `{target...}` parameter is the full path after `/decision/`:

- `{namespace}`: The namespace of the policy (e.g., `com/example/auth`)
- `{policy}`: The policy name
- `{rule}`: (Optional) The specific rule name to evaluate

**Examples:**

- `/decision/com/example/auth/user/isAdmin` - Evaluate the `isAdmin` rule
- `/decision/com/example/auth/user` - Evaluate all exported rules in the `user` policy

**Request Body:**

```json
{
  "facts": {
    "user": {
      "id": "123",
      "role": "admin",
      "permissions": ["read", "write"]
    },
    "context": {
      "environment": "production"
    }
  }
}
```

**Query Parameters:**

- Query parameters are parsed and passed as run configuration (currently parsed but not used in execution)

**Response:**

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

**Response Fields:**

- `decisions`: Array of decision results. Each decision contains:
  - `policy`: The policy name (string)
  - `namespace`: The namespace (string)
  - `rule`: The rule name (string)
  - `decision`: The decision result object containing:
    - `state`: The decision state as a string: `"TRUE"`, `"FALSE"`, or `"UNKNOWN"`
    - `value`: The actual value of the decision (any JSON-serializable type)
  - `attachments`: Any attachments exported by the rule (dict of string to any)
  - `trace`: Execution trace information (object, optional)
- `error`: Error message if execution failed (omitted if empty/absent)

**Decision States:**

The `state` field in the decision object can be one of:

- `"TRUE"`: The rule evaluated to true
- `"FALSE"`: The rule evaluated to false
- `"UNKNOWN"`: The rule evaluated to unknown (e.g., when `when` condition is false and no default is provided)

**Example Requests:**

```bash
# Evaluate a specific rule
curl -X POST http://localhost:7529/decision/com/example/auth/user/isAdmin \
  -H "Content-Type: application/json" \
  -d '{
    "facts": {
      "user": {
        "id": "123",
        "role": "admin"
      }
    }
  }'

# Evaluate all exported rules in a policy
curl -X POST http://localhost:7529/decision/com/example/auth/user \
  -H "Content-Type: application/json" \
  -d '{
    "facts": {
      "user": {
        "id": "123",
        "role": "admin"
      }
    }
  }'
```

## Error Responses

The API uses RFC 9457 Problem Details format for error responses.

**Error Response Format:**

Errors are returned using RFC 9457 Problem Details format with `Content-Type: application/problem+json`:

```json
{
  "type": "https://sentrie.sh/problems/400",
  "title": "Invalid Path",
  "status": 400,
  "detail": "The path parameter is required but was not provided",
  "instance": "request-id-12345"
}
```

Additional fields may be included in the `ext` object (shown as top-level fields in JSON):

- `timestamp`: ISO 8601 timestamp of when the error occurred

**Common HTTP Status Codes:**

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request (e.g., malformed JSON, missing required path)
- `404 Not Found`: Policy, namespace, or rule not found
- `405 Method Not Allowed`: HTTP method not supported (only POST is allowed for decision endpoint)
- `500 Internal Server Error`: Server error during policy evaluation

## CORS Support

The API includes CORS headers to allow cross-origin requests:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Limitations and Future Work

:::warning[Work in Progress]
The HTTP server implementation is still being developed. The following areas may need additional work:

- **Request/Response Semantics**: The exact semantics of request handling, error propagation, and response formatting may be refined
- **Authentication/Authorization**: Currently, the server has no built-in authentication or authorization mechanisms
- **Rate Limiting**: No rate limiting is currently implemented
- **Request Validation**: Additional validation of request payloads may be added
- **Response Formatting**: The response format and structure may be adjusted for better consistency
- **Tracing**: The trace information in responses may be enhanced or made optional

Please refer to the latest codebase for the most current implementation details.
:::

## Best Practices

1. **Use Specific Rules**: When possible, evaluate specific rules rather than entire policies for better performance and clearer results
2. **Validate Facts**: Ensure facts match the expected types and shapes defined in your policies
3. **Handle Errors**: Always check the `error` field in responses and handle error cases appropriately
4. **Use Health Checks**: Monitor `/health` to ensure the server is running, and `/health/deep` to ensure it is ready to evaluate policies
5. **Secure Connections**: In production, use HTTPS and implement proper authentication/authorization
