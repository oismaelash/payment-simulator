import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware to capture raw body as text
app.use(
  express.text({
    type: "*/*", // Accept any content type
  })
);

// Helper function to format timestamp
function getTimestamp(): string {
  return new Date().toISOString();
}

// POST /webhook - Receive webhook and log everything
app.post("/webhook", (req: Request, res: Response) => {
  const timestamp = getTimestamp();
  const method = req.method;
  const path = req.path;
  const headers = req.headers;
  const body = req.body || "";

  // Log to console
  console.log("\n" + "=".repeat(80));
  console.log(`[${timestamp}] Webhook Received`);
  console.log("=".repeat(80));
  console.log(`Method: ${method}`);
  console.log(`Path: ${path}`);
  console.log("\nHeaders:");
  console.log(JSON.stringify(headers, null, 2));
  console.log("\nBody:");
  console.log(body);
  console.log("=".repeat(80) + "\n");

  // Always return 200 OK
  res.status(200).json({ ok: true });
});

// GET /health - Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook Receiver running on http://localhost:${PORT}`);
  console.log(`📥 Listening for webhooks at http://localhost:${PORT}/webhook`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health\n`);
});

