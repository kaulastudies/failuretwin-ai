import type { Simulation, AnalysisResult, AgentFinding, FailureNode, Safeguard, DecisionBrief, AnalysisEngine } from "./types";

export class FallbackEngine implements AnalysisEngine {
  analyze(simulation: Simulation): AnalysisResult {
    const findings = this.generateFindings(simulation);
    const nodes = this.generateFailureNodes(simulation, findings);
    const safeguards = this.generateSafeguards(nodes);
    const brief = this.generateBrief(simulation, findings, nodes, safeguards);

    return { simulation, findings, nodes, safeguards, brief };
  }

  private generateFindings(sim: Simulation): AgentFinding[] {
    const noHumanEscalation = sim.description.toLowerCase().includes("no human") || sim.description.toLowerCase().includes("no escalation") || sim.description.toLowerCase().includes("fully automated");
    const tightDeadline = sim.deadline.toLowerCase().includes("21") || sim.deadline.toLowerCase().includes("14") || sim.deadline.toLowerCase().includes("30") || sim.deadline.toLowerCase().includes("days");
    const limitedBudget = sim.budget.toLowerCase().includes("limited") || sim.budget.toLowerCase().includes("tight") || sim.budget.toLowerCase().includes("low") || sim.budget.toLowerCase().includes("small");
    const regulatedIndustry = ["healthcare", "finance", "insurance", "legal", "banking", "medical"].includes(sim.industry.toLowerCase());
    const vagueAssumptions = sim.assumptions.length === 0 || sim.assumptions.some(a => a.length < 10);

    // Customer perspective
    let customerScore = 65;
    if (noHumanEscalation) customerScore -= 20;
    if (tightDeadline) customerScore -= 5;
    if (regulatedIndustry) customerScore -= 5;
    const customerRisks: AgentFinding["topRisks"] = [];
    const customerGaps: string[] = [];
    if (noHumanEscalation) {
      customerRisks.push({ title: "Frustrated high-value customers", severity: "critical", detail: "No human escalation means complex issues go unresolved, eroding trust with power users." });
      customerRisks.push({ title: "Negative public complaints", severity: "high", detail: "Unhappy customers will air grievances publicly before churning." });
      customerGaps.push("No customer-satisfaction survey data for current support");
      customerGaps.push("No churn-rate baseline for comparison");
    }
    if (!sim.targetUser) {
      customerGaps.push("Target user persona not defined — cannot validate needs");
    }
    if (customerRisks.length === 0) {
      customerRisks.push({ title: "Unknown customer adoption risk", severity: "medium", detail: "Without defined target user, adoption assumptions are untested." });
    }

    // Operations perspective
    let opsScore = 70;
    if (tightDeadline) opsScore -= 25;
    if (noHumanEscalation) opsScore -= 10;
    if (limitedBudget) opsScore -= 10;
    const opsRisks: AgentFinding["topRisks"] = [];
    const opsGaps: string[] = [];
    if (tightDeadline) {
      opsRisks.push({ title: "Impossible delivery timeline", severity: "high", detail: "A 21–30 day timeline for a new system rollout is extremely aggressive without existing infrastructure." });
      opsRisks.push({ title: "Inadequate testing window", severity: "high", detail: "No time for proper QA cycles before launch." });
      opsGaps.push("No rollout plan or phased-deployment strategy");
    }
    if (limitedBudget) {
      opsRisks.push({ title: "Resource starvation", severity: "high", detail: "Limited budget restricts headcount, tools, and infrastructure investments." });
      opsGaps.push("No staffing plan or team capacity assessment");
    }
    if (opsRisks.length === 0) {
      opsRisks.push({ title: "Operational complexity underestimated", severity: "medium", detail: "The operational burden of maintaining this change has not been scoped." });
    }

    // Finance perspective
    let financeScore = 65;
    if (limitedBudget) financeScore -= 20;
    if (tightDeadline) financeScore -= 5;
    if (vagueAssumptions) financeScore -= 5;
    const financeRisks: AgentFinding["topRisks"] = [];
    const financeGaps: string[] = [];
    if (limitedBudget) {
      financeRisks.push({ title: "Budget insufficient for scope", severity: "high", detail: "Limited budget suggests corners will be cut on critical areas like QA, monitoring, and support." });
      financeRisks.push({ title: "Unplanned cost overruns", severity: "medium", detail: "Tight budgets leave no contingency for unexpected issues." });
      financeGaps.push("No unit economics breakdown");
      financeGaps.push("No ROI model or breakeven timeline");
    }
    if (vagueAssumptions) {
      financeGaps.push("No financial model based on assumptions");
    }
    if (financeRisks.length === 0) {
      financeRisks.push({ title: "Financial viability unproven", severity: "medium", detail: "The financial case for this initiative needs stronger evidence." });
    }

    // Risk perspective
    let riskScore = 60;
    if (noHumanEscalation) riskScore -= 20;
    if (regulatedIndustry) riskScore -= 15;
    if (tightDeadline) riskScore -= 5;
    const riskRisks: AgentFinding["topRisks"] = [];
    const riskGaps: string[] = [];
    if (noHumanEscalation) {
      riskRisks.push({ title: "No human-in-the-loop for critical failures", severity: "critical", detail: "Without human escalation, automated errors can compound before detection." });
      riskGaps.push("No incident-response plan");
    }
    if (regulatedIndustry) {
      riskRisks.push({ title: "Regulatory compliance exposure", severity: "high", detail: `Operating in ${sim.industry} without compliance review exposes the business to regulatory penalties.` });
      riskGaps.push("No compliance audit conducted");
    }
    if (vagueAssumptions) {
      riskRisks.push({ title: "Decision made on vague assumptions", severity: "high", detail: "Risk posture cannot be properly assessed when assumptions are underspecified." });
    }
    if (riskRisks.length === 0) {
      riskRisks.push({ title: "Unknown unknowns", severity: "medium", detail: "No specific risks identified — this may indicate insufficient analysis rather than low risk." });
    }

    const customerConfidence = customerScore >= 50 ? (customerScore >= 70 ? "high" : "medium") : "low";
    const opsConfidence = opsScore >= 50 ? (opsScore >= 70 ? "high" : "medium") : "low";
    const financeConfidence = financeScore >= 50 ? (financeScore >= 70 ? "high" : "medium") : "low";
    const riskConfidence = riskScore >= 50 ? (riskScore >= 70 ? "high" : "medium") : "low";

    return [
      {
        perspective: "customer",
        score: Math.max(0, Math.min(100, customerScore)),
        confidence: customerConfidence,
        topRisks: customerRisks,
        evidenceGaps: customerGaps,
        objection: noHumanEscalation
          ? "Customers will feel abandoned when they can't reach a human for complex issues."
          : "Customer needs are not well-defined enough to predict adoption accurately.",
        suggestedSafeguard: noHumanEscalation
          ? "Implement escalation triggers that route complex issues to human agents after 2 failed automated attempts."
          : "Run a customer discovery sprint before committing to the full build.",
      },
      {
        perspective: "operations",
        score: Math.max(0, Math.min(100, opsScore)),
        confidence: opsConfidence,
        topRisks: opsRisks,
        evidenceGaps: opsGaps,
        objection: tightDeadline
          ? "The timeline is too aggressive for reliable delivery — corners will be cut."
          : "Operational readiness cannot be confirmed without a rollout plan.",
        suggestedSafeguard: tightDeadline
          ? "Implement a staged rollout with a 2-week shadow-mode phase before full launch."
          : "Create a detailed project plan with milestones, owners, and buffer time.",
      },
      {
        perspective: "finance",
        score: Math.max(0, Math.min(100, financeScore)),
        confidence: financeConfidence,
        topRisks: financeRisks,
        evidenceGaps: financeGaps,
        objection: limitedBudget
          ? "The stated budget is unlikely to cover full scope — underfunding creates cascading risks."
          : "Financial viability needs stronger evidence before a Go decision.",
        suggestedSafeguard: limitedBudget
          ? "Define a minimum viable scope that fits within budget, with clear phase-2 funding triggers."
          : "Prepare a unit-economics model with best/worst/expected scenarios.",
      },
      {
        perspective: "risk",
        score: Math.max(0, Math.min(100, riskScore)),
        confidence: riskConfidence,
        topRisks: riskRisks,
        evidenceGaps: riskGaps,
        objection: noHumanEscalation
          ? "Proceeding without human escalation is a governance risk that could cause brand damage."
          : "The risk assessment is incomplete without more detailed inputs.",
        suggestedSafeguard: "Run a structured risk-workshop using the SCAMPER framework to surface blind spots.",
      },
    ];
  }

