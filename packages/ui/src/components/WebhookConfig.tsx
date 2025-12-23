"use client";

import { useState, useEffect } from "react";
import {
  buildWebhookUrl,
  type WebhookGatewayConfig,
  headersRecordToArray,
  headersArrayToRecord,
} from "@/lib/webhook-config";

interface GatewayMeta {
  events: string[];
}

interface MetaResponse {
  gateways: Record<string, GatewayMeta>;
}

export default function WebhookConfig() {
  const [gateways, setGateways] = useState<Record<string, GatewayMeta>>({});
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [config, setConfig] = useState<WebhookGatewayConfig>({
    urlBase: "",
    queryParams: [],
    headers: [],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load gateways on mount
  useEffect(() => {
    fetch("/api/meta")
      .then((res) => res.json())
      .then((data: MetaResponse) => {
        setGateways(data.gateways);
        const gatewayNames = Object.keys(data.gateways);
        if (gatewayNames.length > 0) {
          // Select first gateway
          setSelectedGateway(gatewayNames[0]);
        }
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load gateways" });
      });
  }, []);

  // Load config when gateway changes
  useEffect(() => {
    if (selectedGateway) {
      // Fetch config from server
      fetch(`/api/config/webhook?gateway=${selectedGateway}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.urlBase) {
            // Parse URL to extract base and query params
            try {
              const url = new URL(data.urlBase);
              const queryParams: Array<{ key: string; value: string }> = [];
              url.searchParams.forEach((value, key) => {
                queryParams.push({ key, value });
              });
              
              setConfig({
                urlBase: `${url.protocol}//${url.host}${url.pathname}`,
                queryParams,
                headers: headersRecordToArray(data.headers || {}),
              });
            } catch {
              // If URL parsing fails, use as-is
              setConfig({
                urlBase: data.urlBase || "",
                queryParams: [],
                headers: headersRecordToArray(data.headers || {}),
              });
            }
          } else {
            // No config found, use defaults
            setConfig({
              urlBase: "",
              queryParams: [],
              headers: [],
            });
          }
        })
        .catch(() => {
          // On error, use defaults
          setConfig({
            urlBase: "",
            queryParams: [],
            headers: [],
          });
        });
      
      // Sync gateway selection with Event Simulator
      window.dispatchEvent(
        new CustomEvent("webhook-config-gateway-changed", {
          detail: { gateway: selectedGateway },
        })
      );
    }
  }, [selectedGateway]);

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
    setConfig({
      ...config,
      headers: [...config.headers, { key: "", value: "" }],
    });
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = config.headers.filter((_, i) => i !== index);
    setConfig({ ...config, headers: newHeaders });
  };

  const handleSave = async () => {
    if (!selectedGateway) {
      setMessage({ type: "error", text: "Please select a gateway" });
      return;
    }

    if (!config.urlBase.trim()) {
      setMessage({ type: "error", text: "Please enter a webhook URL base" });
      return;
    }

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
          text: `Webhook configuration saved successfully for ${selectedGateway}`,
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const finalUrl = buildWebhookUrl(config);
  const gatewayNames = Object.keys(gateways);

  return (
    <div className="card">
      <h2 className="text-lg" style={{ marginBottom: "1rem" }}>
        Webhook Configuration
      </h2>

      {/* Gateway selector */}
      {gatewayNames.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <label className="text-sm" style={{ display: "block", marginBottom: "0.3125rem" }}>
            Gateway:
          </label>
          <select
            className="select"
            value={selectedGateway}
            onChange={(e) => setSelectedGateway(e.target.value)}
          >
            <option value="">-- Select Gateway --</option>
            {gatewayNames.map((gateway) => (
              <option key={gateway} value={gateway}>
                {gateway}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedGateway && (
        <>
          {/* URL Base */}
          <div style={{ marginBottom: "1rem" }}>
            <label className="text-sm" style={{ display: "block", marginBottom: "0.3125rem" }}>
              URL Base:
            </label>
            <input
              type="text"
              className="input"
              value={config.urlBase}
              onChange={(e) => handleUrlBaseChange(e.target.value)}
              placeholder="http://localhost:4002/webhook"
              style={{ width: "100%" }}
            />
          </div>

          {/* Query Params */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3125rem" }}>
              <label className="text-sm">Query Parameters:</label>
              <button
                onClick={handleAddQueryParam}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem" }}
              >
                + Add
              </button>
            </div>
            {config.queryParams.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
                No query parameters
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {config.queryParams.map((param, index) => (
                  <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="text"
                      className="input"
                      value={param.key}
                      onChange={(e) => handleQueryParamChange(index, "key", e.target.value)}
                      placeholder="key"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      className="input"
                      value={param.value}
                      onChange={(e) => handleQueryParamChange(index, "value", e.target.value)}
                      placeholder="value"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => handleRemoveQueryParam(index)}
                      className="btn btn-destructive btn-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {finalUrl && finalUrl !== config.urlBase && (
              <div className="text-sm" style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
                Final URL: <code style={{ fontSize: "0.75rem" }}>{finalUrl}</code>
              </div>
            )}
          </div>

          {/* Headers */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3125rem" }}>
              <label className="text-sm">Custom Headers:</label>
              <button
                onClick={handleAddHeader}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem" }}
              >
                + Add
              </button>
            </div>
            {config.headers.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
                No custom headers (gateway headers will still be included)
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {config.headers.map((header, index) => (
                  <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="text"
                      className="input"
                      value={header.key}
                      onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                      placeholder="header name"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      className="input"
                      value={header.value}
                      onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                      placeholder="header value"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => handleRemoveHeader(index)}
                      className="btn btn-destructive btn-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </>
      )}

      {message && (
        <div className={`message ${message.type === "success" ? "message-success" : "message-error"}`} style={{ marginTop: "1rem" }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
