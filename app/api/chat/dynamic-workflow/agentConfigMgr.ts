import agentConfig from "./agents.json";
import { WorkflowConfig } from "./types";
export class AgentConfigManager {
  private dbClient: any; // Replace `any` with your database client's type

  constructor(dbClient: any) {
    this.dbClient = dbClient;
  }

  async fetchWorkflowConfig(workflowName: string): Promise<WorkflowConfig> {
    // Fetch workflow configuration from the database
    const config = agentConfig; //await this.dbClient.get(`workflows/${workflowName}`);
    if (!config) {
      throw new Error(`Workflow with name ${workflowName} not found.`);
    }
    return config as WorkflowConfig;
  }
}
