"use client";

import { useState, useEffect } from "react";
import WebhookConfig from "@/components/WebhookConfig";
import EventSimulator from "@/components/EventSimulator";
import Logs from "@/components/Logs";

export default function Home() {
  return (
    <main>
      <h1 className="text-xl" style={{ marginBottom: "2rem", fontWeight: "bold" }}>
        Payment Gateway Webhook Simulator
      </h1>
      <div className="grid2" style={{ marginBottom: "1.5rem" }}>
        <WebhookConfig />
        <EventSimulator />
      </div>
      <Logs />
    </main>
  );
}

