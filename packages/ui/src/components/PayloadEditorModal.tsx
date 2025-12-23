"use client";

import { useState, useEffect } from "react";

interface PayloadEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPayload: string;
  onApply: (payload: any) => void;
}

export default function PayloadEditorModal({
  isOpen,
  onClose,
  initialPayload,
  onApply,
}: PayloadEditorModalProps) {
  const [payloadText, setPayloadText] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <h2 className="text-xl" style={{ margin: 0 }}>Edit Payload</h2>
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
          </div>
          <textarea
            value={payloadText}
            onChange={(e) => handleChange(e.target.value)}
            className="code-white"
            style={{
              flex: 1,
              minHeight: "400px",
              resize: "vertical",
              borderColor: isValid ? `hsl(var(--border))` : `hsl(var(--destructive))`,
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
