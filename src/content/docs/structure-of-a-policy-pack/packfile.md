---
title: "sentrie.pack.toml"
description: "The pack file is the manifest and metadata configuration for the whole policy pack."
---

The `sentrie.pack.toml` file serves as the manifest and metadata configuration for the whole policy pack. This TOML file is essential for defining how your policy pack is loaded and used by Sentrie.

## Purpose

The PackFile acts as the central configuration hub that:

- Defines the root directory of your policy pack
- Specifies metadata
- Enables proper resolution of imports and references
- Provides versioning and distribution information

## File Location

**Key points:**

- Must be located at the root of your policy pack (refer to [Overview](/structure-of-a-policy-pack/overview/))
- Defines the base directory for all absolute paths
- Required for Sentrie to recognize the directory as a policy pack
- Only one PackFile per policy pack

## Configuration Sections

**System fields:** (required)

- `schema_version` - The version of the schema used to parse the pack file

**Basic metadata:** (required)

- `name` - The name of your policy pack
- `version` - Semantic versioning (e.g., "1.0.0")

**Other metadata:** (optional)

- `description` - Brief description of the pack's purpose
- `license` - The license of the pack
- `repository` - The repository of the pack
- `authors` - List of pack authors and contributors

**Dependencies:** (optional)

- `engine` - Required runtime versions
  - `sentrie` - Required Sentrie runtime version constraint (adheres to [Semantic Version Comparison Specification](https://semver.org/#spec-item-11))
- `permissions` - Security permissions and capabilities (refer to [Security and Permissions](/reference/security-and-permissions/))

**Advanced settings:** (optional)

- `metadata` - Additional arbitrary custom metadata

## Path Resolution

**How paths work:**

- All absolute paths are resolved relative to the pack file location
- `@local` prefix in `use` statements resolves to the pack file directory
- Enables consistent imports regardless of where files are located within the pack

## Example

### A minimal pack file

```toml
schema_version = "0.1.0"
name = "my-policy-pack"
```

### A pack file with all fields

```toml
schema_version = "0.1.0"
name           = "org-policies"
version        = "0.1.0"
description    = "Organization policies across all teams"
license        = "MIT"
repository     = "https://github.com/my-org/org-policies"

[engines]
sentrie = "0.1.0"

[authors]
"John Doe"       = "john@example.com"
"Alice Robinson" = "alice@example.com"
"Bob Smith"      = "bob@example.com"

[permissions]
fs_read = ["/etc/passwd"]
net     = ["http://example.com", "https://example.com"]

[metadata]
permissions = { fs_read = ["/etc/passwd"], net = ["http://example.com"] }
metadata    = { "example" = "example", "example2" = "example2" }
```

:::note
The `schema_version` and `name` fields are required and must be present in the pack file.
:::
