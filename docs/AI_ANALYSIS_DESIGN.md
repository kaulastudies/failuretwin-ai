# AI Analysis Design

## Goal
Produce genuinely model-driven, plan-specific, explainable analysis while preserving a stable UI contract.

## Input context
The AI layer should receive:
- plan description
- target customer/user
- deadline
- budget
- team/owner
- dependencies
- constraints
- success criteria
- existing safeguards
- available evidence context

## Output contract

```json
{
  "customer": {
    "findings": [],
    "confidence": 0
  },
  "operations": {
    "findings": [],
    "confidence": 0
  },
  "finance": {
    "findings": [],
    "confidence": 0
  },
  "risk": {
    "findings": [],
    "confidence": 0
  },
  "contradictions": [],
  "failureChains": [],
  "safeguards": [],
  "unresolvedQuestions": [],
  "evidenceQuality": 0,
  "decision": "REVISE"
}
```

## Perspective requirements

### Customer
Adoption, trust, support burden, switching friction, expectations, usability, customer harm.

### Operations
Capacity, dependencies, staffing, ownership, rollout, rollback, service continuity.

### Finance
Budget realism, hidden costs, ROI, unit economics, downside exposure, emergency cost.

### Risk
Security, privacy, compliance, reputation, critical blockers, failure containment.

## Reasoning requirements
- use the user's actual facts and constraints
- avoid template repetition across perspectives
- surface at least one non-obvious context-specific failure mode
- separate fact, inference and unresolved assumption
- generate safeguards that map to specific failure points
- return structured output reliably

## Fallback
If model access fails, the application may use a deterministic fallback so the workflow remains usable. Fallback output should preserve the same UI schema where practical.
