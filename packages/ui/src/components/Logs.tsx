"use client";

import { useState, useEffect } from "react";
import ResponseViewModal from "./ResponseViewModal";
import {
  getStoredLogs,
  saveLogs,
  clearStoredLogs,
  mergeLogs,
} from "@/lib/logs-storage";

interface WebhookLog {
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

export default function Logs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [viewingResponse, setViewingResponse] = useState<{ body: string; index: number } | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Load stored logs first
      const storedLogs = getStoredLogs();

      // Fetch from server
      const response = await fetch("/api/logs");
      const data = await response.json();
      const serverLogs = data.logs || [];

      // Merge server logs with stored logs
      const mergedLogs = mergeLogs(serverLogs, storedLogs);

      // Save merged logs back to localStorage
      saveLogs(mergedLogs);

      setLogs(mergedLogs);
    } catch (error) {
      console.error("Failed to fetch logs", error);
      // Fallback to stored logs if server fails
      const storedLogs = getStoredLogs();
      setLogs(storedLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load logs from localStorage immediately on mount
    const storedLogs = getStoredLogs();
    if (storedLogs.length > 0) {
      setLogs(storedLogs);
    }

    // Then fetch from server and merge
    fetchLogs();

    // Listen for refresh events
    const handleRefresh = () => fetchLogs();
    window.addEventListener("logs-refresh", handleRefresh);
    return () => window.removeEventListener("logs-refresh", handleRefresh);
  }, []);

  const resetLogs = async () => {
    if (!confirm("Reset logs? This cannot be undone.")) return;
    setResetting(true);
    try {
      // Clear server logs
      await fetch("/api/logs", { method: "POST" });
      
      // Clear stored logs
      clearStoredLogs();
      
      // Update UI
      setLogs([]);
    } catch (error) {
      console.error("Failed to reset logs", error);
      // Still clear localStorage even if server fails
      clearStoredLogs();
      setLogs([]);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 className="text-lg">Logs</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={resetLogs}
            disabled={resetting}
            className="btn btn-destructive btn-sm"
          >
            {resetting ? "Resetting..." : "Reset logs"}
          </button>
        </div>
      </div>
      {logs.length === 0 ? (
        <div className="text-muted text-sm" style={{ padding: "1.25rem", textAlign: "center" }}>
          No webhooks sent yet
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Gateway</th>
                <th>Event</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {logs
                .slice()
                .reverse()
                .map((log, index) => (
                  <tr key={index}>
                    <td>{log.gateway}</td>
                    <td>{log.event}</td>
                    <td className="text-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${log.ok ? "badge-success" : "badge-error"}`}>
                        {log.httpStatus} {log.ok ? "✓" : "✗"}
                      </span>
                      {log.error && (
                        <div className="text-xs" style={{ marginTop: "0.25rem", color: `hsl(var(--destructive))` }}>
                          {log.error}
                        </div>
                      )}
                    </td>
                    <td style={{ maxWidth: "420px" }}>
                      {typeof log.responseBody === "string" && log.responseBody.length > 0 ? (
                        <button
                          onClick={() => setViewingResponse({ body: log.responseBody!, index })}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.8125rem" }}
                        >
                          View response
                        </button>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Response View Modal */}
      {viewingResponse && (
        <ResponseViewModal
          isOpen={true}
          onClose={() => setViewingResponse(null)}
          responseBody={viewingResponse.body}
          title={`Response - ${logs[logs.length - 1 - viewingResponse.index]?.gateway} ${logs[logs.length - 1 - viewingResponse.index]?.event}`}
          url={logs[logs.length - 1 - viewingResponse.index]?.url}
          headers={logs[logs.length - 1 - viewingResponse.index]?.headers}
        />
      )}
    </div>
  );
}
