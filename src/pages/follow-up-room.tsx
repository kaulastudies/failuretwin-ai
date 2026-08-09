import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSimulation } from "@/context/simulation-context";
import { runAnalysis } from "@/lib/analysis/run-analysis";
import { saveAnalysisData } from "@/lib/local-storage";
import type { Simulation } from "@/lib/analysis/types";

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

export default function FollowUpRoom() {
  const navigate = useNavigate();
  const { state, dispatch } = useSimulation();
  const { currentSimulation } = state;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);

  if (!currentSimulation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Sparkles className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No simulation selected</h2>
        <p className="text-muted-foreground mb-6">Start by creating a new simulation.</p>
        <Button onClick={() => navigate("/new")}>Create Simulation</Button>
      </div>
    );
  }

  const questions = generateQuestions(currentSimulation);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleContinue = async () => {
    setAnalyzing(true);

    // Merge answers back into simulation
    const updatedSim: Simulation = {
      ...currentSimulation,
      targetUser: answers.q1 || currentSimulation.targetUser,
      deadline: answers.q2 || currentSimulation.deadline,
      budget: answers.q3 || currentSimulation.budget,
      industry: answers.q4 || currentSimulation.industry,
      assumptions: answers.q5
        ? answers.q5.split("\n").filter((l) => l.trim())
        : currentSimulation.assumptions,
    };

    dispatch({ type: "UPDATE_SIMULATION", simulation: updatedSim });

    try {
      const completedSim: Simulation = { ...updatedSim, status: "complete" };
      const result = await runAnalysis(completedSim);
      const completedAnalysis = {
        ...result,
        simulation: completedSim,
      };

      saveAnalysisData(completedSim.id, completedAnalysis);
      dispatch({ type: "SET_ANALYSIS", analysis: completedAnalysis });
      dispatch({ type: "UPDATE_SIMULATION", simulation: completedSim });

      navigate("/analysis");
    } catch (error) {
      console.error("Analysis flow failed", error);
      setAnalyzing(false);
    }
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
        <h1 className="text-2xl font-bold tracking-tight">Follow-up Questions</h1>
        <p className="text-muted-foreground">
          Based on your plan <strong className="text-foreground">"{currentSimulation.title}"</strong>,
          we have a few follow-up questions to sharpen the analysis.
        </p>
        <Badge variant="intel" className="mt-1">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Sparkles className="h-10 w-10 text-go mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              You've provided enough context — we can run the analysis now.
            </p>
            <Button onClick={handleContinue}>
              Run Analysis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                />
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/new")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleContinue}>
              Analyze My Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
