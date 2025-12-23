# Guia de Contribuição

Este guia explica como adicionar um novo gateway de pagamento ou atualizar um gateway existente no Payment Gateway Webhook Simulator.

## Visão Geral da Arquitetura

O projeto segue uma arquitetura modular com separação clara de responsabilidades:

- **Core (`packages/core`)**: Define o contrato `GatewayAdapter` e a função `simulate()` que envia webhooks. O core é gateway-agnóstico e entende apenas o evento canônico `payment.succeeded`.

- **Gateways (`packages/gateways/*`)**: Cada gateway implementa um adapter que:
  - Lista os eventos suportados
  - Mapeia eventos para arquivos de payload
  - Fornece headers padrão
  - Opcionalmente define o método HTTP (`GET` ou `POST`)

- **UI (`packages/ui`)**: Mantém um registry de adapters em `packages/ui/src/gateways.ts` e fornece uma interface web para configurar e simular webhooks.

### Contrato GatewayAdapter

Todo gateway deve implementar a interface `GatewayAdapter`:

```typescript
interface GatewayAdapter {
  getSupportedEvents(): string[];
  getEventDefinition(event: string): {
    canonicalEvent: CanonicalEvent;
    payloadFile: string;  // Caminho absoluto para o arquivo JSON
    headers: Record<string, string>;
    method?: "GET" | "POST";  // Opcional, padrão é "POST"
  } | null;
}
```

## Checklist Rápido: Adicionar Novo Gateway

- [ ] Criar estrutura de diretórios em `packages/gateways/<gateway>/`
- [ ] Criar `events.ts` implementando `GatewayAdapter`
- [ ] Criar `headers.json` com headers padrão
- [ ] Criar `index.ts` exportando o adapter
- [ ] Criar `package.json` com dependências e scripts
- [ ] Criar `tsconfig.json` estendendo o config raiz
- [ ] Adicionar arquivos de payload em `payloads/`
- [ ] Registrar o adapter em `packages/ui/src/gateways.ts`
- [ ] Atualizar scripts `dev` e `build` no `package.json` raiz
- [ ] (Opcional) Atualizar documentação no `README.md`

## Adicionar um Novo Gateway

### Passo 1: Criar Estrutura de Diretórios

Crie a seguinte estrutura em `packages/gateways/<gateway>/`:

```
packages/gateways/<gateway>/
├── events.ts          # Implementação do adapter
├── headers.json       # Headers padrão do gateway
├── index.ts          # Exporta o adapter
├── package.json      # Configuração do pacote
├── tsconfig.json     # Configuração TypeScript
└── payloads/         # Arquivos JSON de payload
    └── <event>.json
```

**Exemplo**: Para adicionar um gateway chamado "paypal":

```bash
mkdir -p packages/gateways/paypal/payloads
```

### Passo 2: Criar `package.json`

Crie um `package.json` seguindo o padrão dos outros gateways:

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

**Importante**: O nome do pacote deve seguir o padrão `@payment-simulator/gateway-<nome>`.

### Passo 3: Criar `tsconfig.json`

Crie um `tsconfig.json` que estende a configuração raiz:

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

### Passo 4: Criar `headers.json`

Crie um arquivo `headers.json` com os headers padrão que serão enviados com todos os webhooks deste gateway:

```json
{
  "X-PayPal-Webhook-Id": "WH-2W4267756J0023456",
  "X-PayPal-Webhook-Event-Type": "PAYMENT.CAPTURE.COMPLETED"
}
```

**Nota**: Se o gateway não requer headers específicos, use um objeto vazio `{}`.

### Passo 5: Implementar o Adapter (`events.ts`)

Existem dois padrões principais para implementar o adapter:

#### Padrão 1: Eventos Dinâmicos (Recomendado)

Este padrão lê automaticamente os arquivos `.json` do diretório `payloads/` e usa o nome do arquivo (sem extensão) como nome do evento. É usado por Stripe, Asaas, Pagar.me e Mercado Pago.

**Exemplo** (`packages/gateways/paypal/events.ts`):

