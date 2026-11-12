---
title: Error Reference
description: Overview of Sentrie error categories, CLI exit codes, and HTTP problem responses.
---

This page summarizes how Sentrie reports errors across the CLI, pack loading, evaluation, and the HTTP service.

## Error categories

- **Parse and pack errors**: Syntax issues in `*.sentrie` files or invalid `sentrie.pack.toml`.
- **Type and constraint errors**: Type mismatches, missing required facts, and constraint violations. A literal `default` of the wrong type, `default null` on a non-nullable fact, and two facts with the same declared name are index errors, reported by `sentrie validate` before any request (see [Facts](/reference/facts#defaults-are-type-checked)). A fact supplied with the wrong type fails the request with `fact '<name>': ...: invalid invocation`.
- **Evaluation errors**: Failures while evaluating a rule (often surfaced as type or constraint errors at a specific expression). Each failing rule reports its own [`error` object](/reference/rules#when-a-rule-fails); the other rules of the policy are still evaluated. Invalid operands are in this group: a string or fractional list index (`list index must be an integer, got ...`), `count` of something that is not a list, dict, set or string, and `+` joining a string with a list or dict (`+ cannot join a string with a list`).
- **Service/API errors**: HTTP 4xx/5xx responses when using `sentrie serve`.

## CLI exit codes

All CLI commands follow a simple convention:

- Exit code **0**: success.
- Non-zero: failure (message written to stderr).

Common cases:

- `sentrie exec`: non-zero on pack load failure, invalid target, missing required facts, or evaluation error. When a rule of a policy fails, every rule is still printed and the command exits `1` with `<n> of <m> rules failed`. The `Error:` line is written to stderr.
- `sentrie validate`: non-zero on pack load failure, parse or type error (including a wrongly typed literal fact default), or invalid facts passed for validation.
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
| `207` | Multi-Status. Not a problem document: a policy request in which at least one rule failed. The body is the normal `decisions` array and each failed rule has an `error` object. |
| `400` | Bad request (invalid JSON, missing or malformed path, bad `facts` shape, missing required fact, a supplied fact of the wrong type, or a wrongly typed or missing `with` fact of an imported policy). |
| `404` | Policy, namespace, or rule not found. |
| `405` | Method not allowed (e.g. non-POST on `/decision`). |
| `500` | Internal error during evaluation of a single-rule request. |

## Per-rule errors

When a rule fails, it carries an `error` object next to its output, with the same fields as a problem document:

```json
"error": { "title": "Evaluation Failed", "status": 500, "detail": "divide by zero" }
```

`status` is `400` for an invalid invocation, `503` for an exceeded deadline and `500` otherwise. The rule's decision is `unknown`. See [When a Rule Fails](/reference/rules#when-a-rule-fails).

See: [Running as a Service](/deployment-operations/running-as-service)

## Relationship to troubleshooting

Use this page as a high-level map of how Sentrie reports errors. For a task-oriented list of frequent issues, concrete messages, and fixes, see:

- [Troubleshooting Overview](/troubleshooting)
- [Common Errors](/troubleshooting/common-errors)

