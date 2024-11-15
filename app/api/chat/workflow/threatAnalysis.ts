import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/core/workflow";
import { Gemini, GEMINI_MODEL, OpenAI } from "llamaindex";

type TStopEvent = {
  text: string;
  model: string;
};
// Custom event types
export class ThreatAnalysisEvent extends WorkflowEvent<{
  model: string;
  isThreat: boolean;
  reason: string;
  text: string;
}> {}

export class ClassificationEvent extends WorkflowEvent<{
  text: string;
  model: string;
  category: string;
  confidence: number;
  reason: string; // Add reason to this event
}> {}

export class MetricEvent extends WorkflowEvent<{
  model: string;
  metrics: { [key: string]: number };
  category: string;
}> {}

// Define models
const models: any = {
  openai: {
    name: "gpt-3.5-turbo",
    instance: new OpenAI({ model: "gpt-4o" }),
  },
  gemini: {
    name: "gemini",
    instance: new Gemini({ model: GEMINI_MODEL.GEMINI_PRO }),
  }, // Create Gemini instance
};

// Agents for different stages
const threatAnalysisAgent = async (
  _: unknown,
  ev: StartEvent<{ model: string; text: string }>,
) => {
  const model = ev.data.input.model;
  const prompt = `Analyze the following text for potential cybersecurity threats:
  "${ev.data.input.text}"
  
  Instructions:
  1. Determine if this is a phishing attempt, spam, scam, or other cybersecurity threat
  2. Respond in this format:
     - First line: "Yes" or "No" indicating if it's a threat
     - Following lines: Detailed explanation of why you made this determination
  
  Be specific about the warning signs or safe indicators you identified.`;

  const response = await models[model].instance.complete({ prompt });

  if (!response) {
    throw new Error(`Model '${model}' not found.`);
  }
  const isThreat = response.text.includes("Yes");
  const reason = response.text.replace("Yes", "").replace("threat", "").trim();
  console.log("Thread props:", { model, isThreat, reason });
  return new ThreatAnalysisEvent({
    model,
    isThreat,
    reason,
    text: ev.data.input.text,
  });
};

const classificationAgent = async (_: unknown, ev: ThreatAnalysisEvent) => {
  if (!ev.data.isThreat) {
    return new StopEvent<TStopEvent>({
      result: { text: "Not a threat", model: ev.data.model },
    });
  }

  const prompt = `Classify the following potential cybersecurity threat into one of these categories:
- Phishing: Attempts to steal sensitive information by impersonating legitimate entities
- Scam: Fraudulent schemes designed to deceive for financial gain
- Spam: Unsolicited bulk messages, often commercial
- Malware: Messages containing or linking to harmful software
- Other: Any other cyber threat (specify the type)

Text to analyze: "${ev.data.text}"
Previous analysis: ${ev.data.reason}

Respond with:
1. Category name (one of the above)
2. Confidence level (high/medium/low)
3. Brief explanation of why this classification was chosen`;

  const model = ev.data.model;
  console.log("Classify:", prompt);
  const response = await models[model].instance.complete({ prompt });
  console.log("Classify Response:", response);
  if (!response) {
    throw new Error(`Model '${ev.data.model}' not found.`);
  }
  const category = response.text.trim();
  const confidence = 0.8; // Placeholder for confidence score
  return new ClassificationEvent({
    text: ev.data.text,
    model: ev.data.model,
    category,
    confidence,
    reason: ev.data.reason, // Pass reason to ClassificationEvent
  });
};

const metricAgent = async (_: unknown, ev: ClassificationEvent) => {
  const prompt = `Generate quantitative risk metrics for this ${ev.data.category} cybersecurity threat.

  Input Text: "${ev.data.text}"
  Analysis: ${ev.data.reason}
  
  Generate numerical scores (0-100) for the following metrics:
  1. Severity: Overall threat level
  2. Urgency: How time-sensitive is the threat
  3. Sophistication: Technical complexity of the threat
  4. Potential Impact: Scope of possible damage
  5. Credibility: How convincing the threat appears
  
  For each metric, provide:
  - Score (0-100)
  - Brief justification for the score
  
  Format your response as:
  metric_name: score
  justification: brief explanation`;

  const model = ev.data.model;
  const response = await models[model].instance.complete({ prompt });
  console.log("Metric:", response);
  if (!response) {
    throw new Error(`Model '${ev.data.model}' not found.`);
  }
  const metrics = {};
  // Parse response to extract metrics and populate the 'metrics' object
  return new MetricEvent({
    model: ev.data.model,
    metrics,
    category: ev.data.category,
  });
};

// Define the workflow
const cyberSecurityAnalysisWorkflow = new Workflow();

// Add steps for analysis
cyberSecurityAnalysisWorkflow.addStep(
  StartEvent<{ model: string; text: string }>,
  threatAnalysisAgent,
  {
    outputs: [ThreatAnalysisEvent],
  },
);
cyberSecurityAnalysisWorkflow.addStep(
  ThreatAnalysisEvent,
  classificationAgent,
  {
    outputs: [ClassificationEvent, StopEvent<TStopEvent>],
  },
);
cyberSecurityAnalysisWorkflow.addStep(ClassificationEvent, metricAgent, {
  outputs: [StopEvent],
});

// Usage
async function main() {
  const emailText = "Click here to claim your free prize: [link]";
  const results = await Promise.all(
    Object.keys(models).map((model) =>
      cyberSecurityAnalysisWorkflow.run(
        new StartEvent({ input: { model: model, text: emailText } }),
      ),
    ),
  );

  results.forEach((result) => {
    console.log("Results:", result);
    // if (result instanceof StopEvent<TStopEvent>) {
    //   console.log(`${result}: ${result.data}`);
    // } else if (result instanceof MetricEvent) {
    //   console.log(`${result.data.model}:`);
    //   console.log("Threat Category:", result.data.category);
    //   console.log("Metrics:", result.data.metrics);
    // }
  });
}

main().catch(console.error);
