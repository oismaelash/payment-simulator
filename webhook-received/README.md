# Webhook Receiver

A simple HTTP server for receiving and logging webhooks, useful for testing the Payment Gateway Webhook Simulator.

## Features

- Receives webhooks via `POST /webhook`
- Logs headers and body (raw) to console
- Always returns `200 OK`
- Health check at `GET /health`

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

The server will start on port **4002** by default.

To use a different port, set the `PORT` environment variable:

```bash
PORT=3000 npm run dev
```

## Endpoints

### POST /webhook

Receives any webhook and logs all information.

**Response:**
```json
{
  "ok": true
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "ok": true
}
```

## How to Use with the Simulator

1. Start this receiver:
   ```bash
   cd webhook-received
   npm run dev
   ```

2. In the simulator (running at `http://localhost:4001`), configure the Webhook URL as:
   ```
   http://localhost:4002/webhook
   ```

3. Trigger any event from the simulator. You'll see logs in the receiver console showing:
   - Timestamp
   - Method and Path
   - Complete headers
   - Body (raw JSON)

## Example Log

```
================================================================================
[2024-01-15T10:30:00.000Z] Webhook Received
================================================================================
Method: POST
Path: /webhook

Headers:
{
  "content-type": "application/json",
  "stripe-signature": "test",
  "host": "localhost:4002",
  ...
}

Body:
{
  "id": "evt_1234567890",
  "object": "event",
  ...
}
================================================================================
```

## Build for Production

```bash
npm run build
npm start
```

## Notes

- Logs are only in `stdout` (console) - no persistence
- Does not validate webhook signatures - only receives and logs
- Accepts any content-type
