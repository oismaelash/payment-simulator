"use client";

import { useState, useEffect } from "react";
import PayloadEditorModal from "./PayloadEditorModal";
import {
  getTemplatesForEvent,
  saveTemplate,
  deleteTemplate,
  type WebhookTemplate,
} from "@/lib/templates";
import {
  getGatewayConfig,
  buildWebhookUrl,
  headersArrayToRecord,
} from "@/lib/webhook-config";

interface GatewayMeta {
  events: string[];
}

interface MetaResponse {
  gateways: Record<string, GatewayMeta>;
}

// Mapeamento de URLs de documentação oficial para cada gateway
const GATEWAY_DOCUMENTATION_URLS: Record<string, string> = {
  stripe: "https://stripe.com/docs/api/webhooks",
  abacatepay: "https://docs.abacatepay.com",
  asaas: "https://docs.asaas.com/webhooks",
  mercadopago: "https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/payment-notifications",
};

export default function EventSimulator() {
  const [gateways, setGateways] = useState<Record<string, GatewayMeta>>({});
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [basePayload, setBasePayload] = useState<string>("");
  const [currentPayload, setCurrentPayload] = useState<any>(null);
  const [templates, setTemplates] = useState<WebhookTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Load gateway metadata
    fetch("/api/meta")
      .then((res) => res.json())
      .then((data: MetaResponse) => {
        setGateways(data.gateways);
        const firstGateway = Object.keys(data.gateways)[0];
        if (firstGateway) {
          setSelectedGateway(firstGateway);
        }
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load gateways" });
      });
  }, []);

  // Listen for gateway changes from Webhook Configuration
  useEffect(() => {
    const handleGatewayChange = (event: CustomEvent<{ gateway: string }>) => {
      const { gateway } = event.detail;
      // Only update if the gateway exists in our gateways list
      if (gateway && gateways[gateway]) {
        setSelectedGateway(gateway);
        // Reset event selection when gateway changes
        setSelectedEvent("");
      }
    };

    window.addEventListener(
      "webhook-config-gateway-changed",
      handleGatewayChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "webhook-config-gateway-changed",
        handleGatewayChange as EventListener
      );
    };
  }, [gateways]);

  // Load payload base and templates when gateway/event changes
  useEffect(() => {
    if (selectedGateway && selectedEvent) {
      // Load base payload
      fetch(`/api/payload?gateway=${selectedGateway}&event=${selectedEvent}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.payload) {
            setBasePayload(data.payload);
            // Parse and set as current payload
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

      // Load templates for this gateway+event
      const eventTemplates = getTemplatesForEvent(selectedGateway, selectedEvent);
      setTemplates(eventTemplates);
      setSelectedTemplateId("");
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
      }
    } else if (!selectedTemplateId && basePayload) {
      // Reset to base payload
      try {
        const parsed = JSON.parse(basePayload);
        setCurrentPayload(parsed);
      } catch {
        setCurrentPayload(null);
      }
    }
  }, [selectedTemplateId, templates, basePayload]);

  const handleGatewayChange = (gateway: string) => {
    setSelectedGateway(gateway);
    setSelectedEvent("");
  };

  // Auto-hide success messages after 3 seconds
  useEffect(() => {
    if (message?.type === "success") {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSend = async () => {
    if (!selectedGateway || !selectedEvent) {
      setMessage({ type: "error", text: "Please select gateway and event" });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      // Get webhook config for selected gateway
      const gatewayConfig = getGatewayConfig(selectedGateway);
      const finalUrl = buildWebhookUrl(gatewayConfig);
      const customHeaders = headersArrayToRecord(gatewayConfig.headers);

      // Fallback to legacy webhookUrl if new config is empty
      const savedWebhookUrl = finalUrl || localStorage.getItem("webhookUrl")?.trim() || "";

      if (!savedWebhookUrl) {
        setMessage({
          type: "error",
          text: "Webhook URL not configured. Please configure it in Webhook Configuration panel.",
        });
        setSending(false);
        return;
      }

      const body: any = {
        gateway: selectedGateway,
        event: selectedEvent,
      };

      // Always send webhookUrl from client config (client is source of truth)
      // Use finalUrl if available, otherwise fallback to legacy
      if (finalUrl) {
        body.webhookUrl = finalUrl;
      } else if (savedWebhookUrl) {
        // Legacy fallback
        body.webhookUrl = savedWebhookUrl;
      }

      // Always send extraHeaders from client config (even if empty object)
      // This allows clearing old headers by saving empty headers
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

      if (response.ok && data.success) {
        setMessage({
          type: "success",
          text: `Webhook sent successfully (${data.status})`,
        });
        // Trigger logs refresh
        window.dispatchEvent(new Event("logs-refresh"));
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
    }
  };

  const handleApplyPayload = (payload: any) => {
    setCurrentPayload(payload);
    setSelectedTemplateId(""); // Clear template selection when manually editing
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !currentPayload) {
      setMessage({ type: "error", text: "Please enter a template name" });
      return;
    }

    setSavingTemplate(true);
    try {
      saveTemplate({
        name: templateName.trim(),
        gateway: selectedGateway,
        event: selectedEvent,
        payload: currentPayload,
      });
      // Reload templates
      const eventTemplates = getTemplatesForEvent(selectedGateway, selectedEvent);
      setTemplates(eventTemplates);
      setTemplateName("");
      setShowSaveTemplateDialog(false);
      setMessage({ type: "success", text: "Template saved successfully" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save template" });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplateId) return;
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(selectedTemplateId);
      const eventTemplates = getTemplatesForEvent(selectedGateway, selectedEvent);
      setTemplates(eventTemplates);
      setSelectedTemplateId("");
      setMessage({ type: "success", text: "Template deleted" });
    }
  };

  const handleResetToBase = () => {
    if (basePayload) {
      try {
        const parsed = JSON.parse(basePayload);
        setCurrentPayload(parsed);
        setSelectedTemplateId("");
      } catch {
        setMessage({ type: "error", text: "Failed to reset payload" });
      }
    }
  };

  const availableEvents = selectedGateway
    ? gateways[selectedGateway]?.events || []
    : [];

  return (
    <>
      <div className="card">
        <h2 className="text-lg" style={{ marginBottom: "1rem" }}>
          Event Simulator
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div>
            <label className="text-sm" style={{ display: "block", marginBottom: "0.3125rem" }}>
              Select Gateway:
            </label>
            <select
              className="select"
              value={selectedGateway}
              onChange={(e) => handleGatewayChange(e.target.value)}
            >
              <option value="">-- Select Gateway --</option>
              {Object.keys(gateways).map((gateway) => (
                <option key={gateway} value={gateway}>
                  {gateway}
                </option>
              ))}
            </select>
            {selectedGateway && GATEWAY_DOCUMENTATION_URLS[selectedGateway] && (
              <button
                onClick={() => window.open(GATEWAY_DOCUMENTATION_URLS[selectedGateway], "_blank")}
                className="btn btn-secondary"
                style={{ marginTop: "0.5rem", width: "100%" }}
              >
                📚 Open Official Documentation
              </button>
            )}
          </div>
          <div>
            <label className="text-sm" style={{ display: "block", marginBottom: "0.3125rem" }}>
              Select Event:
            </label>
            <select
              className="select"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              disabled={!selectedGateway || availableEvents.length === 0}
            >
              <option value="">-- Select Event --</option>
              {availableEvents.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>
          </div>

          {selectedGateway && selectedEvent && (
            <>
              <div>
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
                }}
              >
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  View/Edit Payload
                </button>
                <button
                  onClick={handleResetToBase}
                  disabled={!basePayload}
                  className="btn btn-secondary"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowSaveTemplateDialog(true)}
                  disabled={!currentPayload}
                  className="btn btn-success"
                >
                  Save Template
                </button>
              </div>
            </>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !selectedGateway || !selectedEvent}
            className="btn btn-primary"
          >
            {sending ? "Sending..." : "Send Webhook"}
          </button>
          {message && (
            <div className={`message ${message.type === "success" ? "message-success" : "message-error"}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

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
                className="btn btn-success"
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
