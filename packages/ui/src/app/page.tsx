"use client";

import { useState, useEffect } from "react";
import WebhookConfig from "@/components/WebhookConfig";
import Logs from "@/components/Logs";
import Dropdown, { type DropdownOption } from "@/components/Dropdown";

interface GatewayMeta {
  events: string[];
}

interface MetaResponse {
  gateways: Record<string, GatewayMeta>;
}

export default function Home() {
  const [gateways, setGateways] = useState<Record<string, GatewayMeta>>({});
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [hostInfo, setHostInfo] = useState<string>("");

  // Get host information dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const port = window.location.port;
      // Only show port if it's not the default port (80 for http, 443 for https)
      const isDefaultPort = 
        (!port && window.location.protocol === "http:") ||
        (!port && window.location.protocol === "https:") ||
        (port === "80" && window.location.protocol === "http:") ||
        (port === "443" && window.location.protocol === "https:");
      
      setHostInfo(isDefaultPort ? hostname : `${hostname}:${port}`);
    }
  }, []);

  // Load gateways on mount
  useEffect(() => {
    setLoadingGateways(true);
    fetch("/api/meta")
      .then((res) => res.json())
      .then((data: MetaResponse) => {
        setGateways(data.gateways);
        const gatewayNames = Object.keys(data.gateways);
        if (gatewayNames.length > 0 && !selectedGateway) {
          // Select first gateway if none selected
          setSelectedGateway(gatewayNames[0]);
        }
        setLoadingGateways(false);
      })
      .catch(() => {
        setLoadingGateways(false);
      });
  }, []);

  const gatewayNames = Object.keys(gateways);

  return (
    <>
      <header className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ 
              background: "linear-gradient(to bottom right, hsl(217 91% 60%), hsl(188 94% 47%))",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px hsl(188 94% 47% / 0.2)"
            }}>
              <span className="material-symbols-outlined" style={{ color: "white", fontSize: "1.25rem" }}>dns</span>
            </div>
            <div>
              <h1 style={{ 
                fontWeight: 700, 
                fontSize: "0.875rem", 
                color: "hsl(var(--foreground))", 
                lineHeight: 1.2,
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}>
                Payment Simulator
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.125rem" }}>
                <p className="mono" style={{ fontSize: "0.6875rem", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em" }}>
                  {hostInfo || "localhost:4001"}
                </p>
                <span style={{ width: "0.25rem", height: "0.25rem", borderRadius: "50%", backgroundColor: "hsl(var(--muted-foreground))" }} />
                <span style={{ fontSize: "0.6875rem", color: "hsl(var(--primary))", fontWeight: 500 }}>v1.0.0</span>
              </div>
            </div>
          </div>
          {/* Gateway selector */}
          {gatewayNames.length > 0 && (
            <>
              <div style={{ width: "1px", height: "1.5rem", backgroundColor: "hsl(var(--border))" }} />
              <Dropdown
                options={gatewayNames.map((name) => ({ value: name, label: name }))}
                value={selectedGateway}
                onChange={setSelectedGateway}
                placeholder="-- Select Gateway --"
                disabled={loadingGateways}
                searchPlaceholder="Search gateway..."
                style={{ width: "10rem", minWidth: "10rem", maxWidth: "10rem" }}
              />
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* <div className="status-online">
            <div className="status-online-dot" />
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "hsl(142 76% 36%)", textTransform: "uppercase", letterSpacing: "0.1em" }}>System Online</span>
          </div> */}
          <a
            href="https://github.com/oismaelash/payment-simulator"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-action"
            style={{
              padding: "0.5rem",
              textDecoration: "none",
              textTransform: "none",
              letterSpacing: "normal"
            }}
            title="GitHub Repository"
          >
            <svg
              style={{ width: "1.25rem", height: "1.25rem", fill: "currentColor" }}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </header>
      <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div className="grid2">
          <WebhookConfig gateways={gateways} loadingGateways={loadingGateways} selectedGateway={selectedGateway} setSelectedGateway={setSelectedGateway} />
          <Logs />
        </div>
      </main>
    </>
  );
}

