# Scoring Model

## Purpose
Readiness scoring communicates whether safeguards materially improve the plan.

## Principles
- explainable
- stable
- deterministic once the analysis result exists
- no double counting
- visible reason for each score movement
- qualitative risk still matters; score is not the sole decision mechanism

## Decision interpretation
- **Proceed** — risks are bounded and critical safeguards are in place
- **Revise** — important gaps remain but can reasonably be addressed
- **Stop** — a critical blocker or feasibility failure dominates the plan

## Regression cases
Tests should explicitly cover:
- accept safeguard once
- repeat accept action
- reject safeguard
- accept → reject → accept
- several safeguards affecting one failure chain
- navigation away and back
- reload/persistence behavior where supported
