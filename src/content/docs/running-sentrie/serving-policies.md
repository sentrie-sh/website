---
title: "Serving Policies"
description: "How to serve policies with Sentrie via HTTP API."
---

## Serving Policies

Policies can be served via an HTTP API using the `sentrie serve` command. This allows you to evaluate policies and rules over HTTP, making Sentrie policies accessible to other services and applications.

At a high level:

- **You run** `sentrie serve` to load a policy pack and start an HTTP server.
- **Callers send** JSON facts to the `/decision/{namespace}/{policy}[/{rule}]` endpoint.
- **Sentrie returns** decisions and attachments; your system enforces based on those decisions.

## Where to find full details

This page is a conceptual overview. For the complete HTTP API reference, including flags, endpoints, request/response schema, and error formats, see:

- [CLI Reference: `sentrie serve`](/cli-reference/serve)
- [Deployment & Operations: Running as a Service](/deployment-operations/running-as-service)

The following sections summarize default flags and typical API usage.

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

Each key in `facts` is a fact's **declared name**, the name written after `fact`, not its `as` alias. For `fact user: User as u`, send `user`; `u` is only the local name inside the policy. This is a breaking change from earlier versions, which keyed facts by alias, and there is no fallback: a request that sends `u` gets a `400` with `required fact not found: user`. A fact of the wrong type, such as a string for a `number`, also gets a `400` (`fact 'level': value x is not a number: invalid invocation`); it is the caller's mistake, so it is not reported per rule. See [Facts](/reference/facts).

Integers in `facts` that fit in 64 bits are read exactly, so an ID such as `9007199254740993` is evaluated, compared and returned with every digit. A number outside the float range, such as `1e400`, is rejected with a `400` problem response ("Invalid JSON"). See [Large Integers in Facts](/reference/arithmetic-operations#large-integers-in-facts).

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
        "state": "true",
        "value": true
      },
      "attachments": {
        "role": "admin"
      },
      "trace": { ... }
    }
  ]
}
```

A policy request in which every rule evaluated is HTTP **200** with a `decisions` array. If any rule failed, the response is **207 Multi-Status** instead; see [When a Rule Fails](#when-a-rule-fails) below. Request errors do not return 200 with an error string - they use [Problem Details](#error-responses) below.

**Response Fields:**

- `decisions`: Array of decision results. Each decision contains:
  - `policy`: The policy name (string)
  - `namespace`: The namespace (string)
  - `rule`: The rule name (string)
  - `decision`: The decision result object containing:
    - `state`: The decision state as a string: `"true"`, `"false"`, or `"unknown"`
    - `value`: The actual value of the decision (any JSON-serializable type)
  - `attachments`: Any attachments exported by the rule (dict of string to any); `null` when the rule failed
  - `trace`: Execution trace information (object, optional)
  - `error`: Present only when this rule failed; see [When a Rule Fails](#when-a-rule-fails)

**Decision States:**

The `state` field in the decision object can be one of:

- `"true"`: The rule evaluated to true
- `"false"`: The rule evaluated to false
- `"unknown"`: The rule evaluated to unknown (e.g., when `when` condition is false and no default is provided)

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

### When a Rule Fails

A rule can fail while it is evaluated (a division by zero, a value of the wrong type, an exceeded deadline). On a request for a whole policy, the failure is reported for that rule only and the other rules are still evaluated:

- The response is **207 Multi-Status** when any rule failed, including when every rule failed, and **200 OK** otherwise.
- The body is the same `{"decisions": [...]}`, with one entry per exported rule. A failed rule has an `unknown` decision, `null` attachments (even when only an attachment failed) and an `error` object; a rule that succeeded has no `error` field.
- A failed rule's `trace` shows where it failed in its `err` fields, but it can keep values computed before the failure. Read `decision` and `error`, not the trace.
- `error.status` is the HTTP status that failure would have had on its own: `400` for an invalid invocation, `503` for a deadline, `500` otherwise.

```json
{
  "decisions": [
    {
      "policy": "access",
      "namespace": "docs/checks",
      "rule": "ratio",
      "decision": { "state": "unknown", "value": "unknown" },
      "attachments": null,
      "trace": { ... },
      "error": {
        "title": "Evaluation Failed",
        "status": 500,
        "detail": "divide by zero"
      }
    },
    {
      "policy": "access",
      "namespace": "docs/checks",
      "rule": "is_admin",
      "decision": { "state": "true", "value": true },
      "attachments": {},
      "trace": { ... }
    }
  ]
}
```

Treat `207` as a success of the request that contains failures: read each decision, and check its `error` before you trust its `decision`.

Three things are not per-rule errors and answer with a [Problem Details](#error-responses) document:

- A fact error: a required fact is missing, a supplied fact has the wrong type, or an imported policy gets a wrongly typed or missing `with` fact (`400`).
- A request for a single rule (`/decision/{namespace}/{policy}/{rule}`) whose rule fails. The status follows the failure (`400`, `503` or `500`).
- A policy that cannot be resolved (`404`).

:::note
The order of the entries in `decisions` is not guaranteed and can differ between requests. Match results by `namespace`, `policy` and `rule`, not by position.
:::

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

- `200 OK`: Evaluation succeeded. Body is `{"decisions": [...]}` and no rule has an `error`.
- `207 Multi-Status`: A policy request in which at least one rule failed. Body is `{"decisions": [...]}`; see [When a Rule Fails](#when-a-rule-fails). This is not a Problem Details response.
- `400 Bad Request`: Invalid request - malformed JSON, missing path, or a **caller** evaluation problem such as a missing required fact or a supplied fact of the wrong type (`InvalidInvocation`). This includes a wrongly typed or missing `with` fact that an imported policy receives from the importing policy: the whole request fails with one `400` and no decisions, and the message names the imported policy
- `404 Not Found`: Policy, namespace, or rule not found
- `405 Method Not Allowed`: HTTP method not supported (only POST is allowed for the decision endpoint)
- `500 Internal Server Error`: Evaluation failed for an internal reason (on a single-rule request)

A failed single-rule evaluation does not include a `null` entry in `decisions`; the handler returns Problem Details instead.

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
3. **Handle Errors**: Parse the Problem Details body of a 4xx or 5xx response. Accept both 200 and 207 for a policy request, and check each decision's `error` field on a 207.
4. **Use Health Checks**: Monitor `/health` to ensure the server is running, and `/health/deep` to ensure it is ready to evaluate policies
5. **Secure Connections**: In production, use HTTPS and implement proper authentication/authorization
