Use AGENTS.md in the `sentrie-sh/sentrie` repository for guidance and guidance only.

Generate separate per-repo PR description files. 

Scope commits to the local repository. Prefer small(ish), focused commits here too: one logical change per commit when practical; combine only when inseparable (same fix, feature slice, or mechanical rename). For full commit rules (including message style), follow **Code commits** and **Commit messages** in that `AGENTS.md`.

Rules for this repository live under `.agentrules/` and apply to every agent, human or AI. Read the ones relevant to your work before starting:

- [License headers and copyright year](.agentrules/license-headers.md) - new licensed files get the two-line SPDX header with the current year; existing headers are left unchanged on ordinary edits. Relevant keywords: license header, SPDX, SPDX-FileCopyrightText, SPDX-License-Identifier, Apache-2.0, copyright year, legacy header.
- [Plan source paths](.agentrules/plan-source-paths.md) - plan files link source with repo-root-relative paths, never machine-local absolute ones. Relevant keywords: plan, plan file, .cursor/plans, markdown links, relative path, absolute path, multi-root workspace.
