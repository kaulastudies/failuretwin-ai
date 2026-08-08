# AI Analysis Design

## Goal
Make the analysis genuinely model-driven, plan-specific and explainable while retaining a stable output contract for the UI.

## Input
The analysis layer should receive:
- plan description
- target user/customer
- budget
- deadline
- team/owner
- dependencies
- constraints
- success criteria
- existing safeguards
- supporting evidence context when available

## Output contract

```json
{
  "customer": {"findings": [], "confidence": 0},
  "operations": {"findings": [], "confidence": 0},
  "finance": {"findings": [], "confidence": 0},
  "risk": {"findings": [], "confidence": 0},
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
Adoption, trust, switching friction, unmet expectations, support, usability.

### Operations
Capacity, dependencies, ownership, rollout, rollback, staffing, service continuity.

### Finance
Budget realism, cost growth, ROI, hidden cost, unit economics, downside exposure.

### Risk
Security, privacy, compliance, reputation, critical operational or strategic risks.

## Prompt-quality requirements
- Use the user's actual facts and constraints.
- Avoid repeating the same wording across perspectives.
- Surface at least one non-obvious context-specific failure mode.
- Clearly distinguish observed fact, inference and unresolved assumption.
- Return structured output even when evidence is weak.

## Fallback
A deterministic fallback may preserve demo continuity, but it should not be presented as equivalent to the primary AI reasoning path.
