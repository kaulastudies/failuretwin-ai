import { FallbackEngine } from "./fallback-engine";
import { normalizeAnalysisResult } from "../normalize";
import type { Simulation, AnalysisResult, AnalysisEngine } from "./types";

export class LiveAIEngine implements AnalysisEngine {
  constructor(private endpoint = "/api/analyze") {}

  async analyze(simulation: Simulation): Promise<AnalysisResult> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ simulation }),
      });

      if (!response.ok) {
        throw new Error(`Analysis API request failed with ${response.status}`);
      }

      const payload = await response.json();
      const normalized = normalizeAnalysisResult(payload);
      if (!normalized) {
        throw new Error("Analysis API returned an invalid payload");
      }

      return normalized;
    } catch (error) {
      console.warn("Live analysis failed, using deterministic fallback.", error);
      const fallbackEngine = new FallbackEngine();
      return fallbackEngine.analyze(simulation);
    }
  }
}
