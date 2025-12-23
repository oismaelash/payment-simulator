import { readFileSync } from "fs";
import type { CanonicalEvent } from "./canonical-event";

export interface GatewayAdapter {
  /**
   * Get the list of supported gateway event names
   */
  getSupportedEvents(): string[];

  /**
   * Get event definition for a specific gateway event
   * Returns null if event is not supported
   */
  getEventDefinition(event: string): {
    canonicalEvent: CanonicalEvent;
    payloadFile: string;
    headers: Record<string, string>;
    method?: "GET" | "POST";
  } | null;
}

export interface SimulateOptions {
  gateway: string;
  event: string;
  webhookUrl: string;
  adapter: GatewayAdapter;
}

export interface SimulateResult {
  status: number;
  ok: boolean;
  responseBody?: string;
  error?: string;
}

/**
 * Simulates sending a webhook by:
 * 1. Getting event definition from adapter
 * 2. Reading payload file as raw text
 * 3. POSTing to webhook URL with adapter headers (or GET with querystring for IPN)
 */
export async function simulate({
  gateway,
  event,
  webhookUrl,
  adapter,
}: SimulateOptions): Promise<SimulateResult> {
  try {
    const eventDef = adapter.getEventDefinition(event);
    if (!eventDef) {
      return {
        status: 0,
        ok: false,
        error: `Event "${event}" not found for gateway "${gateway}"`,
      };
    }

    const method = eventDef.method || "POST";

    // Read payload file as raw text (no modification)
    // payloadFile is already an absolute path from the adapter
    const payload = readFileSync(eventDef.payloadFile, "utf-8");

    let finalUrl = webhookUrl;
    let headers: Record<string, string> = { ...eventDef.headers };
    let body: string | undefined;

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
        body = undefined;
      } catch {
        // If payload is not valid JSON, use it as-is in querystring
        // This shouldn't happen for IPN events, but handle gracefully
        finalUrl = webhookUrl;
        body = undefined;
      }
    } else {
      // POST: send JSON body
      headers["Content-Type"] = "application/json";
      body = payload;
    }

    // Send request
    const response = await fetch(finalUrl, {
      method,
      headers,
      body,
    });

    let responseBody: string | undefined;
    try {
      responseBody = await response.text();
    } catch {
      responseBody = undefined;
    }

    return {
      status: response.status,
      ok: response.status === 200,
      responseBody,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      responseBody: undefined,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