```typescript
import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import type { GatewayAdapter } from "@payment-simulator/core";
import { CANONICAL_EVENT } from "@payment-simulator/core";

function getRepoRoot(): string {
  // Quando executado via npm workspaces, INIT_CWD aponta para o diretório raiz do repo.
  // Fallback para execução local.
  return process.env.INIT_CWD ?? resolve(process.cwd(), "../..");
}

function getPayPalPayloadsDir(): string {
  return resolve(getRepoRoot(), "packages/gateways/paypal/payloads");
}

/**
 * PayPal gateway adapter
 * Suporta qualquer evento que tenha um arquivo JSON correspondente em:
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
      // Se headers.json não existir ainda, usa objeto vazio
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

#### Padrão 2: Mapeamento Explícito

Use este padrão quando os nomes dos eventos não correspondem diretamente aos nomes dos arquivos. É usado por AbacatePay.

**Exemplo** (`packages/gateways/abacatepay/events.ts`):

```typescript
import { readFileSync } from "fs";
import { resolve } from "path";
import type { GatewayAdapter } from "@payment-simulator/core";
import { CANONICAL_EVENT } from "@payment-simulator/core";

function getRepoRoot(): string {
  return process.env.INIT_CWD ?? resolve(process.cwd(), "../..");
}

export class AbacatePayAdapter implements GatewayAdapter {
  private readonly supportedEvents = [
    "billing.paid.pix.qrcode",
    "billing.paid.pix.billing",
    "withdraw.done",
    "withdraw.failed",
  ];

  private headers: Record<string, string> = {};

  constructor() {
    this.loadHeaders();
  }

  private loadHeaders(): void {
    try {
      const headersPath = resolve(
        getRepoRoot(),
        "packages/gateways/abacatepay/headers.json"
      );
      const headersContent = readFileSync(headersPath, "utf-8");
      this.headers = JSON.parse(headersContent);
    } catch (error) {
      this.headers = {};
    }
  }

  getSupportedEvents(): string[] {
    return this.supportedEvents;
  }

  getEventDefinition(event: string) {
    if (!this.supportedEvents.includes(event)) {
      return null;
    }

    // Mapeia nomes de eventos para nomes de arquivos
    const payloadFileMap: Record<string, string> = {
      "billing.paid.pix.qrcode": "billing.paid.pix.qrcode.json",
      "billing.paid.pix.billing": "billing.paid.pix.billing.json",
      "withdraw.done": "withdraw.done.json",
      "withdraw.failed": "withdraw.failed.json",
    };

    const payloadFileName = payloadFileMap[event];
    if (!payloadFileName) {
      return null;
    }

    const payloadFile = resolve(
      getRepoRoot(),
      "packages/gateways/abacatepay/payloads",
      payloadFileName
    );

    return {
      canonicalEvent: CANONICAL_EVENT,
      payloadFile,
      headers: { ...this.headers },
    };
  }
}
```

#### Suporte a Métodos GET e POST

Por padrão, todos os webhooks são enviados como `POST` com JSON no body. Se o gateway usar IPN (Instant Payment Notification) ou redirecionamentos que requerem `GET`, você pode especificar o método:

**Exemplo** (Mercado Pago usa `GET` para eventos IPN):

```typescript
getEventDefinition(event: string) {
  const payloadFile = resolve(
    getMercadoPagoPayloadsDir(),
    `${event}.json`
  );
  if (!existsSync(payloadFile)) return null;

  // Eventos IPN usam GET com querystring
  // Outros eventos usam POST com JSON body
  const method: "GET" | "POST" = event.startsWith("ipn.") ? "GET" : "POST";

  return {
    canonicalEvent: CANONICAL_EVENT,
    payloadFile,
    headers: { ...this.headers },
    method,
  };
}
```

**Nota**: Quando `method: "GET"` é especificado, o payload JSON é convertido automaticamente em query string na URL.

### Passo 6: Criar `index.ts`

Crie um arquivo `index.ts` que exporta o adapter:

```typescript
export * from "./events";
```

### Passo 7: Adicionar Arquivos de Payload

Adicione arquivos JSON no diretório `payloads/` com os payloads reais do gateway. O nome do arquivo deve corresponder ao nome do evento (sem extensão `.json`).

**Exemplo**: Para o evento `payment.capture.completed`, crie `packages/gateways/paypal/payloads/payment.capture.completed.json`:

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

**Importante**: Os payloads são enviados exatamente como estão (sem modificação ou validação).

### Passo 8: Registrar o Gateway na UI

Edite `packages/ui/src/gateways.ts` e adicione o import e registro do novo adapter:

```typescript
import { StripeAdapter } from "@payment-simulator/gateway-stripe";
import { AbacatePayAdapter } from "@payment-simulator/gateway-abacatepay";
import { AsaasAdapter } from "@payment-simulator/gateway-asaas";
import { MercadoPagoAdapter } from "@payment-simulator/gateway-mercadopago";
import { PagarmeAdapter } from "@payment-simulator/gateway-pagarme";
import { PayPalAdapter } from "@payment-simulator/gateway-paypal"; // Novo
import type { GatewayAdapter } from "@payment-simulator/core";

