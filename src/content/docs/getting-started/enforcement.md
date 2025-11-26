---
title: Enforcement
description: Enforcing policies using Sentrie
---

## Enforcement is external

Sentrie is a **deterministic policy decision engine**. It evaluates structured inputs against rules and returns `true`, `false`, or `unknown`. That's it.

The engine is **pure** and **side-effect-free**—no mutations, no API calls, no state changes. This makes it safe to embed deep in your stack: IAM systems, API gateways, control planes, multi-tenant services, anywhere you need fast, reliable authorization decisions.

Because enforcement lives outside the policy, the same rules work across different systems with different enforcement modes - whether you're blocking requests, redacting data, or triggering step-up auth.

:::note[Sentrie makes decisions]
Sentrie focuses on **decision quality** — your systems handle enforcement.
:::

## Why Enforcement is External

Different platforms enforce differently:

- **IAM layers** allow, deny, or escalate auth flows
- **API gateways** throttle, rate-limit, or block routes
- **Multi-tenant systems** control features and per-org limits
- **Security layers** trigger reviews or step-up verification
- **Backend services** serve, redact, or transform data

Keeping the engine pure gives you three guarantees:

- **Determinism** — same input = same output, always
- **Reproducibility** — decisions are safe to replay and audit
- **Portability** — runs identically everywhere

This is what makes Sentrie safe for **real-time**, **latency-sensitive** paths.

## How It Works

Call Sentrie's HTTP endpoint with context. Get a decision. **Enforce it**.

```bash
curl -X POST https://sentrie.host:7529/decision/namespace/policy/rule \
  -H "Content-Type: application/json" \
  -d '{
    "facts": {
      "user": "...",
      "org": "...",
      "roles": ["..."],
      "plan": "pro"
    }
  }'
```

What happens next is up to you:

- Backends accept, reject, or redact responses
- IAM systems allow, deny, or trigger step-up auth
- Gateways block, throttle, or downgrade routes
- Feature gates enable, disable, or shadow-test features
- Entitlement systems enforce quotas or usage limits
- Data layers redact fields before returning them

:::note[Philosophy]
Sentrie supplies truth. Systems apply consequences.
:::

## Why This Works

Separating decision from action makes Sentrie:

- Safe for critical paths
- Consistent across systems
- Easy to test and replay
- Independently scalable
- Flexible for different enforcement modes
