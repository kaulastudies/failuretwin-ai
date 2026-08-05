import { useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, AlertTriangle } from "lucide-react";
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
      <div className="print-bg-white print-text-black space-y-6">
        {/* Title */}
        <div className="text-center space-y-2 pb-4 border-b-2 border-foreground/10">
          <h1 className="text-2xl font-bold">FailureTwin AI — Decision Brief</h1>
          <p className="text-muted-foreground text-sm">
            This is a structured decision-support brief, not a guarantee.
          </p>
        </div>

        {/* Executive Summary */}
        <Card className={cn("border-2", brief.recommendation === "go" ? "border-go" : brief.recommendation === "revise" ? "border-revise" : "border-stop")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Executive Summary
              <Badge variant={brief.recommendation === "go" ? "go" : brief.recommendation === "revise" ? "revise" : "stop"} className="ml-2">
                {brief.recommendation === "go" ? "Go" : brief.recommendation === "revise" ? "Revise" : "Stop"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{brief.summary}</p>
          </CardContent>
        </Card>

        {/* Original Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Original Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="font-semibold">Title:</span> {currentSimulation.title}</div>
            <div><span className="font-semibold">Description:</span> {currentSimulation.description}</div>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="font-semibold">Target User:</span> {currentSimulation.targetUser || "Not specified"}</div>
              <div><span className="font-semibold">Expected Outcome:</span> {currentSimulation.expectedOutcome || "Not specified"}</div>
              <div><span className="font-semibold">Budget:</span> {currentSimulation.budget || "Not specified"}</div>
              <div><span className="font-semibold">Deadline:</span> {currentSimulation.deadline || "Not specified"}</div>
              <div><span className="font-semibold">Industry:</span> {currentSimulation.industry || "Not specified"}</div>
              <div><span className="font-semibold">Risk Tolerance:</span> <span className="capitalize">{currentSimulation.riskTolerance}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation & Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendation & Readiness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
              <div className={cn("text-5xl font-bold", brief.readinessScore >= 70 ? "text-go" : brief.readinessScore >= 45 ? "text-revise" : "text-stop")}>
                {brief.readinessScore}
              </div>
              <Badge variant={brief.recommendation === "go" ? "go" : brief.recommendation === "revise" ? "revise" : "stop"} className="text-sm">
                {brief.recommendation === "go" ? "Go" : brief.recommendation === "revise" ? "Revise" : "Stop"}
              </Badge>
            </div>

            <h4 className="text-sm font-semibold mb-2">Score Breakdown</h4>
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

        {/* Agent Findings */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Agent Findings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {findings.map((f) => (
              <Card key={f.perspective} className="print-break-inside-avoid">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm capitalize">{f.perspective} Perspective</CardTitle>
                  <CardDescription>Score: {f.score}/100 · Confidence: <span className="capitalize">{f.confidence}</span></CardDescription>
                </CardHeader>
                <CardContent className="py-2 text-xs space-y-2">
                  <div><span className="font-semibold">Objection:</span> {f.objection}</div>
                  {f.topRisks.length > 0 && (
                    <div>
                      <span className="font-semibold">Top Risks:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {f.topRisks.map((r, i) => <li key={i}>{r.title} ({r.severity})</li>)}
                      </ul>
                    </div>
                  )}
                  {f.evidenceGaps.length > 0 && (
                    <div>
                      <span className="font-semibold">Evidence Gaps:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
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
          <CardHeader>
            <CardTitle className="text-base">Top Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {brief.topRisks.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", r.severity === "critical" ? "text-stop" : "text-revise")} />
                  <div>
                    <span className="font-medium">{r.title}</span>
                    <Badge variant={r.severity === "critical" ? "destructive" : "revise"} className="ml-2 text-[10px]">{r.severity}</Badge>
                    <p className="text-muted-foreground text-xs">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Failure Chain Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Failure Chain Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
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
              <div>
                <div className="text-lg font-bold text-muted-foreground">{nodes.filter(n => n.type === "evidence-gap").length}</div>
                <div className="text-muted-foreground">Evidence Gaps</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accepted Safeguards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accepted Safeguards</CardTitle>
          </CardHeader>
          <CardContent>
            {brief.acceptedSafeguards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No safeguards accepted yet.</p>
            ) : (
              <div className="space-y-2">
                {brief.acceptedSafeguards.map((sg) => (
                  <div key={sg.id} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-go mt-2 shrink-0" />
                    <div>
                      <span className="font-medium">{sg.title}</span>
                      <p className="text-xs text-muted-foreground">Effort: {sg.effort} · Impact: {sg.impact} · Delta: +{sg.scoreDelta}</p>
                      {sg.notes && <p className="text-xs text-muted-foreground italic">{sg.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evidence Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Evidence Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            {brief.openEvidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No significant evidence gaps identified.</p>
            ) : (
              <ul className="space-y-1">
                {brief.openEvidence.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-revise mt-1">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 72-hour plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">72-Hour Action Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {brief.next72Hours.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-medium text-muted-foreground shrink-0">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground border-t border-border pt-4 mt-6">
          <p className="font-medium">This is a structured decision-support brief, not a guarantee.</p>
          <p className="mt-1">Generated by FailureTwin AI. All analysis is based on the information provided and deterministic fallback rules.</p>
        </div>
      </div>
    </div>
  );
}