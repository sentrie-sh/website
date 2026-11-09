---
title: Error Reference
description: Overview of Sentrie error categories, CLI exit codes, and HTTP problem responses.
---

This page summarizes how Sentrie reports errors across the CLI, pack loading, evaluation, and the HTTP service.

## Error categories

- **Parse and pack errors**: Syntax issues in `*.sentrie` files or invalid `sentrie.pack.toml`.
- **Type and constraint errors**: Type mismatches, missing required facts, and constraint violations.
- **Evaluation errors**: Failures while evaluating a rule (often surfaced as type or constraint errors at a specific expression).
- **Service/API errors**: HTTP 4xx/5xx responses when using `sentrie serve`.

## CLI exit codes

All CLI commands follow a simple convention:

- Exit code **0**: success.
- Non-zero: failure (message written to stderr).

Common cases:

- `sentrie exec`: non-zero on pack load failure, invalid target, missing required facts, or evaluation error.
- `sentrie validate`: non-zero on pack load failure, parse or type error, or invalid facts passed for validation.
- `sentrie serve`: non-zero on startup if the pack cannot be loaded or the port/listen configuration is invalid.

See:

- [CLI Reference](/cli-reference)
- [sentrie exec](/cli-reference/exec)
- [sentrie validate](/cli-reference/validate)
- [sentrie serve](/cli-reference/serve)

## HTTP problem details

When running as a service, Sentrie uses [RFC 9457 problem+json](https://www.rfc-editor.org/rfc/rfc9457) for error responses:

```json
{
  "type": "https://sentrie.sh/problems/<code>",
  "title": "string",
  "status": 400,
  "detail": "string",
  "instance": "string"
}
```

Typical status codes:

| Status | Meaning |
| :----- | :------ |
| `400` | Bad request (invalid JSON, missing or malformed path, bad `facts` shape). |
| `404` | Policy, namespace, or rule not found. |
| `405` | Method not allowed (e.g. non-POST on `/decision`). |
| `500` | Internal error during evaluation. |

See: [Running as a Service](/deployment-operations/running-as-service)

## Relationship to troubleshooting

Use this page as a high-level map of how Sentrie reports errors. For a task-oriented list of frequent issues, concrete messages, and fixes, see:

- [Troubleshooting Overview](/troubleshooting)
- [Common Errors](/troubleshooting/common-errors)

