import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, AlertTriangle, Shield, TrendingUp, CheckCircle, HelpCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useSimulation } from "@/context/simulation-context";
import { cn } from "@/lib/utils";

export default function DecisionBrief() {
  const navigate = useNavigate();
  const { state } = useSimulation();
  const { currentAnalysis, currentSimulation, isDemo } = state;

  if (!currentAnalysis || !currentSimulation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in no-print">
        <div className="h-12 w-12 text-muted-foreground/40 mb-4 flex items-center justify-center rounded-full bg-secondary">
          <span className="text-lg">?</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">No decision brief available</h2>
        <p className="text-muted-foreground mb-6">
          Complete the full workflow to generate a decision brief.
        </p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const { findings, nodes, safeguards, brief } = currentAnalysis;

  // Find the strongest failure chain
  const strongestChain = useMemo(() => {
    const hasParent = new Set<string>();
    for (const n of nodes) {
      for (const linked of n.linkedTo) hasParent.add(linked);
    }
    const roots = nodes.filter((n: any) => !hasParent.has(n.id) && (n.type === "assumption" || n.type === "risk"));
    
    const buildChain = (startId: string, visited = new Set<string>()): any[] => {
      if (visited.has(startId)) return [];
      visited.add(startId);
      const node = nodes.find((n: any) => n.id === startId);
      if (!node) return [];
      const chain = [node];
      for (const linkedId of node.linkedTo) {
        chain.push(...buildChain(linkedId, visited));
      }
      return chain;
    };

    let best: any[] = [];
    for (const root of roots) {
      const chain = buildChain(root.id);
      if (chain.length > best.length) best = chain;
    }
    return best.length > 1 ? best : null;
  }, [nodes]);

  const getRecColor = (rec: string) => {
    if (rec === "go") return "border-go";
    if (rec === "revise") return "border-revise";
    return "border-stop";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Print controls */}
      <div className="flex items-center justify-between no-print">
        <Button variant="outline" onClick={() => navigate("/decision")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Decision Room
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Brief content */}
      <div className="print-bg-white print-text-black space-y-6" id="decision-brief-content">
        {/* Title */}
        <div className="text-center space-y-2 pb-4 border-b-2 border-foreground/10">
          <h1 className="text-3xl font-bold">FailureTwin AI — Decision Brief</h1>
          <p className="text-muted-foreground text-sm">
            This is a structured decision-support brief, not a guarantee.
          </p>
        </div>

        {/* Executive Summary */}
        <Card className={cn("border-2", getRecColor(brief.recommendation))}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              Executive Summary
              <Badge variant={brief.recommendation === "go" ? "go" : brief.recommendation === "revise" ? "revise" : "stop"} className="ml-auto">
                {brief.recommendation === "go" ? "Go" : brief.recommendation === "revise" ? "Revise" : "Stop"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{brief.summary}</p>
          </CardContent>
        </Card>

        {/* Original Plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Original Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="font-semibold">Title:</span> {currentSimulation.title}</div>
            <div><span className="font-semibold">Description:</span> {currentSimulation.description}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><span className="font-semibold">Target User:</span> {currentSimulation.targetUser || "Not specified"}</div>
              <div><span className="font-semibold">Expected Outcome:</span> {currentSimulation.expectedOutcome || "Not specified"}</div>
              <div><span className="font-semibold">Budget:</span> {currentSimulation.budget || "Not specified"}</div>
              <div><span className="font-semibold">Deadline:</span> {currentSimulation.deadline || "Not specified"}</div>
              <div><span className="font-semibold">Industry:</span> {currentSimulation.industry || "Not specified"}</div>
              <div><span className="font-semibold">Risk Tolerance:</span> <span className="capitalize">{currentSimulation.riskTolerance}</span></div>
            </div>
            {currentSimulation.constraints.length > 0 && (
              <div>
                <span className="font-semibold">Key Constraints:</span>
                <ul className="list-disc list-inside ml-2 mt-1 text-xs text-muted-foreground">
                  {currentSimulation.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendation & Score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recommendation &amp; Readiness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
              <div className={cn("text-5xl font-bold", brief.readinessScore >= 75 ? "text-go" : brief.readinessScore >= 45 ? "text-revise" : "text-stop")}>
                {brief.readinessScore}
              </div>
              <Badge variant={brief.recommendation === "go" ? "go" : brief.recommendation === "revise" ? "revise" : "stop"} className="text-sm px-4 py-1.5">
                {brief.recommendation === "go" ? "Go" : brief.recommendation === "revise" ? "Revise" : "Stop"}
              </Badge>
            </div>

            <h4 className="text-sm font-semibold mb-3">Five-Part Score Breakdown</h4>
            <div className="space-y-2">
              {[
                { label: "Customer Readiness", value: brief.scoreBreakdown.customerReadiness, weight: "25%" },
                { label: "Operations Feasibility", value: brief.scoreBreakdown.operationsFeasibility, weight: "20%" },
                { label: "Financial Viability", value: brief.scoreBreakdown.financialViability, weight: "20%" },
                { label: "Risk Posture", value: brief.scoreBreakdown.riskPosture, weight: "20%" },
                { label: "Evidence Quality", value: brief.scoreBreakdown.evidenceQuality, weight: "15%" },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{b.label}</span>
                    <span>{b.value}/100 ({b.weight})</span>
                  </div>
                  <Progress value={b.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Perspective Summaries */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Perspective Summaries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {findings.map((f) => (
              <Card key={f.perspective} className="print-break-inside-avoid">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm capitalize">{f.perspective}</CardTitle>
                    <Badge variant={f.score >= 75 ? "go" : f.score >= 45 ? "revise" : "stop"} className="text-[10px]">
                      {f.score}/100
                    </Badge>
                  </div>
                  <CardDescription>Confidence: <span className="capitalize">{f.confidence}</span></CardDescription>
                </CardHeader>
                <CardContent className="py-2 text-xs space-y-2">
                  <div><span className="font-semibold">Key Objection:</span> {f.objection}</div>
                  {f.topRisks.length > 0 && (
                    <div>
                      <span className="font-semibold">Top Risks:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 text-muted-foreground">
                        {f.topRisks.map((r, i) => <li key={i}>{r.title} <Badge variant={r.severity === "critical" ? "destructive" : "revise"} className="text-[9px] px-1 py-0">{r.severity}</Badge></li>)}
                      </ul>
                    </div>
                  )}
                  {f.evidenceGaps.length > 0 && (
                    <div>
                      <span className="font-semibold">Evidence Gaps:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 text-muted-foreground">
                        {f.evidenceGaps.map((g, i) => <li key={i}>{g}</li>)}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Risks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-stop" />
              Top Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {brief.topRisks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No significant risks identified.</p>
              ) : (
                brief.topRisks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", r.severity === "critical" ? "text-stop" : "text-revise")} />
                    <div>
                      <span className="font-medium">{r.title}</span>
                      <Badge variant={r.severity === "critical" ? "destructive" : "revise"} className="ml-2 text-[10px]">{r.severity}</Badge>
                      <p className="text-muted-foreground text-xs mt-0.5">{r.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Strongest Failure Chain */}
        {strongestChain && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-revise" />
                Strongest Failure Chain
              </CardTitle>
              <CardDescription>The most connected risk pathway in your plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strongestChain.map((node, i) => (
                  <div key={node.id} className="flex items-start gap-2 text-sm">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        node.type === "assumption" && "bg-intel-bg text-intel",
                        node.type === "risk" && "bg-revise-bg text-revise",
                        node.type === "consequence" && "bg-stop-bg text-stop",
                        node.type === "safeguard" && "bg-go-bg text-go",
                        node.type === "evidence-gap" && "bg-secondary text-muted-foreground",
                      )}>
                        {i + 1}
                      </div>
                      {i < strongestChain.length - 1 && <div className="w-px h-4 bg-border" />}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-xs">{node.label}</span>
                        <Badge variant={node.severity === "critical" ? "destructive" : node.severity === "high" ? "revise" : "intel"} className="text-[9px] px-1 py-0">{node.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{node.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accepted Safeguards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-go" />
              Accepted Safeguards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brief.acceptedSafeguards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No safeguards accepted yet.</p>
            ) : (
              <div className="space-y-2">
                {brief.acceptedSafeguards.map((sg) => (
                  <div key={sg.id} className="flex items-start gap-2 text-sm p-2 bg-go-bg/20 rounded-lg border border-go/20">
                    <div className="w-2 h-2 rounded-full bg-go mt-2 shrink-0" />
                    <div>
                      <span className="font-medium">{sg.title}</span>
                      <p className="text-xs text-muted-foreground">
                        Effort: <span className="font-medium capitalize">{sg.effort}</span>
                        {" · "}Impact: <span className="font-medium capitalize">{sg.impact}</span>
                        {" · "}Score: <span className="font-medium text-go">+{sg.scoreDelta}</span>
                      </p>
                      {sg.notes && <p className="text-xs text-muted-foreground italic mt-1">Note: {sg.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evidence Gaps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-revise" />
              Open Evidence Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brief.openEvidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No significant evidence gaps identified.</p>
            ) : (
              <ul className="space-y-1.5">
                {brief.openEvidence.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-revise mt-1.5 shrink-0">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 72-hour plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Next 72 Hours — Prioritized Actions
            </CardTitle>
            <CardDescription>Immediate steps to strengthen your plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {brief.next72Hours.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Failure Chain Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Failure Chain Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-intel">{nodes.filter(n => n.type === "assumption").length}</div>
                <div className="text-muted-foreground">Assumptions</div>
              </div>
              <div>
                <div className="text-lg font-bold text-revise">{nodes.filter(n => n.type === "risk").length}</div>
                <div className="text-muted-foreground">Risks</div>
              </div>
              <div>
                <div className="text-lg font-bold text-stop">{nodes.filter(n => n.type === "consequence").length}</div>
                <div className="text-muted-foreground">Consequences</div>
              </div>
              <div>
                <div className="text-lg font-bold text-go">{nodes.filter(n => n.type === "safeguard").length}</div>
                <div className="text-muted-foreground">Safeguards</div>
              </div>
              <div className="col-span-3 md:col-span-1">
                <div className="text-lg font-bold text-muted-foreground">{nodes.filter(n => n.type === "evidence-gap").length}</div>
                <div className="text-muted-foreground">Evidence Gaps</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground border-t border-border pt-4 mt-6">
          <p className="font-medium">This is a structured decision-support brief, not a guarantee.</p>
          <p className="mt-1">Generated by FailureTwin AI. All analysis is based on the information provided and deterministic fallback rules. Decisions should be made with full team context and domain expertise.</p>
        </div>
      </div>
    </div>
  );
}