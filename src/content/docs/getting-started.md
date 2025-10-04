---
title: "Getting Started"
description: "Learn the basics of Sentrie and write your first policy."
---

# Getting Started

Welcome to Sentrie! This guide will help you get up and running with Sentrie quickly.

## What is Sentrie?

Sentrie is a policy enforcement engine that allows you to define and evaluate authorization rules, access control policies, and business logic in a clear, type-safe language. It's designed to be:

- **Declarative**: Define what should happen, not how
- **Type-safe**: Catch errors at policy definition time
- **Performant**: Built for production workloads with caching and optimization
- **Extensible**: Integrate with JavaScript modules for complex logic

## Quick Start Guide

Follow these steps to get started with Sentrie:

1. **[Installation](/getting-started/installation/)** - Install Sentrie on your system
2. **[What is Policy as Code?](/getting-started/what-is-policy-as-code/)** - Understand the concepts behind Policy as Code
3. **[Writing your first Policy](/getting-started/writing-your-first-policy/)** - Create your first Sentrie policy
4. **[Running your Policy](/getting-started/running-your-policy/)** - Learn how to test and run your policies

## Your First Policy

Let's create a simple authorization policy to get familiar with Sentrie.

### 1. Create a Policy Directory

```bash
mkdir my-first-policy
cd my-first-policy
```

### 2. Write Your First Policy

Create a file called `auth.sentrie`:

```text
namespace com/example/auth

policy user {
  rule allow = default false when user.role == "admin" {
    yield true
  }

  export decision of allow
}
```

This policy:

- Defines a namespace `com/example/auth`
- Creates a policy called `user`
- Has a rule `allow` that returns `true` only for admin users
- Exports the `allow` decision for external evaluation

### 3. Start the Server

```bash
sentrie serve --pack-location .
```

You should see output like:

```
INFO Starting Sentrie server on port 7529
INFO Pack loaded: example
INFO Server ready
```

### 4. Test Your Policy

Make a request to evaluate the policy:

```bash
curl -X POST "http://localhost:7529/decision/com/example/auth/user/allow" \
  -H "Content-Type: application/json" \
  -d '{"user": {"role": "admin", "name": "alice"}}'
```

Response:

```json
{
  "decision": true,
  "attachments": {}
}
```

Try with a non-admin user:

```bash
curl -X POST "http://localhost:7529/decision/com/example/auth/user/allow" \
  -H "Content-Type: application/json" \
  -d '{"user": {"role": "user", "name": "bob"}}'
```

Response:

```json
{
  "decision": false,
  "attachments": {}
}
```

## Understanding the Basics

### Namespaces

Namespaces organize your policies hierarchically:

```text
namespace com/example/auth
namespace com/example/billing
namespace com/example/analytics
```

### Policies

Policies contain rules and define the context for evaluation:

```text
policy user {
  // rules go here
}
```

### Rules

Rules are the core of Sentrie policies. They have three parts:

1. **Name**: `rule allow`
2. **Default**: `default false` (what to return if the `when` condition is false)
3. **When**: `when user.role == "admin"` (condition that must be true)
4. **Body**: `{ yield true }` (what to return if the condition is true)

### Exports

Export rules to make them available for external evaluation:

```text
export decision of allow
```

## Next Steps

Now that you have a basic understanding, explore:

- [Installation Guide](/docs/installation) - Detailed installation options
- [Writing Your First Policy](/docs/writing-your-first-policy) - Deep dive into policy creation
- [Policy Language Reference](/docs/reference) - Complete language documentation
- [CLI Reference](/docs/cli-reference) - Command-line interface documentation

## Common Patterns

### Simple Authorization

```text
policy access {
  rule allow = default false when user.role in ["admin", "editor"] {
    yield true
  }

  export decision of allow
}
```

### Resource-Based Access

```text
policy resource {
  rule canRead = default false when user.role == "admin" or resource.owner == user.id {
    yield true
  }

  rule canWrite = default false when user.role == "admin" {
    yield true
  }

  export decision of canRead
  export decision of canWrite
}
```

### Conditional Logic

```text
policy pricing {
  rule calculatePrice = default 0 {
    let basePrice = product.price
    let discount = user.isPremium ? 0.1 : 0.05
    let finalPrice = basePrice * (1 - discount)

    yield finalPrice
  }

  export decision of calculatePrice
}
```

## Troubleshooting

### Common Issues

**Policy not found**: Make sure your namespace and policy names match exactly in the URL path.

**Invalid JSON**: Ensure your request body is valid JSON and matches the expected structure.

**Server won't start**: Check that port 7529 is available, or use `--port` to specify a different port.

### Getting Help

- Check the [Language Reference](/docs/reference) for syntax help
- Look at the [CLI Reference](/docs/cli-reference) for command options
- Visit our [GitHub repository](https://github.com/sentrie-sh/sentrie) for examples and issues
