# VPS deploy (Traefik)

Production deploy for a Docker host running **Traefik** as reverse proxy on an
external `traefik-public` network with a Let's Encrypt resolver named `le`
(HTTP-01 challenge). Currently deployed on `contabo-vps-iaxp`.

## Layout

| Host | Service | Notes |
|------|---------|-------|
| `app.paymentsimulator.com` | `ui` | Next.js simulator, image `ghcr.io/oismaelash/payment-simulator-ui:latest`, SQLite in the `payment_simulator_data` volume |
| `paymentsimulator.com` | `landing` | Vite SPA built here and served by nginx; also serves `/install` (→ `install.sh`) and `/docker-compose.yml` |
| `www.paymentsimulator.com` | `landing` | 301 redirect to the apex |

## Deploy

From the repo root, with the `traefik-public` network already present:

```bash
docker compose -f deploy/vps/docker-compose.yml up -d --build
```

- `ui` is built from source (`Dockerfile.ui`) so the demo banner is included.
- `landing` is built from source via `Dockerfile.landing` (context = repo root).

Set `DEMO_MODE=true` to show a "demo instance — run locally to reach your own
localhost" banner on the hosted `ui` (default off for local/self-host):

```bash
DEMO_MODE=true docker compose -f deploy/vps/docker-compose.yml up -d --build
```

## DNS / TLS

Point each host (A or CNAME) at the server IP, **DNS-only** (no Cloudflare
proxy) so the `le` HTTP-01 challenge succeeds. Traefik issues certs on the
first request.

> Gotcha: if the stack comes up **before** DNS resolves, ACME fails with
> NXDOMAIN and Traefik backs off — it will not auto-retry. After DNS is live,
> re-trigger issuance with `docker compose ... up -d --force-recreate landing`.

## Rebuild the landing image

```bash
docker compose -f deploy/vps/docker-compose.yml build landing
docker compose -f deploy/vps/docker-compose.yml up -d landing
```
