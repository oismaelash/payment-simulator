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
 * 3. POSTing to webhook URL with adapter headers
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

    // Read payload file as raw text (no modification)
    // payloadFile is already an absolute path from the adapter
    const payload = readFileSync(eventDef.payloadFile, "utf-8");

    // Prepare headers (include Content-Type)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...eventDef.headers,
    };

    // POST to webhook URL
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: payload,
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

