---
title: Introduction & Core Philosophy
description: Sentrie is a policy engine with deterministic evaluation. This page states what Sentrie is and why determinism is central.
---


Sentrie is an open-source policy engine. You write business rules in a dedicated language; the engine evaluates them with deterministic, bounded execution. Use it when you need consistent policy decisions across services, auditability, and predictable performance.

## What Sentrie Is

- **Policy engine**: Evaluates declarative rules against input facts; returns decisions (e.g. allow/deny, or values).
- **Single binary**: No external runtime; supports macOS (arm64, x64), Linux (x64, arm64), Windows (x64, arm64).
- **Structured language**: Namespaces, policies, rules, facts, shapes; optional TypeScript modules for extra logic.

## Determinism

Evaluation is **deterministic**: same inputs and policy pack produce the same outputs. No hidden state, no nondeterministic APIs in the core language.

- **Bounded execution**: Language is non–Turing complete (no arbitrary loops). All evaluations terminate.
- **Predictable performance**: No infinite loops or stack overflow from policy code.
- **Auditability**: Decisions are traceable; computation is bounded and reproducible.
- **Safe execution**: Designed for production; policy code cannot escape the evaluation sandbox.

## Syntax

Program structure (conceptual):

```text
namespace <FQN>

shape <Name> { ... }

policy <Name> {
  fact <name>: <Type> as <alias>
  rule <name> = default <expr> when <condition> { yield <expr> }
  export decision of <rule>
}
```

- One namespace per file; namespace must be the first statement.
- Policies contain facts (inputs), rules (logic), and exports (rules exposed for evaluation).

## Behavior & Constraints

- **Facts**: Required by default; use `?` for optional. All facts are non-nullable. Optional facts may have a default.
- **Rules**: Must yield a value in the body when the `when` condition is true; otherwise the default (or `unknown` if no default) is used.
- **Exports**: A policy must export at least one rule for it to be evaluable via CLI or API.
- **TypeScript modules**: Allowed for extra functions; execution remains bounded by the engine.

## Constraints & Edge Cases

- Policy logic cannot cause infinite loops or unbounded recursion in the Sentrie language.
- Required facts must be provided at evaluation time or evaluation fails.
- Constraint validation failures abort evaluation immediately.
- TypeScript modules are sandboxed; they cannot break determinism of the policy language itself.
