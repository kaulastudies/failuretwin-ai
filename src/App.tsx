import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SimulationProvider } from "@/context/simulation-context";
import { Layout } from "@/components/shared/layout";
import { ErrorBoundary } from "@/components/shared/error-boundary";

import Dashboard from "@/pages/dashboard";
import NewSimulation from "@/pages/new-simulation";
import ManagementPlanRoom from "@/pages/follow-up-room";
import AnalysisRoom from "@/pages/analysis-room";
import FailureChainRoom from "@/pages/failure-chain-room";
import DecisionRoom from "@/pages/decision-room";
import DecisionBrief from "@/pages/decision-brief";

const router = createBrowserRouter([
  {
    element: (
      <SimulationProvider>
        <Layout />
      </SimulationProvider>
    ),
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/new", element: <NewSimulation /> },
      { path: "/follow-up", element: <ManagementPlanRoom /> },
      { path: "/analysis", element: <AnalysisRoom /> },
      { path: "/failure-chain", element: <FailureChainRoom /> },
      { path: "/decision", element: <DecisionRoom /> },
      { path: "/brief", element: <DecisionBrief /> },
    ],
  },
]);

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}