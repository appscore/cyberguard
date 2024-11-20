import {
  Context,
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/core/workflow";
import { Message } from "ai";
import { Settings } from "llamaindex";

const TIMEOUT = 360 * 1000;

class ThreatAnalysisEvent extends WorkflowEvent<{ input: string }> {}
class ClassificationEvent extends WorkflowEvent<{
  input: string;
  threat: boolean;
  reason: string;
}> {}
class MetricGenerationEvent extends WorkflowEvent<{
  input: string;
  category: string;
  reason: string;
}> {}

export const createWorkflow = (messages: Message[], params?: any) => {
  const runAgent = async (
    context: Context,
    agentPrompt: string, // Prompt for the agent
    input: string, // Input to the agent
  ) => {
    const llm = Settings.llm;
    const result = await llm.complete({ prompt: agentPrompt });
    return result.text.trim();
  };

  const start = async (context: Context, ev: StartEvent) => {
    console.log("start flow");
    context.set("input", ev.data.input);
    return new ThreatAnalysisEvent({ input: ev.data.input });
  };

  const analyzeThreat = async (context: Context, ev: ThreatAnalysisEvent) => {
    console.log("analyzeThreat flow");
    const agentPrompt = `Analyze the following text for potential cybersecurity threats:
  "${ev.data.input}"
  
  Instructions:
  1. Determine if this is a phishing attempt, spam, scam, or other cybersecurity threat
  2. Respond in this format:
     - First line: "Yes" or "No" indicating if it's a threat
     - Following lines: Detailed explanation of why you made this determination
  
  Be specific about the warning signs or safe indicators you identified.`;
    const analysisResult = await runAgent(context, agentPrompt, ev.data.input);
    const isThreat = analysisResult.startsWith("Yes"); // Check first line

    if (!isThreat) return new StopEvent({ result: analysisResult });

    const reason = analysisResult
      .replace("Yes", "")
      .replace("threat", "")
      .trim();
    return new ClassificationEvent({
      input: ev.data.input,
      threat: isThreat,
      reason: reason,
    });
  };

  const classifyThreat = async (context: Context, ev: ClassificationEvent) => {
    console.log("classifyThreat flow");
    const agentPrompt = `Classify the following potential cybersecurity threat into one of these categories:
- Phishing: Attempts to steal sensitive information by impersonating legitimate entities
- Scam: Fraudulent schemes designed to deceive for financial gain
- Spam: Unsolicited bulk messages, often commercial
- Malware: Messages containing or linking to harmful software
- Other: Any other cyber threat (specify the type)

Text to analyze: "${ev.data.input}"
Previous analysis: ${ev.data.reason}

Respond with:
1. Category name (one of the above)
2. Confidence level (high/medium/low)
3. Brief explanation of why this classification was chosen`;

    const classificationResult = await runAgent(
      context,
      agentPrompt,
      ev.data.input,
    );
    const category = classificationResult.split("\n")[0].trim(); // Extract category
    context.set("category", category); // Store for later use
    return new MetricGenerationEvent({
      input: ev.data.input,
      category: category,
      reason: ev.data.reason,
    });
  };

  const generateMetrics = async (
    context: Context,
    ev: MetricGenerationEvent,
  ) => {
    console.log("generateMetrics flow");
    const agentPrompt = `Generate quantitative risk metrics for this ${ev.data.category} cybersecurity threat.

  Input Text: "${ev.data.input}"
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
    const metricsResult = await runAgent(context, agentPrompt, ev.data.input);
    return new StopEvent({ result: metricsResult });
  };

  const workflow = new Workflow({ timeout: TIMEOUT, validate: true });
  workflow.addStep(StartEvent, start, { outputs: ThreatAnalysisEvent });
  workflow.addStep(ThreatAnalysisEvent, analyzeThreat, {
    outputs: [ClassificationEvent, StopEvent],
  });
  workflow.addStep(ClassificationEvent, classifyThreat, {
    outputs: MetricGenerationEvent,
  });
  workflow.addStep(MetricGenerationEvent, generateMetrics, {
    outputs: StopEvent,
  });

  return workflow;
};

// const data = {
//     message: 'xyz',
//     data:: [{
//         categorization: "",
//         Severity: 70,
//         Sophistication: 60
//     },{

//     }]
// }
