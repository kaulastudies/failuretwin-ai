const simulationSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "title",
    "description",
    "targetUser",
    "expectedOutcome",
    "budget",
    "deadline",
    "industry",
    "constraints",
    "assumptions",
    "riskTolerance",
    "successMetric",
    "status",
    "createdAt",
  ],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    targetUser: { type: "string" },
    expectedOutcome: { type: "string" },
    budget: { type: "string" },
    deadline: { type: "string" },
    industry: { type: "string" },
    constraints: { type: "array", items: { type: "string" } },
    assumptions: { type: "array", items: { type: "string" } },
    riskTolerance: { type: "string", enum: ["low", "medium", "high"] },
    successMetric: { type: "string" },
    status: { type: "string", enum: ["draft", "analyzing", "complete"] },
    createdAt: { type: "number" },
  },
};

const riskItemSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "severity", "detail"],
  properties: {
    title: { type: "string" },
    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
    detail: { type: "string" },
  },
};

const findingSchema = {
  type: "object",
  additionalProperties: false,
  required: ["perspective", "score", "confidence", "topRisks", "evidenceGaps", "objection", "suggestedSafeguard"],
  properties: {
    perspective: { type: "string", enum: ["customer", "operations", "finance", "risk"] },
    score: { type: "integer", minimum: 0, maximum: 100 },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    topRisks: { type: "array", minItems: 1, items: riskItemSchema },
    evidenceGaps: { type: "array", minItems: 1, items: { type: "string" } },
    objection: { type: "string" },
    suggestedSafeguard: { type: "string" },
  },
};

const nodeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "type", "label", "severity", "detail", "linkedTo", "state"],
  properties: {
    id: { type: "string" },
    type: { type: "string", enum: ["assumption", "risk", "consequence", "safeguard", "evidence-gap"] },
    label: { type: "string" },
    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
    detail: { type: "string" },
    linkedTo: { type: "array", items: { type: "string" } },
    state: { type: "string", enum: ["unresolved", "mitigated", "accepted"] },
  },
};

const safeguardSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "riskId", "title", "effort", "impact", "accepted", "scoreDelta", "notes"],
  properties: {
    id: { type: "string" },
    riskId: { type: "string" },
    title: { type: "string" },
    effort: { type: "string", enum: ["low", "medium", "high"] },
    impact: { type: "string", enum: ["low", "medium", "high"] },
    accepted: { type: "boolean" },
    scoreDelta: { type: "number" },
    notes: { type: "string" },
  },
};

const briefSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "recommendation",
    "readinessScore",
    "originalReadinessScore",
    "scoreBreakdown",
    "topRisks",
    "acceptedSafeguards",
    "openEvidence",
    "next72Hours",
  ],
  properties: {
    summary: { type: "string" },
    recommendation: { type: "string", enum: ["go", "revise", "stop"] },
    readinessScore: { type: "integer", minimum: 0, maximum: 100 },
    originalReadinessScore: { type: "integer", minimum: 0, maximum: 100 },
    scoreBreakdown: {
      type: "object",
      additionalProperties: false,
      required: [
        "customerReadiness",
        "operationsFeasibility",
        "financialViability",
        "riskPosture",
        "evidenceQuality",
      ],
      properties: {
        customerReadiness: { type: "integer", minimum: 0, maximum: 100 },
        operationsFeasibility: { type: "integer", minimum: 0, maximum: 100 },
        financialViability: { type: "integer", minimum: 0, maximum: 100 },
        riskPosture: { type: "integer", minimum: 0, maximum: 100 },
        evidenceQuality: { type: "integer", minimum: 0, maximum: 100 },
      },
    },
    topRisks: { type: "array", minItems: 1, items: riskItemSchema },
    acceptedSafeguards: { type: "array", items: safeguardSchema },
    openEvidence: { type: "array", minItems: 1, items: { type: "string" } },
    next72Hours: { type: "array", minItems: 3, items: { type: "string" } },
  },
};

export const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["simulation", "findings", "nodes", "safeguards", "brief"],
  properties: {
    simulation: simulationSchema,
    findings: { type: "array", minItems: 4, maxItems: 4, items: findingSchema },
    nodes: { type: "array", items: nodeSchema },
    safeguards: { type: "array", items: safeguardSchema },
    brief: briefSchema,
  },
};

function createSystemPrompt() {
  return [
    "You are FailureTwin's model-driven pre-mortem analyzer.",
    "Analyze the supplied simulation as a freeform plan, not as a fixed template.",
    "Return only JSON matching the provided schema.",
    "Produce exactly four findings, one each for customer, operations, finance, and risk.",
    "The four perspectives must differ materially in reasoning and evidence.",
    "Surface at least one non-obvious, context-specific failure mode grounded in the supplied plan.",
    "Generate concrete failure chains, evidence gaps, and personalized safeguards.",
    "Keep scores stable and internally consistent with the brief recommendation.",
    "Do not include markdown, commentary, or extra keys.",
  ].join(" ");
}

function createUserPrompt(simulation) {
  return JSON.stringify({
    task: "Run a FailureTwin pre-mortem analysis.",
    simulation,
    requirements: {
      perspectiveCount: 4,
      perspectiveNames: ["customer", "operations", "finance", "risk"],
      includeNonObviousContextSpecificFailureMode: true,
      includeFailureChains: true,
      includePersonalizedSafeguards: true,
      structuredOutputOnly: true,
    },
  }, null, 2);
}

function extractMessageContent(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("");
  }
  return "";
}

function parseModelJson(content) {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Model returned an empty response");
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Model response was not valid JSON");
  }
}

async function requestAnalysis(apiKey, model, simulation) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: createSystemPrompt() },
        { role: "user", content: createUserPrompt(simulation) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "failuretwin_analysis_result",
          schema: analysisSchema,
          strict: true,
        },
      },
      temperature: 0,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI request failed for ${model}: ${raw}`);
  }

  const payload = JSON.parse(raw);
  const content = extractMessageContent(payload);
  return parseModelJson(content);
}

export async function analyzeWithOpenAI(simulation) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const candidateModels = Array.from(new Set([
    process.env.OPENAI_MODEL,
    "gpt-5.6-terra",
    "gpt-5.1",
    "gpt-5",
  ].filter(Boolean)));

  let lastError = null;
  for (const model of candidateModels) {
    try {
      return await requestAnalysis(apiKey, model, simulation);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to generate a live analysis");
}
