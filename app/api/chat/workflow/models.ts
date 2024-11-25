import { GEMINI_MODEL } from "llamaindex";
import { readCSV } from "../../../lib/csvHandler";
import { OpenRouterLLM } from "../utils/open-router";
interface Model {
  id: string;
  model_provider: string;
  model: string | GEMINI_MODEL;
  api_key: string;
}
export class ModelManager {
  private llmModels: { [key: string]: any } = {};
  private embedModels: { [key: string]: any } = {};

  async initModels() {
    const models: any[] = await readCSV();
    for (const model of models) {
      this.llmModels[model.model_provider] = new OpenRouterLLM({
        model: model.model,
      });
    }
    // this.llmModels["openai"] = new OpenRouterLLM({
    //   model: "openai/gpt-4o-2024-11-20",
    // });
    // this.llmModels["gemini"] = new OpenRouterLLM({
    //   model: "google/gemini-flash-1.5-8b",
    // });
    // this.llmModels["claude"] = new OpenRouterLLM({
    //   model: "anthropic/claude-3.5-haiku-20241022:beta",
    // });
  }
  addLLM(name: string, model: any) {
    this.llmModels[name] = model;
  }

  addEmbedModel(name: string, model: any) {
    this.embedModels[name] = model;
  }

  getLLM(name: string): any {
    return this.llmModels[name];
  }

  getEmbedModel(name: string): any {
    return this.embedModels[name];
  }

  getAllLLMs(): { [key: string]: any } {
    return this.llmModels;
  }

  getAllEmbedModels(): { [key: string]: any } {
    return this.embedModels;
  }
}
