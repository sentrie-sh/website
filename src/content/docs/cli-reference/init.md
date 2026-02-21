---
title: "sentrie init"
description: "Create a new policy pack with sentrie.pack.toml in the current or given directory."
---

`init` creates a policy pack by writing a `sentrie.pack.toml` with the given pack name. Use it to bootstrap a new pack or ensure correct pack structure.

## Syntax

```bash
sentrie init <NAME> [ --directory <PATH> ]
```

- **NAME:** Pack name (required). Must be a valid identifier: start with a letter; letters, numbers, underscores, hyphens, dots allowed; segments after a dot must start with a letter.
- **--directory:** Directory to create the pack in. Must be empty. Default: current directory.

## Options

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| NAME | string | Yes | Pack name. Valid: e.g. `my-policy-pack`, `com.example.pack`. Invalid: leading digit, leading hyphen, double dot, segment after dot starting with digit. |
| `--directory` | path | No | Directory for the pack. Must be empty. Default: `./`. |

**Returns:** Exit 0 on success. Creates `sentrie.pack.toml` with `[schema] version = 1`, `[pack] name = "<NAME>"`, `version = "0.0.1"`. No other files are created.

## Examples

### Basic Usage

Create a pack in the current directory (must be empty):

```bash
sentrie init my-policy-pack
```

Create a pack in a new directory:

```bash
sentrie init my-policy-pack --directory ./my-policy-pack
```

### Advanced Usage

Hierarchical pack name:

```bash
sentrie init com.example.iam --directory ./iam-pack
```

## Behavior & Constraints

- **Directory:** Must exist and be empty. If the directory contains any files, the command fails.
- **Pack name:** Validated against identifier rules; invalid name produces an error and no file is written.
- **File created:** Only `sentrie.pack.toml` is written; structure matches the Sentrie pack schema.

## Constraints & Edge Cases

- Invalid name (e.g. `123pack`, `-mypack`, `my..pack`, `my.123pack`) → error; no pack file created.
- Non-empty directory → error (e.g. "directory is not empty - please choose a different directory").
- `--directory` must point to an existing directory; creation of the directory is not performed by `init`.
