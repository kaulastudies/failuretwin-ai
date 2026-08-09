import { LiveAIEngine } from "./live-engine";
import type { AnalysisResult, Simulation } from "./types";

const analysisEngine = new LiveAIEngine();

export async function runAnalysis(simulation: Simulation): Promise<AnalysisResult> {
  return analysisEngine.analyze(simulation);
}
