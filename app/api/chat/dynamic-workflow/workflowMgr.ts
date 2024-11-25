import {
  Context,
  EventTypes,
  StartEvent,
  StopEvent,
  Workflow,
} from "@llamaindex/core/workflow";
import { Settings } from "llamaindex";
import { AgentConfigManager } from "./agentConfigMgr";
import { AgentConfig, DynamicWorkflowEvent } from "./types";

export const createFlexibleWorkflow = async (
  dbClient: any, // Replace `any` with your database client's type
  workflowName: string,
  messages?: any[], // Replace `any` with your message type
  params?: any,
): Promise<Workflow> => {
  const configManager = new AgentConfigManager(dbClient);
  const workflowConfig = await configManager.fetchWorkflowConfig(workflowName);

  const runAgent = async (
    context: Context,
    prompt: string,
    input: string,
  ): Promise<string> => {
    const llm = Settings.llm; // Assuming `Settings.llm` is available globally
    const result = await llm.complete({ prompt });
    return result.text.trim();
  };

  const createAgentStep = (agentConfig: AgentConfig) => {
    return async (
      context: Context,
      ev: DynamicWorkflowEvent,
    ): Promise<DynamicWorkflowEvent> => {
      console.log(`Executing agent: ${agentConfig.name}`);
      const result = await runAgent(context, agentConfig.prompt, ev.data.input);
      context.set(agentConfig.id, result);

      // Check conditions for branching
      if (agentConfig.conditions) {
        for (const condition of agentConfig.conditions) {
          if (eval(condition.condition)) {
            return {
              type: condition.next_agent,
              input: ev.data.input,
              result,
            } as DynamicWorkflowEvent;
          }
        }
      }

      // Default next agent if no condition is met
      if (agentConfig.next_agents && agentConfig.next_agents.length > 0) {
        return {
          type: agentConfig.next_agents[0],
          input: ev.data.input,
          result,
        } as DynamicWorkflowEvent;
      }

      // End workflow if no further agents are specified
      return new StopEvent({ result });
    };
  };

  const workflow = new Workflow({
    timeout: workflowConfig.timeout,
    validate: true,
  });

  // Add the initial step
  workflow.addStep(StartEvent, async (context: Context, ev: StartEvent) => {
    console.log("Workflow started");
    context.set("input", ev.data.input);

    // Ensure the returned object matches DynamicWorkflowEvent
    return {
      type: workflowConfig.agents[0].id, // Ensure this is a string
      input: ev.data.input, // Ensure this is a string
    } as DynamicWorkflowEvent; // Cast to the correct type
  });

  // Dynamically add steps for each agent
  workflowConfig.agents.forEach((agentConfig) => {
    const agentFunction = createAgentStep(agentConfig);

    // Use the eventTypeMap to get the corresponding event class constructor
    const eventClass = eventTypeMap[agentConfig.id];

    if (!eventClass) {
      throw new Error(`Event class for ${agentConfig.id} not found`);
    }

    // Update outputs to use class constructors instead of strings
    const outputs = [
      ...(agentConfig.conditions || []).map(
        (cond) => eventTypeMap[cond.next_agent],
      ),
      ...(agentConfig.next_agents || []).map((id) => eventTypeMap[id]),
    ];

    workflow.addStep(eventClass, agentFunction, {
      outputs: outputs,
    });
  });
  return workflow;
};

const eventTypeMap: Record<string, EventTypes> = {
  StartEvent: StartEvent, // You should replace `StartEvent` with your actual event classes
  StopEvent: StopEvent,
  DynamicWorkflowEvent: DynamicWorkflowEvent,
  // Add other mappings as necessary
};
