# Test Plan

## P0 workflow tests

### T01 â€” Freeform plan
Enter a completely new plan not present in demo scenarios.
Expected: analysis remains specific to the entered plan.

### T02 â€” Perspective differentiation
Compare Customer, Operations, Finance and Risk.
Expected: each perspective contains distinct concerns.

### T03 â€” Back navigation
Move forward several steps, go back, then return.
Expected: entered information and simulation state remain intact.

### T04 â€” Safeguard personalization
Expected: recommendations explicitly connect to plan facts/constraints.

### T05 â€” Safeguard scoring
Accept one safeguard.
Expected: readiness changes exactly once.

### T06 â€” Decision consistency
Expected: Proceed/Revise/Stop aligns with visible risks, safeguards and readiness.

### T07 â€” Fresh browser smoke test
Expected: public URL loads and one full workflow completes.

### T08 â€” Failure handling
Simulate model/API failure where practical.
Expected: user gets a graceful fallback/error path rather than a broken workflow.

## Evidence
For every significant bug or regression:
- reproduction steps
- expected result
- actual result
- browser/device
- screenshot or recording when useful
- retest result after fix
