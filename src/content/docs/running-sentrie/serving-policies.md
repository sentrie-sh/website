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

- `--port` (default: `7529`): Port number to listen on
- `--pack-location` (default: `./`): Directory containing the policy pack to serve
- `--listen` (default: `["local"]`): Address(es) to listen on. Can be specified multiple times. Accepts:
  - `local` - Listen on localhost (127.0.0.1)
  - `all` - Listen on all interfaces (0.0.0.0)
  - Specific IP address or hostname

### Examples

```bash
# Serve the current directory on default port
sentrie serve .

# Serve a specific pack on a custom port
sentrie serve --port 8080 /path/to/policy-pack

# Listen on all interfaces
sentrie serve --listen all --port 8080 .

# Listen on multiple addresses
sentrie serve --listen local --listen 192.168.1.100 --port 8080 .
```

## API Endpoints

### Health Check

**GET** `/health`

Returns the health status of the server.

**Response:**

```json
{
  "status": "healthy",
  "time": "2024-01-15T10:30:00Z"
}
```

### Decision Evaluation

**POST** `/decision/{namespace}/{policy}/{rule}`

Evaluates a specific rule within a policy.

**POST** `/decision/{namespace}/{policy}`

Evaluates all exported rules within a policy.

**Path Parameters:**

- `{namespace}`: The namespace of the policy (e.g., `com/example/auth`)
- `{policy}`: The policy name
- `{rule}`: (Optional) The specific rule name to evaluate

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

- Any query parameters are passed as run configuration to the policy execution

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
  - `policy`: The policy name
  - `namespace`: The namespace
  - `rule`: The rule name
  - `decision`: The decision result with `state` (TRUE/FALSE/UNKNOWN) and `value`
  - `attachments`: Any attachments exported by the rule
  - `trace`: Execution trace information
- `error`: Error message if execution failed (empty string if successful)

**Decision States:**

- `TRUE`: The rule evaluated to true
- `FALSE`: The rule evaluated to false
- `UNKNOWN`: The rule evaluated to unknown (e.g., when `when` condition is false and no default is provided)

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

```json
{
  "type": "https://sentrie.sh/problems/400",
  "title": "Invalid Path",
  "status": 400,
  "detail": "The path parameter is required but was not provided",
  "instance": "request-id-12345",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

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

## Request ID Middleware

All requests include a request ID in the response headers and error responses for tracing and debugging purposes.

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
4. **Use Health Checks**: Monitor the `/health` endpoint to ensure the server is running
5. **Secure Connections**: In production, use HTTPS and implement proper authentication/authorization
