---
title: Example Policy Pack
description: A complete, step-by-step guide to building an Identity and Access Management policy pack
---

This guide walks you through creating a complete policy pack for **Identity and Access Management (IAM)**. By the end, you'll have a working pack that handles authentication (verifying user identity) and authorization (controlling access based on IP addresses and geographic location).

## What We're Building

Our policy pack will:

1. **Authenticate users** by verifying JWT tokens
2. **Authorize requests** by checking:
   - If the IP address is blocked
   - If the IP address has good reputation
   - If the request comes from an allowed geographic location

## Project Structure

We'll create a policy pack with the following files:

```
my-iam-pack/
├── sentrie.pack.toml    # Pack configuration file
├── shapes.sentrie       # Data structure definitions
├── authn.sentrie        # Authentication policy
├── authz.sentrie        # Authorization policy
└── ip_utils.ts          # TypeScript helper functions
```

## Step 1: Create the Pack Configuration

The easiest way to start a new policy pack is using the `sentrie init` command. This command creates the pack configuration file (`sentrie.pack.toml`) with the correct structure.

### Pack Name Requirements

Before initializing, choose a valid pack name. Pack names must:

- Start with a letter (a-z, A-Z)
- Contain only letters, numbers, underscores (`_`), hyphens (`-`), and dots (`.`)
- Use dots for hierarchical names (e.g., `com.example.pack`)
- Each segment after a dot must also start with a letter

**Valid names:**

- `iam-example` ✓
- `my_iam_pack` ✓
- `com.example.iam` ✓

**Invalid names:**

- `123pack` ✗ (starts with number)
- `-mypack` ✗ (starts with hyphen)
- `my.123pack` ✗ (segment after dot starts with number)

### Option 1: Initialize in the Current Directory

