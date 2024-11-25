import { initObservability } from "@/app/observability";
import { Message } from "ai";
import { Settings } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
// import { createWorkflow } from "./workflow/threatFactory";
// import { createWorkflow } from "./workflow/factory";
import { StartEvent, Workflow } from "@llamaindex/core/workflow";
import { ModelManager } from "./workflow/models";
import { createWorkflow } from "./workflow/threatFactory2";
import { runWorkflowsForAllModels } from "./workflow/utils";
initObservability();
// initSettings();


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
