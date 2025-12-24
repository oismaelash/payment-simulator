"use client";

import { useState, useEffect } from "react";
import ResponseViewModal from "./ResponseViewModal";

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
  const [filteredLogs, setFilteredLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [viewingResponse, setViewingResponse] = useState<{ body: string; index: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [payloadExpanded, setPayloadExpanded] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch from server
      const response = await fetch("/api/logs");
      const data = await response.json();
      const serverLogs = data.logs || [];
      setLogs(serverLogs);
    } catch (error) {
      console.error("Failed to fetch logs", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on search query
  useEffect(() => {
    let filtered = [...logs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.gateway.toLowerCase().includes(query) ||
          log.event.toLowerCase().includes(query) ||
          log.url?.toLowerCase().includes(query) ||
          log.error?.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery]);

  useEffect(() => {
    // Fetch logs from server
    fetchLogs();

    // Listen for refresh events
    const handleRefresh = () => fetchLogs();
    window.addEventListener("logs-refresh", handleRefresh);
    
    // Poll for updates if there are sending logs
    const pollInterval = setInterval(() => {
      fetchLogs().then(() => {
        // Check if there are still sending logs after fetch
        // The next poll will check again
      });
    }, 1000); // Poll every second
    
    return () => {
      window.removeEventListener("logs-refresh", handleRefresh);
      clearInterval(pollInterval);
    };
  }, []);

  // Get status badge class and color based on HTTP status
  const getStatusBadgeClass = (status: number, ok: boolean) => {
    if (!ok || status === 0) return "badge-error";
    if (status >= 200 && status < 300) return "badge-success";
    if (status >= 400 && status < 500) return "badge-warning";
    if (status >= 500) return "badge-error";
    return "badge-primary";
  };

  const getStatusDotColor = (status: number, ok: boolean) => {
    if (!ok || status === 0) return "hsl(0 63% 31%)";
    if (status >= 200 && status < 300) return "hsl(142 76% 36%)";
    if (status >= 400 && status < 500) return "hsl(38 92% 50%)";
    if (status >= 500) return "hsl(0 63% 31%)";
    return "hsl(217 91% 60%)";
  };

  const resetLogs = async () => {
    if (!confirm("Reset logs? This cannot be undone.")) return;
    setResetting(true);
    try {
      // Clear server logs
      await fetch("/api/logs", { method: "POST" });
      
      // Update UI
      setLogs([]);
    } catch (error) {
      console.error("Failed to reset logs", error);
      setLogs([]);
    } finally {
      setResetting(false);
    }
  };

  const selectedLog = selectedLogIndex !== null && selectedLogIndex < logs.length ? logs[selectedLogIndex] : null;
  const selectedLogPayload = selectedLog ? (() => {
    try {
      const basePayload: any = {
        id: `evt_${String(selectedLogIndex).padStart(4, "0")}`,
        object: "event",
        gateway: selectedLog.gateway,
        type: selectedLog.event,
        timestamp: selectedLog.timestamp,
        status: selectedLog.httpStatus,
        ok: selectedLog.ok,
      };
      
      // Add URL if available (includes query parameters if present)
      if (selectedLog.url) {
        basePayload.url = selectedLog.url;
      }
      
      // Add headers if available (includes custom headers if present)
      if (selectedLog.headers && Object.keys(selectedLog.headers).length > 0) {
        basePayload.headers = selectedLog.headers;
      }
      
      if (selectedLog.responseBody) {
        try {
          const parsedBody = JSON.parse(selectedLog.responseBody);
          basePayload.data = parsedBody;
        } catch {
          basePayload.responseBody = selectedLog.responseBody;
        }
      }
      
      return JSON.stringify(basePayload, null, 2);
    } catch {
      return JSON.stringify({ error: "Failed to format payload" }, null, 2);
    }
  })() : null;

  const copyPayloadToClipboard = async () => {
    if (!selectedLogPayload) return;
    try {
      await navigator.clipboard.writeText(selectedLogPayload);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <section style={{ width: "50%", display: "flex", flexDirection: "column", backgroundColor: "hsl(var(--muted))", overflow: "hidden" }}>
      <div style={{ borderBottom: "1px solid hsl(var(--border))", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "hsl(var(--surface-dark))", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="material-icons-outlined" style={{ color: "hsl(var(--muted-foreground))" }}>list_alt</span>
          <h3 style={{ fontWeight: 600, color: "hsl(var(--foreground))" }}>Webhook Events Log</h3>
          <span style={{ padding: "0.125rem 0.5rem", borderRadius: "9999px", backgroundColor: "hsl(var(--muted))", fontSize: "0.75rem", fontFamily: "monospace", color: "hsl(var(--foreground))" }}>
            {logs.length}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="input"
              placeholder="Filter events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: "2rem",
                paddingRight: "1rem",
                paddingTop: "0.375rem",
                paddingBottom: "0.375rem",
                backgroundColor: "hsl(var(--input-dark))",
                border: "1px solid transparent",
                borderRadius: "var(--radius)",
                fontSize: "0.75rem",
                width: "12rem",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--primary))";
                e.currentTarget.style.backgroundColor = "hsl(var(--surface-dark))";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.backgroundColor = "hsl(var(--input-dark))";
              }}
            />
            <span className="material-icons-outlined" style={{ position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", fontSize: "0.875rem", pointerEvents: "none" }}>
              search
            </span>
          </div>
          <button
            style={{
              padding: "0.375rem",
              color: "hsl(var(--muted-foreground))",
              borderRadius: "var(--radius)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "hsl(var(--foreground))";
              e.currentTarget.style.backgroundColor = "hsl(var(--muted))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "hsl(var(--muted-foreground))";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Filter"
          >
            <span className="material-icons-outlined" style={{ fontSize: "1.125rem" }}>filter_list</span>
          </button>
          <button
            onClick={resetLogs}
            disabled={resetting}
            style={{
              padding: "0.375rem",
              color: "hsl(var(--muted-foreground))",
              borderRadius: "var(--radius)",
              border: "none",
              background: "transparent",
              cursor: resetting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: resetting ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!resetting) {
                e.currentTarget.style.color = "hsl(var(--foreground))";
                e.currentTarget.style.backgroundColor = "hsl(var(--muted))";
              }
            }}
            onMouseLeave={(e) => {
              if (!resetting) {
                e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            title="Clear logs"
          >
            <span className="material-icons-outlined" style={{ fontSize: "1.125rem" }}>delete_sweep</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }} className="custom-scrollbar">

        {logs.length === 0 ? (
          <div className="text-muted text-sm" style={{ padding: "1.25rem", textAlign: "center" }}>
            No webhooks sent yet
          </div>
        ) : (
          <>
            {filteredLogs.length === 0 ? (
              <div className="text-muted text-sm" style={{ padding: "1.25rem", textAlign: "center" }}>
                No logs match the current filters
              </div>
            ) : (
              <div style={{ backgroundColor: "hsl(var(--surface-dark))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Event ID</th>
                      <th>Type</th>
                      <th>Gateway</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => {
                      const originalIndex = logs.findIndex(
                        (l) =>
                          l.gateway === log.gateway &&
                          l.event === log.event &&
                          l.timestamp === log.timestamp &&
                          l.httpStatus === log.httpStatus
                      );
                      const logIndex = originalIndex >= 0 ? originalIndex : index;
                      const isSelected = logIndex === selectedLogIndex;
                      const eventId = `evt_${String(logIndex).padStart(4, "0")}`;
                      const shortEventId = eventId.length > 10 ? `${eventId.substring(0, 7)}...` : eventId;
                      // Check if log is in "Sending" state: httpStatus === 0 and no error
                      const isSending = log.httpStatus === 0 && !log.error;
                      const statusClass = isSending ? "badge-sending" : getStatusBadgeClass(log.httpStatus, log.ok);
                      const dotColor = getStatusDotColor(log.httpStatus, log.ok);
                      
                      return (
                        <tr
                          key={logIndex}
                          onClick={() => setSelectedLogIndex(logIndex)}
                          style={{
                            cursor: "pointer",
                            backgroundColor: isSelected ? `hsl(217 91% 60% / 0.1)` : isSending ? `hsl(217 91% 60% / 0.05)` : "transparent",
                            borderLeft: isSelected ? "2px solid hsl(217 91% 60%)" : isSending ? "2px solid hsl(217 91% 60%)" : "none",
                          }}
                          className="group"
                        >
                          <td style={{ paddingLeft: isSelected || isSending ? "calc(1.5rem - 2px)" : "1.5rem", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {!isSending && (
                                <div
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: dotColor,
                                  }}
                                />
                              )}
                              {isSending && (
                                <span className="material-icons-outlined" style={{ color: "hsl(217 91% 60%)", fontSize: "0.875rem", animation: "spin 1s linear infinite" }}>
                                  sync
                                </span>
                              )}
                              <span className={`badge ${statusClass} mono`} style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                                {isSending ? "Sending" : `${log.httpStatus} ${log.ok ? "OK" : "Err"}`}
                              </span>
                            </div>
                          </td>
                          <td className="mono" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>{shortEventId}</td>
                          <td style={{ fontWeight: 500, color: "hsl(var(--foreground))" }}>{log.event}</td>
                          <td style={{ color: "hsl(var(--muted-foreground))" }}>{log.gateway}</td>
                          <td className="mono" style={{ textAlign: "right", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", paddingRight: "1.5rem" }}>
                            {(() => {
                              const date = new Date(log.timestamp);
                              const now = new Date();
                              const diffMs = now.getTime() - date.getTime();
                              const diffMins = Math.floor(diffMs / 60000);
                              const diffHours = Math.floor(diffMs / 3600000);
                              
                              if (diffMins < 1) return "Just now";
                              if (diffMins < 60) return `${diffMins}m ago`;
                              if (diffHours < 24) return date.toLocaleTimeString();
                              return date.toLocaleString();
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Event Payload Section */}
        {selectedLog && selectedLogPayload && (
          <div style={{ marginTop: "1.5rem", backgroundColor: "hsl(var(--surface-dark))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--input-dark))", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "var(--radius) var(--radius) 0 0" }}>
              <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "hsl(var(--muted-foreground))", textTransform: "uppercase" }}>
                Event Payload: {`evt_${String(selectedLogIndex).padStart(4, "0")}`}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={copyPayloadToClipboard}
                  style={{
                    fontSize: "0.625rem",
                    backgroundColor: "hsl(var(--muted))",
                    color: "hsl(var(--foreground))",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "hsl(var(--muted) / 1.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "hsl(var(--muted))";
                  }}
                >
                  Copy JSON
                </button>
                <button
                  onClick={() => setPayloadExpanded(!payloadExpanded)}
                  style={{
                    fontSize: "0.625rem",
                    backgroundColor: "hsl(var(--muted))",
                    color: "hsl(var(--foreground))",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "hsl(var(--muted) / 1.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "hsl(var(--muted))";
                  }}
                >
                  {payloadExpanded ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>
            <div
              className="code"
              style={{
                padding: "1rem",
                overflowX: "auto",
                backgroundColor: "hsl(var(--code-bg))",
                borderRadius: "0 0 var(--radius) var(--radius)",
                maxHeight: payloadExpanded ? "none" : "200px",
                overflowY: payloadExpanded ? "visible" : "auto",
                fontSize: "0.75rem",
                lineHeight: 1.6,
              }}
            >
              <pre style={{ margin: 0, fontFamily: "inherit" }}>{selectedLogPayload}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Response View Modal */}
      {viewingResponse && (
        <ResponseViewModal
          isOpen={true}
          onClose={() => setViewingResponse(null)}
          responseBody={viewingResponse.body}
          title={`Response - ${logs[viewingResponse.index]?.gateway} ${logs[viewingResponse.index]?.event}`}
          url={logs[viewingResponse.index]?.url}
          headers={logs[viewingResponse.index]?.headers}
        />
      )}
    </section>
  );
}
