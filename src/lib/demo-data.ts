import type { Simulation, AnalysisResult, AgentFinding, FailureNode, Safeguard, DecisionBrief } from "./analysis/types";

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const demo1: Simulation = {
  id: "demo_1",
  title: "AI Customer-Support Agent",
  description: "Launch an AI customer-support agent for our SaaS product. Initially, there will be no human escalation — the AI handles everything. We have 21 days to launch with limited QA resources. Success is defined as 40% reduction in support ticket volume within 60 days.",
  targetUser: "SaaS product users (B2B mid-market)",
  expectedOutcome: "40% ticket deflection, reduced support costs, faster response times",
  budget: "Limited (internal team only, no new hires)",
  deadline: "21 days",
  industry: "SaaS / Technology",
  constraints: ["No human escalation path", "Limited QA resources", "21-day deadline", "No dedicated PM"],
  assumptions: ["AI can handle 80% of support queries without human intervention", "Customers will accept AI-only support for 30 days", "Current ticketing system integrates easily"],
  riskTolerance: "high",
  successMetric: "40% ticket reduction within 60 days",
  status: "complete",
  createdAt: Date.now() - 86400000,
};

const demo2: Simulation = {
  id: "demo_2",
  title: "Delivery Business City Expansion",
  description: "Expand our delivery business into a new city within 30 days. We'll need to hire local drivers, partner with local vendors, and set up a mini-hub. Limited budget means no city lead and minimal marketing spend.",
  targetUser: "Urban residents aged 18–45 in the new city",
  expectedOutcome: "500+ orders per day within 90 days, break-even in 6 months",
  budget: "Limited (seed funding, no VC)",
  deadline: "30 days",
  industry: "Logistics / Delivery",
  constraints: ["No city lead hired", "Untested local vendor partnerships", "No existing brand awareness", "30-day timeline"],
  assumptions: ["Demand exists in the new city", "Vendors will accept our terms", "We can hire reliable drivers quickly"],
  riskTolerance: "medium",
  successMetric: "500 orders/day by day 90, break-even by month 6",
  status: "complete",
  createdAt: Date.now() - 172800000,
};

const demo3: Simulation = {
  id: "demo_3",
  title: "Hospital Claim-Review Automation",
  description: "Replace manual insurance claim review with an automated system to process claims faster and reduce operational costs. The system will handle claim validation, coding checks, and payment calculation.",
  targetUser: "Hospital billing department staff",
  expectedOutcome: "50% faster claim processing, 30% reduction in billing staff costs, <5% error rate",
  budget: "Medium (department budget allocation)",
  deadline: "60 days",
  industry: "Healthcare",
  constraints: ["Regulatory compliance (HIPAA)", "Integration with legacy EHR system", "Union concerns about job losses", "High accuracy requirement"],
  assumptions: ["Legacy system has API access", "Staff will adopt the new system", "Regulatory approval is straightforward"],
  riskTolerance: "low",
  successMetric: "50% faster processing, <5% error rate",
  status: "complete",
  createdAt: Date.now() - 259200000,
};

