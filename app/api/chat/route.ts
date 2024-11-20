import { initObservability } from "@/app/observability";
import { Message } from "ai";
import { OpenAI } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { initSettings } from "./engine/settings";
// import { createWorkflow } from "./workflow/threatFactory";
// import { createWorkflow } from "./workflow/factory";
import { createWorkflow } from "./workflow/threatFactory2";
initObservability();
initSettings();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const models: any = {
  openai: {
    name: "gpt-3.5-turbo",
    instance: new OpenAI({ model: "gpt-4o" }),
  },
  // gemini: {
  //   name: "gemini",
  //   instance: new Gemini({ model: GEMINI_MODEL.GEMINI_PRO }),
  // }, // Create Gemini instance
};

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
    const agent = createWorkflow(messages, data);
    // TODO: fix type in agent.run in LITS
    // const result = agent.run<AsyncGenerator<ChatResponseChunk>>(
    //   userMessage.content,
    // ) as unknown as Promise<StopEvent<AsyncGenerator<ChatResponseChunk>>>;
    const result = await agent.run(userMessage.content);
    return NextResponse.json({
      success: true,
      result: result.data.result,
    });
    // console.log("Result:", result);
    // // convert the workflow events to a vercel AI stream data object
    // const agentStreamData = await workflowEventsToStreamData(
    //   agent.streamEvents(),
    // );
    // // convert the workflow result to a vercel AI content stream
    // const stream = toDataStream(result, {
    //   onFinal: () => agentStreamData.close(),
    // });
    // return new StreamingTextResponse(stream, {}, agentStreamData);
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
