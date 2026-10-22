$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..\..'))
node scripts/local/oidc-local.mjs init-secrets
node scripts/local/oidc-local.mjs render-realm
node scripts/local/oidc-local.mjs write-frontend-env
Write-Host 'On Windows, start PostgreSQL and Keycloak with:'
Write-Host 'docker compose --env-file .secrets/local.env -f infra/docker/docker-compose.local.yml up -d'
Write-Host 'Then: node scripts/local/oidc-local.mjs migrate-seed'
Write-Host 'Then: node scripts/local/oidc-local.mjs import-realm; provision-users; configure-amr'
