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

  // Reset payloadExpanded to true when selecting a different log
  useEffect(() => {
    if (selectedLogIndex !== null) {
      setPayloadExpanded(true);
    }
  }, [selectedLogIndex]);

  return (
    <section style={{ width: "50%", display: "flex", flexDirection: "column", backgroundColor: "hsl(var(--background))", overflow: "hidden", position: "relative" }}>
      <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }} />
      <div className="glass-panel" style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="material-symbols-outlined icon" style={{ color: "hsl(var(--muted-foreground))" }}>list_alt</span>
          <h3 style={{ fontWeight: 600, color: "hsl(var(--foreground))", fontSize: "0.875rem" }}>Event Stream</h3>
          <span className="mono" style={{ padding: "0.125rem 0.5rem", borderRadius: "9999px", backgroundColor: "hsl(var(--surface-dark))", border: "1px solid hsl(var(--border))", fontSize: "0.625rem", color: "hsl(var(--primary))", boxShadow: "0 0 10px hsl(188 94% 47% / 0.1)" }}>
            {logs.length} Events
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div className="field" style={{ width: "14rem" }}>
            <span className="material-symbols-outlined field-icon icon-sm">search</span>
            <input
              type="text"
              className="input"
              placeholder="Filter by ID or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: 0,
                paddingRight: "1rem",
                paddingTop: "0.375rem",
                paddingBottom: "0.375rem",
                fontSize: "0.75rem",
                border: "none",
                backgroundColor: "transparent",
              }}
            />
          </div>
          <div style={{ width: "1px", height: "1.5rem", backgroundColor: "hsl(var(--border))" }} />
          <button
            onClick={resetLogs}
            disabled={resetting}
            className="btn-action"
            style={{
              padding: "0.375rem",
              textTransform: "none",
              letterSpacing: "normal",
              opacity: resetting ? 0.6 : 1,
            }}
            title="Clear Logs"
          >
            <span className="material-symbols-outlined icon-sm">delete_sweep</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "1.5rem", position: "relative", zIndex: 1 }} className="custom-scrollbar">

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
              <div className="panel" style={{ borderRadius: "0.75rem", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)" }}>
                <table className="table" style={{ width: "100%", tableLayout: "fixed" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "8rem" }}>Status</th>
                      <th style={{ width: "10rem" }}>Event ID</th>
                      <th>Event Type</th>
                      <th style={{ width: "8rem" }}>Gateway</th>
                      <th style={{ width: "8rem" }}>Time</th>
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
                      
                      const logPayload = logIndex === selectedLogIndex ? (() => {
                        try {
                          const basePayload: any = {
                            id: `evt_${String(logIndex).padStart(4, "0")}`,
                            object: "event",
                            gateway: log.gateway,
                            type: log.event,
                            timestamp: log.timestamp,
                            status: log.httpStatus,
                            ok: log.ok,
                          };
                          
                          if (log.url) {
                            basePayload.url = log.url;
                          }
                          
                          if (log.headers && Object.keys(log.headers).length > 0) {
                            basePayload.headers = log.headers;
                          }
                          
                          if (log.responseBody) {
                            try {
                              const parsedBody = JSON.parse(log.responseBody);
                              basePayload.data = parsedBody;
                            } catch {
                              basePayload.responseBody = log.responseBody;
                            }
                          }
                          
                          return JSON.stringify(basePayload, null, 2);
                        } catch {
                          return JSON.stringify({ error: "Failed to format payload" }, null, 2);
                        }
                      })() : null;
                      
                      return (
                        <>
                          <tr
                            key={logIndex}
                            onClick={() => setSelectedLogIndex(logIndex === selectedLogIndex ? null : logIndex)}
                            className={isSelected ? "selected" : ""}
                            style={{
                              cursor: "pointer",
                              backgroundColor: isSelected ? `hsl(188 94% 47% / 0.1)` : isSending ? `hsl(188 94% 47% / 0.05)` : "transparent",
                              borderLeft: isSelected ? "2px solid hsl(188 94% 47%)" : isSending ? "2px solid hsl(188 94% 47%)" : "2px solid transparent",
                            }}
                          >
                            <td style={{ paddingLeft: isSelected || isSending ? "calc(1.5rem - 2px)" : "1.5rem", whiteSpace: "nowrap" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {!isSending && (
                                  <div
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      backgroundColor: dotColor,
                                      boxShadow: `0 0 8px ${dotColor}`,
                                      animation: dotColor === "hsl(142 76% 36%)" ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
                                    }}
                                  />
                                )}
                                {isSending && (
                                  <span className="material-symbols-outlined icon-sm" style={{ color: "hsl(188 94% 47%)", animation: "spin 1s linear infinite" }}>
                                    sync
                                  </span>
                                )}
                                <span className={`badge ${statusClass} mono`} style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase" }}>
                                  {isSending ? "Sending" : `${log.httpStatus} ${log.ok ? "OK" : "Err"}`}
                                </span>
                              </div>
                            </td>
                            <td className="mono" style={{ fontSize: "0.75rem", color: isSelected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>{shortEventId}</td>
                            <td style={{ fontWeight: 500, color: isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>{log.event}</td>
                            <td style={{ color: "hsl(var(--muted-foreground))" }}>{log.gateway}</td>
                            <td className="mono" style={{ textAlign: "right", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", paddingRight: "1.5rem", fontFamily: "sans-serif" }}>
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
                          {isSelected && logPayload && (
                            <tr key={`${logIndex}-detail`} style={{ backgroundColor: "hsl(var(--surface-dark))" }}>
                              <td colSpan={5} style={{ padding: 0, borderTop: "1px solid hsl(var(--border))", borderLeft: "2px solid hsl(188 94% 47%)", textAlign: "left", width: "100%", maxWidth: "100%", overflow: "hidden" }}>
                                <div className="panel" style={{ margin: 0, borderRadius: 0, border: "none", padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 0, width: "100%", maxWidth: "100%" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                                      <span className="material-symbols-outlined icon-sm" style={{ color: "hsl(var(--primary))" }}>data_object</span>
                                      <span className="text-xs" style={{ fontWeight: 700, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "0.1em" }}>
                                        Payload: <span style={{ color: "hsl(var(--foreground))" }}>{`evt_${String(logIndex).padStart(4, "0")}`}</span>
                                      </span>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.25rem" }}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(logPayload).catch(() => {});
                                        }}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: "0.625rem", padding: "0.25rem 0.5rem" }}
                                      >
                                        <span className="material-symbols-outlined icon-sm" style={{ fontSize: "0.625rem" }}>content_copy</span>
                                        <span style={{ marginLeft: "0.25rem" }}>JSON</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPayloadExpanded(!payloadExpanded);
                                        }}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: "0.625rem", padding: "0.25rem 0.5rem" }}
                                      >
                                        <span className="material-symbols-outlined icon-sm" style={{ fontSize: "0.625rem" }}>{payloadExpanded ? "unfold_less" : "unfold_more"}</span>
                                      </button>
                                    </div>
                                  </div>
                                  {payloadExpanded && (
                                    <div
                                      className="code custom-scrollbar"
                                      style={{
                                        padding: "1rem",
                                        overflowX: "auto",
                                        overflowY: "hidden",
                                        backgroundColor: "hsl(var(--code-bg))",
                                        borderRadius: "var(--radius)",
                                        fontSize: "0.75rem",
                                        lineHeight: 1.6,
                                        width: "100%",
                                        maxWidth: "100%",
                                        minWidth: 0,
                                        boxSizing: "border-box",
                                      }}
                                    >
                                      <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre", wordWrap: "normal", overflowWrap: "normal", minWidth: "max-content" }}>{logPayload}</pre>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
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
