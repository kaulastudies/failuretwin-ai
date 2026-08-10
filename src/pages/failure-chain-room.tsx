import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, HelpCircle, Target, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSimulation } from "@/context/simulation-context";
import { cn } from "@/lib/utils";
import type { FailureNode, Safeguard } from "@/lib/analysis/types";

const nodeStyles: Record<string, { bg: string; border: string; icon: typeof AlertTriangle; label: string }> = {
  assumption: { bg: "bg-intel-bg", border: "border-intel", icon: Target, label: "Assumption" },
  risk: { bg: "bg-revise-bg", border: "border-revise", icon: AlertTriangle, label: "Risk" },
  consequence: { bg: "bg-stop-bg", border: "border-stop", icon: Shield, label: "Consequence" },
  safeguard: { bg: "bg-go-bg", border: "border-go", icon: Lightbulb, label: "Safeguard" },
  "evidence-gap": { bg: "bg-secondary", border: "border-muted-foreground", icon: HelpCircle, label: "Evidence Gap" },
};

function FailureNodeCard({ node, expanded, onToggle, depth }: { node: FailureNode; expanded: boolean; onToggle: () => void; depth: number }) {
  const style = nodeStyles[node.type];
  const NodeIcon = style.icon;

  const getSeverityColor = () => {
    if (node.severity === "critical") return "text-stop";
    if (node.severity === "high") return "text-revise";
    if (node.severity === "medium") return "text-intel";
    return "text-go";
  };

  const getStateBadge = () => {
    if (node.state === "mitigated") return <Badge variant="go">Mitigated</Badge>;
    if (node.state === "accepted") return <Badge variant="revise">Accepted</Badge>;
    return <Badge variant="stop">Unresolved</Badge>;
  };

  const colorMap: Record<string, "destructive" | "revise" | "intel" | "go"> = {
    critical: "destructive",
    high: "revise",
    medium: "intel",
    low: "go",
  };

  return (
    <div className={cn("relative", depth > 0 && "ml-3 md:ml-4 border-l-2 border-border pl-3 md:pl-4")}>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          style.bg,
          style.border,
          expanded && "ring-2 ring-primary"
        )}
        onClick={onToggle}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <div className={cn("p-1.5 rounded-md shrink-0 mt-0.5", style.bg)}>
                <NodeIcon className={cn("h-3.5 w-3.5", getSeverityColor())} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={colorMap[node.severity] || "secondary"} className="text-[10px] px-1.5 py-0">
                    {node.severity}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{style.label}</Badge>
                  {node.state !== "unresolved" && getStateBadge()}
                </div>
                <CardTitle className="text-sm mt-1 leading-snug">{node.label}</CardTitle>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            )}
          </div>
        </CardHeader>
        {expanded && (
          <CardContent className="px-3 pb-3 pt-1 animate-fade-in">
            <p className="text-xs text-muted-foreground leading-relaxed">{node.detail}</p>
            {node.linkedTo.length > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowRight className="h-3 w-3" />
                <span>Leads to: {node.linkedTo.join(", ")}</span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function FailureChainRoom() {
  const navigate = useNavigate();
  const { state } = useSimulation();
  const { currentAnalysis, currentSimulation, isDemo } = state;
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Compute these unconditionally so hook count stays stable
  const nodes = currentAnalysis?.nodes ?? [];
  const safeguards = currentAnalysis?.safeguards ?? [];

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const byType = (type: string) => nodes.filter((n) => n.type === type);

  // Build connected chains with depth tracking
  const buildChain = (startId: string, visited = new Set<string>(), depth = 0): { node: FailureNode; depth: number }[] => {
    if (visited.has(startId)) return [];
    visited.add(startId);
    const node = nodes.find((n) => n.id === startId);
    if (!node) return [];
    const result: { node: FailureNode; depth: number }[] = [{ node, depth }];
    for (const linkedId of node.linkedTo) {
      result.push(...buildChain(linkedId, visited, depth + 1));
    }
    return result;
  };

  // Find root nodes (assumptions and orphaned evidence gaps)
  const rootNodes = useMemo(() => {
    const hasParent = new Set<string>();
    for (const n of nodes) {
      for (const linked of n.linkedTo) {
        hasParent.add(linked);
      }
    }
    return nodes.filter((n) => !hasParent.has(n.id) && (n.type === "assumption" || n.type === "risk"));
  }, [nodes]);

  // Find the longest chain for "strongest chain" indicator
  const longestChain = useMemo(() => {
    let best: { node: FailureNode; depth: number }[] = [];
    for (const root of rootNodes) {
      const chain = buildChain(root.id);
      if (chain.length > best.length) best = chain;
    }
    return best;
  }, [rootNodes]);

  // Map safeguards to their risk labels for traceability
  const safeguardRiskMap = useMemo(() => {
    const map = new Map<string, string>();
    if (safeguards && nodes) {
      for (const sg of safeguards) {
        const riskNode = nodes.find((n) => n.id === sg.riskId);
        if (riskNode) {
          map.set(sg.id, riskNode.label);
        }
      }
    }
    return map;
  }, [safeguards, nodes]);

  // Safeguard nodes from the safeguards array (for the safeguards section)
  const safeguardNodes = useMemo(() => {
    if (!safeguards) return [];
    return safeguards.map((sg, i) => ({
      id: sg.id,
      label: sg.title,
      riskLabel: safeguardRiskMap.get(sg.id) || "Unknown risk",
      effort: sg.effort,
      impact: sg.impact,
      accepted: sg.accepted,
      notes: sg.notes,
    }));
  }, [safeguards, safeguardRiskMap]);

  if (!currentAnalysis || !currentSimulation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <HelpCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No analysis data</h2>
        <p className="text-muted-foreground mb-6">
          Complete an analysis first to see failure chains.
        </p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Failure Chain Analysis</h1>
        <p className="text-muted-foreground">
          {currentSimulation.title}
          {isDemo && <Badge variant="intel" className="ml-2">Demo</Badge>}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(nodeStyles).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded-sm", val.bg, val.border, "border")} />
            <span className="text-muted-foreground">{val.label}</span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <div className="text-lg font-bold text-intel">{byType("assumption").length}</div>
            <div className="text-xs text-muted-foreground">Assumptions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <div className="text-lg font-bold text-revise">{byType("risk").length}</div>
            <div className="text-xs text-muted-foreground">Risks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <div className="text-lg font-bold text-stop">{byType("consequence").length}</div>
            <div className="text-xs text-muted-foreground">Consequences</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <div className="text-lg font-bold text-go">{byType("safeguard").length}</div>
            <div className="text-xs text-muted-foreground">Safeguards</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="py-3 text-center">
            <div className="text-lg font-bold text-muted-foreground">{byType("evidence-gap").length}</div>
            <div className="text-xs text-muted-foreground">Evidence Gaps</div>
          </CardContent>
        </Card>
      </div>

      {/* Strongest Chain */}
      {longestChain.length > 1 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3 flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Strongest Failure Chain</p>
              <p className="text-xs text-muted-foreground mt-1">
                {longestChain.length} nodes from "{longestChain[0]?.node.label}" to "{longestChain[longestChain.length - 1]?.node.label}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failure Chains */}
      <div className="space-y-8">
        {rootNodes.slice(0, 6).map((root) => {
          const chain = buildChain(root.id);
          return (
            <div key={root.id}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-intel" />
                Chain: {root.label}
              </h3>
              <div className="space-y-2">
                {chain.map(({ node, depth }) => (
                  <FailureNodeCard
                    key={node.id}
                    node={node}
                    expanded={expandedNodes.has(node.id)}
                    onToggle={() => toggleNode(node.id)}
                    depth={depth}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {rootNodes.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <HelpCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No failure chains to display.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Personalized Safeguards */}
      {safeguardNodes.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-4">Personalized Safeguards</h2>
            <div className="space-y-2">
              {safeguardNodes.map((sg) => (
                <Card key={sg.id} className={cn(sg.accepted && "border-go/30")}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-go shrink-0" />
                          <span className="text-sm font-medium">{sg.label}</span>
                          {sg.accepted && <Badge variant="go" className="text-[10px]">Accepted</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mitigates: <span className="text-foreground">{sg.riskLabel}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Effort: <span className="font-medium capitalize">{sg.effort}</span></span>
                          <span>Impact: <span className="font-medium capitalize">{sg.impact}</span></span>
                          {sg.notes && <span className="italic">— {sg.notes}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/analysis")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Analysis
        </Button>
        <Button onClick={() => navigate("/decision")}>
          Go to Decision Room
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}