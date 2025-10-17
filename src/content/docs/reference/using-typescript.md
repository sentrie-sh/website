---
title: Using TypeScript
description: Using Typescript in a policy pack.
---

Using Typescript in a policy pack.

- sentrie has a built in Typescript compiler and runtime that allows you to use Typescript in your policy packs.

## Syntax

```text
namespace com/example/auth

shape User {
  ...
  passwordHash: string
}
policy mypolicy {
  use { md5 } from "@sentrie/crypto"
  use { calculateAge } from "./utils.ts" as utils

  fact user!: User
  fact passwordInput!: string
  fact userAge!: number

  rule myrule = default false {
    yield
      crypto.md5(passwordInput) == user.passwordHash
      and
      userAge == utils.calculateAge(user.birthDate)
  }

  export decision of myrule
}
```

```bash
sentrie exec com/example/auth/mypolicy/myrule
  --facts '{"user": {"passwordHash": "..."}, "passwordInput": "...", "userAge": 20}'
```
