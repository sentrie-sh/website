---
title: "Sentrie CLI"
description: "Command-line reference: sub-commands, global options, and exit codes."
---

The Sentrie CLI runs policy evaluations, initializes packs, serves the HTTP API, and validates policy packs. All commands support the global options below.

## Sub-Commands

| Command | Description |
| :--- | :--- |
| [sentrie exec](/cli-reference/exec) | Execute a policy or rule with facts. |
| [sentrie init](/cli-reference/init) | Create a new policy pack in the current directory. |
| [sentrie serve](/cli-reference/serve) | Start the HTTP server for policy evaluation. |
| [sentrie validate](/cli-reference/validate) | Validate pack structure, syntax, and types. |

## Global Options

All commands support these options:

| Option | Description | Default |
| :--- | :--- | :--- |
| `--help`, `-h` | Show help for the command. | — |
| `--version`, `-v` | Show Sentrie version. | — |
| `--debug` | Enable debug logging. | `false` |
| `--log-level` | Log level: DEBUG, INFO, WARN, ERROR. | `INFO` |

## Exit Codes

| Value | Description |
| :--- | :--- |
| `0` | Success. |
| Non-zero | Failure (e.g. parse error, missing fact, invalid target, port in use). |

For `exec` and `validate`, exit 0 when evaluation or validation succeeds; non-zero on error. For `serve`, the process runs until SIGINT/SIGTERM; non-zero on startup failure (e.g. port in use, pack load error).

## HTTP API

When the server is running (`sentrie serve`), it exposes a REST API for policy evaluation. For request/response format, error codes, and deployment details, see [Running as a Service](/deployment-operations/running-as-service).
