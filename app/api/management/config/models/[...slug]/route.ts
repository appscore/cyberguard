import { NextRequest, NextResponse } from "next/server";
import { createRecord, createRecordWithId, deleteRecord, findById, updateRecord } from "@/app/lib/csvHandler";

/**
 * This API is to get model from the backend envs and expose them to the frontend
 */
const apiUrl = process.env.MODEL_CONFIG_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  const id = params.slug[0];
  if (id && !isNaN(Number(id))) {
    const record = await findById(id);
    if (record) {
      return NextResponse.json(record, { status: 200 });
    }
  }
  else {
    return NextResponse.json(
      { error: "Model not found" },
      { status: 404 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  const id = params.slug[0];
  if (id && !isNaN(Number(id))) {
    const foundModel = await findById(id);
    if (foundModel) {
      const deleted = await deleteRecord(id);
      if (deleted) {
        return NextResponse.json(foundModel, { status: 200 });
      }
    }
  }

  return NextResponse.json(
    { error: "Model not found" },
    { status: 404 },
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string[] } }) {
  try {
    const id = params.slug[0];
    if (id && !isNaN(Number(id))) {
      const reqBody = await request.json();
      console.log("request ", JSON.stringify(reqBody));
      const { model_provider, model, api_key } = reqBody;
      if (!model_provider || !model || !api_key) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      let updatedModel = await updateRecord(id, {
        model_provider,
        model,
        api_key
      });

      if (!updatedModel) {
        updatedModel = await createRecordWithId(id, {
          model_provider,
          model,
          api_key
        });
      }
      return NextResponse.json(updatedModel, { status: 200 });
    }
    else {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Update Model", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}