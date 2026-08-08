# Scoring Model

## Purpose
Readiness scoring helps users understand whether accepted safeguards materially improve the plan.

## Principles
- deterministic and explainable
- no double-counting when the same safeguard is accepted repeatedly
- visible reason for every score change
- score supports the final decision but does not replace qualitative reasoning

## Suggested decision bands
The exact implementation must match application behavior.

- **Proceed**: risks are bounded and critical safeguards are in place
- **Revise**: important gaps remain but can reasonably be addressed
- **Stop**: critical unresolved risk or feasibility failure dominates the plan

## Verification
Tests should explicitly cover:
- accept safeguard once
- reject safeguard
- accept â†’ reject â†’ accept
- repeated clicks
- multiple safeguards affecting the same chain
