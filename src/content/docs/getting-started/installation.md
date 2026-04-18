---
title: Installation
description: Learn how to install Sentrie
---

When you need to run Sentrie locally or on a server, you install a single binary. There are no external dependencies—just the executable. Convenience scripts are provided for macOS, Linux, and Windows so you can install or pin a version with one command.

Here is the basic syntax:

**macOS / Linux / WSL2:**

```bash
curl -fsSL https://sentrie.sh/install.sh | bash
```

**Windows:**

```bash
irm https://sentrie.sh/install.ps1 | iex
```

**Verify:**

```bash
sentrie --version
```

## Configuration & Arguments

You can install the latest or a specific version depending on your platform:

| Platform | Command (latest) | Command (specific version) |
| :------- | :--------------- | :-------------------------- |
| macOS, Linux, WSL2 | `curl -fsSL https://sentrie.sh/install.sh \| bash` | `curl -fsSL https://sentrie.sh/install.sh \| bash -s v0.1.0` |
| Windows | `irm https://sentrie.sh/install.ps1 \| iex` | `$v="0.1.0"; irm https://sentrie.sh/install.ps1 \| iex` |

**Returns:** N/A. The script installs the binary; `sentrie --version` confirms the install.

---

## Examples in Action

### Installing the latest version on macOS or Linux

You want the current release and are on macOS, Linux, or WSL2.

```bash
curl -fsSL https://sentrie.sh/install.sh | bash
```

### Installing the latest version on Windows

You are on Windows and want to use the PowerShell installer.

```bash
irm https://sentrie.sh/install.ps1 | iex
```

### Pinning a specific version

You need a fixed version (e.g. for CI or reproducibility).

**Unix:**

```bash
curl -fsSL https://sentrie.sh/install.sh | bash -s v0.1.0
```

**Windows:**

```bash
$v="0.1.0"; irm https://sentrie.sh/install.ps1 | iex
```

### Verifying the installation

You want to confirm the binary is on your PATH and see the version.

```bash
sentrie --version
```

---

## Good to Know

Before you rely on this in automation, keep a few boundaries in mind:

- **Constraint:** Sentrie is a single binary; no extra runtime. Supported: macOS (arm64, x64), Linux (x64, arm64), Windows (x64, arm64).
- **Edge case:** Scripts install to a standard location and update PATH as appropriate for the platform. For custom installs or air-gapped environments, you can download the binary directly from the release artifacts.
