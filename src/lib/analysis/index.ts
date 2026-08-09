import type { AnalysisEngine } from "./types";
import { FallbackEngine } from "./fallback-engine";
import { LiveAIEngine } from "./live-engine";

export type EngineType = "fallback" | "live";

export function createEngine(type: EngineType, apiKey?: string): AnalysisEngine {
  switch (type) {
    case "fallback":
      return new FallbackEngine();
    case "live":
      if (!apiKey) throw new Error("API key required for LiveAIEngine");
      return new LiveAIEngine(apiKey);
    default:
      return new FallbackEngine();
  }
}

export type { AnalysisResult, Simulation, AgentFinding, FailureNode, Safeguard, DecisionBrief, AnalysisEngine } from "./types";