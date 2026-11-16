---
title: Pack Data
description: "Static reference data that ships with a pack: the [data] table, data declarations, typing, and errors."
---

[Facts](/reference/facts) arrive with each request. **Pack data** is the other kind of input: static reference data that ships with the pack, such as a role table or an allowlist. A pack lists its data files in the `[data]` table of [`sentrie.pack.toml`](/structure-of-a-policy-pack/packfile/#data-optional). Each file is read once, when the pack is loaded.

```toml
[data]
roles = "data/roles.json"
allowlist = "data/allowlist.json"
```

```json
{
  "admin": ["read", "write", "delete"],
  "editor": ["read", "write"],
  "viewer": ["read"]
}
```

## Declaring Pack Data

A policy reads an entry with a `data` declaration in the same block as its facts:

```text
data <name> (':' <type>)? ('as' <exposed_name>)?
```

```sentrie
namespace com/example/access

shape RoleTable dict[list[string]]

policy permissions {
  fact role: string
  fact action: string

  data roles: RoleTable
  data allowlist as allowed_ips

  rule granted = action in roles[role]
  rule listed = "10.0.0.1" in allowed_ips

  export decision of granted
  export decision of listed
}
```

With `role` set to `"admin"` and `action` set to `"delete"`, `granted` is `true`. With `role` set to `"viewer"` it is `false`. The rule `listed` is `true`.

:::note[Note]
- `<name>` must be an entry in the pack's `[data]` table
- The optional type is checked against the loaded value. Without one, the value is used as it was read
- `as` renames the value inside the policy, the same as it does for a fact. Without `as`, the entry name is used
- A `data` declaration shares the policy's name space. It cannot reuse the name of a fact, a `let`, a rule or a `use` alias in the same policy; use `as` to pick another name
- A `data` declaration can sit anywhere in the policy header, among the `fact` or `use` statements, but before the policy body. Only `fact` must come before every `use`
- `data` is only special at the start of a policy statement. It still works as an ordinary name elsewhere, for example `fact data: dict[any]` or `data.n`
:::

## Typed Pack Data

A typed declaration is checked once, when the executor is built. `sentrie validate`, `sentrie exec` and `sentrie serve` all fail before any request is evaluated, so a mismatch never surfaces in the middle of a decision.

```sentrie
namespace com/example/access

policy permissions {
  data roles: list[string]

  rule ok = true
  export decision of ok
}
```

Here `roles` is a JSON object, so the pack is rejected:

```text
Error: pack data "roles" in policy com/example/access/permissions does not match its declared type: value map[admin:[read write delete] editor:[read write] viewer:[read]] is not an array at access.sentrie:4:3-27 - expected array
```

## Pack Data is Read-Only

Policies cannot change pack data. The value is shared by every evaluation, and a TypeScript module that receives it gets a copy, so a module cannot change what the policy sees.

## Pack Data in Derives

A `data` alias cannot be used inside the body of a [derive](/reference/derives/). Pass the value in as an argument instead:

```sentrie
namespace com/example/access

policy permissions {
  fact role: string
  fact action: string
  data roles

  let table = roles

  derive allows = (t: dict[any], r: string, a: string) => {
    yield a in t[r]
  }

  rule granted = allows(table, role, action)
  export decision of granted
}
```

With `role` set to `"editor"` and `action` set to `"write"`, `granted` is `true`. With `role` set to `"viewer"` and the same action, it is `false`.

Reading `roles` directly inside the derive is rejected:

```sentrie
namespace com/example/access

policy permissions {
  fact role: string
  data roles

  let admin = "admin"

  derive can = (r: string) => {
    yield r in roles[admin]
  }

  rule granted = can(role)
  export decision of granted
}
```

```text
Error: validation error: derive com/example/access/permissions/can: pack data is not available inside a derive ("roles"); pass it as an argument
```

## Pack Data Errors

These are rejected before any request is evaluated:

```text
Error: validation error: data "teams" at access.sentrie:4:3-13: no such entry in the pack's [data] table: index error
Error: validation error: data "allowlist" at access.sentrie:10:3-32: the pack declares no [data] table: index error
```

The first means the policy names an entry that `[data]` does not list. The second means the pack has no `[data]` table at all. Declaring a `data` name that a fact, `let`, rule or `use` alias already holds is a `conflict` error. A `data` declaration that comes after a rule, `let` or `export` is rejected with `'data' must appear before rules, exports, lets, and shapes`.
