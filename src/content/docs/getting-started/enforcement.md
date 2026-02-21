---
title: Enforcement
description: "Sentrie returns decisions only; enforcement is implemented by the caller."
---

Sentrie is a deterministic policy engine. It evaluates facts against rules and returns decisions (e.g. boolean or trinary). It does not perform enforcement: no blocking, no API calls, no side effects. The caller uses the decision to enforce (allow/deny, redact, step-up auth, etc.).

## Syntax

**CLI:** Decisions are printed to stdout; exit code indicates success or failure. Caller script or service interprets the output and enforces.

**HTTP:** Caller sends a POST with facts; response body contains decision(s). Caller enforces based on the response.

```text
POST /decision/{namespace}/{policy}/{rule}
Content-Type: application/json

Request body: { "facts": { "factName": value, ... } }

Response: decision value(s); format depends on endpoint.
```

## Concepts

| Concept | Description |
| :--- | :--- |
| Decision | Output of a rule: typically `true`, `false`, or `unknown` (trinary). Sentrie only returns this; it does not act on it. |
| Enforcement | Action taken by the caller: allow/deny request, redact data, trigger step-up auth, throttle, etc. Implemented in IAM, API gateway, backend, or feature flag system. |
| Determinism | Same facts and policy → same decision. No mutable state or side effects inside the engine. Safe to replay and audit. |
| Portability | Same policy runs identically via CLI or HTTP; enforcement logic lives in the integrating system. |

**Returns:** Sentrie returns decision value(s). Exit code (CLI) or HTTP status indicates success/failure. No enforcement is performed by Sentrie.

## Examples

### CLI: caller enforces from exit code and stdout

```bash
result=$(sentrie exec com/example/auth/access/allow --facts '{"user": {"role": "user"}}')
# Parse $result; if allow is true, proceed; else deny or redirect.
```

### HTTP: caller enforces from response body

```bash
curl -s -X POST "https://sentrie.host:7529/decision/com/example/auth/access/allow" \
  -H "Content-Type: application/json" \
  -d '{"facts": {"user": {"role": "admin", "status": "active"}}}'
```

Caller reads the response; if decision is allow, the IAM/gateway/backend allows the request; otherwise it denies, redacts, or escalates.

### Typical enforcement roles

- **IAM / Auth:** Allow, deny, or trigger step-up based on decision.
- **API gateway:** Allow, throttle, or block route based on decision.
- **Backend:** Serve full response, redact fields, or return 403 based on decision.
- **Feature / entitlement:** Enable, disable, or cap usage based on decision.

## Behavior & Constraints

- **No side effects:** Sentrie does not mutate state, call external APIs, or perform enforcement. It only evaluates and returns decisions.
- **Caller responsibility:** The system that calls Sentrie (CLI script, API gateway, backend service) must interpret the decision and enforce (allow/deny, redact, etc.).
- **Determinism:** Same inputs and policy produce the same decision. Safe for critical paths and replay.
- **Same policy, many enforcers:** One policy can be used by IAM, gateway, and backend; each enforces in its own way.

## Constraints & Edge Cases

- Sentrie does not enforce. Missing or incorrect enforcement is a caller bug, not an engine behavior.
- Timeouts, network errors, and auth to the Sentrie endpoint are the caller’s responsibility.
- For HTTP, see Deployment & Operations (e.g. Running as a Service) for exact request/response schema and status codes.
