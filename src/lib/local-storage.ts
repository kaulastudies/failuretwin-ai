import type { Simulation, AnalysisResult } from "./analysis/types";
import { normalizeSimulation, normalizeAnalysisResult } from "./normalize";

const SIMULATIONS_KEY = "failuretwin_simulations";
const ANALYSIS_PREFIX = "failuretwin_analysis_";
const ACTIVE_SIM_ID_KEY = "failuretwin_active_sim_id";

export function saveSimulation(sim: Simulation): void {
  try {
    const list = loadSimulationsRaw();
    const idx = list.findIndex((s) => s.id === sim.id);
    if (idx >= 0) {
      list[idx] = sim;
    } else {
      list.push(sim);
    }
    localStorage.setItem(SIMULATIONS_KEY, JSON.stringify(list));
  } catch {
    console.warn("Failed to save simulation to localStorage");
  }
}

function loadSimulationsRaw(): Simulation[] {
  try {
    const raw = localStorage.getItem(SIMULATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function loadSimulations(): Simulation[] {
  try {
    const raw = loadSimulationsRaw();
    return raw.map((s) => normalizeSimulation(s));
  } catch {
    return [];
  }
}

export function getSimulation(id: string): Simulation | null {
  const list = loadSimulationsRaw();
  const found = list.find((s) => s.id === id);
  return found ? normalizeSimulation(found) : null;
}

export function deleteSimulation(id: string): void {
  try {
    const list = loadSimulationsRaw().filter((s) => s.id !== id);
    localStorage.setItem(SIMULATIONS_KEY, JSON.stringify(list));
    localStorage.removeItem(ANALYSIS_PREFIX + id);
    const activeId = getActiveSimulationId();
    if (activeId === id) {
      localStorage.removeItem(ACTIVE_SIM_ID_KEY);
    }
  } catch {
    console.warn("Failed to delete simulation");
  }
}

export function saveAnalysisData(id: string, data: AnalysisResult): void {
  try {
    localStorage.setItem(ANALYSIS_PREFIX + id, JSON.stringify(data));
  } catch {
    console.warn("Failed to save analysis data");
  }
}

export function loadAnalysisData(id: string): AnalysisResult | null {
  try {
    const raw = localStorage.getItem(ANALYSIS_PREFIX + id);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeAnalysisResult(parsed);
  } catch {
    return null;
  }
}

export function saveActiveSimulationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_SIM_ID_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_SIM_ID_KEY);
    }
  } catch {
    // Silently fail
  }
}

export function getActiveSimulationId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SIM_ID_KEY);
  } catch {
    return null;
  }
}

export function clearActiveSimulationId(): void {
  try {
    localStorage.removeItem(ACTIVE_SIM_ID_KEY);
  } catch {
    // Silently fail
  }
}