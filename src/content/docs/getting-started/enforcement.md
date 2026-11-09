---
title: Enforcement
description: "Sentrie returns decisions only; enforcement is implemented by the caller."
---

Sentrie is a deterministic policy engine: it takes facts and rules and returns decisions (e.g. true, false, or unknown). It does not block requests, call APIs, or change state. When you need to actually allow/deny, redact, or step up auth, your system (IAM, API gateway, backend) reads the decision and enforces it. That split keeps the engine simple and safe to plug into any stack.

Here is the basic idea:

**CLI:** Decisions are printed to stdout; exit code indicates success or failure. Your script or service interprets the output and enforces.

**HTTP:** You POST facts to an endpoint; the response body contains the decision(s). Your service enforces based on that.

```text
POST /decision/{namespace}/{policy}/{rule}
Content-Type: application/json
Request body: { "facts": { "factName": value, ... } }
Response: decision value(s); see Running as a Service for schema.
```

## Configuration & Arguments

These concepts clarify how decisions and enforcement relate:

| Concept | What it means |
| :------ | :------------ |
| Decision | The output of a rule: typically `true`, `false`, or `unknown`. Sentrie only returns this; it does not act on it. |
| Enforcement | What your system does with the decision: allow/deny, redact, step-up auth, throttle, etc. Implemented in IAM, gateway, backend, or feature flags. |
| Determinism | Same facts and policy → same decision. No mutable state or side effects inside the engine; safe to replay and audit. |
| Portability | Same policy runs the same via CLI or HTTP; enforcement logic lives in your integrating system. |

**Returns:** Sentrie returns decision value(s). Exit code (CLI) or HTTP status indicates success or failure. Sentrie does not perform enforcement.

---

## Examples in Action

### Letting the caller enforce from the CLI

You run `sentrie exec` in a script; the script parses stdout and exit code and then allows or denies the operation.

```bash
result=$(sentrie exec com/example/auth/access/allow --facts '{"user": {"role": "user"}}')
# Parse $result; if allow is true, proceed; else deny or redirect.
```

### Letting the caller enforce from the HTTP API

Your backend or gateway calls the Sentrie HTTP endpoint and then enforces based on the response body.

```bash
curl -s -X POST "https://sentrie.host:7529/decision/com/example/auth/access/allow" \
  -H "Content-Type: application/json" \
  -d '{"facts": {"user": {"role": "admin", "status": "active"}}}'
```

The caller reads the response; if the decision is allow, it allows the request; otherwise it denies, redacts, or escalates.

### Typical enforcement roles

- **IAM / Auth:** Allow, deny, or trigger step-up based on the decision.
- **API gateway:** Allow, throttle, or block the route based on the decision.
- **Backend:** Serve full response, redact fields, or return 403 based on the decision.
- **Feature / entitlement:** Enable, disable, or cap usage based on the decision.

---

## Good to Know

Before you implement this, keep a few boundaries in mind:

- **Constraint:** Sentrie does not mutate state, call external APIs, or perform enforcement. It only evaluates and returns decisions. The system that calls Sentrie (CLI script, API gateway, backend) must interpret the decision and enforce. Same inputs and policy always produce the same decision; safe for critical paths and replay.
- **Edge case:** Sentrie does not enforce. Missing or incorrect enforcement is a caller bug. Timeouts, network errors, and auth to the Sentrie endpoint are the caller’s responsibility. For HTTP request/response schema and status codes, see [Running as a Service](/deployment-operations/running-as-service).
