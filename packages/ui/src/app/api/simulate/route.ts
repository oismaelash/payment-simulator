import { NextRequest, NextResponse } from "next/server";
import { simulate } from "@payment-simulator/core";
import { state } from "@/state";
import { getGatewayAdapter } from "@/gateways";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      gateway,
      event,
      payloadOverride,
      webhookUrl: webhookUrlFromClient,
      extraHeaders: extraHeadersFromClient,
    } = body;

    if (!gateway || !event) {
      return NextResponse.json(
        { error: "Invalid request: 'gateway' and 'event' are required" },
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

    // Client is source of truth: always prefer client-provided config when available
    let webhookUrl: string | null = null;

    if (typeof webhookUrlFromClient === "string" && webhookUrlFromClient.trim().length > 0) {
      // Client provided URL - use it and update server state
      webhookUrl = webhookUrlFromClient.trim();
      state.setWebhookUrlForGateway(gateway, webhookUrl);
    } else {
      // Fallback to server state if client didn't provide
      webhookUrl =
        state.getWebhookUrlForGateway(gateway) ||
        state.getWebhookUrl() ||
        null;
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Webhook URL not configured. Please set it first." },
        { status: 400 }
      );
    }

    // Client is source of truth: always prefer client-provided headers when available
    let extraHeaders: Record<string, string> = {};

    if (
      extraHeadersFromClient &&
      typeof extraHeadersFromClient === "object" &&
      !Array.isArray(extraHeadersFromClient)
    ) {
      // Client provided headers (even if empty object) - use them and update server state
      extraHeaders = extraHeadersFromClient;
      state.setWebhookHeadersForGateway(gateway, extraHeaders);
    } else {
      // Fallback to server state if client didn't provide
      extraHeaders = state.getWebhookHeadersForGateway(gateway);
    }

    let result;
    let finalHeaders: Record<string, string> = {};
    let finalUrl = webhookUrl;

    // If payloadOverride is provided, send it directly
    if (payloadOverride !== undefined) {
      try {
        const eventDef = adapter.getEventDefinition(event);
        if (!eventDef) {
          return NextResponse.json(
            { error: `Event "${event}" not found for gateway "${gateway}"` },
            { status: 400 }
          );
        }

        // Stringify the payload override
        const payloadString = JSON.stringify(payloadOverride, null, 2);

        // Prepare headers: Content-Type -> gateway headers -> custom headers (custom overrides gateway)
        finalHeaders = {
          "Content-Type": "application/json",
          ...eventDef.headers,
          ...extraHeaders,
        };

        // POST to webhook URL
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: finalHeaders,
          body: payloadString,
        });

        const responseBody = await response.text().catch(() => "");

        result = {
          status: response.status,
          ok: response.status === 200,
          responseBody,
        };
      } catch (error) {
        result = {
          status: 0,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    } else {
      // Use the standard simulate function, but we need to merge headers manually
      // since simulate doesn't support extraHeaders yet
      try {
        const eventDef = adapter.getEventDefinition(event);
        if (!eventDef) {
          return NextResponse.json(
            { error: `Event "${event}" not found for gateway "${gateway}"` },
            { status: 400 }
          );
        }

        // Read payload file as raw text (same as simulate does)
        const { readFileSync } = await import("fs");
        const payload = readFileSync(eventDef.payloadFile, "utf-8");

        // Prepare headers: Content-Type -> gateway headers -> custom headers
        finalHeaders = {
          "Content-Type": "application/json",
          ...eventDef.headers,
          ...extraHeaders,
        };

        // POST to webhook URL
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: finalHeaders,
          body: payload,
        });

        let responseBody: string | undefined;
        try {
          responseBody = await response.text();
        } catch {
          responseBody = undefined;
        }

        result = {
          status: response.status,
          ok: response.status === 200,
          responseBody,
        };
      } catch (error) {
        result = {
          status: 0,
          ok: false,
          responseBody: undefined,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    // Log the result
    state.addLog({
      gateway,
      event,
      timestamp: new Date().toISOString(),
      httpStatus: result.status,
      ok: result.ok,
      responseBody: result.responseBody,
      error: result.error,
      url: finalUrl,
      headers: finalHeaders,
    });

    return NextResponse.json({
      success: result.ok,
      status: result.status,
      responseBody: result.responseBody,
      error: result.error,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}

