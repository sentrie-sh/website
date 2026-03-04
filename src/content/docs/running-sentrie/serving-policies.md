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

This page is a conceptual overview. For the complete HTTP API reference—including flags, endpoints, request/response schema, and error formats—see:

- [CLI Reference: `sentrie serve`](/cli-reference/serve)
- [Deployment & Operations: Running as a Service](/deployment-operations/running-as-service)
