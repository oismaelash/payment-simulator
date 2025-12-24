import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import type { GatewayAdapter } from "@payment-simulator/core";
import { CANONICAL_EVENT } from "@payment-simulator/core";

function getRepoRoot(): string {
  // When running via npm workspaces, INIT_CWD points to the original invocation directory (repo root).
  // Fallback for local execution from packages/ui.
  return process.env.INIT_CWD ?? resolve(process.cwd(), "../..");
}

function getAsaasPayloadsDir(): string {
  return resolve(getRepoRoot(), "packages/gateways/asaas/payloads");
}

/**
 * Asaas gateway adapter
 * Supports any event that has a corresponding payload JSON file in:
 *   packages/gateways/asaas/payloads/{event}.json
 */
export class AsaasAdapter implements GatewayAdapter {
  private headers: Record<string, string> = {};

  constructor() {
    this.loadHeaders();
  }

  private loadHeaders(): void {
    try {
      const headersPath = resolve(
        getRepoRoot(),
        "packages/gateways/asaas/headers.json"
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
      const dir = getAsaasPayloadsDir();
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
      getAsaasPayloadsDir(),
      `${event}.json`
    );
    if (!existsSync(payloadFile)) return null;

    return {
      canonicalEvent: CANONICAL_EVENT,
      payloadFile,
      headers: { ...this.headers },
    };
  }
}




