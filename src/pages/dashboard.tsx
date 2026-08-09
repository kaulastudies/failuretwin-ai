import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, TrendingUp, TrendingDown, Minus, ArrowRight, Beaker, Truck, HeartPulse, ShieldAlert, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useSimulation } from "@/context/simulation-context";
import { demoSimulations, getDemoData, getDefaultDemoId } from "@/lib/demo-data";
import { loadAnalysisData } from "@/lib/local-storage";
import { cn } from "@/lib/utils";

const demoIcons = [Beaker, Truck, HeartPulse];
const demoColors = ["bg-intel-bg text-intel", "bg-revise-bg text-revise", "bg-go-bg text-go"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useSimulation();
  const simulations = state.simulations;

  const handleNewSimulation = () => {
    dispatch({ type: "SET_DEMO_MODE", isDemo: false });
    dispatch({ type: "CLEAR_CURRENT" });
    navigate("/new");
  };

  const handleGuidedDemo = (demoId?: string) => {
    const id = demoId || getDefaultDemoId();
    const data = getDemoData(id);
    if (data) {
      dispatch({ type: "SET_DEMO_MODE", isDemo: true });
      dispatch({ type: "SET_SIMULATION", simulation: data.simulation });
      dispatch({ type: "SET_ANALYSIS", analysis: data });
      navigate("/analysis");
    }
  };

  const handleOpenSimulation = (simId: string) => {
    const analysis = loadAnalysisData(simId);
    if (analysis) {
      dispatch({ type: "SET_SIMULATION", simulation: analysis.simulation });
      dispatch({ type: "SET_ANALYSIS", analysis });
      navigate("/analysis");
    } else {
      const sim = simulations.find((s) => s.id === simId);
      if (sim) {
        dispatch({ type: "SET_SIMULATION", simulation: sim });
        navigate("/follow-up");
      }
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreIcon = (score?: number) => {
    if (!score) return null;
    if (score >= 75) return <TrendingUp className="h-4 w-4 text-go" />;
    if (score >= 45) return <Minus className="h-4 w-4 text-revise" />;
    return <TrendingDown className="h-4 w-4 text-stop" />;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 75) return "text-go";
    if (score >= 45) return "text-revise";
    return "text-stop";
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return null;
    if (score >= 75) return <Badge variant="go">Go</Badge>;
    if (score >= 45) return <Badge variant="revise">Revise</Badge>;
    return <Badge variant="stop">Stop</Badge>;
  };

  // Compute actual scores from stored analysis data
  const simScores = simulations.map((sim) => {
    const analysis = loadAnalysisData(sim.id);
    return { id: sim.id, score: analysis?.brief?.readinessScore };
  });

  const goCount = simScores.filter((s) => s.score !== undefined && s.score >= 75).length;
  const reviseCount = simScores.filter((s) => s.score !== undefined && s.score >= 45 && s.score < 75).length;
  const stopCount = simScores.filter((s) => s.score !== undefined && s.score < 45).length;
  const noScoreCount = simScores.filter((s) => s.score === undefined).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-card p-8 md:p-12">
        <div className="absolute inset-0 bg-dotgrid-glow opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Decision Pre-Mortem Tool</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            See how your plan could fail<br />
            <span className="text-primary">before the real world finds out.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-8">
            FailureTwin AI stress-tests your launch plans, product decisions, and strategic bets
            through four specialist perspectives — before you commit time, money, and reputation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={handleNewSimulation}>
              <Plus className="h-4 w-4" />
              New Simulation
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleGuidedDemo()}
            >
              <Sparkles className="h-4 w-4" />
              Run Guided Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Quick-start Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick-start Demos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoSimulations.map((demo, idx) => {
            const Icon = demoIcons[idx];
            return (
              <Card
                key={demo.id}
                className="cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-md hover:shadow-primary/5 group"
                onClick={() => handleGuidedDemo(demo.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={cn("p-2 rounded-lg", demoColors[idx])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="mt-2 text-base">{demo.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {demo.description.slice(0, 100)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{demo.industry}</span>
                    <span>·</span>
                    <span>{demo.deadline}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Recent Simulations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Simulations</h2>
          <Button variant="outline" size="sm" onClick={handleNewSimulation}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
        {simulations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShieldAlert className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No simulations yet</p>
              <p className="text-muted-foreground/60 text-sm mb-6">
                Describe a plan and see how it would fail — before it does.
              </p>
              <Button onClick={handleNewSimulation}>
                <Plus className="h-4 w-4" />
                Start Your First Simulation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulations.map((sim) => {
              const scoreInfo = simScores.find((s) => s.id === sim.id);
              return (
                <Card
                  key={sim.id}
                  className="cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-md hover:shadow-primary/5 group"
                  onClick={() => handleOpenSimulation(sim.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{sim.title}</CardTitle>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <CardDescription className="line-clamp-2 text-xs mt-1">
                      {sim.description.slice(0, 120)}{sim.description.length > 120 ? "..." : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        {scoreInfo?.score !== undefined ? (
                          <>
                            {getScoreIcon(scoreInfo.score)}
                            <span className={cn("font-medium", getScoreColor(scoreInfo.score))}>
                              {scoreInfo.score}
                            </span>
                            {getScoreBadge(scoreInfo.score)}
                          </>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Draft</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(sim.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Readiness Score Overview */}
      {(simulations.length > 0 || goCount + reviseCount + stopCount > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Readiness Score Distribution</h2>
          </div>
          <Card>
            <CardContent className="py-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={cn("text-3xl font-bold", goCount > 0 && "text-go")}>
                    {goCount}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Go (75+)</div>
                  {goCount > 0 && (
                    <Progress value={75} className="h-1.5 mt-2" variant="go" />
                  )}
                </div>
                <div className="text-center border-x border-border">
                  <div className={cn("text-3xl font-bold", reviseCount > 0 && "text-revise")}>
                    {reviseCount}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Revise (45-74)</div>
                  {reviseCount > 0 && (
                    <Progress value={60} className="h-1.5 mt-2" variant="revise" />
                  )}
                </div>
                <div className="text-center">
                  <div className={cn("text-3xl font-bold", stopCount > 0 && "text-stop")}>
                    {stopCount}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Stop (0-44)</div>
                  {stopCount > 0 && (
                    <Progress value={45} className="h-1.5 mt-2" variant="stop" />
                  )}
                </div>
              </div>
              {noScoreCount > 0 && (
                <p className="text-center text-xs text-muted-foreground mt-4">
                  {noScoreCount} simulation{noScoreCount > 1 ? "s" : ""} in draft status
                </p>
              )}
              {goCount + reviseCount + stopCount === 0 && noScoreCount === 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  Run an analysis to see your score distribution.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}