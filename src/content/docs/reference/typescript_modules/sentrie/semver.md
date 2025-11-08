---
title: "@sentrie/semver"
description: Semantic version comparison and validation
---

The `@sentrie/semver` module provides semantic version comparison and validation utilities. Supports the "v" prefix (e.g., `"v1.2.3"` is equivalent to `"1.2.3"`).

## Usage

```text
use { compare, isValid, satisfies, major, minor, patch } from "@sentrie/semver" as semver
```

## Functions

### `compare(a: string, b: string): number`

Compares two semantic version strings. Supports the "v" prefix - `"v1.2.3"` and `"1.2.3"` are treated as equivalent.

**Parameters:**

- `a` - The first version string (e.g., `"1.2.3"` or `"v1.2.3"`)
- `b` - The second version string (e.g., `"1.2.4"` or `"v1.2.4"`)

**Returns:** `-1` if `a < b`, `1` if `a > b`, `0` if `a == b`

**Throws:** Error if either version string is invalid

**Example:**

```text
use { compare } from "@sentrie/semver" as semver

let result = semver.compare("1.2.3", "1.2.4")  // -1
let result2 = semver.compare("v1.2.3", "1.2.3")  // 0
```

### `isValid(a: string): boolean`

Validates whether a string is a valid semantic version. Supports the "v" prefix - `"v1.2.3"` is considered valid.

**Parameters:**

- `a` - The version string to validate (e.g., `"1.2.3"`, `"v1.2.3"`, `"1.0.0-alpha"`)

**Returns:** `true` if the string is a valid semantic version, `false` otherwise

**Example:**

```text
use { isValid } from "@sentrie/semver" as semver

let valid = semver.isValid("1.2.3")  // true
let valid2 = semver.isValid("v1.2.3")  // true
let invalid = semver.isValid("1.2")  // false
```

### `stripPrefix(a: string): string`

Strips the "v" or "V" prefix from a version string if present.

**Parameters:**

- `a` - The version string (e.g., `"v1.2.3"` or `"V1.2.3"`)

**Returns:** The version string without the prefix (e.g., `"1.2.3"`)

**Example:**

```text
use { stripPrefix } from "@sentrie/semver" as semver

let stripped = semver.stripPrefix("v1.2.3")  // "1.2.3"
let noChange = semver.stripPrefix("1.2.3")  // "1.2.3"
```

### `satisfies(version: string, constraint: string): boolean`

Checks if a version satisfies a constraint. Supports constraint ranges like `">=1.0.0 <2.0.0"`, `"^1.2.0"`, `"~1.2.0"`, etc.

**Parameters:**

- `version` - The version string to check (e.g., `"1.2.3"` or `"v1.2.3"`)
- `constraint` - The constraint string (e.g., `">=1.0.0 <2.0.0"`, `"^1.2.0"`)

**Returns:** `true` if the version satisfies the constraint, `false` otherwise

**Throws:** Error if either version or constraint string is invalid

**Example:**

```text
use { satisfies } from "@sentrie/semver" as semver

let satisfies1 = semver.satisfies("1.2.3", ">=1.0.0 <2.0.0")  // true
let satisfies2 = semver.satisfies("2.0.0", "^1.2.0")  // false
```

### `major(version: string): number`

Gets the major version number from a version string.

**Parameters:**

- `version` - The version string (e.g., `"1.2.3"` or `"v1.2.3"`)

**Returns:** The major version number (e.g., `1` for `"1.2.3"`)

**Throws:** Error if the version string is invalid

**Example:**

```text
use { major } from "@sentrie/semver" as semver

let maj = semver.major("1.2.3")  // 1
let maj2 = semver.major("2.0.0-alpha")  // 2
```

### `minor(version: string): number`

Gets the minor version number from a version string.

**Parameters:**

- `version` - The version string (e.g., `"1.2.3"` or `"v1.2.3"`)

**Returns:** The minor version number (e.g., `2` for `"1.2.3"`)

**Throws:** Error if the version string is invalid

**Example:**

```text
use { minor } from "@sentrie/semver" as semver

let min = semver.minor("1.2.3")  // 2
let min2 = semver.minor("1.0.0")  // 0
```

### `patch(version: string): number`

Gets the patch version number from a version string.

**Parameters:**

- `version` - The version string (e.g., `"1.2.3"` or `"v1.2.3"`)

**Returns:** The patch version number (e.g., `3` for `"1.2.3"`)

**Throws:** Error if the version string is invalid

**Example:**

```text
use { patch } from "@sentrie/semver" as semver

let pat = semver.patch("1.2.3")  // 3
let pat2 = semver.patch("1.2.0")  // 0
```

### `prerelease(version: string): string | null`

Gets the prerelease identifier from a version string.

**Parameters:**

- `version` - The version string (e.g., `"1.2.3-alpha.1"` or `"1.0.0-beta"`)

**Returns:** The prerelease identifier (e.g., `"alpha.1"`) or `null` if not present

**Throws:** Error if the version string is invalid

**Example:**

```text
use { prerelease } from "@sentrie/semver" as semver

let pre = semver.prerelease("1.2.3-alpha.1")  // "alpha.1"
let noPre = semver.prerelease("1.2.3")  // null
```

### `metadata(version: string): string | null`

Gets the build metadata from a version string.

**Parameters:**

- `version` - The version string (e.g., `"1.2.3+001"` or `"1.0.0+exp.sha.5114f85"`)

**Returns:** The build metadata (e.g., `"001"`) or `null` if not present

**Throws:** Error if the version string is invalid

**Example:**

```text
use { metadata } from "@sentrie/semver" as semver

let meta = semver.metadata("1.2.3+001")  // "001"
let noMeta = semver.metadata("1.2.3")  // null
```

## Complete Example

```text
namespace com/example/version

policy mypolicy {
  use { compare, satisfies, major, minor, patch } from "@sentrie/semver" as semver

  fact currentVersion!: string
  fact requiredVersion!: string
  fact versionConstraint!: string

  rule checkVersion = default false {
    let comparison = semver.compare(currentVersion, requiredVersion)
    let satisfiesConstraint = semver.satisfies(currentVersion, versionConstraint)
    let majorVersion = semver.major(currentVersion)
    yield comparison >= 0 and satisfiesConstraint and majorVersion >= 1
  }

  export decision of checkVersion
}
```

## Constraint Syntax

The `satisfies` function supports various constraint formats:

- **Range:** `">=1.0.0 <2.0.0"` - Version must be >= 1.0.0 and < 2.0.0
- **Caret:** `"^1.2.0"` - Compatible with version 1.2.0 (>= 1.2.0 < 2.0.0)
- **Tilde:** `"~1.2.0"` - Approximately equivalent to 1.2.0 (>= 1.2.0 < 1.3.0)
- **Exact:** `"1.2.3"` - Exactly version 1.2.3
- **Greater/Less:** `">=1.0.0"`, `"<2.0.0"` - Single-sided constraints

## Version Format

Semantic versions follow the format: `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`

- **MAJOR** - Incremented for incompatible API changes
- **MINOR** - Incremented for backwards-compatible functionality additions
- **PATCH** - Incremented for backwards-compatible bug fixes
- **PRERELEASE** - Optional prerelease identifier (e.g., `alpha`, `beta`, `rc.1`)
- **BUILD** - Optional build metadata (e.g., `+001`, `+exp.sha.5114f85`)
