---
title: "Structure of a Policy Pack"
description: "Learn about the structure of a Sentrie policy pack."
---

A Sentrie policy pack is a collection of namespaces, policies, shapes, typescript modules and other declarations that work together to define business rules and data validation.

**Key benefits:**

- Modular organization of business rules and data validation
- Easy sharing and versioning
- Maintainable complex business rules and data validation

## Structure

A policy pack does not have a prescribed filesystem structure. It can be organized as needed. The only requirement is that the `sentrie.pack.toml` file **MUST** be located at the root of the policy pack.

```
├── sentrie.pack.toml
├── *.sentrie
├── *.ts
├── some_directory
    ├── *.sentrie
    ├── *.ts
├── some_other_directory
    ├── *.sentrie
    ├── *.ts
```

### PackFile

The PackFile (`sentrie.pack.toml`) file serves as the manifest and metadata configuration for the whole policy pack. The location of this file defines the root of the pack.

**What it contains:**

- Pack name and version
- Dependencies and configuration settings (engines, authors, permissions, metadata)
- Metadata for the entire pack

**Key features:**

- Defines the root of the policy pack
- All absolute paths are resolved relative to this file's location
- `@local` prefix in `use` statements resolves to this file's location (refer to [`use` statements](/reference/use-statements/))

### ProgramFile

A ProgramFile (`*.sentrie`) file contains the core policy definitions written in the Sentrie policy language.

**File organization:**

- Can be located anywhere in the policy pack
- Provides flexibility in organizing business rules
- No required directory structure

### `*.ts`

TypeScript files (`*.ts`) provide Typescript module functionality within policy packs. Policies can refer to and execute functions defined in these modules using the `use` statement (refer to [`use` statements](/reference/use-statements/)).

**What they can contain:**

- Helper functions
- External integrations
- Complex data processing

**Integration features:**

- Available to Sentrie policies on demand
- Located anywhere in the policy pack
- Compiled to JavaScript using a built-in opinionated TypeScript compiler
- Leverage full TypeScript power while keeping policies declarative

For more information, see the [TypeScript Integration](/reference/using-typescript/) reference. For a list of built-in modules, see the [TypeScript Integration](/reference/typescript-integration/) reference.

## Organization

**Flexible filesystem organization:**

- No prescribed directory structure - complete freedom to organize files as needed
- Hierarchy resolved by `namespace` declarations, not filesystem structure
- Adapt to your project's needs and team preferences