If you want to create the pack in your current directory (make sure it's empty):

```bash
sentrie init iam-example
```

This creates a `sentrie.pack.toml` file in the current directory with:

- Pack name: `iam-example`
- Schema version: `0.1.0`
- Version: `0.1.0`

The pack file is automatically validated to ensure it's correctly formatted.

### Option 2: Initialize in a New Directory

If you want to create a new directory for your pack:

```bash
# Create the directory first
mkdir my-iam-pack
cd my-iam-pack

# Initialize the pack
sentrie init iam-example
```

Or in one step:

```bash
sentrie init iam-example --directory ./my-iam-pack
```

:::warning[Important]
The directory you initialize **must be empty**. If the directory contains any files, the command will fail with an error.

If you provide an invalid pack name, you'll see an error message explaining the requirements.
:::

### What Gets Created

After running `sentrie init`, you'll have a `sentrie.pack.toml` file that looks like this:

```toml
[schema]
version = 1

[pack]
name = "iam-example"
version = "0.0.1"
```

The file uses TOML table syntax with:

- `[schema]` table containing the schema version of the pack file (currently `1`)
- `[pack]` table containing pack information (`name` and `version`)

### Customizing the Pack File

You can manually edit `sentrie.pack.toml` to add more information:

```toml
[schema]
version = 1

[pack]
name = "iam-example"
version = "0.0.1"
description = "Example Identity and Access Management policy pack"
license = "MIT"
repository = "https://github.com/yourusername/iam-example"

[pack.authors]
"Your Name" = "your.email@example.com"
```

For now, the basic configuration is enough. We'll add the policy files in the next steps.

## Step 2: Define Data Structures (Shapes)

Create `shapes.sentrie` to define the data structures we'll work with:

```sentrie
// shapes.sentrie
namespace com/example/auth

-- This shape represents an incoming HTTP request
shape Request {
  method: string        -- HTTP method (GET, POST, etc.)
  path: string          -- Request path (e.g., "/api/users")
  ip: string            -- Client IP address
  headers: map[string]  -- HTTP headers as key-value pairs
}

-- This shape represents a user
shape User {
  sub: string           -- Subject (user ID)
  email: string         -- User's email address
  roles: list[string]   -- List of user roles (e.g., ["admin", "user"])
  tenant: string        -- Organization/tenant identifier
}

-- This shape represents JWT token claims
shape Claims {
  issued_at: int        -- When the token was issued (Unix timestamp)
  expires_at: int       -- When the token expires (Unix timestamp)
  token_id: string      -- Unique token identifier
}
```

**What this does:**

- Defines three shapes that describe the structure of data we'll receive
- `Request` represents incoming HTTP requests
- `User` represents user information
- `Claims` represents data extracted from JWT tokens

## Step 3: Create Authentication Policy

Create `authn.sentrie` to handle user authentication:

```sentrie
// authn.sentrie
namespace com/example/auth

policy authn {
  -- This fact will be provided when the policy is evaluated
  -- It contains the incoming HTTP request
  fact request: Request

  -- Import JWT functions from the built-in @sentrie/jwt module
  use { verify, decode, getPayload } from @sentrie/jwt as jwt

  -- Rule 1: Verify the JWT token signature
  -- This checks if the token is valid and hasn't been tampered with
  rule verify_token = default false when request.headers["Authorization"] is defined {
    -- Extract the token from the Authorization header
    let token = request.headers["Authorization"]
    -- Verify the token's signature
    yield jwt.verify(token)
  }

  -- Rule 2: Decode the JWT token
  -- This extracts the token's payload (claims) without verifying
  rule decode_token = default false when request.headers["Authorization"] is defined {
    let token = request.headers["Authorization"]
    -- Decode the token to get its contents
    yield jwt.decode(token) != null
  }

  -- Rule 3: Determine if the user is authenticated
  -- A user is authenticated only if both verification and decoding succeed
  rule authenticated = default false when verify_token is true and decode_token is true {
    yield true
  }

  -- Export the authentication decision
  -- Also attach the token claims so other policies can use them
  export decision of authenticated
    attach claims as jwt.getPayload(request.headers["Authorization"])
}
```

**How it works:**

1. The policy receives a `Request` fact containing the HTTP request
2. `verify_token` checks if the JWT token is valid (not tampered with)
3. `decode_token` extracts the token's contents
4. `authenticated` returns `true` only if both previous rules succeed
5. The decision is exported with the token claims attached

## Step 4: Create IP Utility Functions

Create `ip_utils.ts` with TypeScript helper functions for IP address checks:

```typescript
// ip_utils.ts
// Helper functions for IP address validation and geographic checks

// Table mapping IP ranges to country codes
const COUNTRY_TABLE = [
  ["10.0.0.0/24", "IN"], // India
  ["10.0.1.0/24", "SG"], // Singapore
  ["192.168.1.0/24", "US"], // United States
];

// List of IP ranges that should be blocked
const BAD_IP_RANGES = [
  "100.100.0.0/16", // Disposable hosting services
  "45.12.0.0/16", // Known VPN block
];

// Get the country code for an IP address
export function countryForIp(ip: string): string {
  for (const [range, country] of COUNTRY_TABLE) {
    if (inRange(ip, range)) {
      return country;
    }
  }
  return "UNKNOWN";
}

// Calculate a reputation score for an IP address (0-100)
// Higher scores mean more trustworthy
export function ipReputation(ip: string): number {
  // Check if IP is in any bad ranges
  for (const range of BAD_IP_RANGES) {
    if (inRange(ip, range)) {
      return 10; // Very low trust score
    }
  }
  return 80; // Default good score
}

// Check if an IP address is in a CIDR range
function inRange(ip: string, range: string): boolean {
  // Simple implementation: check if IP starts with the range prefix
  // In production, you'd use a proper CIDR matching library
  const rangePrefix = range.split("/")[0].split(".")[0];
  const ipPrefix = ip.split(".")[0];
  return ipPrefix === rangePrefix;
}

// Check if an IP address is in the blocked list
export function isBlockedIP(ip: string): boolean {
  for (const range of BAD_IP_RANGES) {
    if (inRange(ip, range)) {
      return true;
    }
  }
  return false;
}

// Check if a country code is in the allowed list
export function isAllowedGeo(country: string): boolean {
  return COUNTRY_TABLE.some(([_, countryCode]) => countryCode === country);
}
```

**What this does:**

- Provides helper functions for IP address validation
- Maps IP ranges to countries
- Calculates reputation scores for IP addresses
- Checks if IPs are blocked or from allowed countries

## Step 5: Create Authorization Policy

Create `authz.sentrie` to handle request authorization:

```sentrie
// authz.sentrie
namespace com/example/auth

policy authz {
  -- The incoming HTTP request
  fact request: Request

  -- Import our custom TypeScript functions
  -- The @local prefix means these functions are in our pack
  use { countryForIp, ipReputation, isBlockedIP, isAllowedGeo } from @local/ip_utils

  -- Rule 1: Check if the IP is not blocked
  -- Returns true if the IP is NOT in the blocked list
  rule ip_restriction = default false when request.ip is defined {
    -- Use the NOT operator to invert: we want IPs that are NOT blocked
    yield not isBlockedIP(request.ip)
  }

  -- Rule 2: Check if the IP has good reputation
  -- Returns true if reputation score is greater than 50 (50%)
  rule ip_reputation = default false when request.ip is defined {
    let reputation = ipReputation(request.ip)
    yield reputation > 50  -- Require at least 50% reputation
  }

  -- Rule 3: Check if the request comes from an allowed country
  rule geo_allowed = default false when request.ip is defined {
    let country = countryForIp(request.ip)
    yield isAllowedGeo(country)
  }

  -- Rule 4: Final authorization decision
  -- Access is allowed only if ALL three checks pass
  rule allow_access = default false {
    yield ip_restriction and ip_reputation and geo_allowed
  }

  -- Export the authorization decision
  -- Also attach individual check results for debugging
  export decision of allow_access
    attach ip_restriction as ip_restriction
    attach ip_reputation as ip_reputation
    attach geo_allowed as geo_allowed
}
```

**How it works:**

1. `ip_restriction` ensures the IP isn't in the blocked list
2. `ip_reputation` checks if the IP has a good reputation score (>50)
3. `geo_allowed` verifies the request comes from an allowed country
4. `allow_access` requires all three checks to pass
5. Individual check results are attached for debugging

## Step 6: Understanding the Complete Flow

Here's how everything works together:

1. **Request comes in** → Contains IP address and Authorization header
2. **Authentication (authn policy)**:
   - Extracts JWT token from Authorization header
   - Verifies token signature
   - Decodes token to get user claims
   - Returns `authenticated = true` if token is valid
3. **Authorization (authz policy)**:
   - Checks if IP is not blocked
   - Checks IP reputation score
   - Checks if IP is from allowed country
   - Returns `allow_access = true` if all checks pass

## Testing Your Pack

To test your pack, you'll need to provide facts when evaluating policies. Here's an example request:

```json
{
  "facts": {
    "request": {
      "method": "GET",
      "path": "/api/users",
      "ip": "10.0.0.5",
      "headers": {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

## Key Concepts Explained

### Facts

Facts are input data provided when evaluating a policy. In our example:

- `request: Request` is a fact that must be provided
- It contains the HTTP request information

### Rules

Rules make decisions based on facts:

- Each rule has a name (e.g., `verify_token`)
- Rules can have a `default` value (used when `when` condition is false)
- Rules can have a `when` condition (only evaluated if condition is true)
- Rules must `yield` a value (the decision result)

### Exports

Exported rules can be called from other policies or via the API:

- `export decision of authenticated` makes the `authenticated` rule available to other policies or via the API
- Attachments provide additional data along with the decision, which can be accessed when the rule is imported by other policies or executed via the HTTP API

### TypeScript Integration

Custom TypeScript functions extend Sentrie's capabilities:

- Use `@local/` prefix to import from your pack
- Use `"relative/path/to/file.ts"` to import relative to the directory of the policy file
- Use `@sentrie/` prefix for built-in modules
- Functions are compiled and executed securely

## Next Steps

Now that you understand the structure:

1. **Customize the IP ranges** in `ip_utils.ts` for your needs
2. **Add more rules** to the authorization policy
3. **Create additional policies** for different use cases
4. **Test your pack** using the Sentrie CLI or HTTP API

For more information, see:

- [Policy Language Reference](/reference) - Complete syntax guide
- [Using TypeScript](/reference/using-typescript) - TypeScript integration details
- [Built-in Modules](/reference/typescript_modules) - Available built-in functions
