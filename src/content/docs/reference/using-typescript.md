---
title: Using TypeScript
description: Using TypeScript in a policy pack.
---

Sentrie has a built-in TypeScript compiler and runtime that allows you to use TypeScript in your policy packs. This enables you to write reusable utility functions, type definitions, and complex logic that can be shared across policies.

## Overview

TypeScript support in Sentrie allows you to:

- Import built-in libraries from `@sentrie/*` modules
- Create and import your own TypeScript modules from the policy pack
- Use TypeScript functions in your policies
- Leverage full TypeScript type checking and IntelliSense support

## Syntax

### Basic `use` Statement

The `use` statement allows you to import functions from TypeScript modules:

```text
use { function1, function2 } from @sentrie/module
```

**Note:** Built-in `@sentrie/*` modules do not use quotes. Local TypeScript files use quotes for relative paths.

### Importing Built-in Libraries

Built-in libraries are prefixed with `@sentrie/`:

```text
namespace com/example/auth

policy mypolicy {
  use { now } from @sentrie/time
  use { sha256 } from @sentrie/hash

  fact user!: User
  fact passwordInput!: string

  rule myrule = default false {
    let currentTime = time.now()
    let hash = sha256(passwordInput)
    yield hash == user.passwordHash
  }

  export decision of myrule
}
```

### Importing Local TypeScript Files

You can import TypeScript files from your policy pack using relative paths. These paths are automatically normalized to `@local` paths [as described below](#path-resolution):

```text
namespace com/example/auth

policy mypolicy {
  use { calculateAge } from "./utils.ts" as utils
  use { validateEmail } from "../helpers/validation.ts"

  fact user!: utils.User

  rule myrule = default false {
    yield utils.calculateAge(user.birthDate) >= 18
      and utils.validateEmail(user.email)
  }

  export decision of myrule
}
```

### Complete Example

Here's a complete example showing various usage patterns:

```text
namespace com/example/auth

shape User {
  passwordHash: string
  birthDate: string
  email: string
}

policy mypolicy {
  use { md5, sha256 } from @sentrie/hash
  use { now } from @sentrie/time
  use { calculateAge, validateEmail } from "./utils.ts"

  fact user!: User
  fact passwordInput!: string
  fact userAge!: number

  rule myrule = default false {
    yield
      sha256(passwordInput) == user.passwordHash
      and
      userAge == utils.calculateAge(user.birthDate)
      and
      utils.validateEmail(user.email)
  }

  export decision of myrule
}
```

## Path Resolution

### Relative Paths

Relative paths are resolved relative to the current file (`.sentrie` or `.ts`):

- `./file.ts` - Same directory as the policy file
- `../parent.ts` - Parent directory
- `./utils/helper.ts` - Subdirectory

#### Example

```typescript
import { now } from "./utils/time";

let currentTime = now();
```

```sentrie
namespace com/example/auth

policy mypolicy {
  use { now } from "./utils/time"
}
```

All relative paths are normalized to `@local` paths internally, ensuring consistent imports regardless of file location.

### `@local` Paths

The `@local` prefix indicates paths relative to the pack root. These paths are normalized from relative imports or can be used directly in policies and TypeScript files [as described above](#relative-paths):

- `@local/user/id` evaluates to `$PACKROOT/user/id.ts`
- `@local/utils/helper` evaluates to `$PACKROOT/utils/helper.ts`
- `@local/something` evaluates to `$PACKROOT/something.ts`

### Built-in Modules

Built-in modules use the `@sentrie/*` prefix:

- `@sentrie/time` - Time and date utilities
- `@sentrie/crypto` - Cryptographic functions
- `@sentrie/hash` - Hash functions
- `@sentrie/encoding` - Encoding/decoding utilities
- [And more...](/reference/typescript_modules/)

See the [Built-in TypeScript Modules](/reference/typescript_modules/) documentation for a complete list.

## Module Aliasing

When importing from a module, you can optionally specify an alias using the `as` keyword:

```text
use { now, parse } from @sentrie/time as time
use { md5 } from @sentrie/hash as crypto
```

If no alias is specified, the default alias is the last part of the module path. You can use an explicit alias to organize imports for both built-in and user-defined modules:

- `use { now } from @sentrie/time` → default alias is `time` → `time.now()`
- `use { now } from @sentrie/time as timeModule` → explicit alias → `timeModule.now()`
- `use { calculateAge } from "./utils.ts"` → default alias is `utils` → `utils.calculateAge()`
- `use { calculateAge } from "./utils.ts" as helpers` → explicit alias → `helpers.calculateAge()`

## Leverage your own TypeScript modules

You can create your own TypeScript modules in your policy pack. These modules:

1. **Must be in the pack directory** - TypeScript files must be within the policy pack root
2. **Can import other modules** - Including both built-in and local modules
3. **Use normalized paths** - Relative imports are automatically converted to `@local` paths

Example TypeScript file (`user.ts` in the pack root):

```typescript
import { something } from "@local/something";

export function User() {
  return {
    something: something(),
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    status: "active",
  };
}
```

> When this file is located at `$PACKROOT/user.ts`, the import `@local/something` evaluates to `$PACKROOT/something.ts`.
>
> The `import` can also be written as `import { something } from "./something.ts"`.

## Built-in Libraries

Sentrie provides a comprehensive set of built-in TypeScript libraries for common operations:

- **[JavaScript Globals](/reference/typescript_modules/sentrie/js)** - JavaScript globals (Math, String, Number, Date, JSON, Array)
- **[Collection](/reference/typescript_modules/sentrie/collection)** - List and map manipulation utilities
- **[Crypto](/reference/typescript_modules/sentrie/crypto)** - Cryptographic functions (SHA-256)
- **[Encoding](/reference/typescript_modules/sentrie/encoding)** - Base64, Hex, and URL encoding/decoding
- **[Hash](/reference/typescript_modules/sentrie/hash)** - MD5, SHA-1, SHA-256, SHA-512, and HMAC
- **[JSON](/reference/typescript_modules/sentrie/json)** - JSON validation utility
- **[JWT](/reference/typescript_modules/sentrie/jwt)** - JSON Web Token decoding and verification
- **[Net](/reference/typescript_modules/sentrie/net)** - Network and IP address utilities
- **[Regex](/reference/typescript_modules/sentrie/regex)** - Regular expression pattern matching
- **[Semver](/reference/typescript_modules/sentrie/semver)** - Semantic version comparison and validation
- **[Time](/reference/typescript_modules/sentrie/time)** - Date and time manipulation
- **[URL](/reference/typescript_modules/sentrie/url)** - URL parsing and manipulation
- **[UUID](/reference/typescript_modules/sentrie/uuid)** - UUID generation (v4, v6, v7)

See the [Built-in TypeScript Modules index](/reference/typescript_modules/) for detailed documentation on each library.

## Best Practices

1. **Use descriptive aliases** - When importing multiple items from the same module, use a clear alias
2. **Organize your modules** - Keep related TypeScript files in organized directories
3. **Leverage built-in libraries** - Use `@sentrie/*` modules for common operations instead of reimplementing
4. **Type safety** - Take advantage of TypeScript's type checking for better error detection
5. **Module reuse** - Create reusable utility modules that can be shared across multiple policies
