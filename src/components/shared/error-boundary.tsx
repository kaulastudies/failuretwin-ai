import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error.message, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Clear potentially corrupted state
    try {
      localStorage.removeItem("failuretwin_active_sim_id");
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
              <p className="text-muted-foreground">
                The application encountered an unexpected error. This may be due to corrupted data
                or a temporary issue.
              </p>
              {this.state.error && (
                <p className="text-xs text-muted-foreground/60 mt-4 font-mono bg-secondary/50 rounded p-2 text-left overflow-auto max-h-20">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4" />
                Reset & Go Home
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Home className="h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}