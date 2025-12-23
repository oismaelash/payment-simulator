# Payment Gateway Webhook Simulator

An open-source developer tool for simulating payment gateway webhooks locally. This MVP focuses on simulating successful payment webhooks with user-configured webhook URLs.

## Features

- **Gateway-agnostic core**: Understands only the canonical `payment.succeeded` event
- **Gateway adapters**: Stripe, AbacatePay, and Asaas adapters map gateway-specific events to canonical events
- **Raw payload support**: Payloads are loaded from JSON files and sent without modification
- **Simple UI**: Minimal Next.js interface for configuring webhooks and triggering events
- **In-memory state**: No persistence layer - perfect for local development

## Supported Gateways

### Stripe
- **Checkout Sessions:**
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
- **Payment Intents:**
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
- **Payment Methods:**
  - `payment_method.attached`
- **Charges:**
  - `charge.succeeded`
  - `charge.failed`
  - `charge.refunded`
  - `charge.refund.updated`
- **Disputes:**
  - `charge.dispute.created`
  - `charge.dispute.funds_withdrawn`
  - `charge.dispute.funds_reinstated`
  - `charge.dispute.closed`
- **Subscriptions:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.paused`
  - `customer.subscription.resumed`
  - `customer.subscription.trial_will_end`
- **Subscription Schedules:**
  - `subscription_schedule.created`
  - `subscription_schedule.updated`
  - `subscription_schedule.canceled`
  - `subscription_schedule.aborted`
  - `subscription_schedule.completed`
  - `subscription_schedule.expiring`
  - `subscription_schedule.released`
- **Subscription Items:**
  - `subscription_item.created`
  - `subscription_item.updated`
  - `subscription_item.deleted`
- **Invoices:**
  - `invoice.created`
  - `invoice.finalized`
  - `invoice.finalization_failed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `invoice.payment_action_required`
  - `invoice.upcoming`
  - `invoice.updated`
  - `invoice.voided`
  - `invoice.sent`
  - `invoice.marked_uncollectible`

### AbacatePay
- `billing.paid.pix.qrcode` (PIX QR Code payment)
- `billing.paid.pix.billing` (PIX Billing/Cobrança)
- `withdraw.done` (Withdraw completed successfully)
- `withdraw.failed` (Withdraw failed)

### Asaas
- **Payment Events:**
  - `PAYMENT_CREATED` (Payment created)
  - `PAYMENT_CONFIRMED` (Payment confirmed)
  - `PAYMENT_RECEIVED` (Payment received)
  - `PAYMENT_OVERDUE` (Payment overdue)
  - `PAYMENT_REFUNDED` (Payment refunded)
  - `PAYMENT_DELETED` (Payment deleted)
  - `PAYMENT_AWAITING_RISK_ANALYSIS` (Payment awaiting risk analysis)
  - `PAYMENT_APPROVED_BY_RISK_ANALYSIS` (Payment approved by risk analysis)
  - `PAYMENT_REPROVED_BY_RISK_ANALYSIS` (Payment reproved by risk analysis)
  - `PAYMENT_CHARGEBACK_REQUESTED` (Payment chargeback requested)
  - `PAYMENT_CHARGEBACK_DISPUTE` (Payment chargeback dispute)
  - `PAYMENT_AWAITING_CHARGEBACK_REVERSAL` (Payment awaiting chargeback reversal)
  - `PAYMENT_DUNNING_RECEIVED` (Payment dunning received)
  - `PAYMENT_DUNNING_REQUESTED` (Payment dunning requested)
  - `PAYMENT_BANK_SLIP_VIEWED` (Payment bank slip viewed)
  - `PAYMENT_CHECKOUT_VIEWED` (Payment checkout viewed)
- **Subscription Events:**
  - `SUBSCRIPTION_CREATED` (Subscription created)
  - `SUBSCRIPTION_UPDATED` (Subscription updated)
  - `SUBSCRIPTION_DELETED` (Subscription deleted)
- **Invoice Events:**
  - `INVOICE_CREATED` (Invoice created)
  - `INVOICE_UPDATED` (Invoice updated)
  - `INVOICE_AUTHORIZED` (Invoice authorized)
  - `INVOICE_CANCELED` (Invoice canceled)
- **Checkout Events:**
  - `CHECKOUT_CREATED` (Checkout created)
  - `CHECKOUT_CANCELED` (Checkout canceled)
  - `CHECKOUT_EXPIRED` (Checkout expired)
  - `CHECKOUT_PAID` (Checkout paid)

### Pagar.me
- **Charge Events:**
  - `charge.created` (Charge created)
  - `charge.paid` (Charge paid)
  - `charge.payment_failed` (Charge payment failed)
  - `charge.canceled` (Charge canceled)
  - `charge.refunded` (Charge refunded)
- **Order Events:**
  - `order.created` (Order created)
  - `order.paid` (Order paid)
  - `order.canceled` (Order canceled)
  - `order.updated` (Order updated)
