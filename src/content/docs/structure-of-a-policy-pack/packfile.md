---
title: "sentrie.pack.toml"
description: "The pack file is the manifest and metadata configuration for the whole policy pack."
---

The `sentrie.pack.toml` file serves as the manifest and metadata configuration for the whole policy pack. This TOML file is essential for defining how your policy pack is loaded and used by Sentrie.

## Purpose

The PackFile acts as the central configuration hub that:

- Defines the root directory of your policy pack
- Specifies metadata about the pack
- Enables proper resolution of imports and references
- Provides versioning and distribution information
- Declares security permissions and capabilities

## File Location

**Key points:**

- Must be located at the root of your policy pack (refer to [Overview](/structure-of-a-policy-pack/overview/))
- Defines the base directory for all absolute paths
- Required for Sentrie to recognize the directory as a policy pack
- Only one PackFile per policy pack
- Sentrie will search up the directory tree to find the pack file if not found in the current directory

## Configuration Sections

The pack file uses TOML table syntax with the following sections:

### `[schema]` (required)

The schema section defines the version of the pack file format.

```toml
[schema]
version = 1
```

- `version`: An integer specifying the schema version (currently `1`)

### `[pack]` (required)

The pack section contains basic metadata about the policy pack.

```toml
[pack]
name = "my-policy-pack"
version = "0.1.0"
description = "Brief description of the pack's purpose"
license = "MIT"
repository = "https://github.com/my-org/my-policy-pack"
```

**Required fields:**

- `name` - The name of your policy pack (must be a valid identifier: start with a letter, can contain letters, numbers, underscores, hyphens, and dots)
- `version` - Semantic version (e.g., "1.0.0", "0.1.0-alpha.1")

**Optional fields:**

- `description` - Brief description of the pack's purpose
- `license` - The license of the pack
- `repository` - The repository URL of the pack

**Authors:**
Authors are specified as a nested table within the `[pack]` section:

```toml
[pack.authors]
"John Doe" = "john@example.com"
"Alice Robinson" = "alice@example.com"
```

### `[engine]` (optional)

The engine section specifies required runtime versions.

```toml
[engine]
sentrie = ">=0.1.0 <2.0.0"
```

- `sentrie` - Required Sentrie runtime version constraint (adheres to [Semantic Version Comparison Specification](https://semver.org/#spec-item-11))
  - Examples: `">=0.1.0"`, `"<2.0.0"`, `">=0.1.0 <2.0.0"`, `"~1.0.0"`

:::note
If the `[engine]` table is present, the `sentrie` field is required.
:::

### `[permissions]` (optional)

The permissions section declares security permissions and capabilities required by the pack. Refer to [Security and Permissions](/reference/security-and-permissions/) for detailed information.

```toml
[permissions]
fs_read = ["./data/**", "/etc/ssl/certs/**"]
net = ["https://api.example.com", "https://sts.amazonaws.com"]
env = ["AWS_REGION", "AWS_PROFILE"]
```

**Available permission types:**

- `fs_read` - Array of file system paths that can be read (supports glob patterns)
- `net` - Array of network URLs that can be accessed
- `env` - Array of environment variable names that can be accessed (must match pattern `^[A-Z_][A-Z0-9_]*$`)

### `[metadata]` (optional)

The metadata section allows arbitrary custom metadata for tooling purposes.

```toml
[metadata]
category = "cloud"
maturity = "beta"
custom_field = "custom_value"
```

- Can contain any arbitrary key-value pairs
- Not used by Sentrie runtime, but available for tooling and external systems

## Path Resolution

**How paths work:**

- All absolute paths are resolved relative to the pack file location
- `@local` prefix in `use` statements resolves to the pack file directory
- Enables consistent imports regardless of where files are located within the pack

## Examples

### Minimal Pack File

The minimal required pack file:

```toml
[schema]
version = 1

[pack]
name = "my-policy-pack"
version = "0.1.0"
```

### Complete Pack File

A pack file with all optional fields:

```toml
[schema]
version = 1

[pack]
name = "org-policies"
version = "1.2.3"
description = "Organization policies across all teams"
license = "MIT"
repository = "https://github.com/my-org/org-policies"

[pack.authors]
"John Doe" = "john@example.com"
"Alice Robinson" = "alice@example.com"
"Bob Smith" = "bob@example.com"

[engine]
sentrie = ">=0.1.0 <2.0.0"

[permissions]
fs_read = ["./data/**", "/etc/ssl/certs/**"]
net = ["https://api.example.com", "https://sts.amazonaws.com"]
env = ["AWS_REGION", "AWS_PROFILE"]

[metadata]
category = "enterprise"
maturity = "stable"
team = "platform"
```

## Validation Rules

The pack file is validated against the following rules:

1. **Required sections**: `[schema]` and `[pack]` must be present
2. **Schema version**: Must be `1` (integer)
3. **Pack name**: Must be a valid identifier (starts with letter, contains only letters, numbers, underscores, hyphens, and dots)
4. **Pack version**: Must be a valid semantic version string
5. **Engine table**: If present, must contain `sentrie` field
6. **Top-level tables**: Only `schema`, `pack`, `engine`, `permissions`, and `metadata` are allowed

## See Also

- [Overview](/structure-of-a-policy-pack/overview/) - Learn about policy pack structure
- [Security and Permissions](/reference/security-and-permissions/) - Detailed information about permissions
- [CLI Reference: init](/cli-reference/init) - Learn how to initialize a new pack
