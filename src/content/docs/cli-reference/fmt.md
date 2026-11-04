---
title: "fmt Command"
description: "Format Sentrie source files in one canonical style."
---

# fmt Command

The `fmt` command rewrites `.sentrie` files in one canonical style. It keeps every comment, so it is safe to run over a pack you are working on, and it can check formatting in CI without changing anything.

## Syntax

```bash
sentrie fmt [paths...] [--check] [--diff]
```

## Arguments

### `paths` (optional)

Any number of files and directories. With no paths, `fmt` works on the current directory.

- **A directory** is searched recursively for `*.sentrie` files. Hidden directories (names starting with `.`) and symlinks met during the walk are skipped.
- **A file named directly** is formatted whatever its extension. A symlink named directly, to a file or to a directory, is followed.

A file reached through more than one name is formatted once.

## Options

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
sentrie fmt --diff access.sentrie
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

```bash
sentrie fmt --check .
```

```text
access.sentrie
```

The command printed the one file that would change and exited with status 1. Once the files are formatted, `--check` prints nothing and exits with status 0.

### Format in place

```bash
sentrie fmt
```

With no paths, this walks the current directory and rewrites `access.sentrie` as:

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