export const gatewayAdapters: Record<string, GatewayAdapter> = {
  stripe: new StripeAdapter(),
  abacatepay: new AbacatePayAdapter(),
  asaas: new AsaasAdapter(),
  mercadopago: new MercadoPagoAdapter(),
  pagarme: new PagarmeAdapter(),
  paypal: new PayPalAdapter(), // Novo
};
```

**Importante**: A chave no objeto `gatewayAdapters` será usada como identificador do gateway na UI e nas APIs.

### Passo 9: Atualizar Scripts de Build

Edite o `package.json` na raiz do projeto e adicione o novo gateway aos scripts `dev` e `build`:

```json
{
  "scripts": {
    "dev": "npm run build --workspace=@payment-simulator/core && npm run build --workspace=@payment-simulator/gateway-stripe && npm run build --workspace=@payment-simulator/gateway-abacatepay && npm run build --workspace=@payment-simulator/gateway-asaas && npm run build --workspace=@payment-simulator/gateway-mercadopago && npm run build --workspace=@payment-simulator/gateway-pagarme && npm run build --workspace=@payment-simulator/gateway-paypal && npm run dev --workspace=@payment-simulator/ui",
    "build": "npm run build --workspace=@payment-simulator/core && npm run build --workspace=@payment-simulator/gateway-stripe && npm run build --workspace=@payment-simulator/gateway-abacatepay && npm run build --workspace=@payment-simulator/gateway-asaas && npm run build --workspace=@payment-simulator/gateway-mercadopago && npm run build --workspace=@payment-simulator/gateway-pagarme && npm run build --workspace=@payment-simulator/gateway-paypal && npm run build --workspace=@payment-simulator/ui"
  }
}
```

### Passo 10: Testar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Buildar o projeto**:
   ```bash
   npm run build
   ```

3. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Verificar na UI**:
   - Acesse `http://localhost:3000`
   - O novo gateway deve aparecer na lista de gateways
   - Os eventos devem aparecer na lista de eventos do gateway

5. **Verificar via API**:
   - Acesse `http://localhost:3000/api/meta`
   - O novo gateway e seus eventos devem aparecer na resposta JSON

### Passo 11: (Opcional) Atualizar Documentação

Se você adicionou um gateway público conhecido, considere atualizar a seção "Supported Gateways" no `README.md` para documentar os eventos suportados.

## Atualizar um Gateway Existente

### Adicionar Novos Eventos

#### Para Gateways com Eventos Dinâmicos

Simplesmente adicione um novo arquivo JSON em `packages/gateways/<gateway>/payloads/`:

```bash
# Exemplo: adicionar evento payment.refunded para Stripe
touch packages/gateways/stripe/payloads/payment.refunded.json
```

Edite o arquivo com o payload real do evento. O evento será automaticamente detectado na próxima vez que o servidor iniciar.

#### Para Gateways com Mapeamento Explícito

1. Adicione o arquivo de payload em `payloads/`
2. Adicione o nome do evento ao array `supportedEvents` em `events.ts`
3. Adicione o mapeamento no objeto `payloadFileMap` em `getEventDefinition()`

**Exemplo** (adicionar evento `billing.refunded` ao AbacatePay):

