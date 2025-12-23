/**
 * Logs persistence helpers using localStorage
 */

import type { WebhookLog } from "@/state";

const STORAGE_KEY = "webhookLogs";

/**
 * Get all logs from localStorage
 */
export function getStoredLogs(): WebhookLog[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save logs to localStorage
 */
export function saveLogs(logs: WebhookLog[]): void {
  if (typeof window === "undefined") return;

  try {
    // Keep only last 100 logs
    const logsToSave = logs.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToSave));
  } catch (error) {
    console.error("Failed to save logs:", error);
  }
}

/**
 * Add a new log to localStorage
 */
export function addStoredLog(log: WebhookLog): void {
  const logs = getStoredLogs();
  logs.push(log);
  saveLogs(logs);
}

/**
 * Clear all logs from localStorage
 */
export function clearStoredLogs(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear logs:", error);
  }
}

/**
 * Merge server logs with stored logs, keeping unique entries by timestamp+gateway+event
 */
export function mergeLogs(serverLogs: WebhookLog[], storedLogs: WebhookLog[]): WebhookLog[] {
  // Create a map of stored logs by unique key (timestamp + gateway + event)
  const storedMap = new Map<string, WebhookLog>();
  for (const log of storedLogs) {
    const key = `${log.timestamp}-${log.gateway}-${log.event}`;
    storedMap.set(key, log);
  }

  // Add server logs, updating stored logs if they exist
  for (const log of serverLogs) {
    const key = `${log.timestamp}-${log.gateway}-${log.event}`;
    storedMap.set(key, log);
  }

  // Convert back to array and sort by timestamp
  const merged = Array.from(storedMap.values());
  merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return merged;
}

