import { GEMINI_MODEL, OpenAI } from "llamaindex";
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
    // const openai = new OpenAI({
    //   model: process.env.MODEL ?? "gpt-4o-mini",
    //   maxTokens: process.env.LLM_MAX_TOKENS
    //     ? Number(process.env.LLM_MAX_TOKENS)
    //     : undefined,
    // });
    // [
    //   {
    //     id: "1",
    //     model_provider: "openai",
    //     model: "gpt-4o-mini",
    //     api_key: "sk-sample-1",
    //   },
    //   {
    //     id: "3",
    //     model_provider: "gemini",
    //     model: "gemini-1.0-pro",
    //     api_key: "AIzaSyCXHyp-rUyQ3og8FVQKNk0sbecigDw0kvU",
    //   },
    // ];

    // const gemini = new Gemini({
    //   model: GEMINI_MODEL.GEMINI_PRO_1_5_FLASH,
    // });
    // const modelConfigs: Model[] = await readCSV();
    const DEFAULT_MODEL = "gpt-4o-2024-11-20";
    // for (const model of modelConfigs) {
    //   if (model.model_provider === "openai") {
    //     const openai = new OpenAI({
    //       model: model.model,
    //       apiKey: model.api_key,
    //     });
    //     this.llmModels[model.model_provider] = openai;
    //   }
    //   if (model.model_provider === "gemini") {
    //     const gemini = new Gemini({
    //       model: model.model,
    //     });
    //   }
    //

    //   this.llmModels
    // }
    this.llmModels["openai"] = new OpenRouterLLM({
      model: "openai/gpt-4o-2024-11-20",
    });
    this.llmModels["gemini"] = new OpenRouterLLM({
      model: "google/gemini-flash-1.5-8b",
    });
    this.llmModels["claude"] = new OpenRouterLLM({
      model: "anthropic/claude-3.5-haiku-20241022:beta",
    });
    // this.llmModels["openai"] = openai;
    // this.llmModels["gemini"] = gemini;
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
