# Contributing Guide

This guide explains how to add a new payment gateway or update an existing gateway in the Payment Gateway Webhook Simulator.

## Architecture Overview

The project follows a modular architecture with clear separation of responsibilities:

- **Core (`packages/core`)**: Defines the `GatewayAdapter` contract and the `simulate()` function that sends webhooks. The core is gateway-agnostic and understands only the canonical `payment.succeeded` event.

- **Gateways (`packages/gateways/*`)**: Each gateway implements an adapter that:
  - Lists supported events
  - Maps events to payload files
  - Provides default headers
  - Optionally defines the HTTP method (`GET` or `POST`)

- **UI (`packages/ui`)**: Maintains an adapter registry in `packages/ui/src/gateways.ts` and provides a web interface for configuring and simulating webhooks.

### GatewayAdapter Contract

Every gateway must implement the `GatewayAdapter` interface:

```typescript
interface GatewayAdapter {
  getSupportedEvents(): string[];
  getEventDefinition(event: string): {
    canonicalEvent: CanonicalEvent;
    payloadFile: string;  // Absolute path to the JSON file
    headers: Record<string, string>;
    method?: "GET" | "POST";  // Optional, default is "POST"
  } | null;
}
```

## Quick Checklist: Adding a New Gateway

- [ ] Create directory structure in `packages/gateways/<gateway>/`
- [ ] Create `events.ts` implementing `GatewayAdapter`
- [ ] Create `headers.json` with default headers
- [ ] Create `index.ts` exporting the adapter
- [ ] Create `package.json` with dependencies and scripts
- [ ] Create `tsconfig.json` extending the root config
- [ ] Add payload files in `payloads/`
- [ ] Register the adapter in `packages/ui/src/gateways.ts`
- [ ] Update `dev` and `build` scripts in root `package.json`
- [ ] (Optional) Update documentation in `README.md`

## Adding a New Gateway

### Step 1: Create Directory Structure

Create the following structure in `packages/gateways/<gateway>/`:

```
packages/gateways/<gateway>/
├── events.ts          # Adapter implementation
├── headers.json       # Gateway default headers
├── index.ts          # Exports the adapter
├── package.json      # Package configuration
├── tsconfig.json     # TypeScript configuration
└── payloads/         # JSON payload files
    └── <event>.json
```

**Example**: To add a gateway called "paypal":

```bash
mkdir -p packages/gateways/paypal/payloads
```

### Step 2: Create `package.json`

Create a `package.json` following the pattern of other gateways:

```json
{
  "name": "@payment-simulator/gateway-paypal",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@payment-simulator/core": "file:../../core"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

**Important**: The package name must follow the pattern `@payment-simulator/gateway-<name>`.

### Step 3: Create `tsconfig.json`

Create a `tsconfig.json` that extends the root configuration:

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./"
  },
  "include": ["./**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Create `headers.json`

Create a `headers.json` file with default headers that will be sent with all webhooks from this gateway:

```json
{
  "X-PayPal-Webhook-Id": "WH-2W4267756J0023456",
  "X-PayPal-Webhook-Event-Type": "PAYMENT.CAPTURE.COMPLETED"
}
```

**Note**: If the gateway doesn't require specific headers, use an empty object `{}`.

### Step 5: Implement the Adapter (`events.ts`)

There are two main patterns for implementing the adapter:

#### Pattern 1: Dynamic Events (Recommended)

This pattern automatically reads `.json` files from the `payloads/` directory and uses the file name (without extension) as the event name. Used by Stripe, Asaas, Pagar.me, and Mercado Pago.

**Example** (`packages/gateways/paypal/events.ts`):

```typescript
import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import type { GatewayAdapter } from "@payment-simulator/core";
import { CANONICAL_EVENT } from "@payment-simulator/core";

function getRepoRoot(): string {
  // When executed via npm workspaces, INIT_CWD points to the repo root directory.
  // Fallback for local execution.
  return process.env.INIT_CWD ?? resolve(process.cwd(), "../..");
}

function getPayPalPayloadsDir(): string {
  return resolve(getRepoRoot(), "packages/gateways/paypal/payloads");
}

/**
 * PayPal gateway adapter
 * Supports any event that has a corresponding JSON file in:
 *   packages/gateways/paypal/payloads/{event}.json
 */
export class PayPalAdapter implements GatewayAdapter {
  private headers: Record<string, string> = {};

  constructor() {
    this.loadHeaders();
  }

  private loadHeaders(): void {
    try {
      const headersPath = resolve(
        getRepoRoot(),
        "packages/gateways/paypal/headers.json"
      );
      const headersContent = readFileSync(headersPath, "utf-8");
      this.headers = JSON.parse(headersContent);
    } catch (error) {
      // If headers.json doesn't exist yet, use empty object
      this.headers = {};
    }
  }

