---
title: "init"
description: "Initialize a new policy pack."
---

The `init` command initializes a new policy pack in the provided directory with the provided name.

## Syntax

```bash
sentrie init {NAME} [OPTIONS]
```

## Options

### `--directory`

Specifies the directory to initialize the policy pack in.

```bash
sentrie init my-policy-pack --directory ./my-policy-pack
```

:::note
The directory MUST be empty.

**Default**: `./` (current directory)
:::

## Examples

Create a policy pack in the current directory:

```bash
sentrie init my-policy-pack
```

Create a policy pack in the `my-policy-pack` directory:

```bash
sentrie init my-policy-pack --directory ./my-policy-pack
```
