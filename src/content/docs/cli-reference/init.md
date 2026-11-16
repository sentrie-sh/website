---
title: "sentrie init"
description: "Create a new policy pack with sentrie.pack.toml in the current or given directory."
---

When you are starting a new policy pack and want a valid `sentrie.pack.toml` without editing one by hand, you use `sentrie init`. It creates the pack file with the name you give and the right schema so the rest of the tooling can load the pack.

Here is the basic syntax:

```bash
sentrie init <NAME> [ --directory <PATH> ]
```

**NAME** is required (e.g. `my-policy-pack`, `com.example.pack`). **--directory** is optional; the directory must be empty. Default is the current directory.

## Configuration & Arguments

You can customize where the pack is created using the following options:

| Argument | Type | Required | What it does |
| :------- | :--- | :------- | :----------- |
| NAME | string | Yes | Pack name. Must start with a letter; letters, numbers, underscores, hyphens, dots allowed; each segment after a dot must start with a letter. Invalid: leading digit, leading hyphen, double dot. |
| `--directory` | path | No | Directory for the pack. Must be empty. Default: `./`. |

**Returns:** Exit 0 on success. Creates `sentrie.pack.toml` with `[schema] version = 1`, `[pack] name = "<NAME>"`, `version = "0.0.1"`. No other files are created.

---

## Examples in Action

### Creating a pack in the current directory

You are in an empty folder and want to turn it into a pack with a given name.

```bash
sentrie init my-policy-pack
```

### Creating a pack in a new directory

You want the pack to live in a new subdirectory (e.g. to keep policies separate from app code).

```bash
sentrie init my-policy-pack --directory ./my-policy-pack
```

### Using a hierarchical pack name

You are naming the pack with a dotted identifier (e.g. for org or product).

```bash
sentrie init com.example.iam --directory ./iam-pack
```

---

## Good to Know

Before you run this, keep a few boundaries in mind:

- **Constraint:** The directory must exist and be empty. If it contains any files, the command fails. Only `sentrie.pack.toml` is written; structure matches the Sentrie pack schema. Pack name is validated; invalid name produces an error and no file is written.
- **Edge case:** Invalid name (e.g. `123pack`, `-mypack`, `my..pack`, `my.123pack`) → error; no pack file created. Non-empty directory → error (e.g. "directory is not empty - please choose a different directory"). `--directory` must point to an existing directory; `init` does not create the directory.
