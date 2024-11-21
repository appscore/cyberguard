import { NextRequest, NextResponse } from "next/server";
import { createRecord, readCSV } from "@/app/lib/csvHandler";

/**
 * This API is to get model from the backend envs and expose them to the frontend
 */
const apiUrl = process.env.MODEL_CONFIG_API_URL;

export async function GET() {
  const records = await readCSV();
  console.log("recordS ", JSON.stringify(records));
  return NextResponse.json(records, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    console.log("request ", JSON.stringify(reqBody));
    const { modelProvider, modelName, apiKey } = reqBody;
    if (!modelProvider || !modelName || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRecord = await createRecord({
      modelProvider,
      modelName,
      apiKey
    });

    console.log("newRecord ", JSON.stringify(newRecord));

    return NextResponse.json(newRecord, { status: 201 });

  } catch (error) {
    console.error("Update Model", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
