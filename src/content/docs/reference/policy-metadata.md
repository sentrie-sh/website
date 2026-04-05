---
title: Policy metadata
description: Static metadata inside policy blocks—title, description, version, and tags—for humans and tooling; no effect on evaluation.
---

Policy metadata is **optional** information you attach inside a `policy { ... }` block. It is intended for documentation, registries, search, and UIs. Metadata values are **plain string literals only**—no expressions, interpolation, or computed values.

Metadata does **not** participate in evaluation and does not change rule outcomes.

## Syntax

All of the following appear **only** inside a policy body (not at namespace or file top level).

```sentrie
title "Short human-readable name"
description "Longer explanation; may be empty \"\""
version "1.2.3"
tag "key" = "value"
```

- **`title`**: one string; after trimming whitespace it must be non-empty.
- **`description`**: one string; may be empty after trim.
- **`version`**: one string that must be a valid **SemVer** (as accepted by Sentrie’s semver parser, including a leading `v` such as `"v1.2.3"` if supported). The **source literal** is preserved for display.
- **`tag`**: `tag "key" = "value"`; repeatable. The **key** must be non-empty after trim. The **value** may be empty or whitespace-only; duplicate keys are allowed (tags are multi-valued, order preserved).

`title`, `description`, `version`, and `tag` are **reserved keywords** in the lexer everywhere in a program, not only inside policies.

## Policy body ordering (required)

Ignoring comments, statements inside a policy must follow this **grouped** order:

1. **Metadata block** (optional): any of `title`, `description`, `version`, `tag*`, grouped together at the top.
2. **Facts block** (optional): `fact*` — all facts before any `use`.
3. **Uses block** (optional): `use*`.
4. **Body**: `rule`, `export` (rule export), `let`, `shape`, etc.

**Comments** may appear anywhere and do **not** break these groups. **Metadata** may be separated only by comments and still count as one contiguous metadata block.

**Facts before uses:** If a policy has both `fact` and `use` statements, every `fact` must appear before the first `use`. A policy may have **uses with no facts** (skip the facts block).

**Shapes** in a policy are **body** statements. Putting `shape` (or any body statement) before the header sections is invalid if you still need `fact` / `use` / metadata after it.

## Uniqueness

- At most one `title`, one `description`, and one `version` per policy.
- `tag` may repeat; the same key may appear multiple times.

## Index representation (tooling)

When a policy is indexed, tags are kept in **source order** as a list of pairs. Implementations may also expose a **map from key to values** (all values for that key, in order) for lookups. If a map is provided, **iteration order over the map is not a stability contract**—use the ordered list when you need deterministic output.

## Validation errors (indexing)

When indexing reports an error, messages include the source location. Typical cases:

| Situation | Message (core text) |
|-----------|---------------------|
| Metadata after facts or uses (but before body) | `title, description, version, and tag may only appear in one contiguous block at the top of the policy, before all fact and use statements.` |
| `fact` after a `use` | `fact statements must appear before any use statements.` |
| `fact`, `use`, or metadata after body has started | `'<keyword>' must appear before rules, exports, lets, and shapes.` |
| Duplicate `title` / `description` / `version` | `conflict: policy …` (with both locations) |
| Empty / whitespace-only `title` | `policy title must not be empty or whitespace-only.` |
| Empty / whitespace-only tag key | `tag key must not be empty or whitespace-only.` |
| Invalid `version` string | `Invalid policy version: expected SemVer string (e.g., "1.2.3").` |

Exact wording may evolve slightly; rely on the stable phrases above when writing tests or tooling.

## Conventional tag keys (optional)

The language does **not** restrict tag keys. For interoperability, common conventional keys include: `category`, `domain`, `framework`, `cloud`, `service`, `owner`, `severity`, `status` (e.g. draft/stable/deprecated). These are conventions only—not enforced by the parser.

## Non-goals

- No metadata at namespace or global scope in this feature.
- No effect on evaluation or rule semantics.

## See also

- [Policies](/reference/policies/) — overall policy structure and examples
- [Issue #61](https://github.com/sentrie-sh/sentrie/issues/61) — original design discussion
