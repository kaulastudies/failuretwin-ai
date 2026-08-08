# Product Requirements

## Product
FailureTwin AI is an AI pre-mortem decision workspace that stress-tests a plan before execution.

## Primary users
- founders
- product managers
- operations leads
- teams evaluating launches, automations and business decisions

## Required user journey
1. Describe the plan.
2. Add important context: budget, deadline, target user and constraints.
3. Run analysis across Customer, Operations, Finance and Risk.
4. Review contradictions, evidence gaps and connected failure chains.
5. Review and accept/reject safeguards.
6. Recalculate readiness.
7. Generate Proceed / Revise / Stop recommendation.
8. Produce a concise printable decision brief.

## Functional requirements

### Plan input
- freeform plan description
- optional structured context
- arbitrary judge/user plans must work

### Analysis
Each perspective must have distinct concerns and produce plan-specific observations.

### Failure chain
The product should connect risks causally instead of presenting an unstructured list.

### Safeguards
Safeguards should be prioritized and should explain why they apply to the specific plan.

### State
Navigation between workflow stages must preserve entered and derived data.

### Final brief
The final artifact must summarize:
- plan
- primary risks
- failure chain
- accepted safeguards
- unresolved questions
- readiness
- final decision

## Stretch scope
- supporting evidence/file attachments
- advanced file text extraction
- richer visual failure map
