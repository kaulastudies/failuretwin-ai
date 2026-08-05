import type { Simulation, AnalysisResult } from "./analysis/types";

export function normalizeSimulation(sim: Partial<Simulation> | null | undefined): Simulation {
  if (!sim || typeof sim !== "object") {
    return {
      id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: "Untitled Simulation",
      description: "",
      targetUser: "",
      expectedOutcome: "",
      budget: "",
      deadline: "",
      industry: "",
      constraints: [],
      assumptions: [],
      riskTolerance: "medium",
      successMetric: "",
      status: "draft",
      createdAt: Date.now(),
    };
  }

  return {
    id: sim.id || `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: sim.title || "Untitled Simulation",
    description: sim.description || "",
    targetUser: sim.targetUser || "",
    expectedOutcome: sim.expectedOutcome || "",
    budget: sim.budget || "",
    deadline: sim.deadline || "",
    industry: sim.industry || "",
    constraints: Array.isArray(sim.constraints) ? sim.constraints : [],
    assumptions: Array.isArray(sim.assumptions) ? sim.assumptions : [],
    riskTolerance: ((["low", "medium", "high"] as const).includes(sim.riskTolerance as any))
      ? (sim.riskTolerance as "low" | "medium" | "high")
      : "medium",
    successMetric: sim.successMetric || "",
    status: ((["draft", "analyzing", "complete"] as const).includes(sim.status as any))
      ? (sim.status as "draft" | "analyzing" | "complete")
      : "draft",
    createdAt: typeof sim.createdAt === "number" ? sim.createdAt : Date.now(),
  };
}

export function normalizeAnalysisResult(data: Partial<AnalysisResult> | null | undefined): AnalysisResult | null {
  if (!data || typeof data !== "object") return null;
  if (!data.simulation || !data.findings || !data.brief) return null;

  return {
    simulation: normalizeSimulation(data.simulation),
    findings: Array.isArray(data.findings) ? data.findings : [],
    nodes: Array.isArray(data.nodes) ? data.nodes : [],
    safeguards: Array.isArray(data.safeguards) ? data.safeguards : [],
    brief: {
      summary: data.brief?.summary || "",
      recommendation: (["go", "revise", "stop"] as const).includes(data.brief?.recommendation as any)
        ? (data.brief.recommendation as "go" | "revise" | "stop")
        : "revise",
      readinessScore: typeof data.brief?.readinessScore === "number" && !isNaN(data.brief.readinessScore)
        ? Math.max(0, Math.min(100, data.brief.readinessScore))
        : 50,
      // Preserve the recorded baseline; for older saved data that predates
      // originalReadinessScore, derive it safely from readinessScore (which at
      // save time was the pristine, pre-acceptance score).
      originalReadinessScore: typeof data.brief?.originalReadinessScore === "number" && !isNaN(data.brief.originalReadinessScore)
        ? Math.max(0, Math.min(100, data.brief.originalReadinessScore))
        : (typeof data.brief?.readinessScore === "number" && !isNaN(data.brief.readinessScore)
            ? Math.max(0, Math.min(100, data.brief.readinessScore))
            : 50),
      scoreBreakdown: {
        customerReadiness: typeof data.brief?.scoreBreakdown?.customerReadiness === "number" ? data.brief.scoreBreakdown.customerReadiness : 50,
        operationsFeasibility: typeof data.brief?.scoreBreakdown?.operationsFeasibility === "number" ? data.brief.scoreBreakdown.operationsFeasibility : 50,
        financialViability: typeof data.brief?.scoreBreakdown?.financialViability === "number" ? data.brief.scoreBreakdown.financialViability : 50,
        riskPosture: typeof data.brief?.scoreBreakdown?.riskPosture === "number" ? data.brief.scoreBreakdown.riskPosture : 50,
        evidenceQuality: typeof data.brief?.scoreBreakdown?.evidenceQuality === "number" ? data.brief.scoreBreakdown.evidenceQuality : 50,
      },
      topRisks: Array.isArray(data.brief?.topRisks) ? data.brief.topRisks : [],
      acceptedSafeguards: Array.isArray(data.brief?.acceptedSafeguards) ? data.brief.acceptedSafeguards : [],
      openEvidence: Array.isArray(data.brief?.openEvidence) ? data.brief.openEvidence : [],
      next72Hours: Array.isArray(data.brief?.next72Hours) ? data.brief.next72Hours : [],
    },
  };
}