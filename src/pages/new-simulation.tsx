import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSimulation } from "@/context/simulation-context";
import type { Simulation } from "@/lib/analysis/types";

const budgetOptions = [
  { value: "very-limited", label: "Very limited (bootstrapping)" },
  { value: "limited", label: "Limited (internal only)" },
  { value: "medium", label: "Medium (dedicated budget)" },
  { value: "substantial", label: "Substantial (well-funded)" },
  { value: "unlimited", label: "Unlimited (full backing)" },
];

const deadlineOptions = [
  { value: "14-days", label: "14 days or less" },
  { value: "21-days", label: "21 days" },
  { value: "30-days", label: "30 days" },
  { value: "60-days", label: "60 days" },
  { value: "90-days", label: "90 days" },
  { value: "flexible", label: "Flexible (no hard deadline)" },
];

const riskToleranceOptions = [
  { value: "low", label: "Low — Avoid risk wherever possible" },
  { value: "medium", label: "Medium — Calculated risks acceptable" },
  { value: "high", label: "High — Aggressive, move fast" },
];

export default function NewSimulation() {
  const navigate = useNavigate();
  const { dispatch } = useSimulation();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [industry, setIndustry] = useState("");
  const [constraintsText, setConstraintsText] = useState("");
  const [assumptionsText, setAssumptionsText] = useState("");
  const [riskTolerance, setRiskTolerance] = useState("");
  const [successMetric, setSuccessMetric] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!description.trim()) errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handleSubmit = () => {
    const id = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const simulation: Simulation = {
      id,
      title: title.trim(),
      description: description.trim(),
      targetUser: targetUser.trim(),
      expectedOutcome: expectedOutcome.trim(),
      budget: budgetOptions.find((o) => o.value === budget)?.label || budget,
      deadline: deadlineOptions.find((o) => o.value === deadline)?.label || deadline,
      industry: industry.trim(),
      constraints: constraintsText.split("\n").filter((l) => l.trim()),
      assumptions: assumptionsText.split("\n").filter((l) => l.trim()),
      riskTolerance: (riskTolerance as "low" | "medium" | "high") || "medium",
      successMetric: successMetric.trim(),
      status: "draft",
      createdAt: Date.now(),
    };

    dispatch({ type: "ADD_SIMULATION", simulation });
    dispatch({ type: "SET_DEMO_MODE", isDemo: false });
    navigate("/follow-up");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">New Simulation</h1>
        <p className="text-muted-foreground">
          Describe your plan below. The more detail you provide, the sharper your analysis will be.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium border transition-all duration-200 ${
                i + 1 === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : i + 1 < step
                  ? "border-go bg-go-bg text-go"
                  : "border-border text-muted-foreground"
              }`}
            >
              {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`flex-1 h-px ${
                  i + 1 < step ? "bg-go" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your plan</CardTitle>
            <CardDescription>
              Describe what you're planning to do in plain language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Plan Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g., Launch AI Customer-Support Agent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Describe Your Plan <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="What are you planning to build, launch, or change? Who is it for? What does success look like? What's the context?"
                className="min-h-[160px] leading-relaxed"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target User / Audience</label>
              <Input
                placeholder="e.g., B2B SaaS customers, urban commuters, hospital billing staff"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expected Outcome</label>
              <Input
                placeholder="e.g., 40% ticket reduction, 500 orders/day, 50% faster processing"
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Constraints */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Constraints & Context</CardTitle>
            <CardDescription>
              What are the boundaries, limitations, and assumptions of your plan?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget</label>
                <Select
                  options={budgetOptions}
                  placeholder="Select budget level"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deadline</label>
                <Select
                  options={deadlineOptions}
                  placeholder="Select timeline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry / Context</label>
              <Input
                placeholder="e.g., SaaS, Healthcare, Logistics, Finance"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Constraints (one per line)
              </label>
              <Textarea
                placeholder="e.g., No human escalation path&#10;Limited QA resources&#10;No dedicated PM&#10;Regulatory compliance required"
                className="min-h-[100px]"
                value={constraintsText}
                onChange={(e) => setConstraintsText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Known Assumptions (one per line)
              </label>
              <Textarea
                placeholder="e.g., AI can handle 80% of queries&#10;Customers will accept AI-only support&#10;Current system integrates easily"
                className="min-h-[100px]"
                value={assumptionsText}
                onChange={(e) => setAssumptionsText(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Risk & Success */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk & Success Criteria</CardTitle>
            <CardDescription>
              Define your risk appetite and how you'll measure success.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Tolerance</label>
              <Select
                options={riskToleranceOptions}
                placeholder="Select risk tolerance"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Success Metric</label>
              <Input
                placeholder="e.g., 40% ticket reduction within 60 days"
                value={successMetric}
                onChange={(e) => setSuccessMetric(e.target.value)}
              />
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">What happens next?</strong> We'll ask a few
                follow-up questions based on what you've shared, then run analysis across four
                perspectives: Customer, Operations, Finance, and Risk.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => (step > 1 ? setStep((s) => s - 1) : navigate("/"))}
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? "Cancel" : "Back"}
        </Button>

        {step < totalSteps ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4" />
            Start Analysis
          </Button>
        )}
      </div>
    </div>
  );
}