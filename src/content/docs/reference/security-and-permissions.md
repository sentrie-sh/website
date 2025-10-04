---
title: Permissions
description: Permissions are the security permissions and capabilities that can be used in a policy pack.
---

Permissions are the security permissions and capabilities that can be used in a policy pack.

## Purpose

Permissions are used to define the security permissions and capabilities that can be used in a policy pack. This includes access to the filesystem and network. Permissions are defined in the `sentrie.pack.toml` file in the `permissions` section.

By default, policies and it's modules have access to

- the filesystem rooted at the policy pack root
- no network access.
- no access to the environment variables.

## Syntax

```text
[permissions]
fs_read = ["/etc/passwd"]
net     = ["example.com"]
env     = ["ORG_DSN", "REDIS_PASSWORD"]
```

In the above example, the policy pack has

- read access to the `/etc/passwd` file
- network access to `http://example.com`
- access to the `ORG_DSN` and `REDIS_PASSWORD` environment variables.
