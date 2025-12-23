import { NextResponse } from "next/server";
import { gatewayAdapters, getSupportedGateways } from "@/gateways";

export async function GET() {
  const gateways = getSupportedGateways();
  const meta: Record<string, { events: string[] }> = {};

  for (const gateway of gateways) {
    const adapter = gatewayAdapters[gateway];
    if (adapter) {
      meta[gateway] = {
        events: adapter.getSupportedEvents(),
      };
    }
  }

  return NextResponse.json({ gateways: meta });
}

