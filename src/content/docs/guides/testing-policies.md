---
title: Testing Policies
description: How to test Sentrie policies locally and in CI using the CLI.
---

Good tests make it safe to evolve policies. Sentrie’s CLI is designed to be scriptable, so you can run the same policy both during development and in CI.

## When to use which command

- **`sentrie exec`**: Execute rules and see decisions. Use for local development, debugging, and “golden” tests that assert specific outputs.
- **`sentrie validate`**: Load the pack and run its static checks without executing rules: syntax, undefined identifiers, self-referencing rules, cycles, shape and constraint errors. Use to catch these early, especially in CI.

See:

- [CLI: `sentrie exec`](/cli-reference/exec)
- [CLI: `sentrie validate`](/cli-reference/validate)

## Quick local testing with `sentrie exec`

Run a single exported rule with inline facts:

```bash
sentrie exec com/example/auth/access/allow \
  --facts '{"user":{"role":"admin","status":"active"}}'
```

Or evaluate all exported rules in a policy:

```bash
sentrie exec com/example/auth/access \
  --facts '{"user":{"role":"user","status":"active"}}'
```

Tips:

- Use `--output json` when you want to parse results in scripts.
- Use `--fact-file` to keep larger fact payloads in separate JSON files and override specific keys with `--facts`.

## Structuring tests with fact files

For repeatable tests, keep fact files alongside your pack:

```text
policy-pack/
  sentrie.pack.toml
  policies/
    auth.sentrie
  facts/
    admin.json
    user.json
```

Example:

```bash
sentrie exec com/example/auth/access/allow \
  --pack-location ./policy-pack \
  --fact-file ./policy-pack/facts/admin.json \
  --output json
```

Use a simple shell script or Makefile target to run a suite of such commands.

## Using `sentrie validate` in CI

Add a validation step to your CI pipeline to catch errors before deploy:

```bash
# Validate the whole pack from the repo root
sentrie validate --pack-location ./policy-pack
```

`validate` always checks the whole pack and takes no target and no facts. Earlier releases accepted a `namespace/policy` target and a `--facts` flag and ignored both; they are now errors, so remove them from existing CI jobs.

Among other things it fails the build on a rule that refers to itself (`rule r = r`) and on an identifier that names nothing in scope, such as a typo in a fact name. It does not check facts. To exercise a policy against representative facts, run `sentrie exec` with `--fact-file`, as above.

Recommended pattern:

1. Run `sentrie validate` on the pack.
2. Run a small set of `sentrie exec ... --output json` commands and assert on the JSON in your CI language of choice.

