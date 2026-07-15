import type { Metadata } from "next";
import "@payment-simulator/theme/theme.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payment Gateway Webhook Simulator",
  description: "Simulate payment webhooks for testing",
};

// Render at request time so the DEMO_MODE banner reflects the runtime env
// (otherwise Next prerenders the layout statically and bakes the flag in).
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="container">
        {process.env.DEMO_MODE === "true" && (
          <div
            style={{
              width: "100%",
              background: "#78350f",
              color: "#fef3c7",
              borderBottom: "1px solid #b45309",
              padding: "10px 16px",
              fontSize: "13px",
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            <strong>Demo instance.</strong> Webhooks are sent from this server —
            it cannot reach your <code>localhost</code>. To test your own local
            webhook handlers, run it locally:{" "}
            <code style={{ background: "#00000033", padding: "1px 6px", borderRadius: 4 }}>
              curl -fsSL https://paymentsimulator.com/install | bash
            </code>{" "}
            (<a href="https://paymentsimulator.com" style={{ color: "#fde68a", textDecoration: "underline" }}>paymentsimulator.com</a>)
          </div>
        )}
        {children}
      </body>
    </html>
  );
}

