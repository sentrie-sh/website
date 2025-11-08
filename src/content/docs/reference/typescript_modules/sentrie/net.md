---
title: "@sentrie/net"
description: Network and IP address utilities
---

The `@sentrie/net` module provides network and IP address utilities for network-based policies. Supports both IPv4 and IPv6 addresses and CIDR notation.

## Usage

```text
use { cidrContains, parseIP, isIPv4, isPrivate } from "@sentrie/net" as net
```

## CIDR Functions

### `cidrContains(cidr: string, cidrOrIp: string): boolean`

Checks if a CIDR block or IP address is contained within another CIDR block. Supports both IPv4 and IPv6.

**Parameters:**

- `cidr` - The CIDR block to check against (e.g., `"192.168.1.0/24"`)
- `cidrOrIp` - Either a CIDR block or IP address to check (e.g., `"192.168.1.5"` or `"192.168.1.0/28"`)

**Returns:** `true` if `cidrOrIp` is contained within `cidr`, `false` otherwise

**Throws:** Error if either argument is not a valid CIDR or IP address

**Example:**

```text
use { cidrContains } from "@sentrie/net" as net

let contains = net.cidrContains("192.168.1.0/24", "192.168.1.5")  // true
let contains2 = net.cidrContains("10.0.0.0/8", "192.168.1.5")  // false
```

### `cidrIntersects(cidr1: string, cidr2: string): boolean`

Checks if two CIDR blocks intersect or overlap. Supports both IPv4 and IPv6.

**Parameters:**

- `cidr1` - First CIDR block (e.g., `"192.168.1.0/24"`)
- `cidr2` - Second CIDR block (e.g., `"192.168.1.0/28"`)

**Returns:** `true` if the CIDR blocks intersect, `false` otherwise

**Throws:** Error if either argument is not a valid CIDR block

**Example:**

```text
use { cidrIntersects } from "@sentrie/net" as net

let intersects = net.cidrIntersects("192.168.1.0/24", "192.168.1.0/28")  // true
```

### `cidrIsValid(cidr: string): boolean`

Validates whether a string is a valid CIDR notation.

**Parameters:**

- `cidr` - The CIDR string to validate (e.g., `"192.168.1.0/24"`)

**Returns:** `true` if the CIDR notation is valid, `false` otherwise

**Example:**

```text
use { cidrIsValid } from "@sentrie/net" as net

let isValid = net.cidrIsValid("192.168.1.0/24")  // true
let invalid = net.cidrIsValid("192.168.1.0")  // false
```

### `cidrExpand(cidr: string): string[]`

Expands a CIDR block to a list of all host IP addresses within that block.

**Parameters:**

- `cidr` - The CIDR block to expand (e.g., `"192.168.1.0/28"`)

**Returns:** Array of all IP addresses in the CIDR block

**Throws:** Error if the CIDR notation is invalid

**Example:**

```text
use { cidrExpand } from "@sentrie/net" as net

let ips = net.cidrExpand("192.168.1.0/30")  // ["192.168.1.1", "192.168.1.2"]
```

### `cidrMerge(addrs: string[] | any[]): string[]`

Merges a list of IP addresses and subnets into the smallest possible list of CIDR blocks.

**Parameters:**

- `addrs` - Array of IP addresses and/or CIDR blocks (e.g., `["192.168.1.1", "192.168.1.2", "10.0.0.0/24"]`)

**Returns:** Array of merged CIDR blocks

**Throws:** Error if any address is invalid

**Example:**

```text
use { cidrMerge } from "@sentrie/net" as net

let merged = net.cidrMerge(["192.168.1.1", "192.168.1.2", "192.168.1.3"])
```

## IP Address Functions

### `parseIP(ipStr: string): string | null`

Parses an IP address string (IPv4 or IPv6).

**Parameters:**

- `ipStr` - The IP address string to parse

**Returns:** The normalized IP address string, or `null` if invalid

**Example:**

```text
use { parseIP } from "@sentrie/net" as net

let ip = net.parseIP("192.168.1.1")  // "192.168.1.1"
let invalid = net.parseIP("invalid")  // null
```

### `isIPv4(ip: string): boolean`

Checks if an IP address is IPv4.

**Parameters:**

- `ip` - The IP address to check

**Returns:** `true` if the IP is IPv4, `false` otherwise

**Example:**

```text
use { isIPv4 } from "@sentrie/net" as net

let isV4 = net.isIPv4("192.168.1.1")  // true
let isV4_2 = net.isIPv4("::1")  // false
```

### `isIPv6(ip: string): boolean`

Checks if an IP address is IPv6.

**Parameters:**

- `ip` - The IP address to check

**Returns:** `true` if the IP is IPv6, `false` otherwise

**Example:**

```text
use { isIPv6 } from "@sentrie/net" as net

let isV6 = net.isIPv6("::1")  // true
let isV6_2 = net.isIPv6("192.168.1.1")  // false
```

### `isPrivate(ip: string): boolean`

Checks if an IP address is in a private address range. Private ranges include: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, and IPv6 equivalents.

**Parameters:**

- `ip` - The IP address to check

**Returns:** `true` if the IP is private, `false` otherwise

**Example:**

```text
use { isPrivate } from "@sentrie/net" as net

let isPriv = net.isPrivate("192.168.1.1")  // true
let isPriv2 = net.isPrivate("8.8.8.8")  // false
```

### `isPublic(ip: string): boolean`

Checks if an IP address is a public (globally routable) address. Public addresses are globally routable unicast addresses that are not private or loopback.

**Parameters:**

- `ip` - The IP address to check

**Returns:** `true` if the IP is public, `false` otherwise

**Example:**

```text
use { isPublic } from "@sentrie/net" as net

let isPub = net.isPublic("8.8.8.8")  // true
let isPub2 = net.isPublic("192.168.1.1")  // false
```

### `isLoopback(ip: string): boolean`

Checks if an IP address is a loopback address. Loopback addresses include `127.0.0.0/8` for IPv4 and `::1` for IPv6.

**Parameters:**

- `ip` - The IP address to check

**Returns:** `true` if the IP is a loopback address, `false` otherwise

**Example:**

```text
use { isLoopback } from "@sentrie/net" as net

let isLoop = net.isLoopback("127.0.0.1")  // true
let isLoop2 = net.isLoopback("::1")  // true
```

### `isMulticast(ip: string): boolean`

Checks if an IP address is a multicast address.

**Parameters:**

- `ip` - The IP address to check

**Returns:** `true` if the IP is multicast, `false` otherwise

**Example:**

```text
use { isMulticast } from "@sentrie/net" as net

let isMulti = net.isMulticast("224.0.0.1")  // true
```

## Complete Example

```text
namespace com/example/network

policy mypolicy {
  use { cidrContains, parseIP, isPrivate, isPublic } from "@sentrie/net" as net

  fact clientIp!: string
  fact allowedCidr!: string

  rule checkAccess = default false {
    let ip = net.parseIP(clientIp)
    let isPrivate = net.isPrivate(clientIp)
    let isAllowed = net.cidrContains(allowedCidr, clientIp)
    yield ip != null and isAllowed and not isPrivate
  }

  export decision of checkAccess
}
```
