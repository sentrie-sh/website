---
title: Capabilities
description: "Limit the builtins and modules a policy pack may use with an operator capabilities file passed to exec, serve, validate and bench."
---

A **capabilities file** is a JSON document, written by whoever runs Sentrie, that limits what a policy pack may use: which builtins it may call, which `@sentrie/*` modules it may load, and whether it may load its own TypeScript or JavaScript files. You pass it with `--capabilities <path>` to [`exec`](/cli-reference/exec), [`serve`](/cli-reference/serve), [`validate`](/cli-reference/validate) and [`bench`](/cli-reference/bench).

The two sides fit together like this:

- A pack's [`[permissions]`](/structure-of-a-policy-pack/packfile#permissions-optional) table in `sentrie.pack.toml` is what the pack **requests**.
- A capabilities file is what the operator **grants**.

Without `--capabilities`, everything is granted.

## Example

```json
{
  "version": 1,
  "builtins": ["all", "any", "count", "filter", "merge"],
  "modules": ["@sentrie/hash", "@sentrie/jwt", "@sentrie/net"],
  "local_modules": false,
  "deterministic_js": true
}
```

A pack run with this file may call five builtins and load three builtin modules. It may not load any TypeScript or JavaScript files of its own, and its JavaScript sees a pinned clock and a seeded random source.

```bash
sentrie serve --pack-location ./policy-pack --capabilities ./capabilities.json
```

## Fields

| Field | Type | When absent | Meaning |
| :---- | :--- | :---------- | :------ |
| `version` | integer | error | File format version. Must be `1`. |
| `builtins` | list of strings | every builtin is granted | Builtins the pack may call, by name (`"count"`, `"now"`). `[]` grants none. |
| `modules` | list of strings | every builtin module is granted | Builtin modules the pack may load, by full specifier (`"@sentrie/hash"`). `[]` grants none. |
| `local_modules` | boolean | `true` | Whether the pack may load its own TypeScript or JavaScript files (`"./path"` and `@local/...`). |
| `deterministic_js` | boolean | `false` | Whether `Date` and `Math.random` in JavaScript are replaced by deterministic versions (see [Deterministic JavaScript](#deterministic-javascript)). |

`null` counts as absent. Names are not checked against the builtins and modules your Sentrie version ships, so a file written for a newer version still loads, and a name this version does not know grants nothing.

### Invalid files

The command refuses to start when the file is invalid: empty, not a JSON object, missing `version` or using any version other than `1`, with an unknown key (keys are case-sensitive, so `"Builtins"` is unknown), a key given twice, data after the object, an empty builtin name, or a module without the `@sentrie/` prefix. For example:

```text
Error: caps.json: capabilities: missing "version"
Error: caps.json: capabilities: 1:14: unknown field "Builtins"
Error: caps.json: capabilities: modules: "hash" must be a full specifier such as "@sentrie/hash"
```

## What is checked

After the pack is loaded and validated, and before anything is evaluated or served, every use in the pack is checked against the grant:

- **Builtins:** every builtin call, in rules, `let`s, fact defaults, export attachments and derives. A name that a `let`, a lambda parameter or a derive shadows is not a builtin call.
- **Builtin modules:** every `use ... from @sentrie/<name>`.
- **Local modules:** every `use ... from "./path"` and `use ... from @local/...` when `local_modules` is `false`.
- **Imports inside TypeScript:** each `import` in the pack's own TypeScript is checked against `modules` and `local_modules`, following the pack's own imports. A `serve` with a denied import therefore refuses to start instead of failing the first request that reaches it.

Each denial names the source location, and the command exits with status `1`:

```text
Error: policy.sentrie:16:11-16: builtin "count": not granted by the capabilities file
Error: policy.sentrie:4:3-41: module "@sentrie/time": not granted by the capabilities file
Error: policy.sentrie:4:3-48: local module "./clock.ts": not granted by the capabilities file
```

The same grant is enforced again while evaluating, so a module loaded in a way the load-time check cannot see, such as a computed `require(...)`, is refused with the same `not granted by the capabilities file` error.

## Nondeterministic sources

`sentrie validate` prints a warning for every nondeterministic source a pack uses, with or without a capabilities file. These are the `now` and `now_ms` builtins, `@sentrie/time.now`, `@sentrie/uuid.v4`, `v6` and `v7`, and `@sentrie/js.random`:

```text
warning: policy.sentrie:6:30-35: builtin "now" is nondeterministic: its result can differ between executions
```

To forbid them, leave them out of `builtins` and `modules`, and set `local_modules` to `false`, because a pack's own TypeScript can call `Date.now()` and `Math.random()` directly.

## Deterministic JavaScript

With `"deterministic_js": true`, every JavaScript runtime gets these replacements before any module code runs:

- `Date.now()`, `new Date()` and `Date()` return the start time of the current evaluation, in milliseconds. Other forms, such as `new Date(0)`, `Date.parse` and `Date.UTC`, behave as usual.
- `Math.random()` draws from a pseudo-random sequence seeded from the evaluation's start time and the function being called.

Each module call can then be reproduced from its evaluation's start time. Only `Date` and `Math.random` are covered: `@sentrie/uuid` still returns fresh values, so leave it out of `modules` to forbid it.

## See Also

- [Security and Permissions](/reference/security-and-permissions) - What a pack requests in `[permissions]`
- [validate Command](/cli-reference/validate) - Check a pack against a capabilities file without running it
- [bench Command](/cli-reference/bench) - Measure a pack under a capabilities file
