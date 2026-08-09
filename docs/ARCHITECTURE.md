# Architecture

## System view

```mermaid
flowchart LR
    U["User"] --> P["Plan input"]
    P --> M["Management context"]
    M --> A["AI analysis adapter"]
    A --> C["Customer"]
    A --> O["Operations"]
    A --> F["Finance"]
    A --> R["Risk"]
    C --> S["Synthesis"]
    O --> S
    F --> S
    R --> S
    S --> FC["Failure chains"]
    FC --> SG["Safeguards"]
    SG --> RD["Readiness"]
    RD --> DB["Decision brief"]
```

## Primary + fallback design

```mermaid
flowchart TD
    I["Plan + context"] --> Q{"AI model available?"}
    Q -->|Yes| L["Model-driven analysis"]
    Q -->|No| D["Deterministic fallback"]
    L --> N["Normalized structured output"]
    D --> N
    N --> UI["Workflow UI"]
```

The intended primary path is model-driven reasoning. The deterministic path is a resilience mechanism rather than the product's primary intelligence layer.

## State responsibility
Workflow state should preserve:
- plan/context input
- analysis result
- failure chains
- safeguards
- accepted/rejected decisions
- readiness
- final recommendation

Persist only what is required for user continuity.

## Native.Builder + GitHub
Native.Builder is the main hackathon build environment. GitHub is used for:
- source synchronization
- documentation
- issue tracking
- QA evidence
- PR review
- release/submission coordination
