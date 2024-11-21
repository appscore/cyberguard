import { Gemini, GEMINI_MODEL, OpenAI, } from "llamaindex";

export class ModelManager {
  private llmModels: { [key: string]: any } = {};
  private embedModels: { [key: string]: any } = {};

  initModels() {
    const openai = new OpenAI({
      model: process.env.MODEL ?? "gpt-4o-mini",
      maxTokens: process.env.LLM_MAX_TOKENS
        ? Number(process.env.LLM_MAX_TOKENS)
        : undefined,
    });
    const gemini = new Gemini({
      model: GEMINI_MODEL.GEMINI_PRO_1_5_FLASH,
    });
    this.llmModels["openai"] = openai;
    this.llmModels["gemini"] = gemini;
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
