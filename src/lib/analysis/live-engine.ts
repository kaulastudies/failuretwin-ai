import type { Simulation, AnalysisResult, AnalysisEngine } from "./types";

export class LiveAIEngine implements AnalysisEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  analyze(_simulation: Simulation): AnalysisResult {
    throw new Error("LiveAIEngine is not implemented yet. Use FallbackEngine for the MVP.");
  }
}