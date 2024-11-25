import {
  ToolCallLLM,
  ToolCallLLMMessageOptions,
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMMetadata,
} from "@llamaindex/core/llms";
import { extractText } from "@llamaindex/core/utils";
import { Tokenizers } from "@llamaindex/env";

type OpenRouterAdditionalMetadata = object;

type OpenRouterChatOptions = {
  apiKey?: string;
  apiUrl?: string;
  additionalHeaders?: Record<string, string>;
};

export class OpenRouterLLM extends ToolCallLLM<OpenRouterChatOptions> {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP: number;
  apiKey: string;
  apiUrl: string;
  additionalHeaders?: Record<string, string>;
  heliconeApiKey?: string;

  constructor(init?: Partial<OpenRouterLLM>) {
    super();
    this.model = init?.model ?? "gpt-4o-2024-11-20";
    this.temperature = init?.temperature ?? 0.7;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.apiKey = init?.apiKey ?? process.env.OPENROUTER_API_KEY!;
    this.apiUrl = init?.apiUrl ?? "https://openrouter.helicone.ai/api/v1/chat/completions";
    this.additionalHeaders = init?.additionalHeaders;
    this.heliconeApiKey = process.env.HELICONE_API_KEY
  }

  get supportToolCall(): boolean {
    // Return true if tool calling is supported, otherwise false
    return false; // or true based on OpenRouter capabilities
  }

  get metadata(): LLMMetadata & OpenRouterAdditionalMetadata {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: 8192, // Adjust based on OpenRouter specs
      tokenizer: Tokenizers.CL100K_BASE, // Example tokenizer
    };
  }

  static toOpenRouterMessage(
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
  ): { role: string; content: string }[] {
    return messages.map((message) => ({
      role: message.role,
      content: extractText(message.content),
    }));
  }

  chat(
    params: LLMChatParamsStreaming<
      OpenRouterChatOptions,
      ToolCallLLMMessageOptions
    >,
  ): Promise<AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>>;

  chat(
    params: LLMChatParamsNonStreaming<
      OpenRouterChatOptions,
      ToolCallLLMMessageOptions
    >,
  ): Promise<ChatResponse<ToolCallLLMMessageOptions>>;

  async chat(
    params:
      | LLMChatParamsStreaming<OpenRouterChatOptions, ToolCallLLMMessageOptions>
      | LLMChatParamsNonStreaming<
          OpenRouterChatOptions,
          ToolCallLLMMessageOptions
        >,
  ): Promise<
    | ChatResponse<ToolCallLLMMessageOptions>
    | AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>
  > {
    const { messages, stream } = params;

    const payload = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: OpenRouterLLM.toOpenRouterMessage(messages),
    };

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Helicone-Auth": `Bearer ${this.heliconeApiKey}`,
      "Content-Type": "application/json",
      ...this.additionalHeaders,
    };

    if (stream) {
      // Handle streaming responses
      const response = await fetch(`${this.apiUrl}/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      return this.streamResponse(response.body!);
    }

    // Non-streaming response
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return {
      raw: data,
      message: {
        role: data.choices[0].message.role,
        content: data.choices[0].message.content,
      },
    };
  }

  // Helper to process streaming response
  private async *streamResponse(
    stream: ReadableStream,
  ): AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      try {
        // Parse the chunk assuming it's a valid JSON object
        const parsedChunk = JSON.parse(chunk);

        yield {
          raw: parsedChunk,
          delta: parsedChunk.choices[0]?.delta || {}, // Adjust based on OpenRouter streaming format
        };
      } catch (e) {
        // If the chunk is not JSON, wrap it in an object for compatibility
        yield {
          raw: { data: chunk },
          delta: chunk, // Empty delta for invalid chunks
        };
      }
    }
  }
}
