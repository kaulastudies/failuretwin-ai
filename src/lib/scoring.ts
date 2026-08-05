import type { AgentFinding, FailureNode, Safeguard, DecisionBrief } from "./analysis/types";

export function calculateReadinessScore(
  findings: AgentFinding[],
  safeguards: Safeguard[],
  failureNodes: FailureNode[]
): { score: number; breakdown: DecisionBrief["scoreBreakdown"]; recommendation: "go" | "revise" | "stop" } {
  const customer = findings.find((f) => f.perspective === "customer")?.score ?? 50;
  const operations = findings.find((f) => f.perspective === "operations")?.score ?? 50;
  const finance = findings.find((f) => f.perspective === "finance")?.score ?? 50;
  const risk = findings.find((f) => f.perspective === "risk")?.score ?? 50;

  // Evidence quality: avg of all evidence gap counts (inverted)
  const totalGaps = findings.reduce((sum, f) => sum + f.evidenceGaps.length, 0);
  const evidenceQuality = Math.max(0, Math.min(100, 100 - totalGaps * 12));

  const customerReadiness = Math.round(customer);
  const operationsFeasibility = Math.round(operations);
  const financialViability = Math.round(finance);
  const riskPosture = Math.round(risk);

  let score = Math.round(
    customerReadiness * 0.25 +
    operationsFeasibility * 0.20 +
    financialViability * 0.20 +
    riskPosture * 0.20 +
    evidenceQuality * 0.15
  );

  // Apply safeguard deltas
  const acceptedDeltas = safeguards
    .filter((s) => s.accepted)
    .reduce((sum, s) => sum + (s.scoreDelta ?? 0), 0);
  score = Math.min(100, Math.max(0, score + acceptedDeltas));

  const recommendation = getRecommendation(score, failureNodes);
  return {
    score,
    breakdown: { customerReadiness, operationsFeasibility, financialViability, riskPosture, evidenceQuality },
    recommendation,
  };
}

export function getRecommendation(
  score: number,
  failureNodes: FailureNode[]
): "go" | "revise" | "stop" {
  const hasCriticalBlockers = failureNodes.some(
    (n) => n.type === "risk" && n.severity === "critical" && n.state === "unresolved"
  );
  if (hasCriticalBlockers) return "stop";
  if (score < 45) return "stop";
  if (score >= 75) return "go";
  return "revise";
}

export function recalculateScore(
  brief: DecisionBrief,
  safeguards: Safeguard[]
): DecisionBrief {
  const accepted = safeguards.filter((s) => s.accepted);

  // Sum all accepted safeguard deltas
  const acceptedDelta = accepted.reduce((sum, s) => sum + (s.scoreDelta ?? 0), 0);

  // New score = original baseline readiness + all accepted deltas. The baseline is
  // the score captured when the analysis was first created (before any safeguard
  // was accepted). Recomputing from this stable baseline — rather than from the
  // previous current score — means toggling a safeguard on/off never drifts or
  // accumulates: accept +8 → 51, reject → back to 43, accept again → 51 (not 59).
  const baseScore = brief.originalReadinessScore ?? brief.readinessScore;
  const newScore = Math.min(100, Math.max(0, baseScore + acceptedDelta));

  // Check if there are still critical unresolved risks
  const hasCriticalUnresolved = brief.topRisks.some((r) => r.severity === "critical");

  let recommendation: "go" | "revise" | "stop" = brief.recommendation;
  if (hasCriticalUnresolved && accepted.length === 0) {
    recommendation = "stop";
  } else if (newScore >= 75 && !hasCriticalUnresolved) {
    recommendation = "go";
  } else if (newScore < 45) {
    recommendation = "stop";
  } else {
    recommendation = "revise";
  }

  return {
    ...brief,
    readinessScore: newScore,
    recommendation,
    acceptedSafeguards: accepted,
  };
}