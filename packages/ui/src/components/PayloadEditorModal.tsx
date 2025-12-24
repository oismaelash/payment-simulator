"use client";

import { useState, useEffect } from "react";

interface PayloadEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPayload: string;
  onApply: (payload: any) => void;
  isDirty?: boolean;
}

export default function PayloadEditorModal({
  isOpen,
  onClose,
  initialPayload,
  onApply,
  isDirty = false,
}: PayloadEditorModalProps) {
  const [payloadText, setPayloadText] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Format the initial payload as JSON
      try {
        const parsed = JSON.parse(initialPayload);
        setPayloadText(JSON.stringify(parsed, null, 2));
        setIsValid(true);
        setError(null);
      } catch {
        setPayloadText(initialPayload);
        setIsValid(false);
        setError("Invalid JSON");
      }
    }
  }, [isOpen, initialPayload]);

  const handleChange = (value: string) => {
    setPayloadText(value);
    try {
      JSON.parse(value);
      setIsValid(true);
      setError(null);
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleApply = () => {
    if (!isValid) return;
    try {
      const parsed = JSON.parse(payloadText);
      onApply(parsed);
      onClose();
    } catch {
      // Should not happen if isValid is true
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(payloadText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = payloadText;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error("Failed to copy:", e);
      }
      document.body.removeChild(textArea);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 className="text-xl" style={{ margin: 0 }}>
            Edit Payload{isDirty && <span style={{ marginLeft: "0.5rem", opacity: 0.7 }}>•</span>}
          </h2>
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

        <div style={{ flex: 1, display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <label className="text-sm" style={{ fontWeight: "500" }}>
              JSON Payload:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {!isValid && error && (
                <span className="text-xs" style={{ color: `hsl(var(--destructive))` }}>
                  {error}
                </span>
              )}
              {isValid && (
                <span className="text-xs" style={{ color: `hsl(var(--success))` }}>
                  ✓ Valid JSON
                </span>
              )}
              <button
                onClick={copyToClipboard}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem" }}
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>
          <textarea
            value={payloadText}
            onChange={(e) => handleChange(e.target.value)}
            className="code"
            style={{
              flex: 1,
              minHeight: "400px",
              resize: "vertical",
              cursor: "text",
              border: `1px solid ${isValid ? `hsl(var(--border))` : `hsl(var(--destructive))`}`,
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
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!isValid}
            className="btn btn-primary"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
