import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertTriangle, Users, Cog, DollarSign, Shield, Lightbulb, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSimulation } from "@/context/simulation-context";
import { cn } from "@/lib/utils";
import type { AgentFinding } from "@/lib/analysis/types";

const perspectiveMeta: Record<string, { icon: typeof Users; color: string; label: string }> = {
  customer: { icon: Users, color: "text-customer", label: "Customer" },
  operations: { icon: Cog, color: "text-operations", label: "Operations" },
  finance: { icon: DollarSign, color: "text-finance", label: "Finance" },
  risk: { icon: Shield, color: "text-risk", label: "Risk" },
};

function AgentCard({ finding }: { finding: AgentFinding }) {
  const meta = perspectiveMeta[finding.perspective];
  const Icon = meta.icon;

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-go";
    if (score >= 45) return "text-revise";
    return "text-stop";
  };

  const getCircularGradient = (score: number) => {
    const pct = Math.min(100, Math.max(0, score));
    const angle = (pct / 100) * 360;
    if (pct >= 75) return `conic-gradient(var(--color-go) ${angle}deg, var(--color-secondary) ${angle}deg)`;
    if (pct >= 45) return `conic-gradient(var(--color-revise) ${angle}deg, var(--color-secondary) ${angle}deg)`;
    return `conic-gradient(var(--color-stop) ${angle}deg, var(--color-secondary) ${angle}deg)`;
  };

  const getConfidenceColor = (c: string) => {
    if (c === "high") return "text-go";
    if (c === "medium") return "text-revise";
    return "text-stop";
  };

  const getSeverityBadge = (severity: string) => {
    const map: Record<string, "destructive" | "revise" | "intel" | "go"> = {
      critical: "destructive",
      high: "revise",
      medium: "intel",
      low: "go",
    };
    return map[severity] || "secondary";
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg bg-secondary", meta.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{meta.label}</CardTitle>
              <CardDescription>Perspective</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: getCircularGradient(finding.score) }}
            >
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                <span className={cn("text-sm font-bold", getScoreColor(finding.score))}>
                  {finding.score}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Confidence:</span>
          <span className={cn("font-medium capitalize", getConfidenceColor(finding.confidence))}>
            {finding.confidence}
          </span>
        </div>

        {/* Why this score */}
        <div className="bg-secondary/30 rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">Why {finding.score}/100?</span>{' '}
            {finding.objection}
          </p>
        </div>

        {/* Top Risks */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Risks</h4>
          {finding.topRisks.map((risk, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle className={cn(
                "h-4 w-4 mt-0.5 shrink-0",
                risk.severity === "critical" && "text-stop",
                risk.severity === "high" && "text-revise",
                risk.severity === "medium" && "text-intel",
                risk.severity === "low" && "text-go"
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{risk.title}</span>
                  <Badge variant={getSeverityBadge(risk.severity)} className="shrink-0 text-[10px] px-1.5 py-0">
                    {risk.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{risk.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Evidence Gaps */}
        {finding.evidenceGaps.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              Evidence Gaps
            </h4>
            {finding.evidenceGaps.map((gap, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-1">• {gap}</p>
            ))}
          </div>
        )}

        <Separator />

        {/* Suggested Safeguard */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Suggested Safeguard
          </h4>
          <p className="text-sm text-foreground">{finding.suggestedSafeguard}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ContradictionAlert({ findings }: { findings: AgentFinding[] }) {
  const contradictions: { agent1: string; agent2: string; issue: string }[] = [];

  // Check Finance vs Operations conflict on timeline
  const finance = findings.find((f) => f.perspective === "finance");
  const ops = findings.find((f) => f.perspective === "operations");
  if (finance && ops && finance.score < 60 && ops.score < 60) {
    contradictions.push({
      agent1: "Finance",
      agent2: "Operations",
      issue: "Both agree the project is under-resourced, but Finance blames scope while Operations blames timeline.",
    });
  }

  // Check Customer vs Risk on human escalation
  const customer = findings.find((f) => f.perspective === "customer");
  const risk = findings.find((f) => f.perspective === "risk");
  if (customer && risk && customer.score < 45 && risk.score < 45) {
    contradictions.push({
      agent1: "Customer",
      agent2: "Risk",
      issue: "Both flag critical concerns, but Customer focuses on trust/brand while Risk focuses on governance/compliance — different mitigations needed.",
    });
  }

  if (contradictions.length === 0) return null;

  return (
    <Card className="border-revise/50 bg-revise-bg/10">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <XCircle className="h-5 w-5 text-revise" />
          Agent Contradictions
        </CardTitle>
        <CardDescription>
          The specialist agents disagree on key aspects of your plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {contradictions.map((c, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <div className="flex items-center gap-1 text-xs font-medium shrink-0">
              <span className="text-customer">{c.agent1}</span>
              <span className="text-muted-foreground">vs</span>
              <span className="text-risk">{c.agent2}</span>
            </div>
            <p className="text-muted-foreground">{c.issue}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AnalysisRoom() {
  const navigate = useNavigate();
  const { state } = useSimulation();
  const { currentAnalysis, currentSimulation, isDemo } = state;

  if (!currentAnalysis || !currentSimulation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <HelpCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No analysis data</h2>
        <p className="text-muted-foreground mb-6">
          Create a simulation or run the guided demo to see analysis results.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/new")}>Create Simulation</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { findings, brief } = currentAnalysis;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analysis Results</h1>
          <p className="text-muted-foreground">
            {currentSimulation.title}
            {isDemo && <Badge variant="intel" className="ml-2">Demo</Badge>}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Readiness Score</div>
          <div className="text-3xl font-bold">{brief.readinessScore}</div>
        </div>
      </div>

      {/* Contradictions */}
      <ContradictionAlert findings={findings} />

      {/* Agent Cards in 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {findings.map((f) => (
          <AgentCard key={f.perspective} finding={f} />
        ))}
      </div>

      {/* Evidence Gap Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence Gap Summary</CardTitle>
          <CardDescription>
            Missing information that would strengthen the analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {brief.openEvidence.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No significant evidence gaps identified.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {brief.openEvidence.map((gap, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <HelpCircle className="h-4 w-4 text-revise mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{gap}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/follow-up")}>
          Back to Management Plan
        </Button>
        <Button onClick={() => navigate("/failure-chain")}>
          View Failure Chains
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}