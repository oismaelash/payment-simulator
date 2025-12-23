import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { getGatewayAdapter } from "@/gateways";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const gateway = searchParams.get("gateway");
    const event = searchParams.get("event");

    if (!gateway || !event) {
      return NextResponse.json(
        { error: "Missing 'gateway' or 'event' query parameter" },
        { status: 400 }
      );
    }

    const adapter = getGatewayAdapter(gateway);
    if (!adapter) {
      return NextResponse.json(
        { error: `Gateway "${gateway}" not found` },
        { status: 400 }
      );
    }

    const eventDef = adapter.getEventDefinition(event);
    if (!eventDef) {
      return NextResponse.json(
        { error: `Event "${event}" not found for gateway "${gateway}"` },
        { status: 400 }
      );
    }

    // Read payload file as raw text
    const payload = readFileSync(eventDef.payloadFile, "utf-8");

    return NextResponse.json({ payload });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load payload",
      },
      { status: 500 }
    );
  }
}

