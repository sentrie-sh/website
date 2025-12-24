---
title: Example Pack (WIP)
description: An example pack for a policy pack
---

```sentrie
// shapes.sentrie
namespace com/example/auth

shape Request {
  method: string
  path: string
  ip: string
  headers: map<string, string>
}

shape User {
  sub: string
  email: string
  roles: list<string>
  tenant: string
}

shape Claims {
  issued_at: int
  expires_at: int
  token_id: string
}
```

```sentrie
// authn.sentrie

namespace com/example/auth

policy authn {
  fact request:Request

  use { verify, decode, getPayload } from @sentrie/jwt

  rule verify_token = default false when request.header["Authorization"] is defined {
    let token = request.header["Authorization"]
    yield jwt.verify(token)
  }

  rule decode_token = default false when request.header["Authorization"] is defined {
    let token = request.header["Authorization"]
    yield jwt.decode(token)
  }

  rule authenticated = default false when verify_token is true and decode_token is true {
    yield true
  }

  export decision of authenticated attach jwt.getPayload(request.header["Authorization"]) as claims
}
```

```sentrie
// authz.sentrie
namespace com/example/auth

policy authz {
  fact request:Request

  use { countryForIp, ipReputation, isBlockedIP, isAllowedGeo } from @local/ip_utils

  rule ip_restriction = default false when request.ip is not null {
    yield isBlockedIP(request.ip)
  }

  rule ip_reputation = default false when request.ip is not null {
    yield ipReputation(request.ip) > 0.5
  }

  rule geo_allowed = default false when request.ip is not null {
    yield isAllowedGeo(countryForIp(request.ip))
  }

  rule allow_access = {
    yield ip_restriction and ip_reputation and geo_allowed
  }

  export decision of allow_access
    attach ip_restriction as ip_restriction_decision
    attach ip_reputation as ip_reputation_decision
    attach geo_allowed as geo_allowed_decision
}
```

```typescript
// ip_utils.ts
// Tiny embedded tables for country lookup and low-effort IP scoring.
// Pure deterministic helpers suitable for hot-path execution.

const COUNTRY_TABLE = [
  // [range, country]
  ["10.0.0.0/24", "IN"],
  ["10.0.1.0/24", "SG"],
];

const BAD_IP_RANGES = [
  "100.100.0.0/16", // disposable hosting
  "45.12.0.0/16", // known VPN block
];

export function countryForIp(ip: string): string {
  // minimal embedded matcher
  for (const [range, country] of COUNTRY_TABLE) {
    if (inRange(ip, range)) return country;
  }
  return "UNKNOWN";
}

export function ipReputation(ip: string): number {
  for (const range of BAD_IP_RANGES) {
    if (inRange(ip, range)) return 10; // very low trust
  }
  return 80; // base good score
}

// deterministic CIDR match (placeholder)
function inRange(ip: string, range: string): boolean {
  // simple stub that the user can expand
  return ip.startsWith(range.split(".")[0]);
}

export function isBlockedIP(ip: string): boolean {
  for (const range of BAD_IP_RANGES) {
    if (inRange(ip, range)) return true;
  }
  return false;
}

export function isAllowedGeo(geo: string): boolean {
  return COUNTRY_TABLE.some(([_, country]) => country === geo);
}
```

A fully qualified example policy pack.

Topic: RBAC Identity and Access Management Pack

- Four files:
  - authn.sentrie
  - authz.sentrie
  - ip_utils.ts (used as `use { countryForIp, ipReputation } from @local/ip_utils`)
  - sentrie.pack.toml
- use @sentrie/jwt to verify and decode the JWT token
- Typescript functions:
  - countryForIp(ip: string): string
    - Uses a static, tiny embedded IP range map.
  - ipReputation(ip: string): number
    - A dumb but effective baseline:
      - 0 to 100 trust score based on:
        - known VPN ranges (local list)
        - bot signatures
        - disposable ranges

```
shape Request {
  method: string
  path: string
  ip: string
  headers: map<string, string>
}

shape User {
  sub: string
  email: string
  roles: list<string>
  tenant: string
}
shape Claims {
  issued_at: int
  expires_at: int
  token_id: string
}
```

- Authn policy - JWT

  - policy: `authn`
    - rule: `verify_token`
      - default: `false`
      - when: `token is not null`
      - body: `jwt.verify(token)`
    - rule: `decode_token`
      - default: `false`
      - when: `token is not null`
      - body: `jwt.decode(token)`
      - export: `decision of decode_token`
        - attach: `claims as Claims`
    - rule: `authenticated`
      - default: `false`
      - body: `verify_token is true and decode_token is true`
      - export: `decision of authenticated`
        - attach: `claims as Claims`

- Authz policy
  - Policy: `authz`
    - rule: `ip_restriction`
      - default: `false`
      - when: `ip is not null`
      - body: `ip not in the list of blocked IPs`
      - export: `decision of ip_restriction`
        - attach: `ip as string`
    - rule: `ip_reputation`
      - default: `false`
      - when: `ip is not null`
      - body: `use ip_reputation_module to get the reputation of the ip - check if it is greater than 0.5`
      - export: `decision of ip_reputation`
        - attach: `ip as string`
    - rule: `geo_allowed`
      - default: `false`
      - when: `ip is not null`
      - body: `use geo_module to get the geo of the ip - check if it is in the list of allowed geos`
      - export: `decision of geo_allowed`
        - attach: `ip as string`
        - attach: `geo as string`
    - rule: `allow_access`
      - default: `false`
      - body: `ip_restriction is true and ip_reputation is true and geo_allowed is true`
      - export: `decision of allow_access`
        - attach: `true`
        - attach: `ip_restriction as string`
        - attach: `ip_reputation as string`
        - attach: `geo_allowed as string`
