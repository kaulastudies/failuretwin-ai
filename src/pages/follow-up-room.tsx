import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSimulation } from "@/context/simulation-context";
import { FallbackEngine } from "@/lib/analysis/fallback-engine";
import { saveAnalysisData } from "@/lib/local-storage";
import { cn } from "@/lib/utils";
import type { Simulation } from "@/lib/analysis/types";

const MP_STORAGE_KEY = "failuretwin_mp_draft";

interface ManagementPlanData {
  responsibleOwner: string;
  team: string;
  budgetDetail: string;
  deadlineDetail: string;
  milestones: string;
  dependencies: string;
  resources: string;
  constraints: string;
  existingSafeguards: string;
  successMeasurement: string;
  followUpAnswers: Record<string, string>;
  evidenceNotes: string;
}

interface FollowUpQuestion {
  id: string;
  question: string;
  context: string;
  field: keyof Simulation | string;
}

function generateQuestions(sim: Simulation): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];

  if (!sim.targetUser || sim.targetUser.length < 5) {
    questions.push({
      id: "q1",
      question: "Who exactly is this for?",
      context: "Tell us more about your target user or customer. Who will use this? What's their profile?",
      field: "targetUser",
    });
  }

  if (!sim.deadline || sim.deadline.includes("flexible") || sim.deadline.length < 3) {
    questions.push({
      id: "q2",
      question: "What's your timeline?",
      context: "Do you have a specific deadline? What's driving the timeline? Is there flexibility?",
      field: "deadline",
    });
  }

  if (!sim.budget || sim.budget.length < 5) {
    questions.push({
      id: "q3",
      question: "What budget do you have to work with?",
      context: "Approximately how much budget is allocated? Is this internal only, or do you have external funding?",
      field: "budget",
    });
  }

  if (!sim.industry || sim.industry.length < 3) {
    questions.push({
      id: "q4",
      question: "What industry or context are you operating in?",
      context: "Different industries have different risk profiles. Healthcare, finance, and legal have higher regulatory requirements.",
      field: "industry",
    });
  }

  if (sim.assumptions.length === 0) {
    questions.push({
      id: "q5",
      question: "What assumptions are you making?",
      context: "Every plan relies on assumptions. What do you believe to be true for this to succeed?",
      field: "assumptions",
    });
  }

  return questions;
}