  getSupportedEvents(): string[] {
    try {
      const dir = getPayPalPayloadsDir();
      if (!existsSync(dir)) return [];

      return readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isFile())
        .map((d) => d.name)
        .filter((name) => name.endsWith(".json"))
        .filter((name) => name !== ".gitkeep")
        .map((name) => name.replace(/\.json$/, ""))
        .sort((a, b) => a.localeCompare(b));
    } catch {
      return [];
    }
  }

  getEventDefinition(event: string) {
    const payloadFile = resolve(
      getPayPalPayloadsDir(),
      `${event}.json`
    );
    if (!existsSync(payloadFile)) return null;

    return {
      canonicalEvent: CANONICAL_EVENT,
      payloadFile,
      headers: { ...this.headers },
    };
  }
}
```

#### Support for GET and POST Methods

By default, all webhooks are sent as `POST` with JSON in the body. If the gateway uses IPN (Instant Payment Notification) or redirects that require `GET`, you can specify the method:

**Example** (Mercado Pago uses `GET` for IPN events):

```typescript
getEventDefinition(event: string) {
  const payloadFile = resolve(
    getMercadoPagoPayloadsDir(),
    `${event}.json`
  );
  if (!existsSync(payloadFile)) return null;

  // IPN events use GET with querystring
  // Other events use POST with JSON body
  const method: "GET" | "POST" = event.startsWith("ipn.") ? "GET" : "POST";

  return {
    canonicalEvent: CANONICAL_EVENT,
    payloadFile,
    headers: { ...this.headers },
    method,
  };
}
```

**Note**: When `method: "GET"` is specified, the JSON payload is automatically converted to a query string in the URL.

### Step 6: Create `index.ts`

Create an `index.ts` file that exports the adapter:

```typescript
export * from "./events";
```

### Step 7: Add Payload Files

Add JSON files in the `payloads/` directory with the actual gateway payloads. The file name must match the event name (without the `.json` extension).

**Example**: For the `payment.capture.completed` event, create `packages/gateways/paypal/payloads/payment.capture.completed.json`:

```json
{
  "id": "WH-2W4267756J0023456",
  "event_version": "1.0",
  "create_time": "2018-12-10T21:20:47.000Z",
  "resource_type": "capture",
  "resource": {
    "id": "2GG279541U471931P",
    "status": "COMPLETED",
    "amount": {
      "currency_code": "USD",
      "value": "10.99"
    }
  }
}
```

**Important**: Payloads are sent exactly as-is (without modification or validation).

### Step 8: Register the Gateway in the UI

Edit `packages/ui/src/gateways.ts` and add the import and registration of the new adapter:

```typescript
import { StripeAdapter } from "@payment-simulator/gateway-stripe";
import { AbacatePayAdapter } from "@payment-simulator/gateway-abacatepay";
import { AsaasAdapter } from "@payment-simulator/gateway-asaas";
import { MercadoPagoAdapter } from "@payment-simulator/gateway-mercadopago";
import { PagarmeAdapter } from "@payment-simulator/gateway-pagarme";
import { PayPalAdapter } from "@payment-simulator/gateway-paypal"; // New
import type { GatewayAdapter } from "@payment-simulator/core";

export const gatewayAdapters: Record<string, GatewayAdapter> = {
  stripe: new StripeAdapter(),
  abacatepay: new AbacatePayAdapter(),
  asaas: new AsaasAdapter(),
  mercadopago: new MercadoPagoAdapter(),
  pagarme: new PagarmeAdapter(),
  paypal: new PayPalAdapter(), // New
};
```

**Important**: The key in the `gatewayAdapters` object will be used as the gateway identifier in the UI and APIs.

### Step 9: Update Build Scripts

Edit the root `package.json` and add the new gateway to the `dev` and `build` scripts:

```json
{
  "scripts": {
    "dev": "npm run build --workspace=@payment-simulator/core && npm run build --workspace=@payment-simulator/gateway-stripe && npm run build --workspace=@payment-simulator/gateway-abacatepay && npm run build --workspace=@payment-simulator/gateway-asaas && npm run build --workspace=@payment-simulator/gateway-mercadopago && npm run build --workspace=@payment-simulator/gateway-pagarme && npm run build --workspace=@payment-simulator/gateway-paypal && npm run dev --workspace=@payment-simulator/ui",
    "build": "npm run build --workspace=@payment-simulator/core && npm run build --workspace=@payment-simulator/gateway-stripe && npm run build --workspace=@payment-simulator/gateway-abacatepay && npm run build --workspace=@payment-simulator/gateway-asaas && npm run build --workspace=@payment-simulator/gateway-mercadopago && npm run build --workspace=@payment-simulator/gateway-pagarme && npm run build --workspace=@payment-simulator/gateway-paypal && npm run build --workspace=@payment-simulator/ui"
  }
}
```

### Step 10: Test

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Verify in the UI**:
   - Access `http://localhost:4001`
   - The new gateway should appear in the gateway list
   - Events should appear in the gateway's event list

