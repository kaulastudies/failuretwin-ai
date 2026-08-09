import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send, Check, Sparkles, Lightbulb, Paperclip, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSimulation } from "@/context/simulation-context";
import { cn } from "@/lib/utils";
import type { Simulation } from "@/lib/analysis/types";

const DRAFT_KEY = "failuretwin_new_sim_draft";

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

const planInspirations = [
  {
    title: "AI Customer-Support Launch",
    description: "Launch an AI customer-support agent for a SaaS product in 21 days with limited QA and no human escalation path.",
    fill: () => ({
      title: "AI Customer-Support Agent Launch",
      description: "Launch an AI customer-support agent for our SaaS product. Initially, there will be no human escalation — the AI handles everything. We have 21 days to launch with limited QA resources. Success is defined as 40% reduction in support ticket volume within 60 days.",
      targetUser: "SaaS product users (B2B mid-market)",
      expectedOutcome: "40% ticket deflection, reduced support costs",
      budget: "limited",
      deadline: "21-days",
      industry: "SaaS / Technology",
      constraintsText: "No human escalation path\nLimited QA resources\n21-day deadline\nNo dedicated PM",
      assumptionsText: "AI can handle 80% of support queries\nCustomers will accept AI-only support",
      riskTolerance: "high",
      successMetric: "40% ticket reduction within 60 days",
    }),
  },
  {
    title: "Delivery Expansion",
    description: "Expand a delivery business into a new city within 30 days without a local operations lead.",
    fill: () => ({
      title: "Delivery Business City Expansion",
      description: "Expand our delivery business into a new city within 30 days. We'll hire local drivers, partner with local vendors, and set up a mini-hub. Limited budget means no city lead and minimal marketing spend.",
      targetUser: "Urban residents aged 18-45",
      expectedOutcome: "500+ orders per day within 90 days",
      budget: "limited",
      deadline: "30-days",
      industry: "Logistics / Delivery",
      constraintsText: "No city lead hired\nUntested local vendor partnerships\nNo existing brand awareness",
      assumptionsText: "Demand exists in the new city\nVendors will accept our terms\nWe can hire reliable drivers quickly",
      riskTolerance: "medium",
      successMetric: "500 orders/day by day 90",
    }),
  },
  {
    title: "Hospital Claim Automation",
    description: "Replace manual insurance claim review with automation under HIPAA compliance requirements.",
    fill: () => ({
      title: "Hospital Claim-Review Automation",
      description: "Replace manual insurance claim review with an automated system to process claims faster and reduce operational costs. Must comply with HIPAA regulations.",
      targetUser: "Hospital billing department staff",
      expectedOutcome: "50% faster claim processing, 30% cost reduction",
      budget: "medium",
      deadline: "60-days",
      industry: "Healthcare",
      constraintsText: "Regulatory compliance (HIPAA)\nIntegration with legacy EHR system\nUnion concerns about job losses",
      assumptionsText: "Legacy system has API access\nStaff will adopt the new system\nRegulatory approval is straightforward",
      riskTolerance: "low",
      successMetric: "50% faster processing, <5% error rate",
    }),
  },
  {
    title: "AI Interview Coach",
    description: "Launch a paid AI interview-coaching platform for university students with a $3K budget and 2 developers.",
    fill: () => ({
      title: "AI Interview-Coaching Platform",
      description: "Launch a paid AI interview-coaching platform for university students within 14 days. Budget is $3,000. The service analyzes resumes and recorded mock interviews. The team has two developers, no dedicated security engineer, and expects 500 users in the first month.",
      targetUser: "University students aged 18-25 seeking jobs",
      expectedOutcome: "500 paid users in month one",
      budget: "very-limited",
      deadline: "14-days",
      industry: "EdTech",
      constraintsText: "No security engineer\n14-day launch deadline\n$3,000 total budget\nTwo developers only",
      assumptionsText: "Students will pay for AI interview coaching\nPlatform can handle 500 users on day one\nResume analysis is accurate enough",
      riskTolerance: "high",
      successMetric: "500 paid users in first month",
    }),
  },
  {
    title: "Automation Migration",
    description: "Migrate a logistics dispatch workflow from spreadsheets to AI-assisted routing with an inexperienced ops team.",
    fill: () => ({
      title: "Dispatch Automation Migration",
      description: "Migrate a small logistics company's dispatch workflow from spreadsheets to an AI-assisted routing system in 30 days. The operations team has never used automation tools, mobile connectivity is unreliable in some delivery zones, and customer penalties apply for late deliveries.",
      targetUser: "Dispatch operators and delivery drivers",
      expectedOutcome: "30% reduction in late deliveries, automated routing",
      budget: "limited",
      deadline: "30-days",
      industry: "Logistics",
      constraintsText: "Team has no automation experience\nUnreliable mobile connectivity\nCustomer penalties for late deliveries\n30-day migration deadline",
      assumptionsText: "Team can learn the new system in under a week\nMobile connectivity is sufficient in most zones\nData migration from spreadsheets is clean",
      riskTolerance: "medium",
      successMetric: "30% reduction in late deliveries within 60 days",
    }),
  },
];

interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  note: string;
}

function loadDraft(): Record<string, any> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(data: Record<string, any>): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // silently fail
  }
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf", "text/plain", "text/csv"];

