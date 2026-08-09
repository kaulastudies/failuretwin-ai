# Test Plan

## P0 workflow tests

### T01 — Arbitrary freeform plan
**Expected:** analysis is specific to an unseen plan.

### T02 — Perspective differentiation
**Expected:** Customer, Operations, Finance and Risk produce meaningfully different observations.

### T03 — Back navigation
Move forward several steps, then back and forward again.

**Expected:** entered and derived data remain intact.

### T04 — Personalized safeguards
**Expected:** safeguards explicitly connect to plan facts and failure-chain nodes.

### T05 — Safeguard scoring
Accept a safeguard.

**Expected:** readiness changes exactly once.

### T06 — Decision consistency
**Expected:** Proceed / Revise / Stop aligns with visible evidence, unresolved risk and readiness.

### T07 — Fresh-browser smoke test
**Expected:** public URL loads and one complete workflow finishes.

### T08 — Model/API failure
Where practical, simulate unavailable AI service.

**Expected:** graceful fallback/error handling rather than a broken workflow.

### T09 — Management Plan persistence
**Expected:** Management Plan inputs survive normal navigation.

### T10 — Decision brief
**Expected:** brief is readable, internally consistent and print-friendly.

## Bug evidence standard
Every significant defect should include:
- reproduction steps
- expected result
- actual result
- browser/device
- screenshot or recording when useful
- retest result
