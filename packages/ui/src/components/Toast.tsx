"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const toastContent = (
    <div
      className={`toast toast-${type}`}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 10000,
        animation: "slide-in-right 0.3s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span className="material-symbols-outlined icon-sm">
          {type === "success" ? "check_circle" : type === "error" ? "error" : "info"}
        </span>
        <span className="toast-message">{message}</span>
        <button
          onClick={onClose}
          className="toast-close"
          aria-label="Close"
        >
          <span className="material-symbols-outlined icon-sm">close</span>
        </button>
      </div>
    </div>
  );

  return typeof window !== "undefined" ? createPortal(toastContent, document.body) : null;
}