  private generateFailureNodes(sim: Simulation, findings: AgentFinding[]): FailureNode[] {
    const nodes: FailureNode[] = [];
    let idCounter = 1;

    // Collect all risks from findings
    for (const f of findings) {
      for (const r of f.topRisks) {
        const assumptionId = `a${idCounter}`;
        const riskId = `r${idCounter}`;
        const consequenceId = `c${idCounter}`;

        nodes.push({
          id: assumptionId,
          type: "assumption",
          label: `Assumption: ${r.title}`,
          severity: r.severity,
          detail: `Based on the ${f.perspective} perspective analysis, this risk was flagged because: "${r.detail}". The assumption is that this risk can be managed without specific mitigation.`,
          linkedTo: [riskId],
          state: "unresolved",
        });

        nodes.push({
          id: riskId,
          type: "risk",
          label: r.title,
          severity: r.severity,
          detail: r.detail,
          linkedTo: [consequenceId],
          state: "unresolved",
        });

        let consequenceDetail = "If this risk materializes, it will directly impact project outcomes.";
        if (r.severity === "critical") {
          consequenceDetail = "This is a critical risk — if unaddressed, it could cause the entire initiative to fail. Immediate mitigation is required before proceeding.";
        } else if (r.severity === "high") {
          consequenceDetail = "This high-severity risk will significantly impact outcomes and requires a mitigation plan before full commitment.";
        }

        nodes.push({
          id: consequenceId,
          type: "consequence",
          label: `Consequence: ${r.title} materializes`,
          severity: r.severity,
          detail: consequenceDetail,
          linkedTo: [],
          state: "unresolved",
        });

        idCounter++;
      }

      // Evidence gaps as evidence-gap nodes
      for (const gap of f.evidenceGaps) {
        const gapId = `eg${idCounter}`;
        nodes.push({
          id: gapId,
          type: "evidence-gap",
          label: `Evidence Gap: ${gap}`,
          severity: "medium",
          detail: `The ${f.perspective} perspective identified this evidence gap. Filling this gap would increase confidence in the ${f.perspective} assessment.`,
          linkedTo: [],
          state: "unresolved",
        });
        idCounter++;
      }
    }

    return nodes;
  }

