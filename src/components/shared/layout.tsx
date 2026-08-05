import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationStepper } from "@/components/shared/navigation-stepper";
import { cn } from "@/lib/utils";

const noStepperRoutes = ["/"];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const showStepper = !noStepperRoutes.includes(location.pathname);
  const isRoot = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 no-print">
        <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            {!isRoot && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-primary transition-colors"
            >
              <ShieldAlert className="h-5 w-5 text-primary" />
              <span>FailureTwin AI</span>
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            Pre-mortem Decision Workspace
          </div>
        </div>
        {showStepper && <NavigationStepper />}
      </header>

      {/* Main content */}
      <main className={cn("flex-1", isRoot ? "" : "max-w-7xl mx-auto w-full px-4 py-6")}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p className="mb-1">
            FailureTwin AI — Stress-test your plans before the real world finds out.
          </p>
          <p>
            Future integrations: Supabase workspaces · Bright Data market research · Slack/Jira/Notion export
          </p>
        </div>
      </footer>
    </div>
  );
}