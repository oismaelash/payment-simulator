import { NextRequest, NextResponse } from "next/server";
import { simulate } from "@payment-simulator/core";
import { webhookConfig, webhookLogs } from "@/db/sqlite";
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
    let urlBase: string | null = null;

    if (typeof webhookUrlFromClient === "string" && webhookUrlFromClient.trim().length > 0) {
      // Client provided URL - use it and update server state
      webhookUrl = webhookUrlFromClient.trim();
      urlBase = webhookUrl; // Default urlBase to url if not provided separately
      // Note: We'll save this after we get the full config
    } else {
      // Fallback to server state if client didn't provide
      const config = webhookConfig.get(gateway);
      if (config) {
        webhookUrl = config.url;
        urlBase = config.urlBase;
      }
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
      // Save config to DB if client provided URL or headers
      if (webhookUrlFromClient) {
        webhookConfig.set(gateway, webhookUrl, urlBase || webhookUrl, extraHeaders);
      }
    } else {
      // Fallback to server state if client didn't provide
      const config = webhookConfig.get(gateway);
      if (config) {
        extraHeaders = config.headers;
      }
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

        const method = eventDef.method || "POST";

        // Prepare headers: gateway headers -> custom headers (custom overrides gateway)
        finalHeaders = {
          ...eventDef.headers,
          ...extraHeaders,
        };

        if (method === "GET") {
          // For GET requests, convert payload override to querystring
          const queryParams = new URLSearchParams();
          for (const [key, value] of Object.entries(payloadOverride)) {
            if (value !== null && value !== undefined) {
              queryParams.append(key, String(value));
            }
          }
          const queryString = queryParams.toString();
          finalUrl = queryString ? `${webhookUrl}?${queryString}` : webhookUrl;

          const response = await fetch(finalUrl, {
            method: "GET",
            headers: finalHeaders,
          });

          const responseBody = await response.text().catch(() => "");

          result = {
            status: response.status,
            ok: response.status === 200,
            responseBody,
          };
        } else {
          // POST: send JSON body
          finalHeaders["Content-Type"] = "application/json";
          const payloadString = JSON.stringify(payloadOverride, null, 2);

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
        }
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

        const method = eventDef.method || "POST";

        // Read payload file as raw text (same as simulate does)
        const { readFileSync } = await import("fs");
        const payload = readFileSync(eventDef.payloadFile, "utf-8");

        // Prepare headers: gateway headers -> custom headers
        finalHeaders = {
          ...eventDef.headers,
          ...extraHeaders,
        };

        if (method === "GET") {
          // For GET requests, convert payload JSON to querystring
          try {
            const payloadObj = JSON.parse(payload);
            const queryParams = new URLSearchParams();
            for (const [key, value] of Object.entries(payloadObj)) {
              if (value !== null && value !== undefined) {
                queryParams.append(key, String(value));
              }
            }
            const queryString = queryParams.toString();
            finalUrl = queryString ? `${webhookUrl}?${queryString}` : webhookUrl;
          } catch {
            // If payload is not valid JSON, use URL as-is
            finalUrl = webhookUrl;
          }

          const response = await fetch(finalUrl, {
            method: "GET",
            headers: finalHeaders,
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
        } else {
          // POST: send JSON body
          finalHeaders["Content-Type"] = "application/json";

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
        }
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
    webhookLogs.add({
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