- **Subscription Events:**
  - `subscription.created` (Subscription created)
  - `subscription.updated` (Subscription updated)
  - `subscription.canceled` (Subscription canceled)

## Project Structure

```
payment-simulator/
├── packages/
│   ├── core/                    # Gateway-agnostic core simulator
│   ├── gateways/
│   │   ├── stripe/              # Stripe adapter + payloads
│   │   ├── abacatepay/          # AbacatePay adapter + payloads
│   │   ├── asaas/               # Asaas adapter + payloads
│   │   └── pagarme/             # Pagar.me adapter + payloads
│   └── ui/                      # Next.js UI + API routes
├── package.json
└── tsconfig.json
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build packages:**
   ```bash
   npm run build
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### 1. Configure Webhook URL

In the **Webhook Configuration** panel:

1. **Select a gateway** (Stripe, AbacatePay, Asaas, Mercado Pago, or Pagar.me) - each gateway can have its own configuration
2. **Enter URL base** (e.g., `http://localhost:4000/webhook`)
3. **Add query parameters** (optional):
   - Click "+ Add" to add key-value pairs
   - These will be appended to the URL when sending webhooks
   - Example: `?token=abc123&env=dev`
4. **Add custom headers** (optional):
   - Click "+ Add" to add header name-value pairs
   - Custom headers will be merged with gateway-specific headers (from `headers.json`)
   - Custom headers override gateway headers if there's a conflict
5. Click **Save Configuration**

The configuration is stored:
- In browser localStorage (persists across page refreshes)
- In server memory (syncs on save, resets on server restart)

**Note**: If you previously used the legacy single URL configuration, it will be automatically migrated to both gateways on first load.

### 2. Simulate Webhook

In the **Event Simulator** panel:
- Select a gateway (Stripe, AbacatePay, Asaas, Mercado Pago, or Pagar.me)
- Select an event from the dynamically populated list
- Click **Send Webhook**

The simulator will:
1. Load the payload JSON file for the selected event
2. Build the final webhook URL by combining:
   - URL base for the selected gateway
   - Query parameters configured for that gateway
3. POST it to the final webhook URL
4. Include headers in this order (later ones override earlier ones):
   - `Content-Type: application/json` (always included)
   - Gateway-specific headers (from `headers.json`)
   - Custom headers configured for that gateway
5. Log the result

### 3. View Logs

The **Logs** panel shows:
- Gateway name
- Event name
- Timestamp
- HTTP status code
- Success/failure status

Click **Refresh** to update the logs.

## Adding New Payloads

To add new payload files for existing events:

1. **Stripe**: Add JSON files to `packages/gateways/stripe/payloads/`
   - File name must match the event name: `{event}.json`
   - Example: `payment_intent.succeeded.json`

2. **AbacatePay**: Add JSON files to `packages/gateways/abacatepay/payloads/`
   - File names are mapped in `events.ts`
   - Current mappings:
     - `billing.paid.pix.qrcode` → `billing-paid-pix-qrcode.json`
     - `billing.paid.pix.billing` → `billing-paid-pix-billing.json`
     - `withdraw.done` → `withdraw-done.json`
     - `withdraw.failed` → `withdraw-failed.json`

3. **Pagar.me**: Add JSON files to `packages/gateways/pagarme/payloads/`
   - File name must match the event name: `{event}.json`
   - Example: `charge.paid.json`

**Important**: Payloads are sent exactly as-is (no modification, no validation).

## Configuring Gateway Headers

There are two ways to configure headers:

### 1. Static Gateway Headers (Recommended for Defaults)

Each gateway has a `headers.json` file that defines static headers sent with webhooks:

- `packages/gateways/stripe/headers.json`
- `packages/gateways/abacatepay/headers.json`
- `packages/gateways/asaas/headers.json`
- `packages/gateways/pagarme/headers.json`

Edit these files to customize default headers. The format is:

```json
{
  "Header-Name": "header-value"
}
```

These headers are included in all webhooks for that gateway.

### 2. Custom Headers per Gateway (UI Configuration)

You can also add custom headers via the **Webhook Configuration** panel:

- These headers are stored per-gateway in browser localStorage
- Custom headers override static gateway headers if there's a conflict
- Useful for environment-specific headers (e.g., API keys, test tokens)

**Header Merge Order** (later ones override earlier ones):
1. `Content-Type: application/json` (always included)
2. Gateway static headers (from `headers.json`)
3. Custom headers (from UI configuration)

Note: `Content-Type: application/json` is always included and cannot be overridden.

## Adding New Gateways

To add a new gateway:

1. **Create gateway package:**
   ```
   packages/gateways/{gateway-name}/
   ├── events.ts
   ├── headers.json
   ├── payloads/
   │   └── {event-name}.json
   └── package.json
   ```

