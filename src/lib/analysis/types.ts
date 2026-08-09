export interface Simulation {
  id: string;
  title: string;
  description: string;
  targetUser: string;
  expectedOutcome: string;
  budget: string;
  deadline: string;
  industry: string;
  constraints: string[];
  assumptions: string[];
  riskTolerance: "low" | "medium" | "high";
  successMetric: string;
  status: "draft" | "analyzing" | "complete";
  createdAt: number;
}

export interface AgentFinding {
  perspective: "customer" | "operations" | "finance" | "risk";
  score: number;
  confidence: "low" | "medium" | "high";
  topRisks: { title: string; severity: "low" | "medium" | "high" | "critical"; detail: string }[];
  evidenceGaps: string[];
  objection: string;
  suggestedSafeguard: string;
}

export interface FailureNode {
  id: string;
  type: "assumption" | "risk" | "consequence" | "safeguard" | "evidence-gap";
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  detail: string;
  linkedTo: string[];
  state: "unresolved" | "mitigated" | "accepted";
}

export interface Safeguard {
  id: string;
  riskId: string;
  title: string;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  accepted: boolean;
  scoreDelta: number;
  notes: string;
}

export interface DecisionBrief {
  summary: string;
  recommendation: "go" | "revise" | "stop";
  readinessScore: number;
  /** Baseline readiness score captured when the analysis was first created,
   *  before any safeguards were accepted. Used to recompute the current score
   *  from a stable baseline so toggling safeguards never drifts or accumulates. */
  originalReadinessScore: number;
  scoreBreakdown: {
    customerReadiness: number;
    operationsFeasibility: number;
    financialViability: number;
    riskPosture: number;
    evidenceQuality: number;
  };
  topRisks: { title: string; severity: string; detail: string }[];
  acceptedSafeguards: Safeguard[];
  openEvidence: string[];
  next72Hours: string[];
}

export interface AnalysisResult {
  simulation: Simulation;
  findings: AgentFinding[];
  nodes: FailureNode[];
  safeguards: Safeguard[];
  brief: DecisionBrief;
}

export interface AnalysisEngine {
  analyze(simulation: Simulation): AnalysisResult;
}