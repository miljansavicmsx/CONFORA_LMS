#!/usr/bin/env bash
# Starts PostgreSQL (if a local cluster is installed), Keycloak, the API, and the Vite frontend.
# Secrets stay in the environment of the child processes and are not printed.
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p logs
if [[ ! -f .secrets/local.env ]]; then
  echo "Run scripts/local/setup.sh first." >&2
  exit 1
fi
preset_idle="${OIDC_SESSION_IDLE_SECONDS:-}"
set -a
# shellcheck disable=SC1091
source .secrets/local.env
set +a
if [[ -n "${preset_idle}" ]]; then
  export OIDC_SESSION_IDLE_SECONDS="${preset_idle}"
fi
export KC_BOOTSTRAP_ADMIN_USERNAME="${KEYCLOAK_ADMIN_USERNAME}"
export KC_BOOTSTRAP_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD}"
export KC_HOSTNAME=localhost
export KC_HOSTNAME_PORT=18080
export KC_HOSTNAME_STRICT=false
export KC_HTTP_ENABLED=true

if command -v pg_isready >/dev/null 2>&1; then
  if ! pg_isready -h 127.0.0.1 -p "${POSTGRES_PORT}" -q; then
    if command -v pg_ctlcluster >/dev/null 2>&1; then
      sudo pg_ctlcluster 16 main start || true
    fi
  fi
fi

if [[ -z "${KEYCLOAK_HOME:-}" ]]; then
  if [[ -x .tools/keycloak/bin/kc.sh ]]; then
    KEYCLOAK_HOME=".tools/keycloak"
  else
    echo "Set KEYCLOAK_HOME to a Keycloak 26 installation, or use infra/docker/docker-compose.local.yml." >&2
    exit 1
  fi
fi

if ! curl -sf -o /dev/null "http://localhost:18080/realms/master"; then
  nohup "${KEYCLOAK_HOME}/bin/kc.sh" start-dev --http-port=18080 \
    >logs/keycloak.log 2>&1 &
  echo $! >logs/keycloak.pid
  for _ in $(seq 1 60); do
    if curl -sf -o /dev/null "http://localhost:18080/realms/master"; then
      break
    fi
    sleep 2
  done
fi

node scripts/local/oidc-local.mjs import-realm
node scripts/local/oidc-local.mjs provision-users
node scripts/local/oidc-local.mjs configure-amr

if [[ ! -f logs/api.pid ]] || ! kill -0 "$(cat logs/api.pid)" 2>/dev/null; then
  pnpm exec turbo build --filter=@confora/api^...
  nohup pnpm --filter @confora/api exec nest start >logs/api.log 2>&1 &
  echo $! >logs/api.pid
fi
if [[ ! -f logs/frontend.pid ]] || ! kill -0 "$(cat logs/frontend.pid)" 2>/dev/null; then
  nohup pnpm --filter confora-frontend-app exec vite --host localhost --port 3001 >logs/frontend.log 2>&1 &
  echo $! >logs/frontend.pid
fi
echo "API and frontend are starting. Logs are in logs/."
