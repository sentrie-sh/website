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

**Response:** `200` with body (or `207` when a rule failed, see below):

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
      "trace": { ... },
      "error": {
        "title": "Evaluation Failed",
        "status": 500,
        "detail": "string"
      }
    }
  ]
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `decisions` | array | One entry per evaluated rule. |
| `decision.state` | string | Trinary outcome. |
| `decision.value` | any | Rule yield value. |
| `attachments` | object | Exported attachments for that rule. |
| `error` | object | Present only on a rule that failed: `title`, `status` (`400`, `503` or `500`) and `detail`. Its `decision` is `unknown`. |

A request for a policy answers `207 Multi-Status` when any rule failed (also when all failed) and `200` otherwise. The other rules are still evaluated and reported. The order of `decisions` is not guaranteed. A missing or invalid fact, and a failing single-rule request, answer with a problem document instead. See [Serving Policies](/running-sentrie/serving-policies#when-a-rule-fails).

## Endpoints

| Endpoint | Method | Path | Body |
| :--- | :--- | :--- | :--- |
| Health | GET | `/health` | none |
| Decision | POST | `/decision/{namespace}/{policy}[/{rule}]` | `{ "facts": { ... } }` |

**Returns:** See schemas above. 200 for success; 207 when a rule of a policy request failed; 400 for invalid JSON or path, or a missing required fact; 404 for unknown policy/rule; 405 for wrong method; 500 for an evaluation error on a single-rule request or, for now, a fact with the wrong type (400 after sentrie-sh/sentrie#147).

## Examples in Action

### Calling the decision endpoint with curl

```bash
curl -X POST "http://localhost:7529/decision/com/example/auth/user/allow" \
  -H "Content-Type: application/json" \
  -d '{"facts":{"user":{"role":"admin"}}}'
```

### Passing multiple facts in the request body

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
| 500 | Internal error during evaluation of a single rule. |

## Good to Know

Before you implement this, keep a few boundaries in mind:

- Base URL: default `http://localhost:7529`. `--listen all` binds 0.0.0.0. Only POST is allowed for `/decision/{target...}`. Query parameters are parsed but not used for execution semantics.


- Facts must match policy declarations (required facts present; types/shapes valid). A missing fact returns 400; a fact with the wrong type returns 500 for now (400 after sentrie-sh/sentrie#147). CORS headers are sent (`Access-Control-Allow-Origin: *` etc.). No built-in auth or rate limiting.
