import { readFileSync } from "fs";
import { resolve } from "path";
import type { GatewayAdapter } from "@payment-simulator/core";
import { CANONICAL_EVENT } from "@payment-simulator/core";

function getRepoRoot(): string {
  return process.env.INIT_CWD ?? resolve(process.cwd(), "../..");
}

/**
 * AbacatePay gateway adapter
 * Supports: billing.paid variants (PIX QR Code, PIX Billing) and withdraw events
 */
export class AbacatePayAdapter implements GatewayAdapter {
  private readonly supportedEvents = [
    "billing.paid.pix.qrcode",
    "billing.paid.pix.billing",
    "withdraw.done",
    "withdraw.failed",
  ];

  private headers: Record<string, string> = {};

  constructor() {
    this.loadHeaders();
  }

  private loadHeaders(): void {
    try {
      const headersPath = resolve(
        getRepoRoot(),
        "packages/gateways/abacatepay/headers.json"
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
    return this.supportedEvents;
  }

  getEventDefinition(event: string) {
    if (!this.supportedEvents.includes(event)) {
      return null;
    }

    // Map event names to payload file names
    const payloadFileMap: Record<string, string> = {
      "billing.paid.pix.qrcode": "billing.paid.pix.qrcode.json",
      "billing.paid.pix.billing": "billing.paid.pix.billing.json",
      "withdraw.done": "withdraw.done.json",
      "withdraw.failed": "withdraw.failed.json",
    };

    const payloadFileName = payloadFileMap[event];
    if (!payloadFileName) {
      return null;
    }

    const payloadFile = resolve(
      getRepoRoot(),
      "packages/gateways/abacatepay/payloads",
      payloadFileName
    );

    return {
      canonicalEvent: CANONICAL_EVENT,
      payloadFile,
      headers: { ...this.headers },
    };
  }
}

