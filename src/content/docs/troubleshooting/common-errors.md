---
title: Common Errors
description: The most frequent Sentrie errors, why they happen, and how to fix them.
---

This page lists common errors you may encounter when authoring or running Sentrie policies, along with likely causes and suggested fixes.

## Language and pack errors

| Error / symptom | When it happens | How to fix | See also |
| :-------------- | :-------------- | :--------- | :------- |
| Parse error (unexpected token, invalid syntax) | While loading `*.sentrie` files (CLI or server startup) | Check for missing `namespace`, unmatched braces, or misplaced keywords; compare against the examples in the reference pages. | [Namespaces](/reference/namespaces), [Policies](/reference/policies), [Rules](/reference/rules) |
| Unknown namespace/policy/rule | `sentrie exec` / `sentrie validate` / HTTP `/decision/...` target does not match an exported rule | Verify the namespace, policy, and rule names in your files and commands; ensure the rule is exported with `export decision of ...`. | [CLI: exec](/cli-reference/exec), [Running as a Service](/deployment-operations/running-as-service), [Exporting & Importing Rules](/reference/exporting-and-importing-rules) |
| Pack file (`sentrie.pack.toml`) error | Pack cannot be loaded; invalid or missing schema/pack section | Ensure `[schema]` and `[pack]` sections exist, `schema.version = 1`, and `pack.name`/`pack.version` are valid. | [`sentrie.pack.toml`](/structure-of-a-policy-pack/packfile) |

## Facts, types, and constraints

| Error / symptom | When it happens | How to fix | See also |
| :-------------- | :-------------- | :--------- | :------- |
| Missing required fact / `ErrRequiredFact` | Evaluation runs without providing all required facts | Add the missing fact to `--facts`, `--fact-file`, or the HTTP request body; or make the fact optional (`fact name?`) if it is truly optional. | [Facts](/reference/facts), [CLI: exec](/cli-reference/exec) |
| Type mismatch for fact | Fact value does not match its declared type or shape | Check the JSON structure and field names; ensure it matches the shape and field modifiers (`!`, `?`) defined in the policy. | [Types and Values](/reference/types-and-values), [Shapes](/reference/shapes) |
| Constraint validation failed | A value violates a constraint like `@min(0)` or `@uuid()` | Adjust the input value or change the constraint to match what you actually allow; avoid casting into constrained types unless the value really satisfies them. | [Constraints](/reference/constraints) |

## Execution and HTTP service

| Error / symptom | When it happens | How to fix | See also |
| :-------------- | :-------------- | :--------- | :------- |
| HTTP 400 (Bad Request) | Malformed JSON, missing `facts` field, or invalid path | Validate the JSON body, ensure it has a top-level `"facts"` object, and double-check the `/decision/{namespace}/{policy}[/{rule}]` path. | [Running as a Service](/deployment-operations/running-as-service) |
| HTTP 404 (Not Found) | Namespace, policy, or rule path does not resolve | Confirm that the namespace/policy/rule exists and that the rule is exported; check for typos and casing differences. | [Running as a Service](/deployment-operations/running-as-service), [Exporting & Importing Rules](/reference/exporting-and-importing-rules) |
| HTTP 405 (Method Not Allowed) | Using GET/PUT/etc. against the decision endpoint | Use `POST` for `/decision/...` and `GET` for `/health`. | [Running as a Service](/deployment-operations/running-as-service) |
| HTTP 500 (Internal Server Error) | Runtime failure during evaluation (e.g. type or constraint error) | Inspect the error detail, then cross-check the relevant policy, facts, and constraints; run the same target via `sentrie exec` or `sentrie validate` for more context. | [CLI: exec](/cli-reference/exec), [CLI: validate](/cli-reference/validate) |

## Permissions and environment

If your pack uses TypeScript modules that read files, call the network, or access environment variables, you may see permission-related failures:

- Files or directories not readable when using local I/O helpers.
- Network calls failing despite valid URLs.
- Environment variables always appearing unset.

These are usually caused by restrictive pack permissions.

See **[Security and Permissions](/reference/security-and-permissions)** for how to configure `fs_read`, `net`, and `env` in `sentrie.pack.toml` and apply the principle of least privilege.