function generateDemoAnalysis(sim: Simulation): AnalysisResult {
  const isDemo1 = sim.id === "demo_1";
  const isDemo2 = sim.id === "demo_2";

  if (isDemo1) {
    const findings: AgentFinding[] = [
      {
        perspective: "customer",
        score: 38,
        confidence: "low",
        topRisks: [
          { title: "Frustrated high-value customers", severity: "critical", detail: "No human escalation means complex issues go unresolved, eroding trust with power users who expect human support for critical problems." },
          { title: "Negative public complaints and churn", severity: "high", detail: "Unhappy customers will share negative experiences on social media and review platforms before churning, damaging brand reputation." },
        ],
        evidenceGaps: ["No customer-satisfaction survey data for current support", "No churn-rate baseline for comparison", "No data on what % of issues require human intervention"],
        objection: "Customers will feel abandoned when they can't reach a human for complex or sensitive issues. This is a critical trust risk.",
        suggestedSafeguard: "Implement escalation triggers that route complex issues to human agents after 2 failed automated attempts.",
      },
      {
        perspective: "operations",
        score: 42,
        confidence: "low",
        topRisks: [
          { title: "Impossible delivery timeline", severity: "high", detail: "A 21-day timeline for an AI system with no human backup is extremely aggressive without existing infrastructure or dedicated PM." },
          { title: "Inadequate testing window", severity: "high", detail: "Limited QA resources on a 21-day timeline means critical bugs will reach production." },
        ],
        evidenceGaps: ["No rollout plan or phased-deployment strategy", "No QA test plan or success criteria"],
        objection: "The timeline is too aggressive for reliable delivery — corners will be cut on testing, monitoring, and documentation.",
        suggestedSafeguard: "Implement a staged rollout with a 2-week shadow-mode phase where AI responses are reviewed before going live.",
      },
      {
        perspective: "finance",
        score: 55,
        confidence: "medium",
        topRisks: [
          { title: "Budget insufficient for scope", severity: "medium", detail: "Limited budget with no new hires means existing team will be stretched thin, increasing burnout and turnover risk." },
          { title: "Unplanned cost overruns from escalations", severity: "medium", detail: "If AI can't handle 80% of queries, the cost of handling escalations retroactively will blow the budget." },
        ],
        evidenceGaps: ["No unit economics breakdown", "No ROI model or breakeven timeline", "No cost comparison with current human-only support"],
        objection: "The budget appears insufficient for the stated scope. Underfunding creates cascading risks across the project.",
        suggestedSafeguard: "Define a minimum viable scope that fits within budget, with clear phase-2 funding triggers tied to adoption metrics.",
      },
      {
        perspective: "risk",
        score: 35,
        confidence: "low",
        topRisks: [
          { title: "No human-in-the-loop for critical failures", severity: "critical", detail: "Without human escalation, automated errors can compound undetected for hours or days before discovery." },
          { title: "Decision made on vague assumptions", severity: "high", detail: "The assumption that AI can handle 80% of queries is untested and could be wildly optimistic for B2B mid-market support." },
        ],
        evidenceGaps: ["No incident-response plan for AI failures", "No rollback strategy if AI underperforms", "No monitoring or alerting plan"],
        objection: "Proceeding without human escalation is a governance risk that could cause significant brand and financial damage.",
        suggestedSafeguard: "Run a structured risk-workshop using failure-mode analysis to surface blind spots before launch.",
      },
    ];

    const nodes: FailureNode[] = [
      { id: "a1", type: "assumption", label: "Assumption: AI handles 80% of queries", severity: "high", detail: "This assumption is the foundation of the business case. If the AI can only handle 40-50%, the entire model breaks.", linkedTo: ["r1", "r2"], state: "unresolved" },
      { id: "r1", type: "risk", label: "Frustrated high-value customers", severity: "critical", detail: "No human escalation leaves complex issues unresolved. B2B customers expect escalation paths for critical problems.", linkedTo: ["c1"], state: "unresolved" },
      { id: "c1", type: "consequence", label: "Consequence: Churn of high-value accounts", severity: "critical", detail: "Losing 2-3 enterprise accounts would outweigh any cost savings from the AI system. This is the single biggest financial risk.", linkedTo: ["sg1"], state: "unresolved" },
      { id: "a2", type: "assumption", label: "Assumption: Customers accept AI-only support", severity: "medium", detail: "B2B customers may not accept AI-only support for contract-level or billing issues.", linkedTo: ["r2"], state: "unresolved" },
      { id: "r2", type: "risk", label: "Negative public complaints and churn", severity: "high", detail: "Customers will escalate complaints publicly on social media and review sites.", linkedTo: ["c2"], state: "unresolved" },
      { id: "c2", type: "consequence", label: "Consequence: Brand reputation damage", severity: "high", detail: "Public complaints from frustrated customers will damage brand reputation and affect new sales.", linkedTo: ["sg2"], state: "unresolved" },
      { id: "a3", type: "assumption", label: "Assumption: 21 days is enough", severity: "high", detail: "Even a basic AI support agent needs training data, testing, and integration work.", linkedTo: ["r3"], state: "unresolved" },
      { id: "r3", type: "risk", label: "Impossible delivery timeline", severity: "high", detail: "21 days with no PM and limited QA means the system will launch with known and unknown defects.", linkedTo: ["c3"], state: "unresolved" },
      { id: "c3", type: "consequence", label: "Consequence: Buggy launch erodes trust", severity: "high", detail: "A buggy AI system will create a poor first impression that takes months to recover from.", linkedTo: [], state: "unresolved" },
      { id: "eg1", type: "evidence-gap", label: "Evidence Gap: Customer satisfaction baseline", severity: "medium", detail: "Without knowing current satisfaction levels, we can't measure if the AI improves or worsens the experience.", linkedTo: [], state: "unresolved" },
      { id: "eg2", type: "evidence-gap", label: "Evidence Gap: Incident response plan", severity: "high", detail: "No plan exists for what happens when the AI fails or produces incorrect responses.", linkedTo: [], state: "unresolved" },
    ];

    // Fix the last node (typo in linkedTo)
    nodes[nodes.length - 1] = { ...nodes[nodes.length - 1], linkedTo: [] };

    const safeguards: Safeguard[] = [
      { id: "sg1", riskId: "r1", title: "Implement escalation triggers to human agents after 2 failed attempts", effort: "medium", impact: "high", accepted: false, scoreDelta: 8, notes: "" },
      { id: "sg2", riskId: "r2", title: "48-hour shadow mode: AI responses reviewed before going live", effort: "medium", impact: "high", accepted: false, scoreDelta: 7, notes: "" },
      { id: "sg3", riskId: "r3", title: "Human QA for first 500 tickets before full autonomy", effort: "medium", impact: "high", accepted: false, scoreDelta: 7, notes: "" },
      { id: "sg4", riskId: "r1", title: "Rollback plan with clear triggers and owner", effort: "low", impact: "high", accepted: false, scoreDelta: 6, notes: "" },
    ];

    const brief: DecisionBrief = {
      summary: "AI Customer-Support Agent shows significant readiness concerns (43/100). The 'no human escalation' approach creates critical risks that must be addressed before proceeding.",
      recommendation: "stop",
      readinessScore: 43,
      originalReadinessScore: 43,
      scoreBreakdown: { customerReadiness: 38, operationsFeasibility: 42, financialViability: 55, riskPosture: 35, evidenceQuality: 40 },
      topRisks: [
        { title: "Frustrated high-value customers", severity: "critical", detail: "No human escalation leaves complex issues unresolved." },
        { title: "No human-in-the-loop for critical failures", severity: "critical", detail: "Automated errors can compound before detection." },
        { title: "Negative public complaints and churn", severity: "high", detail: "Unhappy customers share negative experiences publicly." },
        { title: "Impossible delivery timeline", severity: "high", detail: "21 days with limited QA is extremely aggressive." },
      ],
      acceptedSafeguards: [],
      openEvidence: [
        "No customer-satisfaction survey data for current support",
        "No churn-rate baseline for comparison",
        "No incident-response plan for AI failures",
        "No rollback strategy if AI underperforms",
      ],
      next72Hours: [
        "Implement escalation triggers for complex issues",
        "Extend timeline to include shadow-mode phase",
        "Run customer discovery to validate AI acceptance",
        "Build incident-response and rollback plans",
      ],
    };

    return { simulation: sim, findings, nodes, safeguards, brief };
  }

  if (isDemo2) {
    const findings: AgentFinding[] = [
      {
        perspective: "customer",
        score: 45,
        confidence: "low",
        topRisks: [
          { title: "Delayed deliveries frustrate new customers", severity: "high", detail: "Without a local city lead and with untested vendors, delivery delays in the first weeks will create negative first impressions." },
          { title: "Bad reviews damage launch momentum", severity: "high", detail: "Early delivery failures will generate bad reviews before the service can build a reputation." },
        ],
        evidenceGaps: ["No market demand data for the new city", "No competitor analysis in target area"],
        objection: "Entering a new city without local leadership or proven vendor partnerships creates unacceptable customer-experience risk.",
        suggestedSafeguard: "Start with a smaller pilot zone for 2 weeks to validate demand and vendor reliability before full rollout.",
      },
      {
        perspective: "operations",
        score: 40,
        confidence: "low",
        topRisks: [
          { title: "Untested vendors fail to meet SLAs", severity: "high", detail: "No existing relationships with local vendors means unknown reliability, quality, and communication standards." },
          { title: "Driver hiring and retention challenges", severity: "high", detail: "Rapid hiring without a city lead will result in poor driver screening and high turnover." },
        ],
        evidenceGaps: ["No vendor vetting process or SLA templates", "No driver training program", "No local operations manual"],
        objection: "Operating without proven local partners or a city lead is a recipe for operational failures on day one.",
        suggestedSafeguard: "Create vendor SLA agreements with clear metrics, penalties, and a 30-day review period.",
      },
      {
        perspective: "finance",
        score: 50,
        confidence: "medium",
        topRisks: [
          { title: "Refund spikes from failed deliveries", severity: "medium", detail: "Initial operational issues will generate refund requests that eat into already limited margins." },
        ],
        evidenceGaps: ["No unit economics model for the new city", "No cost comparison with competitor pricing"],
        objection: "The financial model is not well-defined, making it difficult to assess whether the expansion is viable.",
        suggestedSafeguard: "Set up a refund threshold monitoring system with automatic alerts when refunds exceed 5% of revenue.",
      },
      {
        perspective: "risk",
        score: 48,
        confidence: "low",
        topRisks: [
          { title: "Unknown market demand", severity: "high", detail: "No market research or demand validation has been done for the new city." },
          { title: "Unreliable partners damage brand", severity: "medium", detail: "Vendor failures will be attributed to the delivery brand, not the partner." },
        ],
        evidenceGaps: ["No market research conducted", "No risk assessment for vendor dependency", "No insurance coverage review"],
        objection: "The lack of market validation and partner vetting creates significant execution risk.",
        suggestedSafeguard: "Conduct a rapid market survey (72 hours) and vendor due diligence before committing to full expansion.",
      },
    ];

    const nodes: FailureNode[] = [
      { id: "a1", type: "assumption", label: "Assumption: Demand exists", severity: "high", detail: "No market research has been done to confirm there's demand for this service in the target city.", linkedTo: ["r1"], state: "unresolved" },
      { id: "r1", type: "risk", label: "Delayed deliveries frustrate new customers", severity: "high", detail: "Without local leadership and proven vendors, first-week delivery performance will be poor.", linkedTo: ["c1"], state: "unresolved" },
      { id: "c1", type: "consequence", label: "Consequence: Lost early adopters", severity: "high", detail: "First impressions matter — poor early delivery will drive customers to competitors.", linkedTo: ["sg1"], state: "unresolved" },
      { id: "a2", type: "assumption", label: "Assumption: Vendors accept our terms", severity: "medium", detail: "Untested assumption that local vendors will agree to the pricing and service standards needed.", linkedTo: ["r2"], state: "unresolved" },
      { id: "r2", type: "risk", label: "Untested vendors fail to meet SLAs", severity: "high", detail: "No existing relationships means unknown reliability and quality standards.", linkedTo: ["c2"], state: "unresolved" },
      { id: "c2", type: "consequence", label: "Consequence: Refund spikes and customer refunds", severity: "medium", detail: "Failed deliveries will generate refund requests and chargebacks.", linkedTo: ["sg2"], state: "unresolved" },
      { id: "a3", type: "assumption", label: "Assumption: We can hire drivers quickly", severity: "medium", detail: "Rapid hiring without a local lead or screening process will lead to quality issues.", linkedTo: ["r3"], state: "unresolved" },
      { id: "r3", type: "risk", label: "Driver hiring and retention challenges", severity: "medium", detail: "High driver turnover creates inconsistent service quality and training costs.", linkedTo: ["c3"], state: "unresolved" },
      { id: "c3", type: "consequence", label: "Consequence: Inconsistent delivery quality", severity: "medium", detail: "Varying driver quality leads to inconsistent customer experiences.", linkedTo: [], state: "unresolved" },
    ];

    const safeguards: Safeguard[] = [
      { id: "sg1", riskId: "r1", title: "Start with a smaller pilot zone for 2 weeks to validate", effort: "low", impact: "high", accepted: false, scoreDelta: 8, notes: "" },
      { id: "sg2", riskId: "r2", title: "Create vendor SLA agreements with metrics and penalties", effort: "medium", impact: "high", accepted: false, scoreDelta: 7, notes: "" },
      { id: "sg3", riskId: "r3", title: "Hire a local ops owner before launch", effort: "high", impact: "high", accepted: false, scoreDelta: 9, notes: "" },
      { id: "sg4", riskId: "c1", title: "Set up refund threshold monitoring (<5% revenue)", effort: "low", impact: "medium", accepted: false, scoreDelta: 4, notes: "" },
    ];

    const brief: DecisionBrief = {
      summary: "Delivery City Expansion shows moderate concerns (46/100). The lack of local leadership and vendor vetting need to be addressed before proceeding.",
      recommendation: "revise",
      readinessScore: 46,
      originalReadinessScore: 46,
      scoreBreakdown: { customerReadiness: 45, operationsFeasibility: 40, financialViability: 50, riskPosture: 48, evidenceQuality: 46 },
      topRisks: [
        { title: "Delayed deliveries frustrate new customers", severity: "high", detail: "Without a local city lead, first-week delivery performance will be poor." },
        { title: "Untested vendors fail to meet SLAs", severity: "high", detail: "No existing relationships means unknown reliability and quality standards." },
        { title: "Unknown market demand", severity: "high", detail: "No market research or demand validation has been done." },
      ],
      acceptedSafeguards: [],
      openEvidence: [
        "No market demand data for the new city",
        "No competitor analysis in target area",
        "No vendor vetting process or SLA templates",
      ],
      next72Hours: [
        "Conduct rapid market survey (72 hours)",
        "Identify and vet 3+ potential vendor partners",
        "Draft vendor SLA templates with metrics and penalties",
        "Begin recruiting for a local city lead",
      ],
    };

    return { simulation: sim, findings, nodes, safeguards, brief };
  }

  // Demo 3: Hospital Claims Automation
  const findings: AgentFinding[] = [
    {
      perspective: "customer",
      score: 55,
      confidence: "medium",
      topRisks: [
        { title: "Claim rejection frustrates patients", severity: "high", detail: "Automated claim rejections without human review could deny legitimate claims, causing patient distress and appeals." },
        { title: "Patient trust damage from errors", severity: "high", detail: "Billing errors from automation erode patient trust in the hospital's financial processes." },
      ],
      evidenceGaps: ["No current claim rejection rate baseline", "No patient satisfaction survey data for billing"],
      objection: "Patients may not trust automated billing decisions, especially for high-value claims where errors have financial consequences.",
      suggestedSafeguard: "Implement human review for all claims above $5,000 and all claim rejections.",
    },
    {
      perspective: "operations",
      score: 50,
      confidence: "medium",
      topRisks: [
        { title: "Legacy EHR integration failures", severity: "high", detail: "Assuming the legacy EHR system has reliable API access is optimistic — integration with healthcare systems is notoriously difficult." },
        { title: "Staff resistance to automation", severity: "high", detail: "Union concerns about job losses will create resistance that slows adoption and undermines the system." },
      ],
      evidenceGaps: ["No EHR integration assessment completed", "No change management plan for staff transition", "No union communication plan"],
      objection: "The integration complexity with legacy healthcare systems is severely underestimated, and staff resistance could derail the rollout.",
      suggestedSafeguard: "Conduct a full integration assessment and API audit before committing to the timeline.",
    },
    {
      perspective: "finance",
      score: 60,
      confidence: "medium",
      topRisks: [
        { title: "Billing leakage from misconfigured rules", severity: "high", detail: "Incorrectly configured billing rules could underpay or overpay claims, creating financial leakage." },
        { title: "Unplanned compliance remediation costs", severity: "medium", detail: "HIPAA compliance issues discovered post-launch can be extremely costly to fix." },
      ],
      evidenceGaps: ["No billing audit trail system design", "No compliance cost contingency in budget"],
      objection: "The financial benefits assume smooth implementation, which is unlikely given the integration complexity.",
      suggestedSafeguard: "Implement a comprehensive audit trail with daily reconciliation reports for the first 90 days.",
    },
    {
      perspective: "risk",
      score: 40,
      confidence: "low",
      topRisks: [
        { title: "Regulatory compliance exposure (HIPAA)", severity: "critical", detail: "HIPAA violations from improper handling of protected health information could result in fines of $50K-$1.5M per violation." },
        { title: "Audit gap from automated decisions", severity: "high", detail: "Without proper audit trails, it's impossible to verify that automated decisions comply with regulations." },
      ],
      evidenceGaps: ["No HIPAA compliance review completed", "No data privacy impact assessment", "No audit trail requirements defined"],
      objection: "Automating healthcare claims without a thorough compliance review is a regulatory time bomb.",
      suggestedSafeguard: "Run a comprehensive HIPAA compliance review and implement audit trails before any production deployment.",
    },
  ];

  const nodes: FailureNode[] = [
    { id: "a1", type: "assumption", label: "Assumption: EHR has accessible API", severity: "critical", detail: "Many legacy hospital EHR systems have limited or unreliable API access.", linkedTo: ["r1"], state: "unresolved" },
    { id: "r1", type: "risk", label: "Legacy EHR integration failures", severity: "high", detail: "Integration with legacy healthcare systems is notoriously complex and often requires middleware.", linkedTo: ["c1"], state: "unresolved" },
    { id: "c1", type: "consequence", label: "Consequence: Timeline slips by months", severity: "high", detail: "Integration issues could delay the project by 3-6 months, increasing costs and eroding stakeholder confidence.", linkedTo: ["sg1"], state: "unresolved" },
    { id: "a2", type: "assumption", label: "Assumption: Regulatory approval is straightforward", severity: "critical", detail: "HIPAA compliance for automated claims processing is complex and requires extensive documentation.", linkedTo: ["r2"], state: "unresolved" },
    { id: "r2", type: "risk", label: "Regulatory compliance exposure (HIPAA)", severity: "critical", detail: "HIPAA violations from improper PHI handling can result in fines of $50K-$1.5M per violation.", linkedTo: ["c2"], state: "unresolved" },
    { id: "c2", type: "consequence", label: "Consequence: Regulatory fines and legal costs", severity: "critical", detail: "Even a single HIPAA violation can result in substantial fines and legal fees.", linkedTo: ["sg2"], state: "unresolved" },
    { id: "a3", type: "assumption", label: "Assumption: Staff will adopt the new system", severity: "medium", detail: "Union concerns and fear of job loss will create resistance to adoption.", linkedTo: ["r3"], state: "unresolved" },
    { id: "r3", type: "risk", label: "Staff resistance to automation", severity: "high", detail: "Billing staff may resist or undermine the system if they fear job losses.", linkedTo: ["c3"], state: "unresolved" },
    { id: "c3", type: "consequence", label: "Consequence: Low adoption and wasted investment", severity: "high", detail: "A system that staff won't use represents a complete waste of the investment.", linkedTo: [], state: "unresolved" },
  ];

  // Fix typo
  nodes[nodes.length - 1] = { ...nodes[nodes.length - 1], linkedTo: [] };

  const safeguards: Safeguard[] = [
    { id: "sg1", riskId: "r1", title: "Conduct full integration assessment and API audit", effort: "high", impact: "high", accepted: false, scoreDelta: 10, notes: "" },
    { id: "sg2", riskId: "r2", title: "Run comprehensive HIPAA compliance review", effort: "high", impact: "high", accepted: false, scoreDelta: 12, notes: "" },
    { id: "sg3", riskId: "r1", title: "Human review for high-value claims (>$5K)", effort: "medium", impact: "high", accepted: false, scoreDelta: 8, notes: "" },
    { id: "sg4", riskId: "r3", title: "Develop change management and union engagement plan", effort: "medium", impact: "medium", accepted: false, scoreDelta: 6, notes: "" },
  ];

  const brief: DecisionBrief = {
    summary: "Hospital Claim-Review Automation has significant regulatory concerns (51/100). HIPAA compliance must be addressed before proceeding.",
    recommendation: "revise",
    readinessScore: 51,
    originalReadinessScore: 51,
    scoreBreakdown: { customerReadiness: 55, operationsFeasibility: 50, financialViability: 60, riskPosture: 40, evidenceQuality: 49 },
    topRisks: [
      { title: "Regulatory compliance exposure (HIPAA)", severity: "critical", detail: "HIPAA violations can result in fines of $50K-$1.5M per violation." },
      { title: "Legacy EHR integration failures", severity: "high", detail: "Integration with legacy healthcare systems is notoriously complex." },
      { title: "Staff resistance to automation", severity: "high", detail: "Union concerns may slow adoption and undermine the system." },
    ],
    acceptedSafeguards: [],
    openEvidence: [
      "No HIPAA compliance review completed",
      "No EHR integration assessment completed",
      "No change management plan for staff transition",
      "No billing audit trail system design",
    ],
    next72Hours: [
      "Begin HIPAA compliance review with legal team",
      "Conduct EHR integration assessment and API audit",
      "Develop staff communication and change management plan",
      "Define audit trail requirements for billing decisions",
    ],
  };

  return { simulation: sim, findings, nodes, safeguards, brief };
}

export const demoSimulations: Simulation[] = [demo1, demo2, demo3];

export function getDemoData(id: string): AnalysisResult | null {
  const sim = [demo1, demo2, demo3].find((s) => s.id === id);
  if (!sim) return null;
  return generateDemoAnalysis(sim);
}

export function getDefaultDemoId(): string {
  return "demo_1";
}