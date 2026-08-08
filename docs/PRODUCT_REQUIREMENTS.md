# Product Requirements

## Product
FailureTwin AI is an AI pre-mortem decision workspace that stress-tests a plan before execution.

## Primary users
- founders
- product managers
- operations leads
- startup and AI-automation teams
- teams evaluating launches, automations, migrations, and high-impact decisions

## Required user journey
1. Describe the plan in freeform text.
2. Add management context such as target user, budget, deadline, dependencies and constraints.
3. Run Customer, Operations, Finance and Risk analysis.
4. Review contradictions and evidence gaps.
5. Review one or more connected failure chains.
6. Review and accept/reject safeguards.
7. Recalculate readiness without double counting.
8. Produce a Proceed / Revise / Stop recommendation.
9. Generate a concise printable decision brief.

## Functional requirements

### Freeform plan input
The product must accept plans that are not pre-written demo scenarios.

### Perspective-specific analysis
Each perspective must contribute meaningfully different reasoning.

### Failure-chain synthesis
Individual weaknesses should be connected causally instead of presented as a flat risk list.

### Safeguards
Safeguards should:
- reference the actual plan
- explain why they matter
- identify the failure-chain point they interrupt
- have a stable effect on readiness

### State persistence
Normal navigation must preserve plan context, analysis results, safeguard decisions and derived state.

### Final brief
The final artifact should summarize:
- plan
- most important risks
- strongest failure chain
- accepted safeguards
- unresolved questions
- readiness
- final recommendation

## Stretch scope
- supporting evidence/file attachment
- evidence text extraction
- richer visual failure map
- durable cross-session persistence
