#!/usr/bin/env bash
set -euo pipefail

VERSION="${PAYMENT_SIMULATOR_VERSION:-1.0.0}"
APP_DIR="${PAYMENT_SIMULATOR_DIR:-$HOME/.payment-simulator}"
UI_PORT="${UI_PORT:-4001}"
COMPOSE_URL="${PAYMENT_SIMULATOR_COMPOSE_URL:-https://paymentsimulator.com/docker-compose.yml}"

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing dependency: $1" >&2
    exit 1
  }
}

need curl
need docker

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    echo "Missing dependency: docker compose" >&2
    exit 1
  fi
}

mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Download distributable docker-compose.yml (image-based)
curl -fsSL "$COMPOSE_URL" -o docker-compose.yml

if [[ ! -f .env ]]; then
  printf "UI_PORT=%s\n" "$UI_PORT" > .env
fi

compose up -d >/dev/null

# Optional: wait until UI responds (keeps output clean; only final lines are printed)
for _ in {1..60}; do
  if curl -fsS "http://localhost:${UI_PORT}/api/meta" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "✓ Starting Payment Simulator v${VERSION}"
echo "→ Dashboard: http://localhost:${UI_PORT}"


