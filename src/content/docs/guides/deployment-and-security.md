---
title: Deployment and Security
description: Running Sentrie safely in production: HTTP service, network exposure, and pack permissions.
---

Sentrie is a deterministic policy engine that evaluates rules and returns decisions. In production you typically run it as a separate service and call it over HTTP or from automation. This guide covers security-focused aspects of that setup.

## Serving Sentrie in production

Use `sentrie serve` to start the HTTP API:

```bash
sentrie serve --pack-location /etc/sentrie/policies --listen 0.0.0.0 --port 8080
```

Key points:

- Sentrie serves plain HTTP; terminate TLS in a reverse proxy (e.g. nginx, Envoy) or API gateway.
- Add authentication and authorization at the proxy/gateway layer before requests reach Sentrie.
- Restrict which networks can reach the Sentrie service (firewalls, security groups, service mesh).

See:

- [CLI: `sentrie serve`](/cli-reference/serve)
- [Running as a Service](/deployment-operations/running-as-service)

## Pack permissions (`fs_read`, `net`, `env`)

Policy packs declare what they are allowed to reach at runtime in `sentrie.pack.toml`:

```toml
[permissions]
fs_read = ["./data/**"]
net     = ["https://api.example.com"]
env     = ["APP_ENV", "API_KEY"]
```

Recommendations:

- **Principle of least privilege**: Only grant the filesystem paths, hosts, and environment variables a pack truly needs.
- **Review permissions for each release**: Treat permission changes like code changes and review them in PRs.
- **Keep secrets in env, not facts**: Let Sentrie read secrets from permitted environment variables instead of embedding them in facts.

See: [Security and Permissions](/reference/security-and-permissions)

## Hardening the HTTP surface

Combine Sentrie with your existing platform primitives:

- **TLS and mTLS**: Terminate HTTPS at a reverse proxy; optionally enforce mTLS between callers and the proxy.
- **AuthN/AuthZ for callers**: Require auth tokens for access to the Sentrie endpoint and restrict which services can call which decisions.
- **Rate limiting and quotas**: Apply rate limits and timeouts at the proxy; treat Sentrie like any other critical backend.
- **Observability**: Export logs and metrics (through your wrapper or sidecar) so you can monitor error rates and latency.

Because evaluation is deterministic and side-effect free, you can safely replay requests in non-production environments for debugging and audits.