2. **Implement adapter:**
   - Extend `GatewayAdapter` interface
   - Implement `getSupportedEvents()` and `getEventDefinition()`
   - Load headers from `headers.json`
   - Return payload file paths (absolute paths using `__dirname`)

3. **Register adapter:**
   - Add to `packages/ui/src/gateways.ts`
   - Import and instantiate your adapter class

4. **Add payload files:**
   - Place JSON payloads in `payloads/` directory
   - Map event names to file names in `getEventDefinition()`

## API Endpoints

### POST `/api/config/webhook`
Configure the webhook URL and headers for a gateway.

**Body (new format):**
```json
{
  "gateway": "stripe",
  "url": "http://localhost:4000/webhook?token=abc",
  "urlBase": "http://localhost:4000/webhook",
  "headers": {
    "X-Custom-Header": "value"
  }
}
```

**Body (legacy format - still supported):**
```json
{
  "url": "http://localhost:4000/webhook"
}
```

The new format supports per-gateway configuration with query parameters and custom headers. The `url` field should contain the final URL (with query params), while `urlBase` is optional and stores just the base URL.

### POST `/api/simulate`
Trigger a webhook simulation.

**Body:**
```json
{
  "gateway": "stripe",
  "event": "payment_intent.succeeded",
  "webhookUrl": "http://localhost:4000/webhook?token=abc",
  "extraHeaders": {
    "X-Custom-Header": "value"
  },
  "payloadOverride": { ... }
}
```

- `gateway` and `event` are required
- `webhookUrl` is optional (uses server-stored config if not provided)
- `extraHeaders` is optional (uses server-stored config if not provided)
- `payloadOverride` is optional (if provided, sends this payload instead of loading from file)

### GET `/api/config/webhook?gateway=stripe`
Get webhook configuration for a specific gateway.

**Response:**
```json
{
  "gateway": "stripe",
  "url": "http://localhost:4000/webhook?token=abc",
  "headers": {
    "X-Custom-Header": "value"
  }
}
```

### GET `/api/logs`
Get webhook send logs.

**Response:**
```json
{
  "logs": [
    {
      "gateway": "stripe",
      "event": "payment_intent.succeeded",
      "timestamp": "2024-01-15T10:30:00Z",
      "httpStatus": 200,
      "ok": true
    }
  ]
}
```

### GET `/api/meta`
Get supported gateways and their events.

**Response:**
```json
{
  "gateways": {
    "stripe": {
      "events": [
        "charge.dispute.closed",
        "charge.dispute.created",
        "charge.dispute.funds_reinstated",
        "charge.dispute.funds_withdrawn",
        "charge.failed",
        "charge.refund.updated",
        "charge.refunded",
        "charge.succeeded",
        "checkout.session.async_payment_failed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.completed",
        "checkout.session.expired",
        "customer.subscription.created",
        "customer.subscription.deleted",
        "customer.subscription.paused",
        "customer.subscription.resumed",
        "customer.subscription.trial_will_end",
        "customer.subscription.updated",
        "invoice.created",
        "invoice.finalization_failed",
        "invoice.finalized",
        "invoice.marked_uncollectible",
        "invoice.paid",
        "invoice.payment_action_required",
        "invoice.payment_failed",
        "invoice.sent",
        "invoice.upcoming",
        "invoice.updated",
        "invoice.voided",
        "payment_intent.canceled",
        "payment_intent.payment_failed",
        "payment_intent.succeeded",
        "payment_method.attached",
        "subscription_item.created",
        "subscription_item.deleted",
        "subscription_item.updated",
        "subscription_schedule.aborted",
        "subscription_schedule.canceled",
        "subscription_schedule.completed",
        "subscription_schedule.created",
        "subscription_schedule.expiring",
        "subscription_schedule.released",
        "subscription_schedule.updated"
      ]
    },
    "abacatepay": {
      "events": ["billing.paid.pix.qrcode", "billing.paid.pix.billing", "withdraw.done", "withdraw.failed"]
    }
  }
}
```

## Development

### Type Checking
```bash
npm run type-check
```

### Building
```bash
npm run build
```

## Contribuindo

Quer adicionar um novo gateway de pagamento ou atualizar um existente? Consulte o [guia de contribuição](CONTRIBUTING.md) para instruções detalhadas sobre:

- Como adicionar um novo gateway de pagamento
- Como atualizar um gateway existente (adicionar eventos, headers, etc.)
- Arquitetura do projeto e padrões de código
- Dicas de debug e troubleshooting

## Architecture Notes

- **Core is gateway-agnostic**: Only understands `payment.succeeded` canonical event
- **Adapters handle gateway specifics**: Event names, headers, payload file paths
- **No business logic**: Payloads are raw JSON files, sent without modification
- **In-memory state**: Webhook URL and logs reset on server restart
- **Extension points**: Clear separation allows adding new gateways/events without touching core

## License

MIT

