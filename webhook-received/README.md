# Webhook Receiver

Um servidor HTTP simples para receber e logar webhooks, útil para testar o Payment Gateway Webhook Simulator.

## Funcionalidades

- Recebe webhooks via `POST /webhook`
- Loga headers e body (raw) no console
- Sempre retorna `200 OK`
- Health check em `GET /health`

## Instalação

```bash
npm install
```

## Como rodar

```bash
npm run dev
```

O servidor iniciará na porta **4002** por padrão.

Para usar outra porta, defina a variável de ambiente `PORT`:

```bash
PORT=3000 npm run dev
```

## Endpoints

### POST /webhook

Recebe qualquer webhook e loga todas as informações.

**Resposta:**
```json
{
  "ok": true
}
```

### GET /health

Health check endpoint.

**Resposta:**
```json
{
  "ok": true
}
```

## Como usar com o Simulador

1. Inicie este receiver:
   ```bash
   cd webhook-received
   npm run dev
   ```

2. No simulador (rodando em `http://localhost:4001`), configure a Webhook URL como:
   ```
   http://localhost:4002/webhook
   ```

3. Dispare qualquer evento do simulador. Você verá os logs no console do receiver mostrando:
   - Timestamp
   - Method e Path
   - Headers completos
   - Body (raw JSON)

## Exemplo de Log

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

## Build para Produção

```bash
npm run build
npm start
```

## Notas

- Logs são apenas no `stdout` (console) - sem persistência
- Não valida assinaturas de webhook - apenas recebe e loga
- Aceita qualquer content-type

