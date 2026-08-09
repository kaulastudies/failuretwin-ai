import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const steps = [
  { path: "/", label: "Dashboard", step: 1 },
  { path: "/new", label: "New", step: 2 },
  { path: "/follow-up", label: "Management Plan", step: 3 },
  { path: "/analysis", label: "Analysis", step: 4 },
  { path: "/failure-chain", label: "Chain", step: 5 },
  { path: "/decision", label: "Decision", step: 6 },
  { path: "/brief", label: "Brief", step: 7 },
];

export function NavigationStepper() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Find which step we're on
  const currentIdx = steps.findIndex((s) => s.path === currentPath);
  const activeStep = currentIdx >= 0 ? currentIdx : 0;

  return (
    <nav className="w-full overflow-x-auto no-print" aria-label="Simulation workflow">
      <ol className="flex items-center min-w-max px-4 py-3 gap-0">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isCurrent = idx === activeStep;
          const canNavigate = isCompleted || isCurrent;

          return (
            <li key={step.path} className="flex items-center">
              <button
                onClick={() => canNavigate && navigate(step.path)}
                disabled={!canNavigate}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all duration-150",
                  isCurrent && "bg-primary/10 text-primary font-medium",
                  isCompleted && "text-muted-foreground hover:text-foreground cursor-pointer",
                  !canNavigate && "text-muted-foreground/40 cursor-not-allowed",
                  isCompleted && "cursor-pointer"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium border",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-go bg-go-bg text-go",
                    !canNavigate && "border-border text-muted-foreground/40"
                  )}
                >
                  {isCompleted ? "✓" : step.step}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "w-6 h-px mx-1",
                    isCompleted ? "bg-go" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}