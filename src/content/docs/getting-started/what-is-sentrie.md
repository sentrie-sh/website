---
title: What is Sentrie?
description: What is Sentrie?
---

Sentrie is an open-source policy engine that lets you write business rules in a dedicated language. Instead of embedding policy logic in your application code, you define rules declaratively and let Sentrie evaluate them.

## How it Works

You write policies using Sentrie's domain-specific language, which is designed to be both human-readable and machine-optimized. The language separates policy logic from your application code, making it easier to test, maintain, and audit your business rules.

## Key Features

- **Declarative**: Express what should be true, not how to check it
- **Type-safe**: Catch errors at policy definition time
- **Fast**: Optimized evaluation with built-in caching
- **Composable**: Build complex policies from simpler rules
- **Extensible**: Use TypeScript modules for complex business logic

## Language Design

Sentrie's language is intentionally simple and focused on expressing business rules clearly. It provides a complete runtime environment that makes policies portable and independent of your application's implementation language.
