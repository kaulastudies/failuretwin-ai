# Architecture

## Product architecture

```mermaid
flowchart LR
    U[User Plan] --> C[Context / Management Plan]
    C --> A[AI Analysis Layer]
    A --> P[Four Perspectives]
    P --> S[Synthesis]
    S --> F[Failure Chains]
    F --> G[Safeguards]
    G --> R[Readiness]
    R --> D[Decision Brief]
```

## Reliability model

The target architecture uses a model-driven analysis path as the normal mode and a deterministic fallback only when the model path is unavailable.

```mermaid
flowchart TD
    I[Plan input] --> M{Model available?}
    M -->|Yes| L[Structured model analysis]
    M -->|No| F[Deterministic fallback]
    L --> O[Normalized output contract]
    F --> O
    O --> UI[FailureTwin workflow UI]
```

## State
Workflow state should survive ordinary route changes and back navigation. Persist only the minimum required information.

## GitHub / Native.Builder
- Native.Builder remains the primary hackathon build environment.
- GitHub is used for source synchronization, documentation, issues, QA and team collaboration.
- Changes that materially alter the hackathon application should be synchronized carefully to avoid overwriting a newer Builder state.