function loadDraft(): ManagementPlanData | null {
  try {
    const raw = localStorage.getItem(MP_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDraft(data: ManagementPlanData): void {
  try {
    localStorage.setItem(MP_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(MP_STORAGE_KEY);
  } catch {
    // silently fail
  }
}

export default function ManagementPlanRoom() {
  const navigate = useNavigate();
  const { state, dispatch } = useSimulation();
  const { currentSimulation } = state;

  const [mpData, setMpData] = useState<ManagementPlanData>(() => {
    const draft = loadDraft();
    if (draft && currentSimulation) {
      return draft;
    }
    return {
      responsibleOwner: "",
      team: "",
      budgetDetail: "",
      deadlineDetail: "",
      milestones: "",
      dependencies: "",
      resources: "",
      constraints: "",
      existingSafeguards: "",
      successMeasurement: "",
      followUpAnswers: {},
      evidenceNotes: "",
    };
  });

  const [analyzing, setAnalyzing] = useState(false);

  // Auto-save to localStorage on changes
  useEffect(() => {
    saveDraft(mpData);
  }, [mpData]);

  if (!currentSimulation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Sparkles className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No plan selected</h2>
        <p className="text-muted-foreground mb-6">Start by creating a new plan.</p>
        <Button onClick={() => navigate("/new")}>Create Plan</Button>
      </div>
    );
  }

  const questions = generateQuestions(currentSimulation);

  const updateField = (field: keyof ManagementPlanData, value: string) => {
    setMpData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (id: string, value: string) => {
    setMpData((prev) => ({
      ...prev,
      followUpAnswers: { ...prev.followUpAnswers, [id]: value },
    }));
  };

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    clearDraft();

    // Merge answers back into simulation
    const updatedSim: Simulation = {
      ...currentSimulation,
      targetUser: mpData.followUpAnswers.q1 || currentSimulation.targetUser,
      deadline: mpData.followUpAnswers.q2 || currentSimulation.deadline,
      budget: mpData.followUpAnswers.q3 || currentSimulation.budget,
      industry: mpData.followUpAnswers.q4 || currentSimulation.industry,
      assumptions: mpData.followUpAnswers.q5
        ? mpData.followUpAnswers.q5.split("\n").filter((l) => l.trim())
        : currentSimulation.assumptions,
      // Append management plan context to description
      description: [
        currentSimulation.description,
        mpData.responsibleOwner && `Responsible owner/team: ${mpData.responsibleOwner}`,
        mpData.milestones && `Key milestones: ${mpData.milestones}`,
        mpData.dependencies && `Dependencies: ${mpData.dependencies}`,
        mpData.resources && `Available resources: ${mpData.resources}`,
        mpData.existingSafeguards && `Existing safeguards: ${mpData.existingSafeguards}`,
        mpData.evidenceNotes && `Supporting evidence notes: ${mpData.evidenceNotes}`,
      ]
        .filter(Boolean)
        .join("\n"),
    };

    dispatch({ type: "UPDATE_SIMULATION", simulation: updatedSim });

    // Run analysis
    setTimeout(() => {
      const engine = new FallbackEngine();
      const result = engine.analyze(updatedSim);
      saveAnalysisData(updatedSim.id, result);
      dispatch({ type: "SET_ANALYSIS", analysis: result });

      const completedSim: Simulation = { ...updatedSim, status: "complete" };
      dispatch({ type: "UPDATE_SIMULATION", simulation: completedSim });

      navigate("/analysis");
    }, 1500);
  };

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="relative mb-8">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Analyzing Your Plan</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Running four specialist perspectives against your plan...
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-customer animate-pulse-glow" />
            Customer Perspective
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-operations animate-pulse-glow [animation-delay:0.3s]" />
            Operations Perspective
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-finance animate-pulse-glow [animation-delay:0.6s]" />
            Finance Perspective
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-risk animate-pulse-glow [animation-delay:0.9s]" />
            Risk Perspective
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Management Plan</h1>
        <p className="text-muted-foreground">
          For <strong className="text-foreground">"{currentSimulation.title}"</strong> —
          confirm the operational details so your analysis is grounded in reality.
        </p>
      </div>

      {/* Dynamic follow-up questions */}
      {questions.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Context Questions</h2>
            <Badge variant="intel">{questions.length} needed</Badge>
          </div>
          {questions.map((q) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-base">{q.question}</CardTitle>
                <CardDescription>{q.context}</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-[80px]"
                  value={mpData.followUpAnswers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                />
              </CardContent>
            </Card>
          ))}
          <Separator />
        </>
      )}

      {/* Management Plan fields */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Execution Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsible Owner / Team</label>
              <Input
                placeholder="e.g., Product team, Jane (PM)"
                value={mpData.responsibleOwner}
                onChange={(e) => updateField("responsibleOwner", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Size & Composition</label>
              <Input
                placeholder="e.g., 3 engineers, 1 designer"
                value={mpData.team}
                onChange={(e) => updateField("team", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Key Milestones</label>
            <Textarea
              placeholder="List the major milestones and their target dates (one per line)"
              className="min-h-[80px]"
              value={mpData.milestones}
              onChange={(e) => updateField("milestones", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dependencies</label>
              <Textarea
                placeholder="What needs to happen first? External dependencies?"
                className="min-h-[80px]"
                value={mpData.dependencies}
                onChange={(e) => updateField("dependencies", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Resources</label>
              <Textarea
                placeholder="Tools, budget, existing infrastructure, partners"
                className="min-h-[80px]"
                value={mpData.resources}
                onChange={(e) => updateField("resources", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Known Constraints</label>
            <Textarea
              placeholder="Technical, regulatory, organizational, or timeline constraints"
              className="min-h-[80px]"
              value={mpData.constraints}
              onChange={(e) => updateField("constraints", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Existing Safeguards / Fallback Plan</label>
            <Textarea
              placeholder="What mitigations are already in place? What's the rollback plan?"
              className="min-h-[80px]"
              value={mpData.existingSafeguards}
              onChange={(e) => updateField("existingSafeguards", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Success Measurement</label>
            <Input
              placeholder="How will you measure success? What metrics matter?"
              value={mpData.successMeasurement}
              onChange={(e) => updateField("successMeasurement", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Supporting Evidence Notes</label>
            <Textarea
              placeholder="Reference any data, research, or documents that support your plan"
              className="min-h-[80px]"
              value={mpData.evidenceNotes}
              onChange={(e) => updateField("evidenceNotes", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3 border border-border">
        <Save className="h-3 w-3" />
        <span>Auto-saved locally. Your data persists even if you navigate away.</span>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/new")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Plan
        </Button>
        <Button onClick={handleRunAnalysis}>
          Analyze My Plan
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}