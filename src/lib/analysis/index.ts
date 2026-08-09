import type { AnalysisEngine } from "./types";
import { FallbackEngine } from "./fallback-engine";
import { LiveAIEngine } from "./live-engine";

export type EngineType = "fallback" | "live";

export function createEngine(type: EngineType): AnalysisEngine {
  switch (type) {
    case "fallback":
      return new FallbackEngine();
    case "live":
      return new LiveAIEngine();
    default:
      return new FallbackEngine();
  }
}

export type { AnalysisResult, Simulation, AgentFinding, FailureNode, Safeguard, DecisionBrief, AnalysisEngine } from "./types";
