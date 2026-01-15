import { StripeAdapter } from "@payment-simulator/gateway-stripe";
import { AbacatePayAdapter } from "@payment-simulator/gateway-abacatepay";
import { AsaasAdapter } from "@payment-simulator/gateway-asaas";
import { MercadoPagoAdapter } from "@payment-simulator/gateway-mercadopago";
import { PagarmeAdapter } from "@payment-simulator/gateway-pagarme";
import { PagueDevAdapter } from "@payment-simulator/gateway-paguedev";
import type { GatewayAdapter } from "@payment-simulator/core";

/**
 * Registry of gateway adapters
 */
export const gatewayAdapters: Record<string, GatewayAdapter> = {
  stripe: new StripeAdapter(),
  abacatepay: new AbacatePayAdapter(),
  asaas: new AsaasAdapter(),
  mercadopago: new MercadoPagoAdapter(),
  pagarme: new PagarmeAdapter(),
  paguedev: new PagueDevAdapter(),
};

export function getGatewayAdapter(gateway: string): GatewayAdapter | null {
  return gatewayAdapters[gateway] || null;
}

export function getSupportedGateways(): string[] {
  return Object.keys(gatewayAdapters);
}