```typescript
// 1. Adicionar ao array de eventos suportados
private readonly supportedEvents = [
  "billing.paid.pix.qrcode",
  "billing.paid.pix.billing",
  "withdraw.done",
  "withdraw.failed",
  "billing.refunded", // Novo
];

// 2. Adicionar ao mapeamento
getEventDefinition(event: string) {
  // ...
  const payloadFileMap: Record<string, string> = {
    "billing.paid.pix.qrcode": "billing.paid.pix.qrcode.json",
    "billing.paid.pix.billing": "billing.paid.pix.billing.json",
    "withdraw.done": "withdraw.done.json",
    "withdraw.failed": "withdraw.failed.json",
    "billing.refunded": "billing.refunded.json", // Novo
  };
  // ...
}
```

### Atualizar Headers

Edite o arquivo `headers.json` do gateway:

```json
{
  "X-Custom-Header": "novo-valor",
  "X-Outro-Header": "outro-valor"
}
```

Os headers são recarregados quando o adapter é instanciado (a cada inicialização do servidor).

### Alterar Método HTTP (GET/POST)

Edite o método `getEventDefinition()` em `events.ts` para retornar `method: "GET"` ou `method: "POST"` conforme necessário:

```typescript
getEventDefinition(event: string) {
  // ...
  return {
    canonicalEvent: CANONICAL_EVENT,
    payloadFile,
    headers: { ...this.headers },
    method: "GET", // ou "POST"
  };
}
```

### Dicas de Debug

1. **Verificar eventos suportados**:
   - Acesse `http://localhost:3000/api/meta` para ver todos os gateways e eventos
   - Ou verifique diretamente no código chamando `adapter.getSupportedEvents()`

2. **Testar envio de webhook**:
   - Use a UI em `http://localhost:3000`
   - Configure a URL do webhook
   - Selecione o gateway e evento
   - Clique em "Send Webhook"
   - Verifique os logs na seção "Logs"

3. **Verificar logs**:
   - Os logs mostram gateway, evento, timestamp, status HTTP e sucesso/falha
   - Clique em "Refresh" para atualizar os logs

4. **Verificar build**:
   - Execute `npm run build` e verifique se não há erros de TypeScript
   - Execute `npm run type-check` para verificar tipos sem buildar

5. **Verificar caminhos de arquivos**:
   - Certifique-se de que `getRepoRoot()` está retornando o caminho correto
   - Use caminhos absolutos para `payloadFile` usando `resolve()`

## Estrutura de Arquivos de Referência

Para referência, aqui está a estrutura completa de um gateway existente (Stripe):

```
packages/gateways/stripe/
├── events.ts                    # Implementação do adapter
├── headers.json                 # Headers padrão
├── index.ts                     # Exporta o adapter
├── package.json                 # Configuração do pacote
├── tsconfig.json                # Configuração TypeScript
└── payloads/                    # Arquivos de payload
    ├── charge.succeeded.json
    ├── payment_intent.succeeded.json
    └── ... (outros eventos)
```

## Perguntas Frequentes

**P: Posso modificar os payloads antes de enviá-los?**  
R: Não. Os payloads são enviados exatamente como estão nos arquivos JSON, sem modificação. Se você precisar de modificações dinâmicas, considere usar a funcionalidade `payloadOverride` na API.

**P: Como adiciono validação de assinatura de webhook?**  
R: Os headers de assinatura devem ser configurados em `headers.json` ou via UI. O simulador não valida assinaturas - ele apenas as envia como parte do webhook.

**P: Posso adicionar múltiplos gateways ao mesmo tempo?**  
R: Sim, desde que cada um tenha um nome único e siga a estrutura descrita neste guia.

**P: O que acontece se eu esquecer de atualizar os scripts de build?**  
R: O novo gateway não será buildado automaticamente, mas você pode buildá-lo manualmente com `npm run build --workspace=@payment-simulator/gateway-<nome>`.

**P: Posso usar nomes de eventos com caracteres especiais?**  
R: Sim, mas evite caracteres que possam causar problemas em nomes de arquivos (como `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`). Use pontos (`.`) ou hífens (`-`) como separadores.

## Próximos Passos

Após adicionar ou atualizar um gateway:

1. Teste todos os eventos suportados
2. Verifique se os headers estão corretos
3. Confirme que os payloads são válidos JSON
4. Atualize a documentação se necessário
5. Considere adicionar testes (se o projeto tiver suporte a testes no futuro)

---

Se você tiver dúvidas ou encontrar problemas, abra uma issue no repositório do projeto.

