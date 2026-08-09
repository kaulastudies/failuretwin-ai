import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X, Edit3, AlertTriangle, Clock, FileText, HelpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSimulation } from "@/context/simulation-context";
import { recalculateScore } from "@/lib/scoring";
import { saveAnalysisData } from "@/lib/local-storage";
import { cn } from "@/lib/utils";
import type { Safeguard, DecisionBrief, AnalysisResult } from "@/lib/analysis/types";

export default function DecisionRoom() {
  const navigate = useNavigate();
  const { state, dispatch } = useSimulation();
  const { currentAnalysis, currentSimulation, isDemo } = state;

  // Immutable baseline brief — the score captured when the analysis was first
  // created. The current score is always derived from this baseline plus the
  // accepted safeguard deltas, so toggling never drifts or accumulates.
  const originalBrief = useRef<DecisionBrief | null>(currentAnalysis?.brief ?? null).current;

  const [localSafeguards, setLocalSafeguards] = useState<Safeguard[]>(
    currentAnalysis?.safeguards?.map((s) => ({ ...s })) || []
  );
  const [editingSafeguard, setEditingSafeguard] = useState<Safeguard | null>(null);
  const [editNotes, setEditNotes] = useState("");

  // Mirror of localSafeguards so rapid consecutive toggles always start from the
  // latest state instead of a stale render closure.
  const safeguardsRef = useRef(localSafeguards);
  useEffect(() => {
    safeguardsRef.current = localSafeguards;
  }, [localSafeguards]);

  // Single source of truth: score + recommendation are derived from the
  // immutable baseline and the current safeguard acceptances.
  const localBrief = useMemo<DecisionBrief | null>(
    () => (originalBrief ? recalculateScore(originalBrief, localSafeguards) : null),
    [originalBrief, localSafeguards]
  );

  if (!currentAnalysis || !currentSimulation || !localBrief) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <HelpCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No decision data</h2>
        <p className="text-muted-foreground mb-6">
          Complete an analysis first to see the decision room.
        </p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  // Persist decisions to context + localStorage so they survive a refresh and
  // propagate to the Decision Brief. Recomputes from the immutable baseline.
  const persistDecision = (updated: Safeguard[]) => {
    if (!currentAnalysis || !currentSimulation || !originalBrief) return;
    const updatedBrief = recalculateScore(originalBrief, updated);
    const updatedAnalysis: AnalysisResult = {
      ...currentAnalysis,
      safeguards: updated,
      brief: updatedBrief,
    };
    dispatch({ type: "SET_ANALYSIS", analysis: updatedAnalysis });
    saveAnalysisData(currentSimulation.id, updatedAnalysis);
  };

  const toggleSafeguard = (id: string) => {
    const updated = safeguardsRef.current.map((s) =>
      s.id === id ? { ...s, accepted: !s.accepted } : s
    );
    safeguardsRef.current = updated;
    setLocalSafeguards(updated);
    persistDecision(updated);
  };

  const openEditDialog = (safeguard: Safeguard) => {
    setEditingSafeguard(safeguard);
    setEditNotes(safeguard.notes);
  };

  const saveEdit = () => {
    if (!editingSafeguard) return;
    const updated = safeguardsRef.current.map((s) =>
      s.id === editingSafeguard.id ? { ...s, notes: editNotes } : s
    );
    safeguardsRef.current = updated;
    setLocalSafeguards(updated);
    setEditingSafeguard(null);
    setEditNotes("");
    persistDecision(updated);
  };

  const getRecommendationDisplay = (rec: string) => {
    switch (rec) {
      case "go":
        return { label: "Go", variant: "go" as const, icon: TrendingUp, desc: "Ready to proceed with recommended safeguards" };
      case "revise":
        return { label: "Revise", variant: "revise" as const, icon: TrendingDown, desc: "Address key risks before proceeding" };
      case "stop":
        return { label: "Stop", variant: "stop" as const, icon: AlertTriangle, desc: "Critical blockers must be resolved first" };
      default:
        return { label: "Unknown", variant: "default" as const, icon: HelpCircle, desc: "" };
    }
  };

  const recDisplay = getRecommendationDisplay(localBrief.recommendation);
  const RecIcon = recDisplay.icon;

  const hasCriticalUnresolved = localBrief.topRisks.some((r) => r.severity === "critical");
  const initialScore = currentAnalysis.brief.readinessScore;
  const scoreChange = localBrief.readinessScore - initialScore;

  const breakdowns = [
    { label: "Customer Readiness", value: localBrief.scoreBreakdown.customerReadiness, weight: "25%" },
    { label: "Operations Feasibility", value: localBrief.scoreBreakdown.operationsFeasibility, weight: "20%" },
    { label: "Financial Viability", value: localBrief.scoreBreakdown.financialViability, weight: "20%" },
    { label: "Risk Posture", value: localBrief.scoreBreakdown.riskPosture, weight: "20%" },
    { label: "Evidence Quality", value: localBrief.scoreBreakdown.evidenceQuality, weight: "15%" },
  ];

  const scoreColor = () => {
    if (localBrief.readinessScore >= 75) return "text-go";
    if (localBrief.readinessScore >= 45) return "text-revise";
    return "text-stop";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Decision Room</h1>
        <p className="text-muted-foreground">
          {currentSimulation.title}
          {isDemo && <Badge variant="intel" className="ml-2">Demo</Badge>}
        </p>
      </div>

      {/* Critical Risk Warning */}
      {hasCriticalUnresolved && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Critical Unresolved Risks</p>
              <p className="text-sm text-muted-foreground">
                Some critical risks remain unmitigated. Consider accepting safeguards that address these risks before proceeding.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score + Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Readiness Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={cn("text-5xl font-bold mb-2", scoreColor())}>
              {localBrief.readinessScore}
            </div>
            <Badge variant={recDisplay.variant} className="text-sm px-3 py-1">
              <RecIcon className="h-4 w-4 mr-1" />
              {recDisplay.label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">{recDisplay.desc}</p>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdowns.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{b.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{b.value}</span>
                    <span className="text-muted-foreground text-xs">{b.weight}</span>
                  </div>
                </div>
                <Progress value={b.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Before/After Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score Comparison</CardTitle>
          <CardDescription>How your score changes as you accept safeguards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Initial</div>
              <div className={cn("text-2xl font-bold", initialScore >= 75 ? "text-go" : initialScore >= 45 ? "text-revise" : "text-stop")}>{initialScore}</div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Current</div>
              <div className={cn("text-2xl font-bold", scoreColor())}>{localBrief.readinessScore}</div>
            </div>
            {scoreChange !== 0 && (
              <div className={cn("text-sm font-medium", scoreChange > 0 ? "text-go" : "text-stop")}>
                {scoreChange > 0 ? "+" : ""}{scoreChange}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Safeguards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Safeguards</h2>
        <div className="space-y-3">
          {localSafeguards.map((sg) => (
            <Card key={sg.id} className={cn(sg.accepted && "border-go/50")}>
              <CardContent className="flex items-start justify-between py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{sg.title}</span>
                    {sg.accepted && <Badge variant="go">Accepted</Badge>}
                    {!sg.accepted && <Badge variant="outline">Pending</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Effort: <span className="font-medium capitalize">{sg.effort}</span></span>
                    <span>Impact: <span className="font-medium capitalize">{sg.impact}</span></span>
                    <span>Score delta: <span className="font-medium text-go">+{sg.scoreDelta}</span></span>
                  </div>
                  {sg.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{sg.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(sg)}
                    className="h-8 w-8"
                    aria-label="Edit notes"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={sg.accepted ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleSafeguard(sg.id)}
                    className="h-8"
                  >
                    {sg.accepted ? (
                      <>
                        <X className="h-4 w-4" />
                        Reject
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Accept
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* 72-Hour Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Next 72 Hours — Action Plan
          </CardTitle>
          <CardDescription>
            Prioritised checklist to move your plan forward.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {localBrief.next72Hours.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-medium text-muted-foreground shrink-0">
                  {i + 1}
                </div>
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/failure-chain")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Chains
        </Button>
        <Button onClick={() => navigate("/brief")}>
          View Decision Brief
          <FileText className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSafeguard} onOpenChange={() => setEditingSafeguard(null)}>
        <DialogHeader>
          <DialogTitle>Edit Safeguard Notes</DialogTitle>
          <DialogDescription>
            Add implementation notes for "{editingSafeguard?.title}"
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="Implementation details, owner, timeline..."
          className="min-h-[100px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingSafeguard(null)}>
            Cancel
          </Button>
          <Button onClick={saveEdit}>
            Save Notes
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}