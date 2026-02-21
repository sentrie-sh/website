---
title: Running as a Service
description: "HTTP API for policy evaluation: endpoints, request/response schemas, and error format."
---


Start the server with `sentrie serve`. The API exposes health and decision evaluation. Request/response are JSON. Errors use RFC 9457 Problem Details.

## Syntax

```bash
sentrie serve [ --port 7529 ] [ --pack-location ./ ] [ --listen local | all | IP... ]
```

## Endpoints

### GET /health

**Returns:** `200` with body:

```json
{
  "status": "healthy",
  "time": "<RFC3339>"
}
```

### POST /decision/{target...}

Evaluates a policy or rule. `{target...}` = path segments: `namespace/policy` or `namespace/policy/rule`.

**Request:** `Content-Type: application/json`

```json
{
  "facts": {
    "<factName>": <value>,
    ...
  }
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `facts` | object | Yes | Map of fact name (or alias) to JSON value. Must satisfy policy fact types. |

**Response:** `200` with body:

```json
{
  "decisions": [
    {
      "policy": "string",
      "namespace": "string",
      "rule": "string",
      "decision": {
        "state": "TRUE" | "FALSE" | "UNKNOWN",
        "value": <any>
      },
      "attachments": { "<name>": <value>, ... },
      "trace": { ... }
    }
  ],
  "error": "string"
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `decisions` | array | One entry per evaluated rule. |
| `decision.state` | string | Trinary outcome. |
| `decision.value` | any | Rule yield value. |
| `attachments` | object | Exported attachments for that rule. |
| `error` | string | Non-empty if execution failed. |

## Concepts

| Endpoint | Method | Path | Body |
| :--- | :--- | :--- | :--- |
| Health | GET | `/health` | none |
| Decision | POST | `/decision/{namespace}/{policy}[/{rule}]` | `{ "facts": { ... } }` |

**Returns:** See schemas above. 400 for invalid JSON or path; 404 for unknown policy/rule; 405 for wrong method; 500 for evaluation error.

## Examples

### Basic Usage

```bash
curl -X POST "http://localhost:7529/decision/com/example/auth/user/allow" \
  -H "Content-Type: application/json" \
  -d '{"facts":{"user":{"role":"admin"}}}'
```

### Advanced Usage

```bash
curl -X POST "http://localhost:7529/decision/com/example/auth/user" \
  -H "Content-Type: application/json" \
  -d '{"facts":{"user":{"id":"u1","role":"admin"},"context":{}}}'
```

## Error Responses (RFC 9457)

`Content-Type: application/problem+json`

```json
{
  "type": "https://sentrie.sh/problems/<code>",
  "title": "string",
  "status": 400 | 404 | 405 | 500,
  "detail": "string",
  "instance": "string"
}
```

| Status | Meaning |
| :--- | :--- |
| 400 | Bad request (invalid JSON, missing path). |
| 404 | Policy or rule not found. |
| 405 | Method not allowed (e.g. GET on /decision). |
| 500 | Internal error during evaluation. |

## Behavior & Constraints

- Base URL: default `http://localhost:7529`. `--listen all` binds 0.0.0.0. Only POST is allowed for `/decision/{target...}`. Query parameters are parsed but not used for execution semantics.

## Constraints & Edge Cases

- Facts must match policy declarations (required facts present; types/shapes valid). Missing or invalid facts can return 400 or 500. CORS headers are sent (`Access-Control-Allow-Origin: *` etc.). No built-in auth or rate limiting.
