"use client";

import { useState } from "react";

interface ResponseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  responseBody: string;
  title?: string;
  url?: string;
  headers?: Record<string, string>;
}

export default function ResponseViewModal({
  isOpen,
  onClose,
  responseBody,
  title = "View Response",
  url,
  headers,
}: ResponseViewModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
      } catch (e) {
        console.error("Failed to copy:", e);
      }
      document.body.removeChild(textArea);
    }
  };

  if (!isOpen) return null;

  // Try to format as JSON if possible
  let formattedBody = responseBody;
  let isValidJson = false;
  try {
    const parsed = JSON.parse(responseBody);
    formattedBody = JSON.stringify(parsed, null, 2);
    isValidJson = true;
  } catch {
    // Not JSON, use as-is
    formattedBody = responseBody;
  }

  // Format headers as JSON string
  let formattedHeaders = "";
  if (headers && Object.keys(headers).length > 0) {
    try {
      formattedHeaders = JSON.stringify(headers, null, 2);
    } catch {
      formattedHeaders = JSON.stringify(headers);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 className="text-xl" style={{ margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
              width: "30px",
              height: "30px",
              color: `hsl(var(--foreground))`,
            }}
          >
            ×
          </button>
        </div>

        {/* URL */}
        {url && (
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="text-sm" style={{ fontWeight: "500" }}>
                Request URL:
              </label>
              <button
                onClick={() => copyToClipboard(url, "url")}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem" }}
              >
                {copiedSection === "url" ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
            <div className="code" style={{ wordBreak: "break-all" }}>
              {url}
            </div>
          </div>
        )}

        {/* Headers */}
        {formattedHeaders && (
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <label className="text-sm" style={{ fontWeight: "500" }}>
                Request Headers:
              </label>
              <button
                onClick={() => copyToClipboard(formattedHeaders, "headers")}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem" }}
              >
                {copiedSection === "headers" ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
            <textarea
              value={formattedHeaders}
              readOnly
              className="code"
              style={{
                width: "100%",
                minHeight: "150px",
                resize: "vertical",
                cursor: "text",
              }}
              spellCheck={false}
            />
          </div>
        )}

        {/* Response Body */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "1rem",
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
              flexShrink: 0,
            }}
          >
            <label className="text-sm" style={{ fontWeight: "500" }}>
              Response Body:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {isValidJson && (
                <span className="text-xs" style={{ color: `hsl(var(--success))` }}>
                  ✓ Valid JSON
                </span>
              )}
              <button
                onClick={() => copyToClipboard(formattedBody, "body")}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem" }}
              >
                {copiedSection === "body" ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>
          <textarea
            value={formattedBody}
            readOnly
            className="code"
            style={{
              flex: "1 1 auto",
              minHeight: "200px",
              maxHeight: "100%",
              resize: "none",
              cursor: "text",
              overflowY: "auto",
            }}
            spellCheck={false}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.625rem",
            justifyContent: "flex-end",
          }}
        >
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

