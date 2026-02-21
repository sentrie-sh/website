---
title: Writing Custom TypeScript Modules
description: "How to add and use your own TypeScript modules in a policy pack: paths, exports, and use statement."
---


You can add TypeScript files to your policy pack and import them in policies with the `use` statement. Paths are relative to the policy file or use `@local` (pack root). Built-in modules are `@sentrie/*`; local files use quoted relative paths.

## Syntax

```text
use { fn1, fn2 } from "./path/to/file.ts" [ as alias ]
use { fn1 } from "@local/path/to/module" [ as alias ]
```

Built-in: `use { fn1 } from @sentrie/module` (no quotes). Local: quoted path or `@local/...`; resolved relative to current file or pack root.

## Concepts

| Element | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fn1`, `fn2` | identifiers | Yes | Exported function (or type) names from the module. |
| `"./file.ts"` or `@local/...` | path | Yes | Relative to `.sentrie` file or pack root. |
| `as alias` | identifier | No | Default alias: last segment of path (e.g. `utils` for `./utils.ts`). |

**Returns:** N/A (import). Call as `alias.fn1(args)` in the policy.

## Examples

### Basic Usage

```text
use { calculateAge, validateEmail } from "./utils.ts" as utils
rule myrule = default false {
  yield utils.calculateAge(user.birthDate) >= 18 and utils.validateEmail(user.email)
}
```

### Advanced Usage

```text
use { calculateAge, validateEmail } from "../helpers/validation.ts"
fact user!: utils.User
yield utils.calculateAge(user.birthDate) >= 18
```

Path resolution: `./file.ts` = same directory as policy; `../parent.ts` = parent; `./utils/helper.ts` = subdirectory. All normalized to `@local` internally. `@local/user/id` → `$PACKROOT/user/id.ts`.

## Behavior & Constraints

- TypeScript files must live inside the policy pack root. They can import other local modules and built-in `@sentrie/*` modules.
- Exported functions and types are available to policies. Relative imports in `.ts` files are resolved relative to that file and normalized to `@local`.
- Default alias is the last path segment (e.g. `utils` for `./utils.ts`). Use `as alias` to override.

## Constraints & Edge Cases

- Module must export the requested names. Invalid path or missing export causes load error. Use [Built-in TypeScript Modules](/reference/typescript_modules/) for common operations; add custom modules for pack-specific logic.
