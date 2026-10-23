#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
for name in frontend api keycloak; do
  if [[ -f "logs/${name}.pid" ]]; then
    pid="$(cat "logs/${name}.pid")"
    if kill -0 "${pid}" 2>/dev/null; then
      kill "${pid}" || true
    fi
    rm -f "logs/${name}.pid"
  fi
done
echo "Stopped Keycloak, API, and frontend processes started by start.sh."
