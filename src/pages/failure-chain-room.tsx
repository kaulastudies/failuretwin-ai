import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, HelpCircle, Target, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSimulation } from "@/context/simulation-context";
import { cn } from "@/lib/utils";
import type { FailureNode } from "@/lib/analysis/types";

const nodeStyles: Record<string, { bg: string; border: string; icon: typeof AlertTriangle; label: string }> = {
  assumption: { bg: "bg-intel-bg", border: "border-intel", icon: Target, label: "Assumption" },
  risk: { bg: "bg-revise-bg", border: "border-revise", icon: AlertTriangle, label: "Risk" },
  consequence: { bg: "bg-stop-bg", border: "border-stop", icon: Shield, label: "Consequence" },
  safeguard: { bg: "bg-go-bg", border: "border-go", icon: Lightbulb, label: "Safeguard" },
  "evidence-gap": { bg: "bg-secondary", border: "border-muted-foreground", icon: HelpCircle, label: "Evidence Gap" },
};

function FailureNodeCard({ node, expanded, onToggle }: { node: FailureNode; expanded: boolean; onToggle: () => void }) {
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
    <div className="relative">
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          style.bg,
          style.border,
          expanded && "ring-2 ring-primary"
        )}
        onClick={onToggle}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-md", style.bg)}>
                <NodeIcon className={cn("h-4 w-4", getSeverityColor())} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={colorMap[node.severity] || "secondary"} className="text-[10px] px-1.5 py-0">
                    {node.severity}
                  </Badge>
                  {getStateBadge()}
                </div>
                <CardTitle className="text-sm mt-1">{node.label}</CardTitle>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>
        </CardHeader>
        {expanded && (
          <CardContent className="p-4 pt-2 animate-fade-in">
            <p className="text-sm text-muted-foreground">{node.detail}</p>
            {node.linkedTo.length > 0 && (
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowRight className="h-3 w-3" />
                <span>Leads to: {node.linkedTo.join(", ")}</span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
      {/* Connector line */}
      {node.linkedTo.length > 0 && (
        <div className="hidden md:flex absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="w-px h-4 bg-border" />
          <ArrowRight className="h-3 w-3 text-muted-foreground absolute -right-3 top-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
}

export default function FailureChainRoom() {
  const navigate = useNavigate();
  const { state } = useSimulation();
  const { currentAnalysis, currentSimulation, isDemo } = state;

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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

  const { nodes } = currentAnalysis;

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group nodes by type for filtering
  const byType = (type: string) => nodes.filter((n) => n.type === type);

  // Build connected chains
  const buildChain = (startId: string, visited = new Set<string>()): FailureNode[] => {
    if (visited.has(startId)) return [];
    visited.add(startId);
    const node = nodes.find((n) => n.id === startId);
    if (!node) return [];
    const chain = [node];
    for (const linkedId of node.linkedTo) {
      chain.push(...buildChain(linkedId, visited));
    }
    return chain;
  };

  const rootNodes = nodes.filter((n) =>
    n.type === "assumption" || (n.type === "evidence-gap" && !nodes.some((x) => x.linkedTo.includes(n.id)))
  );

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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chain Summary</CardTitle>
          <CardDescription>
            {nodes.length} nodes identified across {rootNodes.length} root causes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-intel">{byType("assumption").length}</div>
              <div className="text-xs text-muted-foreground">Assumptions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-revise">{byType("risk").length}</div>
              <div className="text-xs text-muted-foreground">Risks</div>
            </div>
            <div>
              <div className="text-lg font-bold text-stop">{byType("consequence").length}</div>
              <div className="text-xs text-muted-foreground">Consequences</div>
            </div>
            <div>
              <div className="text-lg font-bold text-go">{byType("safeguard").length}</div>
              <div className="text-xs text-muted-foreground">Safeguards</div>
            </div>
            <div>
              <div className="text-lg font-bold text-muted-foreground">{byType("evidence-gap").length}</div>
              <div className="text-xs text-muted-foreground">Evidence Gaps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failure Chains */}
      <div className="space-y-8">
        {rootNodes.slice(0, 6).map((root) => {
          const chain = buildChain(root.id);
          return (
            <div key={root.id}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Chain starting from: {root.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {chain.map((node) => (
                  <FailureNodeCard
                    key={node.id}
                    node={node}
                    expanded={expandedNodes.has(node.id)}
                    onToggle={() => toggleNode(node.id)}
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