  private generateSafeguards(nodes: FailureNode[]): Safeguard[] {
    const safeguards: Safeguard[] = [];
    const riskNodes = nodes.filter((n) => n.type === "risk");

    const safeguardTemplates = [
      { riskTitle: "human escalation", title: "Implement escalation triggers to human agents", effort: "medium" as const, impact: "high" as const, delta: 8 },
      { riskTitle: "compliance", title: "Conduct compliance audit and implement controls", effort: "high" as const, impact: "high" as const, delta: 10 },
      { riskTitle: "timeline", title: "Extend timeline or reduce scope to fit", effort: "medium" as const, impact: "high" as const, delta: 8 },
      { riskTitle: "budget", title: "Phase the rollout and secure additional funding", effort: "high" as const, impact: "medium" as const, delta: 6 },
      { riskTitle: "customer", title: "Run customer validation before full build", effort: "low" as const, impact: "medium" as const, delta: 5 },
      { riskTitle: "testing", title: "Implement dedicated QA phase with user acceptance testing", effort: "medium" as const, impact: "high" as const, delta: 7 },
      { riskTitle: "unknown", title: "Run structured risk-workshop to surface blind spots", effort: "low" as const, impact: "medium" as const, delta: 4 },
    ];

    for (let i = 0; i < riskNodes.length; i++) {
      const risk = riskNodes[i];
      const matched = safeguardTemplates.find((t) =>
        risk.label.toLowerCase().includes(t.riskTitle)
      );
      if (matched) {
        safeguards.push({
          id: `sg${i + 1}`,
          riskId: risk.id,
          title: matched.title,
          effort: matched.effort,
          impact: matched.impact,
          accepted: false,
          scoreDelta: matched.delta,
          notes: "",
        });
      } else {
        safeguards.push({
          id: `sg${i + 1}`,
          riskId: risk.id,
          title: `Mitigate: ${risk.label}`,
          effort: "medium",
          impact: "medium",
          accepted: false,
          scoreDelta: 5,
          notes: "",
        });
      }
    }

    return safeguards;
  }

