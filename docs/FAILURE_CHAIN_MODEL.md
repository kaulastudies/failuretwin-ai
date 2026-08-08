# Failure Chain Model

A Failure Chain connects individual weaknesses into a causal sequence.

Example:

```text
Aggressive launch deadline
    â†“
No escalation path prepared
    â†“
High-value support requests stall
    â†“
Customer trust declines
    â†“
Churn / public complaints increase
    â†“
Launch outcome misses target
```

## Requirements
- Every node should be grounded in plan context or an explicit inference.
- Chains should explain causality, not merely group risks.
- A safeguard should be able to interrupt one or more nodes in a chain.
- The UI should make the strongest chain easy to explain in a short demo.
