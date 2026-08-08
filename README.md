<div align="center">

# ðŸ§­ FailureTwin AI

### See how your plan could fail before the real world finds out.

**AI pre-mortem decision workspace for founders, product managers, and operations teams.**

[![Built with Native.Builder](https://img.shields.io/badge/Built%20with-Native.Builder-5B5BD6)](#-nativebuilder)
[![Hackathon](https://img.shields.io/badge/AI%20Factory-Hackathon-111827)](#-hackathon-focus)
[![Status](https://img.shields.io/badge/status-active%20development-f59e0b)](#-project-status)
[![License](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)

</div>

---

## âœ¨ What is FailureTwin AI?

Most planning tools help teams describe how a plan could succeed. FailureTwin does the opposite.

It runs a structured **pre-mortem** before execution and asks:

> If this plan fails, what is the most plausible chain of events that caused it?

A user describes a launch, automation, product change, or business decision. FailureTwin stress-tests the plan through four independent perspectives:

| Perspective | Focus |
|---|---|
| ðŸ‘¥ **Customer** | adoption, trust, switching friction, support and user experience |
| âš™ï¸ **Operations** | capacity, dependencies, ownership, rollout and rollback readiness |
| ðŸ’° **Finance** | budget, hidden cost, ROI, unit economics and downside exposure |
| ðŸ›¡ï¸ **Risk** | security, privacy, compliance, reputation and critical failure modes |

FailureTwin then connects the findings into a failure chain, recommends safeguards, recalculates readiness, and produces a **Proceed / Revise / Stop** decision brief.

---

## ðŸš€ Core workflow

```mermaid
flowchart TD
    A[Plan / Decision] --> B[Management Context]
    B --> C[AI Pre-mortem Analysis]
    C --> D1[Customer]
    C --> D2[Operations]
    C --> D3[Finance]
    C --> D4[Risk]
    D1 --> E[Contradictions & Evidence Gaps]
    D2 --> E
    D3 --> E
    D4 --> E
    E --> F[Failure Chain]
    F --> G[Prioritized Safeguards]
    G --> H[Readiness Recalculation]
    H --> I[Proceed / Revise / Stop]
    I --> J[Printable Decision Brief]
```

<details>
<summary><strong>ðŸ”Ž What does one simulation produce?</strong></summary>

- Four perspective-specific analyses
- Context-specific failure modes
- Contradictions and unresolved evidence
- Connected failure chains
- Prioritized safeguards with effort/impact reasoning
- Readiness score changes as safeguards are accepted
- Final Proceed / Revise / Stop recommendation
- Printable decision brief

</details>

<details>
<summary><strong>ðŸ§ª Why keep a deterministic fallback?</strong></summary>

The primary product direction is model-driven freeform analysis. A deterministic path is retained as a resilience mechanism for demo continuity and API failure handling, not as a substitute for the AI analysis layer.

</details>

---

## ðŸ§  AI analysis design

FailureTwin is designed around **context-specific reasoning**, not generic risk templates.

The model layer should return a structured result similar to:

```json
{
  "customer": {},
  "operations": {},
  "finance": {},
  "risk": {},
  "failureChains": [],
  "safeguards": [],
  "unresolvedQuestions": [],
  "evidenceQuality": 0,
  "decision": "REVISE"
}
```

The product goal is for judges and users to provide **freeform plans**, while the system still produces a stable, explainable output contract.

See [`docs/AI_ANALYSIS_DESIGN.md`](docs/AI_ANALYSIS_DESIGN.md).

---

## ðŸ§© Product principles

- **Plan-specific over generic** â€” safeguards must reference the user's actual constraints.
- **Different perspectives, different reasoning** â€” Finance should not sound like Risk; Operations should not repeat Customer.
- **Traceable recommendations** â€” input â†’ observed risk â†’ safeguard â†’ readiness effect.
- **Preserve user work** â€” back navigation must not erase simulation state.
- **Useful artifact at the end** â€” the decision brief should be printable and executive-readable.
- **Resilient demo path** â€” model/API failures should fail gracefully.

---

## ðŸ— Native.Builder

FailureTwin AI is built primarily in **Native.Builder** and synchronized to GitHub for source control, documentation, issue tracking, QA, and team collaboration.

The GitHub repository is the engineering collaboration layer; the deployed Native.Builder application remains the primary hackathon product.

---

## ðŸ“Œ Project status

| Area | Status |
|---|---|
| Core pre-mortem workflow | ðŸŸ¢ Working / refinement |
| Four-perspective analysis | ðŸŸ¡ AI-depth refinement |
| Freeform model-driven analysis | ðŸŸ¡ Priority |
| Failure-chain experience | ðŸŸ¡ UX refinement |
| Safeguard scoring | ðŸŸ¢ Core behavior available |
| Navigation/state persistence | ðŸŸ¡ Regression priority |
| Printable decision brief | ðŸŸ¡ Final polish |
| Management Plan | ðŸŸ¡ Planned enhancement |
| Evidence/file workflow | âšª Stretch / controlled scope |
| Documentation & QA | ðŸŸ¢ In progress |

> Status descriptions intentionally distinguish implemented behavior from planned or refinement work.

---

## ðŸ§ª Quality gates

Before submission, the team validates:

1. A new user can complete one full workflow without assistance.
2. Freeform input produces plan-specific analysis.
3. Customer, Operations, Finance and Risk outputs are meaningfully different.
4. Back/forward navigation preserves entered information.
5. Accepting a safeguard changes readiness exactly once.
6. The final decision is consistent with the visible evidence and score.
7. The public deployment works in a fresh browser session.
8. The demo can be completed cleanly within the event time limit.

See [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md).

---

## ðŸ‘¥ Team & responsibility areas

| Member | Responsibility area |
|---|---|
| **Rama Chandra** | Product & Technical Lead Â· Native.Builder architecture Â· AI integration Â· scoring Â· final integration & release |
| **Aigbe Godspower Voke** | Full-stack workflow review Â· navigation/state QA Â· failure-chain UX validation |
| **Raff Fahrezi** | Management Plan Â· evidence/file workflow Â· data/Supabase review Â· security & privacy review |
| **Amna (Dreamy doodle)** | QA Â· documentation Â· safeguard-personalization review Â· perspective-differentiation review Â· demo support |
| **Salman** | repository onboarding Â· local setup validation Â· smoke testing Â· documentation validation |
| **s.env** | responsibility pending confirmed technical profile and agreed task ownership |

See [`docs/TEAM.md`](docs/TEAM.md).

---

## ðŸ§­ Repository guide

```text
.
â”œâ”€â”€ README.md
â”œâ”€â”€ CONTRIBUTING.md
â”œâ”€â”€ CHANGELOG.md
â”œâ”€â”€ SECURITY.md
â”œâ”€â”€ LICENSE
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ PRODUCT_REQUIREMENTS.md
â”‚   â”œâ”€â”€ ARCHITECTURE.md
â”‚   â”œâ”€â”€ AI_ANALYSIS_DESIGN.md
â”‚   â”œâ”€â”€ FAILURE_CHAIN_MODEL.md
â”‚   â”œâ”€â”€ SCORING_MODEL.md
â”‚   â”œâ”€â”€ TEST_PLAN.md
â”‚   â”œâ”€â”€ TEAM.md
â”‚   â”œâ”€â”€ MENTOR_FEEDBACK.md
â”‚   â”œâ”€â”€ DEMO_SCRIPT.md
â”‚   â”œâ”€â”€ JUDGING_ALIGNMENT.md
â”‚   â””â”€â”€ SUBMISSION_CHECKLIST.md
â””â”€â”€ .github/
    â”œâ”€â”€ ISSUE_TEMPLATE/
    â””â”€â”€ pull_request_template.md
```

---

## ðŸ¤ Contributing

We use a lightweight professional workflow:

**Issue â†’ branch â†’ change â†’ PR â†’ review/test evidence â†’ merge â†’ issue close**

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before starting work.

---

## ðŸŽ¯ Hackathon focus

The final sprint prioritizes:

1. Genuine model-driven freeform analysis
2. Plan-specific and non-obvious failure modes
3. State-safe end-to-end workflow
4. Personalized safeguards
5. Strong printable decision brief
6. Clean short demo and stable public deployment

See [`docs/JUDGING_ALIGNMENT.md`](docs/JUDGING_ALIGNMENT.md).

---

## ðŸ“„ License

MIT â€” see [`LICENSE`](LICENSE).

---

<div align="center">

**FailureTwin AI** Â· Think through failure while failure is still cheap.

</div>