  private generateBrief(
    sim: Simulation,
    findings: AgentFinding[],
    nodes: FailureNode[],
    safeguards: Safeguard[]
  ): DecisionBrief {
    const scores = findings.map((f) => f.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;

    const customerFind = findings.find((f) => f.perspective === "customer");
    const opsFind = findings.find((f) => f.perspective === "operations");
    const financeFind = findings.find((f) => f.perspective === "finance");
    const riskFind = findings.find((f) => f.perspective === "risk");

    const customerReadiness = Math.round((customerFind?.score ?? 50));
    const operationsFeasibility = Math.round((opsFind?.score ?? 50));
    const financialViability = Math.round((financeFind?.score ?? 50));
    const riskPosture = Math.round((riskFind?.score ?? 50));

    const totalGaps = findings.reduce((sum, f) => sum + f.evidenceGaps.length, 0);
    const evidenceQuality = Math.max(0, Math.min(100, 100 - totalGaps * 12));

    const readinessScore = Math.round(
      customerReadiness * 0.25 +
      operationsFeasibility * 0.20 +
      financialViability * 0.20 +
      riskPosture * 0.20 +
      evidenceQuality * 0.15
    );

    const hasCritical = nodes.some((n) => n.type === "risk" && n.severity === "critical" && n.state === "unresolved");
    const recommendation = hasCritical ? "stop" : readinessScore >= 75 ? "go" : readinessScore >= 45 ? "revise" : "stop";

    const allRisks = findings.flatMap((f) => f.topRisks);
    const uniqueRisks = allRisks.filter((r, i, arr) => arr.findIndex((x) => x.title === r.title) === i);

    const allGaps = findings.flatMap((f) => f.evidenceGaps);
    const uniqueGaps = allGaps.filter((g, i, arr) => arr.findIndex((x) => x === g) === i);

    const nextSteps: string[] = [];
    if (recommendation !== "go") {
      nextSteps.push("Review and accept or reject each suggested safeguard");
      nextSteps.push("Fill the identified evidence gaps with research or data");
      nextSteps.push("Run a structured risk-workshop with your team");
    }
    if (readinessScore < 75) {
      nextSteps.push("Refine the plan based on the riskiest failure chains");
      nextSteps.push("Re-run the simulation after implementing safeguards");
    }
    nextSteps.push("Print the decision brief for team discussion");

    const summary = recommendation === "go"
      ? `"${sim.title}" shows strong readiness (${readinessScore}/100). The analysis suggests the plan is viable with the recommended safeguards in place.`
      : recommendation === "revise"
      ? `"${sim.title}" needs revision (${readinessScore}/100). Address the key risks and evidence gaps before proceeding.`
      : `"${sim.title}" has critical blockers (${readinessScore}/100). We recommend stopping until the critical risks are resolved.`;

    return {
      summary,
      recommendation,
      readinessScore,
      originalReadinessScore: readinessScore,
      scoreBreakdown: {
        customerReadiness,
        operationsFeasibility,
        financialViability,
        riskPosture,
        evidenceQuality,
      },
      topRisks: uniqueRisks.map((r) => ({
        title: r.title,
        severity: r.severity,
        detail: r.detail,
      })),
      acceptedSafeguards: safeguards.filter((s) => s.accepted),
      openEvidence: uniqueGaps,
      next72Hours: nextSteps,
    };
  }
}