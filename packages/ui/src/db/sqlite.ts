/**
 * SQLite database layer for payment simulator
 * Replaces in-memory state with persistent storage
 */

import Database from "better-sqlite3";
import { WebhookLog } from "@/state";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "payment-simulator.sqlite");
const MAX_LOGS = 100;

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: Database.Database | null = null;

/**
 * Get or create database connection
 */
function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    migrate();
  }
  return db;
}

/**
 * Run database migrations
 */
function migrate(): void {
  const database = db!;
  
  // Create webhook_configs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS webhook_configs (
      gateway TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      url_base TEXT NOT NULL,
      headers TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create webhook_logs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS webhook_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gateway TEXT NOT NULL,
      event TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      http_status INTEGER NOT NULL,
      ok INTEGER NOT NULL DEFAULT 0,
      response_body TEXT,
      error TEXT,
      url TEXT,
      headers TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for faster queries
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON webhook_logs(timestamp DESC)
  `);

  // Create webhook_templates table
  database.exec(`
    CREATE TABLE IF NOT EXISTS webhook_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gateway TEXT NOT NULL,
      event TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for templates
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_templates_gateway_event ON webhook_templates(gateway, event)
  `);
}

/**
 * Webhook Config Operations
 */
export const webhookConfig = {
  /**
   * Set webhook URL and headers for a gateway
   */
  set(gateway: string, url: string, urlBase: string, headers: Record<string, string>): void {
    const database = getDb();
    const stmt = database.prepare(`
      INSERT INTO webhook_configs (gateway, url, url_base, headers, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(gateway) DO UPDATE SET
        url = excluded.url,
        url_base = excluded.url_base,
        headers = excluded.headers,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(gateway, url, urlBase, JSON.stringify(headers));
  },

  /**
   * Get webhook URL and headers for a gateway
   */
  get(gateway: string): { url: string; urlBase: string; headers: Record<string, string> } | null {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT url, url_base, headers FROM webhook_configs WHERE gateway = ?
    `);
    const row = stmt.get(gateway) as { url: string; url_base: string; headers: string } | undefined;
    
    if (!row) return null;
    
    return {
      url: row.url,
      urlBase: row.url_base,
      headers: JSON.parse(row.headers || "{}"),
    };
  },

  /**
   * Get all gateway configs
   */
  getAll(): Record<string, { url: string; urlBase: string; headers: Record<string, string> }> {
    const database = getDb();
    const stmt = database.prepare(`SELECT gateway, url, url_base, headers FROM webhook_configs`);
    const rows = stmt.all() as Array<{
      gateway: string;
      url: string;
      url_base: string;
      headers: string;
    }>;
    
    const result: Record<string, { url: string; urlBase: string; headers: Record<string, string> }> = {};
    for (const row of rows) {
      result[row.gateway] = {
        url: row.url,
        urlBase: row.url_base,
        headers: JSON.parse(row.headers || "{}"),
      };
    }
    return result;
  },
};

/**
 * Webhook Logs Operations
 */
export const webhookLogs = {
  /**
   * Add a new log entry
   */
  add(log: WebhookLog): void {
    const database = getDb();
    const stmt = database.prepare(`
      INSERT INTO webhook_logs (
        gateway, event, timestamp, http_status, ok, response_body, error, url, headers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      log.gateway,
      log.event,
      log.timestamp,
      log.httpStatus,
      log.ok ? 1 : 0,
      log.responseBody || null,
      log.error || null,
      log.url || null,
      JSON.stringify(log.headers || {})
    );

    // Keep only last MAX_LOGS entries
    const countStmt = database.prepare(`SELECT COUNT(*) as count FROM webhook_logs`);
    const count = (countStmt.get() as { count: number }).count;
    
    if (count > MAX_LOGS) {
      const deleteStmt = database.prepare(`
        DELETE FROM webhook_logs
        WHERE id NOT IN (
          SELECT id FROM webhook_logs
          ORDER BY timestamp DESC
          LIMIT ?
        )
      `);
      deleteStmt.run(MAX_LOGS);
    }
  },

  /**
   * Add a new log entry and return the inserted ID
   */
  addReturningId(log: WebhookLog): number {
    const database = getDb();
    const stmt = database.prepare(`
      INSERT INTO webhook_logs (
        gateway, event, timestamp, http_status, ok, response_body, error, url, headers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      log.gateway,
      log.event,
      log.timestamp,
      log.httpStatus,
      log.ok ? 1 : 0,
      log.responseBody || null,
      log.error || null,
      log.url || null,
      JSON.stringify(log.headers || {})
    );

    // Keep only last MAX_LOGS entries
    const countStmt = database.prepare(`SELECT COUNT(*) as count FROM webhook_logs`);
    const count = (countStmt.get() as { count: number }).count;
    
    if (count > MAX_LOGS) {
      const deleteStmt = database.prepare(`
        DELETE FROM webhook_logs
        WHERE id NOT IN (
          SELECT id FROM webhook_logs
          ORDER BY timestamp DESC
          LIMIT ?
        )
      `);
      deleteStmt.run(MAX_LOGS);
    }

    return Number(result.lastInsertRowid);
  },

  /**
   * Update a log entry by ID
   */
  updateById(id: number, updates: Partial<WebhookLog>): void {
    const database = getDb();
    const updatesList: string[] = [];
    const values: any[] = [];

    if (updates.timestamp !== undefined) {
      updatesList.push("timestamp = ?");
      values.push(updates.timestamp);
    }
    if (updates.httpStatus !== undefined) {
      updatesList.push("http_status = ?");
      values.push(updates.httpStatus);
    }
    if (updates.ok !== undefined) {
      updatesList.push("ok = ?");
      values.push(updates.ok ? 1 : 0);
    }
    if (updates.responseBody !== undefined) {
      updatesList.push("response_body = ?");
      values.push(updates.responseBody || null);
    }
    if (updates.error !== undefined) {
      updatesList.push("error = ?");
      values.push(updates.error || null);
    }
    if (updates.url !== undefined) {
      updatesList.push("url = ?");
      values.push(updates.url || null);
    }
    if (updates.headers !== undefined) {
      updatesList.push("headers = ?");
      values.push(JSON.stringify(updates.headers || {}));
    }

    if (updatesList.length === 0) {
      return; // No updates to apply
    }

    values.push(id);
    const stmt = database.prepare(`
      UPDATE webhook_logs
      SET ${updatesList.join(", ")}
      WHERE id = ?
    `);
    stmt.run(...values);
  },

  /**
   * Get all logs
   */
  getAll(): WebhookLog[] {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT id, gateway, event, timestamp, http_status, ok, response_body, error, url, headers
      FROM webhook_logs
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    const rows = stmt.all(MAX_LOGS) as Array<{
      id: number;
      gateway: string;
      event: string;
      timestamp: string;
      http_status: number;
      ok: number;
      response_body: string | null;
      error: string | null;
      url: string | null;
      headers: string;
    }>;
    
    return rows.map((row) => ({
      id: row.id,
      gateway: row.gateway,
      event: row.event,
      timestamp: row.timestamp,
      httpStatus: row.http_status,
      ok: row.ok === 1,
      responseBody: row.response_body || undefined,
      error: row.error || undefined,
      url: row.url || undefined,
      headers: JSON.parse(row.headers || "{}"),
    }));
  },

  /**
   * Clear all logs
   */
  clear(): void {
    const database = getDb();
    database.prepare(`DELETE FROM webhook_logs`).run();
  },
};

/**
 * Webhook Templates Operations
 */
export const webhookTemplates = {
  /**
   * Get all templates
   */
  getAll(): Array<{
    id: string;
    name: string;
    gateway: string;
    event: string;
    payload: any;
    updatedAt: string;
  }> {
    const database = getDb();
    const stmt = database.prepare(`SELECT id, name, gateway, event, payload, updated_at FROM webhook_templates`);
    const rows = stmt.all() as Array<{
      id: string;
      name: string;
      gateway: string;
      event: string;
      payload: string;
      updated_at: string;
    }>;
    
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      gateway: row.gateway,
      event: row.event,
      payload: JSON.parse(row.payload),
      updatedAt: row.updated_at,
    }));
  },

  /**
   * Get templates for a specific gateway and event
   */
  getForEvent(gateway: string, event: string): Array<{
    id: string;
    name: string;
    gateway: string;
    event: string;
    payload: any;
    updatedAt: string;
  }> {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT id, name, gateway, event, payload, updated_at
      FROM webhook_templates
      WHERE gateway = ? AND event = ?
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all(gateway, event) as Array<{
      id: string;
      name: string;
      gateway: string;
      event: string;
      payload: string;
      updated_at: string;
    }>;
    
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      gateway: row.gateway,
      event: row.event,
      payload: JSON.parse(row.payload),
      updatedAt: row.updated_at,
    }));
  },

  /**
   * Get a template by ID
   */
  getById(id: string): {
    id: string;
    name: string;
    gateway: string;
    event: string;
    payload: any;
    updatedAt: string;
  } | null {
    const database = getDb();
    const stmt = database.prepare(`SELECT id, name, gateway, event, payload, updated_at FROM webhook_templates WHERE id = ?`);
    const row = stmt.get(id) as {
      id: string;
      name: string;
      gateway: string;
      event: string;
      payload: string;
      updated_at: string;
    } | undefined;
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      gateway: row.gateway,
      event: row.event,
      payload: JSON.parse(row.payload),
      updatedAt: row.updated_at,
    };
  },

  /**
   * Save a template
   */
  save(template: {
    id?: string;
    name: string;
    gateway: string;
    event: string;
    payload: any;
  }): {
    id: string;
    name: string;
    gateway: string;
    event: string;
    payload: any;
    updatedAt: string;
  } {
    const database = getDb();
    const id = template.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const updatedAt = new Date().toISOString();
    
    const stmt = database.prepare(`
      INSERT INTO webhook_templates (id, name, gateway, event, payload, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        gateway = excluded.gateway,
        event = excluded.event,
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `);
    
    stmt.run(id, template.name, template.gateway, template.event, JSON.stringify(template.payload), updatedAt);
    
    return {
      id,
      name: template.name,
      gateway: template.gateway,
      event: template.event,
      payload: template.payload,
      updatedAt,
    };
  },

  /**
   * Delete a template by ID
   */
  delete(id: string): boolean {
    const database = getDb();
    const stmt = database.prepare(`DELETE FROM webhook_templates WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  },
};

/**
 * Close database connection (useful for cleanup)
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

