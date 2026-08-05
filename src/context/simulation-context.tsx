import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { Simulation, AnalysisResult } from "@/lib/analysis/types";
import {
  loadSimulations,
  saveSimulation,
  loadAnalysisData,
  saveActiveSimulationId,
  getActiveSimulationId,
  clearActiveSimulationId,
} from "@/lib/local-storage";
import { getDemoData } from "@/lib/demo-data";
import { normalizeSimulation, normalizeAnalysisResult } from "@/lib/normalize";

interface SimulationState {
  currentSimulation: Simulation | null;
  currentAnalysis: AnalysisResult | null;
  simulations: Simulation[];
  isDemo: boolean;
}

type SimulationAction =
  | { type: "SET_SIMULATION"; simulation: Simulation }
  | { type: "ADD_SIMULATION"; simulation: Simulation }
  | { type: "UPDATE_SIMULATION"; simulation: Simulation }
  | { type: "DELETE_SIMULATION"; id: string }
  | { type: "SET_ANALYSIS"; analysis: AnalysisResult }
  | { type: "SET_DEMO_MODE"; isDemo: boolean }
  | { type: "CLEAR_CURRENT" }
  | { type: "LOAD_SIMULATIONS"; simulations: Simulation[] }
  | { type: "RESTORE_STATE"; simulation: Simulation; analysis: AnalysisResult; isDemo: boolean };

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case "SET_SIMULATION":
      return { ...state, currentSimulation: action.simulation };
    case "ADD_SIMULATION": {
      const updated = [...state.simulations, action.simulation];
      saveSimulation(action.simulation);
      saveActiveSimulationId(action.simulation.id);
      return { ...state, simulations: updated, currentSimulation: action.simulation };
    }
    case "UPDATE_SIMULATION": {
      const updated = state.simulations.map((s) =>
        s.id === action.simulation.id ? action.simulation : s
      );
      saveSimulation(action.simulation);
      return { ...state, simulations: updated, currentSimulation: action.simulation };
    }
    case "DELETE_SIMULATION": {
      return {
        ...state,
        simulations: state.simulations.filter((s) => s.id !== action.id),
        currentSimulation:
          state.currentSimulation?.id === action.id ? null : state.currentSimulation,
      };
    }
    case "SET_ANALYSIS": {
      if (action.analysis?.simulation?.id) {
        saveActiveSimulationId(action.analysis.simulation.id);
      }
      return { ...state, currentAnalysis: action.analysis };
    }
    case "SET_DEMO_MODE":
      return { ...state, isDemo: action.isDemo };
    case "CLEAR_CURRENT": {
      clearActiveSimulationId();
      return { ...state, currentSimulation: null, currentAnalysis: null, isDemo: false };
    }
    case "LOAD_SIMULATIONS":
      return { ...state, simulations: action.simulations };
    case "RESTORE_STATE":
      return {
        ...state,
        currentSimulation: action.simulation,
        currentAnalysis: action.analysis,
        isDemo: action.isDemo,
      };
    default:
      return state;
  }
}

interface SimulationContextType {
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, {
    currentSimulation: null,
    currentAnalysis: null,
    simulations: [],
    isDemo: false,
  });

  // Load saved simulations on mount, and restore active session
  useEffect(() => {
    const loaded = loadSimulations();
    dispatch({ type: "LOAD_SIMULATIONS", simulations: loaded });

    const activeId = getActiveSimulationId();
    if (activeId) {
      const analysis = loadAnalysisData(activeId);
      if (analysis && analysis.simulation) {
        dispatch({
          type: "RESTORE_STATE",
          simulation: normalizeSimulation(analysis.simulation),
          analysis: normalizeAnalysisResult(analysis) as AnalysisResult,
          isDemo: analysis.simulation.id.startsWith("demo_"),
        });
      } else {
        const demoData = getDemoData(activeId);
        if (demoData) {
          dispatch({
            type: "RESTORE_STATE",
            simulation: normalizeSimulation(demoData.simulation),
            analysis: normalizeAnalysisResult(demoData) as AnalysisResult,
            isDemo: true,
          });
        }
      }
    }
  }, []);

  return (
    <SimulationContext.Provider value={{ state, dispatch }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}