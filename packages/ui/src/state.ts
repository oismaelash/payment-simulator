/**
 * In-memory state for webhook URL and logs
 * No persistence layer - resets on server restart
 */

export interface WebhookLog {
  id?: number;
  gateway: string;
  event: string;
  timestamp: string;
  httpStatus: number;
  ok: boolean;
  responseBody?: string;
  error?: string;
  url?: string;
  headers?: Record<string, string>;
}

class State {
  private webhookUrl: string | null = null; // Legacy: kept for backward compatibility
  private webhookUrlsByGateway: Record<string, string> = {};
  private webhookHeadersByGateway: Record<string, Record<string, string>> = {};
  private logs: WebhookLog[] = [];

  // Legacy methods (for backward compatibility)
  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }

  getWebhookUrl(): string | null {
    return this.webhookUrl;
  }

  // New per-gateway methods
  setWebhookUrlForGateway(gateway: string, url: string): void {
    this.webhookUrlsByGateway[gateway] = url;
  }

  getWebhookUrlForGateway(gateway: string): string | null {
    return this.webhookUrlsByGateway[gateway] || null;
  }

  setWebhookHeadersForGateway(gateway: string, headers: Record<string, string>): void {
    this.webhookHeadersByGateway[gateway] = { ...headers };
  }

  getWebhookHeadersForGateway(gateway: string): Record<string, string> {
    return this.webhookHeadersByGateway[gateway] || {};
  }

  addLog(log: WebhookLog): void {
    this.logs.push(log);
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  getLogs(): WebhookLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Singleton instance
export const state = new State();

