#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
node scripts/local/oidc-local.mjs init-secrets
node scripts/local/oidc-local.mjs init-database
node scripts/local/oidc-local.mjs render-realm
node scripts/local/oidc-local.mjs write-frontend-env
node scripts/local/oidc-local.mjs migrate-seed
echo "Database and frontend env are ready. Start Keycloak, then run scripts/local/start.sh"
