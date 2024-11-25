import { StartEvent, Workflow } from "@llamaindex/core/workflow";
import { Settings } from "llamaindex";
import { ModelManager } from "./models";
import { createWorkflow } from "./threatFactory2";

const modelManager = new ModelManager();
modelManager.initModels();

interface ModelWorkflow {
  model: string;
  data?: any;
  error?: string;
}

async function runWorkflowForModel(
  workflow: Workflow,
  modelName: string,
  input: string,
): Promise<ModelWorkflow> {
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

export async function runWorkflowsForAllModels(
  input: string,
): Promise<ModelWorkflow[]> {
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
