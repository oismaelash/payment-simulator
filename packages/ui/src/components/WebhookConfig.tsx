"use client";

import { useState, useEffect } from "react";
import PayloadEditorModal from "./PayloadEditorModal";
import type { WebhookTemplate } from "@/lib/templates";
import {
  buildWebhookUrl,
  type WebhookGatewayConfig,
  headersRecordToArray,
  headersArrayToRecord,
} from "@/lib/webhook-config";

interface GatewayMeta {
  events: string[];
}

interface WebhookConfigProps {
  gateways: Record<string, GatewayMeta>;
  loadingGateways: boolean;
  selectedGateway: string;
  setSelectedGateway: (gateway: string) => void;
}

export default function WebhookConfig({ gateways, loadingGateways, selectedGateway, setSelectedGateway }: WebhookConfigProps) {
  const [config, setConfig] = useState<WebhookGatewayConfig>({
    urlBase: "",
    queryParams: [],
    headers: [],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const [isHeadersOpen, setIsHeadersOpen] = useState(false);
  const [delay, setDelay] = useState<"instant" | "5s">("instant");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [basePayload, setBasePayload] = useState<string>("");
  const [currentPayload, setCurrentPayload] = useState<any>(null);
  const [templates, setTemplates] = useState<WebhookTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [isPayloadDirty, setIsPayloadDirty] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);


  // Load events and payload when gateway/event changes
  useEffect(() => {
    if (selectedGateway && selectedEvent) {
      // Load base payload
      fetch(`/api/payload?gateway=${selectedGateway}&event=${selectedEvent}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.payload) {
            setBasePayload(data.payload);
            try {
              const parsed = JSON.parse(data.payload);
              setCurrentPayload(parsed);
            } catch {
              setCurrentPayload(null);
            }
          }
        })
        .catch(() => {
          setMessage({ type: "error", text: "Failed to load payload" });
        });

      // Load templates
      fetch(`/api/templates?gateway=${selectedGateway}&event=${selectedEvent}`)
        .then((res) => res.json())
        .then((data) => {
          setTemplates(data.templates || []);
          setSelectedTemplateId("");
        })
        .catch(() => {
          setTemplates([]);
          setSelectedTemplateId("");
        });
    } else {
      setBasePayload("");
      setCurrentPayload(null);
      setTemplates([]);
      setSelectedTemplateId("");
    }
  }, [selectedGateway, selectedEvent]);

  // Apply selected template
  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        setCurrentPayload(template.payload);
        setIsPayloadDirty(false);
      }
    } else if (!selectedTemplateId && basePayload) {
      try {
        const parsed = JSON.parse(basePayload);
        setCurrentPayload(parsed);
        setIsPayloadDirty(false);
      } catch {
        setCurrentPayload(null);
        setIsPayloadDirty(false);
      }
    }
  }, [selectedTemplateId, templates, basePayload]);

  // Check if payload is dirty
  useEffect(() => {
    if (!basePayload || !currentPayload) {
      setIsPayloadDirty(false);
      return;
    }
    try {
      const baseParsed = JSON.parse(basePayload);
      const baseStr = JSON.stringify(baseParsed);
      const currentStr = JSON.stringify(currentPayload);
      setIsPayloadDirty(baseStr !== currentStr);
    } catch {
      setIsPayloadDirty(false);
    }
  }, [basePayload, currentPayload]);

  // Load config when gateway changes
  useEffect(() => {
    if (selectedGateway) {
      setIsInitialLoad(true);
      // Fetch config from server
      fetch(`/api/config/webhook?gateway=${selectedGateway}`)
        .then((res) => res.json())
        .then((data) => {
          // Prefer parsing from data.url (final URL with query params) if available
          // Fall back to data.urlBase if data.url is missing
          const urlToParse = data.url || data.urlBase;
          
          if (urlToParse) {
            // Parse URL to extract base and query params
            try {
              const url = new URL(urlToParse);
              const queryParams: Array<{ key: string; value: string }> = [];
              url.searchParams.forEach((value, key) => {
                queryParams.push({ key, value });
              });
              
              const newConfig = {
                urlBase: `${url.protocol}//${url.host}${url.pathname}`,
                queryParams,
                headers: headersRecordToArray(data.headers || {}),
              };
              setConfig(newConfig);
              setIsQueryOpen(queryParams.length > 0);
              setIsHeadersOpen((headersRecordToArray(data.headers || {})).length > 0);
            } catch {
              // If URL parsing fails, use as-is
              const newHeaders = headersRecordToArray(data.headers || {});
              const newConfig = {
                urlBase: data.urlBase || data.url || "",
                queryParams: [],
                headers: newHeaders,
              };
              setConfig(newConfig);
              setIsHeadersOpen(newHeaders.length > 0);
            }
          } else {
            // No config found, use defaults
            setConfig({
              urlBase: "",
              queryParams: [],
              headers: [],
            });
            setIsQueryOpen(false);
            setIsHeadersOpen(false);
          }
          // Mark initial load as complete after a short delay
          setTimeout(() => setIsInitialLoad(false), 100);
        })
        .catch(() => {
          // On error, use defaults
          setConfig({
            urlBase: "",
            queryParams: [],
            headers: [],
          });
          setIsQueryOpen(false);
          setIsHeadersOpen(false);
          setTimeout(() => setIsInitialLoad(false), 100);
        });
      
      // Sync gateway selection with Event Simulator
      window.dispatchEvent(
        new CustomEvent("webhook-config-gateway-changed", {
          detail: { gateway: selectedGateway },
        })
      );
    }
  }, [selectedGateway]);

  // Auto-save when config changes (with debounce)
  useEffect(() => {
    // Skip auto-save during initial load
    if (isInitialLoad || !selectedGateway) {
      return;
    }

    // Don't save if urlBase is empty
    if (!config.urlBase.trim()) {
      return;
    }

    // Debounce auto-save
    const timeoutId = setTimeout(async () => {
      setSaving(true);
      setMessage(null);

      try {
        // Build final URL with query params
        const finalUrl = buildWebhookUrl(config);

        // Convert headers array to record
        const headersRecord = headersArrayToRecord(config.headers);

        // Save to server
        const response = await fetch("/api/config/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gateway: selectedGateway,
            url: finalUrl,
            urlBase: config.urlBase.trim(),
            headers: headersRecord,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({
            type: "success",
            text: `Configuration saved for ${selectedGateway}`,
          });
        } else {
          setMessage({ type: "error", text: data.error || "Failed to save" });
        }
      } catch (error) {
        setMessage({ type: "error", text: "Network error" });
      } finally {
        setSaving(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [config, selectedGateway, isInitialLoad]);

  // Auto-hide success messages after 3 seconds
  useEffect(() => {
    if (message?.type === "success") {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleUrlBaseChange = (value: string) => {
    setConfig({ ...config, urlBase: value });
  };

  const handleQueryParamChange = (index: number, field: "key" | "value", value: string) => {
    const newParams = [...config.queryParams];
    newParams[index] = { ...newParams[index], [field]: value };
    setConfig({ ...config, queryParams: newParams });
  };

  const handleAddQueryParam = () => {
    setIsQueryOpen(true);
    setConfig({
      ...config,
      queryParams: [...config.queryParams, { key: "", value: "" }],
    });
  };

  const handleRemoveQueryParam = (index: number) => {
    const newParams = config.queryParams.filter((_, i) => i !== index);
    setConfig({ ...config, queryParams: newParams });
  };

  const handleHeaderChange = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...config.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setConfig({ ...config, headers: newHeaders });
  };

  const handleAddHeader = () => {
    setIsHeadersOpen(true);
    setConfig({
      ...config,
      headers: [...config.headers, { key: "", value: "" }],
    });
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = config.headers.filter((_, i) => i !== index);
    setConfig({ ...config, headers: newHeaders });
  };

  const finalUrl = buildWebhookUrl(config);

  const handleRestoreDefaults = () => {
    setSelectedEvent("");
    setBasePayload("");
    setCurrentPayload(null);
    setTemplates([]);
    setSelectedTemplateId("");
    setConfig({
      urlBase: "",
      queryParams: [],
      headers: [],
    });
    setIsQueryOpen(false);
    setIsHeadersOpen(false);
    setDelay("instant");
  };

  const handleSendTestWebhook = async () => {
    if (!selectedGateway || !selectedEvent) {
      setMessage({ type: "error", text: "Please select gateway and event" });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      // Get webhook config for selected gateway from server
      const configResponse = await fetch(`/api/config/webhook?gateway=${selectedGateway}`);
      const configData = await configResponse.json();
      
      if (!configData.urlBase && !configData.url) {
        setMessage({
          type: "error",
          text: "Webhook URL not configured. Please configure it above.",
        });
        setSending(false);
        return;
      }

      // Build config object: use local state for query params and headers (user's custom config)
      // but fallback to server config for urlBase if local is empty
      const gatewayConfig = {
        urlBase: config.urlBase || configData.urlBase || configData.url || "",
        queryParams: config.queryParams.length > 0 ? config.queryParams : (() => {
          // If no local query params, try to parse from server URL
          if (configData.url && !configData.urlBase) {
            try {
              const url = new URL(configData.url);
              const params: Array<{ key: string; value: string }> = [];
              url.searchParams.forEach((value, key) => {
                params.push({ key, value });
              });
              return params;
            } catch {
              return [];
            }
          }
          return [];
        })(),
        headers: config.headers.length > 0 ? config.headers : headersRecordToArray(configData.headers || {}),
      };

      const finalUrl = buildWebhookUrl(gatewayConfig);
      const customHeaders = headersArrayToRecord(gatewayConfig.headers);

      const body: any = {
        gateway: selectedGateway,
        event: selectedEvent,
        delay: delay, // Include delay configuration
      };

      if (finalUrl) {
        body.webhookUrl = finalUrl;
      }

      body.extraHeaders = customHeaders;

      // If currentPayload exists (edited or from template), send it as override
      if (currentPayload) {
        body.payloadOverride = currentPayload;
      }

      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Handle queued response (202)
      if (response.status === 202 && data.queued) {
        const delayMs = data.delayMs || 0;
        setMessage({
          type: "success",
          text: `Webhook queued (will send in ${delayMs / 1000}s)`,
        });
        // Schedule refresh after delay + buffer
        setTimeout(() => {
          window.dispatchEvent(new Event("logs-refresh"));
        }, delayMs + 500);
      } else if (response.ok && data.success) {
        setMessage({
          type: "success",
          text: `Webhook sent successfully (${data.status})`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || `Failed to send webhook (${data.status})`,
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSending(false);
      window.dispatchEvent(new Event("logs-refresh"));
    }
  };

  const handleApplyPayload = (payload: any) => {
    setCurrentPayload(payload);
    setSelectedTemplateId("");
    setIsPayloadDirty(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !currentPayload) {
      setMessage({ type: "error", text: "Please enter a template name" });
      return;
    }

    setSavingTemplate(true);
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName.trim(),
          gateway: selectedGateway,
          event: selectedEvent,
          payload: currentPayload,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reload templates
        const templatesResponse = await fetch(`/api/templates?gateway=${selectedGateway}&event=${selectedEvent}`);
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.templates || []);
        setTemplateName("");
        setShowSaveTemplateDialog(false);
        setMessage({ type: "success", text: "Template saved successfully" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save template" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save template" });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) return;
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        const response = await fetch(`/api/templates?id=${selectedTemplateId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Reload templates
          const templatesResponse = await fetch(`/api/templates?gateway=${selectedGateway}&event=${selectedEvent}`);
          const templatesData = await templatesResponse.json();
          setTemplates(templatesData.templates || []);
          setSelectedTemplateId("");
          setMessage({ type: "success", text: "Template deleted" });
        } else {
          const data = await response.json();
          setMessage({ type: "error", text: data.error || "Failed to delete template" });
        }
      } catch (error) {
        setMessage({ type: "error", text: "Failed to delete template" });
      }
    }
  };

  const handleResetToBase = () => {
    if (basePayload) {
      try {
        const parsed = JSON.parse(basePayload);
        setCurrentPayload(parsed);
        setSelectedTemplateId("");
        setIsPayloadDirty(false);
      } catch {
        setMessage({ type: "error", text: "Failed to reset payload" });
      }
    }
  };

  return (
    <>
    <section style={{ width: "50%", minWidth: "500px", borderRight: "1px solid hsl(var(--border))", display: "flex", flexDirection: "column", overflowY: "auto", backgroundColor: "hsl(var(--surface-darker))", position: "relative" }} className="custom-scrollbar">
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "16rem", background: "linear-gradient(to bottom, hsl(var(--primary) / 0.05), transparent)", pointerEvents: "none" }} />
      <div style={{ padding: "2rem", maxWidth: "48rem", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "2rem" }}>
          {/* <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>Webhook Configuration</h2> */}
          <p className="text-sm text-muted">
            Manage endpoint dispatching rules and parameters.
          </p>
        </div>
        {loadingGateways ? (
          <div className="card" style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "hsl(var(--muted-foreground))", animation: "spin 1s linear infinite" }}>
              sync
            </span>
            <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.875rem", margin: 0 }}>
              Loading gateways...
            </p>
          </div>
        ) : (
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {selectedGateway && (
        <>
          {/* Webhook URL */}
          <div>
            <label className="text-xs" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Destination URL
            </label>
            <div className="field">
              <span className="material-symbols-outlined field-icon icon">link</span>
              <input
                type="text"
                className="input"
                value={config.urlBase}
                onChange={(e) => {
                  handleUrlBaseChange(e.target.value);
                  // Visual validation (non-blocking)
                  const url = e.target.value.trim();
                  if (url) {
                    try {
                      new URL(url);
                      e.target.setAttribute("data-valid", "true");
                      e.target.removeAttribute("data-invalid");
                    } catch {
                      e.target.setAttribute("data-invalid", "true");
                      e.target.removeAttribute("data-valid");
                    }
                  } else {
                    e.target.removeAttribute("data-valid");
                    e.target.removeAttribute("data-invalid");
                  }
                }}
                placeholder="http://localhost:3000/api/webhooks/payment"
                style={{ flex: 1, border: "none", backgroundColor: "transparent", paddingLeft: 0, fontFamily: "monospace", fontSize: "0.875rem", color: "hsl(188 94% 70%)" }}
              />
              <div style={{ padding: "0.25rem 0.5rem", marginRight: "0.5rem", backgroundColor: "hsl(217 91% 60% / 0.1)", border: "1px solid hsl(217 91% 60% / 0.2)", borderRadius: "0.25rem", fontSize: "0.625rem", fontWeight: 700, color: "hsl(217 91% 60%)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                POST
              </div>
            </div>
          </div>

          {/* Query Params */}
          <div>
            <div
              className={`section-header ${isQueryOpen ? "open" : ""}`}
              onClick={() => setIsQueryOpen(!isQueryOpen)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="material-symbols-outlined section-header-icon icon-sm">
                  chevron_right
                </span>
                <label className="text-xs" style={{ fontWeight: 600, color: "hsl(var(--muted-foreground))", margin: 0, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Query Parameters <span style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>({config.queryParams.length})</span>
                </label>
              </div>
              <button
                className="btn-action"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddQueryParam();
                }}
              >
                <span className="material-symbols-outlined icon-sm">add</span>
                Add New
              </button>
            </div>
            {isQueryOpen && (
              <>
                {config.queryParams.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      padding: "1rem",
                      textAlign: "center",
                      transition: "border-color 0.2s ease"
                    }}
                    className="animate-fade-in"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1.5rem", color: "hsl(var(--muted-foreground) / 0.5)", marginBottom: "0.5rem", display: "block" }}>code_blocks</span>
                    <p className="text-xs text-muted" style={{ fontStyle: "italic", margin: 0 }}>
                      No parameters configured
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }} className="animate-fade-in">
                    {config.queryParams.map((param, index) => (
                      <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input
                          type="text"
                          className="input mono"
                          value={param.key}
                          onChange={(e) => handleQueryParamChange(index, "key", e.target.value)}
                          placeholder="Key"
                          style={{ flex: 1, fontSize: "0.75rem" }}
                        />
                        <input
                          type="text"
                          className="input mono"
                          value={param.value}
                          onChange={(e) => handleQueryParamChange(index, "value", e.target.value)}
                          placeholder="Value"
                          style={{ flex: 1, fontSize: "0.75rem", color: "hsl(142 76% 60%)" }}
                        />
                        <button
                          onClick={() => handleRemoveQueryParam(index)}
                          className="btn btn-destructive btn-sm"
                          style={{ minWidth: "2rem", padding: 0 }}
                          title="Remove parameter"
                        >
                          <span className="material-symbols-outlined icon-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {finalUrl && finalUrl !== config.urlBase && (
                  <div className="text-sm text-muted" style={{ marginTop: "0.5rem" }}>
                    Final URL: <code style={{ fontSize: "0.75rem" }}>{finalUrl}</code>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Headers */}
          <div>
            <div
              className={`section-header ${isHeadersOpen ? "open" : ""}`}
              onClick={() => setIsHeadersOpen(!isHeadersOpen)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="material-symbols-outlined section-header-icon icon-sm">
                  chevron_right
                </span>
                <label className="text-xs" style={{ fontWeight: 600, color: "hsl(var(--muted-foreground))", margin: 0, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Custom Headers <span style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>({config.headers.length})</span>
                </label>
              </div>
              <button
                className="btn-action"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddHeader();
                }}
              >
                <span className="material-symbols-outlined icon-sm">add</span>
                Add New
              </button>
            </div>
            {isHeadersOpen && (
              <>
                {config.headers.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      padding: "1rem",
                      textAlign: "center",
                      transition: "border-color 0.2s ease"
                    }}
                    className="animate-fade-in"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1.5rem", color: "hsl(var(--muted-foreground) / 0.5)", marginBottom: "0.5rem", display: "block" }}>code_blocks</span>
                    <p className="text-xs text-muted" style={{ fontStyle: "italic", margin: 0 }}>
                      No headers configured
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }} className="animate-fade-in">
                    {config.headers.map((header, index) => (
                      <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input
                          type="text"
                          className="input mono"
                          value={header.key}
                          onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                          placeholder="Header name"
                          style={{ flex: 1, fontSize: "0.75rem" }}
                        />
                        <input
                          type="text"
                          className="input mono"
                          value={header.value}
                          onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                          placeholder="Header value"
                          style={{ flex: 1, fontSize: "0.75rem" }}
                        />
                        <button
                          onClick={() => handleRemoveHeader(index)}
                          className="btn btn-destructive btn-sm"
                          style={{ minWidth: "2rem", padding: 0 }}
                          title="Remove header"
                        >
                          <span className="material-symbols-outlined icon-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Delay Configuration */}
          <div>
            <label className="text-xs" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Simulation Delay
            </label>
            <div className="segmented-control">
              {(["instant", "5s"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={delay === option ? "active" : ""}
                  onClick={() => setDelay(option)}
                >
                  {option === "instant" ? "INSTANT" : option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Select Event */}
          <div>
            <label className="text-xs" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Event Options
            </label>
            <div className="select-wrapper">
              <select
                className="select"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                disabled={!selectedGateway}
                style={{ appearance: "none", paddingRight: "2.5rem" }}
              >
                <option value="">-- Select Event --</option>
                {selectedGateway && (gateways[selectedGateway]?.events || []).map((event) => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined icon-sm" style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }}>
                unfold_more
              </span>
            </div>
          </div>

          {/* Templates */}
          {selectedGateway && selectedEvent && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label className="text-sm" style={{ display: "block", marginBottom: "0.3125rem" }}>
                  Templates:
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    className="select"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Base Payload --</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  {selectedTemplateId && (
                    <button
                      onClick={handleDeleteTemplate}
                      className="btn btn-destructive btn-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginBottom: "1rem",
                }}
              >
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  View/Edit Payload
                  {isPayloadDirty && (
                    <span style={{ marginLeft: "0.375rem", opacity: 0.7 }}>•</span>
                  )}
                </button>
                <button
                  onClick={handleResetToBase}
                  disabled={!basePayload}
                  className="btn btn-outline"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowSaveTemplateDialog(true)}
                  disabled={!currentPayload}
                  className="btn btn-outline"
                >
                  Save Template
                </button>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid hsl(var(--border))", marginTop: "1rem" }}>
            <button
              onClick={handleRestoreDefaults}
              className="text-xs text-muted"
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                height: "auto",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                cursor: "pointer",
              }}
            >
              Reset to Default
            </button>
            <button
              onClick={handleSendTestWebhook}
              disabled={sending || !selectedGateway || !selectedEvent}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span className="material-symbols-outlined icon">send</span>
              <span>{sending ? "Sending..." : "Dispatch Event"}</span>
            </button>
          </div>

          {/* Auto-save indicator */}
          {saving && (
            <div className="text-sm text-muted" style={{ fontStyle: "italic", marginTop: "0.5rem" }}>
              Saving...
            </div>
          )}
        </>
      )}

          {message && (
            <div className={`message ${message.type === "success" ? "message-success" : "message-error"}`} style={{ marginTop: "1rem" }}>
              {message.text}
            </div>
          )}
        </div>
        )}
      </div>
    </section>

      {/* Payload Editor Modal */}
      {isEditorOpen && basePayload && (
        <PayloadEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          initialPayload={
            currentPayload
              ? JSON.stringify(currentPayload, null, 2)
              : basePayload
          }
          onApply={handleApplyPayload}
          isDirty={isPayloadDirty}
        />
      )}

      {/* Save Template Dialog */}
      {showSaveTemplateDialog && (
        <div className="modal-overlay" onClick={() => setShowSaveTemplateDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <h3 className="text-lg" style={{ marginTop: 0, marginBottom: "1rem" }}>
              Save Template
            </h3>
            <input
              type="text"
              className="input"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              style={{ marginBottom: "1rem" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveTemplate();
                }
              }}
            />
            <div style={{ display: "flex", gap: "0.625rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowSaveTemplateDialog(false);
                  setTemplateName("");
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={savingTemplate || !templateName.trim()}
                className="btn btn-outline"
              >
                {savingTemplate ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
