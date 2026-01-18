---
title: "init"
description: "Initialize a new policy pack."
---

The `init` command initializes a new policy pack in the provided directory with the provided name. It creates a `sentrie.pack.toml` file with the correct structure and validates the pack name.

## Syntax

```bash
sentrie init {NAME} [OPTIONS]
```

## Arguments

### `NAME` (required)

The name of the policy pack. The name must be a valid identifier:

- Must start with a letter (a-z, A-Z)
- Can contain letters, numbers, underscores (`_`), hyphens (`-`), and dots (`.`)
- Dots can be used for hierarchical names (e.g., `com.example.pack`)
- Each segment after a dot must also start with a letter

**Valid examples:**

- `my-policy-pack`
- `my_policy_pack`
- `myPolicyPack`
- `com.example.pack`
- `org.mycompany.policies`

**Invalid examples:**

- `123pack` (starts with a number)
- `-mypack` (starts with a hyphen)
- `my..pack` (double dot)
- `my.123pack` (segment after dot starts with a number)

## Options

### `--directory`

Specifies the directory to initialize the policy pack in.

```bash
sentrie init my-policy-pack --directory ./my-policy-pack
```

:::warning[Important]
The directory **MUST be empty**. If the directory contains any files, the command will fail with an error.
:::

**Default**: `./` (current directory)

## What Gets Created

The command creates a `sentrie.pack.toml` file with the following structure:

```toml
[schema]
version = 1

[pack]
name = "my-policy-pack"
version = "0.0.1"
```

The pack file is validated against the Sentrie pack schema to ensure it's correctly formatted.

## Examples

Create a policy pack in the current directory:

```bash
sentrie init my-policy-pack
```

Create a policy pack in a new directory:

```bash
sentrie init my-policy-pack --directory ./my-policy-pack
```

Create a policy pack with a hierarchical name:

```bash
sentrie init com.example.iam --directory ./iam-pack
```

## Error Messages

If the pack name is invalid, you'll see an error:

```bash
$ sentrie init 123pack
Error: name needs to be a valid identity. It must start with a letter and can only contain letters, numbers, underscores and `dot`.
```

If the directory is not empty:

```bash
$ sentrie init my-pack
Error: directory is not empty - please choose a different directory
```
