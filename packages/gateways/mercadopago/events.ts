import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import type { GatewayAdapter } from "@payment-simulator/core";
import { CANONICAL_EVENT } from "@payment-simulator/core";

function getRepoRoot(): string {
  // When running via npm workspaces, INIT_CWD points to the original invocation directory (repo root).
  // Fallback for local execution from packages/gateways/mercadopago.
  return process.env.INIT_CWD ?? resolve(process.cwd(), "../..");
}

function getMercadoPagoPayloadsDir(): string {
  return resolve(getRepoRoot(), "packages/gateways/mercadopago/payloads");
}

/**
 * Mercado Pago gateway adapter
 * Supports any event that has a corresponding payload JSON file in:
 *   packages/gateways/mercadopago/payloads/{event}.json
 * 
 * For IPN events (ipn.*), the payload will be sent as GET querystring.
 * For webhook/resource events, the payload will be sent as POST JSON.
 */
export class MercadoPagoAdapter implements GatewayAdapter {
  private headers: Record<string, string> = {};

  constructor() {
    this.loadHeaders();
  }

  private loadHeaders(): void {
    try {
      const headersPath = resolve(
        getRepoRoot(),
        "packages/gateways/mercadopago/headers.json"
      );
      const headersContent = readFileSync(headersPath, "utf-8");
      this.headers = JSON.parse(headersContent);
    } catch (error) {
      // If headers.json doesn't exist yet, use empty object
      // User will add it later
      this.headers = {};
    }
  }

  getSupportedEvents(): string[] {
    try {
      const dir = getMercadoPagoPayloadsDir();
      if (!existsSync(dir)) return [];

      return readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isFile())
        .map((d) => d.name)
        .filter((name) => name.endsWith(".json"))
        .filter((name) => name !== ".gitkeep")
        .map((name) => name.replace(/\.json$/, ""))
        .sort((a, b) => a.localeCompare(b));
    } catch {
      return [];
    }
  }

  getEventDefinition(event: string) {
    const payloadFile = resolve(
      getMercadoPagoPayloadsDir(),
      `${event}.json`
    );
    if (!existsSync(payloadFile)) return null;

    // IPN events use GET method with querystring
    // All other events use POST with JSON body
    const method: "GET" | "POST" = event.startsWith("ipn.") ? "GET" : "POST";

    return {
      canonicalEvent: CANONICAL_EVENT,
      payloadFile,
      headers: { ...this.headers },
      method,
    };
  }
}

