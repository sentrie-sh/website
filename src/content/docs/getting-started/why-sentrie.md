---
title: Why Sentrie?
description: Why Sentrie?
---

Sentrie is an open-source policy engine that makes it easier to write, test, and maintain business logic. Instead of scattering policy checks throughout your codebase, Sentrie lets you define policies in a dedicated language that's both human-readable as well as machine-optimized.

## The Problem with Policy Logic in Code

Most applications embed policy logic directly in application code using `if-else` statements, database queries, or configuration files. This creates several issues:

- **Hard to Test**: Policy logic mixed with business logic makes unit testing difficult.
- **Inconsistent**: Same rules implemented differently across different parts of the application.
- **Hard to Audit**: No clear separation between what the policy is and how it's implemented.
- **Maintenance Burden**: Changes require touching multiple files and understanding complex code paths.
- **No Reusability**: Can't easily share policy logic between different services or applications.

## How Sentrie Helps

Sentrie separates policy logic from application code using a domain-specific language designed for expressing business rules:

### **Declarative Syntax**

Write policies that express _what_ should be true, not _how_ to check it. The language is designed to be readable by both humans and machines.

### **Type Safety**

The compiler catches type errors at policy definition time, preventing runtime failures due to incorrect data access or type mismatches.

### **Fast Evaluation**

The engine is optimized for performance with built-in caching and efficient evaluation strategies. Policy decisions happen in milliseconds.

### **Composable Rules**

Build complex policies from simpler rules. Create reusable rule libraries that can be shared across different policies and projects. This makes it easier to maintain and extend policies over time.

### **TypeScript Integration**

Extend policies with TypeScript modules for complex business logic while keeping the core policy language simple and safe.

## What Makes Sentrie Different

**Open Source First**: Sentrie is built by developers, for developers. The code is open, the design decisions are transparent, and contributions are welcome.

**Language-Focused**: Rather than being a library or framework, Sentrie provides a complete language for expressing policies along with a runtime for the language. This makes policies portable and independent of your application's implementation language.

**Performance-Conscious**: Built with performance in mind from the ground up. The evaluation engine is designed to handle high-throughput scenarios without sacrificing correctness.

**Community-Driven**: Policy as Code is still evolving. Sentrie grows with the community's needs and feedback. This makes it easier to get started and use.

## When Sentrie Makes Sense

Consider Sentrie when you have:

- **Multiple services** that need consistent policy enforcement.
- **Compliance requirements** that need clear audit trails.
- **Performance requirements** where policy evaluation can't be a bottleneck.
- **Team collaboration** where non-developers need to understand or modify policies.

## Next Steps

Ready to try Sentrie? Check out the [installation guide](/getting-started/installation/) to get started, or jump into [writing your first policy](/getting-started/writing-your-first-policy/) to see how it works in practice.
