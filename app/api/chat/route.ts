import { initObservability } from "@/app/observability";
import { Message } from "ai";
import { Settings } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
// import { createWorkflow } from "./workflow/threatFactory";
// import { createWorkflow } from "./workflow/factory";
import { StartEvent, Workflow } from "@llamaindex/core/workflow";
import { ModelManager } from "./workflow/models";
import { createWorkflow } from "./workflow/threatFactory2";
initObservability();
// initSettings();
const modelManager = new ModelManager();
modelManager.initModels();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, data }: { messages: Message[]; data?: any } = body;
    const userMessage = messages.pop();
    if (!messages || !userMessage || userMessage.role !== "user") {
      return NextResponse.json(
        {
          error:
            "messages are required in the request body and the last message must be from the user",
        },
        { status: 400 },
      );
    }

    // const agent = createWorkflow(messages, data);

    const workflowResponse = await runWorkflowsForAllModels(
      userMessage.content,
    );
    return NextResponse.json({
      success: true,
      data: { text: userMessage.content, result: workflowResponse },
    });
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return NextResponse.json(
      {
        detail: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}

async function runWorkflowForModel(
  workflow: Workflow,
  modelName: string,
  input: string,
) {
  console.log(`Running workflow for model: ${modelName}`);

  // Set the active model in Settings before running the workflow
  Settings.llm = modelManager.getLLM(modelName);

  try {
    // Start the workflow
    const startEvent = new StartEvent({ input });
    const workflowResponse = await workflow.run(startEvent);

    console.log(`Workflow completed for model: ${modelName}`);
    return {
      model: modelName,
      data: workflowResponse.data.result,
    };
  } catch (error: any) {
    console.error(`Error running workflow for model ${modelName}:`, error);
    return { model: modelName, error: error.message };
  }
}

async function runWorkflowsForAllModels(input: string) {
  // Initialize the workflow
  const workflow = createWorkflow();

  // Get all model names
  const llmModels = modelManager.getAllLLMs();

  const results = [];
  for (const modelName of Object.keys(llmModels)) {
    const result = await runWorkflowForModel(workflow, modelName, input);
    results.push(result);
  }

  return results;
}
