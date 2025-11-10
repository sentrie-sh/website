---
title: Installation
description: Learn how to install Sentrie
---

Sentrie is a single binary executable. It has no external dependencies.

On macOS, both M1 (arm64) and Intel (x64) executables are provided. On Windows and Linux, both x64 and arm64 executables are provided.

Convenience scripts are provided for macOS, Linux, and Windows.

## Installing the latest version

### On macOS, Linux and WSL2

```bash
curl -fsSL https://sentrie.sh/install.sh | bash
```

### On Windows

```bash
irm https://sentrie.sh/install.ps1 | iex
```

### Verify Installation

```bash
sentrie --version
```

This should display the current version of Sentrie.

## Installing a specific version

### On macOS, Linux and WSL2

```bash
curl -fsSL https://sentrie.sh/install.sh | bash -s v0.1.0
```

### On Windows

```bash
$v="0.1.0"; irm https://sentrie.sh/install.ps1 | iex
```

### Verify Installation

```bash
sentrie --version
```
