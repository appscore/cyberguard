import { WorkflowEvent } from "@llamaindex/core/workflow";

export interface AgentCondition {
  condition: string; // The condition as a string (e.g., "result.startsWith('High')")
  next_agent: string; // ID of the next agent to invoke if the condition is true
}

export interface AgentConfig {
  id: string; // Unique identifier for the agent
  name: string; // Human-readable name
  prompt: string; // Instruction prompt for the agent
  conditions?: AgentCondition[]; // Optional conditions for branching
  next_agents?: string[]; // Default next agents (if no conditions are met)
}

export interface WorkflowConfig {
  workflow_name: string; // Workflow name
  timeout: number; // Workflow timeout in milliseconds
  agents: AgentConfig[]; // List of agents in the workflow
}

export declare class DynamicWorkflowEvent extends WorkflowEvent {
  type?: string; // Add a 'type' property for identifying event types dynamically
  input?: string;
  result?: any;
}