export default function NewSimulation() {
  const navigate = useNavigate();
  const { dispatch } = useSimulation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<number>(() => {
    const draft = loadDraft();
    return typeof draft?.step === "number" ? draft.step : 1;
  });

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
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setTitle(draft.title || "");
      setDescription(draft.description || "");
      setTargetUser(draft.targetUser || "");
      setExpectedOutcome(draft.expectedOutcome || "");
      setBudget(draft.budget || "");
      setDeadline(draft.deadline || "");
      setIndustry(draft.industry || "");
      setConstraintsText(draft.constraintsText || "");
      setAssumptionsText(draft.assumptionsText || "");
      setRiskTolerance(draft.riskTolerance || "");
      setSuccessMetric(draft.successMetric || "");
      setEvidenceFiles(draft.evidenceFiles || []);
    }
  }, []);

  // Auto-save draft on changes
  useEffect(() => {
    const draft: Record<string, any> = { step, title, description, targetUser, expectedOutcome, budget, deadline, industry, constraintsText, assumptionsText, riskTolerance, successMetric, evidenceFiles };
    saveDraft(draft);
  }, [step, title, description, targetUser, expectedOutcome, budget, deadline, industry, constraintsText, assumptionsText, riskTolerance, successMetric, evidenceFiles]);

  const totalSteps = 3;

  const applyInspiration = (inspo: typeof planInspirations[0]) => {
    const data = inspo.fill();
    setTitle(data.title);
    setDescription(data.description);
    setTargetUser(data.targetUser);
    setExpectedOutcome(data.expectedOutcome);
    setBudget(data.budget);
    setDeadline(data.deadline);
    setIndustry(data.industry);
    setConstraintsText(data.constraintsText);
    setAssumptionsText(data.assumptionsText);
    setRiskTolerance(data.riskTolerance);
    setSuccessMetric(data.successMetric);
  };

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

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: EvidenceFile[] = [];
    for (const file of files) {
      if (evidenceFiles.length + validFiles.length >= MAX_FILES) break;
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;

      validFiles.push({
        id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        note: "",
      });

      // Read text from TXT/CSV
      if (file.type === "text/plain" || file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          const truncated = text.slice(0, 5000);
          // Store in sessionStorage for analysis passage
          try {
            sessionStorage.setItem(`ev_text_${validFiles[validFiles.length - 1].id}`, truncated);
          } catch {
            // silently fail if too large
          }
        };
        reader.readAsText(file);
      }
    }

    setEvidenceFiles((prev) => [...prev, ...validFiles]);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeEvidence = (id: string) => {
    setEvidenceFiles((prev) => prev.filter((f) => f.id !== id));
    try {
      sessionStorage.removeItem(`ev_text_${id}`);
    } catch {
      // ignore
    }
  };

  const updateEvidenceNote = (id: string, note: string) => {
    setEvidenceFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, note } : f))
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getFileTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      "image/png": "PNG",
      "image/jpeg": "JPEG",
      "application/pdf": "PDF",
      "text/plain": "TXT",
      "text/csv": "CSV",
    };
    return map[type] || type;
  };

  const handleSubmit = () => {
    const id = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    clearDraft();

    // Build evidence text from uploaded files
    const evidenceParts: string[] = [];
    for (const f of evidenceFiles) {
      const textContent = sessionStorage.getItem(`ev_text_${f.id}`);
      if (textContent) {
        evidenceParts.push(`--- Evidence: ${f.name} ---\n${textContent}`);
      } else {
        evidenceParts.push(`[Evidence attached: ${f.name} (${getFileTypeLabel(f.type)})${f.note ? ` — ${f.note}` : ""}]`);
      }
    }

    const fullDescription = evidenceParts.length > 0
      ? `${description.trim()}\n\n--- Supporting Evidence ---\n${evidenceParts.join("\n\n")}`
      : description.trim();

    const simulation: Simulation = {
      id,
      title: title.trim(),
      description: fullDescription,
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

  const handleCtrlSpace = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.code === "Space") {
      e.preventDefault();
      // Focus on first inspiration chip is implicit
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" onKeyDown={handleCtrlSpace}>
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
            {/* Plan Inspiration Chips */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                <span>Plan inspiration <span className="text-xs font-normal text-muted-foreground/60">(click to fill example)</span></span>
              </div>
              <div className="flex flex-wrap gap-2">
                {planInspirations.map((inspo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyInspiration(inspo)}
                    className="group relative text-left text-xs bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50 rounded-lg px-3 py-2 transition-all duration-150 hover:shadow-sm max-w-[220px]"
                    title={inspo.description}
                  >
                    <span className="font-medium text-foreground block truncate">{inspo.title}</span>
                    <span className="text-muted-foreground line-clamp-1 leading-tight mt-0.5">{inspo.description}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/50">Ctrl+Space to focus examples</p>
            </div>

            <Separator />

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

            {/* Supporting Evidence */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Supporting Evidence
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Attach supporting materials. TXT/CSV content will be read and passed into analysis. PNG/JPG/PDF metadata will be included.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.pdf,.txt,.csv"
                onChange={handleEvidenceUpload}
                className="hidden"
                aria-label="Upload evidence files"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={evidenceFiles.length >= MAX_FILES}
                >
                  <Paperclip className="h-4 w-4" />
                  Attach Files
                </Button>
                {evidenceFiles.length > 0 && (
                  <span className="text-xs text-muted-foreground self-center">
                    {evidenceFiles.length}/{MAX_FILES} files
                  </span>
                )}
              </div>
              {evidenceFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {evidenceFiles.map((f) => (
                    <div key={f.id} className="flex items-start gap-2 bg-secondary/30 rounded-lg p-3 border border-border">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{f.name}</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0">{getFileTypeLabel(f.type)}</Badge>
                          <span className="text-xs text-muted-foreground">{formatFileSize(f.size)}</span>
                        </div>
                        <Input
                          placeholder="Optional note about this evidence..."
                          className="mt-1 h-7 text-xs"
                          value={f.note}
                          onChange={(e) => updateEvidenceNote(f.id, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removeEvidence(f.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                Management Plan questions to capture execution details, then run analysis across four
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
            Continue to Management Plan
          </Button>
        )}
      </div>
    </div>
  );
}