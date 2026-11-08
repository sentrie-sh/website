---
title: "fmt Command"
description: "Format Sentrie source files in one canonical style."
---

# fmt Command

The `fmt` command rewrites `.sentrie` files in one canonical style. It keeps every comment, so it is safe to run over a pack you are working on, and it can check formatting in CI without changing anything.

## Syntax

```bash
sentrie fmt <pattern> [--check] [--diff]
```

The pattern is required and follows `go fmt`. Put the flags after it: `sentrie fmt ./... --check`.

## Patterns

| Pattern    | Files formatted                                                  |
| ---------- | ---------------------------------------------------------------- |
| `./...`    | Every `*.sentrie` file below the current directory               |
| `dir/...`  | Every `*.sentrie` file below `dir`                               |
| `...`      | The same as `./...`                                              |
| `.`        | The `*.sentrie` files directly in the current directory only     |
| `dir`      | The `*.sentrie` files directly in `dir`, not in subdirectories   |
| `file`     | That file, whatever its extension                                |

When a pattern recurses, hidden directories (names starting with `.`) and symlinks met during the walk are skipped. A symlinked root, such as `link/...`, is followed.

These are errors:

- No pattern at all.
- A second pattern.
- `file/...`, where `file` is not a directory.
- A bare `/...`, which has no directory before the ellipsis.

## Options

Flags go after the pattern. A flag placed before it takes the next word as its value, so `sentrie fmt --check ./...` fails instead of checking.

### `--check`

Writes nothing. Prints the path of each file that would change and exits with status 1 if there are any. Use it in CI.

### `--diff`

Writes nothing. Prints a unified diff for each file that would change. On its own it exits with status 0, like `gofmt -d`. Combine it with `--check` to also fail when a file would change.

## Examples

Take a policy that is formatted inconsistently and has comments in several places:

```text
namespace   com/example/auth
policy   user {
fact role:   string
--decide who gets in
rule allow = default false when   role=="admin"   {  -- admins only
yield   true
}
   -- keep this note


export decision of allow
}
```

### See what would change

```bash
sentrie fmt access.sentrie --diff
```

```diff
--- access.sentrie
+++ access.sentrie
@@ -1,12 +1,12 @@
-namespace   com/example/auth
-policy   user {
-fact role:   string
---decide who gets in
-rule allow = default false when   role=="admin"   {  -- admins only
-yield   true
-}
-   -- keep this note
+namespace com/example/auth
 
+policy user {
+  fact role: string
+  -- decide who gets in
+  rule allow = default false when role == "admin" { -- admins only
+    yield true
+  }
+  -- keep this note
 
-export decision of allow
+  export decision of allow
 }
```

### Check a pack in CI

Suppose the pack has the unformatted file above plus another one, `sub/ugly.sentrie`, in a subdirectory.

```bash
sentrie fmt ./... --check
```

```text
access.sentrie
sub/ugly.sentrie
Error: 2 file(s) are not formatted
```

The command exited with status 1. Without the recursive pattern only the files directly in the directory are covered:

```bash
sentrie fmt . --check
```

```text
access.sentrie
Error: 1 file(s) are not formatted
```

Once the files are formatted, `--check` prints nothing and exits with status 0.

### Format in place

```bash
sentrie fmt ./...
```

This rewrites `access.sentrie` as:

```text
namespace com/example/auth

policy user {
  fact role: string
  -- decide who gets in
  rule allow = default false when role == "admin" { -- admins only
    yield true
  }
  -- keep this note

  export decision of allow
}
```

Both comments, including the one after the opening brace, are still there.

### Mistakes

```bash
sentrie fmt
```

```text
Error: missing at least one required argument. need '1' - got '0'
```

```bash
sentrie fmt a b
```

```text
Error: fmt takes one pattern, got extra arguments: b
```

```bash
sentrie fmt access.sentrie/...
```

```text
Error: access.sentrie is not a directory, so "access.sentrie/..." is not a valid pattern
```

```bash
sentrie fmt /...
```

```text
Error: pattern "/..." has no directory before the ellipsis
```

A flag before the pattern is rejected:

```bash
sentrie fmt --check ./...
```

```text
Error: failed to set flag 'check': strconv.ParseBool: parsing "./...": invalid syntax
```

If the word after the flag happens to read as a boolean, such as a directory named `f` or `1`, `fmt` stops with a hint instead of guessing:

```bash
sentrie fmt --check f sub
```

```text
Error: --check takes no value (got "f"); put flags after the pattern, e.g. sentrie fmt ./... --check
```

All of these exit with status 1 and write nothing. The one exception is a literal `true` or `false` after a flag, which is read as the flag's value: `sentrie fmt --check false sub` formats `sub` in place.

## How files are written

Only files whose content changes are rewritten. A file that is already formatted is not touched, so its modification time stays the same.

`fmt` writes over the existing file rather than replacing it, the way `gofmt -w` does. The original bytes are kept in a temporary backup beside the file while the write happens, and the backup is removed afterwards. Because the file itself is kept, its mode, owner and links (symlinks and hard links) are preserved.

## Parse errors

A file that cannot be read, parsed or formatted is reported on standard error and makes the command exit with status 1. The other files are still processed, so one broken file does not stop the rest of a pack from being formatted or checked:

```text
parsing error at broken.sentrie:1:20-21: expected Ident, got LeftBrace at broken.sentrie:1:20-21
Error: 1 file(s) could not be formatted
```

A path that does not exist is reported the same way:

```text
stat nope: no such file or directory
Error: 1 file(s) could not be formatted
```

## Exit status

| Situation                                          | Exit status |
| -------------------------------------------------- | ----------- |
| Everything formatted, or already formatted         | 0           |
| `--diff` alone, with or without differences        | 0           |
| `--check` and at least one file would change       | 1           |
| `--diff --check` and at least one file would change | 1          |
| A file or path could not be read, parsed or formatted | 1        |
| Wrong usage (missing or extra pattern, bad flag)   | 1           |

## The canonical style

The style follows the examples used throughout this documentation:

- Two spaces per indentation level, no tabs, no trailing whitespace, and exactly one newline at the end of the file.
- One statement per line. Semicolons are dropped.
- At the top level, a blank line follows every statement that is not a comment. Elsewhere, blank lines between statements are kept, a run of blank lines collapses to one, and there is never a blank line just inside a brace.
- One space around binary operators, `=`, `=>`, `|>` and `as`; `name: Type` has a space after the colon only.
- Lists, maps and calls have no space inside their brackets and use `, ` between items.
- Parentheses are kept only where precedence needs them.
- Lists, calls, pipelines and similar constructs written on one line stay on one line; ones written across several lines get one item per line. Long lines are not wrapped.

Comments are never dropped. A comment on its own line stays on its own line, a trailing comment stays at the end of its line, and the text is printed as `-- text`.

Because the formatter prints from the parsed program, a few spellings that carry no meaning are normalised: redundant parentheses and semicolons are removed, a fact or `use` alias equal to the default name is dropped, and `not (x in y)` is printed as `x not in y`. Before a file is written, `fmt` parses its own output and checks that it describes the same program, so a formatting bug is reported as an error rather than changing what a policy does.

## See Also

- [CLI Reference](/cli-reference) - Complete CLI documentation
- [validate command](./validate) - Check a pack's structure and types
