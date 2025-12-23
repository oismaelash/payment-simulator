/**
 * Webhook configuration model and persistence helpers
 * Supports per-gateway configuration: URL base, query params, and headers
 */

export interface WebhookGatewayConfig {
  urlBase: string;
  queryParams: Array<{ key: string; value: string }>;
  headers: Array<{ key: string; value: string }>;
}

export type WebhookConfigV2 = Record<string, WebhookGatewayConfig>;

const STORAGE_KEY = "webhookConfigV2";
const LEGACY_STORAGE_KEY = "webhookUrl";

/**
 * Get default empty config for a gateway
 */
function getDefaultConfig(): WebhookGatewayConfig {
  return {
    urlBase: "",
    queryParams: [],
    headers: [],
  };
}

/**
 * Migrate legacy webhookUrl to new format
 * If webhookUrl exists, populate all gateways with it
 */
function migrateLegacyConfig(): WebhookConfigV2 | null {
  if (typeof window === "undefined") return null;

  try {
    const legacyUrl = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyUrl) return null;

    // Get list of gateways from meta API (we'll fetch this in the component)
    // For now, return null and let the component handle migration after fetching gateways
    return null;
  } catch {
    return null;
  }
}

/**
 * Get all webhook configurations from localStorage
 */
export function getWebhookConfig(): WebhookConfigV2 {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Try to migrate legacy config
    const legacyUrl = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyUrl) {
      // Return empty - component will handle migration after fetching gateways
      return {};
    }

    return {};
  } catch {
    return {};
  }
}

/**
 * Get config for a specific gateway
 */
export function getGatewayConfig(gateway: string): WebhookGatewayConfig {
  const config = getWebhookConfig();
  return config[gateway] || getDefaultConfig();
}

/**
 * Save webhook configuration
 */
export function saveWebhookConfig(config: WebhookConfigV2): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save webhook config:", error);
  }
}

/**
 * Save config for a specific gateway
 */
export function saveGatewayConfig(gateway: string, config: WebhookGatewayConfig): void {
  const allConfig = getWebhookConfig();
  allConfig[gateway] = config;
  saveWebhookConfig(allConfig);
}

/**
 * Migrate legacy webhookUrl to new format for all gateways
 */
export function migrateLegacyUrlForGateways(gateways: string[]): void {
  if (typeof window === "undefined") return;

  try {
    const legacyUrl = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyUrl) return;

    const config = getWebhookConfig();
    let hasChanges = false;

    // Populate all gateways with legacy URL if they don't have one
    for (const gateway of gateways) {
      if (!config[gateway] || !config[gateway].urlBase) {
        if (!config[gateway]) {
          config[gateway] = getDefaultConfig();
        }
        config[gateway].urlBase = legacyUrl.trim();
        hasChanges = true;
      }
    }

    if (hasChanges) {
      saveWebhookConfig(config);
    }
  } catch (error) {
    console.error("Failed to migrate legacy config:", error);
  }
}

/**
 * Build final URL with query params
 */
export function buildWebhookUrl(config: WebhookGatewayConfig): string {
  if (!config.urlBase) return "";

  try {
    const url = new URL(config.urlBase);
    
    // Clear existing query params and add new ones
    url.search = "";
    for (const param of config.queryParams) {
      if (param.key.trim()) {
        url.searchParams.set(param.key.trim(), param.value.trim());
      }
    }

    return url.toString();
  } catch {
    // If URL parsing fails, return base URL as-is
    return config.urlBase;
  }
}

/**
 * Convert headers array to Record
 */
export function headersArrayToRecord(headers: Array<{ key: string; value: string }>): Record<string, string> {
  const record: Record<string, string> = {};
  for (const header of headers) {
    if (header.key.trim()) {
      record[header.key.trim()] = header.value.trim();
    }
  }
  return record;
}

/**
 * Convert headers Record to array
 */
export function headersRecordToArray(headers: Record<string, string>): Array<{ key: string; value: string }> {
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}