5. **Verify via API**:
   - Access `http://localhost:4001/api/meta`
   - The new gateway and its events should appear in the JSON response

### Step 11: Update Documentation

If you added a well-known public gateway, consider updating the "Supported Gateways" section in `README.md` to document the supported events.

## Updating an Existing Gateway

### Adding New Events

#### For Gateways with Dynamic Events

Simply add a new JSON file in `packages/gateways/<gateway>/payloads/`:

```bash
# Example: add payment.refunded event for Stripe
touch packages/gateways/stripe/payloads/payment.refunded.json
```

Edit the file with the actual event payload. The event will be automatically detected the next time the server starts.

#### For Gateways with Explicit Mapping

1. Add the payload file in `payloads/`
2. Add the event name to the `supportedEvents` array in `events.ts`
3. Add the mapping in the `payloadFileMap` object in `getEventDefinition()`

**Example** (adding `billing.refunded` event to AbacatePay):

```typescript
// 1. Add to supported events array
private readonly supportedEvents = [
  "billing.paid.pix.qrcode",
  "billing.paid.pix.billing",
  "withdraw.done",
  "withdraw.failed",
  "billing.refunded", // New
];

// 2. Add to mapping
getEventDefinition(event: string) {
  // ...
  const payloadFileMap: Record<string, string> = {
    "billing.paid.pix.qrcode": "billing.paid.pix.qrcode.json",
    "billing.paid.pix.billing": "billing.paid.pix.billing.json",
    "withdraw.done": "withdraw.done.json",
    "withdraw.failed": "withdraw.failed.json",
    "billing.refunded": "billing.refunded.json", // New
  };
  // ...
}
```

### Updating Headers

Edit the gateway's `headers.json` file:

```json
{
  "X-Custom-Header": "new-value",
  "X-Another-Header": "another-value"
}
```

Headers are reloaded when the adapter is instantiated (on each server startup).

### Changing HTTP Method (GET/POST)

Edit the `getEventDefinition()` method in `events.ts` to return `method: "GET"` or `method: "POST"` as needed:

```typescript
getEventDefinition(event: string) {
  // ...
  return {
    canonicalEvent: CANONICAL_EVENT,
    payloadFile,
    headers: { ...this.headers },
    method: "GET", // or "POST"
  };
}
```

### Debugging Tips

1. **Check supported events**:
   - Access `http://localhost:4001/api/meta` to see all gateways and events
   - Or check directly in code by calling `adapter.getSupportedEvents()`

2. **Test webhook sending**:
   - Use the UI at `http://localhost:4001`
   - Configure the webhook URL
   - Select the gateway and event
   - Click "Send Webhook"
   - Check the logs in the "Logs" section

3. **Check logs**:
   - Logs show gateway, event, timestamp, HTTP status, and success/failure
   - Click "Refresh" to update logs

4. **Check build**:
   - Run `npm run build` and verify there are no TypeScript errors
   - Run `npm run type-check` to check types without building

5. **Check file paths**:
   - Make sure `getRepoRoot()` is returning the correct path
   - Use absolute paths for `payloadFile` using `resolve()`

## Reference File Structure

For reference, here's the complete structure of an existing gateway (Stripe):

```
packages/gateways/stripe/
├── events.ts                    # Adapter implementation
├── headers.json                 # Default headers
├── index.ts                     # Exports the adapter
├── package.json                 # Package configuration
├── tsconfig.json                # TypeScript configuration
└── payloads/                    # Payload files
    ├── charge.succeeded.json
    ├── payment_intent.succeeded.json
    └── ... (other events)
```

## Frequently Asked Questions

**Q: Can I modify payloads before sending them?**  
A: No. Payloads are sent exactly as they are in the JSON files, without modification. If you need dynamic modifications, consider using the `payloadOverride` functionality in the API.

**Q: How do I add webhook signature validation?**  
A: Signature headers should be configured in `headers.json` or via UI. The simulator doesn't validate signatures - it only sends them as part of the webhook.

**Q: Can I add multiple gateways at the same time?**  
A: Yes, as long as each has a unique name and follows the structure described in this guide.

**Q: What happens if I forget to update the build scripts?**  
A: The new gateway won't be built automatically, but you can build it manually with `npm run build --workspace=@payment-simulator/gateway-<name>`.

**Q: Can I use event names with special characters?**  
A: Yes, but avoid characters that might cause problems in file names (such as `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`). Use dots (`.`) or hyphens (`-`) as separators.

## Next Steps

After adding or updating a gateway:

1. Test all supported events
2. Verify headers are correct
3. Confirm payloads are valid JSON
4. Update documentation if necessary
5. Consider adding tests (if the project has test support in the future)

---

If you have questions or encounter issues, open an issue in the project repository.
